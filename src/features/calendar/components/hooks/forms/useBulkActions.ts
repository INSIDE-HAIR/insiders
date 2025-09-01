/**
 * useBulkActions - Form Hook
 * 
 * Hook para gestionar acciones masivas sobre eventos
 * Extraído de la lógica existente en BulkActionsBar y DataTable
 * Centraliza toda la lógica de operaciones bulk
 */

"use client";

import { useState, useCallback } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { toast } from "@/src/components/ui/use-toast";

interface UseBulkActionsOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseBulkActionsReturn {
  isProcessing: boolean;
  addParticipants: (events: GoogleCalendarEvent[], participants: string[]) => Promise<void>;
  generateMeetLinks: (events: GoogleCalendarEvent[]) => Promise<void>;
  generateDescriptions: (events: GoogleCalendarEvent[], template?: string) => Promise<void>;
  moveToCalendar: (events: GoogleCalendarEvent[], targetCalendarId: string) => Promise<void>;
  updateDateTime: (events: GoogleCalendarEvent[], dateTimeUpdates: any) => Promise<void>;
  deleteEvents: (events: GoogleCalendarEvent[]) => Promise<void>;
  duplicateEvents: (events: GoogleCalendarEvent[]) => Promise<void>;
}

export const useBulkActions = (
  options: UseBulkActionsOptions = {}
): UseBulkActionsReturn => {
  const { onSuccess, onError } = options;
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper para manejar errores
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const errorMessage = error?.message || defaultMessage;
    console.error(defaultMessage, error);
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
    
    onError?.(errorMessage);
  }, [onError]);

  // Helper para mostrar éxito
  const handleSuccess = useCallback((message: string) => {
    toast({
      title: "Éxito",
      description: message,
      duration: 3000,
    });
    
    onSuccess?.();
  }, [onSuccess]);

  // Agregar participantes masivamente
  const addParticipants = useCallback(async (
    events: GoogleCalendarEvent[], 
    participants: string[]
  ) => {
    if (events.length === 0 || participants.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/calendar/bulk/add-participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: events.map(event => ({
            id: event.id,
            calendarId: (event as any).calendarId,
          })),
          participants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al agregar participantes');
      }

      const result = await response.json();
      handleSuccess(
        `Se agregaron participantes a ${result.updated || events.length} eventos`
      );
    } catch (error) {
      handleError(error, 'Error al agregar participantes');
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, handleSuccess]);

  // Generar enlaces de Meet masivamente
  const generateMeetLinks = useCallback(async (events: GoogleCalendarEvent[]) => {
    if (events.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/calendar/bulk/generate-meet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: events.map(event => ({
            id: event.id,
            calendarId: (event as any).calendarId,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al generar enlaces de Meet');
      }

      const result = await response.json();
      handleSuccess(
        `Se generaron enlaces de Meet para ${result.updated || events.length} eventos`
      );
    } catch (error) {
      handleError(error, 'Error al generar enlaces de Meet');
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, handleSuccess]);

  // Generar descripciones masivamente
  const generateDescriptions = useCallback(async (
    events: GoogleCalendarEvent[], 
    template?: string
  ) => {
    if (events.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/calendar/bulk/generate-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: events.map(event => ({
            id: event.id,
            calendarId: (event as any).calendarId,
            summary: event.summary,
            start: event.start,
            end: event.end,
          })),
          template,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al generar descripciones');
      }

      const result = await response.json();
      handleSuccess(
        `Se generaron descripciones para ${result.updated || events.length} eventos`
      );
    } catch (error) {
      handleError(error, 'Error al generar descripciones');
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, handleSuccess]);

  // Mover eventos a otro calendario
  const moveToCalendar = useCallback(async (
    events: GoogleCalendarEvent[], 
    targetCalendarId: string
  ) => {
    if (events.length === 0 || !targetCalendarId) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/calendar/bulk/move-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: events.map(event => ({
            id: event.id,
            calendarId: (event as any).calendarId,
          })),
          targetCalendarId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al mover eventos');
      }

      const result = await response.json();
      handleSuccess(
        `Se movieron ${result.moved || events.length} eventos al nuevo calendario`
      );
    } catch (error) {
      handleError(error, 'Error al mover eventos');
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, handleSuccess]);

  // Actualizar fechas/horas masivamente
  const updateDateTime = useCallback(async (
    events: GoogleCalendarEvent[], 
    dateTimeUpdates: any
  ) => {
    if (events.length === 0 || !dateTimeUpdates) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/calendar/bulk/update-datetime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: events.map(event => ({
            id: event.id,
            calendarId: (event as any).calendarId,
            start: event.start,
            end: event.end,
          })),
          updates: dateTimeUpdates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al actualizar fechas');
      }

      const result = await response.json();
      handleSuccess(
        `Se actualizaron fechas de ${result.updated || events.length} eventos`
      );
    } catch (error) {
      handleError(error, 'Error al actualizar fechas');
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, handleSuccess]);

  // Eliminar eventos masivamente
  const deleteEvents = useCallback(async (events: GoogleCalendarEvent[]) => {
    if (events.length === 0) return;

    // Confirmación de seguridad
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar ${events.length} evento${
        events.length !== 1 ? 's' : ''
      }? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/calendar/bulk/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: events.map(event => ({
            id: event.id,
            calendarId: (event as any).calendarId,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar eventos');
      }

      const result = await response.json();
      handleSuccess(
        `Se eliminaron ${result.deleted || events.length} eventos`
      );
    } catch (error) {
      handleError(error, 'Error al eliminar eventos');
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, handleSuccess]);

  // Duplicar eventos
  const duplicateEvents = useCallback(async (events: GoogleCalendarEvent[]) => {
    if (events.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/calendar/bulk/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: events.map(event => ({
            id: event.id,
            calendarId: (event as any).calendarId,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al duplicar eventos');
      }

      const result = await response.json();
      handleSuccess(
        `Se duplicaron ${result.created || events.length} eventos`
      );
    } catch (error) {
      handleError(error, 'Error al duplicar eventos');
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, handleSuccess]);

  return {
    isProcessing,
    addParticipants,
    generateMeetLinks,
    generateDescriptions,
    moveToCalendar,
    updateDateTime,
    deleteEvents,
    duplicateEvents,
  };
};