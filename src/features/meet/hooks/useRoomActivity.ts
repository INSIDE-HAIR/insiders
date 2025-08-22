import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

export interface ConferenceRecord {
  name: string;
  startTime: string;
  endTime?: string;
  participantCount?: number;
  duration?: number;
}

export interface Recording {
  name: string;
  driveDestination?: {
    file?: string;
    exportUri?: string;
  };
  startTime: string;
  endTime?: string;
}

export interface Transcript {
  name: string;
  driveDestination?: {
    file?: string;
    exportUri?: string;
  };
  startTime: string;
  endTime?: string;
}

export interface ParticipantSession {
  user?: {
    displayName?: string;
    email?: string;
  };
  earliestStartTime?: string;
  latestEndTime?: string;
  durationSeconds?: number;
}

export interface ActivityData {
  conferenceRecords: ConferenceRecord[];
  recordings: Recording[];
  transcripts: Transcript[];
  participantsSessions: ParticipantSession[];
  smartNotes: any[];
}

export interface ActivityFilters {
  dateRange: {
    from?: Date;
    to?: Date;
  };
  participantFilter: string;
  activityType:
    | "all"
    | "conferences"
    | "recordings"
    | "transcripts"
    | "participants"
    | "smart-notes";
}

/**
 * Hook para manejar la actividad de una sala
 * Incluye conferencias, grabaciones, transcripciones y participantes
 */
export const useRoomActivity = (roomId?: string) => {
  const [filters, setFilters] = useState<ActivityFilters>({
    dateRange: {},
    participantFilter: "",
    activityType: "all",
  });

  // Fetch activity data
  const {
    data: activityData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["room-activity", roomId, filters],
    queryFn: async () => {
      if (!roomId) throw new Error("Room ID is required");

      const searchParams = new URLSearchParams();

      if (filters.dateRange.from) {
        searchParams.set("startTime", filters.dateRange.from.toISOString());
      }
      if (filters.dateRange.to) {
        searchParams.set("endTime", filters.dateRange.to.toISOString());
      }
      if (filters.participantFilter) {
        searchParams.set("participant", filters.participantFilter);
      }
      if (filters.activityType !== "all") {
        searchParams.set("type", filters.activityType);
      }

      const response = await fetch(
        `/api/meet/rooms/${roomId}/activity?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch activity: ${response.status}`);
      }

      const data = await response.json();
      return data as ActivityData;
    },
    enabled: !!roomId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter actions
  const setDateRange = useCallback((from?: Date, to?: Date) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { from, to },
    }));
  }, []);

  const setParticipantFilter = useCallback((participant: string) => {
    setFilters((prev) => ({
      ...prev,
      participantFilter: participant,
    }));
  }, []);

  const setActivityType = useCallback(
    (type: ActivityFilters["activityType"]) => {
      setFilters((prev) => ({
        ...prev,
        activityType: type,
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: {},
      participantFilter: "",
      activityType: "all",
    });
  }, []);

  // Computed statistics
  const stats = {
    totalConferences: activityData?.conferenceRecords.length || 0,
    totalRecordings: activityData?.recordings.length || 0,
    totalTranscripts: activityData?.transcripts.length || 0,
    totalParticipants: activityData?.participantsSessions.length || 0,
    totalSmartNotes: activityData?.smartNotes.length || 0,

    // Calculated stats
    averageDuration:
      (activityData?.participantsSessions?.reduce(
        (acc, session) => acc + (session.durationSeconds || 0),
        0
      ) || 0) / Math.max(activityData?.participantsSessions?.length || 1, 1),

    mostActiveParticipant: activityData?.participantsSessions?.reduce(
      (prev, current) =>
        (prev.durationSeconds || 0) > (current.durationSeconds || 0)
          ? prev
          : current
    ),

    recentActivity: activityData?.conferenceRecords.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )[0],
  };

  // Date helpers
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Export functions
  const exportData = useCallback(
    async (format: "csv" | "json" | "pdf") => {
      if (!roomId) return;

      try {
        const response = await fetch(
          `/api/meet/rooms/${roomId}/activity/export?format=${format}`,
          { method: "POST" }
        );

        if (!response.ok) throw new Error("Export failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `room-${roomId}-activity.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Export failed:", error);
      }
    },
    [roomId]
  );

  // Real-time updates
  const startRealTimeUpdates = useCallback(() => {
    // TODO: Implement WebSocket or polling for real-time updates
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    // Data
    activityData,
    isLoading,
    error,
    stats,
    filters,

    // Filter actions
    setDateRange,
    setParticipantFilter,
    setActivityType,
    clearFilters,

    // Utilities
    formatDuration,
    formatDate,
    exportData,
    startRealTimeUpdates,
    refetch,

    // Computed flags
    hasActivity: (activityData?.conferenceRecords.length || 0) > 0,
    hasRecordings: (activityData?.recordings.length || 0) > 0,
    hasTranscripts: (activityData?.transcripts.length || 0) > 0,
    hasFiltersApplied:
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.participantFilter !== "" ||
      filters.activityType !== "all",
  };
};
