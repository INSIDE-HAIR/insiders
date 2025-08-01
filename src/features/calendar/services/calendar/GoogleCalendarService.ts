/**
 * GoogleCalendarService
 *
 * Servicio principal para interactuar con la API de Google Calendar
 * Proporciona métodos para CRUD de calendarios y eventos
 */

import { google } from "googleapis";
import { Logger } from "../../utils/logger";
import { GoogleCalendarAuthProvider } from "../auth/GoogleCalendarAuthProvider";
import {
  GoogleCalendar,
  GoogleCalendarEvent,
  CalendarEventsResponse,
  EventListFilters,
  CalendarEventForm,
  EventDateTime
} from "../../types";
import { 
  DEFAULT_CALENDAR_ID, 
  CALENDAR_CONFIG,
  getCalendarId,
  isOrganizationCalendar 
} from "../../constants/calendar.constants";

const logger = new Logger("GoogleCalendarService");

export class GoogleCalendarService {
  private calendar: any;
  private authProvider: GoogleCalendarAuthProvider;
  private initialized: boolean = false;

  constructor(authProvider?: GoogleCalendarAuthProvider) {
    this.authProvider = authProvider || new GoogleCalendarAuthProvider();
  }

  /**
   * Inicializa el servicio de Calendar
   */
  public async initialize(): Promise<void> {
    try {
      logger.info("Initializing Google Calendar service...");

      const auth = await this.authProvider.getOAuth2Client();
      this.calendar = google.calendar({ version: 'v3', auth });
      
      this.initialized = true;
      logger.info("Google Calendar service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Google Calendar service", error);
      throw new Error("Failed to initialize Google Calendar service");
    }
  }

  /**
   * Verifica que el servicio esté inicializado
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("GoogleCalendarService must be initialized before use");
    }
  }

  // ==================== CALENDARIOS ====================

  /**
   * Lista todos los calendarios disponibles
   */
  public async getCalendars(): Promise<GoogleCalendar[]> {
    this.ensureInitialized();

    try {
      logger.info("Fetching calendars list...");

      const response = await this.calendar.calendarList.list({
        maxResults: 250,
        showDeleted: false,
        showHidden: false
      });

      const calendars = response.data.items || [];
      logger.info(`Found ${calendars.length} calendars`);

      return calendars.map((cal: any) => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        location: cal.location,
        timeZone: cal.timeZone,
        colorId: cal.colorId,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
        selected: cal.selected,
        accessRole: cal.accessRole,
        defaultReminders: cal.defaultReminders || [],
        primary: cal.primary
      }));
    } catch (error: any) {
      logger.error("Failed to fetch calendars", error);
      throw new Error(`Failed to fetch calendars: ${error.message}`);
    }
  }

  /**
   * Obtiene detalles de un calendario específico
   */
  public async getCalendar(calendarId: string): Promise<GoogleCalendar> {
    this.ensureInitialized();

    try {
      logger.info(`Fetching calendar details for: ${calendarId}`);

      const response = await this.calendar.calendarList.get({
        calendarId
      });

      const cal = response.data;
      return {
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        location: cal.location,
        timeZone: cal.timeZone,
        colorId: cal.colorId,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
        selected: cal.selected,
        accessRole: cal.accessRole,
        defaultReminders: cal.defaultReminders || [],
        primary: cal.primary
      };
    } catch (error: any) {
      logger.error(`Failed to fetch calendar ${calendarId}`, error);
      throw new Error(`Failed to fetch calendar: ${error.message}`);
    }
  }

  // ==================== EVENTOS ====================

  /**
   * Lista eventos de un calendario con filtros
   * Si no se especifica calendarId, usa el calendario por defecto (academia@insidesalons.com)
   */
  public async getEvents(calendarId: string = DEFAULT_CALENDAR_ID, filters?: EventListFilters): Promise<CalendarEventsResponse> {
    this.ensureInitialized();

    try {
      logger.info(`Fetching events for calendar: ${calendarId}`);

      const params: any = {
        calendarId,
        maxResults: filters?.maxResults || 250,
        orderBy: filters?.orderBy || 'startTime',
        singleEvents: filters?.singleEvents !== false, // Default true
        showDeleted: filters?.showDeleted || false,
        showHiddenInvitations: filters?.showHiddenInvitations || false
      };

      // Agregar filtros opcionales
      if (filters?.timeMin) params.timeMin = filters.timeMin;
      if (filters?.timeMax) params.timeMax = filters.timeMax;
      if (filters?.q) params.q = filters.q;
      if (filters?.pageToken) params.pageToken = filters.pageToken;
      if (filters?.updatedMin) params.updatedMin = filters.updatedMin;

      const response = await this.calendar.events.list(params);
      
      logger.info(`Found ${response.data.items?.length || 0} events`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to fetch events for calendar ${calendarId}`, error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  /**
   * Obtiene un evento específico
   */
  public async getEvent(calendarId: string, eventId: string): Promise<GoogleCalendarEvent> {
    this.ensureInitialized();

    try {
      logger.info(`Fetching event: ${eventId} from calendar: ${calendarId}`);

      const response = await this.calendar.events.get({
        calendarId,
        eventId
      });

      return response.data;
    } catch (error: any) {
      logger.error(`Failed to fetch event ${eventId}`, error);
      throw new Error(`Failed to fetch event: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo evento
   * Si no se especifica calendarId, usa el calendario por defecto (academia@insidesalons.com)
   */
  public async createEvent(eventData: CalendarEventForm, calendarId: string = DEFAULT_CALENDAR_ID): Promise<GoogleCalendarEvent> {
    this.ensureInitialized();

    try {
      logger.info(`Creating event in calendar: ${calendarId} (${isOrganizationCalendar(calendarId) ? 'Organization Calendar' : 'External'})`);

      const googleEvent = this.formToGoogleEvent(eventData);
      
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: googleEvent,
        sendUpdates: 'all' // Send notifications to attendees
      });

      logger.info(`Event created successfully: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error("Failed to create event", error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  /**
   * Actualiza un evento existente
   */
  public async updateEvent(
    calendarId: string, 
    eventId: string, 
    eventData: Partial<CalendarEventForm>
  ): Promise<GoogleCalendarEvent> {
    this.ensureInitialized();

    try {
      logger.info(`Updating event: ${eventId} in calendar: ${calendarId}`);

      // Obtener evento actual para merge
      const currentEvent = await this.getEvent(calendarId, eventId);
      
      // Convertir datos del formulario
      const googleEvent = this.formToGoogleEvent(eventData as CalendarEventForm, currentEvent);
      
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: googleEvent,
        sendUpdates: 'all'
      });

      logger.info(`Event updated successfully: ${eventId}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to update event ${eventId}`, error);
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  /**
   * Elimina un evento
   */
  public async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    this.ensureInitialized();

    try {
      logger.info(`Deleting event: ${eventId} from calendar: ${calendarId}`);

      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all'
      });

      logger.info(`Event deleted successfully: ${eventId}`);
    } catch (error: any) {
      logger.error(`Failed to delete event ${eventId}`, error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  /**
   * Crea múltiples eventos (importación en batch)
   */
  public async createEventsInBatch(
    calendarId: string, 
    events: CalendarEventForm[]
  ): Promise<{ successful: GoogleCalendarEvent[]; failed: Array<{ event: CalendarEventForm; error: string }> }> {
    this.ensureInitialized();

    const successful: GoogleCalendarEvent[] = [];
    const failed: Array<{ event: CalendarEventForm; error: string }> = [];

    logger.info(`Creating ${events.length} events in batch for calendar: ${calendarId}`);

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      try {
        const createdEvent = await this.createEvent(event, calendarId);
        successful.push(createdEvent);
        logger.info(`Batch event ${i + 1}/${events.length} created successfully`);
      } catch (error: any) {
        failed.push({
          event,
          error: error.message
        });
        logger.error(`Batch event ${i + 1}/${events.length} failed`, error);
      }

      // Pequeña pausa para evitar rate limiting
      if (i < events.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    logger.info(`Batch creation completed: ${successful.length} successful, ${failed.length} failed`);
    return { successful, failed };
  }

  // ==================== UTILIDADES ====================

  /**
   * Convierte datos del formulario a formato de Google Calendar API
   */
  private formToGoogleEvent(
    formData: CalendarEventForm, 
    existingEvent?: GoogleCalendarEvent
  ): Partial<GoogleCalendarEvent> {
    const start = this.createEventDateTime(
      formData.startDate,
      formData.startTime,
      formData.allDay,
      formData.timeZone
    );

    const end = this.createEventDateTime(
      formData.endDate,
      formData.endTime,
      formData.allDay,
      formData.timeZone
    );

    const googleEvent: Partial<GoogleCalendarEvent> = {
      ...existingEvent, // Merge with existing event if updating
      summary: formData.summary,
      description: formData.description,
      location: formData.location,
      start,
      end,
      visibility: formData.visibility,
      transparency: formData.transparency,
      guestsCanInviteOthers: formData.guestsCanInviteOthers,
      guestsCanModify: formData.guestsCanModify,
      guestsCanSeeOtherGuests: formData.guestsCanSeeOtherGuests
    };

    // Invitados con soporte para hosts
    if (formData.attendees && formData.attendees.length > 0) {
      googleEvent.attendees = formData.attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.displayName,
        optional: attendee.optional || false,
        responseStatus: 'needsAction' as any,
        // Hacer que todos los invitados sean organizadores/hosts si está configurado
        organizer: (formData as any).allAttendeesHosts || false
      }));
    }

    // Recordatorios
    if (formData.reminders && formData.reminders.length > 0) {
      googleEvent.reminders = {
        useDefault: false,
        overrides: formData.reminders
      };
    } else {
      googleEvent.reminders = {
        useDefault: true
      };
    }

    // Recurrencia
    if (formData.recurrence) {
      const rrule = this.buildRRule(formData.recurrence);
      googleEvent.recurrence = [rrule];
    }

    // Configuración de Google Meet con funciones avanzadas
    if ((formData as any).conferenceData) {
      googleEvent.conferenceData = this.buildConferenceData(formData as any);
    }

    // Propiedades extendidas para características avanzadas
    if ((formData as any).extendedProperties) {
      (googleEvent as any).extendedProperties = (formData as any).extendedProperties;
    }

    return googleEvent;
  }

  /**
   * Construye la configuración de Google Meet con características avanzadas
   */
  private buildConferenceData(formData: any): any {
    const conferenceData: any = {
      createRequest: {
        requestId: formData.conferenceData?.createRequest?.requestId || `meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        },
        status: {
          statusCode: 'success'
        }
      }
    };

    // Configurar opciones avanzadas de Meet basadas en extendedProperties
    if (formData.extendedProperties?.private) {
      const meetConfig = formData.extendedProperties.private;
      
      // Estas configuraciones se envían como extended properties
      // ya que Google Calendar API no permite configuración directa
      // de todas las opciones de Meet a través de la API
      conferenceData.notes = this.buildMeetConfigurationNotes(meetConfig);
    }

    return conferenceData;
  }

  /**
   * Construye las notas de configuración para Google Meet
   */
  private buildMeetConfigurationNotes(meetConfig: any): string {
    const features = [];
    
    if (meetConfig.recording === 'enabled') {
      features.push('• Grabación automática activada');
    }
    
    if (meetConfig.transcription === 'enabled') {
      features.push('• Transcripción automática activada');
      
      if (meetConfig.transcript_language) {
        features.push(`• Idioma de transcripción: ${meetConfig.transcript_language}`);
      }
    }
    
    if (meetConfig.gemini_notes === 'enabled') {
      features.push('• Notas automáticas con Gemini AI activadas');
    }
    
    if (meetConfig.captions === 'enabled') {
      features.push('• Subtítulos automáticos activados');
      
      if (meetConfig.caption_language) {
        features.push(`• Idioma de subtítulos: ${meetConfig.caption_language}`);
      }
    }
    
    if (meetConfig.all_attendees_hosts === 'true') {
      features.push('• Todos los participantes son co-organizadores');
    }
    
    if (meetConfig.breakout_rooms === 'enabled') {
      features.push('• Salas de grupos disponibles');
    }
    
    if (meetConfig.screen_sharing === 'all_participants') {
      features.push('• Compartir pantalla habilitado para todos');
    }

    return `Configuración automática de Google Meet:\n\n${features.join('\n')}\n\nNota: Algunas configuraciones requieren ajustes manuales en Google Meet.`;
  }

  /**
   * Crea un objeto EventDateTime para Google Calendar
   */
  private createEventDateTime(
    date: string,
    time?: string,
    allDay?: boolean,
    timeZone?: string
  ): EventDateTime {
    if (allDay) {
      return {
        date: date // YYYY-MM-DD format
      };
    }

    const dateTimeString = time ? `${date}T${time}:00` : `${date}T00:00:00`;
    
    return {
      dateTime: dateTimeString,
      timeZone: timeZone || process.env.GOOGLE_CALENDAR_DEFAULT_TIMEZONE || 'Europe/Madrid'
    };
  }

  /**
   * Construye una regla RRULE para recurrencia
   */
  private buildRRule(recurrence: CalendarEventForm['recurrence']): string {
    if (!recurrence) return '';

    let rrule = `RRULE:FREQ=${recurrence.frequency}`;
    
    if (recurrence.interval && recurrence.interval > 1) {
      rrule += `;INTERVAL=${recurrence.interval}`;
    }

    if (recurrence.count) {
      rrule += `;COUNT=${recurrence.count}`;
    } else if (recurrence.endDate) {
      // Convertir fecha a formato YYYYMMDD
      const endDate = recurrence.endDate.replace(/-/g, '');
      rrule += `;UNTIL=${endDate}T235959Z`;
    }

    if (recurrence.byWeekDay && recurrence.byWeekDay.length > 0) {
      rrule += `;BYDAY=${recurrence.byWeekDay.join(',')}`;
    }

    return rrule;
  }

  /**
   * Verifica si el servicio tiene acceso a un calendario
   */
  public async hasCalendarAccess(calendarId: string): Promise<boolean> {
    try {
      await this.getCalendar(calendarId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el calendario primario del usuario
   */
  public async getPrimaryCalendar(): Promise<GoogleCalendar> {
    return this.getCalendar('primary');
  }
}