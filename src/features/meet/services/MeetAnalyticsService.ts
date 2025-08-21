import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { MeetMembersService } from "./MeetMembersService";

export interface ParticipantAnalytics {
  // Miembros Permanentes
  permanentMembers: {
    total: number;
    cohosts: number;
    regularMembers: number;
  };
  
  // Participantes Históricos (desde Activity)
  participants: {
    invited: number;           // signedinUser
    uninvited: number;         // anonymousUser + phoneUser
    unique: number;            // total únicos
  };
  
  // Métricas de Sesiones
  sessions: {
    total: number;             // número total de sesiones/reuniones
    totalDurationMinutes: number; // duración total en minutos
    averageDurationMinutes: number; // duración promedio por sesión
    averageParticipantsPerSession: number; // media de participantes por sesión
  };
  
  // Actividad Reciente
  recentActivity?: {
    lastMeetingDate: string | null;
    lastParticipantCount: number;
    daysSinceLastMeeting: number | null;
  };
}

export class MeetAnalyticsService {
  constructor() {
    // Ya no necesitamos servicios aquí, usaremos el endpoint interno
  }

  /**
   * Obtiene analytics completos para una sala específica
   * Utiliza el endpoint interno /api/meet/rooms/[id]/analytics
   */
  async getRoomAnalytics(spaceId: string): Promise<ParticipantAnalytics> {
    try {
      console.log(`📊 Getting analytics for space ${spaceId} via internal endpoint`);
      
      // Hacer llamada al endpoint interno de analytics
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meet/rooms/${spaceId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ Analytics endpoint failed for ${spaceId}: ${response.status}`);
        return this.getEmptyAnalytics();
      }

      const analyticsData = await response.json();
      
      return {
        permanentMembers: analyticsData.permanentMembers || { total: 0, cohosts: 0, regularMembers: 0 },
        participants: analyticsData.participants || { invited: 0, uninvited: 0, unique: 0 },
        sessions: analyticsData.sessions || { 
          total: 0, 
          totalDurationMinutes: 0, 
          averageDurationMinutes: 0, 
          averageParticipantsPerSession: 0 
        },
        recentActivity: analyticsData.recentActivity
      };
      
    } catch (error) {
      console.error(`❌ Failed to get analytics for space ${spaceId}:`, error);
      return this.getEmptyAnalytics();
    }
  }

  private getEmptyAnalytics(): ParticipantAnalytics {
    return {
      permanentMembers: { total: 0, cohosts: 0, regularMembers: 0 },
      participants: { invited: 0, uninvited: 0, unique: 0 },
      sessions: { 
        total: 0, 
        totalDurationMinutes: 0, 
        averageDurationMinutes: 0, 
        averageParticipantsPerSession: 0 
      }
    };
  }


  /**
   * Obtiene analytics para múltiples salas (batch)
   */
  async getBatchRoomAnalytics(spaceIds: string[]): Promise<{ [spaceId: string]: ParticipantAnalytics }> {
    const results: { [spaceId: string]: ParticipantAnalytics } = {};

    // Procesar en paralelo pero con límite para no sobrecargar la API
    const batchSize = 5;
    for (let i = 0; i < spaceIds.length; i += batchSize) {
      const batch = spaceIds.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (spaceId) => {
          const analytics = await this.getRoomAnalytics(spaceId);
          return { spaceId, analytics };
        })
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results[result.value.spaceId] = result.value.analytics;
        }
      }

      // Pequeña pausa entre batches para no sobrecargar la API
      if (i + batchSize < spaceIds.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  }
}