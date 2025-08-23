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
    if (!spaceId) {
      console.log('❌ useSessionsData: No spaceId provided');
      return;
    }

    console.log(`🎬 useSessionsData: Starting fetch for spaceId=${spaceId}`);
    setLoading(true);
    setError(null);

    try {
      console.log('🎬 useSessionsData: Calling APIs in parallel...');
      // Fetch todas las APIs en paralelo para mejor rendimiento
      const [sessionsResponse, recordingsResponse, transcriptsResponse] = await Promise.allSettled([
        fetch(`/api/meet/rooms/${spaceId}/participants-by-session`),
        fetch(`/api/meet/rooms/${spaceId}/recordings`),
        fetch(`/api/meet/rooms/${spaceId}/transcripts`)
      ]);

      console.log('🎬 useSessionsData: API responses received:', {
        sessions: sessionsResponse.status === 'fulfilled' ? sessionsResponse.value.status : 'failed',
        recordings: recordingsResponse.status === 'fulfilled' ? recordingsResponse.value.status : 'failed', 
        transcripts: transcriptsResponse.status === 'fulfilled' ? transcriptsResponse.value.status : 'failed'
      });

      // Procesar respuesta de sesiones
      let sessionsData: SessionsApiResponse;
      if (sessionsResponse.status === 'fulfilled' && sessionsResponse.value.ok) {
        sessionsData = await sessionsResponse.value.json();
        console.log('✅ useSessionsData: Sessions data received:', {
          totalSessions: sessionsData.sessions?.length || 0,
          totalUniqueParticipants: sessionsData.totalUniqueParticipants,
          spaceId: sessionsData.spaceId
        });
      } else {
        const error = sessionsResponse.status === 'fulfilled' 
          ? `HTTP ${sessionsResponse.value.status}: ${sessionsResponse.value.statusText}` 
          : 'Network error';
        console.error('❌ useSessionsData: Sessions API failed:', error);
        throw new Error(`Error al cargar datos de sesiones: ${error}`);
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
        console.log('✅ useSessionsData: Recordings data received:', {
          totalRecordings: recordingsData.totalRecordings,
          recordingsCount: recordingsData.recordings?.length || 0
        });
      } else {
        const error = recordingsResponse.status === 'fulfilled' 
          ? `HTTP ${recordingsResponse.value.status}` 
          : 'Network error';
        console.warn('⚠️ useSessionsData: Recordings API failed:', error);
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
        console.log('✅ useSessionsData: Transcripts data received:', {
          totalTranscripts: transcriptsData.totalTranscripts,
          transcriptsCount: transcriptsData.transcripts?.length || 0
        });
      } else {
        const error = transcriptsResponse.status === 'fulfilled' 
          ? `HTTP ${transcriptsResponse.value.status}` 
          : 'Network error';
        console.warn('⚠️ useSessionsData: Transcripts API failed:', error);
      }

      const result: CompleteSessionsData = {
        sessions: sessionsData,
        recordings: recordingsData,
        transcripts: transcriptsData
      };

      console.log('🎬 useSessionsData: Final result assembled:', {
        sessionsTotal: sessionsData.sessions?.length || 0,
        recordingsTotal: recordingsData.recordings?.length || 0,
        transcriptsTotal: transcriptsData.transcripts?.length || 0
      });

      setData(result);
      console.log('🎬 useSessionsData: Data set successfully');
      
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