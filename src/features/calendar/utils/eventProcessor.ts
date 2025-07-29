/**
 * Event Processor Utilities
 * 
 * Utilidades para procesar y transformar eventos de diferentes formatos
 * al formato esperado por la API de Calendar
 */

import { CalendarEventForm, EventVisibility, EventTransparency, ReminderMethod } from '../types';

/**
 * Procesa eventos en el formato específico de IBMEU hacia CalendarEventForm
 */
export function processIBMEUEvents(jsonData: any): CalendarEventForm[] {
  if (!jsonData.events || !Array.isArray(jsonData.events)) {
    throw new Error('Invalid JSON format: events array is required');
  }

  const calendarId = jsonData.calendarId || 'primary';
  const defaultTimeZone = jsonData.defaultTimeZone || 'Europe/Madrid';

  return jsonData.events.map((eventData: any, index: number) => {
    try {
      return transformEventToForm(eventData, calendarId, defaultTimeZone);
    } catch (error) {
      throw new Error(`Error processing event ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}

/**
 * Transforma un evento individual al formato CalendarEventForm
 */
function transformEventToForm(
  eventData: any, 
  calendarId: string, 
  defaultTimeZone: string
): CalendarEventForm {
  // Validar campos requeridos
  if (!eventData.summary) {
    throw new Error('Event summary is required');
  }

  if (!eventData.startDate) {
    throw new Error('Event startDate is required');
  }

  if (!eventData.endDate) {
    throw new Error('Event endDate is required');
  }

  // Procesar invitados
  const attendees = (eventData.attendees || []).map((attendee: any) => ({
    email: attendee.email,
    displayName: attendee.displayName || attendee.email.split('@')[0],
    optional: attendee.optional || false
  }));

  // Procesar recordatorios
  const reminders = (eventData.reminders || []).map((reminder: any) => ({
    method: reminder.method as ReminderMethod,
    minutes: reminder.minutes
  }));

  // Determinar visibilidad
  let visibility = EventVisibility.DEFAULT;
  if (eventData.visibility) {
    const vis = eventData.visibility.toLowerCase();
    if (vis === 'public') visibility = EventVisibility.PUBLIC;
    else if (vis === 'private') visibility = EventVisibility.PRIVATE;
    else if (vis === 'confidential') visibility = EventVisibility.CONFIDENTIAL;
  }

  // Determinar transparencia
  let transparency = EventTransparency.OPAQUE;
  if (eventData.transparency?.toLowerCase() === 'transparent') {
    transparency = EventTransparency.TRANSPARENT;
  }

  // Configurar Google Meet con características avanzadas
  const conferenceData = eventData.conferenceData ? {
    createRequest: {
      requestId: eventData.conferenceData.createRequest?.requestId || `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conferenceSolutionKey: {
        type: 'hangoutsMeet' as const
      }
    }
  } : undefined;

  // Configurar propiedades extendidas para funcionalidades avanzadas
  const extendedProperties = eventData.extendedProperties || undefined;

  // Configurar todos los invitados como co-organizadores si está especificado
  const allAttendeesHosts = eventData.extendedProperties?.private?.all_attendees_hosts === 'true' || 
                           eventData.allAttendeesHosts === true;

  const formEvent: CalendarEventForm = {
    summary: eventData.summary,
    description: eventData.description || '',
    location: eventData.location || '',
    startDate: eventData.startDate,
    startTime: eventData.startTime,
    endDate: eventData.endDate,
    endTime: eventData.endTime,
    allDay: eventData.allDay || false,
    timeZone: eventData.timeZone || defaultTimeZone,
    calendarId,
    attendees,
    reminders,
    visibility,
    transparency,
    guestsCanInviteOthers: eventData.guestsCanInviteOthers !== false, // Default true
    guestsCanModify: eventData.guestsCanModify !== false, // Default true
    guestsCanSeeOtherGuests: eventData.guestsCanSeeOtherGuests !== false, // Default true
    conferenceData,
    extendedProperties,
    allAttendeesHosts
  };

  return formEvent;
}

/**
 * Valida que un evento tenga todos los campos requeridos
 */
export function validateEventData(eventData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!eventData.summary || typeof eventData.summary !== 'string') {
    errors.push('summary is required and must be a string');
  }

  if (!eventData.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventData.startDate)) {
    errors.push('startDate is required and must be in YYYY-MM-DD format');
  }

  if (!eventData.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventData.endDate)) {
    errors.push('endDate is required and must be in YYYY-MM-DD format');
  }

  if (eventData.startTime && !/^\d{2}:\d{2}$/.test(eventData.startTime)) {
    errors.push('startTime must be in HH:MM format');
  }

  if (eventData.endTime && !/^\d{2}:\d{2}$/.test(eventData.endTime)) {
    errors.push('endTime must be in HH:MM format');
  }

  if (eventData.attendees && !Array.isArray(eventData.attendees)) {
    errors.push('attendees must be an array');
  } else if (eventData.attendees) {
    eventData.attendees.forEach((attendee: any, index: number) => {
      if (!attendee.email || typeof attendee.email !== 'string') {
        errors.push(`attendee ${index + 1}: email is required and must be a string`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email)) {
        errors.push(`attendee ${index + 1}: email format is invalid`);
      }
    });
  }

  if (eventData.reminders && !Array.isArray(eventData.reminders)) {
    errors.push('reminders must be an array');
  } else if (eventData.reminders) {
    eventData.reminders.forEach((reminder: any, index: number) => {
      if (!reminder.method || !['email', 'popup'].includes(reminder.method)) {
        errors.push(`reminder ${index + 1}: method must be 'email' or 'popup'`);
      }
      
      if (typeof reminder.minutes !== 'number' || reminder.minutes < 0) {
        errors.push(`reminder ${index + 1}: minutes must be a non-negative number`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Genera un ID único para conferencias de Google Meet
 */
export function generateMeetRequestId(summary: string, moduleNumber?: string): string {
  const cleanSummary = summary
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  
  if (moduleNumber) {
    return `${cleanSummary}-mod${moduleNumber}-${timestamp}-${random}`;
  }
  
  return `${cleanSummary}-${timestamp}-${random}`;
}

/**
 * Construye la descripción mejorada del evento con información de Meet
 */
export function buildEnhancedDescription(
  originalDescription: string,
  meetConfig?: any
): string {
  let description = originalDescription || '';
  
  if (meetConfig) {
    const meetFeatures = [];
    
    if (meetConfig.recording === 'enabled') {
      meetFeatures.push('📹 Esta sesión será grabada automáticamente');
    }
    
    if (meetConfig.transcription === 'enabled') {
      meetFeatures.push('📝 Se generará transcripción automática');
      
      if (meetConfig.transcript_language === 'spanish') {
        meetFeatures.push('🇪🇸 Transcripción en español');
      }
    }
    
    if (meetConfig.gemini_notes === 'enabled') {
      meetFeatures.push('🤖 Notas automáticas con Gemini AI');
    }
    
    if (meetConfig.captions === 'enabled') {
      meetFeatures.push('💬 Subtítulos automáticos activados');
    }
    
    if (meetConfig.all_attendees_hosts === 'true') {
      meetFeatures.push('👥 Todos los participantes son co-organizadores');
    }
    
    if (meetFeatures.length > 0) {
      description += '\n\n' + meetFeatures.join('\n');
    }
    
    description += '\n\n⚙️ Configuración automática de Google Meet aplicada';
  }
  
  return description;
}

/**
 * Extrae información del módulo desde el título del evento
 */
export function extractModuleInfo(summary: string): { moduleNumber?: string; courseCode?: string } {
  const moduleMatch = summary.match(/Módulo\s+(\d+)/i);
  const courseMatch = summary.match(/([A-Z]+_[A-Z0-9]+)/);
  
  return {
    moduleNumber: moduleMatch ? moduleMatch[1] : undefined,
    courseCode: courseMatch ? courseMatch[1] : undefined
  };
}