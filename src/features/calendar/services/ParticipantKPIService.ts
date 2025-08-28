/**
 * Servicio para calcular KPIs de participantes en eventos del calendario
 */

import { GoogleCalendarEvent, AttendeeResponseStatus, EventAttendee } from '../types/calendar';
import { ParticipantKPI } from '../types/participant-kpis';

export class ParticipantKPIService {
  /**
   * Calcula los KPIs para una lista de participantes basándose en los eventos
   */
  calculateParticipantKPIs(
    events: GoogleCalendarEvent[], 
    participantEmails: string[]
  ): Record<string, ParticipantKPI> {
    const kpisMap: Record<string, ParticipantKPI> = {};
    
    // Inicializar KPIs para cada participante
    participantEmails.forEach(email => {
      kpisMap[email] = {
        email,
        displayName: undefined,
        totalEvents: 0,
        acceptedEvents: 0,
        declinedEvents: 0,
        needsActionEvents: 0,
        completedEvents: 0,
        upcomingEvents: 0,
        totalDurationMinutes: 0,
        acceptedDurationMinutes: 0,
        declinedDurationMinutes: 0,
        needsActionDurationMinutes: 0,
        completedDurationMinutes: 0,
        upcomingDurationMinutes: 0,
        participationRate: 0,
        responseRate: 0
      };
    });

    // Procesar cada evento
    const now = new Date();
    
    events.forEach(event => {
      // Ignorar eventos cancelados
      if (event.status === 'cancelled') {
        return;
      }

      // Verificar si el evento está completado
      const isCompleted = this.isEventCompleted(event, now);
      
      // Procesar attendees del evento
      if (event.attendees && Array.isArray(event.attendees)) {
        event.attendees.forEach((attendee: EventAttendee) => {
          if (!attendee.email || !participantEmails.includes(attendee.email)) {
            return;
          }

          const kpi = kpisMap[attendee.email];
          if (!kpi) return; // Safety check
          
          // Actualizar nombre si no lo tenemos
          if (!kpi.displayName && attendee.displayName) {
            kpi.displayName = attendee.displayName;
          }

          // Incrementar contador total
          kpi.totalEvents++;
          
          // Calcular duración del evento y agregar al total
          const eventDuration = this.calculateEventDuration(event);
          kpi.totalDurationMinutes += eventDuration;

          // Contar por estado de respuesta y agregar duración correspondiente
          switch (attendee.responseStatus) {
            case AttendeeResponseStatus.ACCEPTED:
              kpi.acceptedEvents++;
              kpi.acceptedDurationMinutes += eventDuration;
              break;
            case AttendeeResponseStatus.DECLINED:
              kpi.declinedEvents++;
              kpi.declinedDurationMinutes += eventDuration;
              break;
            case AttendeeResponseStatus.TENTATIVE:
              // Las tentativas las consideramos como sin respuesta definida
              kpi.needsActionEvents++;
              kpi.needsActionDurationMinutes += eventDuration;
              break;
            case AttendeeResponseStatus.NEEDS_ACTION:
              kpi.needsActionEvents++;
              kpi.needsActionDurationMinutes += eventDuration;
              break;
          }

          // Contar eventos completados vs pendientes y agregar duración correspondiente
          if (isCompleted) {
            kpi.completedEvents++;
            kpi.completedDurationMinutes += eventDuration;
          } else {
            kpi.upcomingEvents++;
            kpi.upcomingDurationMinutes += eventDuration;
          }
        });
      }
    });

    // Calcular tasas de participación y respuesta
    Object.values(kpisMap).forEach(kpi => {
      if (kpi.totalEvents > 0) {
        // Tasa de participación: eventos aceptados / total
        kpi.participationRate = Math.round((kpi.acceptedEvents / kpi.totalEvents) * 100);
        
        // Tasa de respuesta: eventos con respuesta (no needsAction) / total
        const respondedEvents = kpi.acceptedEvents + kpi.declinedEvents;
        kpi.responseRate = Math.round((respondedEvents / kpi.totalEvents) * 100);
      }
    });

    return kpisMap;
  }

  /**
   * Calcula la duración de un evento en minutos
   */
  private calculateEventDuration(event: GoogleCalendarEvent): number {
    try {
      let startTime: Date;
      let endTime: Date;

      // Obtener fecha/hora de inicio
      if (event.start?.dateTime) {
        startTime = new Date(event.start.dateTime);
      } else if (event.start?.date) {
        // Para eventos de todo el día, usar inicio del día
        startTime = new Date(event.start.date);
        startTime.setHours(0, 0, 0, 0);
      } else {
        return 0; // No se puede calcular sin fecha de inicio
      }

      // Obtener fecha/hora de fin
      if (event.end?.dateTime) {
        endTime = new Date(event.end.dateTime);
      } else if (event.end?.date) {
        // Para eventos de todo el día, usar final del día
        endTime = new Date(event.end.date);
        endTime.setHours(23, 59, 59, 999);
      } else {
        // Si no hay fecha de fin, asumir 1 hora de duración por defecto
        endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1);
      }

      // Calcular diferencia en minutos
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(0, Math.round(durationMs / (1000 * 60)));

      return durationMinutes;
    } catch (error) {
      console.error('Error calculating event duration:', error);
      return 0;
    }
  }

  /**
   * Determina si un evento ya se ha completado
   */
  private isEventCompleted(event: GoogleCalendarEvent, referenceDate: Date = new Date()): boolean {
    try {
      let eventEndTime: Date;
      
      if (event.end?.dateTime) {
        eventEndTime = new Date(event.end.dateTime);
      } else if (event.end?.date) {
        // Para eventos de todo el día, consideramos que terminan al final del día
        eventEndTime = new Date(event.end.date);
        eventEndTime.setHours(23, 59, 59, 999);
      } else {
        // Si no hay fecha de fin, usar fecha de inicio
        if (event.start?.dateTime) {
          eventEndTime = new Date(event.start.dateTime);
        } else if (event.start?.date) {
          eventEndTime = new Date(event.start.date);
          eventEndTime.setHours(23, 59, 59, 999);
        } else {
          return false;
        }
      }
      
      return eventEndTime < referenceDate;
    } catch (error) {
      console.error('Error determining if event is completed:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas agregadas de todos los participantes
   */
  getAggregatedStats(kpis: Record<string, ParticipantKPI>) {
    const participants = Object.values(kpis);
    
    if (participants.length === 0) {
      return {
        totalParticipants: 0,
        averageParticipationRate: 0,
        averageResponseRate: 0,
        totalEventsAcrossAllParticipants: 0,
        mostActiveParticipant: null,
        leastActiveParticipant: null
      };
    }

    const totalEvents = participants.reduce((sum, p) => sum + p.totalEvents, 0);
    const avgParticipation = participants.reduce((sum, p) => sum + p.participationRate, 0) / participants.length;
    const avgResponse = participants.reduce((sum, p) => sum + p.responseRate, 0) / participants.length;
    
    // Ordenar por total de eventos
    const sorted = [...participants].sort((a, b) => b.totalEvents - a.totalEvents);
    
    return {
      totalParticipants: participants.length,
      averageParticipationRate: Math.round(avgParticipation),
      averageResponseRate: Math.round(avgResponse),
      totalEventsAcrossAllParticipants: totalEvents,
      mostActiveParticipant: sorted[0],
      leastActiveParticipant: sorted[sorted.length - 1]
    };
  }
}