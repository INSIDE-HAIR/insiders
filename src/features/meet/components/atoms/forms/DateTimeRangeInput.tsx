/**
 * DATETIMERANGEINPUT - Componente atómico para selección de fechas
 * Siguiendo patrones SOLID y Atomic Design
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React from 'react';
import { DateTimeRangePicker } from '@/src/components/ui/date-picker';
import { cn } from '@/src/lib/utils';

export interface DateTimeRangeInputProps {
  /** Valor de fecha de inicio */
  startValue?: Date;
  /** Valor de fecha de fin */
  endValue?: Date;
  /** Callback cuando cambia la fecha de inicio */
  onStartChange?: (date: Date | undefined) => void;
  /** Callback cuando cambia la fecha de fin */
  onEndChange?: (date: Date | undefined) => void;
  /** Si el input está deshabilitado */
  disabled?: boolean;
  /** Placeholder para fecha de inicio */
  startPlaceholder?: string;
  /** Placeholder para fecha de fin */
  endPlaceholder?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Si es requerido */
  required?: boolean;
  /** Mostrar asterisco de requerido */
  showRequired?: boolean;
  /** Granularidad del picker (day, hour, minute, second) */
  granularity?: 'day' | 'hour' | 'minute' | 'second';
  /** Formato de hora (12 o 24) */
  hourCycle?: 12 | 24;
}

/**
 * Componente atómico para selección de rango de fechas y horas
 * Utiliza el DateTimeRangePicker base con props optimizadas
 */
export const DateTimeRangeInput: React.FC<DateTimeRangeInputProps> = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  disabled = false,
  startPlaceholder = "Seleccionar fecha de inicio",
  endPlaceholder = "Seleccionar fecha de fin",
  className,
  required = false,
  showRequired = false,
  granularity = 'minute',
  hourCycle = 24,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <DateTimeRangePicker
        startValue={startValue}
        endValue={endValue}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        disabled={disabled}
        startPlaceholder={startPlaceholder}
        endPlaceholder={endPlaceholder}
        granularity={granularity}
        hourCycle={hourCycle}
        className="w-full"
      />
      
      {required && showRequired && !startValue && (
        <div className="text-sm text-destructive">
          La fecha de inicio es requerida
        </div>
      )}
      
      {startValue && endValue && endValue < startValue && (
        <div className="text-sm text-destructive">
          La fecha de fin debe ser posterior a la fecha de inicio
        </div>
      )}
    </div>
  );
};

DateTimeRangeInput.displayName = "DateTimeRangeInput";