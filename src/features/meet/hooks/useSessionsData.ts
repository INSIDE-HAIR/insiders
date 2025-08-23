import { useState, useEffect } from 'react';
import { useToast } from '@/src/hooks/use-toast';

export interface SessionParticipant {
  name: string;
  participantId: string;
  userInfo: {
    type: 'signed_in' | 'anonymous' | 'phone' | 'unknown';
    displayName: string;
    identifier: string | null;
  };
  totalDurationMinutes: number;
  joinTime: string;
  leaveTime: string;
  sessionsCount: number;
  isStillActive: boolean;
}

export interface SessionRecord {
  conferenceRecordId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  participants: SessionParticipant[];
  participantCount: number;
  totalParticipationMinutes: number;
  averageParticipationMinutes: number;
  activeParticipants: number;
  sessionDate: string;
  sessionTime: string;
  sessionDateTime: string;
  isActive: boolean;
  hasRecording: boolean;
  hasTranscript: boolean;
}

export interface RecordingData {
  name: string;
  recordId: string;
  startTime: string;
  endTime?: string;
  state: 'STARTED' | 'ENDED' | 'FILE_GENERATED' | 'STATE_UNSPECIFIED' | string;
  duration?: number;
  conferenceRecord: string;
  conferenceRecordId: string;
  // Información específica de Google Drive
  file?: string; // Drive file ID
  exportUri?: string; // Browser link to view the recording
}

export interface TranscriptData {
  name: string;
  transcriptId: string;
  startTime: string;
  endTime?: string;
  state: 'STARTED' | 'ENDED' | 'FILE_GENERATED' | 'STATE_UNSPECIFIED' | string;
  language?: string;
  entriesPreview: Array<{
    participant?: string;
    text: string;
    startTime: string;
    endTime?: string;
    languageCode?: string;
  }>;
  totalEntries: number;
  duration?: number;
  conferenceRecord: string;
  conferenceRecordId: string;
  // Información específica de Google Docs
  document?: string; // Google Docs document ID
  exportUri?: string; // Shareable document link
}

export interface SessionsApiResponse {
  sessions: SessionRecord[];
  totalSessions: number;
  totalUniqueParticipants: number;
  spaceId: string;
  generatedAt: string;
}

export interface RecordingsApiResponse {
  recordings: RecordingData[];
  totalRecordings: number;
  spaceId: string;
  conferenceRecordsChecked: number;
}

export interface TranscriptsApiResponse {
  transcripts: TranscriptData[];
  totalTranscripts: number;
  spaceId: string;
  conferenceRecordsChecked: number;
}

export interface CompleteSessionsData {
  sessions: SessionsApiResponse;
  recordings: RecordingsApiResponse;
  transcripts: TranscriptsApiResponse;
}

export const useSessionsData = (spaceId: string | null) => {
  const [data, setData] = useState<CompleteSessionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSessionsWithMedia = async () => {
    if (!spaceId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch todas las APIs en paralelo para mejor rendimiento
      const [sessionsResponse, recordingsResponse, transcriptsResponse] = await Promise.allSettled([
        fetch(`/api/meet/rooms/${spaceId}/participants-by-session`),
        fetch(`/api/meet/rooms/${spaceId}/recordings`),
        fetch(`/api/meet/rooms/${spaceId}/transcripts`)
      ]);

      // Procesar respuesta de sesiones
      let sessionsData: SessionsApiResponse;
      if (sessionsResponse.status === 'fulfilled' && sessionsResponse.value.ok) {
        sessionsData = await sessionsResponse.value.json();
      } else {
        throw new Error('Error al cargar datos de sesiones');
      }

      // Procesar respuesta de grabaciones
      let recordingsData: RecordingsApiResponse = {
        recordings: [],
        totalRecordings: 0,
        spaceId: spaceId,
        conferenceRecordsChecked: 0
      };
      if (recordingsResponse.status === 'fulfilled' && recordingsResponse.value.ok) {
        recordingsData = await recordingsResponse.value.json();
      } else {
        console.warn('No se pudieron cargar las grabaciones');
      }

      // Procesar respuesta de transcripciones
      let transcriptsData: TranscriptsApiResponse = {
        transcripts: [],
        totalTranscripts: 0,
        spaceId: spaceId,
        conferenceRecordsChecked: 0
      };
      if (transcriptsResponse.status === 'fulfilled' && transcriptsResponse.value.ok) {
        transcriptsData = await transcriptsResponse.value.json();
      } else {
        console.warn('No se pudieron cargar las transcripciones');
      }

      const result: CompleteSessionsData = {
        sessions: sessionsData,
        recordings: recordingsData,
        transcripts: transcriptsData
      };

      setData(result);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar los datos de sesiones';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error al cargar sesiones',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (spaceId) {
      fetchSessionsWithMedia();
    }
  }, [spaceId]);

  const refetch = () => {
    fetchSessionsWithMedia();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};