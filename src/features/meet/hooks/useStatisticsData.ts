import { useState, useEffect } from 'react';
import { useToast } from '@/src/hooks/use-toast';
import type { AnalyticsResponse } from '@/src/features/meet/services/interfaces/GoogleMeetTypes';

export interface ParticipantMetrics {
  totalParticipants: number;
  averageParticipantsPerSession: number;
  uniqueParticipants: number;
  activeParticipants: number;
  participantTypes: {
    signed_in: number;
    anonymous: number;
    phone: number;
  };
}

export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  averageSessionDuration: number;
  totalSessionTime: number;
  averageParticipationTime: number;
}

export interface QualityMetrics {
  sessionsWithRecording: number;
  sessionsWithTranscript: number;
  qualityScore: number;
  recordingRate: number;
  transcriptionRate: number;
}

export interface RecentActivity {
  date: string;
  sessions: number;
  participants: number;
  duration: number;
}

export interface SessionDetailData {
  sessionId: string;
  startTime: string;
  formattedStartTime: string;
  durationMinutes: number;
  durationFormatted: string; // HH:MM:SS
  participationPercentage: number;
  sessionDate: string;
  dayOfWeek: string;
  timeOfDay: string;
}

export interface ParticipationStatsData {
  totalSessionsInSpace: number;
  longestSession: number;
  shortestSession: number;
  averageSessionDuration: number;
  firstParticipation?: string;
  lastParticipation?: string;
  uniqueDays: number;
  timePatterns: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  // 🆕 Formatos HH:MM:SS
  longestSessionFormatted: string;
  shortestSessionFormatted: string;
  averageSessionDurationFormatted: string;
  totalMinutesFormatted: string;
}

export interface ParticipantRankingData {
  rank: number;
  participant: {
    name: string;
    type: 'signed_in' | 'anonymous' | 'phone';
    avatar?: string;
  };
  totalMinutes: number;
  sessionsCount: number;
  averageMinutesPerSession: number;
  lastActivity: string;
}

// Estructura real que devuelve el API /analytics 
export interface AnalyticsApiResponse {
  spaceId: string;
  calculatedAt: string;
  permanentMembers: {
    total: number;
    cohosts: number;
    regularMembers: number;
  };
  participants: {
    invited: number;
    uninvited: number;
    unique: number;
  };
  sessions: {
    total: number;
    totalDurationSeconds: number;
    averageDurationSeconds: number;
    averageParticipantsPerSession: number;
  };
  recentActivity: {
    lastMeetingDate: string | null;
    lastParticipantCount: number;
    daysSinceLastMeeting: number | null;
  };
  participantRanking: Array<{
    rank: number;
    participant: {
      name: string;
      email: string;
      type: 'signed_in' | 'anonymous' | 'phone';
      isInvited: boolean;
    };
    totalMinutes: number;
    totalMinutesFormatted: string; // HH:MM:SS
    sessionsCount: number;
    averageMinutesPerSession: number;
    averageMinutesPerSessionFormatted: string; // HH:MM:SS
    lastActivity: string;
    // 🆕 Desglose detallado de sesiones
    sessionDetails: SessionDetailData[];
    // 📊 Estadísticas adicionales
    participationStats: ParticipationStatsData;
  }>;
}

// Para mantener compatibilidad, mantenemos StatisticsApiResponse como alias
export type StatisticsApiResponse = AnalyticsResponse;

export const useStatisticsData = (spaceId: string | null) => {
  const [data, setData] = useState<StatisticsApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStatistics = async () => {
    if (!spaceId) {
      console.log('❌ useStatisticsData: No spaceId provided');
      return;
    }

    console.log(`📊 useStatisticsData: Starting fetch for spaceId=${spaceId}`);
    setLoading(true);
    setError(null);

    try {
      console.log('📊 useStatisticsData: Calling analytics API...');
      const response = await fetch(`/api/meet/rooms/${spaceId}/analytics`);
      
      console.log('📊 useStatisticsData: Analytics API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: StatisticsApiResponse = await response.json();
      
      console.log('✅ useStatisticsData: Analytics data received:', {
        spaceId: result.spaceId,
        totalSessions: result.sessions?.total || 0,
        uniqueParticipants: result.participants?.unique || 0,
        permanentMembers: result.permanentMembers?.total || 0
      });
      
      setData(result);
      console.log('📊 useStatisticsData: Data set successfully');
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las estadísticas';
      console.error('❌ useStatisticsData: Error:', errorMessage);
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error al cargar estadísticas',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (spaceId) {
      fetchStatistics();
    }
  }, [spaceId]);

  const refetch = () => {
    fetchStatistics();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};