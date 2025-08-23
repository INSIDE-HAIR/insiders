import { StatisticsApiResponse } from '../hooks/useStatisticsData';
import { StatsOverviewData } from '../components/molecules/overview/StatsOverview';
import { ParticipantRankingData } from '../components/molecules/cards/ParticipantRankingCard';

/**
 * Adapta los datos de la API de analytics a la estructura esperada por StatsOverview
 */
export const adaptStatsOverviewData = (apiData: StatisticsApiResponse): StatsOverviewData => {
  return {
    uniqueParticipants: apiData.metrics.participants.uniqueParticipants,
    totalRecords: apiData.metrics.sessions.totalSessions,
    analyzedMeetings: apiData.metrics.sessions.completedSessions
  };
};

/**
 * Adapta los datos de ranking de participantes de la API
 */
export const adaptParticipantRankingData = (apiData: StatisticsApiResponse): ParticipantRankingData[] => {
  return apiData.participantRanking.map((participant) => {
    // Mapear el tipo de usuario
    const typeMapping = {
      'signed_in': 'Autenticado' as const,
      'anonymous': 'Anónimo' as const,
      'phone': 'Teléfono' as const
    };

    return {
      rank: participant.rank,
      name: participant.participant.name,
      totalMinutes: participant.totalMinutes,
      totalMeetings: participant.sessionsCount,
      participation: `${Math.round((participant.totalMinutes / (participant.sessionsCount * participant.averageMinutesPerSession || 1)) * 100)}%`,
      avgPerSession: `${participant.averageMinutesPerSession} min`,
      type: typeMapping[participant.participant.type] || 'Autenticado',
      recentSessions: [
        participant.lastActivity,
        `${participant.sessionsCount} sesiones totales`,
        `Promedio: ${participant.averageMinutesPerSession} min/sesión`,
        `Último acceso: ${participant.lastActivity}`
      ]
    };
  });
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