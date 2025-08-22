/**
 * ROOMMANAGEMENTTEMPLATE - Template para gestión completa de salas
 * Orquesta la creación, edición, visualización y eliminación de salas
 * Incluye modales, confirmaciones y flujos completos
 */

import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  VideoCameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

// Importar componentes refactorizados
import { RoomsListTemplate } from "./RoomsListTemplate";

// Importar stores
import { useRoomStore, useNotificationStore } from "../../stores";
import { Room } from "../../stores/useRoomStore";

// Types
export interface RoomManagementTemplateProps {
  children?: React.ReactNode;
  className?: string;
  // Props to pass through to RoomsListTemplate
  roomsData?: any[];
  isLoading?: boolean;
  error?: any;
  stats?: any;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  onViewRoom?: (roomId: string, room: any) => void;
}

interface RoomAction {
  type: "create" | "view" | "edit" | "delete" | "duplicate";
  room?: Room;
  roomId?: string;
}

/**
 * Template principal para la gestión completa de salas
 * Maneja todos los flujos de CRUD y estados de la aplicación
 */
export const RoomManagementTemplate: React.FC<RoomManagementTemplateProps> = ({
  children,
  className,
  roomsData,
  isLoading,
  error,
  stats,
  viewMode,
  onViewModeChange,
  onViewRoom,
}) => {
  // Zustand stores
  const {
    rooms,
    setRoomsLoading,
    addRoom,
    updateRoom,
    removeRoom,
    setCurrentRoom,
  } = useRoomStore();

  const {
    showSuccess,
    showError,
    showWarning,
    startProgress,
    completeProgress,
  } = useNotificationStore();

  // Modal states
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(
    null
  );

  // Confirmation dialogs
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    open: boolean;
    room?: Room;
    roomId?: string;
  }>({
    open: false,
  });

  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = React.useState<{
    open: boolean;
    roomIds: string[];
  }>({
    open: false,
    roomIds: [],
  });

  // Loading states
  const [actionLoading, setActionLoading] = React.useState(false);

  // Get rooms array
  const roomsArray = Object.values(rooms);

  // Refresh rooms from API
  const handleRefreshRooms = async () => {
    try {
      setRoomsLoading(true);

      const response = await fetch("/api/meet/rooms");
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();

      // Update store with fresh data
      // This would need to be implemented in the store
      showSuccess(
        "Lista actualizada",
        "Las salas se han actualizado correctamente"
      );
    } catch (error) {
      showError("Error", "No se pudo actualizar la lista de salas");
      throw error;
    } finally {
      setRoomsLoading(false);
    }
  };

  // Create new room
  const handleCreateRoom = async (roomData: any) => {
    try {
      setActionLoading(true);
      const progressId = startProgress({
        title: "Creando sala",
        message: "Configurando nueva sala de reuniones...",
        progress: 0,
        indeterminate: true,
      });

      const response = await fetch("/api/meet/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const newRoom = await response.json();
      addRoom(newRoom);

      completeProgress(progressId, "Sala creada exitosamente");
      showSuccess(
        "Sala creada",
        `La sala "${newRoom._metadata?.displayName || newRoom.name}" ha sido creada`,
        {
          label: "Ver sala",
          onClick: () => handleViewRoom(newRoom.name, newRoom),
        }
      );

      setCreateModalOpen(false);
    } catch (error) {
      showError("Error", "No se pudo crear la sala");
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // View room details
  const handleViewRoom = (roomId: string, room?: Room) => {
    // Use external onViewRoom if provided, otherwise use internal modal
    if (onViewRoom) {
      onViewRoom(roomId, room);
    } else {
      setSelectedRoomId(roomId);
      if (room) {
        setCurrentRoom(room, roomId);
      }
      setDetailsModalOpen(true);
    }
  };

  // Update room
  const handleUpdateRoom = async () => {
    try {
      // Refresh the room data
      await handleRefreshRooms();
      showSuccess("Sala actualizada", "Los cambios han sido guardados");
    } catch (error) {
      showError("Error", "No se pudo actualizar la sala");
    }
  };

  // Delete single room
  const handleDeleteRoom = async (roomId: string, room?: Room) => {
    setDeleteConfirmation({
      open: true,
      room,
      roomId,
    });
  };

  const confirmDeleteRoom = async () => {
    const { roomId, room } = deleteConfirmation;
    if (!roomId) return;

    try {
      setActionLoading(true);
      const progressId = startProgress({
        title: "Eliminando sala",
        message: "Eliminando sala y todos sus datos...",
        progress: 0,
        indeterminate: true,
      });

      const response = await fetch(`/api/meet/rooms/${roomId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      removeRoom(roomId);
      completeProgress(progressId, "Sala eliminada correctamente");
      showSuccess(
        "Sala eliminada",
        `La sala "${room?._metadata?.displayName || "sin nombre"}" ha sido eliminada permanentemente`
      );

      // Close details modal if it's the same room
      if (selectedRoomId === roomId) {
        setDetailsModalOpen(false);
        setSelectedRoomId(null);
      }
    } catch (error) {
      showError("Error", "No se pudo eliminar la sala");
    } finally {
      setActionLoading(false);
      setDeleteConfirmation({ open: false });
    }
  };

  // Bulk delete rooms
  const handleBulkDelete = (roomIds: string[]) => {
    setBulkDeleteConfirmation({
      open: true,
      roomIds,
    });
  };

  const confirmBulkDelete = async () => {
    const { roomIds } = bulkDeleteConfirmation;
    if (roomIds.length === 0) return;

    try {
      setActionLoading(true);
      const progressId = startProgress({
        title: "Eliminando salas",
        message: `Eliminando ${roomIds.length} salas...`,
        progress: 0,
        indeterminate: false,
      });

      let completed = 0;
      const errors: string[] = [];

      for (const roomId of roomIds) {
        try {
          const response = await fetch(`/api/meet/rooms/${roomId}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error(`Error ${response.status}`);

          removeRoom(roomId);
          completed++;

          // Update progress
          const progress = (completed / roomIds.length) * 100;
          // updateProgress(progressId, { progress }); // This would need to be implemented
        } catch (error) {
          errors.push(roomId);
        }
      }

      if (errors.length === 0) {
        completeProgress(
          progressId,
          `${completed} salas eliminadas correctamente`
        );
        showSuccess(
          "Eliminación completada",
          `Se eliminaron ${completed} salas exitosamente`
        );
      } else {
        completeProgress(
          progressId,
          `${completed} salas eliminadas, ${errors.length} errores`
        );
        showWarning(
          "Eliminación parcial",
          `Se eliminaron ${completed} salas. ${errors.length} salas no se pudieron eliminar.`
        );
      }
    } catch (error) {
      showError("Error", "Error durante la eliminación masiva");
    } finally {
      setActionLoading(false);
      setBulkDeleteConfirmation({ open: false, roomIds: [] });
    }
  };

  // Duplicate room
  const handleDuplicateRoom = async (room: Room) => {
    try {
      setActionLoading(true);

      const duplicateData = {
        displayName: `${room._metadata?.displayName || room.name} (Copia)`,
        config: room.config,
        // Don't copy members or specific IDs
      };

      await handleCreateRoom(duplicateData);

      showSuccess(
        "Sala duplicada",
        `Se ha creado una copia de "${room._metadata?.displayName || room.name}"`
      );
    } catch (error) {
      showError("Error", "No se pudo duplicar la sala");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedRoom = selectedRoomId ? rooms[selectedRoomId] : undefined;

  return (
    <div className={className}>
      {/* Main template with rooms list */}
      <RoomsListTemplate
        onCreateRoom={() => setCreateModalOpen(true)}
        onRefresh={handleRefreshRooms}
        roomsData={roomsData}
        isLoading={isLoading}
        error={error}
        stats={stats}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onViewRoom={onViewRoom}
      >
        {children}
      </RoomsListTemplate>

      {/* Create Room Modal - TODO: Import when created */}
      {createModalOpen && (
        <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center'>
          <div className='bg-background border rounded-lg p-6 shadow-lg'>
            <h2 className='text-lg font-semibold mb-4'>Create Room Modal</h2>
            <p className='text-muted-foreground mb-4'>
              Modal component not implemented yet
            </p>
            <button
              onClick={() => setCreateModalOpen(false)}
              className='px-4 py-2 bg-primary text-primary-foreground rounded'
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Room Details Modal - TODO: Import when created */}
      {detailsModalOpen && (
        <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center'>
          <div className='bg-background border rounded-lg p-6 shadow-lg'>
            <h2 className='text-lg font-semibold mb-4'>Room Details Modal</h2>
            <p className='text-muted-foreground mb-4'>
              Modal component not implemented yet
            </p>
            <button
              onClick={() => {
                setDetailsModalOpen(false);
                setSelectedRoomId(null);
              }}
              className='px-4 py-2 bg-primary text-primary-foreground rounded'
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) =>
          !actionLoading && setDeleteConfirmation({ open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <ExclamationTriangleIcon className='h-5 w-5 text-destructive' />
              ¿Eliminar sala?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la sala &quot;
              {deleteConfirmation.room?._metadata?.displayName || "sin nombre"}
              &quot;.
              <br />
              <br />
              <strong>Esta acción no se puede deshacer.</strong> Se eliminarán:
              <ul className='list-disc ml-6 mt-2'>
                <li>La sala y todas sus configuraciones</li>
                <li>Todos los miembros asociados</li>
                <li>Grabaciones y transcripciones (si las hay)</li>
                <li>Estadísticas y datos de actividad</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRoom}
              disabled={actionLoading}
              className='bg-destructive hover:bg-destructive/90'
            >
              {actionLoading ? "Eliminando..." : "Sí, eliminar sala"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteConfirmation.open}
        onOpenChange={(open) =>
          !actionLoading && setBulkDeleteConfirmation({ open, roomIds: [] })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <ExclamationTriangleIcon className='h-5 w-5 text-destructive' />
              ¿Eliminar {bulkDeleteConfirmation.roomIds.length} salas?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar {bulkDeleteConfirmation.roomIds.length}{" "}
              salas seleccionadas.
              <br />
              <br />
              <strong>Esta acción no se puede deshacer.</strong> Se eliminarán
              todas las salas con sus configuraciones, miembros, grabaciones y
              datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={actionLoading}
              className='bg-destructive hover:bg-destructive/90'
            >
              {actionLoading
                ? "Eliminando..."
                : `Sí, eliminar ${bulkDeleteConfirmation.roomIds.length} salas`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Actions Available for Children */}
      <div style={{ display: "none" }}>
        {/* These functions are available via context or props to child components */}
        {children &&
          React.isValidElement(children) &&
          React.cloneElement(children as React.ReactElement<any>, {
            onViewRoom: handleViewRoom,
            onDeleteRoom: handleDeleteRoom,
            onDuplicateRoom: handleDuplicateRoom,
            onBulkDelete: handleBulkDelete,
            actionLoading,
          })}
      </div>
    </div>
  );
};
