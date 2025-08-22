import { useState, useCallback } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface RoomSettings {
  accessType: "OPEN" | "TRUSTED" | "RESTRICTED";
  entryPointAccess: "ALL" | "CREATOR_APP_ONLY";
  moderation: "ON" | "OFF";
  moderationRestrictions?: {
    chatRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
    reactionRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
    presentRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
    defaultJoinAsViewerType: "ON" | "OFF";
  };
  artifactConfig?: {
    recordingConfig?: { autoRecordingGeneration: "ON" | "OFF" };
    transcriptionConfig?: { autoTranscriptionGeneration: "ON" | "OFF" };
    smartNotesConfig?: { autoSmartNotesGeneration: "ON" | "OFF" };
  };
  attendanceReportGenerationType?: "GENERATE_REPORT" | "DO_NOT_GENERATE";
}

/**
 * Hook para manejar las configuraciones de una sala existente
 * Incluye fetching, updates y cache con Tanstack Query
 */
export const useRoomSettings = (roomId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["room-settings", roomId],
    queryFn: async () => {
      if (!roomId) throw new Error("Room ID is required");

      const response = await fetch(`/api/meet/rooms/${roomId}/settings`);
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }

      const data = await response.json();
      return data.settings as RoomSettings;
    },
    enabled: !!roomId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update individual setting
  const updateSettingMutation = useMutation({
    mutationFn: async (newSettings: Partial<RoomSettings>) => {
      if (!roomId) throw new Error("Room ID is required");

      const response = await fetch(`/api/meet/rooms/${roomId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update settings");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(["room-settings", roomId], data.settings);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["room-details", roomId] });

      toast({
        title: "Configuración actualizada",
        description: "Los cambios han sido guardados",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Convenience methods for specific settings
  const updateAccessType = useCallback(
    (accessType: RoomSettings["accessType"]) => {
      updateSettingMutation.mutate({ accessType });
    },
    [updateSettingMutation]
  );

  const updateModeration = useCallback(
    (enabled: boolean) => {
      updateSettingMutation.mutate({
        moderation: enabled ? "ON" : "OFF",
      });
    },
    [updateSettingMutation]
  );

  const updateModerationRestriction = useCallback(
    (
      restriction: keyof NonNullable<RoomSettings["moderationRestrictions"]>,
      value: string | boolean
    ) => {
      updateSettingMutation.mutate({
        moderationRestrictions: {
          [restriction]: value,
        } as NonNullable<RoomSettings["moderationRestrictions"]>,
      });
    },
    [updateSettingMutation]
  );

  const updateArtifactSetting = useCallback(
    (
      artifact: "recording" | "transcription" | "smartNotes",
      enabled: boolean
    ) => {
      const settingMap = {
        recording: {
          artifactConfig: {
            recordingConfig: {
              autoRecordingGeneration: enabled ? "ON" : "OFF",
            },
          },
        },
        transcription: {
          artifactConfig: {
            transcriptionConfig: {
              autoTranscriptionGeneration: enabled ? "ON" : "OFF",
            },
          },
        },
        smartNotes: {
          artifactConfig: {
            smartNotesConfig: {
              autoSmartNotesGeneration: enabled ? "ON" : "OFF",
            },
          },
        },
      };

      updateSettingMutation.mutate(
        settingMap[artifact] as Partial<RoomSettings>
      );
    },
    [updateSettingMutation]
  );

  const updateEntryPointAccess = useCallback(
    (restricted: boolean) => {
      updateSettingMutation.mutate({
        entryPointAccess: restricted ? "CREATOR_APP_ONLY" : "ALL",
      });
    },
    [updateSettingMutation]
  );

  // Bulk update
  const updateMultipleSettings = useCallback(
    (settings: Partial<RoomSettings>) => {
      updateSettingMutation.mutate(settings);
    },
    [updateSettingMutation]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaultSettings: Partial<RoomSettings> = {
      accessType: "TRUSTED",
      entryPointAccess: "ALL",
      moderation: "OFF",
      moderationRestrictions: {
        chatRestriction: "NO_RESTRICTION",
        reactionRestriction: "NO_RESTRICTION",
        presentRestriction: "NO_RESTRICTION",
        defaultJoinAsViewerType: "OFF",
      },
      artifactConfig: {
        recordingConfig: { autoRecordingGeneration: "OFF" },
        transcriptionConfig: { autoTranscriptionGeneration: "OFF" },
        smartNotesConfig: { autoSmartNotesGeneration: "OFF" },
      },
      attendanceReportGenerationType: "DO_NOT_GENERATE",
    };

    updateSettingMutation.mutate(defaultSettings);
  }, [updateSettingMutation]);

  // Derived state
  const isModificationEnabled = settings?.moderation === "ON";
  const isRecordingEnabled =
    settings?.artifactConfig?.recordingConfig?.autoRecordingGeneration === "ON";
  const isTranscriptionEnabled =
    settings?.artifactConfig?.transcriptionConfig
      ?.autoTranscriptionGeneration === "ON";
  const isSmartNotesEnabled =
    settings?.artifactConfig?.smartNotesConfig?.autoSmartNotesGeneration ===
    "ON";
  const isEntryPointRestricted =
    settings?.entryPointAccess === "CREATOR_APP_ONLY";

  return {
    // Data
    settings,
    isLoading,
    error,

    // Derived state
    isModificationEnabled,
    isRecordingEnabled,
    isTranscriptionEnabled,
    isSmartNotesEnabled,
    isEntryPointRestricted,

    // Actions
    updateAccessType,
    updateModeration,
    updateModerationRestriction,
    updateArtifactSetting,
    updateEntryPointAccess,
    updateMultipleSettings,
    resetToDefaults,
    refetch,

    // Loading states
    isUpdating: updateSettingMutation.isPending,
    updateError: updateSettingMutation.error,
  };
};
