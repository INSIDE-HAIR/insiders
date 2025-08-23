import { useState, useEffect } from 'react';
import { useToast } from '@/src/hooks/use-toast';

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

export interface StatisticsApiResponse {
  spaceId: string;
  generatedAt: string;
  metrics: {
    participants: ParticipantMetrics;
    sessions: SessionMetrics;
    quality: QualityMetrics;
  };
  recentActivity: RecentActivity[];
  participantRanking: ParticipantRankingData[];
}

export const useStatisticsData = (spaceId: string | null) => {
  const [data, setData] = useState<StatisticsApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStatistics = async () => {
    if (!spaceId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/meet/rooms/${spaceId}/analytics`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: StatisticsApiResponse = await response.json();
      setData(result);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las estadísticas';
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