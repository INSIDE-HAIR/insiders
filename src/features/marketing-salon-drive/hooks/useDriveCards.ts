"use client";
import { useQuery } from "@tanstack/react-query";
import type { DriveFile } from "../types/drive";

interface DriveApiResponse {
  success: boolean;
  data: DriveFile[];
  metadata?: {
    folderPath: string;
    fileCount: number;
    timestamp: string;
  };
}

export function useDriveCards(year: string, campaign: string, client?: string) {
  return useQuery<DriveApiResponse>({
    queryKey: ["drive-cards", year, campaign, client],
    queryFn: async () => {
      const basePath = `/api/marketing-salon-drive/${year}/${campaign}`;
      const apiPath = client
        ? `${basePath}/${client}/cards`
        : `${basePath}/cards`;

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
