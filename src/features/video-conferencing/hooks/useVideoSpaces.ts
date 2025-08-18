/**
 * React Query hooks for Video Spaces API
 */
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import {
  VideoSpace,
  VideoSpacesResponse,
  VideoSpaceFormData,
  FilterOptions,
} from "../types/video-conferencing";

// API functions
const fetchVideoSpaces = async (
  filters: FilterOptions & { page?: number; limit?: number }
): Promise<VideoSpacesResponse> => {
  const searchParams = new URLSearchParams();

  if (filters.page) searchParams.set("page", filters.page.toString());
  if (filters.limit) searchParams.set("limit", filters.limit.toString());
  if (filters.provider && filters.provider !== "ALL") {
    searchParams.set("provider", filters.provider);
  }
  if (filters.status && filters.status !== "ALL") {
    searchParams.set("status", filters.status);
  }
  if (filters.search) searchParams.set("search", filters.search);

  const response = await fetch(
    `/api/video-conferencing/spaces?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch video spaces: ${response.statusText}`);
  }

  return response.json();
};

const createVideoSpace = async (
  data: VideoSpaceFormData
): Promise<VideoSpace> => {
  const response = await fetch("/api/video-conferencing/spaces", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create video space");
  }

  return response.json();
};

const updateVideoSpace = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<VideoSpaceFormData>;
}): Promise<VideoSpace> => {
  const response = await fetch(`/api/video-conferencing/spaces/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update video space");
  }

  return response.json();
};

const deleteVideoSpace = async (id: string): Promise<void> => {
  const response = await fetch(`/api/video-conferencing/spaces/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete video space");
  }
};

const fetchVideoSpace = async (id: string): Promise<VideoSpace> => {
  const response = await fetch(`/api/video-conferencing/spaces/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch video space: ${response.statusText}`);
  }

  return response.json();
};

// Query keys
export const videoSpacesKeys = {
  all: ["videoSpaces"] as const,
  lists: () => [...videoSpacesKeys.all, "list"] as const,
  list: (filters: FilterOptions & { page?: number; limit?: number }) =>
    [...videoSpacesKeys.lists(), filters] as const,
  details: () => [...videoSpacesKeys.all, "detail"] as const,
  detail: (id: string) => [...videoSpacesKeys.details(), id] as const,
};

// Hooks
export const useVideoSpaces = (
  filters: FilterOptions & { page?: number; limit?: number } = {}
) => {
  const { data: session } = useSession();

  return useQuery(
    videoSpacesKeys.list(filters),
    () => fetchVideoSpaces(filters),
    {
      enabled: !!session?.user,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
};

export const useVideoSpace = (id: string) => {
  const { data: session } = useSession();

  return useQuery(videoSpacesKeys.detail(id), () => fetchVideoSpace(id), {
    enabled: !!session?.user && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateVideoSpace = () => {
  const queryClient = useQueryClient();

  return useMutation(createVideoSpace, {
    onSuccess: () => {
      // Invalidate and refetch video spaces list
      queryClient.invalidateQueries(videoSpacesKeys.lists());
    },
  });
};

export const useUpdateVideoSpace = () => {
  const queryClient = useQueryClient();

  return useMutation(updateVideoSpace, {
    onSuccess: (data) => {
      // Update the specific video space in cache
      queryClient.setQueryData(videoSpacesKeys.detail(data.id), data);
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries(videoSpacesKeys.lists());
    },
  });
};

export const useDeleteVideoSpace = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteVideoSpace, {
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries(videoSpacesKeys.detail(deletedId));
      // Invalidate lists
      queryClient.invalidateQueries(videoSpacesKeys.lists());
    },
  });
};

// Additional hooks for specific use cases
export const useVideoSpaceStats = () => {
  const { data: session } = useSession();

  return useQuery(
    ["videoSpaces", "stats"],
    async () => {
      const response = await fetch("/api/video-conferencing/spaces/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch video space stats");
      }
      return response.json();
    },
    {
      enabled: !!session?.user,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

export const useVideoSpaceStatus = (id: string) => {
  const { data: session } = useSession();

  return useQuery(
    ["videoSpaces", id, "status"],
    async () => {
      const response = await fetch(
        `/api/video-conferencing/spaces/${id}/status`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch video space status");
      }
      return response.json();
    },
    {
      enabled: !!session?.user && !!id,
      refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time status
      staleTime: 0, // Always consider stale for real-time updates
    }
  );
};
