"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { DateTimePicker } from "@/src/components/ui/date-picker";
import { Calendar, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface EditableDateTimeProps {
  dateTimeValue?: {
    dateTime?: string;
    date?: string;
  };
  eventId: string;
  calendarId: string;
  field: "start" | "end";
  label: string;
  currentEvent?: GoogleCalendarEvent;
  onUpdate: (eventId: string, calendarId: string, field: "start" | "end", value: { dateTime?: string; date?: string }, currentEvent?: GoogleCalendarEvent) => Promise<void>;
}

export const EditableDateTime: React.FC<EditableDateTimeProps> = ({
  dateTimeValue,
  eventId,
  calendarId,
  field,
  label,
  currentEvent,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (!dateTimeValue) return undefined;
    const dateStr = dateTimeValue.dateTime || dateTimeValue.date;
    return dateStr ? new Date(dateStr) : undefined;
  });
  const [isAllDay, setIsAllDay] = useState(() => !!dateTimeValue?.date);
  const [isLoading, setIsLoading] = useState(false);

  const formatDisplayDate = () => {
    if (!dateTimeValue) return "Sin fecha";
    
    const dateStr = dateTimeValue.dateTime || dateTimeValue.date;
    if (!dateStr) return "Sin fecha";
    
    const date = new Date(dateStr);
    const isAllDayEvent = !!dateTimeValue.date;
    
    if (isAllDayEvent) {
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } else {
      return format(date, "EEE d MMM, HH:mm", { locale: es });
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!selectedDate || !currentEvent) return;

    setIsLoading(true);
    try {
      let newValue: { dateTime?: string; date?: string };
      
      if (isAllDay) {
        // For all-day events, use date format
        const dateOnlyStr = format(selectedDate, "yyyy-MM-dd");
        newValue = { date: dateOnlyStr };
      } else {
        // For timed events, use dateTime format with timezone
        newValue = { dateTime: selectedDate.toISOString() };
      }

      // Si se está editando el campo de inicio, calcular automáticamente el fin
      if (field === "start" && currentEvent.start && currentEvent.end) {
        try {
          // Calcular duración original
          const originalStart = new Date(currentEvent.start.dateTime || currentEvent.start.date || '');
          const originalEnd = new Date(currentEvent.end.dateTime || currentEvent.end.date || '');
          const originalDuration = originalEnd.getTime() - originalStart.getTime();
          
          // Calcular nuevo fin manteniendo la duración
          const newEndDate = new Date(selectedDate.getTime() + originalDuration);
          
          // Crear valor para el campo end
          let newEndValue: { dateTime?: string; date?: string };
          if (isAllDay) {
            newEndValue = { date: format(newEndDate, "yyyy-MM-dd") };
          } else {
            newEndValue = { dateTime: newEndDate.toISOString() };
          }
          
          // Actualizar tanto el inicio como el fin
          const updatedEvent = {
            ...currentEvent,
            start: newValue,
            end: newEndValue
          };
          
          // Llamar onUpdate con el evento completo actualizado
          await onUpdate(eventId, calendarId, "start", newValue, updatedEvent);
          
          // También actualizar el campo end por separado para asegurar sincronización
          setTimeout(async () => {
            try {
              await onUpdate(eventId, calendarId, "end", newEndValue, updatedEvent);
            } catch (endError) {
              console.warn('Error updating end date after start change:', endError);
            }
          }, 100);
          
        } catch (durationError) {
          console.warn('Error calculating duration, updating only start field:', durationError);
          await onUpdate(eventId, calendarId, field, newValue, currentEvent);
        }
      } else {
        // Para el campo end o si hay error, solo actualizar el campo solicitado
        await onUpdate(eventId, calendarId, field, newValue, currentEvent);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Reset to original values
    if (dateTimeValue) {
      const dateStr = dateTimeValue.dateTime || dateTimeValue.date;
      setSelectedDate(dateStr ? new Date(dateStr) : undefined);
    } else {
      setSelectedDate(undefined);
    }
    setIsAllDay(!!dateTimeValue?.date);
    setIsEditing(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="space-y-3 p-3 bg-muted rounded-lg border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            {label}:
          </label>
          
          {/* Duration info for start field */}
          {field === "start" && currentEvent && (
            <div className="p-2 bg-muted/50 rounded border border-border">
              <div className="text-xs text-muted-foreground mb-1">Duración actual:</div>
              <div className="text-sm font-medium text-foreground">
                {(() => {
                  const start = new Date(currentEvent.start?.dateTime || currentEvent.start?.date || "");
                  const end = new Date(currentEvent.end?.dateTime || currentEvent.end?.date || "");
                  const durationMs = end.getTime() - start.getTime();
                  const hours = Math.floor(durationMs / (1000 * 60 * 60));
                  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                  
                  if (hours > 0 && minutes > 0) {
                    return `${hours}h ${minutes}m`;
                  } else if (hours > 0) {
                    return `${hours}h`;
                  } else if (minutes > 0) {
                    return `${minutes}m`;
                  } else {
                    return "Menos de 1 minuto";
                  }
                })()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Se mantendrá esta duración al cambiar la fecha de inicio
              </div>
            </div>
          )}

          {/* All day toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`all-day-${field}`}
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor={`all-day-${field}`} className="text-sm text-foreground">
              Todo el día
            </label>
          </div>

          {/* Date/Time picker */}
          <DateTimePicker
            value={selectedDate}
            onChange={setSelectedDate}
            granularity={isAllDay ? "day" : "minute"}
            hourCycle={24}
            placeholder={`Seleccionar ${label.toLowerCase()}`}
            className="w-full"
            locale={es}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading || !selectedDate}
            className="h-7 px-2"
          >
            <Check className="h-3 w-3 mr-1" />
            Guardar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-7 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative cursor-pointer hover:bg-accent/20 p-2 rounded transition-colors"
      onClick={handleEdit}
    >
      <div className="flex items-center gap-2">
        {dateTimeValue?.date ? (
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">
            {formatDisplayDate()}
          </div>
          {dateTimeValue?.date && (
            <div className="text-xs text-muted-foreground">
              Todo el día
            </div>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        onClick={handleEdit}
      >
        {dateTimeValue?.date ? (
          <Calendar className="h-3 w-3" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};