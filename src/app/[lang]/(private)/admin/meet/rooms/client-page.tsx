"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { useToast } from "@/src/hooks/use-toast";
import { Icons } from "@/src/components/shared/icons";
import { 
  VideoCameraIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  UsersIcon,
  LockClosedIcon,
  LockOpenIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  FunnelIcon,
  TagIcon,
  FolderIcon,
  XMarkIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { CreateRoomModal } from "@/src/features/meet/components/CreateRoomModal";
import { RoomDetailsModal } from "@/src/features/meet/components/RoomDetailsModal";
import { cn } from "@/src/lib/utils";

interface MeetRoom {
  name: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: {
    accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  };
  members?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  activeConference?: {
    conferenceRecord?: string;
  };
  _metadata?: {
    localId?: string;
    displayName?: string;
    createdAt?: Date;
    createdBy?: string;
    lastSyncAt?: Date;
    source?: string;
  };
}

interface MeetRoomsClientProps {
  lang: string;
}

export const MeetRoomsClient: React.FC<MeetRoomsClientProps> = ({ lang }) => {
  const [rooms, setRooms] = useState<MeetRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<MeetRoom | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Cargar salas al montar el componente
  useEffect(() => {
    fetchRooms();
    fetchFiltersData();
  }, []);

  const fetchFiltersData = async () => {
    try {
      const [tagsResponse, groupsResponse] = await Promise.all([
        fetch("/api/meet/tags?parentId=all"),
        fetch("/api/meet/groups?parentId=all")
      ]);

      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setAvailableTags(tagsData.tags || []);
      }

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setAvailableGroups(groupsData.groups || []);
      }
    } catch (error) {
      console.error("Error fetching filters data:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/meet/rooms?pageSize=50");
      
      const data = await response.json();
      
      // Manejo de respuesta API fresca
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Respuesta exitosa - datos siempre frescos
      setRooms(data.spaces || []);
      setIsDemoMode(false);
      
      // Mostrar información sobre datos frescos
      if (data.source === "fresh-api-hybrid") {
        toast({
          title: "Datos actualizados",
          description: `${data.spaces?.length || 0} espacios con datos frescos de Google Meet API`,
        });
      }
      
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error al cargar salas",
        description: "No se pudieron cargar las salas de Meet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (roomData: any) => {
    try {
      const response = await fetch("/api/meet/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear sala");
      }

      const newRoom = await response.json();
      
      // Transformar para el frontend
      const frontendRoom = {
        name: newRoom.name || `spaces/${newRoom.spaceId}`,
        spaceId: newRoom.name?.split('/').pop() || newRoom.spaceId,
        meetingUri: newRoom.meetingUri,
        meetingCode: newRoom.meetingCode,
        config: newRoom.config,
        members: newRoom.members || [],
        _metadata: newRoom._metadata
      };
      
      // Agregar la nueva sala a la lista local
      setRooms(prev => [frontendRoom, ...prev]);
      
      // Mensaje de éxito con datos frescos
      const memberCount = newRoom._metadata?.membersAdded || 0;
      
      let description = `Sala creada: ${newRoom.meetingCode}`;
      if (memberCount > 0) {
        description += ` con ${memberCount} miembro(s) agregado(s)`;
      }
      
      toast({
        title: "Sala creada exitosamente",
        description: description,
      });

      setIsCreateModalOpen(false);
      
    } catch (error: any) {
      console.error("Error creating room:", error);
      
      toast({
        title: "Error al crear sala",
        description: error.message || "No se pudo crear la sala",
        variant: "destructive",
      });
    }
  };

  const handleRoomClick = (room: MeetRoom) => {
    setSelectedRoom(room);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateRoom = async () => {
    // Recargar datos después de actualizar
    await fetchRooms();
  };

  const handleDeleteRoom = async () => {
    // Recargar lista después de eliminar
    await fetchRooms();
    setIsDetailsModalOpen(false);
    setSelectedRoom(null);
  };


  // Función para eliminar sala de BD
  const handleDeleteRoomFromDB = async (spaceId: string) => {
    try {
      const response = await fetch(`/api/meet/rooms/${spaceId}/delete-from-db`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar sala");
      }

      // Remover de estado local
      setRooms(prev => prev.filter(room => {
        const roomSpaceId = room.name?.split('/').pop();
        return roomSpaceId !== spaceId;
      }));

      toast({
        title: "Sala eliminada",
        description: "La sala fue removida de la base de datos",
      });

    } catch (error: any) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error al eliminar sala",
        description: error.message || "No se pudo eliminar la sala",
        variant: "destructive",
      });
    }
  };

  // Función para bulk delete
  const handleBulkDelete = async () => {
    if (selectedRooms.size === 0) return;

    try {
      setBulkDeleting(true);
      const spaceIds = Array.from(selectedRooms);
      
      const response = await fetch("/api/meet/rooms/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceIds }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Remover salas exitosas del estado local
        setRooms(prev => prev.filter(room => {
          const roomSpaceId = room.name?.split('/').pop();
          return !result.results.success.includes(roomSpaceId);
        }));

        toast({
          title: "Eliminación masiva completada",
          description: `${result.results.success.length} salas eliminadas, ${result.results.failed.length} fallaron`,
        });

        // Mostrar errores si los hay
        if (result.results.failed.length > 0) {
          result.results.failed.forEach((failure: any) => {
            console.error(`Failed to delete ${failure.spaceId}: ${failure.error}`);
          });
        }
      } else {
        throw new Error("Error en eliminación masiva");
      }

      setSelectedRooms(new Set());

    } catch (error: any) {
      console.error("Error bulk deleting rooms:", error);
      toast({
        title: "Error en eliminación masiva",
        description: error.message || "No se pudieron eliminar las salas",
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  // Funciones para selección múltiple
  const handleRoomSelect = (spaceId: string, selected: boolean) => {
    setSelectedRooms(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(spaceId);
      } else {
        newSet.delete(spaceId);
      }
      return newSet;
    });
  };

  // Funciones para manejar filtros
  const toggleTagFilter = (tagId: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  const toggleGroupFilter = (groupId: string) => {
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const clearAllFilters = () => {
    setSelectedTags(new Set());
    setSelectedGroups(new Set());
  };

  const handleSelectAll = () => {
    if (selectedRooms.size === filteredRooms.length) {
      setSelectedRooms(new Set());
    } else {
      const allSpaceIds = filteredRooms.map(room => room.name?.split('/').pop()).filter(Boolean) as string[];
      setSelectedRooms(new Set(allSpaceIds));
    }
  };


  // Filtrar salas por búsqueda, tags y grupos
  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    const spaceId = room.name?.split('/').pop() || '';
    const displayName = room._metadata?.displayName || '';
    const memberEmails = room.members?.map(m => m.email.toLowerCase()).join(' ') || '';
    
    // Filtro por búsqueda
    const matchesSearch = (
      spaceId.toLowerCase().includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower) ||
      room.meetingCode?.toLowerCase().includes(searchLower) ||
      memberEmails.includes(searchLower)
    );
    
    if (!matchesSearch) return false;
    
    // Filtro por tags (si hay tags seleccionados)
    if (selectedTags.size > 0) {
      // Por ahora retornamos true ya que no tenemos las asignaciones cargadas
      // TODO: Implementar carga de asignaciones desde la API
      // const roomTags = getRoomTags(spaceId);
      // const hasSelectedTag = Array.from(selectedTags).some(tagId => 
      //   roomTags.some(tag => tag.id === tagId)
      // );
      // if (!hasSelectedTag) return false;
    }
    
    // Filtro por grupos (si hay grupos seleccionados)  
    if (selectedGroups.size > 0) {
      // Por ahora retornamos true ya que no tenemos las asignaciones cargadas
      // TODO: Implementar carga de asignaciones desde la API
      // const roomGroups = getRoomGroups(spaceId);
      // const hasSelectedGroup = Array.from(selectedGroups).some(groupId => 
      //   roomGroups.some(group => group.id === groupId)
      // );
      // if (!hasSelectedGroup) return false;
    }
    
    return true;
  });

  const getAccessTypeIcon = (accessType?: string) => {
    switch (accessType) {
      case 'OPEN':
        return <LockOpenIcon className="h-4 w-4 text-green-500" />;
      case 'RESTRICTED':
        return <LockClosedIcon className="h-4 w-4 text-red-500" />;
      case 'TRUSTED':
      default:
        return <LockClosedIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getAccessTypeBadge = (accessType?: string) => {
    switch (accessType) {
      case 'OPEN':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Abierto</Badge>;
      case 'RESTRICTED':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Restringido</Badge>;
      case 'TRUSTED':
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Confiable</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <VideoCameraIcon className="h-8 w-8 text-primary" />
            Salas de Google Meet
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus espacios y salas de reuniones virtuales
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchRooms()}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <ArrowPathIcon className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Sincronizar API
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Sala
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, ID, código de reunión o participantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Filtros
                {(selectedTags.size > 0 || selectedGroups.size > 0) && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedTags.size + selectedGroups.size}
                  </Badge>
                )}
              </Button>
              
              {(selectedTags.size > 0 || selectedGroups.size > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
                {/* Tags Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    Filtrar por Tags
                  </Label>
                  {availableTags.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {availableTags.map((tag) => (
                        <div
                          key={tag.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                            selectedTags.has(tag.id)
                              ? "bg-primary/10 border border-primary"
                              : "bg-background border border-muted hover:border-muted-foreground"
                          )}
                          onClick={() => toggleTagFilter(tag.id)}
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm truncate" style={{ paddingLeft: `${tag.level * 8}px` }}>
                            {tag.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay tags disponibles</p>
                  )}
                </div>

                {/* Groups Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FolderIcon className="h-4 w-4" />
                    Filtrar por Grupos
                  </Label>
                  {availableGroups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {availableGroups.map((group) => (
                        <div
                          key={group.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                            selectedGroups.has(group.id)
                              ? "bg-primary/10 border border-primary"
                              : "bg-background border border-muted hover:border-muted-foreground"
                          )}
                          onClick={() => toggleGroupFilter(group.id)}
                        >
                          <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="text-sm truncate" style={{ paddingLeft: `${group.level * 8}px` }}>
                            {group.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay grupos disponibles</p>
                  )}
                </div>

                {/* Active Filters Display */}
                {(selectedTags.size > 0 || selectedGroups.size > 0) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Filtros Activos</Label>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedTags).map((tagId) => {
                        const tag = availableTags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <Badge
                            key={`tag-${tagId}`}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => toggleTagFilter(tagId)}
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                      {Array.from(selectedGroups).map((groupId) => {
                        const group = availableGroups.find(g => g.id === groupId);
                        if (!group) return null;
                        return (
                          <Badge
                            key={`group-${groupId}`}
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <div
                              className="h-2 w-2 rounded"
                              style={{ backgroundColor: group.color }}
                            />
                            {group.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => toggleGroupFilter(groupId)}
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedRooms.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {selectedRooms.size} sala{selectedRooms.size !== 1 ? 's' : ''} seleccionada{selectedRooms.size !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRooms(new Set())}
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Desseleccionar
                </Button>
                {/* TODO: Bulk Configuration Actions - Implement after reviewing all configurations */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                >
                  {bulkDeleting ? (
                    <Icons.SpinnerIcon className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <TrashIcon className="h-4 w-4 mr-1" />
                  )}
                  Eliminar de BD
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sistema API Info */}
      <Alert className="border-blue-200 bg-blue-50">
        <ExclamationTriangleIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Sistema API Fresco:</strong> Todos los datos provienen directamente de Google Meet API. 
          <br />
          <strong>Limitaciones API:</strong> Espacios básicos (sin config). Miembros requieren Developer Preview access.
          <br />
          <strong>Ventajas:</strong> Datos siempre actualizados, espacios reales de Google Meet, sin caché obsoleto.
          <br />
          <strong>Preview Access:</strong> <a href="https://developers.google.com/workspace/preview" target="_blank" className="text-blue-800 underline">Aplicar aquí para acceso v2beta</a>
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salas</CardTitle>
            <VideoCameraIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{rooms.length}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedRooms.size === filteredRooms.length && filteredRooms.length > 0 ? "Deseleccionar" : "Seleccionar"} Todo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salas Activas</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter(r => r.activeConference?.conferenceRecord).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participantes</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.reduce((acc, room) => acc + (room.members?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salas Abiertas</CardTitle>
            <LockOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter(r => r.config?.accessType === 'OPEN').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Icons.SpinnerIcon className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando salas...</p>
          </div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <VideoCameraIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No se encontraron salas</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm
                ? "No hay salas que coincidan con tu búsqueda"
                : "Aún no has creado ninguna sala. Crea tu primera sala para comenzar."}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Crear Primera Sala
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const spaceId = room.name?.split('/').pop() || 'Unknown';
            const isActive = !!room.activeConference?.conferenceRecord;
            const isSelected = selectedRooms.has(spaceId);
            const displayName = room._metadata?.displayName || spaceId;
            
            return (
              <Card
                key={room.name}
                className={cn(
                  "transition-all duration-200",
                  isSelected && "ring-2 ring-primary",
                  "cursor-pointer hover:shadow-lg"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoomClick(room);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Checkbox */}
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRoomSelect(spaceId, e.target.checked);
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <VideoCameraIcon className="h-5 w-5 text-primary" />
                          <span className="truncate">{displayName}</span>
                        </CardTitle>
                      {room.meetingCode && (
                        <p className="text-sm text-muted-foreground">
                          Código: {room.meetingCode}
                        </p>
                      )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Badge className="bg-green-100 text-green-700">
                          <span className="animate-pulse mr-1">●</span>
                          Activa
                        </Badge>
                      )}
                      {getAccessTypeBadge(room.config?.accessType)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Members */}
                    <div className="flex items-center gap-2 text-sm">
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {room.members?.length || 0} participante{(room.members?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Meeting URL */}
                    {room.meetingUri && (
                      <div className="flex items-center gap-2 text-sm">
                        <Icons.ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={room.meetingUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Unirse a la reunión
                        </a>
                      </div>
                    )}

                    {/* Access Type */}
                    <div className="flex items-center gap-2 text-sm">
                      {getAccessTypeIcon(room.config?.accessType)}
                      <span className="text-muted-foreground">
                        Acceso {room.config?.accessType?.toLowerCase() || 'confiable'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {/* Row 1: Delete and Manage */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar "${displayName}" de la base de datos?`)) {
                          handleDeleteRoomFromDB(spaceId);
                        }
                      }}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoomClick(room);
                      }}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-1" />
                      Gestionar
                    </Button>
                    
                    {/* Row 2: Join (spans both columns) */}
                    {room.meetingUri ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="col-span-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(room.meetingUri, '_blank');
                        }}
                      >
                        <Icons.ExternalLink className="h-4 w-4 mr-1" />
                        Unirse a la Reunión
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="col-span-2"
                        disabled
                      >
                        Sin URL de Reunión
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateRoom}
      />

      {selectedRoom && (
        <RoomDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
          onUpdate={handleUpdateRoom}
          onDelete={handleDeleteRoom}
        />
      )}
    </div>
  );
};