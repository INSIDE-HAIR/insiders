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
  public auth: any; // Exponemos auth para que otros servicios lo puedan usar

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
      this.auth = auth; // Guardamos la referencia de auth
      this.calendar = google.calendar({ version: 'v3', auth });
      
      this.initialized = true;
      logger.info("Google Calendar service initialized successfully");
      
      // Log configuración por defecto
      if (process.env.NODE_ENV === 'development') {
        logger.info(`Default Calendar ID: ${this.getDefaultCalendarId()}`);
        logger.info(`Default Timezone: ${this.getDefaultTimezone()}`);
      }
    } catch (error) {
      logger.error("Failed to initialize Google Calendar service", error);
      throw new Error("Failed to initialize Google Calendar service");
    }
  }

  /**
   * Obtiene el calendar ID por defecto
   */
  public getDefaultCalendarId(): string {
    return this.authProvider.getDefaultCalendarId();
  }

  /**
   * Obtiene la timezone por defecto
   */
  public getDefaultTimezone(): string {
    return this.authProvider.getDefaultTimezone();
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
      // Use calendarId from eventData if provided, otherwise use the parameter or default
      const targetCalendarId = (eventData as any).calendarId || calendarId || DEFAULT_CALENDAR_ID;
      
      logger.info(`Creating event in calendar: ${targetCalendarId} (${isOrganizationCalendar(targetCalendarId) ? 'Organization Calendar' : 'External'})`);

      const googleEvent = this.formToGoogleEvent(eventData);
      
      const response = await this.calendar.events.insert({
        calendarId: targetCalendarId,
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
      logger.info(`Event data received:`, JSON.stringify(eventData, null, 2));

      // Obtener evento actual para merge
      const currentEvent = await this.getEvent(calendarId, eventId);
      logger.info(`Current event:`, JSON.stringify(currentEvent, null, 2));
      
      // Convertir datos del formulario
      const googleEvent = this.formToGoogleEvent(eventData as CalendarEventForm, currentEvent);
      logger.info(`Google event payload:`, JSON.stringify(googleEvent, null, 2));
      
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
      logger.error(`Error details:`, error.response?.data || error);
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
   * Mueve un evento de un calendario a otro
   * Usa la API move de Google Calendar para mantener el ID del evento
   * Si falla (ej: evento recurrente), usa copy-delete como fallback
   */
  public async moveEvent(
    sourceCalendarId: string,
    eventId: string,
    targetCalendarId: string
  ): Promise<GoogleCalendarEvent> {
    this.ensureInitialized();

    try {
      logger.info(`Moving event: ${eventId} from ${sourceCalendarId} to ${targetCalendarId}`);

      const response = await this.calendar.events.move({
        calendarId: sourceCalendarId,
        eventId: eventId,
        destination: targetCalendarId
      });

      logger.info(`Event moved successfully: ${eventId}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to move event ${eventId}`, error);
      
      // Check if this is a recurring event limitation
      if (error.message?.includes('Cannot change the organizer of an instance') ||
          error.message?.includes('recurring') ||
          error.message?.includes('instance')) {
        logger.info(`Move failed for recurring event ${eventId}, trying copy-delete fallback`);
        return await this.moveEventFallback(sourceCalendarId, eventId, targetCalendarId);
      }
      
      throw new Error(`Failed to move event: ${error.message}`);
    }
  }

  /**
   * Fallback method for moving events when the move API fails
   * Uses copy-delete approach for events that can't be moved directly
   */
  private async moveEventFallback(
    sourceCalendarId: string,
    eventId: string,
    targetCalendarId: string
  ): Promise<GoogleCalendarEvent> {
    this.ensureInitialized();

    try {
      logger.info(`Using copy-delete fallback for event: ${eventId}`);

      // First, get the event details from the source calendar
      const sourceEvent = await this.getEvent(sourceCalendarId, eventId);
      
      // Create a copy of the event in the target calendar
      const eventForm = this.googleEventToForm(sourceEvent, targetCalendarId);
      const newEvent = await this.createEvent(eventForm, targetCalendarId);

      if (!newEvent) {
        throw new Error("Failed to create event copy in target calendar");
      }

      // Delete the original event from the source calendar
      try {
        await this.deleteEvent(sourceCalendarId, eventId);
        logger.info(`Original event ${eventId} deleted from source calendar`);
      } catch (deleteError) {
        logger.warn(
          `Failed to delete original event ${eventId} after copying. You may have duplicates.`,
          deleteError
        );
      }

      logger.info(`Event successfully moved using copy-delete fallback: ${eventId} -> ${newEvent.id}`);
      return newEvent;
    } catch (error: any) {
      logger.error(`Copy-delete fallback failed for event ${eventId}`, error);
      throw new Error(`Failed to move event using fallback method: ${error.message}`);
    }
  }

  /**
   * Converts a Google Calendar event to form data for recreation
   */
  private googleEventToForm(event: GoogleCalendarEvent, targetCalendarId?: string): CalendarEventForm {
    return {
      summary: event.summary || '',
      description: event.description || '',
      location: event.location || '',
      startDate: event.start?.date || event.start?.dateTime?.split('T')[0] || '',
      startTime: event.start?.dateTime 
        ? event.start.dateTime.split('T')[1]?.substring(0, 5)
        : undefined,
      endDate: event.end?.date || event.end?.dateTime?.split('T')[0] || '',
      endTime: event.end?.dateTime 
        ? event.end.dateTime.split('T')[1]?.substring(0, 5)
        : undefined,
      allDay: !!event.start?.date,
      timeZone: event.start?.timeZone || 'Europe/Madrid',
      calendarId: targetCalendarId || DEFAULT_CALENDAR_ID, // Use target calendar or default
      attendees: event.attendees?.map(att => ({
        email: att.email || '',
        displayName: att.displayName,
        optional: att.optional || false
      })) || [],
      reminders: event.reminders?.overrides || [],
      visibility: (event.visibility as any) || 'default',
      transparency: (event.transparency as any) || 'opaque',
      guestsCanInviteOthers: event.guestsCanInviteOthers || false,
      guestsCanModify: event.guestsCanModify || false,
      guestsCanSeeOtherGuests: event.guestsCanSeeOtherGuests || true
    };
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
      if (!event) continue;
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
    const googleEvent: Partial<GoogleCalendarEvent> = {
      ...existingEvent, // Merge with existing event if updating
    };

    // Only update fields that are explicitly provided
    if (formData.summary !== undefined) {
      googleEvent.summary = formData.summary;
    }
    
    if (formData.description !== undefined) {
      googleEvent.description = formData.description;
    }
    
    if (formData.location !== undefined) {
      googleEvent.location = formData.location;
    }

    // Only update start/end times if date information is provided
    if (formData.startDate !== undefined) {
      googleEvent.start = this.createEventDateTime(
        formData.startDate,
        formData.startTime,
        formData.allDay,
        formData.timeZone
      );
    }

    if (formData.endDate !== undefined) {
      googleEvent.end = this.createEventDateTime(
        formData.endDate,
        formData.endTime,
        formData.allDay,
        formData.timeZone
      );
    }
    
    if (formData.visibility !== undefined) {
      googleEvent.visibility = formData.visibility;
    }
    
    if (formData.transparency !== undefined) {
      googleEvent.transparency = formData.transparency;
    }
    
    if (formData.guestsCanInviteOthers !== undefined) {
      googleEvent.guestsCanInviteOthers = formData.guestsCanInviteOthers;
    }
    
    if (formData.guestsCanModify !== undefined) {
      googleEvent.guestsCanModify = formData.guestsCanModify;
    }
    
    if (formData.guestsCanSeeOtherGuests !== undefined) {
      googleEvent.guestsCanSeeOtherGuests = formData.guestsCanSeeOtherGuests;
    };

    // Invitados con soporte para hosts (solo si se proporcionan attendees)
    if (formData.attendees !== undefined) {
      if (formData.attendees.length > 0) {
        googleEvent.attendees = formData.attendees.map(attendee => ({
          email: attendee.email,
          displayName: attendee.displayName,
          optional: attendee.optional || false,
          responseStatus: 'needsAction' as any,
          // Hacer que todos los invitados sean organizadores/hosts si está configurado
          organizer: (formData as any).allAttendeesHosts || false
        }));
      } else {
        googleEvent.attendees = [];
      }
    }

    // Recordatorios (solo si se proporcionan)
    if (formData.reminders !== undefined) {
      if (formData.reminders.length > 0) {
        googleEvent.reminders = {
          useDefault: false,
          overrides: formData.reminders
        };
      } else {
        googleEvent.reminders = {
          useDefault: true
        };
      }
    }

    // Recurrencia (solo si se proporciona)
    if (formData.recurrence !== undefined) {
      const rrule = this.buildRRule(formData.recurrence);
      googleEvent.recurrence = [rrule];
    }

    // Configuración de Google Meet con funciones avanzadas (solo si se proporciona)
    if ((formData as any).conferenceData !== undefined) {
      googleEvent.conferenceData = this.buildConferenceData(formData as any);
    }

    // Propiedades extendidas para características avanzadas (solo si se proporcionan)
    if ((formData as any).extendedProperties !== undefined) {
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