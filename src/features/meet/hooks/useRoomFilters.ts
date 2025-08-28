import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateFilter, RoomFilters, RoomStatus } from '../types/room-dates.types';

export function useRoomFilters(initialFilters?: Partial<RoomFilters>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado de filtros
  const [filters, setFilters] = useState<RoomFilters>({
    search: initialFilters?.search || searchParams.get('search') || '',
    dateFilter: (initialFilters?.dateFilter || searchParams.get('dateFilter') || DateFilter.ALL) as DateFilter,
    tags: initialFilters?.tags || [],
    groups: initialFilters?.groups || [],
    status: initialFilters?.status || [],
    customDateRange: initialFilters?.customDateRange
  });

  // Actualizar filtro de búsqueda
  const setSearchFilter = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  // Actualizar filtro de fecha
  const setDateFilter = useCallback((dateFilter: DateFilter) => {
    setFilters(prev => ({ ...prev, dateFilter }));
  }, []);

  // Actualizar filtro de tags
  const setTagsFilter = useCallback((tags: string[]) => {
    setFilters(prev => ({ ...prev, tags }));
  }, []);

  // Actualizar filtro de grupos
  const setGroupsFilter = useCallback((groups: string[]) => {
    setFilters(prev => ({ ...prev, groups }));
  }, []);

  // Actualizar filtro de estado
  const setStatusFilter = useCallback((status: RoomStatus[]) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  // Actualizar rango de fechas personalizado
  const setCustomDateRange = useCallback((start?: Date, end?: Date) => {
    setFilters(prev => ({ 
      ...prev, 
      customDateRange: start || end ? { start, end } : undefined 
    }));
  }, []);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      dateFilter: DateFilter.ALL,
      tags: [],
      groups: [],
      status: [],
      customDateRange: undefined
    });
  }, []);

  // Sincronizar con URL params
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) {
      params.set('search', filters.search);
    }
    
    if (filters.dateFilter && filters.dateFilter !== DateFilter.ALL) {
      params.set('dateFilter', filters.dateFilter);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','));
    }
    
    if (filters.groups && filters.groups.length > 0) {
      params.set('groups', filters.groups.join(','));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    
    // Solo actualizar si la URL cambió
    if (window.location.search !== (queryString ? `?${queryString}` : '')) {
      router.replace(newUrl);
    }
  }, [filters, router]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      (filters.dateFilter && filters.dateFilter !== DateFilter.ALL) ||
      (filters.tags && filters.tags.length > 0) ||
      (filters.groups && filters.groups.length > 0) ||
      (filters.status && filters.status.length > 0) ||
      filters.customDateRange
    );
  }, [filters]);

  return {
    filters,
    setSearchFilter,
    setDateFilter,
    setTagsFilter,
    setGroupsFilter,
    setStatusFilter,
    setCustomDateRange,
    clearFilters,
    hasActiveFilters: hasActiveFilters()
  };
}