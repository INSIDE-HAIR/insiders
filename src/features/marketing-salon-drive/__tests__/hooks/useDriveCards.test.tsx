import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDriveCards } from "../../hooks/useDriveCards";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock fetch API
global.fetch = vi.fn();

// Mock response data
const mockApiResponse = {
  success: true,
  data: {
    sidebar: [
      {
        id: "sidebar-insiders",
        name: "insiders",
        type: "sidebar-item",
        content: {
          tabs: [
            {
              id: "tab-insiders-principal",
              name: "Principal",
              type: "main",
              content: {
                files: [
                  {
                    id: "file1",
                    name: "Test File.jpg",
                    mimeType: "image/jpeg",
                    webViewLink: "https://example.com/file1",
                    transformedUrl: {
                      preview: "https://example.com/preview/file1",
                      imgEmbed: "https://example.com/embed/file1",
                      download: "https://example.com/download/file1",
                    },
                    category: "image",
                  },
                ],
                subTabs: [],
                groups: [],
              },
            },
          ],
        },
      },
    ],
    metadata: {
      year: "2023",
      campaign: "january",
      client: "insiders",
      totalFiles: 1,
      lastUpdated: "2023-01-01T00:00:00.000Z",
      categoryStats: {
        image: 1,
      },
    },
  },
};

// Create wrapper for react-query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDriveCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch drive cards successfully", async () => {
    // Mock successful response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    // Render the hook
    const { result } = renderHook(
      () => useDriveCards("2023", "january", "insiders"),
      {
        wrapper: createWrapper(),
      }
    );

    // Initially should be in loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the data is correctly returned
    expect(result.current.data).toEqual(mockApiResponse);
    expect(result.current.data?.success).toBe(true);
    expect(result.current.data?.data.sidebar.length).toBe(1);
    expect(result.current.data?.data.metadata.totalFiles).toBe(1);

    // Verify the correct URL was called
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/marketing-salon-drive/2023/january/insiders/cards"
    );
  });

  it("should handle errors gracefully", async () => {
    // Mock error response
    const errorMessage = "Carpeta no encontrada";
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    // Render the hook
    const { result } = renderHook(
      () => useDriveCards("2023", "invalid", "invalid"),
      {
        wrapper: createWrapper(),
      }
    );

    // Wait for the query to fail
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify error state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeDefined();
    expect((result.current.error as Error).message).toBe(errorMessage);
  });

  it("should use correct URL without client parameter", async () => {
    // Mock successful response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    // Render the hook without client parameter
    renderHook(() => useDriveCards("2023", "january"), {
      wrapper: createWrapper(),
    });

    // Verify the correct URL was called (without client)
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/marketing-salon-drive/2023/january/cards"
    );
  });
});
