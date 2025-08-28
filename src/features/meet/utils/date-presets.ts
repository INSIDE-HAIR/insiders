/**
 * Utilidades para calcular presets de fechas relativos a hoy
 * Siguiendo patrones SOLID y best practices
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import { DateFilter } from '../types/room-dates.types';

/**
 * Calcula el rango de fechas para un filtro predefinido
 * @param filter - El filtro de fecha seleccionado
 * @returns Objeto con fechas de inicio y fin, o null si no aplica
 */
export function getDateRangeForFilter(filter: DateFilter): { start: Date; end: Date } | null {
  const now = new Date();
  
  // Establecer a medianoche para comparaciones consistentes
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  switch (filter) {
    case DateFilter.TODAY:
      return {
        start: startOfToday,
        end: endOfToday
      };

    case DateFilter.THIS_WEEK:
      // Obtener el lunes de esta semana
      const startOfWeek = new Date(startOfToday);
      const dayOfWeek = startOfWeek.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo, retroceder 6 días
      startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
      
      // Obtener el domingo de esta semana
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return {
        start: startOfWeek,
        end: endOfWeek
      };

    case DateFilter.THIS_MONTH:
      // Primer día del mes actual
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      // Último día del mes actual
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      return {
        start: startOfMonth,
        end: endOfMonth
      };

    case DateFilter.UPCOMING:
      // Desde mañana en adelante
      const tomorrow = new Date(startOfToday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // 6 meses hacia el futuro como límite razonable
      const sixMonthsFromNow = new Date(now);
      sixMonthsFromNow.setMonth(now.getMonth() + 6);
      sixMonthsFromNow.setHours(23, 59, 59, 999);
      
      return {
        start: tomorrow,
        end: sixMonthsFromNow
      };

    case DateFilter.PAST:
      // 6 meses hacia el pasado como límite razonable
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      
      // Hasta ayer
      const yesterday = new Date(startOfToday);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);
      
      return {
        start: sixMonthsAgo,
        end: yesterday
      };

    case DateFilter.ALL:
    case DateFilter.CUSTOM:
    default:
      // No aplicar rango de fechas
      return null;
  }
}

/**
 * Verifica si una fecha está dentro del rango de un filtro predefinido
 * @param date - La fecha a verificar
 * @param filter - El filtro a aplicar
 * @returns true si la fecha está dentro del rango
 */
export function isDateInFilter(date: Date, filter: DateFilter): boolean {
  const range = getDateRangeForFilter(filter);
  
  if (!range) {
    return true; // ALL o CUSTOM siempre devuelven true
  }
  
  return date >= range.start && date <= range.end;
}

/**
 * Obtiene una descripción legible del rango de fechas
 * @param filter - El filtro aplicado
 * @returns Descripción del rango en español
 */
export function getFilterDescription(filter: DateFilter): string {
  const range = getDateRangeForFilter(filter);
  
  if (!range) {
    switch (filter) {
      case DateFilter.ALL:
        return 'Todas las fechas';
      case DateFilter.CUSTOM:
        return 'Rango personalizado';
      default:
        return 'Sin filtro';
    }
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  
  return `${formatDate(range.start)} - ${formatDate(range.end)}`;
}

/**
 * Verifica si el filtro actual es válido y tiene sentido
 * @param filter - El filtro a validar
 * @returns true si el filtro es válido
 */
export function isValidDateFilter(filter: DateFilter): boolean {
  return Object.values(DateFilter).includes(filter);
}