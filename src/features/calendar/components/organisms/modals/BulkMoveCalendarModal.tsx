/**
 * BulkMoveCalendarModal - Organism Component
 * 
 * Modal para mover eventos masivamente usando Dialog + Select de shadcn
 * Mantiene estética IDÉNTICA con componentes shadcn
 */

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Switch } from "@/src/components/ui/switch";
import { Separator } from "@/src/components/ui/separator";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { 
  ArrowRightIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface Calendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  accessRole?: 'owner' | 'reader' | 'writer' | 'freeBusyReader';
  primary?: boolean;
}

interface BulkMoveCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove?: ((targetCalendarId: string, sendNotifications: boolean, updateRecurrence: boolean) => void) | ((targetCalendarId: string) => Promise<void>);
  selectedEventsCount?: number;
  availableCalendars?: Calendar[];
  currentCalendarIds?: string[];
  isLoading?: boolean;
  className?: string;
  // Legacy support
  selectedEvents?: GoogleCalendarEvent[];
  calendars?: Array<{
    id: string;
    summary: string;
    colorId?: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
}

export const BulkMoveCalendarModal: React.FC<BulkMoveCalendarModalProps> = ({
  isOpen,
  onClose,
  onMove,
  selectedEventsCount,
  availableCalendars,
  currentCalendarIds,
  isLoading = false,
  className,
  selectedEvents,
  calendars,
}) => {
  // Determine the actual calendars and events to use
  const actualCalendars = availableCalendars || (calendars?.map(cal => ({
    id: cal.id,
    summary: cal.summary,
    description: undefined, // Legacy calendars don't have descriptions
    backgroundColor: cal.backgroundColor,
    accessRole: 'writer' as const, // Default to writer for legacy calendars
    primary: false
  })) || []);
  const actualCurrentCalendarIds = currentCalendarIds || [];
  const eventsCount = selectedEventsCount || selectedEvents?.length || 0;
  const [targetCalendarId, setTargetCalendarId] = useState("");
  const [sendNotifications, setSendNotifications] = useState(true);
  const [updateRecurrence, setUpdateRecurrence] = useState(false);

  // Filter calendars where user can write and exclude current calendars
  const writableCalendars = actualCalendars.filter(calendar => 
    (calendar.accessRole === 'owner' || calendar.accessRole === 'writer') &&
    !actualCurrentCalendarIds.includes(calendar.id)
  );

  const selectedCalendar = actualCalendars.find(cal => cal.id === targetCalendarId);

  const getCalendarColor = (calendar: Calendar) => {
    return calendar.backgroundColor || "#6366f1";
  };

  const handleSubmit = async () => {
    if (!targetCalendarId || !onMove) return;
    
    try {
      const result = onMove(targetCalendarId, sendNotifications, updateRecurrence);
      if (result && typeof result.then === 'function') {
        await result;
      }
      onClose();
    } catch (error) {
      console.error('Error moving calendar:', error);
    }
  };

  const getAccessRoleLabel = (role?: string) => {
    switch (role) {
      case 'owner': return 'Propietario';
      case 'writer': return 'Editor';
      case 'reader': return 'Lector';
      default: return role || 'Desconocido';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightIcon className="h-5 w-5" />
            Mover Eventos de Calendario
          </DialogTitle>
          <DialogDescription>
            Mover {eventsCount} evento{eventsCount > 1 ? 's' : ''} seleccionado{eventsCount > 1 ? 's' : ''} a otro calendario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Advertencia si múltiples calendarios origen */}
          {actualCurrentCalendarIds.length > 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800 mb-1">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="font-medium">Múltiples Calendarios</span>
              </div>
              <div className="text-xs text-amber-700">
                Los eventos seleccionados provienen de {actualCurrentCalendarIds.length} calendarios diferentes. 
                Todos se moverán al calendario de destino seleccionado.
              </div>
            </div>
          )}

          {/* Selector de calendario destino */}
          <div className="space-y-2">
            <Label>Calendario de Destino</Label>
            {writableCalendars.length > 0 ? (
              <Select value={targetCalendarId} onValueChange={setTargetCalendarId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar calendario destino..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="max-h-64">
                    {writableCalendars.map((calendar) => (
                      <SelectItem key={calendar.id} value={calendar.id}>
                        <div className="flex items-start gap-3 w-full py-1">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: getCalendarColor(calendar) }}
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="font-medium leading-tight">
                              {calendar.summary}
                              {calendar.primary && " (Principal)"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getAccessRoleLabel(calendar.accessRole)}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-800 mb-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span className="font-medium">Sin Calendarios Disponibles</span>
                </div>
                <div className="text-xs text-red-700">
                  No tienes permisos de escritura en otros calendarios o todos los eventos 
                  ya están en calendarios donde tienes acceso.
                </div>
              </div>
            )}
          </div>

          {/* Vista previa del calendario seleccionado */}
          {selectedCalendar && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDaysIcon className="h-4 w-4" />
                <span className="font-medium">Calendario Seleccionado</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCalendarColor(selectedCalendar) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    {selectedCalendar.summary}
                    {selectedCalendar.primary && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Principal
                      </Badge>
                    )}
                  </div>
                  {selectedCalendar.description && (
                    <div className="text-xs text-muted-foreground">
                      {selectedCalendar.description}
                    </div>
                  )}
                </div>
              </div>
              
              <Badge variant="secondary" className="text-xs">
                {getAccessRoleLabel(selectedCalendar.accessRole)}
              </Badge>
            </div>
          )}

          <Separator />

          {/* Opciones */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="send-notifications"
                checked={sendNotifications}
                onCheckedChange={setSendNotifications}
              />
              <Label htmlFor="send-notifications" className="text-sm">
                Enviar notificaciones a los asistentes
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="update-recurrence"
                checked={updateRecurrence}
                onCheckedChange={setUpdateRecurrence}
              />
              <Label htmlFor="update-recurrence" className="text-sm">
                Actualizar eventos recurrentes futuros
              </Label>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-2">Importante:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Los eventos mantendrán toda su información (fecha, asistentes, etc.)</li>
                  <li>• Solo cambiará el calendario donde se almacenan</li>
                  <li>• Los permisos se ajustarán según el calendario de destino</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {targetCalendarId ? (
              <>Se moverán {eventsCount} evento{eventsCount > 1 ? 's' : ''}</>
            ) : (
              <>Selecciona un calendario de destino</>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!targetCalendarId || writableCalendars.length === 0 || isLoading}
            >
              {isLoading ? 'Moviendo...' : 'Mover Eventos'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

BulkMoveCalendarModal.displayName = "BulkMoveCalendarModal";