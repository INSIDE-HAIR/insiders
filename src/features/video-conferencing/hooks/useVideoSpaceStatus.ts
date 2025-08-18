import { useQuery, useQueryClient } from "@tanstack/react-query";
import { VideoSpaceStatus } from "@prisma/client";
import { useEffect, useRef } from "react";

interface VideoSpaceStatusData {
  id: string;
  status: VideoSpaceStatus;
  lastChecked: string;
  participantCount?: number;
  isLive?: boolean;
  error?: string;
}

// Hook to get real-time status of a video space
export const useVideoSpaceStatus = (videoSpaceId: string) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const query = useQuery({
    queryKey: ["videoSpaceStatus", videoSpaceId],
    queryFn: async (): Promise<VideoSpaceStatusData> => {
      const response = await fetch(`/api/video-spaces/${videoSpaceId}/status`);

      if (!response.ok) {
        throw new Error("Failed to fetch video space status");
      }

      return response.json();
    },
    enabled: !!videoSpaceId,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Set up real-time polling when component mounts
  useEffect(() => {
    if (!videoSpaceId) return;

    // Start polling every 15 seconds for active status updates
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["videoSpaceStatus", videoSpaceId],
      });
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoSpaceId, queryClient]);

  return {
    status: query.data?.status,
    participantCount: query.data?.participantCount,
    isLive: query.data?.isLive,
    lastChecked: query.data?.lastChecked,
    error: query.data?.error,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// Hook to get status for multiple video spaces
export const useVideoSpacesStatus = (videoSpaceIds: string[]) => {
  return useQuery({
    queryKey: ["videoSpacesStatus", videoSpaceIds],
    queryFn: async (): Promise<Record<string, VideoSpaceStatusData>> => {
      if (videoSpaceIds.length === 0) return {};

      const response = await fetch("/api/video-spaces/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoSpaceIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch video spaces status");
      }

      return response.json();
    },
    enabled: videoSpaceIds.length > 0,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
};

// Hook for WebSocket-based real-time status updates
export const useVideoSpaceStatusWebSocket = (videoSpaceId: string) => {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!videoSpaceId) return;

    // Create WebSocket connection for real-time updates
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/video-spaces/${videoSpaceId}/status/ws`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`WebSocket connected for video space ${videoSpaceId}`);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const statusUpdate: VideoSpaceStatusData = JSON.parse(event.data);

          // Update the query cache with new status
          queryClient.setQueryData(
            ["videoSpaceStatus", videoSpaceId],
            statusUpdate
          );

          // Also update the video space cache if it exists
          queryClient.setQueryData(
            ["videoSpace", videoSpaceId],
            (oldData: any) => {
              if (oldData) {
                return {
                  ...oldData,
                  status: statusUpdate.status,
                  lastActivity: statusUpdate.lastChecked,
                  participantCount: statusUpdate.participantCount,
                };
              }
              return oldData;
            }
          );
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      wsRef.current.onclose = () => {
        console.log(`WebSocket disconnected for video space ${videoSpaceId}`);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [videoSpaceId, queryClient]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect: () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    },
  };
};

// Hook to manually refresh status
export const useRefreshVideoSpaceStatus = () => {
  const queryClient = useQueryClient();

  return {
    refreshStatus: async (videoSpaceId: string) => {
      await queryClient.invalidateQueries({
        queryKey: ["videoSpaceStatus", videoSpaceId],
      });
    },
    refreshAllStatuses: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["videoSpaceStatus"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["videoSpacesStatus"],
      });
    },
  };
};
