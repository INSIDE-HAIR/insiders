import { useState, useEffect, useCallback } from "react";
import {
  HoldedContactsCurrentBackup,
  HoldedContactsDailyBackup,
  HoldedContactsMonthlyBackup,
  HoldedContactsFavoriteBackup,
  HoldedContactsBackupType,
} from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useBackupStore } from "../stores/backupStore";
import { set } from "date-fns";

const fetchBackups = async (type: HoldedContactsBackupType) => {
  const response = await fetch(
    `/api/vendor/holded/contacts/backups/${type.toLowerCase()}`
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

const createOrUpdateBackup = async (type: HoldedContactsBackupType) => {
  const response = await fetch(
    `/api/vendor/holded/contacts/backups/${type.toLowerCase()}`,
    {
      method: "POST",
    }
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

export function useBackups(type: HoldedContactsBackupType) {
  const [currentBackup, setCurrentBackup] =
    useState<HoldedContactsCurrentBackup | null>(null);
  const [dailyBackups, setDailyBackups] = useState<HoldedContactsDailyBackup[]>(
    []
  );
  const [monthlyBackups, setMonthlyBackups] = useState<
    HoldedContactsMonthlyBackup[]
  >([]);
  const [favoriteBackups, setFavoriteBackups] = useState<
    HoldedContactsFavoriteBackup[]
  >([]);
  const [loadingBackupId, setLoadingBackupId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { isCreatingBackup, setIsCreatingBackup } = useBackupStore();
  const [deletingBackupId, setDeletingBackupId] = useState<string | null>(null);

  const deleteBackupMutation = useMutation(
    (backupId: string) => deleteBackup(backupId, type), // type se pasa aquí
    {
      onMutate: (backupId) => setDeletingBackupId(backupId),
      onSettled: () => setDeletingBackupId(null),
      onSuccess: () => {
        queryClient.invalidateQueries(["backups", type]);
        // Maneja cualquier lógica adicional si es necesario
      },
    }
  );

  const {
    data: backups,
    isLoading,
    error,
  } = useQuery(["backups", type], () => fetchBackups(type), {
    staleTime: 5 * 60 * 1000, // 5 minutos
    useErrorBoundary: false, // Esto evita que React Query lance el error automáticamente
  });

  const mutation = useMutation(() => createOrUpdateBackup(type), {
    onMutate: () => setIsCreatingBackup(type),
    onSettled: () => setIsCreatingBackup(null),
    onSuccess: (newBackup) => {
      queryClient.setQueryData(["backups", type], (old: any) =>
        type === "CURRENT" ? newBackup : [newBackup, ...(old || [])]
      );
    },
  });

  // Fetch current backup
  const fetchCurrentBackup = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/vendor/holded/contacts/backups/current"
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentBackup(data);
      } else {
        console.error("Failed to fetch current backup");
      }
    } catch (error) {
      console.error("Error fetching current backup:", error);
    }
  }, []);

  // Fetch daily backups
  const fetchDailyBackups = useCallback(async () => {
    try {
      const response = await fetch("/api/vendor/holded/contacts/backups/daily");
      if (response.ok) {
        const data = await response.json();
        setDailyBackups(data);
      } else {
        console.error("Failed to fetch daily backups");
      }
    } catch (error) {
      console.error("Error fetching daily backups:", error);
    }
  }, []);

  // Fetch monthly backups
  const fetchMonthlyBackups = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/vendor/holded/contacts/backups/monthly"
      );
      if (response.ok) {
        const data = await response.json();
        setMonthlyBackups(data);
      } else {
        console.error("Failed to fetch monthly backups");
      }
    } catch (error) {
      console.error("Error fetching monthly backups:", error);
    }
  }, []);

  // Fetch favorite backups
  const fetchFavoriteBackups = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/vendor/holded/contacts/backups/favorites"
      );
      if (response.ok) {
        console.log("Fetching favorite backups");
        const data = await response.json();
        setFavoriteBackups(data);
      } else {
        console.error("Failed to fetch favorite backups");
      }
    } catch (error) {
      console.error("Error fetching favorite backups:", error);
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (backupId: string, isFavorite: boolean) => {
      setLoadingBackupId(backupId);
      try {
        const response = await fetch(
          `/api/vendor/holded/contacts/backups/favorites`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ backupId, isFavorite }),
          }
        );

        if (response.ok) {
          // Update the backup lists after toggling favorite status
          fetchFavoriteBackups();
        } else {
          console.error("Failed to update favorite backup");
        }
      } catch (error) {
        console.error("Error updating favorite backup:", error);
      } finally {
        setLoadingBackupId(null);
      }
    },
    [fetchFavoriteBackups]
  );

  // Delete backup
  const deleteBackup = useCallback(
    async (
      backupId: string,
      type: "CURRENT" | "DAILY" | "MONTHLY" | "FAVORITE"
    ) => {
      setLoadingBackupId(backupId);
      try {
        let endpoint = "";
        switch (type) {
          case "CURRENT":
            endpoint = `/api/vendor/holded/contacts/backups/current/${backupId}`;
            break;
          case "DAILY":
            endpoint = `/api/vendor/holded/contacts/backups/daily/${backupId}`;
            break;
          case "MONTHLY":
            endpoint = `/api/vendor/holded/contacts/backups/monthly/${backupId}`;
            break;
          case "FAVORITE":
            endpoint = `/api/vendor/holded/contacts/backups/favorites/${backupId}`;
            break;
        }

        const response = await fetch(endpoint, { method: "DELETE" });

        if (response.ok) {
          // Refresh data after deletion
          switch (type) {
            case "CURRENT":
              fetchCurrentBackup();
              break;
            case "DAILY":
              fetchDailyBackups();
              break;
            case "MONTHLY":
              fetchMonthlyBackups();
              break;
            case "FAVORITE":
              fetchFavoriteBackups();
              break;
          }
        } else {
          console.error("Failed to delete backup");
        }
      } catch (error) {
        console.error("Error deleting backup:", error);
      } finally {
        setLoadingBackupId(null);
      }
    },
    [
      fetchCurrentBackup,
      fetchDailyBackups,
      fetchMonthlyBackups,
      fetchFavoriteBackups,
    ]
  );

  useEffect(() => {
    if (backups) {
      switch (type) {
        case "CURRENT":
          setCurrentBackup(backups as HoldedContactsCurrentBackup);
          break;
        case "DAILY":
          setDailyBackups(backups as HoldedContactsDailyBackup[]);
          break;
        case "MONTHLY":
          setMonthlyBackups(backups as HoldedContactsMonthlyBackup[]);
          break;
        case "FAVORITE":
          setFavoriteBackups(backups as HoldedContactsFavoriteBackup[]);
          break;
      }
    }
  }, [backups, type]);

  useEffect(() => {
    fetchCurrentBackup();
    fetchDailyBackups();
    fetchMonthlyBackups();
    fetchFavoriteBackups();
  }, [
    fetchCurrentBackup,
    fetchDailyBackups,
    fetchMonthlyBackups,
    fetchFavoriteBackups,
  ]);

  return {
    currentBackup,
    dailyBackups,
    monthlyBackups,
    favoriteBackups,
    loadingBackupId,
    isLoading,
    error: error as Error | null, // Aseguramos que error sea de tipo Error o null
    toggleFavorite,
    isCreatingBackup: isCreatingBackup === type,
    createOrUpdateBackup: () => mutation.mutate(),
    deleteBackup: deleteBackupMutation.mutate, // Modificado para que reciba solo backupId
    isDeletingBackup: (backupId: string) => deletingBackupId === backupId,
  };
}
