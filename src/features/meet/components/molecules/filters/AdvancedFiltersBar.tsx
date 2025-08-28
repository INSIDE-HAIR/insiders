/**
 * ADVANCEDFILTERSBAR - Componente molecular para barra de filtros avanzados
 * Siguiendo patrones SOLID y Atomic Design
 * Combina múltiples filtros incluyendo fechas, búsqueda y estados
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React from "react";
import { DateRangeFilter } from "../../atoms/filters/DateRangeFilter";
import { RoomDateFilters } from "../../filters/RoomDateFilters";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";
import { DateFilter, RoomStatus } from "../../../types/room-dates.types";

export interface AdvancedFiltersBarProps {
  /** Término de búsqueda */
  searchTerm?: string;
  /** Callback de cambio de búsqueda */
  onSearchChange?: (search: string) => void;
  /** Filtro de fecha seleccionado */
  dateFilter?: DateFilter;
  /** Callback de cambio de filtro de fecha */
  onDateFilterChange?: (filter: DateFilter) => void;
  /** Fecha de inicio personalizada */
  customStartDate?: Date;
  /** Fecha de fin personalizada */
  customEndDate?: Date;
  /** Callback de fecha de inicio personalizada */
  onCustomStartDateChange?: (date: Date | undefined) => void;
  /** Callback de fecha de fin personalizada */
  onCustomEndDateChange?: (date: Date | undefined) => void;
  /** Estados de sala seleccionados */
  selectedStatuses?: RoomStatus[];
  /** Callback de cambio de estados */
  onStatusChange?: (statuses: RoomStatus[]) => void;
  /** Callback para limpiar todos los filtros */
  onClearAll?: () => void;
  /** Si hay filtros activos */
  hasActiveFilters?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Variante del componente */
  variant?: "default" | "compact" | "full";
}

/**
 * Barra de filtros molecular que combina múltiples filtros
 * Incluye búsqueda, fechas predefinidas, rango personalizado y estado
 */
export const AdvancedFiltersBar: React.FC<AdvancedFiltersBarProps> = ({
  searchTerm,
  onSearchChange,
  dateFilter = DateFilter.ALL,
  onDateFilterChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
  selectedStatuses = [],
  onStatusChange,
  onClearAll,
  hasActiveFilters = false,
  className,
  variant = "default",
}) => {
  const isCompact = variant === "compact";
  const isFull = variant === "full";
  const hasCustomDateFilter = customStartDate || customEndDate;

  // Contar filtros activos
  const activeFiltersCount = [
    searchTerm && searchTerm.trim() !== "",
    dateFilter && dateFilter !== DateFilter.ALL,
    hasCustomDateFilter,
    selectedStatuses.length > 0,
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-4", isCompact && "space-y-2", className)}>
      <div className='space-y-4'>
        {/* Row 1: Search */}
        <div>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Buscar salas
          </label>
          <div className='relative'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Buscar por nombre, ID o código de sala...'
              value={searchTerm || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className={cn("w-full pl-10", isCompact ? "h-8 text-xs" : "h-9")}
            />
          </div>
        </div>

        {/* Row 2: Period Presets */}
        {!isCompact && (
          <div>
            <label className='block text-sm font-medium text-foreground mb-2'>
              Período
            </label>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant={dateFilter === DateFilter.ALL ? "default" : "outline"}
                size='sm'
                onClick={() => {
                  onDateFilterChange?.(DateFilter.ALL);
                  // Limpiar fechas personalizadas
                  if (customStartDate || customEndDate) {
                    onCustomStartDateChange?.(undefined);
                    onCustomEndDateChange?.(undefined);
                  }
                }}
                className='text-xs'
              >
                Todos
              </Button>
              <Button
                variant={dateFilter === DateFilter.TODAY ? "default" : "outline"}
                size='sm'
                onClick={() => {
                  onDateFilterChange?.(DateFilter.TODAY);
                  // Limpiar fechas personalizadas
                  if (customStartDate || customEndDate) {
                    onCustomStartDateChange?.(undefined);
                    onCustomEndDateChange?.(undefined);
                  }
                }}
                className='text-xs'
              >
                Hoy
              </Button>
              <Button
                variant={dateFilter === DateFilter.THIS_WEEK ? "default" : "outline"}
                size='sm'
                onClick={() => {
                  onDateFilterChange?.(DateFilter.THIS_WEEK);
                  // Limpiar fechas personalizadas
                  if (customStartDate || customEndDate) {
                    onCustomStartDateChange?.(undefined);
                    onCustomEndDateChange?.(undefined);
                  }
                }}
                className='text-xs'
              >
                Esta semana
              </Button>
              <Button
                variant={dateFilter === DateFilter.THIS_MONTH ? "default" : "outline"}
                size='sm'
                onClick={() => {
                  onDateFilterChange?.(DateFilter.THIS_MONTH);
                  // Limpiar fechas personalizadas
                  if (customStartDate || customEndDate) {
                    onCustomStartDateChange?.(undefined);
                    onCustomEndDateChange?.(undefined);
                  }
                }}
                className='text-xs'
              >
                Este mes
              </Button>
              <Button
                variant={dateFilter === DateFilter.UPCOMING ? "default" : "outline"}
                size='sm'
                onClick={() => {
                  onDateFilterChange?.(DateFilter.UPCOMING);
                  // Limpiar fechas personalizadas
                  if (customStartDate || customEndDate) {
                    onCustomStartDateChange?.(undefined);
                    onCustomEndDateChange?.(undefined);
                  }
                }}
                className='text-xs'
              >
                Próximos
              </Button>
              <Button
                variant={dateFilter === DateFilter.PAST ? "default" : "outline"}
                size='sm'
                onClick={() => {
                  onDateFilterChange?.(DateFilter.PAST);
                  // Limpiar fechas personalizadas
                  if (customStartDate || customEndDate) {
                    onCustomStartDateChange?.(undefined);
                    onCustomEndDateChange?.(undefined);
                  }
                }}
                className='text-xs'
              >
                Pasados
              </Button>
              <Button
                variant={dateFilter === DateFilter.CUSTOM ? "default" : "outline"}
                size='sm'
                onClick={() => onDateFilterChange?.(DateFilter.CUSTOM)}
                className='text-xs'
              >
                <FunnelIcon className='h-3 w-3 mr-1' />
                Personalizado
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Date Range Picker - Only show when dateFilter is 'custom' */}
      {dateFilter === DateFilter.CUSTOM && !isCompact && (
        <div className='mt-4'>
          <DateRangeFilter
            startDate={customStartDate}
            endDate={customEndDate}
            onStartDateChange={onCustomStartDateChange}
            onEndDateChange={onCustomEndDateChange}
            onClear={() => {
              onCustomStartDateChange?.(undefined);
              onCustomEndDateChange?.(undefined);
            }}
            size={isCompact ? "sm" : "default"}
            className='max-w-md'
          />
        </div>
      )}

      {/* Clear Filters Button */}
      {(hasActiveFilters || activeFiltersCount > 0) && onClearAll && (
        <div className='flex justify-start'>
          <Button
            variant='outline'
            size={isCompact ? "sm" : "default"}
            onClick={onClearAll}
            className='flex-shrink-0'
          >
            <XMarkIcon
              className={cn(isCompact ? "h-3 w-3" : "h-4 w-4", "mr-2")}
            />
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Indicadores de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-xs text-muted-foreground'>
            Filtros activos:
          </span>

          {searchTerm && searchTerm.trim() !== "" && (
            <Badge variant='secondary' className='text-xs'>
              Búsqueda: &quot;{searchTerm}&quot;
            </Badge>
          )}

          {dateFilter && dateFilter !== DateFilter.ALL && (
            <Badge variant='secondary' className='text-xs'>
              {dateFilter === DateFilter.CUSTOM && hasCustomDateFilter
                ? "Rango personalizado"
                : `Período: ${dateFilter}`}
            </Badge>
          )}

          {selectedStatuses.length > 0 && (
            <Badge variant='secondary' className='text-xs'>
              Estados: {selectedStatuses.length}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

AdvancedFiltersBar.displayName = "AdvancedFiltersBar";
