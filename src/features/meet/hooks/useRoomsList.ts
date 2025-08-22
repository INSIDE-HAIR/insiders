import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "../stores";

export interface RoomsFilter {
  search: string;
  status: "all" | "active" | "inactive";
  accessType: "all" | "OPEN" | "TRUSTED" | "RESTRICTED";
  createdBy: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

export interface RoomsSortConfig {
  field: "name" | "created" | "lastUsed" | "accessType" | "memberCount";
  direction: "asc" | "desc";
}

export interface RoomsViewConfig {
  mode: "grid" | "list";
  itemsPerPage: number;
  currentPage: number;
}

/**
 * Hook especializado para gestionar la lista de salas con filtros, ordenamiento y paginación
 * Integra con Tanstack Query para cache y sincronización
 */
export const useRoomsList = () => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useNotificationStore();

  // Filter state
  const [filters, setFilters] = useState<RoomsFilter>({
    search: "",
    status: "all",
    accessType: "all",
    createdBy: "",
    dateRange: {},
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState<RoomsSortConfig>({
    field: "name",
    direction: "asc",
  });

  // View state
  const [viewConfig, setViewConfig] = useState<RoomsViewConfig>({
    mode: "grid",
    itemsPerPage: 12,
    currentPage: 1,
  });

  // Selection state for bulk operations
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());

  // Fetch rooms (básicos) primero - SIN analytics para carga rápida
  const {
    data: roomsData,
    isLoading: isLoadingRooms,
    error,
    refetch,
  } = useQuery({
    queryKey: ['rooms-list', filters, sortConfig],
    queryFn: async () => {
      try {
        const searchParams = new URLSearchParams();
        
        // Add filters to query
        if (filters.search) searchParams.set('search', filters.search);
        if (filters.status !== 'all') searchParams.set('status', filters.status);
        if (filters.accessType !== 'all') searchParams.set('accessType', filters.accessType);
        if (filters.createdBy) searchParams.set('createdBy', filters.createdBy);
        if (filters.dateRange.from) searchParams.set('fromDate', filters.dateRange.from.toISOString());
        if (filters.dateRange.to) searchParams.set('toDate', filters.dateRange.to.toISOString());
        
        // Add sorting
        searchParams.set('sortBy', sortConfig.field);
        searchParams.set('sortOrder', sortConfig.direction);

        const response = await fetch(`/api/meet/rooms?${searchParams.toString()}`, {
          credentials: 'include', // Incluir cookies de autenticación
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn(`API error ${response.status}:`, response.statusText);
          // Return empty but valid response structure for failed API calls
          return {
            rooms: [],
            spaces: [],
            stats: { totalSpaces: 0, activeSpaces: 0 },
            source: "error-fallback",
            error: `API error ${response.status}`,
          };
        }
        
        const data = await response.json();
        
        // Get rooms data - Solo datos básicos primero para UX rápida
        const basicRooms = data.spaces || [];
        
        // Return basic rooms immediately for fast initial render
        const basicResponse = {
          ...data,
          rooms: basicRooms,
          spaces: basicRooms,
          stats: data.stats || { totalSpaces: 0, activeSpaces: 0 },
          source: data.source || "api",
        };
        
        console.log("⚡ Returning basic rooms for fast render:", basicRooms.length);
        return basicResponse;
      } catch (error) {
        console.warn('Failed to fetch rooms:', error);
        // Return empty but valid response structure for network errors
        return {
          rooms: [],
          spaces: [],
          stats: { totalSpaces: 0, activeSpaces: 0 },
          source: "network-error-fallback",
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // State para analytics individuales (carga progresiva)
  const [roomAnalytics, setRoomAnalytics] = useState<Map<string, any>>(new Map());
  const [analyticsLoadingStates, setAnalyticsLoadingStates] = useState<Map<string, boolean>>(new Map());

  // Fetch analytics progresivamente DESPUÉS de cargar rooms básicos
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
  } = useQuery({
    queryKey: ['rooms-analytics', roomsData?.rooms?.map((r: any) => r.name?.split('/').pop())],
    queryFn: async () => {
      if (!roomsData?.rooms?.length) return {};

      console.log("📊 Starting progressive analytics loading...");
      const analyticsMap = new Map();
      
      // Load analytics in batches of 2 with 300ms delay between batches for smooth UX
      const batchSize = 2;
      const batchDelay = 300;
      const rooms = roomsData.rooms;
      
      for (let i = 0; i < rooms.length; i += batchSize) {
        const batch = rooms.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (room: any) => {
          const spaceId = room.name?.split("/").pop();
          if (!spaceId) return;
          
          // Mark as loading
          setAnalyticsLoadingStates(prev => new Map(prev).set(spaceId, true));
          
          try {
            const analyticsResponse = await fetch(
              `/api/meet/rooms/${spaceId}/analytics`,
              {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
              }
            );
            
            if (analyticsResponse.ok) {
              const analytics = await analyticsResponse.json();
              const enrichedAnalytics = {
                permanentMembers: analytics.permanentMembers,
                participants: analytics.participants,
                sessions: analytics.sessions,
                recentActivity: analytics.recentActivity,
              };
              
              // Update state immediately for progressive UI update
              setRoomAnalytics(prev => new Map(prev).set(spaceId, enrichedAnalytics));
              setAnalyticsLoadingStates(prev => new Map(prev).set(spaceId, false));
              
              analyticsMap.set(spaceId, enrichedAnalytics);
              console.log(`✨ Analytics loaded for ${spaceId}`);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to load analytics for ${spaceId}:`, error);
            setAnalyticsLoadingStates(prev => new Map(prev).set(spaceId, false));
          }
        });
        
        await Promise.all(batchPromises);
        
        // Small delay between batches for smooth cascading effect
        if (i + batchSize < rooms.length) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      }
      
      console.log(`📈 Progressive analytics loading completed: ${analyticsMap.size} rooms`);
      return analyticsMap;
    },
    enabled: !!roomsData?.rooms?.length, // Only run after basic rooms are loaded
    staleTime: 5 * 60 * 1000, // 5 minutes - analytics change less frequently
  });

  // Process rooms data - Combinar datos básicos con analytics progresivas
  const processedRooms = useMemo(() => {
    if (!roomsData?.rooms) {
      return {
        all: [],
        paginated: [],
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
    
    // Start with basic rooms data
    const basicRooms = roomsData?.rooms || [];
    
    // Enrich with progressive analytics from state
    const enrichedRooms = basicRooms.map((room: any) => {
      const spaceId = room.name?.split("/").pop();
      const analytics = roomAnalytics.get(spaceId);
      const isLoadingAnalytics = analyticsLoadingStates.get(spaceId);
      
      return {
        ...room,
        _analytics: analytics, // undefined until loaded
        _analyticsLoading: isLoadingAnalytics || false,
      };
    });
    
    console.log("🔧 Progressive rooms with analytics:", enrichedRooms.filter((r: any) => r._analytics).length, "of", enrichedRooms.length);
    
    // Additional client-side filtering if needed
    let filteredRooms = [...enrichedRooms];

    // Pagination
    const startIndex = (viewConfig.currentPage - 1) * viewConfig.itemsPerPage;
    const endIndex = startIndex + viewConfig.itemsPerPage;
    const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

    return {
      all: filteredRooms,
      paginated: paginatedRooms,
      totalCount: filteredRooms.length,
      totalPages: Math.ceil(filteredRooms.length / viewConfig.itemsPerPage),
      hasNextPage: endIndex < filteredRooms.length,
      hasPrevPage: viewConfig.currentPage > 1,
    };
  }, [roomsData, viewConfig, roomAnalytics, analyticsLoadingStates]);

  // Filter actions
  const updateFilter = useCallback(<K extends keyof RoomsFilter>(
    key: K,
    value: RoomsFilter[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setViewConfig(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);

  const updateDateRange = useCallback((from?: Date, to?: Date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { from, to }
    }));
    setViewConfig(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "all",
      accessType: "all",
      createdBy: "",
      dateRange: {},
    });
    setViewConfig(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Sort actions
  const updateSort = useCallback((field: RoomsSortConfig["field"], direction?: RoomsSortConfig["direction"]) => {
    setSortConfig(prev => ({
      field,
      direction: direction || (prev.field === field && prev.direction === "asc" ? "desc" : "asc"),
    }));
    setViewConfig(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // View actions
  const setViewMode = useCallback((mode: RoomsViewConfig["mode"]) => {
    setViewConfig(prev => ({ ...prev, mode }));
  }, []);

  const setItemsPerPage = useCallback((itemsPerPage: number) => {
    setViewConfig(prev => ({
      ...prev,
      itemsPerPage,
      currentPage: 1, // Reset to first page
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setViewConfig(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, processedRooms?.totalPages || 1)),
    }));
  }, [processedRooms?.totalPages]);

  // Selection actions
  const toggleRoomSelection = useCallback((roomId: string) => {
    setSelectedRoomIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  }, []);

  const selectAllRooms = useCallback((roomIds: string[]) => {
    setSelectedRoomIds(new Set(roomIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRoomIds(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedRoomIds.size === (processedRooms.paginated?.length || 0)) {
      clearSelection();
    } else {
      selectAllRooms(processedRooms.paginated?.map(room => room.name) || []);
    }
  }, [selectedRoomIds.size, processedRooms.paginated, clearSelection, selectAllRooms]);

  // Bulk operations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (roomIds: string[]) => {
      const promises = roomIds.map(roomId =>
        fetch(`/api/meet/rooms/${roomId}`, { 
          method: 'DELETE',
          credentials: 'include',
        })
      );
      
      const results = await Promise.allSettled(promises);
      
      const failed = results
        .map((result, index) => ({ result, roomId: roomIds[index] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ roomId }) => roomId);

      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} rooms: ${failed.join(', ')}`);
      }

      return { deletedCount: roomIds.length - failed.length, failed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms-list'] });
      clearSelection();
      showSuccess(
        "Eliminación completada",
        `Se eliminaron ${data.deletedCount} salas exitosamente`
      );
    },
    onError: (error: Error) => {
      showError("Error en eliminación masiva", error.message);
    },
  });

  const bulkUpdateAccessTypeMutation = useMutation({
    mutationFn: async ({ roomIds, accessType }: { roomIds: string[], accessType: string }) => {
      const promises = roomIds.map(roomId =>
        fetch(`/api/meet/rooms/${roomId}/settings`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessType }),
        })
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      
      return { updatedCount: successful, total: roomIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms-list'] });
      clearSelection();
      showSuccess(
        "Actualización completada", 
        `Se actualizaron ${data.updatedCount} de ${data.total} salas`
      );
    },
    onError: (error: Error) => {
      showError("Error en actualización masiva", error.message);
    },
  });

  // Computed flags
  const hasActiveFilters = useMemo(() => {
    return filters.search !== "" ||
           filters.status !== "all" ||
           filters.accessType !== "all" ||
           filters.createdBy !== "" ||
           filters.dateRange.from !== undefined ||
           filters.dateRange.to !== undefined ||
           sortConfig.field !== "name" ||
           sortConfig.direction !== "asc";
  }, [filters, sortConfig]);

  const isAllSelected = selectedRoomIds.size === (processedRooms.paginated?.length || 0) && (processedRooms.paginated?.length || 0) > 0;
  const isPartiallySelected = selectedRoomIds.size > 0 && selectedRoomIds.size < (processedRooms.paginated?.length || 0);

  return {
    // Data
    rooms: processedRooms,
    totalStats: roomsData?.stats || { totalRooms: 0, activeRooms: 0 },
    isLoading: isLoadingRooms, // Only basic loading, analytics load progressively
    isLoadingAnalytics,
    error,
    
    // Filter state
    filters,
    sortConfig,
    viewConfig,
    hasActiveFilters,
    
    // Selection state
    selectedRoomIds,
    isAllSelected,
    isPartiallySelected,
    selectedCount: selectedRoomIds.size,
    
    // Filter actions
    updateFilter,
    updateDateRange,
    clearFilters,
    
    // Sort actions
    updateSort,
    
    // View actions
    setViewMode,
    setItemsPerPage,
    goToPage,
    
    // Selection actions
    toggleRoomSelection,
    selectAllRooms,
    clearSelection,
    toggleSelectAll,
    
    // Bulk operations
    bulkDelete: bulkDeleteMutation.mutate,
    bulkUpdateAccessType: bulkUpdateAccessTypeMutation.mutate,
    isBulkOperationLoading: bulkDeleteMutation.isPending || bulkUpdateAccessTypeMutation.isPending,
    
    // Data operations
    refetch,
  };
};