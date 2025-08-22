"use client";

/**
 * CLIENT-PAGE COMPLETAMENTE REFACTORIZADO
 * Aplicando arquitectura SOLID con todos los componentes, hooks y stores creados
 * Siguiendo principios de separación de responsabilidades y reutilización
 */

import React from "react";
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

// Importar templates y componentes refactorizados
import { RoomsListTemplate } from "@/src/features/meet/components/templates/RoomsListTemplate";
import { BulkActionsBar } from "@/src/features/meet/components/organisms/bulk/BulkActionsBar";
import { BulkSelectionControls } from "@/src/features/meet/components/molecules/bulk/BulkSelectionControls";
import { AccessTypeBadge } from "@/src/features/meet/components/atoms/badges/AccessTypeBadge";
import { RoomStatusBadge } from "@/src/features/meet/components/atoms/badges/RoomStatusBadge";
import { MemberRoleBadge } from "@/src/features/meet/components/atoms/badges/MemberRoleBadge";

// Importar hooks especializados
import { useRoomsList } from "@/src/features/meet/hooks/useRoomsList";
import { useAdvancedFilters } from "@/src/features/meet/hooks/useAdvancedFilters";

// Importar stores
import { useRoomStore, useNotificationStore } from "@/src/features/meet/stores";

// Importar modales
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

// Importar skeleton para analytics
import { AnalyticsSkeleton } from "@/src/features/meet/components/atoms/skeletons/AnalyticsSkeleton";

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

// Función auxiliar para formatear duración en HH:MM:SS
const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Función auxiliar para formatear días desde la última reunión
const formatDaysAgo = (days: number | null): string => {
  if (days === null) return "Nunca";
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.round(days / 7)} semanas`;
  return `Hace ${Math.round(days / 30)} meses`;
};

/**
 * Componente principal completamente refactorizado para gestión de salas Meet
 * Utiliza arquitectura SOLID con separación completa de responsabilidades
 */
export const MeetRoomsClientRefactored: React.FC<
  MeetRoomsClientRefactoredProps
> = ({ lang }) => {
  // Hooks especializados
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
    setViewMode,
    setItemsPerPage,
    goToPage,
    toggleRoomSelection,
    selectAllRooms,
    clearSelection,
    toggleSelectAll,
    refetch,
  } = useRoomsList();

  // DEBUG: Log lo que recibe el componente del hook
  console.log("🎯 Progressive Loading Component State:", {
    roomsCount: rooms?.totalCount,
    roomsPaginatedCount: rooms?.paginated?.length,
    roomsWithAnalytics: rooms?.paginated?.filter(r => r._analytics).length,
    roomsLoadingAnalytics: rooms?.paginated?.filter(r => r._analyticsLoading).length,
    isLoadingAnalytics,
  });

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
  } = useAdvancedFilters();

  // Store notification for feedback
  const { showInfo } = useNotificationStore();

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

  const handleDuplicateRoom = (room: any) => {
    showInfo(
      "Duplicar Sala",
      `Duplicando sala: ${room._metadata?.displayName || room.name}`
    );
  };

  // Render individual room card - diseño compacto como original
  const renderRoomCard = (room: any) => {
    const spaceId = room.name?.split("/").pop();
    const displayName =
      room._metadata?.displayName || room.name || "Sala sin nombre";
    const isActive = !!room.activeConference?.conferenceRecord;
    const isSelected = selectedRoomIds.has(spaceId);
    const analytics = room._analytics;
    const isLoadingAnalytics = room._analyticsLoading;

    return (
      <Card
        key={room.name}
        className={`hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-primary" : ""} bg-card`}
      >
        <CardContent className='p-4 space-y-3'>
          {/* Header with checkbox, name and status badge */}
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-2 flex-1 min-w-0'>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleRoomSelection(spaceId)}
                className='mt-0.5'
              />
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <VideoCameraIcon className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <h3 className='font-medium text-sm truncate' title={displayName}>
                  {displayName}
                </h3>
              </div>
            </div>
            <div className='flex-shrink-0'>
              <AccessTypeBadge type={room.config?.accessType || "TRUSTED"} />
            </div>
          </div>

          {/* Meeting code */}
          {room.meetingCode && (
            <div className='text-xs text-muted-foreground'>
              Código: {room.meetingCode}
            </div>
          )}

          {/* Analytics - Carga progresiva con 3 estados */}
          <div className='space-y-2'>
            {/* Datos básicos disponibles inmediatamente */}
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <UsersIcon className='h-3 w-3' />
              <span>
                {room.members?.length || 0} miembro{(room.members?.length || 0) !== 1 ? "s" : ""} configurado{(room.members?.length || 0) !== 1 ? "s" : ""}
              </span>
            </div>
            
            {/* Analytics area - progresiva */}
            {analytics && analytics.sessions && analytics.permanentMembers ? (
              /* Estado 3: Analytics completas cargadas */
              <div className='space-y-2 border-l-2 border-green-500 pl-2 animate-in fade-in duration-300'>
                {/* Sessions & Duration */}
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <ChartBarIcon className='h-3 w-3 text-green-600' />
                  <span>
                    {analytics.sessions?.total || 0} sesiones • {formatDuration(analytics.sessions?.totalDurationSeconds || 0)} total
                  </span>
                </div>

                {/* Participants breakdown */}
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <UserGroupIcon className='h-3 w-3 text-blue-600' />
                  <span>
                    {analytics.permanentMembers?.cohosts || 0} co-hosts • {analytics.permanentMembers?.regularMembers || 0} participantes
                  </span>
                </div>

                {/* Average participants per session */}
                {(analytics.sessions?.total || 0) > 0 && (
                  <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <UsersIcon className='h-3 w-3 text-purple-600' />
                    <span>
                      {analytics.sessions?.averageParticipantsPerSession || 0} participantes promedio
                    </span>
                  </div>
                )}

                {/* Recent activity */}
                {analytics.recentActivity?.lastMeetingDate && (
                  <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <CalendarIcon className='h-3 w-3 text-orange-600' />
                    <span>
                      Última: {formatDaysAgo(analytics.recentActivity.daysSinceLastMeeting)} ({analytics.recentActivity.lastParticipantCount || 0} participantes)
                    </span>
                  </div>
                )}
              </div>
            ) : isLoadingAnalytics ? (
              /* Estado 2: Cargando analytics */
              <div className='space-y-2 border-l-2 border-blue-500 pl-2'>
                <div className='flex items-center gap-1.5 text-xs text-blue-600'>
                  <div className='animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full'></div>
                  <span>Cargando métricas...</span>
                </div>
                <AnalyticsSkeleton />
              </div>
            ) : (
              /* Estado 1: Sin analytics (pendiente de cargar) */
              <div className='space-y-2 border-l-2 border-gray-300 pl-2'>
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <ClockIcon className='h-3 w-3' />
                  <span>Métricas pendientes...</span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons - compactos como en original */}
          <div className='flex gap-2 pt-2'>
            <Button 
              variant='destructive' 
              size='sm' 
              className='flex-1 h-8 text-xs'
              onClick={() => {
                // TODO: Implementar eliminar
                showInfo("Eliminar", `Eliminando sala: ${displayName}`);
              }}
            >
              <TrashIcon className='h-3 w-3 mr-1' />
              Eliminar
            </Button>
            <Button 
              variant='outline' 
              size='sm' 
              className='flex-1 h-8 text-xs'
              onClick={() => handleViewRoom(spaceId, room)}
            >
              <Cog6ToothIcon className='h-3 w-3 mr-1' />
              Gestionar
            </Button>
          </div>

          {/* Unirse button - destacado como en original */}
          <Button 
            className='w-full h-8 text-xs bg-green-500 hover:bg-green-600'
            onClick={() => {
              if (room.meetingUri) {
                window.open(room.meetingUri, '_blank');
              }
            }}
          >
            <EyeIcon className='h-3 w-3 mr-1' />
            Unirse a la Reunión
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Render list view
  const renderRoomListItem = (room: any) => {
    const spaceId = room.name?.split("/").pop();
    const displayName =
      room._metadata?.displayName || room.name || "Sala sin nombre";
    const isActive = !!room.activeConference?.conferenceRecord;
    const isSelected = selectedRoomIds.has(spaceId);

    return (
      <Card
        key={room.name}
        className={`hover:shadow-sm transition-shadow ${isSelected ? "ring-2 ring-primary" : ""}`}
      >
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3 flex-1'>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleRoomSelection(spaceId)}
              />

              <VideoCameraIcon className='h-5 w-5 text-muted-foreground' />

              <div className='space-y-1 flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <h3
                    className='font-medium truncate max-w-[300px]'
                    title={displayName}
                  >
                    {displayName}
                  </h3>
                  <div className='flex-shrink-0 flex items-center gap-2'>
                    <RoomStatusBadge isActive={isActive} />
                    {room.config?.accessType && (
                      <AccessTypeBadge type={room.config.accessType} />
                    )}
                  </div>
                </div>
                <div className='text-sm text-muted-foreground truncate'>
                  <span>ID: {spaceId}</span>
                  <span className='mx-1'>•</span>
                  <span>Miembros: {room.members?.length || 0}</span>
                  {room.meetingCode && (
                    <>
                      <span className='mx-1'>•</span>
                      <span>
                        Código:{" "}
                        <code className='text-xs'>{room.meetingCode}</code>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleViewRoom(spaceId, room)}
              >
                <EyeIcon className='h-4 w-4' />
              </Button>

              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleDuplicateRoom(room)}
              >
                <DocumentDuplicateIcon className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
            <VideoCameraIcon className='h-8 w-8 text-primary' />
            Salas de Meet
          </h1>
          <p className='text-muted-foreground'>
            Gestiona tus salas de reuniones de Google Meet
          </p>
        </div>
      </div>

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
                  {rooms.all.filter(room => !!room.activeConference?.conferenceRecord).length}
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
                  {rooms.all.filter(room => room.config?.accessType === "TRUSTED").length}
                </p>
                <p className='text-xs text-muted-foreground'>Organizacionales</p>
              </div>
              <Badge variant='secondary' className='text-xs'>TRUSTED</Badge>
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

      {/* View Mode Controls */}
      <div className='flex justify-end mb-4'>
        <div className='flex border rounded-md'>
          <Button
            variant={viewConfig.mode === "grid" ? "default" : "ghost"}
            size='sm'
            onClick={() => setViewMode("grid")}
            className='rounded-r-none'
          >
            <ChartBarIcon className='h-4 w-4' />
          </Button>
          <Button
            variant={viewConfig.mode === "list" ? "default" : "ghost"}
            size='sm'
            onClick={() => setViewMode("list")}
            className='rounded-l-none'
          >
            <CalendarIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>

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
            <p className='text-destructive'>Error al cargar salas: {String(error)}</p>
          </CardContent>
        </Card>
      )}

      {/* Rooms content - using custom render functions with analytics */}
      {!isLoading && !error && rooms.paginated.length > 0 && (
        <>
          {viewConfig.mode === "grid" ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
              {rooms.paginated.map(renderRoomCard)}
            </div>
          ) : (
            <div className='space-y-2'>
              {rooms.paginated.map(renderRoomListItem)}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && rooms.paginated.length === 0 && (
        <Card>
          <CardContent className='py-12 text-center'>
            <VideoCameraIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No hay salas disponibles</h3>
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
            Página {viewConfig.currentPage} de {rooms.totalPages} • Mostrando {rooms.paginated.length} de {rooms.totalCount} salas
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
        onBulkAction={(action, payload) => {
          showInfo(
            "Acción Masiva",
            `Ejecutando ${action} en ${selectedCount} salas`
          );
        }}
      />

      {/* Room Details Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          console.log(
            "Modal open state changed:",
            open,
            "selectedRoom:",
            selectedRoom
          );
          setIsModalOpen(open);
        }}
      >
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <VideoCameraIcon className='h-5 w-5' />
              {selectedRoom?._metadata?.displayName ||
                selectedRoom?.name ||
                "Detalles de la Sala"}
            </DialogTitle>
          </DialogHeader>

          {selectedRoom && (
            <div className='space-y-6'>
              {/* Basic Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Nombre de la Sala
                  </label>
                  <p className='text-sm'>
                    {selectedRoom._metadata?.displayName || selectedRoom.name}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    ID de la Sala
                  </label>
                  <p className='text-sm font-mono'>
                    {selectedRoom.name?.split("/").pop()}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Código de Reunión
                  </label>
                  <p className='text-sm font-mono'>
                    {selectedRoom.meetingCode || "No disponible"}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Tipo de Acceso
                  </label>
                  <div className='mt-1'>
                    {selectedRoom.config?.accessType && (
                      <AccessTypeBadge type={selectedRoom.config.accessType} />
                    )}
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Estado
                  </label>
                  <div className='mt-1'>
                    <RoomStatusBadge
                      isActive={
                        !!selectedRoom.activeConference?.conferenceRecord
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    URL de la Reunión
                  </label>
                  {selectedRoom.meetingUri ? (
                    <a
                      href={selectedRoom.meetingUri}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-blue-600 hover:underline'
                    >
                      Abrir en Google Meet
                    </a>
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      No disponible
                    </p>
                  )}
                </div>
              </div>

              {/* Creation Info */}
              <div className='border-t pt-4'>
                <h4 className='font-medium mb-2'>Información de Creación</h4>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Creada el
                    </label>
                    <p className='text-sm'>
                      {selectedRoom._metadata?.createdAt
                        ? new Date(
                            selectedRoom._metadata.createdAt
                          ).toLocaleDateString("es-ES")
                        : "No disponible"}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Creada por
                    </label>
                    <p className='text-sm'>
                      {selectedRoom._metadata?.createdBy || "No disponible"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Members */}
              {selectedRoom.members && selectedRoom.members.length > 0 && (
                <div className='border-t pt-4'>
                  <h4 className='font-medium mb-2'>
                    Miembros ({selectedRoom.members.length})
                  </h4>
                  <div className='space-y-2 max-h-32 overflow-y-auto'>
                    {selectedRoom.members.map((member: any, index: number) => (
                      <div
                        key={index}
                        className='flex items-center justify-between py-1'
                      >
                        <span className='text-sm'>
                          {member.email || `Usuario ${index + 1}`}
                        </span>
                        <MemberRoleBadge role={member.role} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className='border-t pt-4 flex justify-end gap-2'>
                <Button variant='outline' onClick={handleCloseModal}>
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedRoom.meetingUri) {
                      window.open(selectedRoom.meetingUri, "_blank");
                    }
                  }}
                >
                  <VideoCameraIcon className='h-4 w-4 mr-2' />
                  Unirse a la Reunión
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Export default for backward compatibility
export default MeetRoomsClientRefactored;
