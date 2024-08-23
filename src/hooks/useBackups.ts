"use client";

import { useState, useCallback } from "react";
import {
  HoldedContactsCurrentBackup,
  HoldedContactsDailyBackup,
  HoldedContactsMonthlyBackup,
  HoldedContactsFavoriteBackup,
  HoldedContactsBackupType,
} from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useBackupStore } from "../stores/backupStore";

type BackupData =
  | HoldedContactsCurrentBackup
  | HoldedContactsDailyBackup[]
  | HoldedContactsMonthlyBackup[]
  | HoldedContactsFavoriteBackup[];

interface ToggleFavoriteResponse {
  message: string;
  newFavoriteId?: string;
  originalId?: string;
}

const fetchBackups = async (
  type: HoldedContactsBackupType
): Promise<BackupData> => {
  const response = await fetch(
    `/api/vendor/holded/contacts/backups/${type.toLowerCase()}`
  );
  if (!response.ok) throw new Error("Failed to fetch backups");
  return response.json();
};

export function useBackups(type: HoldedContactsBackupType) {
  const [loadingBackupId, setLoadingBackupId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { isCreatingBackup, setIsCreatingBackup } = useBackupStore();

  const {
    data: backups,
    isLoading,
    error,
  } = useQuery<BackupData, Error>(["backups", type], () => fetchBackups(type), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: favoriteBackups = [] } = useQuery<
    HoldedContactsFavoriteBackup[],
    Error
  >(
    ["backups", "FAVORITE"],
    () => fetchBackups("FAVORITE") as Promise<HoldedContactsFavoriteBackup[]>,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const createOrUpdateMutation = useMutation(
    async () => {
      const response = await fetch(
        `/api/vendor/holded/contacts/backups/${type.toLowerCase()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // Send an empty object if no data is needed
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create or update backup");
      }

      return response.json();
    },
    {
      onMutate: () => setIsCreatingBackup(type),
      onSettled: () => setIsCreatingBackup(null),
      onSuccess: () => {
        queryClient.invalidateQueries(["backups", type]);
      },
      onError: (error) => {
        console.error("Error creating or updating backup:", error);
      },
    }
  );
  
  const toggleFavoriteMutation = useMutation<
    ToggleFavoriteResponse,
    Error,
    string
  >(
    async (backupId: string) => {
      const response = await fetch(
        "/api/vendor/holded/contacts/backups/favorite",
        {
          method: "POST",
          body: JSON.stringify({ backupId, originalType: type }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      return response.json();
    },
    {
      onMutate: (backupId) => setLoadingBackupId(backupId),
      onSettled: () => setLoadingBackupId(null),
      onSuccess: (data, backupId) => {
        queryClient.invalidateQueries(["backups", "FAVORITE"]);
        queryClient.invalidateQueries(["backups", type]);

        queryClient.setQueryData(["backups", type], (oldData: any) => {
          return oldData.map((backup: any) =>
            backup.id === backupId
              ? { ...backup, isFavorite: !backup.isFavorite }
              : backup
          );
        });
      },
    }
  );

  const deleteBackupMutation = useMutation(
    (backupId: string) =>
      fetch(
        `/api/vendor/holded/contacts/backups/${type.toLowerCase()}/${backupId}`,
        {
          method: "DELETE",
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to delete backup");
        return res.json();
      }),
    {
      onMutate: (backupId) => setLoadingBackupId(backupId),
      onSettled: () => setLoadingBackupId(null),
      onSuccess: () => {
        queryClient.invalidateQueries(["backups", type]);
      },
    }
  );

  const isFavorite = useCallback(
    (backupId: string) => {
      const favorites = queryClient.getQueryData(["backups", "FAVORITE"]) as
        | any[]
        | undefined;
      return favorites?.some((fav) => fav.originalId === backupId) ?? false;
    },
    [queryClient]
  );

  return {
    backups,
    favoriteBackups,
    isLoading,
    error,
    loadingBackupId,
    isCreatingBackup: isCreatingBackup === type,
    createOrUpdateBackup: () => createOrUpdateMutation.mutateAsync(),
    toggleFavorite: (backupId: string) =>
      toggleFavoriteMutation.mutateAsync(backupId),
    deleteBackup: (backupId: string) =>
      deleteBackupMutation.mutateAsync(backupId),
    isDeletingBackup: deleteBackupMutation.isLoading,
    isFavorite,
  };
}