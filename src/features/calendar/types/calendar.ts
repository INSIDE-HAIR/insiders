/**
 * Tipos fundamentales para trabajar con Google Calendar API
 * Define la estructura básica de calendarios y eventos
 */

/**
 * Tipos de visibilidad de eventos
 */
export enum EventVisibility {
  DEFAULT = "default",
  PUBLIC = "public", 
  PRIVATE = "private",
  CONFIDENTIAL = "confidential"
}

/**
 * Tipos de transparencia de eventos
 */
export enum EventTransparency {
  OPAQUE = "opaque",
  TRANSPARENT = "transparent"
}

/**
 * Estados de respuesta de invitados
 */
export enum AttendeeResponseStatus {
  NEEDS_ACTION = "needsAction",
  DECLINED = "declined", 
  TENTATIVE = "tentative",
  ACCEPTED = "accepted"
}

/**
 * Métodos de recordatorio
 */
export enum ReminderMethod {
  EMAIL = "email",
  POPUP = "popup"
}

/**
 * Frecuencias de recurrencia
 */
export enum RecurrenceFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY", 
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY"
}

/**
 * Estructura de un calendario de Google Calendar
 */
export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  timeZone: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  accessRole: 'freeBusyReader' | 'reader' | 'writer' | 'owner';
  defaultReminders?: CalendarReminder[];
  primary?: boolean;
}

/**
 * Estructura de un invitado
 */
export interface EventAttendee {
  id?: string;
  email: string;
  displayName?: string;
  organizer?: boolean;
  self?: boolean;
  resource?: boolean;
  optional?: boolean;
  responseStatus: AttendeeResponseStatus;
  comment?: string;
  additionalGuests?: number;
}

/**
 * Estructura de un recordatorio
 */
export interface EventReminder {
  method: ReminderMethod;
  minutes: number;
}

/**
 * Estructura de recordatorios del calendario
 */
export interface CalendarReminder {
  method: ReminderMethod;
  minutes: number;
}

/**
 * Configuración de recurrencia
 */
export interface EventRecurrence {
  frequency: RecurrenceFrequency;
  interval?: number;
  count?: number;
  until?: string; // RFC3339 timestamp
  byDay?: string[]; // MO, TU, WE, TH, FR, SA, SU
  byMonthDay?: number[];
  byMonth?: number[];
  bySetPos?: number[];
  wkst?: string; // Week start day
}

/**
 * Fecha y hora de un evento
 */
export interface EventDateTime {
  date?: string; // YYYY-MM-DD for all-day events
  dateTime?: string; // RFC3339 timestamp
  timeZone?: string;
}

/**
 * Estructura completa de un evento de Google Calendar
 */
export interface GoogleCalendarEvent {
  id?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  created?: string;
  updated?: string;
  summary: string;
  description?: string;
  location?: string;
  colorId?: string;
  
  // Fechas y tiempo
  start: EventDateTime;
  end: EventDateTime;
  endTimeUnspecified?: boolean;
  
  // Recurrencia
  recurrence?: string[]; // RRULE strings
  recurringEventId?: string;
  originalStartTime?: EventDateTime;
  
  // Configuraciones
  transparency?: EventTransparency;
  visibility?: EventVisibility;
  iCalUID?: string;
  sequence?: number;
  
  // Invitados y organizador
  attendees?: EventAttendee[];
  attendeesOmitted?: boolean;
  organizer?: {
    id?: string;
    email: string;
    displayName?: string;
    self?: boolean;
  };
  creator?: {
    id?: string;
    email: string;
    displayName?: string;
    self?: boolean;
  };
  
  // Recordatorios
  reminders?: {
    useDefault: boolean;
    overrides?: EventReminder[];
  };
  
  // Configuraciones adicionales
  hangoutLink?: string;
  conferenceData?: {
    createRequest?: any;
    entryPoints?: any[];
    conferenceSolution?: any;
    conferenceId?: string;
    signature?: string;
    notes?: string;
  };
  
  // Archivos adjuntos
  attachments?: Array<{
    fileUrl: string;
    title?: string;
    mimeType?: string;
    iconLink?: string;
    fileId?: string;
  }>;
  
  // Estados
  guestsCanInviteOthers?: boolean;
  
  // Miembros de Google Meet (custom field)
  meetMembers?: {
    name: string;
    email: string;
    role: 'ROLE_UNSPECIFIED' | 'COHOST';
  }[];
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  privateCopy?: boolean;
  locked?: boolean;
  
  // Metadata
  source?: {
    url: string;
    title: string;
  };
  eventType?: 'default' | 'outOfOffice' | 'focusTime' | 'workingLocation';
}

/**
 * Estructura para crear/actualizar eventos (formulario)
 */
export interface CalendarEventForm {
  // Información básica
  summary: string;
  description?: string;
  location?: string;
  
  // Fecha y hora
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endDate: string; // YYYY-MM-DD  
  endTime?: string; // HH:MM
  allDay: boolean;
  timeZone: string;
  
  // Calendario destino
  calendarId: string;
  
  // Invitados
  attendees: Array<{
    email: string;
    displayName?: string;
    optional?: boolean;
  }>;
  
  // Recurrencia
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval: number;
    endDate?: string;
    count?: number;
    byWeekDay?: string[];
  };
  
  // Recordatorios
  reminders: EventReminder[];
  
  // Configuraciones adicionales
  visibility: EventVisibility;
  transparency: EventTransparency;
  guestsCanInviteOthers: boolean;
  guestsCanModify: boolean;
  guestsCanSeeOtherGuests: boolean;

  // Configuraciones avanzadas de Google Meet
  conferenceData?: {
    createRequest?: {
      requestId?: string;
      conferenceSolutionKey?: {
        type: 'hangoutsMeet';
      };
    };
  };

  // Propiedades extendidas para funcionalidades avanzadas
  extendedProperties?: {
    private?: {
      recording?: 'enabled' | 'disabled';
      transcription?: 'enabled' | 'disabled';
      gemini_notes?: 'enabled' | 'disabled';
      captions?: 'enabled' | 'disabled';
      caption_language?: string;
      translation_target?: string;
      auto_transcript?: string;
      meeting_series?: string;
      module_number?: string;
      course_type?: string;
      all_attendees_hosts?: 'true' | 'false';
      breakout_rooms?: 'enabled' | 'disabled';
      chat_enabled?: 'true' | 'false';
      screen_sharing?: 'all_participants' | 'hosts_only';
      recording_storage?: 'google_drive' | 'cloud_storage';
      transcript_language?: string;
      [key: string]: any;
    };
    shared?: {
      [key: string]: any;
    };
  };

  // Configuración especial para hacer todos los invitados co-organizadores
  allAttendeesHosts?: boolean;
}

/**
 * Respuesta de listado de eventos
 */
export interface CalendarEventsResponse {
  kind: string;
  etag: string;
  summary: string;
  description?: string;
  updated: string;
  timeZone: string;
  accessRole: string;
  defaultReminders: CalendarReminder[];
  nextPageToken?: string;
  nextSyncToken?: string;
  items: GoogleCalendarEvent[];
}

/**
 * Filtros para listado de eventos
 */
export interface EventListFilters {
  calendarId?: string;
  timeMin?: string; // RFC3339 timestamp
  timeMax?: string; // RFC3339 timestamp
  q?: string; // Search query
  maxResults?: number;
  orderBy?: 'startTime' | 'updated';
  pageToken?: string;
  showDeleted?: boolean;
  showHiddenInvitations?: boolean;
  singleEvents?: boolean;
  updatedMin?: string;
}

/**
 * Resultado de importación
 */
export interface ImportResult {
  totalEvents: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{
    eventIndex: number;
    eventTitle?: string;
    error: string;
  }>;
  importedEventIds: string[];
}

/**
 * Datos para importación JSON
 */
export interface CalendarImportData {
  calendarId?: string;
  defaultTimeZone?: string;
  events: Partial<CalendarEventForm>[];
}

/**
 * Estructura de datos CSV para importación
 */
export interface CsvEventData {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  allDay: string; // 'true' | 'false'
  timeZone?: string;
  attendeeEmails?: string; // Separated by ';'
  reminderMinutes?: string; // Separated by ';'
  visibility?: string;
  transparency?: string;
}