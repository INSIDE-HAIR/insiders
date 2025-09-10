"use client";

/**
 * CLIENT-PAGE COMPLETAMENTE REFACTORIZADO
 * Aplicando arquitectura SOLID con todos los componentes, hooks y stores creados
 * Siguiendo principios de separación de responsabilidades y reutilización
 */

import React, { useState } from "react";
import { Toaster } from "sonner";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  VideoCameraIcon,
  UsersIcon,
  LockClosedIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// Note: RoomsListTemplate import removed as it's not used anymore
import { BulkActionsBar } from "@/src/features/meet/components/organisms/bulk/BulkActionsBar";
import { BulkSelectionControls } from "@/src/features/meet/components/molecules/bulk/BulkSelectionControls";
import { AccessTypeBadge } from "@/src/features/meet/components/atoms/badges/AccessTypeBadge";
import { RoomStatusBadge } from "@/src/features/meet/components/atoms/badges/RoomStatusBadge";
import { MemberRoleBadge } from "@/src/features/meet/components/atoms/badges/MemberRoleBadge";

// Importar hooks especializados
import { useRoomsList } from "@/src/features/meet/hooks/useRoomsList";
import { useAdvancedFilters } from "@/src/features/meet/hooks/useAdvancedFilters";
import { useRoomOperations } from "@/src/features/meet/hooks/useRoomOperations";
import { useConfirmation } from "@/src/features/meet/hooks/useConfirmation";

// Importar stores
import { useRoomStore, useNotificationStore } from "@/src/features/meet/stores";

// Importar modales
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

// Importar componentes SOLID refactorizados
import { RoomCard } from "@/src/features/meet/components/molecules/cards";
import { ConfirmationDialog } from "@/src/features/meet/components/atoms/modals/ConfirmationDialog";
import {
  JoinMeetingButton,
  CreateRoomButton,
} from "@/src/features/meet/components/atoms/buttons";
import { RoomDetailsModal } from "@/src/features/meet/components/molecules/modals/RoomDetailsModal";
import { AdvancedFiltersBar } from "@/src/features/meet/components/molecules/filters/AdvancedFiltersBar";
import { DateFilter } from "@/src/features/meet/types/room-dates.types";
import { FunnelIcon } from "@heroicons/react/24/outline";

// Types
interface MeetRoomsClientRefactoredProps {
  lang: string;
}

interface RoomAnalytics {
  permanentMembers: {
    total: number;
    cohosts: number;
    regularMembers: number;
  };
  participants: {
    invited: number;
    uninvited: number;
    unique: number;
  };
  sessions: {
    total: number;
    totalDurationSeconds: number;
    averageDurationSeconds: number;
    averageParticipantsPerSession: number;
  };
  recentActivity?: {
    lastMeetingDate: string | null;
    lastParticipantCount: number;
    daysSinceLastMeeting: number | null;
  };
}

// Funciones auxiliares movidas al componente RoomCard para reutilización

/**
 * Componente principal completamente refactorizado para gestión de salas Meet
 * Utiliza arquitectura SOLID con separación completa de responsabilidades
 */
export const MeetRoomsClientRefactored: React.FC<
  MeetRoomsClientRefactoredProps
> = ({ lang }) => {
  // Initialize advanced filters first
  const {
    filterState,
    isAdvancedMode,
    setIsAdvancedMode,
    availableOptions,
    hasActiveFilters: hasAdvancedFilters,
    activeFilterCount,
    addTag,
    removeTag,
    toggleTag,
    clearAllFilters,
    setSearchFilter,
    setDateFilter,
    setRoomStatusFilter,
    setCustomAvailabilityRange,
  } = useAdvancedFilters();

  // Then use those filters in useRoomsList
  const {
    rooms,
    totalStats,
    isLoading,
    isLoadingAnalytics,
    error,
    filters,
    viewConfig,
    selectedRoomIds,
    selectedCount,
    isAllSelected,
    isPartiallySelected,
    hasActiveFilters,
    updateFilter,
    updateDateRange,
    clearFilters,
    updateSort,
    setItemsPerPage,
    goToPage,
    toggleRoomSelection,
    selectAllRooms,
    clearSelection,
    toggleSelectAll,
    refetch,
    forceRefreshAnalytics,
  } = useRoomsList(filterState);

  // DEBUG: Log lo que recibe el componente del hook
  console.log("🎯 Progressive Loading Component State:", {
    roomsCount: rooms?.totalCount,
    roomsPaginatedCount: rooms?.paginated?.length,
    roomsWithAnalytics: rooms?.paginated?.filter((r) => r._analytics).length,
    roomsLoadingAnalytics: rooms?.paginated?.filter((r) => r._analyticsLoading)
      .length,
    isLoadingAnalytics,
    filterState,
  });

  // Store notification for feedback
  const { showInfo } = useNotificationStore();

  // Room operations hook
  const { deleteRoom } = useRoomOperations();

  // Confirmation hook
  const { showConfirmation, confirmationProps } = useConfirmation();

  // Modal state
  const [selectedRoom, setSelectedRoom] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Handle room actions
  const handleViewRoom = (roomId: string, room?: any) => {
    console.log("handleViewRoom called", roomId, room);
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  // Estado para modal de duplicación
  const [roomToDuplicate, setRoomToDuplicate] = useState<any>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const handleDuplicateRoom = (spaceId: string, room: any) => {
    // Debug: Verificar datos de la sala antes de duplicar
    console.log("🚨 DUPLICATE BUTTON CLICKED!!!");
    console.log("🚨 ROOM DATA:", room);
    console.log("🚨 ROOM MEMBERS:", room.members);

    // Limpiar estado anterior
    setRoomToDuplicate(null);
    setIsDuplicateModalOpen(false);

    // Dar tiempo para que se limpie el estado
    setTimeout(() => {
      console.log("🚨 SETTING NEW ROOM TO DUPLICATE");
      setRoomToDuplicate(room);
      setIsDuplicateModalOpen(true);
    }, 100);
  };

  const handleDeleteRoom = (spaceId: string, displayName: string) => {
    showConfirmation(
      {
        type: "delete",
        title: "Eliminar Sala",
        description:
          "Esta acción eliminará permanentemente la sala de la base de datos. No se puede deshacer.",
        itemName: displayName,
        confirmText: "Eliminar definitivamente",
      },
      async () => {
        try {
          await deleteRoom(spaceId, displayName);
          // Refetch para remover la sala de la lista
          await refetch();
        } catch (error) {
          console.error("Error deleting room:", error);
          // El error toast ya se maneja en useRoomOperations
        }
      }
    );
  };

  // Render individual room card usando componente SOLID refactorizado
  const renderRoomCard = (room: any) => {
    const spaceId = room.name?.split("/").pop() || "";
    const displayName =
      room._metadata?.displayName || room.name || "Sala sin nombre";
    const isSelected = selectedRoomIds.has(spaceId);

    return (
      <RoomCard
        key={room.name}
        room={room}
        isSelected={isSelected}
        onToggleSelection={toggleRoomSelection}
        onViewRoom={handleViewRoom}
        onDuplicateRoom={handleDuplicateRoom}
        onDeleteRoom={handleDeleteRoom}
      />
    );
  };

  return (
    <div>
      <DocHeader
        title='Salas de Meet'
        description='Gestiona tus salas de reuniones de Google Meet'
        icon={VideoCameraIcon}
      />

      <DocContent>
        {/* Botón Crear Sala */}
        <div className="flex justify-end mb-6">
          <CreateRoomButton
          onRoomCreated={(room) => {
            console.log("Nueva sala creada:", room);
            // Refetch rooms para mostrar la nueva sala
            refetch();
          }}
        />
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className='pt-6'>
          <AdvancedFiltersBar
            searchTerm={filterState.search}
            onSearchChange={setSearchFilter}
            dateFilter={filterState.dateFilter || DateFilter.ALL}
            onDateFilterChange={(dateFilter) => setDateFilter(dateFilter)}
            customStartDate={filterState.customAvailabilityRange.startDate}
            customEndDate={filterState.customAvailabilityRange.endDate}
            onCustomStartDateChange={(date) =>
              setCustomAvailabilityRange(
                date,
                filterState.customAvailabilityRange.endDate
              )
            }
            onCustomEndDateChange={(date) =>
              setCustomAvailabilityRange(
                filterState.customAvailabilityRange.startDate,
                date
              )
            }
            selectedStatuses={filterState.roomStatus}
            onStatusChange={setRoomStatusFilter}
            onClearAll={clearAllFilters}
            hasActiveFilters={hasAdvancedFilters}
            variant='full'
          />
        </CardContent>
      </Card>

      {/* Modal funcional para gestión de salas usando componentes atómicos */}

      {/* Stats Summary */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold'>{rooms.totalCount}</p>
                <p className='text-xs text-muted-foreground'>Total de Salas</p>
              </div>
              <VideoCameraIcon className='h-8 w-8 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-green-600'>
                  {
                    rooms.all.filter(
                      (room) => !!room.activeConference?.conferenceRecord
                    ).length
                  }
                </p>
                <p className='text-xs text-muted-foreground'>Activas</p>
              </div>
              <div className='h-2 w-2 bg-green-500 rounded-full animate-pulse'></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-blue-600'>
                  {
                    rooms.all.filter(
                      (room) => room.config?.accessType === "TRUSTED"
                    ).length
                  }
                </p>
                <p className='text-xs text-muted-foreground'>
                  Organizacionales
                </p>
              </div>
              <Badge variant='secondary' className='text-xs'>
                TRUSTED
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-purple-600'>
                  {rooms.paginated.length}
                </p>
                <p className='text-xs text-muted-foreground'>Mostradas</p>
              </div>
              <ChartBarIcon className='h-6 w-6 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View is always grid now */}

      {/* Bulk selection controls */}
      {rooms.totalCount > 0 && (
        <div className='mb-4'>
          <BulkSelectionControls
            totalItems={rooms.totalCount}
            currentPageItems={rooms.paginated.length}
            selectedCount={selectedCount}
            isAllSelected={isAllSelected}
            isPartiallySelected={isPartiallySelected}
            onSelectAll={toggleSelectAll}
            onSelectPage={() =>
              selectAllRooms(
                rooms.paginated
                  .map((room) => room.name?.split("/").pop())
                  .filter(Boolean)
              )
            }
            onClearSelection={clearSelection}
            filteredCount={rooms.totalCount}
            hasActiveFilters={hasActiveFilters || hasAdvancedFilters}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <span className='ml-3'>Cargando salas...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className='py-8 text-center'>
            <p className='text-destructive'>
              Error al cargar salas: {String(error)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rooms content - always grid view */}
      {!isLoading && !error && rooms.paginated.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
          {rooms.paginated.map(renderRoomCard)}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && rooms.paginated.length === 0 && (
        <Card>
          <CardContent className='py-12 text-center'>
            <VideoCameraIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              No hay salas disponibles
            </h3>
            <p className='text-muted-foreground mb-4'>
              No se encontraron salas de reuniones
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {rooms.totalPages > 1 && (
        <div className='flex items-center justify-between mt-6'>
          <div className='text-sm text-muted-foreground'>
            Página {viewConfig.currentPage} de {rooms.totalPages} • Mostrando{" "}
            {rooms.paginated.length} de {rooms.totalCount} salas
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => goToPage(viewConfig.currentPage - 1)}
              disabled={!rooms.hasPrevPage}
            >
              Anterior
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => goToPage(viewConfig.currentPage + 1)}
              disabled={!rooms.hasNextPage}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Bulk actions bar - appears when rooms are selected */}
      <BulkActionsBar
        selectedCount={selectedCount}
        selectedRoomIds={Array.from(selectedRoomIds)}
        onClearSelection={clearSelection}
        onForceRefreshAnalytics={forceRefreshAnalytics}
        onBulkAction={(action, payload) => {
          showInfo(
            "Acción Masiva",
            `Ejecutando ${action} en ${selectedCount} salas`
          );
        }}
      />

      {/* Room Details Modal - Sistema Atómico Funcional */}
      <RoomDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        room={selectedRoom}
        onUpdate={() => {
          console.log("🔄 Actualizando datos del room");
          refetch(); // Refrescar datos
        }}
        onDelete={() => {
          console.log("🗑️ Eliminando room");
          setIsModalOpen(false);
          setSelectedRoom(null);
          refetch(); // Refrescar datos
        }}
      />

      {/* Confirmation Dialog - Sistema Atómico */}
      <ConfirmationDialog {...confirmationProps} />

      {/* CreateRoom Modal para Duplicación */}
      {roomToDuplicate && (
        <CreateRoomButton
          duplicateFrom={roomToDuplicate}
          autoOpen={true}
          onRoomCreated={async (newRoom) => {
            console.log("🎉 Sala duplicada exitosamente:", newRoom);
            setRoomToDuplicate(null);
            setIsDuplicateModalOpen(false);
            // Refetch para mostrar la nueva sala
            await refetch();
          }}
          onCancel={() => {
            console.log("❌ Duplicación cancelada");
            setRoomToDuplicate(null);
            setIsDuplicateModalOpen(false);
          }}
          className='hidden' // Ocultar el botón ya que se abre automáticamente
        />
      )}

      {/* Sonner Toaster para notificaciones */}
      <Toaster position='top-right' closeButton richColors />
      </DocContent>
    </div>
  );
};

// Export default for backward compatibility
export default MeetRoomsClientRefactored;
