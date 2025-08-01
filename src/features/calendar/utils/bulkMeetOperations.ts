/**
 * Utilidades para operaciones bulk de Google Meet en eventos
 */

import { GoogleCalendarEvent } from "../types";
import { hasMeetEnabled, getMeetInfo } from "./meetUtils";

export interface BulkMeetResult {
  successful: number;
  failed: number;
  errors: Array<{
    eventId: string;
    title: string;
    error: string;
  }>;
  results: Array<{
    eventId: string;
    title: string;
    meetLink?: string;
    meetId?: string;
  }>;
}

/**
 * Procesa eventos en lotes para agregar Google Meet
 * @param events - Array de eventos para procesar
 * @param batchSize - Tamaño del lote (default: 5)
 * @param onProgress - Callback para reportar progreso
 */
export async function processMeetBulkOperation(
  events: GoogleCalendarEvent[],
  batchSize: number = 5,
  onProgress?: (processed: number, total: number) => void
): Promise<BulkMeetResult> {
  const result: BulkMeetResult = {
    successful: 0,
    failed: 0,
    errors: [],
    results: []
  };

  // Filtrar eventos que no tienen Meet
  const eventsToProcess = events.filter(event => !hasMeetEnabled(event));
  
  if (eventsToProcess.length === 0) {
    return result;
  }

  // Procesar en lotes para evitar sobrecarga
  for (let i = 0; i < eventsToProcess.length; i += batchSize) {
    const batch = eventsToProcess.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (event) => {
      try {
        const eventCalendarId = (event as any).calendarId || "primary";
        
        const response = await fetch(
          `/api/calendar/events/${event.id}/meet?calendarId=${eventCalendarId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al generar Meet");
        }

        const data = await response.json();
        result.successful++;
        result.results.push({
          eventId: event.id || "",
          title: event.summary,
          meetLink: data.meetLink,
          meetId: data.event?.conferenceData?.conferenceId
        });

        return data;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          eventId: event.id || "unknown",
          title: event.summary || "Sin título",
          error: error.message
        });
        return null;
      }
    });

    await Promise.all(batchPromises);
    
    // Reportar progreso
    if (onProgress) {
      const processed = Math.min(i + batchSize, eventsToProcess.length);
      onProgress(processed, eventsToProcess.length);
    }

    // Pequeña pausa entre lotes para evitar rate limiting
    if (i + batchSize < eventsToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return result;
}

/**
 * Genera un resumen de la operación bulk
 */
export function generateBulkMeetSummary(result: BulkMeetResult): string {
  const lines: string[] = [];
  
  if (result.successful > 0) {
    lines.push(`✅ ${result.successful} enlaces de Meet generados exitosamente`);
  }
  
  if (result.failed > 0) {
    lines.push(`❌ ${result.failed} errores al generar Meet`);
  }
  
  if (result.errors.length > 0) {
    lines.push("\nErrores encontrados:");
    result.errors.forEach(error => {
      lines.push(`- ${error.title}: ${error.error}`);
    });
  }
  
  return lines.join("\n");
}

/**
 * Verifica el estado de Meet en una lista de eventos
 */
export function analyzeMeetStatus(events: GoogleCalendarEvent[]) {
  const withMeet = events.filter(event => hasMeetEnabled(event));
  const withoutMeet = events.filter(event => !hasMeetEnabled(event));
  
  return {
    total: events.length,
    withMeet: withMeet.length,
    withoutMeet: withoutMeet.length,
    percentage: events.length > 0 ? (withMeet.length / events.length) * 100 : 0,
    meetIds: withMeet.map(event => {
      const meetInfo = getMeetInfo(event);
      return {
        eventId: event.id,
        eventTitle: event.summary,
        meetId: meetInfo?.meetId,
        meetUrl: meetInfo?.meetUrl
      };
    })
  };
}