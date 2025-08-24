import { useState, useCallback } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { z } from "zod";
import { CreateSpaceSchema } from "../validations/SpaceConfigSchema";
import { RoomMember } from "./useRoomMembers";
import { useRoomValidation } from "./useRoomValidation";

export interface RoomFormState {
  displayName: string;
  accessType: "OPEN" | "TRUSTED" | "RESTRICTED";
  restrictEntryPoints: boolean;
  moderation: boolean;
  chatRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
  reactionRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
  presentRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
  defaultJoinAsViewer: boolean;
  autoRecording: boolean;
  autoTranscription: boolean;
  autoSmartNotes: boolean;
  members: RoomMember[];
}

const initialState: RoomFormState = {
  displayName: "",
  accessType: "TRUSTED",
  restrictEntryPoints: false,
  moderation: false,
  chatRestriction: "NO_RESTRICTION",
  reactionRestriction: "NO_RESTRICTION",
  presentRestriction: "NO_RESTRICTION",
  defaultJoinAsViewer: false,
  autoRecording: false,
  autoTranscription: false,
  autoSmartNotes: false,
  members: [],
};

/**
 * Hook para manejar el estado y lógica del formulario de creación de salas
 */
export const useRoomForm = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState<RoomFormState>(initialState);
  const [loading, setLoading] = useState(false);
  
  // Usar validación en tiempo real
  const validation = useRoomValidation(formState);

  // Setters individuales
  const setDisplayName = useCallback((name: string) => {
    setFormState((prev) => ({ ...prev, displayName: name }));
  }, []);

  const setAccessType = useCallback((type: RoomFormState["accessType"]) => {
    setFormState((prev) => ({ ...prev, accessType: type }));
  }, []);

  const toggleModeration = useCallback(() => {
    setFormState((prev) => ({ ...prev, moderation: !prev.moderation }));
  }, []);

  const toggleRestrictEntryPoints = useCallback(() => {
    setFormState((prev) => ({ ...prev, restrictEntryPoints: !prev.restrictEntryPoints }));
  }, []);

  const toggleAutoRecording = useCallback(() => {
    setFormState((prev) => ({ ...prev, autoRecording: !prev.autoRecording }));
  }, []);

  const toggleAutoTranscription = useCallback(() => {
    setFormState((prev) => ({ ...prev, autoTranscription: !prev.autoTranscription }));
  }, []);

  const toggleAutoSmartNotes = useCallback(() => {
    setFormState((prev) => ({ ...prev, autoSmartNotes: !prev.autoSmartNotes }));
  }, []);

  const toggleDefaultJoinAsViewer = useCallback(() => {
    setFormState((prev) => ({ ...prev, defaultJoinAsViewer: !prev.defaultJoinAsViewer }));
  }, []);

  const setChatRestriction = useCallback((value: RoomFormState["chatRestriction"]) => {
    setFormState((prev) => ({ ...prev, chatRestriction: value }));
  }, []);

  const setReactionRestriction = useCallback((value: RoomFormState["reactionRestriction"]) => {
    setFormState((prev) => ({ ...prev, reactionRestriction: value }));
  }, []);

  const setPresentRestriction = useCallback((value: RoomFormState["presentRestriction"]) => {
    setFormState((prev) => ({ ...prev, presentRestriction: value }));
  }, []);

  // Manejo de miembros
  const setMembers = useCallback((members: RoomMember[]) => {
    setFormState((prev) => ({ ...prev, members }));
  }, []);

  // Construir data para API
  const buildApiData = useCallback(() => {
    const config: any = {
      accessType: formState.accessType,
      entryPointAccess: formState.restrictEntryPoints ? "CREATOR_APP_ONLY" : "ALL",
      moderation: formState.moderation ? "ON" : "OFF",
    };

    if (formState.moderation) {
      config.moderationRestrictions = {
        chatRestriction: formState.chatRestriction,
        reactionRestriction: formState.reactionRestriction,
        presentRestriction: formState.presentRestriction,
        defaultJoinAsViewerType: formState.defaultJoinAsViewer ? "ON" : "OFF",
      };
    }

    if (formState.autoRecording || formState.autoTranscription || formState.autoSmartNotes) {
      config.artifactConfig = {};
      
      if (formState.autoRecording) {
        config.artifactConfig.recordingConfig = {
          autoRecordingGeneration: "ON",
        };
      }
      
      if (formState.autoTranscription) {
        config.artifactConfig.transcriptionConfig = {
          autoTranscriptionGeneration: "ON",
        };
      }
      
      if (formState.autoSmartNotes) {
        config.artifactConfig.smartNotesConfig = {
          autoSmartNotesGeneration: "ON",
        };
      }
    }

    config.attendanceReportGenerationType = "DO_NOT_GENERATE";

    const data: any = {
      config,
      initialMembers: formState.members || [],
    };

    if (formState.displayName && formState.displayName.trim()) {
      data.displayName = formState.displayName.trim();
    }

    return data;
  }, [formState]);

  // Validar formulario
  const validate = useCallback(() => {
    if (!validation.isValid) {
      const firstError = validation.validation.errors[0];
      toast({
        title: "Error de validación",
        description: firstError?.message || "Por favor corrige los errores",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [validation, toast]);

  // Reset formulario
  const reset = useCallback(() => {
    setFormState(initialState);
  }, []);

  // Cargar datos de una sala existente (para duplicar)
  const loadFromRoom = useCallback((roomData: Partial<RoomFormState>) => {
    console.log('🔍 DEBUG loadFromRoom: Input data:', roomData);
    console.log('🔍 DEBUG loadFromRoom: Members to load:', roomData.members);
    
    const newState = {
      ...initialState,
      ...roomData
    };
    
    console.log('🔍 DEBUG loadFromRoom: New state:', newState);
    console.log('🔍 DEBUG loadFromRoom: New state members:', newState.members);
    
    setFormState(newState);
  }, []);

  return {
    formState,
    loading,
    setLoading,
    // Setters
    setDisplayName,
    setAccessType,
    toggleModeration,
    toggleRestrictEntryPoints,
    toggleAutoRecording,
    toggleAutoTranscription,
    toggleAutoSmartNotes,
    toggleDefaultJoinAsViewer,
    setChatRestriction,
    setReactionRestriction,
    setPresentRestriction,
    // Members
    setMembers,
    // Utils
    buildApiData,
    validate,
    reset,
    loadFromRoom,
    // Validation
    validation,
  };
};