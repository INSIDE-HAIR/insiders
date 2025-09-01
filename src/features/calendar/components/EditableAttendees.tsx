"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Users, Check, X, Clock, UserPlus, UserMinus } from "lucide-react";

interface Attendee {
  email?: string;
  displayName?: string;
  responseStatus?: string;
}

interface EditableAttendeesProps {
  attendees?: Attendee[];
  eventId: string;
  calendarId: string;
  onUpdate: (eventId: string, calendarId: string, attendees: Attendee[]) => Promise<void>;
}

export const EditableAttendees: React.FC<EditableAttendeesProps> = ({
  attendees = [],
  eventId,
  calendarId,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [editedAttendees, setEditedAttendees] = useState<Attendee[]>(attendees);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "accepted":
        return <Check className="h-3 w-3 text-primary" />;
      case "declined":
        return <X className="h-3 w-3 text-destructive" />;
      case "tentative":
        return <Clock className="h-3 w-3 text-accent-foreground" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "accepted":
        return "bg-primary/10 text-primary border-primary/30";
      case "declined":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "tentative":
        return "bg-accent/10 text-accent-foreground border-accent/30";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const handleAddAttendee = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (newEmail && !editedAttendees.some(a => a.email?.toLowerCase() === newEmail.toLowerCase())) {
      setEditedAttendees([
        ...editedAttendees,
        { email: newEmail, responseStatus: "needsAction" }
      ]);
      setNewEmail("");
    }
  };

  const handleRemoveAttendee = (emailToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedAttendees(editedAttendees.filter(a => a.email !== emailToRemove));
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onUpdate(eventId, calendarId, editedAttendees);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating attendees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedAttendees(attendees);
    setNewEmail("");
    setIsEditing(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="space-y-3 p-3 bg-muted rounded-lg border border-border" onClick={(e) => e.stopPropagation()}>
        {/* Lista de invitados actuales */}
        <div className="space-y-2">
          {editedAttendees.map((attendee, index) => (
            <div key={attendee.email || index} className="flex items-center justify-between gap-2 p-2 bg-background rounded border border-border">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getStatusIcon(attendee.responseStatus)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {attendee.displayName || attendee.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {attendee.email}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleRemoveAttendee(attendee.email!, e)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Añadir nuevo invitado */}
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className="flex-1 px-3 py-1 text-sm border border-input bg-background rounded focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAttendee(e as any);
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleAddAttendee}
            disabled={!newEmail}
            className="h-7 px-2"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Añadir
          </Button>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
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

  if (attendees.length === 0) {
    return (
      <div 
        className="group flex items-center gap-2 cursor-pointer hover:bg-accent/20 p-2 rounded transition-colors"
        onClick={handleEdit}
      >
        <span className="text-muted-foreground text-sm italic">
          Hacer clic para añadir invitados
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          onClick={handleEdit}
        >
          <UserPlus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="group cursor-pointer hover:bg-accent/20 p-2 rounded transition-colors relative"
      onClick={handleEdit}
    >
      <div className="flex flex-wrap gap-1">
        {attendees.slice(0, 3).map((attendee, index) => (
          <Badge
            key={attendee.email || index}
            className={`${getStatusColor(attendee.responseStatus)} text-xs flex items-center gap-1`}
          >
            {getStatusIcon(attendee.responseStatus)}
            {attendee.displayName || attendee.email?.split('@')[0]}
          </Badge>
        ))}
        {attendees.length > 3 && (
          <Badge className="bg-muted text-muted-foreground text-xs">
            +{attendees.length - 3} más
          </Badge>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        onClick={handleEdit}
      >
        <Users className="h-3 w-3" />
      </Button>
    </div>
  );
};