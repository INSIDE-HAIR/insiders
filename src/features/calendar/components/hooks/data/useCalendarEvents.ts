/**
 * useCalendarEvents - Data Hook
 * 
 * Hook para gestionar eventos de calendario
 * Extraído de la lógica existente en page.tsx y componentes
 * Separa lógica de presentación siguiendo principios SOLID
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface UseCalendarEventsOptions {
  calendarIds?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  maxResults?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseCalendarEventsReturn {
  events: GoogleCalendarEvent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  eventsCount: number;
  eventsWithMeet: number;
  eventsWithoutMeet: number;
  upcomingEvents: number;
  pastEvents: number;
  ongoingEvents: number;
}

export const useCalendarEvents = (
  options: UseCalendarEventsOptions = {}
): UseCalendarEventsReturn => {
  const {
    calendarIds = [],
    dateRange,
    maxResults = 1000,
    autoRefresh = false,
    refreshInterval = 30000, // 30 segundos
  } = options;

  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener eventos
  const fetchEvents = useCallback(async () => {
    if (calendarIds.length === 0) {
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      calendarIds.forEach(id => queryParams.append('calendarIds', id));
      
      if (dateRange?.start) {
        queryParams.append('timeMin', dateRange.start);
      }
      if (dateRange?.end) {
        queryParams.append('timeMax', dateRange.end);
      }
      if (maxResults) {
        queryParams.append('maxResults', maxResults.toString());
      }

      const response = await fetch(`/api/calendar/events?${queryParams}`);
      
      if (!response.ok) {
        let errorMessage = 'Error al cargar eventos';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Si no se puede parsear el error, usar mensaje genérico
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [calendarIds, dateRange, maxResults]);

  // Función pública para refrescar
  const refresh = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Cargar eventos cuando cambien las dependencias
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        fetchEvents();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isLoading, fetchEvents]);

  // Métricas calculadas - memoizadas para performance
  const eventMetrics = useMemo(() => {
    const now = new Date();
    
    const eventsWithMeet = events.filter(
      event => event.hangoutLink || event.conferenceData
    ).length;
    
    const eventsWithoutMeet = events.length - eventsWithMeet;
    
    let upcomingEvents = 0;
    let pastEvents = 0;
    let ongoingEvents = 0;
    
    events.forEach(event => {
      const start = new Date(event.start?.dateTime || event.start?.date || '');
      const end = new Date(event.end?.dateTime || event.end?.date || '');
      
      if (now < start) {
        upcomingEvents++;
      } else if (now > end) {
        pastEvents++;
      } else {
        ongoingEvents++;
      }
    });

    return {
      eventsCount: events.length,
      eventsWithMeet,
      eventsWithoutMeet,
      upcomingEvents,
      pastEvents,
      ongoingEvents,
    };
  }, [events]);

  return {
    events,
    isLoading,
    error,
    refresh,
    ...eventMetrics,
  };
};

// Hook para obtener evento individual
export const useCalendarEvent = (eventId: string, calendarId: string) => {
  const [event, setEvent] = useState<GoogleCalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId || !calendarId) {
      setEvent(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}?calendarId=${calendarId}`
      );
      
      if (!response.ok) {
        let errorMessage = 'Error al cargar evento';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Mensaje genérico si no se puede parsear
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setEvent(data);
    } catch (err) {
      console.error('Error fetching calendar event:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, calendarId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const refresh = useCallback(async () => {
    await fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    isLoading,
    error,
    refresh,
  };
};