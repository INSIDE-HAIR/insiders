"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Calendar, Check, X } from "lucide-react";

interface EditableCalendarProps {
  currentCalendarId: string;
  eventId: string;
  calendars: Array<{
    id: string;
    summary: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
  onUpdate: (eventId: string, oldCalendarId: string, newCalendarId: string) => Promise<void>;
}

export const EditableCalendar: React.FC<EditableCalendarProps> = ({
  currentCalendarId,
  eventId,
  calendars,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState(currentCalendarId);
  const [isLoading, setIsLoading] = useState(false);

  const currentCalendar = calendars.find(cal => cal.id === currentCalendarId);
  const selectedCalendar = calendars.find(cal => cal.id === selectedCalendarId);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (selectedCalendarId === currentCalendarId) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(eventId, currentCalendarId, selectedCalendarId);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating calendar:", error);
      setSelectedCalendarId(currentCalendarId); // Reset to original
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCalendarId(currentCalendarId);
    setIsEditing(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="space-y-3 p-3 bg-muted rounded-lg border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Mover evento a calendario:
          </label>
          <Select
            value={selectedCalendarId}
            onValueChange={setSelectedCalendarId}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {selectedCalendar && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                      style={{
                        backgroundColor: selectedCalendar.backgroundColor || "hsl(var(--primary))",
                      }}
                    />
                    <span className="truncate">{selectedCalendar.summary}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {calendars.map((calendar) => (
                <SelectItem key={calendar.id} value={calendar.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                      style={{
                        backgroundColor: calendar.backgroundColor || "hsl(var(--primary))",
                      }}
                    />
                    <span className="truncate">{calendar.summary}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading || selectedCalendarId === currentCalendarId}
            className="h-7 px-2"
          >
            <Check className="h-3 w-3 mr-1" />
            {selectedCalendarId === currentCalendarId ? "Sin cambios" : "Mover"}
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
        <div
          className="w-4 h-4 rounded-full border border-border flex-shrink-0"
          style={{
            backgroundColor: currentCalendar?.backgroundColor || "hsl(var(--primary))",
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate" title={currentCalendar?.summary}>
            {currentCalendar?.summary || "Calendario desconocido"}
          </div>
          <div className="text-xs text-muted-foreground font-mono truncate" title={currentCalendarId}>
            {currentCalendarId.length > 20 
              ? `${currentCalendarId.substring(0, 20)}...` 
              : currentCalendarId}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        onClick={handleEdit}
      >
        <Calendar className="h-3 w-3" />
      </Button>
    </div>
  );
};