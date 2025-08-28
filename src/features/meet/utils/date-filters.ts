/**
 * Date filtering utilities for Meet Rooms
 */

import { RoomStatus } from '../types/room-dates.types';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isBefore,
  isAfter,
  isToday as dateFnsIsToday
} from 'date-fns';

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return dateFnsIsToday(date);
}

/**
 * Check if a date is within this week
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  return isWithinInterval(date, { start: weekStart, end: weekEnd });
}

/**
 * Check if a date is within this month
 */
export function isThisMonth(date: Date): boolean {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  return isWithinInterval(date, { start: monthStart, end: monthEnd });
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return isBefore(date, new Date());
}

/**
 * Check if a date is in the future
 */
export function isUpcoming(date: Date): boolean {
  return isAfter(date, new Date());
}

/**
 * Calculate room status based on optional start and end dates
 */
export function calculateRoomStatus(
  startDate?: Date | null, 
  endDate?: Date | null
): RoomStatus {
  const now = new Date();
  
  // No dates specified - always open
  if (!startDate && !endDate) {
    return RoomStatus.ALWAYS_OPEN;
  }
  
  // Only start date specified
  if (startDate && !endDate) {
    if (isAfter(startDate, now)) {
      return RoomStatus.UPCOMING;
    }
    return RoomStatus.ALWAYS_OPEN; // Started but no end
  }
  
  // Only end date specified
  if (!startDate && endDate) {
    if (isBefore(endDate, now)) {
      return RoomStatus.CLOSED;
    }
    return RoomStatus.OPEN;
  }
  
  // Both dates specified
  if (startDate && endDate) {
    if (isAfter(startDate, now)) {
      return RoomStatus.UPCOMING;
    }
    if (isBefore(endDate, now)) {
      return RoomStatus.CLOSED;
    }
    return RoomStatus.OPEN;
  }
  
  return RoomStatus.ALWAYS_OPEN;
}

/**
 * Check if a room is active today
 */
export function isRoomActiveToday(
  startDate?: Date | null,
  endDate?: Date | null
): boolean {
  const status = calculateRoomStatus(startDate, endDate);
  
  if (status === RoomStatus.ALWAYS_OPEN || status === RoomStatus.OPEN) {
    const now = new Date();
    
    // Check if today is within the date range
    if (startDate && isBefore(now, startDate)) {
      return false;
    }
    if (endDate && isAfter(now, endDate)) {
      return false;
    }
    
    return true;
  }
  
  return false;
}

/**
 * Check if a room is active this week
 */
export function isRoomActiveThisWeek(
  startDate?: Date | null,
  endDate?: Date | null
): boolean {
  const status = calculateRoomStatus(startDate, endDate);
  
  if (status === RoomStatus.CLOSED) {
    return false;
  }
  
  if (status === RoomStatus.ALWAYS_OPEN) {
    return true;
  }
  
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  // Check if there's any overlap with this week
  if (startDate && isAfter(startDate, weekEnd)) {
    return false;
  }
  if (endDate && isBefore(endDate, weekStart)) {
    return false;
  }
  
  return true;
}

/**
 * Check if a room is active this month
 */
export function isRoomActiveThisMonth(
  startDate?: Date | null,
  endDate?: Date | null
): boolean {
  const status = calculateRoomStatus(startDate, endDate);
  
  if (status === RoomStatus.CLOSED) {
    return false;
  }
  
  if (status === RoomStatus.ALWAYS_OPEN) {
    return true;
  }
  
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  // Check if there's any overlap with this month
  if (startDate && isAfter(startDate, monthEnd)) {
    return false;
  }
  if (endDate && isBefore(endDate, monthStart)) {
    return false;
  }
  
  return true;
}

/**
 * Format date range for display
 */
export function formatDateRange(
  startDate?: Date | null,
  endDate?: Date | null
): string {
  if (!startDate && !endDate) {
    return 'Siempre disponible';
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };
  
  if (startDate && !endDate) {
    return `Desde ${startDate.toLocaleDateString('es', formatOptions)}`;
  }
  
  if (!startDate && endDate) {
    return `Hasta ${endDate.toLocaleDateString('es', formatOptions)}`;
  }
  
  if (startDate && endDate) {
    return `${startDate.toLocaleDateString('es', formatOptions)} - ${endDate.toLocaleDateString('es', formatOptions)}`;
  }
  
  return '';
}

/**
 * Get date filter description
 */
export function getDateFilterDescription(filter: string): string {
  const descriptions: Record<string, string> = {
    all: 'Todas las salas',
    upcoming: 'Salas que aún no han iniciado',
    past: 'Salas que ya finalizaron',
    today: 'Salas activas hoy',
    this_week: 'Salas activas esta semana',
    this_month: 'Salas activas este mes'
  };
  
  return descriptions[filter] || 'Todas las salas';
}