import { useState, useEffect, useMemo } from 'react';
import { RoomStatus } from '../types/room-dates.types';
import { calculateRoomStatus, formatDateRange } from '../utils/date-filters';

interface UseRoomStatusProps {
  startDate?: Date | null | string;
  endDate?: Date | null | string;
  updateInterval?: number; // Intervalo de actualización en ms (default: 60000 = 1 minuto)
}

interface RoomStatusResult {
  status: RoomStatus;
  label: string;
  dateRange: string;
  isActive: boolean;
  isUpcoming: boolean;
  isPast: boolean;
  timeUntilStart?: number; // Milisegundos hasta el inicio
  timeUntilEnd?: number; // Milisegundos hasta el fin
}

export function useRoomStatus({ 
  startDate, 
  endDate,
  updateInterval = 60000 // Actualizar cada minuto por defecto
}: UseRoomStatusProps): RoomStatusResult {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Convertir fechas si vienen como string
  const parsedStartDate = useMemo(() => {
    if (!startDate) return null;
    return typeof startDate === 'string' ? new Date(startDate) : startDate;
  }, [startDate]);

  const parsedEndDate = useMemo(() => {
    if (!endDate) return null;
    return typeof endDate === 'string' ? new Date(endDate) : endDate;
  }, [endDate]);

  // Actualizar el tiempo actual periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  // Calcular el estado actual
  const status = useMemo(() => {
    return calculateRoomStatus(parsedStartDate, parsedEndDate);
  }, [parsedStartDate, parsedEndDate, currentTime]);

  // Calcular metadatos adicionales
  const result = useMemo(() => {
    const now = currentTime.getTime();
    
    let timeUntilStart: number | undefined;
    let timeUntilEnd: number | undefined;
    
    if (parsedStartDate) {
      const startTime = parsedStartDate.getTime();
      if (startTime > now) {
        timeUntilStart = startTime - now;
      }
    }
    
    if (parsedEndDate) {
      const endTime = parsedEndDate.getTime();
      if (endTime > now) {
        timeUntilEnd = endTime - now;
      }
    }

    const labels: Record<RoomStatus, string> = {
      [RoomStatus.ALWAYS_OPEN]: 'Siempre abierta',
      [RoomStatus.OPEN]: 'Abierta',
      [RoomStatus.CLOSED]: 'Cerrada',
      [RoomStatus.UPCOMING]: 'Por abrir'
    };

    return {
      status,
      label: labels[status],
      dateRange: formatDateRange(parsedStartDate, parsedEndDate),
      isActive: status === RoomStatus.OPEN || status === RoomStatus.ALWAYS_OPEN,
      isUpcoming: status === RoomStatus.UPCOMING,
      isPast: status === RoomStatus.CLOSED,
      timeUntilStart,
      timeUntilEnd
    };
  }, [status, parsedStartDate, parsedEndDate, currentTime]);

  return result;
}

/**
 * Hook para formatear tiempo restante de forma legible
 */
export function useTimeRemaining(milliseconds?: number): string {
  if (!milliseconds || milliseconds <= 0) {
    return '';
  }

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} día${days !== 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
  
  return 'Menos de 1 minuto';
}