/**
 * useTableControls - UI Hook
 * 
 * Hook para gestionar controles de tabla
 * Extraído de la lógica existente en DataTable y page.tsx
 * Centraliza manejo de paginación, sorting, selección y filtros
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface TableSortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface TablePaginationConfig {
  page: number;
  pageSize: number;
}

interface UseTableControlsOptions {
  initialPageSize?: number;
  initialSortConfig?: TableSortConfig;
  enableSelection?: boolean;
  enableMultiSelect?: boolean;
}

interface UseTableControlsReturn {
  // Sorting
  sortConfig: TableSortConfig | null;
  setSortConfig: (config: TableSortConfig | null) => void;
  handleSort: (key: string) => void;
  
  // Pagination
  pagination: TablePaginationConfig;
  setPagination: (config: Partial<TablePaginationConfig>) => void;
  goToPage: (page: number) => void;
  changePageSize: (pageSize: number) => void;
  
  // Selection
  selectedItems: Set<string>;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: (items: GoogleCalendarEvent[]) => void;
  deselectAll: () => void;
  toggleSelectAll: (items: GoogleCalendarEvent[]) => void;
  isSelected: (id: string) => boolean;
  isAllSelected: (items: GoogleCalendarEvent[]) => boolean;
  isIndeterminate: (items: GoogleCalendarEvent[]) => boolean;
  selectedCount: number;
  
  // Data processing
  processData: <T extends { id: string }>(
    data: T[],
    searchTerm?: string,
    searchFields?: (keyof T)[],
    filters?: Record<string, any>
  ) => {
    filteredData: T[];
    paginatedData: T[];
    totalItems: number;
    totalPages: number;
  };
}

export const useTableControls = (
  options: UseTableControlsOptions = {}
): UseTableControlsReturn => {
  const {
    initialPageSize = 50,
    initialSortConfig,
    enableSelection = true,
    enableMultiSelect = true,
  } = options;

  // Estados
  const [sortConfig, setSortConfig] = useState<TableSortConfig | null>(
    initialSortConfig || null
  );
  const [pagination, setPaginationState] = useState<TablePaginationConfig>({
    page: 1,
    pageSize: initialPageSize,
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Sorting
  const handleSort = useCallback((key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null; // Remove sorting
    });
    
    // Reset a primera página cuando se cambie el sorting
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  // Pagination
  const setPagination = useCallback((config: Partial<TablePaginationConfig>) => {
    setPaginationState(prev => ({ ...prev, ...config }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination({ page });
  }, [setPagination]);

  const changePageSize = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize });
  }, [setPagination]);

  // Selection
  const selectItem = useCallback((id: string) => {
    if (!enableSelection) return;
    setSelectedItems(prev => new Set([...prev, id]));
  }, [enableSelection]);

  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    if (!enableSelection) return;
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!enableMultiSelect) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  }, [enableSelection, enableMultiSelect]);

  const selectAll = useCallback((items: GoogleCalendarEvent[]) => {
    if (!enableSelection || !enableMultiSelect) return;
    setSelectedItems(new Set(items.map(item => item.id).filter((id): id is string => Boolean(id))));
  }, [enableSelection, enableMultiSelect]);

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const toggleSelectAll = useCallback((items: GoogleCalendarEvent[]) => {
    if (!enableSelection || !enableMultiSelect) return;
    
    const allSelected = items.length > 0 && items.every(item => item.id && selectedItems.has(item.id));
    
    if (allSelected) {
      deselectAll();
    } else {
      selectAll(items);
    }
  }, [enableSelection, enableMultiSelect, selectedItems, selectAll, deselectAll]);

  const isSelected = useCallback((id: string) => {
    return selectedItems.has(id);
  }, [selectedItems]);

  const isAllSelected = useCallback((items: GoogleCalendarEvent[]) => {
    return items.length > 0 && items.every(item => item.id && selectedItems.has(item.id));
  }, [selectedItems]);

  const isIndeterminate = useCallback((items: GoogleCalendarEvent[]) => {
    const selectedCount = items.filter(item => item.id && selectedItems.has(item.id)).length;
    return selectedCount > 0 && selectedCount < items.length;
  }, [selectedItems]);

  const selectedCount = selectedItems.size;

  // Función para procesar datos (filtrar, ordenar, paginar)
  const processData = useCallback(<T extends { id: string }>(
    data: T[],
    searchTerm?: string,
    searchFields?: (keyof T)[],
    filters?: Record<string, any>
  ) => {
    let filteredData = [...data];

    // Aplicar búsqueda por texto
    if (searchTerm && searchFields && searchFields.length > 0) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item =>
        searchFields.some(field => {
          const fieldValue = item[field];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(lowerSearchTerm);
          }
          if (typeof fieldValue === 'object' && fieldValue !== null) {
            return JSON.stringify(fieldValue).toLowerCase().includes(lowerSearchTerm);
          }
          return false;
        })
      );
    }

    // Aplicar filtros adicionales
    if (filters) {
      filteredData = filteredData.filter(item => {
        return Object.entries(filters).every(([key, filterValue]) => {
          if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
            return true;
          }
          
          const itemValue = (item as any)[key];
          
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue);
          }
          
          if (typeof filterValue === 'object' && filterValue.start && filterValue.end) {
            const itemDate = new Date(itemValue);
            return itemDate >= new Date(filterValue.start) && itemDate <= new Date(filterValue.end);
          }
          
          return itemValue === filterValue;
        });
      });
    }

    // Aplicar ordenamiento
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    // Calcular paginación
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      filteredData,
      paginatedData,
      totalItems,
      totalPages,
    };
  }, [sortConfig, pagination]);

  return {
    // Sorting
    sortConfig,
    setSortConfig,
    handleSort,
    
    // Pagination
    pagination,
    setPagination,
    goToPage,
    changePageSize,
    
    // Selection
    selectedItems,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectedCount,
    
    // Data processing
    processData,
  };
};