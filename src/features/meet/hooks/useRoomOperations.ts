import { useCallback, useState } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { toast } from "sonner";

// Reutilizar tipos existentes
import type { RoomFormState } from "./useRoomForm";

export interface Room {
  name?: string;
  spaceId?: string;
  displayName?: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: any;
  members?: any[];
  startDate?: string; // ISO string format
  endDate?: string; // ISO string format
  _metadata?: {
    displayName?: string;
    spaceId?: string;
    localId?: string;
  };
}

export interface CreateRoomConfig {
  displayName: string;
  config: any;
  initialMembers?: any[];
  startDate?: string; // ISO string format
  endDate?: string; // ISO string format
  suppressSuccessToast?: boolean; // Para evitar dobles toasts en duplicación
}

export interface RoomOperationsState {
  isLoading: boolean;
  operations: {
    create: boolean;
    duplicate: boolean;
    delete: boolean;
  };
}

/**
 * Hook para operaciones CRUD de salas (Create, Duplicate, Delete)
 * Reutiliza la API existente y mantiene consistencia con useRoomForm
 */
export const useRoomOperations = () => {
  const { toast: shadcnToast } = useToast();
  const [state, setState] = useState<RoomOperationsState>({
    isLoading: false,
    operations: {
      create: false,
      duplicate: false,
      delete: false,
    }
  });

  const setOperationLoading = useCallback((operation: keyof RoomOperationsState['operations'], loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading ? true : Object.values({ ...prev.operations, [operation]: loading }).some(Boolean),
      operations: {
        ...prev.operations,
        [operation]: loading
      }
    }));
  }, []);

  /**
   * Crear nueva sala
   * Reutiliza API POST /api/meet/rooms existente
   */
  const createRoom = useCallback(async (config: CreateRoomConfig) => {
    setOperationLoading('create', true);
    
    // Debug: Verificar qué se está enviando a la API
    console.log('🔍 DEBUG createRoom: Enviando a API:', JSON.stringify(config, null, 2));
    
    const loadingToast = shadcnToast({
      title: "Creando sala...",
      description: `${config.displayName}`,
    });

    try {
      const response = await fetch('/api/meet/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const createdRoom = await response.json();
      
      // Success toast con Sonner (solo si no está suprimido)
      if (!config.suppressSuccessToast) {
        toast.success("Sala creada exitosamente", {
          description: `${config.displayName} está lista para usar`,
          duration: 4000,
          action: {
            label: "Cerrar",
            onClick: () => {},
          },
        });
      }

      return createdRoom;

    } catch (error: any) {
      console.error('Error creating room:', error);
      
      // Error toast con Sonner
      toast.error("Error al crear sala", {
        description: error.message || "No se pudo crear la sala. Intenta nuevamente.",
        duration: 6000,
      });
      
      throw error;
    } finally {
      setOperationLoading('create', false);
    }
  }, [shadcnToast, setOperationLoading]);

  /**
   * Duplicar sala existente
   * Extrae configuración de la sala original y usa API create
   */
  const duplicateRoom = useCallback(async (originalRoom: Room) => {
    setOperationLoading('duplicate', true);
    
    const originalName = originalRoom._metadata?.displayName || originalRoom.displayName || 'Sala sin nombre';
    const duplicateName = `${originalName} - Copia`;
    
    const loadingToast = shadcnToast({
      title: "Duplicando sala...",
      description: `Creando "${duplicateName}"`,
    });

    try {
      // Debug: Verificar estructura de la sala original
      console.log('🔍 DEBUG: Sala original completa:', originalRoom);
      console.log('🔍 DEBUG: Miembros originales:', originalRoom.members);
      
      // Extraer configuración completa de la sala original usando extractRoomData
      const extractedData = extractRoomData(originalRoom);
      
      const duplicateConfig: CreateRoomConfig = {
        displayName: duplicateName,
        config: originalRoom.config || {
          accessType: "TRUSTED",
          moderation: "OFF"
        },
        // Duplicar todos los miembros preservando roles y información completa
        initialMembers: originalRoom.members || [],
        // Duplicar fechas opcionales
        startDate: originalRoom.startDate,
        endDate: originalRoom.endDate,
        // Suprimir toast de createRoom para mostrar el específico de duplicación
        suppressSuccessToast: true
      };

      // Debug: Verificar qué se está enviando a la API
      console.log('🔍 DEBUG: Configuración a enviar:', duplicateConfig);

      // Agregar toast informativo sobre miembros duplicados
      if (originalRoom.members && originalRoom.members.length > 0) {
        const memberCount = originalRoom.members.length;
        const coHostCount = originalRoom.members.filter(m => m.role === 'CO_HOST').length;
        const regularCount = memberCount - coHostCount;
        
        console.log(`🔄 Duplicando ${memberCount} miembros: ${coHostCount} co-hosts, ${regularCount} participantes`);
        console.log('🔍 DEBUG: Detalles de miembros:', originalRoom.members);
      } else {
        console.log('⚠️ ADVERTENCIA: No hay miembros para duplicar');
      }

      // Reutilizar mismo método create
      const duplicatedRoom = await createRoom(duplicateConfig);
      
      // Toast específico para duplicación exitosa con información de miembros
      if (originalRoom.members && originalRoom.members.length > 0) {
        const memberCount = originalRoom.members.length;
        const coHostCount = originalRoom.members.filter(m => m.role === 'CO_HOST').length;
        const regularCount = memberCount - coHostCount;
        
        toast.success("Sala duplicada exitosamente", {
          description: `"${duplicateName}" creada con ${memberCount} miembros (${coHostCount} co-hosts, ${regularCount} participantes)`,
          duration: 5000,
          action: {
            label: "Cerrar",
            onClick: () => {},
          },
        });
      } else {
        toast.success("Sala duplicada exitosamente", {
          description: `"${duplicateName}" creada sin miembros`,
          duration: 4000,
          action: {
            label: "Cerrar", 
            onClick: () => {},
          },
        });
      }
      
      return duplicatedRoom;

    } catch (error: any) {
      console.error('Error duplicating room:', error);
      
      // Error toast con Sonner
      toast.error("Error al duplicar sala", {
        description: `No se pudo duplicar "${originalName}". Intenta nuevamente.`,
        duration: 6000,
      });
      
      throw error;
    } finally {
      setOperationLoading('duplicate', false);
    }
  }, [createRoom, shadcnToast, setOperationLoading]);

  /**
   * Eliminar sala de la base de datos
   * Usa API DELETE existente /api/meet/rooms/[id]/delete-from-db
   */
  const deleteRoom = useCallback(async (spaceId: string, roomName: string) => {
    setOperationLoading('delete', true);
    
    // Loading toast con shadcn
    const loadingToast = shadcnToast({
      title: "Eliminando sala...",
      description: `Removiendo "${roomName}" de la base de datos`,
    });

    try {
      const response = await fetch(`/api/meet/rooms/${spaceId}/delete-from-db`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Success toast con Sonner
      toast.success("Sala eliminada exitosamente", {
        description: `"${roomName}" fue removida de la base de datos`,
        duration: 4000,
        action: {
          label: "Cerrar",
          onClick: () => {},
        },
      });

      return result;

    } catch (error: any) {
      console.error('Error deleting room:', error);
      
      // Error toast con Sonner
      toast.error("Error al eliminar sala", {
        description: `No se pudo eliminar "${roomName}". Intenta nuevamente.`,
        duration: 6000,
      });
      
      throw error;
    } finally {
      setOperationLoading('delete', false);
    }
  }, [shadcnToast, setOperationLoading]);

  /**
   * Extraer datos de una sala para duplicación
   * Convierte Room a RoomFormState para reutilizar en CreateRoomModal
   */
  const extractRoomData = useCallback((room: Room): Partial<RoomFormState> => {
    console.log('🔍 DEBUG extractRoomData: Input room:', room);
    console.log('🔍 DEBUG extractRoomData: room.members:', room.members);
    
    const config = room.config || {};
    const moderationRestrictions = config.moderationRestrictions || {};
    const artifactConfig = config.artifactConfig || {};

    const extractedData = {
      displayName: `${room._metadata?.displayName || room.displayName || 'Sala sin nombre'} - Copia`,
      accessType: config.accessType || "TRUSTED",
      restrictEntryPoints: config.entryPointAccess === "CREATOR_APP_ONLY",
      moderation: config.moderation === "ON",
      chatRestriction: moderationRestrictions.chatRestriction || "NO_RESTRICTION",
      reactionRestriction: moderationRestrictions.reactionRestriction || "NO_RESTRICTION", 
      presentRestriction: moderationRestrictions.presentRestriction || "NO_RESTRICTION",
      defaultJoinAsViewer: moderationRestrictions.defaultJoinAsViewerType === "ON",
      autoRecording: artifactConfig.recordingConfig?.autoRecordingGeneration === "ON",
      autoTranscription: artifactConfig.transcriptionConfig?.autoTranscriptionGeneration === "ON",
      autoSmartNotes: artifactConfig.smartNotesConfig?.autoSmartNotesGeneration === "ON",
      members: room.members || [],
      // Incluir fechas opcionales para duplicación
      startDate: room.startDate,
      endDate: room.endDate
    };
    
    console.log('🔍 DEBUG extractRoomData: Output data:', extractedData);
    console.log('🔍 DEBUG extractRoomData: Extracted members:', extractedData.members);
    
    return extractedData;
  }, []);

  return {
    // Estado
    isLoading: state.isLoading,
    operations: state.operations,
    
    // Métodos principales
    createRoom,
    duplicateRoom,
    deleteRoom,
    
    // Utilidades
    extractRoomData,
  };
};