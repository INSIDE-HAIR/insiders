/**
 * ROOMSLISTTEMPLATE - Template de alto nivel para la lista de salas
 * Orquesta todos los organismos necesarios para la gestión de salas
 * Siguiendo principios SOLID y Atomic Design
 */

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  VideoCameraIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

// Importar componentes
import { RoomSummaryCard } from "../molecules/cards/RoomSummaryCard";
import { RoomStatusBadge } from "../atoms/badges/RoomStatusBadge";
import { AccessTypeBadge } from "../atoms/badges/AccessTypeBadge";

// Importar stores y hooks
import { useRoomStore, useNotificationStore } from "../../stores";

// Types
export interface RoomsListTemplateProps {
  children?: React.ReactNode;
  onCreateRoom?: () => void;
  onRefresh?: () => void;
  onViewRoom?: (roomId: string, room: any) => void;
  className?: string;
  // Add props for external data
  roomsData?: any[];
  isLoading?: boolean;
  error?: any;
  stats?: any;
  // Add props for view control
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

/**
 * Template principal para la lista de salas de Meet
 * Maneja el layout, filtros, búsqueda y acciones principales
 */
export const RoomsListTemplate: React.FC<RoomsListTemplateProps> = ({
  children,
  onCreateRoom,
  onRefresh,
  onViewRoom,
  className,
  roomsData,
  isLoading: externalIsLoading,
  error: externalError,
  stats: externalStats,
  viewMode: externalViewMode,
  onViewModeChange,
}) => {
  // Zustand stores (fallback when no external data)
  const {
    rooms: storeRooms,
    roomsLoading: storeLoading,
    roomsError: storeError,
    setRoomsLoading,
  } = useRoomStore();

  // Use external data if provided, otherwise fallback to store
  const rooms = roomsData ? {} : storeRooms; // Convert array to object for compatibility if needed
  const roomsLoading =
    externalIsLoading !== undefined ? externalIsLoading : storeLoading;
  const roomsError = externalError !== undefined ? externalError : storeError;

  const { showSuccess, showError } = useNotificationStore();

  // Local state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [accessTypeFilter, setAccessTypeFilter] = React.useState<
    "all" | "OPEN" | "TRUSTED" | "RESTRICTED"
  >("all");
  const [sortBy, setSortBy] = React.useState<"name" | "created" | "lastUsed">(
    "name"
  );

  // Use external view mode if provided, otherwise use local state
  const viewMode = externalViewMode || "grid";
  const setViewMode = onViewModeChange || (() => {});

  // Get rooms array from external data or store
  const roomsArray = roomsData || Object.values(rooms);

  // Filter and sort rooms
  const filteredAndSortedRooms = React.useMemo(() => {
    let filtered = roomsArray;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((room) => {
        const displayName = room._metadata?.displayName || room.name || "";
        return (
          displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.meetingCode?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((room) => {
        const isActive = !!room.activeConference?.conferenceRecord;
        return statusFilter === "active" ? isActive : !isActive;
      });
    }

    // Access type filter
    if (accessTypeFilter !== "all") {
      filtered = filtered.filter(
        (room) => room.config?.accessType === accessTypeFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = a._metadata?.displayName || a.name || "";
          const nameB = b._metadata?.displayName || b.name || "";
          return nameA.localeCompare(nameB);
        case "created":
          const dateA = a._metadata?.createdAt
            ? new Date(a._metadata.createdAt).getTime()
            : 0;
          const dateB = b._metadata?.createdAt
            ? new Date(b._metadata.createdAt).getTime()
            : 0;
          return dateB - dateA; // Most recent first
        case "lastUsed":
          // Would need to implement last used tracking
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [roomsArray, searchQuery, statusFilter, accessTypeFilter, sortBy]);

  const handleRefresh = async () => {
    try {
      setRoomsLoading(true);
      await onRefresh?.();
      showSuccess(
        "Lista actualizada",
        "Las salas se han actualizado correctamente"
      );
    } catch (error) {
      showError("Error", "No se pudo actualizar la lista de salas");
    } finally {
      setRoomsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setAccessTypeFilter("all");
    setSortBy("name");
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    accessTypeFilter !== "all" ||
    sortBy !== "name";

  return (
    <div className={className}>
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

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={roomsLoading}
          >
            <ArrowPathIcon
              className={`h-4 w-4 mr-2 ${roomsLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>

          {onCreateRoom && (
            <Button onClick={onCreateRoom}>
              <PlusIcon className='h-4 w-4 mr-2' />
              Nueva Sala
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold'>{roomsArray.length}</p>
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
                    roomsArray.filter(
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
                    roomsArray.filter(
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
                  {filteredAndSortedRooms.length}
                </p>
                <p className='text-xs text-muted-foreground'>Filtradas</p>
              </div>
              <FunnelIcon className='h-6 w-6 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className='mb-6'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>Filtros y Vista</CardTitle>
            {hasActiveFilters && (
              <Button variant='ghost' size='sm' onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='flex flex-col md:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar salas...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Estado' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas</SelectItem>
                <SelectItem value='active'>Activas</SelectItem>
                <SelectItem value='inactive'>Inactivas</SelectItem>
              </SelectContent>
            </Select>

            {/* Access Type Filter */}
            <Select
              value={accessTypeFilter}
              onValueChange={(value: any) => setAccessTypeFilter(value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Acceso' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos los tipos</SelectItem>
                <SelectItem value='OPEN'>Libre</SelectItem>
                <SelectItem value='TRUSTED'>Organizacional</SelectItem>
                <SelectItem value='RESTRICTED'>Solo invitados</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Ordenar por' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='name'>Nombre</SelectItem>
                <SelectItem value='created'>Fecha creación</SelectItem>
                <SelectItem value='lastUsed'>Último uso</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation='vertical' className='h-8' />

            {/* View Mode */}
            <div className='flex border rounded-md'>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size='sm'
                onClick={() => setViewMode("grid")}
                className='rounded-r-none'
              >
                <Squares2X2Icon className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size='sm'
                onClick={() => setViewMode("list")}
                className='rounded-l-none'
              >
                <ListBulletIcon className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className='flex items-center gap-2 mt-3 pt-3 border-t'>
              <span className='text-sm text-muted-foreground'>
                Filtros activos:
              </span>
              {searchQuery && (
                <Badge variant='outline'>&quot;{searchQuery}&quot;</Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant='outline'>{statusFilter}</Badge>
              )}
              {accessTypeFilter !== "all" && (
                <Badge variant='outline'>{accessTypeFilter}</Badge>
              )}
              {sortBy !== "name" && (
                <Badge variant='outline'>Ordenado por {sortBy}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {roomsError && (
        <Alert variant='destructive' className='mb-6'>
          <ExclamationTriangleIcon className='h-4 w-4' />
          <AlertDescription>
            Error al cargar las salas: {roomsError}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {roomsLoading && (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <span className='ml-3'>Cargando salas...</span>
        </div>
      )}

      {/* Empty State */}
      {!roomsLoading && !roomsError && filteredAndSortedRooms.length === 0 && (
        <Card>
          <CardContent className='py-12 text-center'>
            <VideoCameraIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              {roomsArray.length === 0
                ? "No hay salas creadas"
                : "No se encontraron salas"}
            </h3>
            <p className='text-muted-foreground mb-4'>
              {roomsArray.length === 0
                ? "Crea tu primera sala de reuniones para comenzar"
                : "Intenta ajustar los filtros para encontrar las salas que buscas"}
            </p>
            {roomsArray.length === 0 && onCreateRoom && (
              <Button onClick={onCreateRoom}>
                <PlusIcon className='h-4 w-4 mr-2' />
                Crear Primera Sala
              </Button>
            )}
            {roomsArray.length > 0 && (
              <Button variant='outline' onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rooms Content */}
      {!roomsLoading && !roomsError && filteredAndSortedRooms.length > 0 && (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6'>
              {filteredAndSortedRooms.map((room) => (
                <div key={room.name} className='w-full'>
                  <RoomSummaryCard
                    displayName={room._metadata?.displayName}
                    meetingCode={room.meetingCode}
                    roomId={room.name?.split("/").pop()}
                    accessType={room.config?.accessType || "TRUSTED"}
                    memberCount={room.members?.length || 0}
                    isActive={!!room.activeConference?.conferenceRecord}
                    hasRecording={
                      room.config?.artifactConfig?.recordingConfig
                        ?.autoRecordingGeneration === "ON"
                    }
                    hasTranscription={
                      room.config?.artifactConfig?.transcriptionConfig
                        ?.autoTranscriptionGeneration === "ON"
                    }
                    hasSmartNotes={
                      room.config?.artifactConfig?.smartNotesConfig
                        ?.autoSmartNotesGeneration === "ON"
                    }
                    hasModeration={room.config?.moderation === "ON"}
                    createdAt={room.createTime}
                    lastActivity={room.updateTime}
                  />
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className='space-y-2'>
              {filteredAndSortedRooms.map((room) => (
                <Card
                  key={room.name}
                  className='hover:shadow-sm transition-shadow'
                >
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3 flex-1'>
                        <VideoCameraIcon className='h-5 w-5 text-muted-foreground' />

                        <div className='space-y-1 flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <h3
                              className='font-medium truncate max-w-[300px]'
                              title={room._metadata?.displayName || room.name}
                            >
                              {room._metadata?.displayName ||
                                room.name ||
                                "Sala sin nombre"}
                            </h3>
                            <div className='flex-shrink-0 flex items-center gap-2'>
                              <RoomStatusBadge
                                isActive={
                                  !!room.activeConference?.conferenceRecord
                                }
                              />
                              {room.config?.accessType && (
                                <AccessTypeBadge
                                  type={room.config.accessType}
                                />
                              )}
                            </div>
                          </div>
                          <div className='text-sm text-muted-foreground truncate'>
                            <span>ID: {room.name?.split("/").pop()}</span>
                            <span className='mx-1'>•</span>
                            <span>Miembros: {room.members?.length || 0}</span>
                            {room.meetingCode && (
                              <>
                                <span className='mx-1'>•</span>
                                <span>
                                  Código:{" "}
                                  <code className='text-xs'>
                                    {room.meetingCode}
                                  </code>
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
                          onClick={() => {
                            console.log(
                              "List view: onViewRoom clicked",
                              room.name?.split("/").pop(),
                              room
                            );
                            onViewRoom?.(
                              room.name?.split("/").pop() || "",
                              room
                            );
                          }}
                        >
                          <EyeIcon className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Results Summary */}
      {!roomsLoading && !roomsError && filteredAndSortedRooms.length > 0 && (
        <div className='mt-6 text-center'>
          <p className='text-sm text-muted-foreground'>
            Mostrando {filteredAndSortedRooms.length} de {roomsArray.length}{" "}
            salas
            {hasActiveFilters && " (filtradas)"}
          </p>
        </div>
      )}
    </div>
  );
};
