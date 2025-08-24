import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "../stores";

export interface BulkOperation {
  type:
    | "delete"
    | "updateAccessType"
    | "enableRecording"
    | "disableRecording"
    | "enableTranscription"
    | "disableTranscription"
    | "addTags"
    | "removeTag"
    | "moveToGroup"
    | "removeFromGroup"
    | "export"
    | "duplicate"
    | "addMembers"
    | "removeMembers"
    | "updateModerationSettings"
    | "toggleSmartNotes";
  roomIds: string[];
  payload?: any;
}

export interface BulkOperationResult {
  successful: string[];
  failed: { roomId: string; error: string }[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

export interface BulkOperationProgress {
  current: number;
  total: number;
  currentRoomId?: string;
  operation: string;
  completed: boolean;
}

/**
 * Hook especializado para operaciones masivas en salas
 * Maneja eliminación, actualización y modificación en lote con progreso
 */
export const useBulkOperations = () => {
  const queryClient = useQueryClient();
  const {
    showSuccess,
    showError,
    showWarning,
    startProgress,
    updateProgress,
    completeProgress,
  } = useNotificationStore();

  const [operationProgress, setOperationProgress] =
    useState<BulkOperationProgress | null>(null);

  // Generic bulk operation mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async (
      operation: BulkOperation
    ): Promise<BulkOperationResult> => {
      const { type, roomIds, payload } = operation;
      const results: BulkOperationResult = {
        successful: [],
        failed: [],
        totalProcessed: roomIds.length,
        successCount: 0,
        failureCount: 0,
      };

      // Start progress tracking
      const progressId = startProgress({
        title: `Operación masiva: ${getOperationLabel(type)}`,
        message: `Procesando ${roomIds.length} salas...`,
        progress: 0,
        indeterminate: false,
        canCancel: false, // Could add cancellation support later
      });

      setOperationProgress({
        current: 0,
        total: roomIds.length,
        operation: getOperationLabel(type),
        completed: false,
      });

      try {
        for (let i = 0; i < roomIds.length; i++) {
          const roomId = roomIds[i];

          setOperationProgress((prev) =>
            prev
              ? {
                  ...prev,
                  current: i + 1,
                  currentRoomId: roomId,
                }
              : null
          );

          updateProgress(progressId, {
            progress: ((i + 1) / roomIds.length) * 100,
            message: `Procesando sala ${i + 1} de ${roomIds.length}...`,
          });

          if (!roomId) continue;

          try {
            await processSingleOperation(type, roomId, payload);
            results.successful.push(roomId);
            results.successCount++;
          } catch (error) {
            results.failed.push({
              roomId,
              error: error instanceof Error ? error.message : "Unknown error",
            });
            results.failureCount++;
          }
        }

        // Complete progress
        setOperationProgress((prev) =>
          prev ? { ...prev, completed: true } : null
        );

        if (results.failureCount === 0) {
          completeProgress(
            progressId,
            `${getOperationLabel(type)} completada exitosamente`
          );
        } else if (results.successCount === 0) {
          completeProgress(
            progressId,
            `${getOperationLabel(type)} falló completamente`
          );
        } else {
          completeProgress(
            progressId,
            `${getOperationLabel(type)} completada parcialmente`
          );
        }

        return results;
      } catch (error) {
        completeProgress(progressId, "Operación cancelada por error");
        throw error;
      } finally {
        setTimeout(() => setOperationProgress(null), 2000); // Clear progress after 2s
      }
    },
    onSuccess: (result, operation) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["rooms-list"] });
      queryClient.invalidateQueries({ queryKey: ["filter-stats"] });

      const { successCount, failureCount, totalProcessed } = result;
      const operationLabel = getOperationLabel(operation.type);

      if (failureCount === 0) {
        showSuccess(
          `${operationLabel} Completada`,
          `Se procesaron ${successCount} salas exitosamente`
        );
      } else if (successCount === 0) {
        showError(
          `${operationLabel} Falló`,
          `No se pudo procesar ninguna de las ${totalProcessed} salas`
        );
      } else {
        showWarning(
          `${operationLabel} Parcial`,
          `${successCount} salas procesadas, ${failureCount} errores`
        );
      }
    },
    onError: (error: Error, operation) => {
      const operationLabel = getOperationLabel(operation.type);
      showError(
        `Error en ${operationLabel}`,
        error.message || "Error desconocido durante la operación masiva"
      );
    },
  });

  // Helper function to get operation label
  const getOperationLabel = (type: BulkOperation["type"]): string => {
    const labels: Record<BulkOperation["type"], string> = {
      delete: "Eliminación",
      updateAccessType: "Cambio de Acceso",
      enableRecording: "Habilitar Grabación",
      disableRecording: "Deshabilitar Grabación",
      enableTranscription: "Habilitar Transcripción",
      disableTranscription: "Deshabilitar Transcripción",
      addTags: "Agregar Tags",
      removeTag: "Remover Tag",
      moveToGroup: "Mover a Grupo",
      removeFromGroup: "Remover de Grupo",
      export: "Exportación",
      duplicate: "Duplicación",
      addMembers: "Agregar Miembros",
      removeMembers: "Remover Miembros",
      updateModerationSettings: "Actualizar Moderación",
      toggleSmartNotes: "Notas Inteligentes",
    };
    return labels[type] || "Operación";
  };

  // Helper function to process individual operations
  const processSingleOperation = async (
    type: BulkOperation["type"],
    roomId: string,
    payload?: any
  ) => {
    switch (type) {
      case "delete":
        const deleteResponse = await fetch(`/api/meet/rooms/${roomId}`, {
          method: "DELETE",
        });
        if (!deleteResponse.ok)
          throw new Error(`Failed to delete room ${roomId}`);
        break;

      case "updateAccessType":
        if (!payload?.accessType) throw new Error("Access type is required");
        const accessResponse = await fetch(
          `/api/meet/rooms/${roomId}/settings`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessType: payload.accessType }),
          }
        );
        if (!accessResponse.ok)
          throw new Error(`Failed to update access type for ${roomId}`);
        break;

      case "enableRecording":
        const enableRecordingResponse = await fetch(
          `/api/meet/rooms/${roomId}/settings`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recordingSettings: { autoRecordingGeneration: "ON" },
            }),
          }
        );
        if (!enableRecordingResponse.ok)
          throw new Error(`Failed to enable recording for ${roomId}`);
        break;

      case "disableRecording":
        const disableRecordingResponse = await fetch(
          `/api/meet/rooms/${roomId}/settings`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recordingSettings: { autoRecordingGeneration: "OFF" },
            }),
          }
        );
        if (!disableRecordingResponse.ok)
          throw new Error(`Failed to disable recording for ${roomId}`);
        break;

      case "enableTranscription":
        const enableTransResponse = await fetch(
          `/api/meet/rooms/${roomId}/settings`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcriptionSettings: { autoTranscriptionGeneration: "ON" },
            }),
          }
        );
        if (!enableTransResponse.ok)
          throw new Error(`Failed to enable transcription for ${roomId}`);
        break;

      case "disableTranscription":
        const disableTransResponse = await fetch(
          `/api/meet/rooms/${roomId}/settings`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcriptionSettings: { autoTranscriptionGeneration: "OFF" },
            }),
          }
        );
        if (!disableTransResponse.ok)
          throw new Error(`Failed to disable transcription for ${roomId}`);
        break;

      case "addTags":
        if (!payload?.tags || !Array.isArray(payload.tags))
          throw new Error("Tags array is required");
        const addTagsResponse = await fetch(`/api/meet/rooms/${roomId}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: payload.tags }),
        });
        if (!addTagsResponse.ok)
          throw new Error(`Failed to add tags to ${roomId}`);
        break;

      case "removeTag":
        if (!payload?.tag) throw new Error("Tag is required");
        const removeTagResponse = await fetch(
          `/api/meet/rooms/${roomId}/tags/${payload.tag}`,
          {
            method: "DELETE",
          }
        );
        if (!removeTagResponse.ok)
          throw new Error(`Failed to remove tag from ${roomId}`);
        break;

      case "moveToGroup":
        if (!payload?.groupId) throw new Error("Group ID is required");
        const moveGroupResponse = await fetch(
          `/api/meet/rooms/${roomId}/group`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId: payload.groupId }),
          }
        );
        if (!moveGroupResponse.ok)
          throw new Error(`Failed to move ${roomId} to group`);
        break;

      case "removeFromGroup":
        const removeGroupResponse = await fetch(
          `/api/meet/rooms/${roomId}/group`,
          {
            method: "DELETE",
          }
        );
        if (!removeGroupResponse.ok)
          throw new Error(`Failed to remove ${roomId} from group`);
        break;

      case "export":
        // Export is typically handled differently (client-side download)
        const exportResponse = await fetch(`/api/meet/rooms/${roomId}/export`, {
          method: "POST",
        });
        if (!exportResponse.ok) throw new Error(`Failed to export ${roomId}`);
        break;

      case "duplicate":
        const duplicateResponse = await fetch(
          `/api/meet/rooms/${roomId}/duplicate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload || {}),
          }
        );
        if (!duplicateResponse.ok)
          throw new Error(`Failed to duplicate ${roomId}`);
        break;

      case "addMembers":
        if (!payload?.members || !Array.isArray(payload.members))
          throw new Error("Members array is required");
        const addMembersResponse = await fetch(`/api/meet/rooms/${roomId}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ members: payload.members }),
        });
        if (!addMembersResponse.ok)
          throw new Error(`Failed to add members to ${roomId}`);
        break;

      case "removeMembers":
        if (!payload?.memberIds || !Array.isArray(payload.memberIds))
          throw new Error("Member IDs array is required");
        const removeMembersResponse = await fetch(`/api/meet/rooms/${roomId}/members`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberIds: payload.memberIds }),
        });
        if (!removeMembersResponse.ok)
          throw new Error(`Failed to remove members from ${roomId}`);
        break;

      case "updateModerationSettings":
        if (!payload) throw new Error("Moderation settings are required");
        const moderationResponse = await fetch(`/api/meet/rooms/${roomId}/moderation`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!moderationResponse.ok)
          throw new Error(`Failed to update moderation settings for ${roomId}`);
        break;

      case "toggleSmartNotes":
        const smartNotesResponse = await fetch(`/api/meet/rooms/${roomId}/smart-notes`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: payload?.enabled ?? true }),
        });
        if (!smartNotesResponse.ok)
          throw new Error(`Failed to toggle smart notes for ${roomId}`);
        break;

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  };

  // Convenient operation methods
  const bulkDelete = useCallback(
    (roomIds: string[]) => {
      return bulkOperationMutation.mutateAsync({
        type: "delete",
        roomIds,
      });
    },
    [bulkOperationMutation]
  );

  const bulkUpdateAccessType = useCallback(
    (roomIds: string[], accessType: string) => {
      return bulkOperationMutation.mutateAsync({
        type: "updateAccessType",
        roomIds,
        payload: { accessType },
      });
    },
    [bulkOperationMutation]
  );

  const bulkEnableRecording = useCallback(
    (roomIds: string[]) => {
      return bulkOperationMutation.mutateAsync({
        type: "enableRecording",
        roomIds,
      });
    },
    [bulkOperationMutation]
  );

  const bulkDisableRecording = useCallback(
    (roomIds: string[]) => {
      return bulkOperationMutation.mutateAsync({
        type: "disableRecording",
        roomIds,
      });
    },
    [bulkOperationMutation]
  );

  const bulkEnableTranscription = useCallback(
    (roomIds: string[]) => {
      return bulkOperationMutation.mutateAsync({
        type: "enableTranscription",
        roomIds,
      });
    },
    [bulkOperationMutation]
  );

  const bulkDisableTranscription = useCallback(
    (roomIds: string[]) => {
      return bulkOperationMutation.mutateAsync({
        type: "disableTranscription",
        roomIds,
      });
    },
    [bulkOperationMutation]
  );

  const bulkAddTags = useCallback(
    (roomIds: string[], tags: string[]) => {
      return bulkOperationMutation.mutateAsync({
        type: "addTags",
        roomIds,
        payload: { tags },
      });
    },
    [bulkOperationMutation]
  );

  const bulkRemoveTag = useCallback(
    (roomIds: string[], tag: string) => {
      return bulkOperationMutation.mutateAsync({
        type: "removeTag",
        roomIds,
        payload: { tag },
      });
    },
    [bulkOperationMutation]
  );

  const bulkMoveToGroup = useCallback(
    (roomIds: string[], groupId: string) => {
      return bulkOperationMutation.mutateAsync({
        type: "moveToGroup",
        roomIds,
        payload: { groupId },
      });
    },
    [bulkOperationMutation]
  );

  const bulkRemoveFromGroup = useCallback(
    (roomIds: string[]) => {
      return bulkOperationMutation.mutateAsync({
        type: "removeFromGroup",
        roomIds,
      });
    },
    [bulkOperationMutation]
  );

  const bulkDuplicate = useCallback(
    (
      roomIds: string[],
      options?: { prefix?: string; copyMembers?: boolean }
    ) => {
      return bulkOperationMutation.mutateAsync({
        type: "duplicate",
        roomIds,
        payload: options,
      });
    },
    [bulkOperationMutation]
  );

  const bulkAddMembers = useCallback(
    (roomIds: string[], members: any[]) => {
      return bulkOperationMutation.mutateAsync({
        type: "addMembers",
        roomIds,
        payload: { members },
      });
    },
    [bulkOperationMutation]
  );

  const bulkRemoveMembers = useCallback(
    (roomIds: string[], memberIds: string[]) => {
      return bulkOperationMutation.mutateAsync({
        type: "removeMembers",
        roomIds,
        payload: { memberIds },
      });
    },
    [bulkOperationMutation]
  );

  const bulkUpdateModerationSettings = useCallback(
    (roomIds: string[], settings: any) => {
      return bulkOperationMutation.mutateAsync({
        type: "updateModerationSettings",
        roomIds,
        payload: settings,
      });
    },
    [bulkOperationMutation]
  );

  const bulkToggleSmartNotes = useCallback(
    (roomIds: string[], enabled: boolean = true) => {
      return bulkOperationMutation.mutateAsync({
        type: "toggleSmartNotes",
        roomIds,
        payload: { enabled },
      });
    },
    [bulkOperationMutation]
  );

  return {
    // State
    operationProgress,
    isOperationLoading: bulkOperationMutation.isPending,

    // Generic operation
    executeBulkOperation: bulkOperationMutation.mutateAsync,

    // Specific operations
    bulkDelete,
    bulkUpdateAccessType,
    bulkEnableRecording,
    bulkDisableRecording,
    bulkEnableTranscription,
    bulkDisableTranscription,
    bulkAddTags,
    bulkRemoveTag,
    bulkMoveToGroup,
    bulkRemoveFromGroup,
    bulkDuplicate,
    bulkAddMembers,
    bulkRemoveMembers,
    bulkUpdateModerationSettings,
    bulkToggleSmartNotes,

    // Utilities
    getOperationLabel,
  };
};
