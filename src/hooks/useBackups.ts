"use client";

import { useState, useCallback } from "react";
import { HoldedContactsBackupType } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useBackupStore } from "../stores/backupStore";

type BackupData = any; // Keeping the original type definition for consistency
type ToggleFavoriteResponse = {
  message: string;
  newFavoriteId?: string;
  originalId?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const fetchBackups = async (
  type: HoldedContactsBackupType
): Promise<BackupData> => {
  const response = await fetch(
    `${API_BASE_URL}/vendor/holded/contacts/backups/${type.toLowerCase()}`
  );
  if (!response.ok) throw new Error("Failed to fetch backups");
  return response.json();
};

const createOrUpdateBackup = async (type: HoldedContactsBackupType) => {
  const response = await fetch(
    `${API_BASE_URL}/vendor/holded/contacts/backups/${type.toLowerCase()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error response:", errorText);
    throw new Error(
      `Failed to create or update backup: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
};

const toggleFavorite = async (
  backupId: string,
  type: HoldedContactsBackupType
): Promise<ToggleFavoriteResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/vendor/holded/contacts/backups/favorite`,
    {
      method: "POST",
      body: JSON.stringify({ backupId, originalType: type }),
    }
  );
  if (!response.ok) throw new Error("Failed to toggle favorite");
  return response.json();
};

const deleteBackup = async (
  type: HoldedContactsBackupType,
  backupId: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/vendor/holded/contacts/backups/${type.toLowerCase()}/${backupId}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) throw new Error("Failed to delete backup");
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
    staleTime: 5 * 60 * 1000,
  });

  const { data: favoriteBackups = [] } = useQuery<BackupData, Error>(
    ["backups", "FAVORITE"],
    () => fetchBackups("FAVORITE"),
    { staleTime: 5 * 60 * 1000 }
  );

  const createOrUpdateMutation = useMutation(() => createOrUpdateBackup(type), {
    onMutate: () => setIsCreatingBackup(type),
    onSettled: () => setIsCreatingBackup(null),
    onSuccess: () => queryClient.invalidateQueries(["backups", type]),
    onError: (error) =>
      console.error("Error creating or updating backup:", error),
  });

  const toggleFavoriteMutation = useMutation(
    (backupId: string) => toggleFavorite(backupId, type),
    {
      onMutate: (backupId) => setLoadingBackupId(backupId),
      onSettled: () => setLoadingBackupId(null),
      onSuccess: (data, backupId) => {
        queryClient.invalidateQueries(["backups", "FAVORITE"]);
        queryClient.invalidateQueries(["backups", type]);
        queryClient.setQueryData(["backups", type], (oldData: any) =>
          oldData.map((backup: any) =>
            backup.id === backupId
              ? { ...backup, isFavorite: !backup.isFavorite }
              : backup
          )
        );
      },
    }
  );

  const deleteBackupMutation = useMutation(
    (backupId: string) => deleteBackup(type, backupId),
    {
      onMutate: (backupId) => setLoadingBackupId(backupId),
      onSettled: () => setLoadingBackupId(null),
      onSuccess: () => queryClient.invalidateQueries(["backups", type]),
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
