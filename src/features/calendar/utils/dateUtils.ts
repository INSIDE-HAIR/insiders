/**
 * Date utilities for Calendar module
 * Handles date/time formatting, timezone conversions, and validation
 */

import { format, parse, isValid, addDays, startOfDay, endOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime, format as formatTz } from 'date-fns-tz';

/**
 * Formatos de fecha comunes
 */
export const DATE_FORMATS = {
  ISO_DATE: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
  DISPLAY_DATE: 'dd/MM/yyyy',
  DISPLAY_DATETIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  RFC3339: "yyyy-MM-dd'T'HH:mm:ssXXX"
} as const;

/**
 * Zonas horarias comunes
 */
export const COMMON_TIMEZONES = [
  'Europe/Madrid',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC'
] as const;

/**
 * Convierte una fecha y hora local a UTC
 */
export function toUTC(date: Date, timeZone: string): Date {
  return fromZonedTime(date, timeZone);
}

/**
 * Convierte una fecha UTC a zona horaria específica
 */
export function fromUTC(date: Date, timeZone: string): Date {
  return toZonedTime(date, timeZone);
}

/**
 * Formatea una fecha con zona horaria
 */
export function formatWithTimeZone(
  date: Date, 
  formatString: string, 
  timeZone: string
): string {
  return formatTz(date, formatString, { timeZone });
}

/**
 * Crea una fecha desde string de fecha y hora
 */
export function createDateTime(
  dateStr: string, 
  timeStr: string, 
  timeZone: string = 'Europe/Madrid'
): Date {
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  const localDate = parse(dateTimeStr, DATE_FORMATS.ISO_DATETIME, new Date());
  
  if (!isValid(localDate)) {
    throw new Error(`Invalid date/time: ${dateTimeStr}`);
  }
  
  return toUTC(localDate, timeZone);
}

/**
 * Crea una fecha de todo el día
 */
export function createAllDayDate(dateStr: string): Date {
  const date = parse(dateStr, DATE_FORMATS.ISO_DATE, new Date());
  
  if (!isValid(date)) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  
  return startOfDay(date);
}

/**
 * Convierte Date a string ISO date (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return format(date, DATE_FORMATS.ISO_DATE);
}

/**
 * Convierte Date a string time (HH:mm)
 */
export function toTimeString(date: Date, timeZone?: string): string {
  if (timeZone) {
    return formatWithTimeZone(date, DATE_FORMATS.TIME_ONLY, timeZone);
  }
  return format(date, DATE_FORMATS.TIME_ONLY);
}

/**
 * Convierte Date a RFC3339 timestamp para Google Calendar
 */
export function toRFC3339(date: Date, timeZone?: string): string {
  if (timeZone) {
    return formatWithTimeZone(date, DATE_FORMATS.RFC3339, timeZone);
  }
  return date.toISOString();
}

/**
 * Parsea timestamp RFC3339 a Date
 */
export function fromRFC3339(timestamp: string): Date {
  const date = new Date(timestamp);
  if (!isValid(date)) {
    throw new Error(`Invalid RFC3339 timestamp: ${timestamp}`);
  }
  return date;
}

/**
 * Valida que una fecha de inicio sea anterior a la fecha de fin
 */
export function validateDateRange(
  startDate: string,
  startTime: string | undefined,
  endDate: string,
  endTime: string | undefined,
  allDay: boolean = false
): { isValid: boolean; error?: string } {
  try {
    let start: Date;
    let end: Date;

    if (allDay) {
      start = createAllDayDate(startDate);
      end = createAllDayDate(endDate);
    } else {
      if (!startTime || !endTime) {
        return { isValid: false, error: 'Time is required for non-all-day events' };
      }
      start = createDateTime(startDate, startTime);
      end = createDateTime(endDate, endTime);
    }

    if (start >= end) {
      return { isValid: false, error: 'Start date/time must be before end date/time' };
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid date/time format' 
    };
  }
}

/**
 * Calcula la duración entre dos fechas en minutos
 */
export function calculateDurationMinutes(
  startDate: string,
  startTime: string | undefined,
  endDate: string,
  endTime: string | undefined,
  allDay: boolean = false,
  timeZone: string = 'Europe/Madrid'
): number {
  let start: Date;
  let end: Date;

  if (allDay) {
    start = createAllDayDate(startDate);
    end = addDays(createAllDayDate(endDate), 1); // All-day events end at start of next day
  } else {
    if (!startTime || !endTime) return 0;
    start = createDateTime(startDate, startTime, timeZone);
    end = createDateTime(endDate, endTime, timeZone);
  }

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Genera sugerencias de horarios para eventos
 */
export function generateTimeSlots(
  startHour: number = 8,
  endHour: number = 20,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += intervalMinutes) {
      if (hour === endHour && minutes > 0) break;
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
}

/**
 * Obtiene la fecha de hoy en formato ISO
 */
export function getTodayISO(): string {
  return toISODate(new Date());
}

/**
 * Obtiene la fecha de mañana en formato ISO
 */
export function getTomorrowISO(): string {
  return toISODate(addDays(new Date(), 1));
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Verifica si una fecha es en el pasado
 */
export function isPastDate(dateStr: string, timeStr?: string): boolean {
  const now = new Date();
  
  if (timeStr) {
    const eventDate = createDateTime(dateStr, timeStr);
    return eventDate < now;
  } else {
    const eventDate = createAllDayDate(dateStr);
    const today = startOfDay(now);
    return eventDate < today;
  }
}

/**
 * Obtiene un rango de fechas común (próximos 30 días)
 */
export function getUpcomingDateRange(): { start: string; end: string } {
  const now = new Date();
  const start = toRFC3339(startOfDay(now));
  const end = toRFC3339(endOfDay(addDays(now, 30)));
  
  return { start, end };
}

/**
 * Convierte duración en minutos a texto legible
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}