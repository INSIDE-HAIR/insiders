/**
 * EditableCalendarField - Molecular Component
 * 
 * Campo editable de calendario IDÉNTICO al original EditableCalendar.tsx
 * + Estado de loading con skeleton
 */

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

interface EditableCalendarFieldProps {
  currentCalendarId: string;
  eventId: string;
  calendars: Array<{
    id: string;
    summary: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
  onUpdate: (eventId: string, oldCalendarId: string, newCalendarId: string) => Promise<void>;
  isLoading?: boolean;
}

export const EditableCalendarField: React.FC<EditableCalendarFieldProps> = ({
  currentCalendarId,
  eventId,
  calendars,
  onUpdate,
  isLoading: externalLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState(currentCalendarId);
  const [isLoading, setIsLoading] = useState(false);

  const currentCalendar = calendars.find(cal => cal.id === currentCalendarId);
  const selectedCalendar = calendars.find(cal => cal.id === selectedCalendarId);

  // Loading skeleton
  if (externalLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-muted-foreground/20 rounded-md"></div>
      </div>
    );
  }

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
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {selectedCalendarId !== currentCalendarId && (
              <span>Mover de &quot;{currentCalendar?.summary}&quot; a &quot;{selectedCalendar?.summary}&quot;</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={handleSave}
              disabled={isLoading || selectedCalendarId === currentCalendarId}
              className="h-7 px-2"
            >
              {isLoading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-r-transparent" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group"
      onClick={handleEdit}
    >
      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="w-3 h-3 rounded-full border border-border flex-shrink-0"
          style={{
            backgroundColor: currentCalendar?.backgroundColor || "hsl(var(--primary))",
          }}
        />
        <span className="text-sm truncate">{currentCalendar?.summary}</span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Cambiar
      </Button>
    </div>
  );
};

EditableCalendarField.displayName = "EditableCalendarField";