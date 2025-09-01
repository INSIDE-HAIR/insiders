/**
 * useColumnVisibility - UI Hook
 * 
 * Hook para gestionar visibilidad de columnas
 * Extraído de la lógica existente en ColumnController y DataTable
 * Centraliza el manejo de columnas visibles y persistencia en localStorage
 */

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  required?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  resizable?: boolean;
  group?: string;
}

interface UseColumnVisibilityOptions {
  columns: Omit<ColumnConfig, 'visible'>[];
  storageKey?: string;
  defaultVisible?: string[];
  requiredColumns?: string[];
}

interface UseColumnVisibilityReturn {
  columns: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  hiddenColumns: ColumnConfig[];
  columnVisibility: Record<string, boolean>;
  
  // Actions
  toggleColumn: (columnId: string) => void;
  showColumn: (columnId: string) => void;
  hideColumn: (columnId: string) => void;
  showAllColumns: () => void;
  hideAllColumns: () => void;
  resetToDefault: () => void;
  
  // Bulk operations
  toggleMultipleColumns: (columnIds: string[], visible: boolean) => void;
  showOnlyColumns: (columnIds: string[]) => void;
  
  // Groups
  columnGroups: Record<string, ColumnConfig[]>;
  toggleGroup: (groupName: string) => void;
  
  // Utils
  isColumnVisible: (columnId: string) => boolean;
  getVisibleColumnIds: () => string[];
  getHiddenColumnIds: () => string[];
  canHideColumn: (columnId: string) => boolean;
}

export const useColumnVisibility = (
  options: UseColumnVisibilityOptions
): UseColumnVisibilityReturn => {
  const {
    columns: initialColumns,
    storageKey = 'calendar-column-visibility',
    defaultVisible = [],
    requiredColumns = [],
  } = options;

  // Inicializar estado de visibilidad
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    // Intentar cargar desde localStorage
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed;
        }
      } catch (error) {
        console.warn('Error loading column visibility from localStorage:', error);
      }
    }

    // Configuración por defecto
    const defaultVisibility: Record<string, boolean> = {};
    initialColumns.forEach(column => {
      if (requiredColumns.includes(column.id)) {
        defaultVisibility[column.id] = true;
      } else if (defaultVisible.length > 0) {
        defaultVisibility[column.id] = defaultVisible.includes(column.id);
      } else {
        defaultVisibility[column.id] = true;
      }
    });

    return defaultVisibility;
  });

  // Persistir en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
      } catch (error) {
        console.warn('Error saving column visibility to localStorage:', error);
      }
    }
  }, [columnVisibility, storageKey]);

  // Agregar estado de visibilidad a las columnas
  const columns = useMemo(() => {
    return initialColumns.map(column => ({
      ...column,
      visible: columnVisibility[column.id] ?? true,
      required: requiredColumns.includes(column.id),
    }));
  }, [initialColumns, columnVisibility, requiredColumns]);

  // Columnas visibles y ocultas
  const visibleColumns = useMemo(() => {
    return columns.filter(col => col.visible);
  }, [columns]);

  const hiddenColumns = useMemo(() => {
    return columns.filter(col => !col.visible);
  }, [columns]);

  // Grupos de columnas
  const columnGroups = useMemo(() => {
    const groups: Record<string, ColumnConfig[]> = {};
    columns.forEach(column => {
      const groupName = column.group || 'default';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(column);
    });
    return groups;
  }, [columns]);

  // Determinar si una columna se puede ocultar
  const canHideColumn = useCallback((columnId: string) => {
    return !requiredColumns.includes(columnId);
  }, [requiredColumns]);

  // Togglear visibilidad de una columna
  const toggleColumn = useCallback((columnId: string) => {
    if (!canHideColumn(columnId)) return;
    
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, [canHideColumn]);

  // Mostrar columna
  const showColumn = useCallback((columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: true,
    }));
  }, []);

  // Ocultar columna
  const hideColumn = useCallback((columnId: string) => {
    if (!canHideColumn(columnId)) return;
    
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: false,
    }));
  }, [canHideColumn]);

  // Mostrar todas las columnas
  const showAllColumns = useCallback(() => {
    const newVisibility: Record<string, boolean> = {};
    initialColumns.forEach(column => {
      newVisibility[column.id] = true;
    });
    setColumnVisibility(newVisibility);
  }, [initialColumns]);

  // Ocultar todas las columnas (excepto las requeridas)
  const hideAllColumns = useCallback(() => {
    const newVisibility: Record<string, boolean> = {};
    initialColumns.forEach(column => {
      newVisibility[column.id] = requiredColumns.includes(column.id);
    });
    setColumnVisibility(newVisibility);
  }, [initialColumns, requiredColumns]);

  // Resetear a configuración por defecto
  const resetToDefault = useCallback(() => {
    const defaultVisibility: Record<string, boolean> = {};
    initialColumns.forEach(column => {
      if (requiredColumns.includes(column.id)) {
        defaultVisibility[column.id] = true;
      } else if (defaultVisible.length > 0) {
        defaultVisibility[column.id] = defaultVisible.includes(column.id);
      } else {
        defaultVisibility[column.id] = true;
      }
    });
    setColumnVisibility(defaultVisibility);
  }, [initialColumns, requiredColumns, defaultVisible]);

  // Operaciones masivas
  const toggleMultipleColumns = useCallback((columnIds: string[], visible: boolean) => {
    const newVisibility = { ...columnVisibility };
    columnIds.forEach(columnId => {
      if (visible || canHideColumn(columnId)) {
        newVisibility[columnId] = visible;
      }
    });
    setColumnVisibility(newVisibility);
  }, [columnVisibility, canHideColumn]);

  const showOnlyColumns = useCallback((columnIds: string[]) => {
    const newVisibility: Record<string, boolean> = {};
    initialColumns.forEach(column => {
      if (requiredColumns.includes(column.id)) {
        newVisibility[column.id] = true;
      } else {
        newVisibility[column.id] = columnIds.includes(column.id);
      }
    });
    setColumnVisibility(newVisibility);
  }, [initialColumns, requiredColumns]);

  // Togglear grupo completo
  const toggleGroup = useCallback((groupName: string) => {
    const groupColumns = columnGroups[groupName] || [];
    const allVisible = groupColumns.every(col => col.visible);
    const newVisible = !allVisible;
    
    toggleMultipleColumns(
      groupColumns.map(col => col.id),
      newVisible
    );
  }, [columnGroups, toggleMultipleColumns]);

  // Utilidades
  const isColumnVisible = useCallback((columnId: string) => {
    return columnVisibility[columnId] ?? true;
  }, [columnVisibility]);

  const getVisibleColumnIds = useCallback(() => {
    return visibleColumns.map(col => col.id);
  }, [visibleColumns]);

  const getHiddenColumnIds = useCallback(() => {
    return hiddenColumns.map(col => col.id);
  }, [hiddenColumns]);

  return {
    columns,
    visibleColumns,
    hiddenColumns,
    columnVisibility,
    
    // Actions
    toggleColumn,
    showColumn,
    hideColumn,
    showAllColumns,
    hideAllColumns,
    resetToDefault,
    
    // Bulk operations
    toggleMultipleColumns,
    showOnlyColumns,
    
    // Groups
    columnGroups,
    toggleGroup,
    
    // Utils
    isColumnVisible,
    getVisibleColumnIds,
    getHiddenColumnIds,
    canHideColumn,
  };
};