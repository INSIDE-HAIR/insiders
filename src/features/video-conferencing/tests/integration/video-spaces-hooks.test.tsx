/**
 * Integration tests for Video Spaces React Query hooks
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useVideoSpaces,
  useCreateVideoSpace,
  useDeleteVideoSpace,
} from "../hooks/useVideoSpaces";

// Mock fetch
global.fetch = vi.fn();

// Mock session
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "user-1",
        email: "admin@test.com",
        role: "ADMIN",
      },
    },
  }),
}));

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Video Spaces Hooks Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useVideoSpaces", () => {
    it("should fetch video spaces successfully", async () => {
      const mockResponse = {
        videoSpaces: [
          {
            id: "space-1",
            title: "Test Space 1",
            description: "Test description",
            provider: "GOOGLE_MEET",
            status: "ACTIVE",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            _count: { meetingRecords: 5 },
          },
          {
            id: "space-2",
            title: "Test Space 2",
            description: "Test description 2",
            provider: "ZOOM",
            status: "SCHEDULED",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            _count: { meetingRecords: 2 },
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useVideoSpaces(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.videoSpaces).toHaveLength(2);
      expect(result.current.data?.total).toBe(2);
    });

    it("should handle filters correctly", async () => {
      const mockResponse = {
        videoSpaces: [
          {
            id: "space-1",
            title: "Google Meet Space",
            provider: "GOOGLE_MEET",
            status: "ACTIVE",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            _count: { meetingRecords: 3 },
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () =>
          useVideoSpaces({
            provider: "GOOGLE_MEET",
            status: "ACTIVE",
            search: "google",
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "provider=GOOGLE_MEET&status=ACTIVE&search=google"
        )
      );
      expect(result.current.data?.videoSpaces).toHaveLength(1);
    });

    it("should handle API errors", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useVideoSpaces(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should handle network errors", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useVideoSpaces(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useCreateVideoSpace", () => {
    it("should create video space successfully", async () => {
      const mockCreatedSpace = {
        id: "space-new",
        title: "New Test Space",
        description: "New test description",
        provider: "GOOGLE_MEET",
        status: "SCHEDULED",
        maxParticipants: 100,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedSpace,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateVideoSpace(), { wrapper });

      const formData = {
        title: "New Test Space",
        description: "New test description",
        provider: "GOOGLE_MEET" as const,
        scheduledStartTime: "2024-01-01T10:00:00Z",
        scheduledEndTime: "2024-01-01T12:00:00Z",
        maxParticipants: 100,
        integrationAccountId: "integration-1",
        settings: {
          requiresAuth: false,
          recordingEnabled: true,
          chatEnabled: true,
          screenShareEnabled: true,
          waitingRoomEnabled: false,
        },
      };

      await waitFor(async () => {
        const createdSpace = await result.current.mutateAsync(formData);
        expect(createdSpace).toEqual(mockCreatedSpace);
      });

      expect(fetch).toHaveBeenCalledWith("/api/video-conferencing/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    });

    it("should handle creation errors", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Validation error" }),
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateVideoSpace(), { wrapper });

      const formData = {
        title: "", // Invalid: empty title
        provider: "GOOGLE_MEET" as const,
        scheduledStartTime: "2024-01-01T10:00:00Z",
        scheduledEndTime: "2024-01-01T12:00:00Z",
        integrationAccountId: "integration-1",
        settings: {},
      };

      await expect(result.current.mutateAsync(formData)).rejects.toThrow();
    });
  });

  describe("useDeleteVideoSpace", () => {
    it("should delete video space successfully", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteVideoSpace(), { wrapper });

      await waitFor(async () => {
        await result.current.mutateAsync("space-1");
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/video-conferencing/spaces/space-1",
        {
          method: "DELETE",
        }
      );
    });

    it("should handle deletion errors", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Space not found" }),
      } as Response);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteVideoSpace(), { wrapper });

      await expect(
        result.current.mutateAsync("nonexistent-space")
      ).rejects.toThrow();
    });
  });

  describe("Query Invalidation", () => {
    it("should invalidate queries after successful creation", async () => {
      const mockCreatedSpace = {
        id: "space-new",
        title: "New Test Space",
        provider: "GOOGLE_MEET",
        status: "SCHEDULED",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      // Mock successful creation
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedSpace,
      } as Response);

      // Mock refetch after invalidation
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          videoSpaces: [mockCreatedSpace],
          total: 1,
          page: 1,
          limit: 20,
          hasMore: false,
        }),
      } as Response);

      const wrapper = createWrapper();

      // First, set up the list query
      const { result: listResult } = renderHook(() => useVideoSpaces(), {
        wrapper,
      });
      const { result: createResult } = renderHook(() => useCreateVideoSpace(), {
        wrapper,
      });

      // Create a new space
      const formData = {
        title: "New Test Space",
        provider: "GOOGLE_MEET" as const,
        scheduledStartTime: "2024-01-01T10:00:00Z",
        scheduledEndTime: "2024-01-01T12:00:00Z",
        integrationAccountId: "integration-1",
        settings: {},
      };

      await waitFor(async () => {
        await createResult.current.mutateAsync(formData);
      });

      // The list should be refetched automatically
      await waitFor(() => {
        expect(listResult.current.data?.videoSpaces).toContainEqual(
          expect.objectContaining({ id: "space-new" })
        );
      });
    });

    it("should invalidate queries after successful deletion", async () => {
      // Mock successful deletion
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      // Mock refetch after invalidation
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          videoSpaces: [],
          total: 0,
          page: 1,
          limit: 20,
          hasMore: false,
        }),
      } as Response);

      const wrapper = createWrapper();

      const { result: listResult } = renderHook(() => useVideoSpaces(), {
        wrapper,
      });
      const { result: deleteResult } = renderHook(() => useDeleteVideoSpace(), {
        wrapper,
      });

      // Delete a space
      await waitFor(async () => {
        await deleteResult.current.mutateAsync("space-1");
      });

      // The list should be refetched automatically
      await waitFor(() => {
        expect(listResult.current.data?.videoSpaces).toHaveLength(0);
      });
    });
  });
});
