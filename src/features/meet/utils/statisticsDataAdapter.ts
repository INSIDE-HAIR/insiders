import { StatisticsApiResponse, SessionDetailData, ParticipationStatsData } from '../hooks/useStatisticsData';
import { StatsOverviewData } from '../components/molecules/overview/StatsOverview';
import { ParticipantRankingData } from '../components/molecules/cards/ParticipantRankingCard';

// Tipo expandido para el ranking con datos detallados
export interface EnhancedParticipantRankingData extends Omit<ParticipantRankingData, 'recentSessions'> {
  recentSessions: string[];
  detailedData: {
    sessionDetails: SessionDetailData[];
    participationStats: ParticipationStatsData;
  };
}

/**
 * Adapta los datos de la API de analytics a la estructura esperada por StatsOverview
 */
export const adaptStatsOverviewData = (apiData: StatisticsApiResponse): StatsOverviewData => {
  return {
    uniqueParticipants: apiData.participants.unique,
    totalRecords: apiData.sessions.total,
    analyzedMeetings: apiData.sessions.total // Todas las sesiones están analizadas
  };
};

/**
 * Adapta los datos de ranking de participantes reales de la API
 */
export const adaptParticipantRankingData = (apiData: StatisticsApiResponse): EnhancedParticipantRankingData[] => {
  // Usar los datos reales de participantRanking del API
  if (apiData.participantRanking && apiData.participantRanking.length > 0) {
    console.log('📊 Using real participant ranking data:', apiData.participantRanking.length, 'participants');
    
    return apiData.participantRanking.map((participant) => {
      // Mapear el tipo de usuario
      const typeMapping = {
        'signed_in': 'Autenticado' as const,
        'anonymous': 'Anónimo' as const,
        'phone': 'Teléfono' as const
      };

      const formattedLastActivity = participant.lastActivity 
        ? new Date(participant.lastActivity).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Sin fecha';

      const formattedLastAccess = participant.lastActivity 
        ? new Date(participant.lastActivity).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : 'Desconocido';

      // Calcular porcentaje de participación real usando los porcentajes individuales de cada sesión
      // Si tenemos sessionDetails con participationPercentage, calcular el promedio ponderado
      let participationPercentage = 100;
      
      if (participant.sessionDetails && participant.sessionDetails.length > 0) {
        const totalWeightedPercentage = participant.sessionDetails.reduce((sum, session) => {
          return sum + (session.participationPercentage * session.durationMinutes);
        }, 0);
        const totalDuration = participant.sessionDetails.reduce((sum, session) => {
          return sum + session.durationMinutes;
        }, 0);
        
        if (totalDuration > 0) {
          participationPercentage = Math.round(totalWeightedPercentage / totalDuration);
        }
      } else {
        // Fallback: usar el cálculo anterior si no hay sessionDetails
        const totalPossibleMinutes = participant.sessionsCount * (apiData.sessions.averageDurationSeconds / 60 || 60);
        participationPercentage = totalPossibleMinutes > 0 
          ? Math.min(100, Math.round((participant.totalMinutes / totalPossibleMinutes) * 100))
          : 100;
      }

      return {
        rank: participant.rank,
        name: participant.participant.name,
        totalMinutes: participant.totalMinutes,
        totalMinutesFormatted: participant.totalMinutesFormatted || `${participant.totalMinutes.toFixed(2)} min`,
        totalMeetings: participant.sessionsCount,
        participation: `${participationPercentage}%`,
        avgPerSession: participant.averageMinutesPerSessionFormatted || `${participant.averageMinutesPerSession} min`,
        type: typeMapping[participant.participant.type] || 'Autenticado',
        
        // 🆕 COMPATIBILIDAD HACIA ATRÁS - Mantener recentSessions para componentes legacy
        recentSessions: [
          `${formattedLastActivity}`,
          `${participant.sessionsCount} sesiones totales`,
          `Promedio: ${participant.averageMinutesPerSessionFormatted || 'N/A'}/sesión`,
          `Total: ${participant.totalMinutesFormatted || 'N/A'}`,
          `Último acceso: ${formattedLastAccess}`
        ],
        
        // 🆕 DATOS ESTRUCTURADOS PARA NUEVA UI
        statsData: {
          totalSessions: `${participant.sessionsCount} sesiones totales`,
          avgPerSession: participant.averageMinutesPerSessionFormatted || 'N/A',
          totalTime: participant.totalMinutesFormatted || 'N/A',
          lastAccess: formattedLastAccess,
          email: participant.participant.email,
          uniqueDays: participant.participationStats?.uniqueDays || 0
        },
        
        sessionBreakdown: {
          sessions: participant.sessionDetails?.map(session => ({
            formattedStartTime: session.formattedStartTime,
            durationFormatted: session.durationFormatted || `${session.durationMinutes} min`,
            dayOfWeek: session.dayOfWeek
          })) || [],
          detailedStats: {
            longestSession: participant.participationStats?.longestSessionFormatted || 'N/A',
            shortestSession: participant.participationStats?.shortestSessionFormatted || 'N/A',
            avgPerSession: participant.participationStats?.averageSessionDurationFormatted || 'N/A',
            totalTime: participant.participationStats?.totalMinutesFormatted || 'N/A'
          }
        },
        
        // 🆕 DATOS DETALLADOS PARA USO PROGRAMÁTICO
        detailedData: {
          sessionDetails: participant.sessionDetails || [],
          participationStats: participant.participationStats || {
            totalSessionsInSpace: participant.sessionsCount,
            longestSession: 0,
            shortestSession: 0,
            averageSessionDuration: participant.averageMinutesPerSession,
            firstParticipation: participant.lastActivity,
            lastParticipation: participant.lastActivity,
            uniqueDays: 1,
            timePatterns: { morning: 0, afternoon: 0, evening: 0, night: 0 }
          }
        }
      };
    });
  }

  // Fallback: si no hay datos reales, mostrar mensaje informativo
  return [{
    rank: 1,
    name: 'Sin datos de participantes',
    totalMinutes: 0,
    totalMeetings: 0,
    participation: "0%",
    avgPerSession: "0 min",
    type: 'Autenticado',
    recentSessions: [
      'No hay actividad reciente',
      'Sin sesiones registradas',
      'Sin promedio disponible',
      'Sin fecha de acceso'
    ],
    detailedData: {
      sessionDetails: [],
      participationStats: {
        totalSessionsInSpace: 0,
        longestSession: 0,
        shortestSession: 0,
        averageSessionDuration: 0,
        firstParticipation: undefined,
        lastParticipation: undefined,
        uniqueDays: 0,
        timePatterns: { morning: 0, afternoon: 0, evening: 0, night: 0 },
        // 🆕 Formatos HH:MM:SS para el fallback
        longestSessionFormatted: "00:00:00",
        shortestSessionFormatted: "00:00:00",
        averageSessionDurationFormatted: "00:00:00",
        totalMinutesFormatted: "00:00:00"
      }
    }
  }];
};

/**
 * Adapta todos los datos de estadísticas de la API
 */
export const adaptStatisticsData = (apiData: StatisticsApiResponse) => {
  return {
    general: adaptStatsOverviewData(apiData),
    ranking: adaptParticipantRankingData(apiData)
  };
};