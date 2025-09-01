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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import { Icons } from "@/src/components/shared/icons";
import { toast } from "@/src/components/ui/use-toast";

interface BulkMoveCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvents: Array<{
    id?: string;
    summary?: string;
    calendarId?: string;
  }>;
  calendars: Array<{
    id: string;
    summary: string;
    backgroundColor?: string;
    foregroundColor?: string;
    accessRole?: string;
  }>;
  onMove: (targetCalendarId: string) => Promise<void>;
}

export const BulkMoveCalendarModal: React.FC<BulkMoveCalendarModalProps> = ({
  isOpen,
  onClose,
  selectedEvents,
  calendars,
  onMove,
}) => {
  const [targetCalendarId, setTargetCalendarId] = useState<string>("");
  const [isMoving, setIsMoving] = useState(false);

  // Filter out calendars that are read-only
  const writableCalendars = calendars.filter(
    (cal) => cal.accessRole === "owner" || cal.accessRole === "writer"
  );

  // Group events by their current calendar
  const eventsByCalendar = selectedEvents.reduce((acc, event) => {
    const calId = event.calendarId || "primary";
    if (!acc[calId]) {
      acc[calId] = [];
    }
    acc[calId].push(event);
    return acc;
  }, {} as Record<string, typeof selectedEvents>);

  const handleMove = async () => {
    if (!targetCalendarId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un calendario destino",
        variant: "destructive",
      });
      return;
    }

    setIsMoving(true);
    try {
      await onMove(targetCalendarId);
      toast({
        title: "Eventos movidos",
        description: `${selectedEvents.length} evento(s) movidos exitosamente`,
      });
      onClose();
    } catch (error) {
      console.error("Error moving events:", error);
      toast({
        title: "Error",
        description: "Hubo un error al mover los eventos",
        variant: "destructive",
      });
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.Calendar className="h-5 w-5" />
            Mover Eventos a Otro Calendario
          </DialogTitle>
          <DialogDescription>
            Mueve {selectedEvents.length} evento(s) seleccionado(s) a un calendario diferente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current calendars summary */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Eventos seleccionados:</label>
            <div className="p-3 bg-muted rounded-lg space-y-2">
              {Object.entries(eventsByCalendar).map(([calendarId, events]) => {
                const calendar = calendars.find((c) => c.id === calendarId);
                return (
                  <div key={calendarId} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-border"
                      style={{
                        backgroundColor: calendar?.backgroundColor || "#4285f4",
                      }}
                    />
                    <span className="text-sm">
                      {events.length} evento(s) de{" "}
                      <span className="font-medium">
                        {calendar?.summary || calendarId}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target calendar selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Calendario de Destino
            </label>
            {writableCalendars.length === 0 ? (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icons.Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">No hay calendarios disponibles</p>
                    <p className="text-sm text-muted-foreground">
                      No tienes calendarios con permisos de escritura disponibles para mover eventos.
                      Solo puedes mover eventos a calendarios donde eres propietario o tienes permisos de escritura.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Select value={targetCalendarId} onValueChange={setTargetCalendarId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar calendario destino..." />
                </SelectTrigger>
                <SelectContent>
                  {writableCalendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{
                            backgroundColor: calendar.backgroundColor || "#4285f4",
                          }}
                        />
                        <span>{calendar.summary}</span>
                        {calendar.accessRole === "owner" && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Propietario
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Warning */}
          {writableCalendars.length > 0 ? (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Icons.Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
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
          ) : (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Icons.Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-2">Para poder mover eventos necesitas:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ser propietario del calendario de destino, o</li>
                    <li>• Tener permisos de escritura en el calendario de destino</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Events that will be affected */}
          {selectedEvents.length > 5 && (
            <div className="text-sm text-muted-foreground">
              Se moverán los siguientes eventos (mostrando los primeros 5):
            </div>
          )}
          <div className="max-h-[200px] overflow-y-auto space-y-1">
            {selectedEvents.slice(0, 5).map((event, index) => (
              <div
                key={event.id || index}
                className="text-sm p-2 bg-muted/50 rounded flex items-center gap-2"
              >
                <Icons.Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{event.summary || "Sin título"}</span>
              </div>
            ))}
            {selectedEvents.length > 5 && (
              <div className="text-sm text-muted-foreground pl-2">
                ... y {selectedEvents.length - 5} más
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isMoving}>
            Cancelar
          </Button>
          <Button
            onClick={handleMove}
            disabled={!targetCalendarId || isMoving || writableCalendars.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            {isMoving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Moviendo...
              </>
            ) : writableCalendars.length === 0 ? (
              "Sin calendarios disponibles"
            ) : (
              <>
                <Icons.ArrowRight className="mr-2 h-4 w-4" />
                Mover Eventos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};