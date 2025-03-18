"use client";
import { useQuery } from "@tanstack/react-query";
import type { DriveApiResponse } from "../types/drive";

export function useDriveCards(
  year: string,
  campaign: string,
  client?: string,
  folderId?: string
) {
  return useQuery<DriveApiResponse>({
    queryKey: ["drive-cards", year, campaign, client, folderId],
    queryFn: async () => {
      let apiPath: string;

      // If a direct folder ID is provided, use the folder ID endpoint
      if (folderId) {
        apiPath = `/api/marketing-salon-drive/folder/${folderId}/cards`;
      } else {
        // Use the legacy path-based endpoints
        const basePath = `/api/marketing-salon-drive/${year}/${campaign}`;
        apiPath = client ? `${basePath}/${client}/cards` : `${basePath}/cards`;
      }

      const response = await fetch(apiPath);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch drive cards");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
}
