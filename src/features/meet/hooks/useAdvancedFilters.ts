import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateFilter, RoomStatus } from "../types/room-dates.types";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface AdvancedFilterState {
  tags: string[];
  groups: string[];
  createdByUsers: string[];
  lastActivityRange: "24h" | "7d" | "30d" | "90d" | "custom" | null;
  hasRecordings: boolean | null;
  hasTranscripts: boolean | null;
  memberCountRange: {
    min?: number;
    max?: number;
  };
  customDateRange: {
    from?: Date;
    to?: Date;
  };
  // Nuevos filtros de fecha para salas
  search?: string;
  dateFilter?: DateFilter;
  roomStatus?: RoomStatus[];
  // Filtro personalizado de fechas de disponibilidad de salas
  customAvailabilityRange: {
    startDate?: Date;
    endDate?: Date;
  };
}

export interface FilterStats {
  totalRooms: number;
  filteredRooms: number;
  activeRooms: number;
  roomsWithRecordings: number;
  roomsWithTranscripts: number;
  avgMembersPerRoom: number;
}

/**
 * Hook avanzado para filtros complejos de salas
 * Maneja filtros por tags, grupos, actividad, funciones y rangos personalizados
 */
export const useAdvancedFilters = () => {
  const [filterState, setFilterState] = useState<AdvancedFilterState>({
    tags: [],
    groups: [],
    createdByUsers: [],
    lastActivityRange: null,
    hasRecordings: null,
    hasTranscripts: null,
    memberCountRange: {},
    customDateRange: {},
    search: "",
    dateFilter: DateFilter.ALL,
    roomStatus: [],
    customAvailabilityRange: {},
  });

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Fetch filter options (tags, groups, users)
  const { data: filterOptions, isLoading: optionsLoading } = useQuery({
    queryKey: ["filter-options"],
    queryFn: async () => {
      const response = await fetch("/api/meet/rooms/filter-options");
      if (!response.ok) throw new Error("Failed to fetch filter options");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch filter stats
  const { data: filterStats, isLoading: statsLoading } = useQuery({
    queryKey: ["filter-stats", filterState],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Add advanced filters to query
      if (filterState.tags.length > 0) {
        params.set("tags", filterState.tags.join(","));
      }
      if (filterState.groups.length > 0) {
        params.set("groups", filterState.groups.join(","));
      }
      if (filterState.createdByUsers.length > 0) {
        params.set("users", filterState.createdByUsers.join(","));
      }
      if (filterState.lastActivityRange) {
        params.set("activity", filterState.lastActivityRange);
      }
      if (filterState.hasRecordings !== null) {
        params.set("recordings", filterState.hasRecordings.toString());
      }
      if (filterState.hasTranscripts !== null) {
        params.set("transcripts", filterState.hasTranscripts.toString());
      }
      if (filterState.memberCountRange.min !== undefined) {
        params.set("minMembers", filterState.memberCountRange.min.toString());
      }
      if (filterState.memberCountRange.max !== undefined) {
        params.set("maxMembers", filterState.memberCountRange.max.toString());
      }
      if (filterState.customDateRange.from) {
        params.set("fromDate", filterState.customDateRange.from.toISOString());
      }
      if (filterState.customDateRange.to) {
        params.set("toDate", filterState.customDateRange.to.toISOString());
      }
      if (filterState.search) {
        params.set("search", filterState.search);
      }
      if (filterState.dateFilter && filterState.dateFilter !== DateFilter.ALL) {
        params.set("dateFilter", filterState.dateFilter);
      }
      if (filterState.roomStatus && filterState.roomStatus.length > 0) {
        params.set("status", filterState.roomStatus.join(","));
      }

      const response = await fetch(
        `/api/meet/rooms/stats?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch filter stats");
      return response.json();
    },
    enabled: isAdvancedMode,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Tag actions
  const addTag = useCallback((tag: string) => {
    setFilterState((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag],
    }));
  }, []);

  const removeTag = useCallback((tag: string) => {
    setFilterState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilterState((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  // Group actions
  const addGroup = useCallback((group: string) => {
    setFilterState((prev) => ({
      ...prev,
      groups: prev.groups.includes(group)
        ? prev.groups
        : [...prev.groups, group],
    }));
  }, []);

  const removeGroup = useCallback((group: string) => {
    setFilterState((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g !== group),
    }));
  }, []);

  const toggleGroup = useCallback((group: string) => {
    setFilterState((prev) => ({
      ...prev,
      groups: prev.groups.includes(group)
        ? prev.groups.filter((g) => g !== group)
        : [...prev.groups, group],
    }));
  }, []);

  // User actions
  const addUser = useCallback((user: string) => {
    setFilterState((prev) => ({
      ...prev,
      createdByUsers: prev.createdByUsers.includes(user)
        ? prev.createdByUsers
        : [...prev.createdByUsers, user],
    }));
  }, []);

  const removeUser = useCallback((user: string) => {
    setFilterState((prev) => ({
      ...prev,
      createdByUsers: prev.createdByUsers.filter((u) => u !== user),
    }));
  }, []);

  // Activity range actions
  const setActivityRange = useCallback(
    (range: AdvancedFilterState["lastActivityRange"]) => {
      setFilterState((prev) => ({
        ...prev,
        lastActivityRange: range,
        // Clear custom date if selecting predefined range
        customDateRange: range !== "custom" ? {} : prev.customDateRange,
      }));
    },
    []
  );

  // Feature filters
  const setRecordingsFilter = useCallback((hasRecordings: boolean | null) => {
    setFilterState((prev) => ({ ...prev, hasRecordings }));
  }, []);

  const setTranscriptsFilter = useCallback((hasTranscripts: boolean | null) => {
    setFilterState((prev) => ({ ...prev, hasTranscripts }));
  }, []);

  // Member count range
  const setMemberCountRange = useCallback((min?: number, max?: number) => {
    setFilterState((prev) => ({
      ...prev,
      memberCountRange: { min, max },
    }));
  }, []);

  // Custom date range
  const setCustomDateRange = useCallback((from?: Date, to?: Date) => {
    setFilterState((prev) => ({
      ...prev,
      customDateRange: { from, to },
      lastActivityRange: from || to ? "custom" : prev.lastActivityRange,
    }));
  }, []);

  // Search filter
  const setSearchFilter = useCallback((search: string) => {
    setFilterState((prev) => ({
      ...prev,
      search,
    }));
  }, []);

  // Date filter
  const setDateFilter = useCallback(
    (dateFilter: AdvancedFilterState["dateFilter"]) => {
      setFilterState((prev) => ({
        ...prev,
        dateFilter,
        // Si se cambia a un filtro que no es custom, limpiar las fechas personalizadas
        customAvailabilityRange:
          dateFilter === DateFilter.CUSTOM ? prev.customAvailabilityRange : {},
      }));
    },
    []
  );

  // Custom availability range filter
  const setCustomAvailabilityRange = useCallback(
    (startDate?: Date, endDate?: Date) => {
      setFilterState((prev) => ({
        ...prev,
        customAvailabilityRange: { startDate, endDate },
        // Auto-cambiar a custom cuando se establecen fechas personalizadas
        dateFilter:
          startDate || endDate
            ? DateFilter.CUSTOM
            : prev.dateFilter === DateFilter.CUSTOM
              ? DateFilter.ALL
              : prev.dateFilter,
      }));
    },
    []
  );

  // Room status filter
  const setRoomStatusFilter = useCallback(
    (status: AdvancedFilterState["roomStatus"]) => {
      setFilterState((prev) => ({
        ...prev,
        roomStatus: status,
      }));
    },
    []
  );

  // Clear actions
  const clearAllFilters = useCallback(() => {
    setFilterState({
      tags: [],
      groups: [],
      createdByUsers: [],
      lastActivityRange: null,
      hasRecordings: null,
      hasTranscripts: null,
      memberCountRange: {},
      customDateRange: {},
      search: "",
      dateFilter: DateFilter.ALL,
      roomStatus: [],
      customAvailabilityRange: {},
    });
  }, []);

  const clearTags = useCallback(() => {
    setFilterState((prev) => ({ ...prev, tags: [] }));
  }, []);

  const clearGroups = useCallback(() => {
    setFilterState((prev) => ({ ...prev, groups: [] }));
  }, []);

  const clearUsers = useCallback(() => {
    setFilterState((prev) => ({ ...prev, createdByUsers: [] }));
  }, []);

  // Preset filters
  const applyPresetFilter = useCallback(
    (preset: "recent" | "active" | "popular" | "unused") => {
      const now = new Date();

      switch (preset) {
        case "recent":
          setFilterState((prev) => ({
            ...prev,
            lastActivityRange: "7d",
            customDateRange: {},
          }));
          break;

        case "active":
          setFilterState((prev) => ({
            ...prev,
            lastActivityRange: "24h",
            customDateRange: {},
          }));
          break;

        case "popular":
          setFilterState((prev) => ({
            ...prev,
            memberCountRange: { min: 5 },
            lastActivityRange: "30d",
          }));
          break;

        case "unused":
          setFilterState((prev) => ({
            ...prev,
            lastActivityRange: "90d",
            memberCountRange: { max: 2 },
          }));
          break;
      }
    },
    []
  );

  // Generate API query parameters
  const generateQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    if (filterState.tags.length > 0) {
      params.set("tags", filterState.tags.join(","));
    }
    if (filterState.groups.length > 0) {
      params.set("groups", filterState.groups.join(","));
    }
    if (filterState.createdByUsers.length > 0) {
      params.set("createdBy", filterState.createdByUsers.join(","));
    }
    if (
      filterState.lastActivityRange &&
      filterState.lastActivityRange !== "custom"
    ) {
      params.set("activityRange", filterState.lastActivityRange);
    }
    if (filterState.hasRecordings !== null) {
      params.set("hasRecordings", filterState.hasRecordings.toString());
    }
    if (filterState.hasTranscripts !== null) {
      params.set("hasTranscripts", filterState.hasTranscripts.toString());
    }
    if (filterState.memberCountRange.min !== undefined) {
      params.set("minMembers", filterState.memberCountRange.min.toString());
    }
    if (filterState.memberCountRange.max !== undefined) {
      params.set("maxMembers", filterState.memberCountRange.max.toString());
    }
    if (filterState.customDateRange.from) {
      params.set("fromDate", filterState.customDateRange.from.toISOString());
    }
    if (filterState.customDateRange.to) {
      params.set("toDate", filterState.customDateRange.to.toISOString());
    }
    // Filtros de fechas de disponibilidad personalizadas
    if (filterState.customAvailabilityRange.startDate) {
      params.set(
        "availabilityStartDate",
        filterState.customAvailabilityRange.startDate.toISOString()
      );
    }
    if (filterState.customAvailabilityRange.endDate) {
      params.set(
        "availabilityEndDate",
        filterState.customAvailabilityRange.endDate.toISOString()
      );
    }

    return params;
  }, [filterState]);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return (
      filterState.tags.length > 0 ||
      filterState.groups.length > 0 ||
      filterState.createdByUsers.length > 0 ||
      filterState.lastActivityRange !== null ||
      filterState.hasRecordings !== null ||
      filterState.hasTranscripts !== null ||
      filterState.memberCountRange.min !== undefined ||
      filterState.memberCountRange.max !== undefined ||
      filterState.customDateRange.from !== undefined ||
      filterState.customDateRange.to !== undefined ||
      (filterState.search && filterState.search.trim() !== "") ||
      (filterState.dateFilter && filterState.dateFilter !== DateFilter.ALL) ||
      (filterState.roomStatus && filterState.roomStatus.length > 0) ||
      filterState.customAvailabilityRange?.startDate !== undefined ||
      filterState.customAvailabilityRange?.endDate !== undefined
    );
  }, [filterState]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterState.tags.length > 0) count++;
    if (filterState.groups.length > 0) count++;
    if (filterState.createdByUsers.length > 0) count++;
    if (filterState.lastActivityRange !== null) count++;
    if (filterState.hasRecordings !== null) count++;
    if (filterState.hasTranscripts !== null) count++;
    if (
      filterState.memberCountRange.min !== undefined ||
      filterState.memberCountRange.max !== undefined
    )
      count++;
    return count;
  }, [filterState]);

  const availableOptions = useMemo(
    () => ({
      tags: (filterOptions?.tags || []) as FilterOption[],
      groups: (filterOptions?.groups || []) as FilterOption[],
      users: (filterOptions?.users || []) as FilterOption[],
    }),
    [filterOptions]
  );

  return {
    // State
    filterState,
    isAdvancedMode,
    setIsAdvancedMode,

    // Options and stats
    availableOptions,
    filterStats: filterStats as FilterStats,
    isLoading: optionsLoading || statsLoading,

    // Tag actions
    addTag,
    removeTag,
    toggleTag,
    clearTags,

    // Group actions
    addGroup,
    removeGroup,
    toggleGroup,
    clearGroups,

    // User actions
    addUser,
    removeUser,
    clearUsers,

    // Filter actions
    setActivityRange,
    setRecordingsFilter,
    setTranscriptsFilter,
    setMemberCountRange,
    setCustomDateRange,
    setSearchFilter,
    setDateFilter,
    setRoomStatusFilter,
    setCustomAvailabilityRange,

    // Bulk actions
    clearAllFilters,
    applyPresetFilter,

    // Computed values
    hasActiveFilters,
    activeFilterCount,
    generateQueryParams,

    // Utilities
    getFilterSummary: () => {
      const filters: string[] = [];
      if (filterState.tags.length > 0)
        filters.push(`${filterState.tags.length} tags`);
      if (filterState.groups.length > 0)
        filters.push(`${filterState.groups.length} groups`);
      if (filterState.createdByUsers.length > 0)
        filters.push(`${filterState.createdByUsers.length} users`);
      if (filterState.lastActivityRange)
        filters.push(`activity: ${filterState.lastActivityRange}`);
      if (filterState.hasRecordings !== null)
        filters.push(`recordings: ${filterState.hasRecordings ? "yes" : "no"}`);
      if (filterState.hasTranscripts !== null)
        filters.push(
          `transcripts: ${filterState.hasTranscripts ? "yes" : "no"}`
        );
      return filters.join(", ") || "No active filters";
    },
  };
};
