/**
 * Constantes de configuración para el módulo Calendar
 * 
 * Define los valores por defecto y calendarios específicos
 * para la integración con Google Calendar
 */

// ==================== CALENDARIOS DE LA ORGANIZACIÓN ====================
export const ORGANIZATION_CALENDARS = {
  // Calendario principal de formación/academia
  ACADEMIA: 'academia@insidesalons.com',
  
  // Calendario de sistemas (admin)
  SISTEMAS: 'sistemas@insidesalons.com',
  
  // Calendario general de la empresa
  EMPRESA: 'info@insidesalons.com',
  
  // Calendario del usuario autenticado
  PRIMARY: 'primary'
} as const;

// ==================== CALENDARIO POR DEFECTO ====================
// Usa variable de entorno o academia por defecto
export const DEFAULT_CALENDAR_ID = 
  process.env.GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID || 
  ORGANIZATION_CALENDARS.ACADEMIA;

// ==================== CONFIGURACIÓN REGIONAL ====================
export const CALENDAR_CONFIG = {
  // Zona horaria por defecto
  DEFAULT_TIMEZONE: process.env.GOOGLE_CALENDAR_DEFAULT_TIMEZONE || 'Europe/Madrid',
  
  // Idioma por defecto para eventos
  DEFAULT_LANGUAGE: 'es',
  
  // Formato de fecha/hora
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  
  // Notificaciones por defecto (minutos antes del evento)
  DEFAULT_REMINDERS: [
    { method: 'email', minutes: 1440 }, // 24 horas antes
    { method: 'popup', minutes: 60 }    // 1 hora antes
  ]
} as const;

// ==================== TIPOS DE EVENTOS PARA ACADEMIA ====================
export const ACADEMIA_EVENT_TYPES = {
  FORMACION: {
    colorId: '10', // Verde
    prefix: '[FORMACIÓN]'
  },
  TALLER: {
    colorId: '6',  // Naranja
    prefix: '[TALLER]'
  },
  MASTERCLASS: {
    colorId: '11', // Rojo
    prefix: '[MASTERCLASS]'
  },
  REUNION: {
    colorId: '7',  // Azul
    prefix: '[REUNIÓN]'
  },
  CERTIFICACION: {
    colorId: '9',  // Azul oscuro
    prefix: '[CERTIFICACIÓN]'
  }
} as const;

// ==================== CONFIGURACIÓN DE GOOGLE MEET ====================
export const MEET_CONFIG = {
  // Configuración por defecto para sesiones de formación
  DEFAULT_SETTINGS: {
    recording: 'enabled',
    transcription: 'enabled',
    transcriptionLanguage: 'es-ES',
    hostManagement: 'all_attendees_co_host',
    entryMode: 'knock', // Los participantes deben pedir permiso
    chatEnabled: true,
    screenShareEnabled: true
  },
  
  // Notas automáticas para las reuniones
  AUTO_NOTES_TEMPLATE: `
📚 Sesión de Formación - INSIDE Academy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎥 Esta sesión será grabada para futuras consultas
📝 Transcripción automática activada (Español)
👥 Todos los participantes son co-anfitriones

⚡ Características habilitadas:
  ✓ Grabación automática
  ✓ Transcripción en español
  ✓ Chat habilitado
  ✓ Compartir pantalla permitido
  ✓ Gemini AI para notas automáticas

📧 Soporte: academia@insidesalons.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim()
} as const;

// ==================== HELPERS PARA USAR LAS CONSTANTES ====================

/**
 * Obtiene el ID del calendario según el tipo
 */
export function getCalendarId(type?: keyof typeof ORGANIZATION_CALENDARS): string {
  if (type && ORGANIZATION_CALENDARS[type]) {
    return ORGANIZATION_CALENDARS[type];
  }
  return DEFAULT_CALENDAR_ID;
}

/**
 * Aplica configuración de tipo de evento
 */
export function applyEventType(
  eventData: any, 
  eventType: keyof typeof ACADEMIA_EVENT_TYPES
): any {
  const typeConfig = ACADEMIA_EVENT_TYPES[eventType];
  
  return {
    ...eventData,
    summary: `${typeConfig.prefix} ${eventData.summary}`,
    colorId: eventData.colorId || typeConfig.colorId
  };
}

/**
 * Verifica si un calendario pertenece a la organización
 */
export function isOrganizationCalendar(calendarId: string): boolean {
  return Object.values(ORGANIZATION_CALENDARS).includes(calendarId as any);
}

// ==================== EXPORT TYPE DEFINITIONS ====================
export type OrganizationCalendarType = keyof typeof ORGANIZATION_CALENDARS;
export type EventType = keyof typeof ACADEMIA_EVENT_TYPES;