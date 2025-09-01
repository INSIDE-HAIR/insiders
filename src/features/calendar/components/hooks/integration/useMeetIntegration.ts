/**
 * useMeetIntegration - Integration Hook
 * 
 * Hook para gestionar integración con Google Meet
 * Extraído de la lógica existente de Google Meet en eventos
 * Centraliza creación y gestión de enlaces de Meet
 */

"use client";

import { useState, useCallback } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { toast } from "@/src/components/ui/use-toast";

interface MeetLinkData {
  hangoutLink?: string;
  meetingUrl?: string;
  conferenceId?: string;
  entryPoints?: Array<{
    entryPointType: string;
    uri?: string;
    label?: string;
    pin?: string;
  }>;
}

interface MeetSettings {
  enableRecording?: boolean;
  enableTranscription?: boolean;
  enableAttendanceTracking?: boolean;
  maxParticipants?: number;
}

interface UseMeetIntegrationOptions {
  autoGenerateForNewEvents?: boolean;
  defaultMeetSettings?: MeetSettings;
  onMeetCreated?: (meetData: MeetLinkData) => void;
  onMeetError?: (error: string) => void;
}

interface UseMeetIntegrationReturn {
  // Estado
  isGeneratingMeet: boolean;
  meetError: string | null;
  
  // Acciones principales
  generateMeetLink: (event: GoogleCalendarEvent, settings?: MeetSettings) => Promise<MeetLinkData | null>;
  removeMeetLink: (event: GoogleCalendarEvent) => Promise<boolean>;
  updateMeetSettings: (event: GoogleCalendarEvent, settings: MeetSettings) => Promise<boolean>;
  
  // Acciones masivas
  generateMeetLinksForEvents: (events: GoogleCalendarEvent[], settings?: MeetSettings) => Promise<{
    success: number;
    failed: number;
    results: Array<{ eventId: string; success: boolean; meetData?: MeetLinkData; error?: string }>;
  }>;
  
  // Utilidades
  extractMeetData: (event: GoogleCalendarEvent) => MeetLinkData | null;
  hasMeetLink: (event: GoogleCalendarEvent) => boolean;
  getMeetUrl: (event: GoogleCalendarEvent) => string | null;
  getMeetId: (event: GoogleCalendarEvent) => string | null;
  
  // Validaciones
  canAddMeetLink: (event: GoogleCalendarEvent) => boolean;
  validateMeetSettings: (settings: MeetSettings) => string | null;
}

export const useMeetIntegration = (
  options: UseMeetIntegrationOptions = {}
): UseMeetIntegrationReturn => {
  const {
    autoGenerateForNewEvents = false,
    defaultMeetSettings = {},
    onMeetCreated,
    onMeetError,
  } = options;

  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);
  const [meetError, setMeetError] = useState<string | null>(null);

  // Extraer datos de Meet de un evento
  const extractMeetData = useCallback((event: GoogleCalendarEvent): MeetLinkData | null => {
    if (!event) return null;

    const meetData: MeetLinkData = {};

    // Google Meet link directo
    if (event.hangoutLink) {
      meetData.hangoutLink = event.hangoutLink;
      meetData.meetingUrl = event.hangoutLink;
    }

    // Datos de conferencia
    if (event.conferenceData) {
      const conferenceData = event.conferenceData as any;
      
      if (conferenceData.conferenceId) {
        meetData.conferenceId = conferenceData.conferenceId;
      }

      if (conferenceData.entryPoints) {
        meetData.entryPoints = conferenceData.entryPoints;
        
        // Buscar URL principal
        const videoEntry = conferenceData.entryPoints.find(
          (entry: any) => entry.entryPointType === 'video'
        );
        if (videoEntry?.uri) {
          meetData.meetingUrl = videoEntry.uri;
        }
      }
    }

    return Object.keys(meetData).length > 0 ? meetData : null;
  }, []);

  // Verificar si un evento tiene Meet link
  const hasMeetLink = useCallback((event: GoogleCalendarEvent): boolean => {
    const meetData = extractMeetData(event);
    return meetData !== null && (!!meetData.hangoutLink || !!meetData.meetingUrl);
  }, [extractMeetData]);

  // Obtener URL de Meet
  const getMeetUrl = useCallback((event: GoogleCalendarEvent): string | null => {
    const meetData = extractMeetData(event);
    return meetData?.meetingUrl || meetData?.hangoutLink || null;
  }, [extractMeetData]);

  // Obtener ID de Meet
  const getMeetId = useCallback((event: GoogleCalendarEvent): string | null => {
    const meetData = extractMeetData(event);
    
    if (meetData?.conferenceId) {
      return meetData.conferenceId;
    }
    
    // Extraer ID de la URL si no hay conferenceId
    const meetUrl = meetData?.meetingUrl || meetData?.hangoutLink;
    if (meetUrl) {
      const match = meetUrl.match(/meet\.google\.com\/([a-zA-Z0-9-_]+)/);
      return match?.[1] || null;
    }
    
    return null;
  }, [extractMeetData]);

  // Verificar si se puede agregar Meet link
  const canAddMeetLink = useCallback((event: GoogleCalendarEvent): boolean => {
    // No se puede agregar si ya tiene uno
    if (hasMeetLink(event)) return false;
    
    // Debe ser un evento futuro
    const eventStart = new Date(event.start?.dateTime || event.start?.date || '');
    const now = new Date();
    
    return eventStart > now;
  }, [hasMeetLink]);

  // Validar configuración de Meet
  const validateMeetSettings = useCallback((settings: MeetSettings): string | null => {
    if (settings.maxParticipants && (settings.maxParticipants < 1 || settings.maxParticipants > 250)) {
      return 'El número máximo de participantes debe estar entre 1 y 250';
    }
    
    return null;
  }, []);

  // Generar enlace de Meet para un evento
  const generateMeetLink = useCallback(async (
    event: GoogleCalendarEvent,
    settings: MeetSettings = {}
  ): Promise<MeetLinkData | null> => {
    if (!canAddMeetLink(event)) {
      setMeetError('No se puede agregar Meet link a este evento');
      return null;
    }

    const validationError = validateMeetSettings(settings);
    if (validationError) {
      setMeetError(validationError);
      return null;
    }

    setIsGeneratingMeet(true);
    setMeetError(null);

    try {
      const response = await fetch('/api/calendar/meet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          calendarId: (event as any).calendarId,
          settings: {
            ...defaultMeetSettings,
            ...settings,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al generar enlace de Meet');
      }

      const result = await response.json();
      const meetData = result.meetData as MeetLinkData;

      toast({
        title: "Meet generado",
        description: "Se agregó el enlace de Google Meet al evento",
        duration: 3000,
      });

      onMeetCreated?.(meetData);
      return meetData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMeetError(errorMessage);
      onMeetError?.(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      return null;
    } finally {
      setIsGeneratingMeet(false);
    }
  }, [canAddMeetLink, validateMeetSettings, defaultMeetSettings, onMeetCreated, onMeetError]);

  // Eliminar enlace de Meet
  const removeMeetLink = useCallback(async (event: GoogleCalendarEvent): Promise<boolean> => {
    if (!hasMeetLink(event)) {
      setMeetError('Este evento no tiene enlace de Meet');
      return false;
    }

    setIsGeneratingMeet(true);
    setMeetError(null);

    try {
      const response = await fetch('/api/calendar/meet/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          calendarId: (event as any).calendarId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar enlace de Meet');
      }

      toast({
        title: "Meet eliminado",
        description: "Se eliminó el enlace de Google Meet del evento",
        duration: 3000,
      });

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMeetError(errorMessage);
      onMeetError?.(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      return false;
    } finally {
      setIsGeneratingMeet(false);
    }
  }, [hasMeetLink, onMeetError]);

  // Actualizar configuración de Meet
  const updateMeetSettings = useCallback(async (
    event: GoogleCalendarEvent,
    settings: MeetSettings
  ): Promise<boolean> => {
    if (!hasMeetLink(event)) {
      setMeetError('Este evento no tiene enlace de Meet');
      return false;
    }

    const validationError = validateMeetSettings(settings);
    if (validationError) {
      setMeetError(validationError);
      return false;
    }

    setIsGeneratingMeet(true);
    setMeetError(null);

    try {
      const response = await fetch('/api/calendar/meet/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          calendarId: (event as any).calendarId,
          settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al actualizar configuración de Meet');
      }

      toast({
        title: "Configuración actualizada",
        description: "Se actualizó la configuración de Google Meet",
        duration: 3000,
      });

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMeetError(errorMessage);
      onMeetError?.(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      return false;
    } finally {
      setIsGeneratingMeet(false);
    }
  }, [hasMeetLink, validateMeetSettings, onMeetError]);

  // Generar Meet links para múltiples eventos
  const generateMeetLinksForEvents = useCallback(async (
    events: GoogleCalendarEvent[],
    settings: MeetSettings = {}
  ) => {
    const validEvents = events.filter(event => canAddMeetLink(event));
    const results = [];
    let success = 0;
    let failed = 0;

    setIsGeneratingMeet(true);
    setMeetError(null);

    for (const event of validEvents) {
      try {
        const meetData = await generateMeetLink(event, settings);
        if (meetData) {
          success++;
          results.push({
            eventId: event.id,
            success: true,
            meetData,
          });
        } else {
          failed++;
          results.push({
            eventId: event.id,
            success: false,
            error: 'No se pudo generar el enlace',
          });
        }
      } catch (error) {
        failed++;
        results.push({
          eventId: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    setIsGeneratingMeet(false);

    const totalAttempted = validEvents.length;
    const skipped = events.length - totalAttempted;

    toast({
      title: "Generación masiva completada",
      description: `${success} exitosos, ${failed} fallos${skipped > 0 ? `, ${skipped} omitidos` : ''}`,
      duration: 5000,
    });

    return { success, failed, results };
  }, [canAddMeetLink, generateMeetLink]);

  return {
    // Estado
    isGeneratingMeet,
    meetError,
    
    // Acciones principales
    generateMeetLink,
    removeMeetLink,
    updateMeetSettings,
    
    // Acciones masivas
    generateMeetLinksForEvents,
    
    // Utilidades
    extractMeetData,
    hasMeetLink,
    getMeetUrl,
    getMeetId,
    
    // Validaciones
    canAddMeetLink,
    validateMeetSettings,
  };
};