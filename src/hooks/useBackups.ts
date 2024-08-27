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

// Definición del tipo de datos de Backup, que puede ser uno de varios tipos posibles
type BackupData =
  | HoldedContactsCurrentBackup
  | HoldedContactsDailyBackup[]
  | HoldedContactsMonthlyBackup[]
  | HoldedContactsFavoriteBackup[];

// Definición de la interfaz para la respuesta al alternar favoritos
interface ToggleFavoriteResponse {
  message: string;
  newFavoriteId?: string;
  originalId?: string;
}

// Función para obtener los backups de un tipo específico desde el servidor
const fetchBackups = async (
  type: HoldedContactsBackupType
): Promise<BackupData> => {
  const response = await fetch(
    `/api/vendor/holded/contacts/backups/${type.toLowerCase()}`
  );
  if (!response.ok) throw new Error("Failed to fetch backups"); // Manejo de error si la solicitud falla
  return response.json(); // Devuelve los datos como JSON
};

// Hook personalizado para manejar backups
export function useBackups(type: HoldedContactsBackupType) {
  const [loadingBackupId, setLoadingBackupId] = useState<string | null>(null); // Estado para manejar el ID del backup que se está cargando
  const [isCreatingBackup, setIsCreatingBackup] = useState(false); // Estado para manejar si se está creando un backup
  const queryClient = useQueryClient(); // Cliente de consultas para manejar el cache de react-query

  // Consulta para obtener los backups de un tipo específico
  const {
    data: backups,
    isLoading,
    error,
  } = useQuery<BackupData, Error>(["backups", type], () => fetchBackups(type), {
    staleTime: 5 * 60 * 1000, // Tiempo que los datos permanecen frescos en cache (5 minutos)
  });

  // Consulta para obtener los backups marcados como favoritos
  const { data: favoriteBackups = [] } = useQuery<
    HoldedContactsFavoriteBackup[],
    Error
  >(
    ["backups", "FAVORITE"],
    () => fetchBackups("FAVORITE") as Promise<HoldedContactsFavoriteBackup[]>,
    {
      staleTime: 5 * 60 * 1000, // Tiempo que los datos permanecen frescos en cache (5 minutos)
    }
  );

  // Mutación para crear o actualizar un backup
  const createOrUpdateMutation = useMutation(
    async () => {
      const response = await fetch(
        `/api/vendor/holded/contacts/backups/${type.toLowerCase()}`,
        {
          method: "POST", // Método POST para crear o actualizar
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // Envía un objeto vacío si no se necesitan datos
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create or update backup"); // Manejo de error si la solicitud falla
      }

      return response.json(); // Devuelve los datos como JSON
    },
    {
      onMutate: () => setIsCreatingBackup(true), // Marca que se está creando un backup
      onSettled: () => setIsCreatingBackup(false), // Restablece el estado cuando la operación termina
      onSuccess: () => {
        queryClient.invalidateQueries(["backups", type]); // Invalida las consultas para refrescar los datos
      },
      onError: (error) => {
        console.error("Error creating or updating backup:", error); // Manejo de error al crear o actualizar
      },
    }
  );

  // Mutación para alternar el estado de favorito de un backup
  const toggleFavoriteMutation = useMutation<
    ToggleFavoriteResponse,
    Error,
    string
  >(
    async (backupId: string) => {
      const response = await fetch(
        "/api/vendor/holded/contacts/backups/favorite",
        {
          method: "POST", // Método POST para alternar favorito
          body: JSON.stringify({ backupId, originalType: type }), // Envía el ID del backup y su tipo original
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle favorite"); // Manejo de error si la solicitud falla
      }

      return response.json(); // Devuelve la respuesta como JSON
    },
    {
      onMutate: (backupId) => setLoadingBackupId(backupId), // Marca el ID del backup que se está cargando
      onSettled: () => setLoadingBackupId(null), // Restablece el estado cuando la operación termina
      onSuccess: (data, backupId) => {
        queryClient.invalidateQueries(["backups", "FAVORITE"]); // Invalida las consultas de favoritos para refrescar los datos
        queryClient.invalidateQueries(["backups", type]); // Invalida las consultas de backups del tipo actual

        queryClient.setQueryData(["backups", type], (oldData: any) => {
          return oldData.map((backup: any) =>
            backup.id === backupId
              ? { ...backup, isFavorite: !backup.isFavorite } // Alterna el estado de favorito en el cache
              : backup
          );
        });
      },
    }
  );

  // Mutación para eliminar un backup
  const deleteBackupMutation = useMutation(
    (backupId: string) =>
      fetch(
        `/api/vendor/holded/contacts/backups/${type.toLowerCase()}/${backupId}`,
        {
          method: "DELETE", // Método DELETE para eliminar
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to delete backup"); // Manejo de error si la solicitud falla
        return res.json(); // Devuelve la respuesta como JSON
      }),
    {
      onMutate: (backupId) => setLoadingBackupId(backupId), // Marca el ID del backup que se está eliminando
      onSettled: () => setLoadingBackupId(null), // Restablece el estado cuando la operación termina
      onSuccess: () => {
        queryClient.invalidateQueries(["backups", type]); // Invalida las consultas para refrescar los datos
      },
    }
  );

  // Función para verificar si un backup es favorito
  const isFavorite = useCallback(
    (backupId: string) => {
      const favorites = queryClient.getQueryData(["backups", "FAVORITE"]) as
        | any[]
        | undefined;
      return favorites?.some((fav) => fav.originalId === backupId) ?? false; // Verifica si el backup está en la lista de favoritos
    },
    [queryClient]
  );

  return {
    backups, // Datos de los backups
    favoriteBackups, // Datos de los backups favoritos
    isLoading, // Estado de carga
    error, // Error en la consulta
    loadingBackupId, // ID del backup que se está cargando
    isCreatingBackup, // Estado de creación de backup
    createOrUpdateBackup: () => createOrUpdateMutation.mutateAsync(), // Función para crear o actualizar un backup
    toggleFavorite: (backupId: string) =>
      toggleFavoriteMutation.mutateAsync(backupId), // Función para alternar favorito
    deleteBackup: (backupId: string) =>
      deleteBackupMutation.mutateAsync(backupId), // Función para eliminar un backup
    isDeletingBackup: deleteBackupMutation.isLoading, // Estado de eliminación de backup
    isFavorite, // Función para verificar si un backup es favorito
  };
}
