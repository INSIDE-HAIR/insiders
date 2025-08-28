/**
 * ROOMDATERANGEFIELD - Componente molecular para fechas de salas
 * Siguiendo patrones SOLID y Atomic Design
 * Combina DateTimeRangeInput con etiquetas, validaciones y estados
 * 
 * @author Claude Code  
 * @version 1.0.0
 */

import React from 'react';
import { DateTimeRangeInput } from '../../atoms/forms/DateTimeRangeInput';
import { FieldLabel } from '../../atoms/text/FieldLabel';
import { cn } from '@/src/lib/utils';
import { CalendarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Alert, AlertDescription } from '@/src/components/ui/alert';

export interface RoomDateRangeFieldProps {
  /** Valor de fecha de inicio */
  startDate?: string; // ISO string
  /** Valor de fecha de fin */
  endDate?: string; // ISO string
  /** Callback cuando cambia la fecha de inicio */
  onStartDateChange?: (date: string | undefined) => void;
  /** Callback cuando cambia la fecha de fin */
  onEndDateChange?: (date: string | undefined) => void;
  /** Si el campo está deshabilitado */
  disabled?: boolean;
  /** Mostrar como requerido */
  required?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Mostrar información adicional */
  showHelp?: boolean;
  /** Texto de ayuda personalizado */
  helpText?: string;
  /** Modo de visualización */
  variant?: 'default' | 'compact' | 'inline';
}

/**
 * Campo molecular para selección de fechas de salas
 * Maneja conversión entre ISO strings y Date objects
 * Incluye validaciones y estados visuales
 */
export const RoomDateRangeField: React.FC<RoomDateRangeFieldProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  required = false,
  className,
  showHelp = true,
  helpText,
  variant = 'default',
}) => {
  // Convertir strings ISO a Date objects
  const startDateObj = startDate ? new Date(startDate) : undefined;
  const endDateObj = endDate ? new Date(endDate) : undefined;

  // Manejar cambios de fecha y convertir a ISO strings
  const handleStartChange = (date: Date | undefined) => {
    onStartDateChange?.(date ? date.toISOString() : undefined);
  };

  const handleEndChange = (date: Date | undefined) => {
    onEndDateChange?.(date ? date.toISOString() : undefined);
  };

  // Determinar el estado de la sala basado en las fechas
  const getRoomStatusMessage = () => {
    if (!startDate && !endDate) {
      return "La sala estará disponible inmediatamente y sin fecha límite";
    }
    if (!startDate && endDate) {
      return "La sala estará disponible inmediatamente hasta la fecha especificada";
    }
    if (startDate && !endDate) {
      return "La sala estará disponible desde la fecha especificada sin fecha límite";
    }
    return "La sala estará disponible en el rango de fechas especificado";
  };

  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  return (
    <div className={cn(
      "space-y-3",
      isCompact && "space-y-2",
      isInline && "flex items-start gap-4",
      className
    )}>
      {/* Etiqueta principal */}
      <div className={cn(
        isInline && "flex-shrink-0 w-32"
      )}>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <FieldLabel 
            className={cn(
              "text-sm font-medium",
              isCompact && "text-xs"
            )}
          >
            Fechas de Disponibilidad
            {required && <span className="text-destructive ml-1">*</span>}
          </FieldLabel>
        </div>
        
        {!isCompact && !isInline && (
          <p className="text-xs text-muted-foreground mt-1">
            Configura cuándo estará disponible la sala
          </p>
        )}
      </div>

      {/* Campo de selección de fechas */}
      <div className={cn(
        isInline && "flex-1"
      )}>
        <DateTimeRangeInput
          startValue={startDateObj}
          endValue={endDateObj}
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
          disabled={disabled}
          required={required}
          showRequired={required}
          startPlaceholder="Fecha y hora de inicio (opcional)"
          endPlaceholder="Fecha y hora de fin (opcional)"
          granularity="minute"
          hourCycle={24}
        />
      </div>

      {/* Información de ayuda */}
      {showHelp && !isCompact && (
        <Alert>
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {helpText || getRoomStatusMessage()}
          </AlertDescription>
        </Alert>
      )}

      {/* Estado visual del rango */}
      {(startDate || endDate) && !isCompact && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="text-xs font-medium text-primary mb-1">
            Estado configurado:
          </div>
          <div className="text-xs text-muted-foreground">
            {getRoomStatusMessage()}
          </div>
        </div>
      )}
    </div>
  );
};

RoomDateRangeField.displayName = "RoomDateRangeField";