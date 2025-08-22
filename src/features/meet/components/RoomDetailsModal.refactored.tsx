/**
 * ROOMDETAILSMODAL COMPLETAMENTE REFACTORIZADO
 * Usando todos los principios SOLID y componentes atómicos/moleculares/organismos
 * con Zustand stores y hooks especializados
 */

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import {
  VideoCameraIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Importar componentes refactorizados
import { GeneralSection } from "./organisms/sections/GeneralSection";
import { MembersSection } from "./organisms/sections/MembersSection";
import { OrganizationSection } from "./organisms/sections/OrganizationSection";
import { ActivitySection } from "./organisms/sections/ActivitySection";
import { RoomStatusBadge } from "./atoms/badges/RoomStatusBadge";

// Importar hooks especializados
import { useRoomSettings } from "../hooks/useRoomSettings";
import { useRoomActivity } from "../hooks/useRoomActivity";
import { useRoomMembers } from "../hooks/useRoomMembers";

// Importar stores
import {
  useRoomStore,
  useNotificationStore,
  useSettingsStore,
} from "../stores";

// Types
interface RoomDetailsModalRefactoredProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  onUpdate?: () => void;
  onDelete?: () => void;
}

/**
 * Modal de detalles de sala completamente refactorizado
 * Utiliza arquitectura SOLID con separación completa de responsabilidades
 */
export const RoomDetailsModalRefactored: React.FC<
  RoomDetailsModalRefactoredProps
> = ({ isOpen, onClose, roomId, onUpdate, onDelete }) => {
  // Zustand stores
  const {
    currentRoom,
    selectedTab,
    setSelectedTab,
    setCurrentRoom,
    updateRoom,
    removeRoom,
    getRoomById,
  } = useRoomStore();

  const {
    showSuccess,
    showError,
    showWarning,
    startProgress,
    completeProgress,
  } = useNotificationStore();

  const { preferences, getRoomSettings } = useSettingsStore();

  // Specialized hooks
  const {
    settings,
    isLoading: settingsLoading,
    updateAccessType,
    updateModeration,
    updateArtifactSetting,
    resetToDefaults,
    isUpdating,
  } = useRoomSettings(roomId);

  const {
    activityData,
    isLoading: activityLoading,
    stats,
    hasActivity,
    exportData,
  } = useRoomActivity(roomId);

  const { members, addMember, removeMember } = useRoomMembers([]);

  // Local state for UI
  const [mainLoading, setMainLoading] = React.useState(false);

  // Load room data when modal opens
  useEffect(() => {
    if (isOpen && roomId && !currentRoom) {
      loadRoomData();
    }
  }, [isOpen, roomId]);

  // Reset tab when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTab("general");
    }
  }, [isOpen, setSelectedTab]);

  const loadRoomData = async () => {
    if (!roomId) return;

    try {
      setMainLoading(true);

      // Try to get room from store first
      let room = getRoomById(roomId);

      // If not in store, fetch from API
      if (!room) {
        const progressId = startProgress({
          title: "Cargando sala",
          message: "Obteniendo información de la sala...",
          progress: 0,
          indeterminate: true,
        });

        const response = await fetch(`/api/meet/rooms/${roomId}`);
        if (!response.ok)
          throw new Error(`Error ${response.status}: ${response.statusText}`);

        room = await response.json();
        completeProgress(progressId, "Sala cargada correctamente");
      }

      if (room) {
        setCurrentRoom(room, roomId);
      }
    } catch (error) {
      console.error("Error loading room:", error);
      showError(
        "Error al cargar la sala",
        error instanceof Error ? error.message : "Error desconocido",
        true
      );
    } finally {
      setMainLoading(false);
    }
  };

  const handleUpdateName = async (newName: string) => {
    if (!roomId || !currentRoom) return;

    try {
      const response = await fetch(`/api/meet/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: newName }),
      });

      if (!response.ok) throw new Error("Failed to update name");

      const updatedRoom = await response.json();
      updateRoom(roomId, updatedRoom);
      showSuccess(
        "Nombre actualizado",
        "El nombre de la sala ha sido actualizado"
      );
      onUpdate?.();
    } catch (error) {
      showError("Error", "No se pudo actualizar el nombre de la sala");
      throw error;
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomId) return;

    try {
      const progressId = startProgress({
        title: "Eliminando sala",
        message: "Eliminando la sala y todos sus datos...",
        progress: 0,
        indeterminate: true,
      });

      const response = await fetch(`/api/meet/rooms/${roomId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete room");

      removeRoom(roomId);
      completeProgress(progressId, "Sala eliminada correctamente");
      showSuccess(
        "Sala eliminada",
        "La sala ha sido eliminada permanentemente"
      );
      onClose();
      onDelete?.();
    } catch (error) {
      showError("Error", "No se pudo eliminar la sala");
      throw error;
    }
  };

  const handleEndConference = async () => {
    if (!roomId || !currentRoom?.activeConference) return;

    try {
      const response = await fetch(`/api/meet/rooms/${roomId}/conference/end`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to end conference");

      updateRoom(roomId, {
        ...currentRoom,
        activeConference: undefined,
      });

      showSuccess(
        "Conferencia terminada",
        "La conferencia activa ha sido finalizada"
      );
      onUpdate?.();
    } catch (error) {
      showError("Error", "No se pudo terminar la conferencia");
      throw error;
    }
  };

  const handleUpdateOrganizationSettings = async (settings: any) => {
    showWarning(
      "Función en desarrollo",
      "La configuración organizacional estará disponible pronto"
    );
  };

  const handleViewAnalytics = () => {
    setSelectedTab("activity");
    showSuccess(
      "Analytics",
      "Revisa la sección de actividad para ver estadísticas detalladas"
    );
  };

  const handleManageIntegrations = () => {
    showWarning(
      "Función en desarrollo",
      "La gestión de integraciones estará disponible pronto"
    );
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "members":
        return members.length;
      case "activity":
        return stats.totalConferences || 0;
      default:
        return 0;
    }
  };

  if (!isOpen) return null;

  if (mainLoading || settingsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-6xl max-h-[90vh] min-h-[80vh]'>
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <span className='ml-3'>Cargando sala...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentRoom) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-2xl'>
          <Alert variant='destructive'>
            <ExclamationTriangleIcon className='h-4 w-4' />
            <AlertDescription>
              No se pudo cargar la información de la sala. Por favor, inténtalo
              de nuevo.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  const displayName =
    currentRoom._metadata?.displayName || currentRoom.name || "Sala sin nombre";
  const isActive = !!currentRoom.activeConference?.conferenceRecord;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-6xl max-h-[90vh] min-h-[80vh] max-w-[95vw] flex flex-col overflow-hidden'>
        <DialogHeader className='border-b pb-4'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1 flex-1'>
              <DialogTitle className='flex items-center gap-2 text-xl'>
                <VideoCameraIcon className='h-5 w-5 text-primary' />
                {displayName}
              </DialogTitle>
              <DialogDescription className='flex items-center gap-2'>
                <span>Detalles y configuración de la sala de reuniones</span>
                <RoomStatusBadge isActive={isActive} />
              </DialogDescription>
            </div>

            {/* Quick stats */}
            <div className='flex gap-2 text-sm'>
              <Badge variant='outline' className='flex items-center gap-1'>
                <UsersIcon className='h-3 w-3' />
                {members.length} miembros
              </Badge>
              {stats.totalConferences > 0 && (
                <Badge variant='outline' className='flex items-center gap-1'>
                  <ChartBarIcon className='h-3 w-3' />
                  {stats.totalConferences} reuniones
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Main content with tabs */}
        <div className='flex-1 min-h-0'>
          <Tabs
            value={selectedTab}
            onValueChange={(value) =>
              setSelectedTab(
                value as "members" | "general" | "organization" | "activity"
              )
            }
            className='h-full flex flex-col'
          >
            <TabsList className='grid w-full grid-cols-4 mb-4'>
              <TabsTrigger value='general' className='flex items-center gap-2'>
                <VideoCameraIcon className='h-4 w-4' />
                General
              </TabsTrigger>

              <TabsTrigger value='members' className='flex items-center gap-2'>
                <UsersIcon className='h-4 w-4' />
                Miembros
                {members.length > 0 && (
                  <Badge variant='secondary' className='ml-1 text-xs'>
                    {members.length}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value='organization'
                className='flex items-center gap-2'
              >
                <BuildingOfficeIcon className='h-4 w-4' />
                Organización
              </TabsTrigger>

              <TabsTrigger value='activity' className='flex items-center gap-2'>
                <ChartBarIcon className='h-4 w-4' />
                Actividad
                {stats.totalConferences > 0 && (
                  <Badge variant='secondary' className='ml-1 text-xs'>
                    {stats.totalConferences}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 min-h-0 overflow-hidden'>
              <TabsContent value='general' className='h-full overflow-auto'>
                <GeneralSection
                  room={currentRoom}
                  onUpdateName={handleUpdateName}
                  onDeleteRoom={handleDeleteRoom}
                  onEndConference={handleEndConference}
                  loading={isUpdating}
                />
              </TabsContent>

              <TabsContent value='members' className='h-full overflow-auto'>
                <MembersSection
                  initialMembers={members}
                  onMembersChange={(newMembers) => {
                    // Handle members change if needed
                  }}
                />
              </TabsContent>

              <TabsContent
                value='organization'
                className='h-full overflow-auto'
              >
                <OrganizationSection
                  room={currentRoom}
                  onUpdateOrganizationSettings={
                    handleUpdateOrganizationSettings
                  }
                  onViewAnalytics={handleViewAnalytics}
                  onManageIntegrations={handleManageIntegrations}
                  loading={isUpdating}
                />
              </TabsContent>

              <TabsContent value='activity' className='h-full overflow-auto'>
                <ActivitySection roomId={roomId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Connection status */}
        {preferences.notificationsEnabled && (
          <div className='flex items-center justify-between text-xs text-muted-foreground pt-2 border-t'>
            <span>
              Última sincronización: {new Date().toLocaleTimeString("es-ES")}
            </span>
            <div className='flex items-center gap-2'>
              {isUpdating && (
                <>
                  <div className='h-2 w-2 bg-yellow-500 rounded-full animate-pulse'></div>
                  <span>Guardando cambios...</span>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
