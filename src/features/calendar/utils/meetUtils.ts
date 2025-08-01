/**
 * Utilidades para trabajar con Google Meet IDs y conference data
 */

import { GoogleCalendarEvent } from "../types";

/**
 * Extrae el Meet ID de un evento de calendario
 * @param event - Evento de Google Calendar
 * @returns Meet ID o null si no existe
 */
export function extractMeetId(event: GoogleCalendarEvent): string | null {
  // Método 1: Extraer del hangoutLink
  if (event.hangoutLink) {
    const match = event.hangoutLink.match(/meet\.google\.com\/([a-z\-]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Método 2: Obtener del conferenceData
  if (event.conferenceData?.conferenceId) {
    return event.conferenceData.conferenceId;
  }

  return null;
}

/**
 * Construye la URL completa de Google Meet a partir del ID
 * @param meetId - ID del meeting
 * @returns URL completa de Google Meet
 */
export function buildMeetUrl(meetId: string): string {
  return `https://meet.google.com/${meetId}`;
}

/**
 * Verifica si un evento tiene Google Meet habilitado
 * @param event - Evento de Google Calendar
 * @returns true si tiene Meet, false si no
 */
export function hasMeetEnabled(event: GoogleCalendarEvent): boolean {
  return !!(event.hangoutLink || event.conferenceData?.conferenceId);
}

/**
 * Obtiene información detallada de la conferencia
 * @param event - Evento de Google Calendar
 * @returns Objeto con información de la conferencia o null
 */
export function getMeetInfo(event: GoogleCalendarEvent): {
  meetId: string | null;
  meetUrl: string | null;
  conferenceType: string | null;
  entryPoints: any[] | null;
} | null {
  const meetId = extractMeetId(event);
  
  if (!meetId) return null;

  return {
    meetId,
    meetUrl: event.hangoutLink || buildMeetUrl(meetId),
    conferenceType: event.conferenceData?.conferenceSolution?.name || 'Google Meet',
    entryPoints: event.conferenceData?.entryPoints || null
  };
}

/**
 * Formatea el Meet ID para mostrar (añade guiones si no los tiene)
 * @param meetId - ID del meeting
 * @returns Meet ID formateado
 */
export function formatMeetId(meetId: string): string {
  // Si ya tiene guiones, devolverlo tal cual
  if (meetId.includes('-')) return meetId;
  
  // Si es un ID sin guiones (por ejemplo: abcdefghijk)
  // Formatear como: abc-defg-hijk
  if (meetId.length === 10) {
    return `${meetId.slice(0, 3)}-${meetId.slice(3, 7)}-${meetId.slice(7)}`;
  }
  
  return meetId;
}

/**
 * Genera el link de Google Calendar para ver/editar un evento
 * @param event - Evento de Google Calendar
 * @param calendarId - ID del calendario (por defecto 'primary')
 * @returns URL de Google Calendar o null si no se puede generar
 */
export function getGoogleCalendarLink(event: GoogleCalendarEvent, calendarId: string = 'primary'): string | null {
  // Preferir htmlLink si está disponible
  if (event.htmlLink) {
    return event.htmlLink;
  }
  
  // Si no hay htmlLink, intentar construir el link
  if (!event.id) return null;
  
  try {
    // El formato del eid es: eventId espacio calendarEmail en base64
    // Para calendarios principales, usar el email completo
    const calendarEmail = calendarId === 'primary' ? '' : calendarId;
    const eidString = calendarEmail ? `${event.id} ${calendarEmail}` : event.id;
    
    // Codificar en base64 y remover padding
    const encodedEid = btoa(eidString).replace(/=/g, '');
    
    return `https://calendar.google.com/calendar/u/0/r/event?eid=${encodedEid}`;
  } catch (error) {
    console.error('Error generating Google Calendar link:', error);
    return null;
  }
}