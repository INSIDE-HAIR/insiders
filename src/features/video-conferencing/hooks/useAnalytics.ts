/**
 * React Query hooks for Video Conferencing Analytics API
 */
import { useQuery, useMutation } from "react-query";
import { useSession } from "next-auth/react";
import {
  MeetingAnalytics,
  ParticipantAnalytics,
  CohortAnalytics,
  VideoProvider,
  ExportRequest,
  DownloadToken,
} from "../types/video-conferencing";

// API functions
const fetchMeetingAnalytics = async (filters: {
  videoSpaceId?: string;
  dateFrom?: string;
  dateTo?: string;
  provider?: VideoProvider;
}): Promise<MeetingAnalytics> => {
  const searchParams = new URLSearchParams();

  if (filters.videoSpaceId)
    searchParams.set("videoSpaceId", filters.videoSpaceId);
  if (filters.dateFrom) searchParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) searchParams.set("dateTo", filters.dateTo);
  if (filters.provider) searchParams.set("provider", filters.provider);

  const response = await fetch(
    `/api/video-conferencing/analytics/meetings?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch meeting analytics: ${response.statusText}`
    );
  }

  return response.json();
};

const fetchParticipantAnalytics = async (filters: {
  videoSpaceId?: string;
  dateFrom?: string;
  dateTo?: string;
  provider?: VideoProvider;
}): Promise<ParticipantAnalytics> => {
  const searchParams = new URLSearchParams();

  if (filters.videoSpaceId)
    searchParams.set("videoSpaceId", filters.videoSpaceId);
  if (filters.dateFrom) searchParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) searchParams.set("dateTo", filters.dateTo);
  if (filters.provider) searchParams.set("provider", filters.provider);

  const response = await fetch(
    `/api/video-conferencing/analytics/participants?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch participant analytics: ${response.statusText}`
    );
  }

  return response.json();
};

const fetchCohortAnalytics = async (filters: {
  dateFrom?: string;
  dateTo?: string;
  provider?: VideoProvider;
}): Promise<CohortAnalytics> => {
  const searchParams = new URLSearchParams();

  if (filters.dateFrom) searchParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) searchParams.set("dateTo", filters.dateTo);
  if (filters.provider) searchParams.set("provider", filters.provider);

  const response = await fetch(
    `/api/video-conferencing/analytics/cohorts?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch cohort analytics: ${response.statusText}`);
  }

  return response.json();
};

const exportAnalytics = async (
  request: ExportRequest
): Promise<DownloadToken> => {
  const response = await fetch("/api/video-conferencing/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to export analytics");
  }

  return response.json();
};

const fetchVideoSpaceAnalytics = async (
  videoSpaceId: string
): Promise<MeetingAnalytics> => {
  const response = await fetch(
    `/api/video-conferencing/spaces/${videoSpaceId}/analytics`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch video space analytics: ${response.statusText}`
    );
  }

  return response.json();
};

// Query keys
export const analyticsKeys = {
  all: ["analytics"] as const,
  meetings: (filters: any) =>
    [...analyticsKeys.all, "meetings", filters] as const,
  participants: (filters: any) =>
    [...analyticsKeys.all, "participants", filters] as const,
  cohorts: (filters: any) =>
    [...analyticsKeys.all, "cohorts", filters] as const,
  videoSpace: (id: string) => [...analyticsKeys.all, "videoSpace", id] as const,
};

// Hooks
export const useMeetingAnalytics = (
  filters: {
    videoSpaceId?: string;
    dateFrom?: string;
    dateTo?: string;
    provider?: VideoProvider;
  } = {}
) => {
  const { data: session } = useSession();

  return useQuery(
    analyticsKeys.meetings(filters),
    () => fetchMeetingAnalytics(filters),
    {
      enabled: !!session?.user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useParticipantAnalytics = (
  filters: {
    videoSpaceId?: string;
    dateFrom?: string;
    dateTo?: string;
    provider?: VideoProvider;
  } = {}
) => {
  const { data: session } = useSession();

  return useQuery(
    analyticsKeys.participants(filters),
    () => fetchParticipantAnalytics(filters),
    {
      enabled: !!session?.user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useCohortAnalytics = (
  filters: {
    dateFrom?: string;
    dateTo?: string;
    provider?: VideoProvider;
  } = {}
) => {
  const { data: session } = useSession();

  return useQuery(
    analyticsKeys.cohorts(filters),
    () => fetchCohortAnalytics(filters),
    {
      enabled: !!session?.user,
      staleTime: 10 * 60 * 1000, // 10 minutes (cohort data changes less frequently)
    }
  );
};

export const useVideoSpaceAnalytics = (videoSpaceId: string) => {
  const { data: session } = useSession();

  return useQuery(
    analyticsKeys.videoSpace(videoSpaceId),
    () => fetchVideoSpaceAnalytics(videoSpaceId),
    {
      enabled: !!session?.user && !!videoSpaceId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useExportAnalytics = () => {
  return useMutation(exportAnalytics, {
    onSuccess: (data) => {
      // Automatically download the file
      window.open(data.downloadUrl, "_blank");
    },
  });
};

// Derived hooks for common use cases
export const useOverallStats = () => {
  const meetingAnalytics = useMeetingAnalytics();
  const participantAnalytics = useParticipantAnalytics();

  return {
    isLoading: meetingAnalytics.isLoading || participantAnalytics.isLoading,
    error: meetingAnalytics.error || participantAnalytics.error,
    data: {
      meetings: meetingAnalytics.data,
      participants: participantAnalytics.data,
    },
  };
};

export const useProviderComparison = () => {
  const { data: session } = useSession();

  return useQuery(
    ["analytics", "provider-comparison"],
    async () => {
      const response = await fetch(
        "/api/video-conferencing/analytics/provider-comparison"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch provider comparison");
      }
      return response.json();
    },
    {
      enabled: !!session?.user,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export const useRealtimeStats = () => {
  const { data: session } = useSession();

  return useQuery(
    ["analytics", "realtime"],
    async () => {
      const response = await fetch(
        "/api/video-conferencing/analytics/realtime"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch realtime stats");
      }
      return response.json();
    },
    {
      enabled: !!session?.user,
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
      staleTime: 0, // Always consider stale for real-time data
    }
  );
};
