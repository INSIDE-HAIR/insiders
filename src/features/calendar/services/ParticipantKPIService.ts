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

          // Contar por estado de respuesta
          switch (attendee.responseStatus) {
            case AttendeeResponseStatus.ACCEPTED:
              kpi.acceptedEvents++;
              break;
            case AttendeeResponseStatus.DECLINED:
              kpi.declinedEvents++;
              break;
            case AttendeeResponseStatus.TENTATIVE:
              // Las tentativas las consideramos como sin respuesta definida
              kpi.needsActionEvents++;
              break;
            case AttendeeResponseStatus.NEEDS_ACTION:
              kpi.needsActionEvents++;
              break;
          }

          // Contar eventos completados vs pendientes
          if (isCompleted) {
            kpi.completedEvents++;
          } else {
            kpi.upcomingEvents++;
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