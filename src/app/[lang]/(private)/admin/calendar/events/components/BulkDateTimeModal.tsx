"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { DateTimePicker } from "@/src/components/ui/date-picker";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Icons } from "@/src/components/shared/icons";
import { toast } from "@/src/components/ui/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface BulkDateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvents: GoogleCalendarEvent[];
  onUpdate: (updates: Array<{
    eventId: string;
    calendarId: string;
    updateData: any;
  }>) => Promise<void>;
}

type UpdateMode = "move" | "reschedule" | "adjust-duration" | "change-time-only";
type TimeAdjustment = "minutes" | "hours" | "days";

export const BulkDateTimeModal: React.FC<BulkDateTimeModalProps> = ({
  isOpen,
  onClose,
  selectedEvents,
  onUpdate,
}) => {
  const [updateMode, setUpdateMode] = useState<UpdateMode>("move");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isAllDay, setIsAllDay] = useState(false);
  const [preserveDuration, setPreserveDuration] = useState(true);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(1);
  const [adjustmentUnit, setAdjustmentUnit] = useState<TimeAdjustment>("hours");
  const [adjustmentDirection, setAdjustmentDirection] = useState<"forward" | "backward">("forward");
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate adjustment milliseconds
  const getAdjustmentMs = () => {
    const multipliers = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };
    
    const ms = adjustmentValue * multipliers[adjustmentUnit];
    return adjustmentDirection === "forward" ? ms : -ms;
  };

  // Preview function to show what the changes will look like
  const getPreviewData = () => {
    if (!selectedEvents.length) return [];
    
    return selectedEvents.slice(0, 3).map(event => {
      const currentStart = new Date(event.start?.dateTime || event.start?.date || "");
      const currentEnd = new Date(event.end?.dateTime || event.end?.date || "");
      
      let newStart: Date;
      let newEnd: Date;
      
      if (updateMode === "move" && selectedDate) {
        newStart = selectedDate;
        if (preserveDuration) {
          const duration = currentEnd.getTime() - currentStart.getTime();
          newEnd = new Date(newStart.getTime() + duration);
        } else {
          // Default 1 hour duration for new events
          newEnd = new Date(newStart.getTime() + (60 * 60 * 1000));
        }
      } else if (updateMode === "change-time-only" && selectedDate) {
        // Keep the original date but change the time
        const targetHours = selectedDate.getHours();
        const targetMinutes = selectedDate.getMinutes();
        
        newStart = new Date(currentStart);
        newStart.setHours(targetHours, targetMinutes, 0, 0);
        
        if (preserveDuration) {
          const duration = currentEnd.getTime() - currentStart.getTime();
          newEnd = new Date(newStart.getTime() + duration);
        } else {
          // Default 1 hour duration
          newEnd = new Date(newStart.getTime() + (60 * 60 * 1000));
        }
      } else if (updateMode === "adjust-duration") {
        newStart = currentStart;
        const adjustmentMs = getAdjustmentMs();
        newEnd = new Date(currentEnd.getTime() + adjustmentMs);
        
        // Validate that end is after start
        if (newEnd <= newStart) {
          newEnd = new Date(newStart.getTime() + (15 * 60 * 1000)); // Minimum 15 minutes
        }
      } else if (updateMode === "reschedule") {
        const adjustmentMs = getAdjustmentMs();
        newStart = new Date(currentStart.getTime() + adjustmentMs);
        if (preserveDuration) {
          const duration = currentEnd.getTime() - currentStart.getTime();
          newEnd = new Date(newStart.getTime() + duration);
        } else {
          newEnd = new Date(currentEnd.getTime() + adjustmentMs);
        }
      } else {
        return null;
      }
      
      return {
        event,
        currentStart,
        currentEnd,
        newStart,
        newEnd,
      };
    }).filter(Boolean);
  };

  const handleUpdate = async () => {
    if (!selectedEvents.length) return;

    setIsUpdating(true);
    
    try {
      const updates = selectedEvents.map(event => {
        const currentStart = new Date(event.start?.dateTime || event.start?.date || "");
        const currentEnd = new Date(event.end?.dateTime || event.end?.date || "");
        
        let updateData: any = {};
        
        if (updateMode === "move" && selectedDate) {
          const newStart = selectedDate;
          let newEnd: Date;
          
          if (preserveDuration) {
            const duration = currentEnd.getTime() - currentStart.getTime();
            const minDuration = isAllDay ? 0 : 15 * 60 * 1000; // 15 minutes minimum for timed events
            const adjustedDuration = Math.max(duration, minDuration);
            newEnd = new Date(newStart.getTime() + adjustedDuration);
          } else {
            newEnd = new Date(newStart.getTime() + (60 * 60 * 1000)); // Default 1 hour
          }
          
          updateData = {
            start: isAllDay 
              ? { date: format(newStart, "yyyy-MM-dd") }
              : { dateTime: newStart.toISOString() },
            end: isAllDay 
              ? { date: format(newEnd, "yyyy-MM-dd") }
              : { dateTime: newEnd.toISOString() }
          };
        } else if (updateMode === "change-time-only" && selectedDate) {
          // Keep original date but change time
          const targetHours = selectedDate.getHours();
          const targetMinutes = selectedDate.getMinutes();
          
          const newStart = new Date(currentStart);
          newStart.setHours(targetHours, targetMinutes, 0, 0);
          
          let newEnd: Date;
          if (preserveDuration) {
            const duration = currentEnd.getTime() - currentStart.getTime();
            const minDuration = 15 * 60 * 1000; // 15 minutes minimum
            const adjustedDuration = Math.max(duration, minDuration);
            newEnd = new Date(newStart.getTime() + adjustedDuration);
          } else {
            newEnd = new Date(newStart.getTime() + (60 * 60 * 1000)); // Default 1 hour
          }
          
          updateData = {
            start: { dateTime: newStart.toISOString() },
            end: { dateTime: newEnd.toISOString() }
          };
        } else if (updateMode === "adjust-duration") {
          const adjustmentMs = getAdjustmentMs();
          const newEnd = new Date(currentEnd.getTime() + adjustmentMs);
          
          // Validate that end is after start with minimum 15 minutes
          const minEndTime = new Date(currentStart.getTime() + (15 * 60 * 1000));
          const finalEndTime = newEnd > minEndTime ? newEnd : minEndTime;
          
          updateData = {
            end: event.end?.date 
              ? { date: format(finalEndTime, "yyyy-MM-dd") }
              : { dateTime: finalEndTime.toISOString() }
          };
        } else if (updateMode === "reschedule") {
          const adjustmentMs = getAdjustmentMs();
          const newStart = new Date(currentStart.getTime() + adjustmentMs);
          
          let newEnd: Date;
          if (preserveDuration) {
            const duration = currentEnd.getTime() - currentStart.getTime();
            newEnd = new Date(newStart.getTime() + duration);
          } else {
            newEnd = new Date(currentEnd.getTime() + adjustmentMs);
          }
          
          updateData = {
            start: event.start?.date 
              ? { date: format(newStart, "yyyy-MM-dd") }
              : { dateTime: newStart.toISOString() },
            end: event.end?.date 
              ? { date: format(newEnd, "yyyy-MM-dd") }
              : { dateTime: newEnd.toISOString() }
          };
        }
        
        return {
          eventId: event.id!,
          calendarId: (event as any).calendarId || "primary",
          updateData,
        };
      });

      await onUpdate(updates);
      
      toast({
        title: "Fechas actualizadas",
        description: `Se actualizaron ${selectedEvents.length} evento(s) exitosamente`,
        duration: 5000,
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error updating events:", error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al actualizar las fechas",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const previewData = getPreviewData();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.Calendar className="h-5 w-5" />
            Actualización Masiva de Fechas/Horas
          </DialogTitle>
          <DialogDescription>
            Actualiza las fechas y horas de {selectedEvents.length} evento(s) seleccionado(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Update Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tipo de actualización:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="move"
                  name="updateMode"
                  value="move"
                  checked={updateMode === "move"}
                  onChange={(e) => setUpdateMode(e.target.value as UpdateMode)}
                  className="mr-2"
                />
                <Label htmlFor="move" className="flex items-center gap-2 cursor-pointer">
                  <Icons.ArrowRight className="h-4 w-4" />
                  Mover a fecha específica
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="reschedule"
                  name="updateMode"
                  value="reschedule"
                  checked={updateMode === "reschedule"}
                  onChange={(e) => setUpdateMode(e.target.value as UpdateMode)}
                  className="mr-2"
                />
                <Label htmlFor="reschedule" className="flex items-center gap-2 cursor-pointer">
                  <Icons.Clock className="h-4 w-4" />
                  Reprogramar (adelantar/atrasar)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="adjust-duration"
                  name="updateMode"
                  value="adjust-duration"
                  checked={updateMode === "adjust-duration"}
                  onChange={(e) => setUpdateMode(e.target.value as UpdateMode)}
                  className="mr-2"
                />
                <Label htmlFor="adjust-duration" className="flex items-center gap-2 cursor-pointer">
                  <Icons.Clock className="h-4 w-4" />
                  Ajustar duración
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="change-time-only"
                  name="updateMode"
                  value="change-time-only"
                  checked={updateMode === "change-time-only"}
                  onChange={(e) => setUpdateMode(e.target.value as UpdateMode)}
                  className="mr-2"
                />
                <Label htmlFor="change-time-only" className="flex items-center gap-2 cursor-pointer">
                  <Icons.Clock className="h-4 w-4" />
                  Cambiar solo la hora (mantener fechas)
                </Label>
              </div>
            </div>
          </div>

          {/* Move to specific date */}
          {updateMode === "move" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nueva fecha y hora:</Label>
                <DateTimePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  granularity={isAllDay ? "day" : "minute"}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="all-day"
                  checked={isAllDay}
                  onCheckedChange={setIsAllDay}
                />
                <Label htmlFor="all-day">Evento de todo el día</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="preserve-duration"
                  checked={preserveDuration}
                  onCheckedChange={setPreserveDuration}
                />
                <Label htmlFor="preserve-duration">Preservar duración original</Label>
              </div>
            </div>
          )}

          {/* Change Time Only */}
          {updateMode === "change-time-only" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nueva hora (se mantienen las fechas originales):</Label>
                <input
                  type="time"
                  value={selectedDate ? format(selectedDate, "HH:mm") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [hours, minutes] = e.target.value.split(':');
                      if (hours && minutes) {
                        const newTime = new Date();
                        newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                        setSelectedDate(newTime);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
                <p className="text-sm text-muted-foreground">
                  Esta hora se aplicará a todos los eventos seleccionados, manteniendo sus fechas originales.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="preserve-duration-time-only"
                  checked={preserveDuration}
                  onCheckedChange={setPreserveDuration}
                />
                <Label htmlFor="preserve-duration-time-only">Preservar duración original</Label>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  <strong>Ejemplo:</strong> Si seleccionas las 10:00 AM:
                  <ul className="mt-1 ml-4 list-disc">
                    <li>Evento del lunes 15/01 a las 14:00 → lunes 15/01 a las 10:00</li>
                    <li>Evento del miércoles 17/01 a las 16:30 → miércoles 17/01 a las 10:00</li>
                    <li>{preserveDuration ? "La duración se mantiene" : "Nueva duración: 1 hora por defecto"}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Reschedule or Adjust Duration */}
          {(updateMode === "reschedule" || updateMode === "adjust-duration") && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad:</Label>
                  <input
                    type="number"
                    min="1"
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Unidad:</Label>
                  <select
                    value={adjustmentUnit}
                    onChange={(e) => setAdjustmentUnit(e.target.value as TimeAdjustment)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="minutes">Minutos</option>
                    <option value="hours">Horas</option>
                    <option value="days">Días</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Dirección:</Label>
                  <select
                    value={adjustmentDirection}
                    onChange={(e) => setAdjustmentDirection(e.target.value as "forward" | "backward")}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="forward">
                      {updateMode === "adjust-duration" ? "Extender" : "Adelantar"}
                    </option>
                    <option value="backward">
                      {updateMode === "adjust-duration" ? "Acortar" : "Atrasar"}
                    </option>
                  </select>
                </div>
              </div>
              
              {updateMode === "reschedule" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="preserve-duration-reschedule"
                    checked={preserveDuration}
                    onCheckedChange={setPreserveDuration}
                  />
                  <Label htmlFor="preserve-duration-reschedule">Preservar duración original</Label>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Vista previa (primeros 3 eventos):</Label>
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                {previewData.map((item: any, index) => (
                  <div key={index} className="text-sm space-y-1">
                    <div className="font-medium truncate">{item.event.summary}</div>
                    <div className="text-muted-foreground">
                      <span className="font-medium">Actual:</span> {format(item.currentStart, "EEE d MMM, HH:mm", { locale: es })} → {format(item.currentEnd, "HH:mm", { locale: es })}
                    </div>
                    <div className="text-primary">
                      <span className="font-medium">Nuevo:</span> {format(item.newStart, "EEE d MMM, HH:mm", { locale: es })} → {format(item.newEnd, "HH:mm", { locale: es })}
                    </div>
                  </div>
                ))}
                {selectedEvents.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    ... y {selectedEvents.length - 3} evento(s) más
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning */}
          <Alert>
            <Icons.Info className="h-4 w-4" />
            <AlertDescription>
              Esta acción actualizará las fechas/horas de todos los eventos seleccionados. 
              Se preservarán los invitados, descripciones y demás propiedades de los eventos.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || (updateMode === "move" && !selectedDate) || (updateMode === "change-time-only" && !selectedDate)}
            className="bg-primary hover:bg-primary/90"
          >
            {isUpdating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Actualizando...
              </>
            ) : (
              <>
                <Icons.Calendar className="mr-2 h-4 w-4" />
                Actualizar {selectedEvents.length} Evento(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};