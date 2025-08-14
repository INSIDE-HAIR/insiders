/**
 * Google Calendar Configuration
 * Configuración centralizada para Google Calendar API y Google Meet API
 */

// Scopes completos de Google Calendar y Meet
export const DEFAULT_GOOGLE_CALENDAR_SCOPES = [
  // Calendar Core Scopes
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.readonly',
  
  // Calendar Events
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/calendar.events.owned',
  'https://www.googleapis.com/auth/calendar.events.owned.readonly',
  'https://www.googleapis.com/auth/calendar.events.public.readonly',
  'https://www.googleapis.com/auth/calendar.events.freebusy',
  
  // Calendar Lists
  'https://www.googleapis.com/auth/calendar.calendarlist',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
  
  // Calendar Management
  'https://www.googleapis.com/auth/calendar.calendars',
  'https://www.googleapis.com/auth/calendar.calendars.readonly',
  
  // Calendar ACL (Access Control)
  'https://www.googleapis.com/auth/calendar.acls',
  'https://www.googleapis.com/auth/calendar.acls.readonly',
  
  // Calendar Settings
  'https://www.googleapis.com/auth/calendar.settings.readonly',
  
  // FreeBusy
  'https://www.googleapis.com/auth/calendar.freebusy',
  
  // App Created Events (for apps that create events)
  'https://www.googleapis.com/auth/calendar.app.created',
  
  // Google Meet Scopes
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/meetings.space.settings',
];

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  redirectUri: string;
  defaultTimezone: string;
  defaultCalendarId: string;
  scopes: string[];
}

/**
 * Obtiene la configuración de Google Calendar desde variables de entorno
 * con valores por defecto seguros
 */
export function getGoogleCalendarConfig(): GoogleCalendarConfig {
  const defaultCalendarId = process.env.GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID || 'primary';
  const defaultTimezone = process.env.GOOGLE_CALENDAR_DEFAULT_TIMEZONE || 'Europe/Madrid';
  
  // Obtener scopes desde env o usar defaults
  const scopesFromEnv = process.env.GOOGLE_CALENDAR_SCOPES;
  const scopes = scopesFromEnv 
    ? scopesFromEnv.split(',').map(s => s.trim())
    : DEFAULT_GOOGLE_CALENDAR_SCOPES;

  return {
    clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI || 
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/auth/callback`,
    defaultTimezone,
    defaultCalendarId,
    scopes
  };
}

/**
 * Valida que la configuración de Google Calendar esté completa
 */
export function validateGoogleCalendarConfig(config: GoogleCalendarConfig): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Campos obligatorios
  if (!config.clientId) missingFields.push('GOOGLE_CALENDAR_CLIENT_ID');
  if (!config.clientSecret) missingFields.push('GOOGLE_CALENDAR_CLIENT_SECRET');
  
  // Campos recomendados
  if (!config.refreshToken) {
    warnings.push('GOOGLE_CALENDAR_REFRESH_TOKEN not set - manual auth flow will be required');
  }
  
  // Validar calendar ID por defecto
  if (config.defaultCalendarId === 'your-default-calendar-email') {
    warnings.push('GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID is using placeholder value');
  }
  
  // Validar scopes de Meet
  const hasMetScopes = config.scopes.some(scope => scope.includes('meetings.space'));
  if (!hasMetScopes) {
    warnings.push('Google Meet scopes not configured - Meet members functionality will be limited');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
}

/**
 * Log de configuración para debugging
 */
export function logGoogleCalendarConfig() {
  const config = getGoogleCalendarConfig();
  const validation = validateGoogleCalendarConfig(config);
  
  console.log('📅 Google Calendar Configuration:');
  console.log(`  Default Calendar: ${config.defaultCalendarId}`);
  console.log(`  Default Timezone: ${config.defaultTimezone}`);
  console.log(`  Scopes Count: ${config.scopes.length}`);
  console.log(`  Client ID: ${config.clientId ? '✅ Set' : '❌ Missing'}`);
  console.log(`  Client Secret: ${config.clientSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`  Refresh Token: ${config.refreshToken ? '✅ Set' : '⚠️ Missing'}`);
  
  if (validation.warnings.length > 0) {
    console.log('⚠️ Configuration Warnings:');
    validation.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (!validation.isValid) {
    console.log('❌ Missing Required Fields:');
    validation.missingFields.forEach(field => console.log(`  - ${field}`));
  } else {
    console.log('✅ Configuration is valid');
  }
}