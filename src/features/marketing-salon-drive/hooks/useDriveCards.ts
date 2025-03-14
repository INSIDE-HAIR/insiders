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

export function useDriveCards(client: string, year: string, month: string) {
  return useQuery<DriveApiResponse>({
    queryKey: ["drive-cards", client, year, month],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketing-salon-drive/${client}/${year}/${month}/cards`
      );

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
