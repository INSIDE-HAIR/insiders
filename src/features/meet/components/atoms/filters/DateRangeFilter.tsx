/**
 * DATERANGEFILTER - Componente atómico para filtro de rango de fechas
 * Siguiendo patrones SOLID y Atomic Design
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React from 'react';
import { DateTimeRangePicker } from '@/src/components/ui/date-picker';
import { Button } from '@/src/components/ui/button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/src/lib/utils';

export interface DateRangeFilterProps {
  /** Fecha de inicio del filtro */
  startDate?: Date;
  /** Fecha de fin del filtro */
  endDate?: Date;
  /** Callback cuando cambia la fecha de inicio */
  onStartDateChange?: (date: Date | undefined) => void;
  /** Callback cuando cambia la fecha de fin */
  onEndDateChange?: (date: Date | undefined) => void;
  /** Callback para limpiar el filtro */
  onClear?: () => void;
  /** Si el filtro está deshabilitado */
  disabled?: boolean;
  /** Placeholder para fecha de inicio */
  startPlaceholder?: string;
  /** Placeholder para fecha de fin */
  endPlaceholder?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Tamaño del componente */
  size?: 'sm' | 'default' | 'lg';
}

/**
 * Componente atómico para filtro de rango de fechas
 * Optimizado para uso en barras de filtros
 */
export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  disabled = false,
  startPlaceholder = "Desde",
  endPlaceholder = "Hasta",
  className,
  size = 'default',
}) => {
  const hasActiveFilter = startDate || endDate;

  const sizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn(
      "flex items-center gap-2 flex-wrap sm:flex-nowrap",
      className
    )}>
      <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
        <DateTimeRangePicker
          startValue={startDate}
          endValue={endDate}
          onStartChange={onStartDateChange}
          onEndChange={onEndDateChange}
          disabled={disabled}
          startPlaceholder={startPlaceholder}
          endPlaceholder={endPlaceholder}
          granularity="day"
          hourCycle={24}
          className="w-full"
          startClassName={cn(
            sizeClasses[size],
            size === 'sm' && 'h-8',
            size === 'default' && 'h-9',
            size === 'lg' && 'h-10',
            "flex-1 min-w-[140px]"
          )}
          endClassName={cn(
            sizeClasses[size],
            size === 'sm' && 'h-8',
            size === 'default' && 'h-9', 
            size === 'lg' && 'h-10',
            "flex-1 min-w-[140px]"
          )}
        />
      </div>

      {hasActiveFilter && onClear && (
        <Button
          variant="ghost"
          size={size === 'sm' ? 'sm' : 'icon'}
          onClick={onClear}
          className={cn(
            "flex-shrink-0",
            size === 'sm' && 'h-8 w-8',
            size === 'default' && 'h-9 w-9',
            size === 'lg' && 'h-10 w-10'
          )}
          title="Limpiar filtro de fechas"
        >
          <XMarkIcon className={cn(
            size === 'sm' && 'h-3 w-3',
            size === 'default' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )} />
        </Button>
      )}
    </div>
  );
};

DateRangeFilter.displayName = "DateRangeFilter";