"use client";

import React, { useState, useEffect } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import {
  XMarkIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  BellIcon,
  CalendarIcon,
  EyeIcon,
  PlusIcon,
  ClockIcon,
  UsersIcon,
  VideoCameraIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  UserPlusIcon,
  UserMinusIcon,
  XMarkIcon as XIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { toast } from "@/src/components/ui/use-toast";
import { ReactQuillWrapper } from "@/src/components/ui/ReactQuillWrapper";
import { processDescription } from "@/src/lib/description-utils";

interface Attendee {
  email?: string;
  displayName?: string;
  responseStatus?: string;
}

interface EventDetailContentProps {
  event: GoogleCalendarEvent;
  onSave: (updatedEvent: Partial<GoogleCalendarEvent>) => Promise<void>;
  onDelete: () => Promise<void>;
  calendars: Array<{
    id: string;
    summary: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const EventDetailContent: React.FC<EventDetailContentProps> = ({
  event,
  onSave,
  onDelete,
  calendars,
  showCloseButton = false,
  onClose,
}) => {
  const [editedEvent, setEditedEvent] =
    useState<Partial<GoogleCalendarEvent>>(event);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "guests">("details");
  const [newAttendeeEmail, setNewAttendeeEmail] = useState("");
  const [isAddingAttendee, setIsAddingAttendee] = useState(false);

  useEffect(() => {
    setEditedEvent(event);
  }, [event]);

  const formatDateTime = (dateTime: any) => {
    if (!dateTime) return "";
    const date = new Date(dateTime.dateTime || dateTime.date);
    return date.toLocaleString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: dateTime.dateTime ? "2-digit" : undefined,
      minute: dateTime.dateTime ? "2-digit" : undefined,
    });
  };

  const formatTime = (dateTime: any) => {
    if (!dateTime) return "";
    const date = new Date(dateTime.dateTime || dateTime.date);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "accepted":
        return <CheckIcon className='h-3 w-3 text-primary' />;
      case "declined":
        return <XMarkIcon className='h-3 w-3 text-destructive' />;
      case "tentative":
        return <ClockIcon className='h-3 w-3 text-accent-foreground' />;
      default:
        return <ClockIcon className='h-3 w-3 text-muted-foreground' />;
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

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "accepted":
        return "Confirmado";
      case "declined":
        return "Rechazado";
      case "tentative":
        return "Tentativo";
      default:
        return "Pendiente";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedEvent);
      setIsEditing(false);
      toast({
        title: "Evento actualizado",
        description: "Los cambios se han guardado correctamente",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el evento",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGoogleMeet = async () => {
    try {
      const response = await fetch(
        `/api/calendar/events/${event.id}/meet?calendarId=${
          (event as any).calendarId || "primary"
        }`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Error adding Google Meet");

      const data = await response.json();
      setEditedEvent({ ...editedEvent, hangoutLink: data.hangoutLink });

      toast({
        title: "Google Meet agregado",
        description: "Se ha agregado el enlace de Google Meet al evento",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error adding Google Meet:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar Google Meet",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleRemoveGoogleMeet = async () => {
    try {
      const response = await fetch(
        `/api/calendar/events/${event.id}/meet?calendarId=${
          (event as any).calendarId || "primary"
        }`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Error removing Google Meet");

      setEditedEvent({ ...editedEvent, hangoutLink: undefined });

      toast({
        title: "Google Meet removido",
        description: "Se ha removido el enlace de Google Meet del evento",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error removing Google Meet:", error);
      toast({
        title: "Error",
        description: "No se pudo remover Google Meet",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      try {
        await onDelete();
        toast({
          title: "Evento eliminado",
          description: "El evento se ha eliminado correctamente",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error deleting event:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el evento",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleAddAttendee = async () => {
    if (!newAttendeeEmail.trim()) return;

    const email = newAttendeeEmail.trim();
    const attendees = event.attendees || [];

    // Verificar si el invitado ya existe
    if (attendees.some((a) => a.email?.toLowerCase() === email.toLowerCase())) {
      toast({
        title: "Invitado ya existe",
        description: "Este email ya está en la lista de invitados",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsAddingAttendee(true);
    try {
      const newAttendees = [
        ...attendees,
        { email, responseStatus: "needsAction" as any },
      ];

      const response = await fetch(
        `/api/calendar/events/${event.id}/attendees?calendarId=${
          (event as any).calendarId || "primary"
        }`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendees: newAttendees }),
        }
      );

      if (!response.ok) throw new Error("Error adding attendee");

      setEditedEvent({ ...editedEvent, attendees: newAttendees });
      setNewAttendeeEmail("");

      toast({
        title: "Invitado agregado",
        description: "Se ha agregado el invitado al evento",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error adding attendee:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el invitado",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAddingAttendee(false);
    }
  };

  const handleRemoveAttendee = async (emailToRemove: string) => {
    const attendees = event.attendees || [];
    const newAttendees = attendees.filter((a) => a.email !== emailToRemove);

    try {
      const response = await fetch(
        `/api/calendar/events/${event.id}/attendees?calendarId=${
          (event as any).calendarId || "primary"
        }`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendees: newAttendees }),
        }
      );

      if (!response.ok) throw new Error("Error removing attendee");

      setEditedEvent({ ...editedEvent, attendees: newAttendees });

      toast({
        title: "Invitado removido",
        description: "Se ha removido el invitado del evento",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error removing attendee:", error);
      toast({
        title: "Error",
        description: "No se pudo remover el invitado",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const currentCalendar = calendars.find(
    (cal) => cal.id === (event as any).calendarId
  );

  const attendees = event.attendees || [];
  const acceptedCount = attendees.filter(
    (a) => a.responseStatus === "accepted"
  ).length;
  const declinedCount = attendees.filter(
    (a) => a.responseStatus === "declined"
  ).length;
  const tentativeCount = attendees.filter(
    (a) => a.responseStatus === "tentative"
  ).length;
  const pendingCount = attendees.filter(
    (a) => !a.responseStatus || a.responseStatus === "needsAction"
  ).length;

  return (
    <div className='flex flex-col h-full bg-background'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-border bg-card'>
        <div className='flex items-center gap-3 flex-1'>
          {showCloseButton && onClose && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='h-8 w-8 p-0'
            >
              <XMarkIcon className='h-4 w-4' />
            </Button>
          )}
          <div className='flex-1'>
            {isEditing ? (
              <Input
                value={editedEvent.summary || ""}
                onChange={(e) =>
                  setEditedEvent({
                    ...editedEvent,
                    summary: e.target.value,
                  })
                }
                className='text-lg font-semibold border-none p-0 h-auto'
                placeholder='Título del evento'
              />
            ) : (
              <h1 className='text-lg font-semibold text-foreground truncate'>
                {event.summary}
              </h1>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={isEditing ? "default" : "outline"}
            size='sm'
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Guardando...
              </>
            ) : isEditing ? (
              <>
                <PencilIcon className='mr-2 h-4 w-4' />
                Guardar
              </>
            ) : (
              <>
                <PencilIcon className='mr-2 h-4 w-4' />
                Editar
              </>
            )}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleDelete}
            className='text-destructive hover:text-destructive hover:bg-destructive/20 border-destructive'
          >
            <TrashIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className='border-b border-border bg-card'>
        <div className='flex'>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Detalles del evento
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "guests"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("guests")}
          >
            Invitados ({attendees.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-auto'>
        {activeTab === "details" && (
          <div className='p-6 space-y-6'>
            {/* Date and Time */}
            <div className='space-y-4'>
              <Label className='text-sm font-medium flex items-center gap-2'>
                <ClockIcon className='h-4 w-4' />
                Fecha y hora
              </Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-xs text-muted-foreground'>
                    Inicio
                  </Label>
                  <div className='flex items-center gap-2 p-3 bg-muted/50 rounded-md'>
                    <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>
                      {formatDateTime(event.start)}
                    </span>
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label className='text-xs text-muted-foreground'>Fin</Label>
                  <div className='flex items-center gap-2 p-3 bg-muted/50 rounded-md'>
                    <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>{formatDateTime(event.end)}</span>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>Zona horaria: Europe/Madrid</span>
              </div>
            </div>

            <Separator />

            {/* Google Meet */}
            <div className='space-y-4'>
              <Label className='text-sm font-medium flex items-center gap-2'>
                <VideoCameraIcon className='h-4 w-4' />
                Google Meet
              </Label>
              {editedEvent.hangoutLink || event.hangoutLink ? (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Badge
                      variant='secondary'
                      className='bg-primary/10 text-primary'
                    >
                      Enlace disponible
                    </Badge>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleRemoveGoogleMeet}
                      className='text-destructive hover:text-destructive hover:bg-destructive/20 border-destructive'
                    >
                      Remover
                    </Button>
                  </div>
                  <div className='p-3 bg-muted/50 rounded-md'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-mono truncate'>
                        {editedEvent.hangoutLink || event.hangoutLink}
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          navigator.clipboard.writeText(
                            editedEvent.hangoutLink || event.hangoutLink || ""
                          )
                        }
                      >
                        <DocumentDuplicateIcon className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                  <Button
                    className='w-full bg-primary hover:bg-primary/90 text-primary-foreground'
                    onClick={() =>
                      window.open(
                        editedEvent.hangoutLink || event.hangoutLink,
                        "_blank"
                      )
                    }
                  >
                    Unirse con Google Meet
                  </Button>
                </div>
              ) : (
                <div className='space-y-3'>
                  <p className='text-sm text-muted-foreground'>
                    No hay enlace de Google Meet para este evento
                  </p>
                  <Button
                    variant='outline'
                    onClick={handleAddGoogleMeet}
                    className='w-full'
                  >
                    <VideoCameraIcon className='mr-2 h-4 w-4' />
                    Agregar Google Meet
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Location */}
            <div className='space-y-4'>
              <Label className='text-sm font-medium flex items-center gap-2'>
                <MapPinIcon className='h-4 w-4' />
                Ubicación
              </Label>
              {isEditing ? (
                <Input
                  value={editedEvent.location || ""}
                  onChange={(e) =>
                    setEditedEvent({
                      ...editedEvent,
                      location: e.target.value,
                    })
                  }
                  placeholder='Agregar ubicación'
                  className='w-full'
                />
              ) : (
                <div className='p-3 bg-muted/50 rounded-md'>
                  <span className='text-sm'>
                    {event.location || "No hay ubicación especificada"}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Calendar */}
            <div className='space-y-4'>
              <Label className='text-sm font-medium flex items-center gap-2'>
                <CalendarIcon className='h-4 w-4' />
                Calendario
              </Label>
              <Select
                value={currentCalendar?.id || "primary"}
                onValueChange={(value) =>
                  setEditedEvent({
                    ...editedEvent,
                    // @ts-ignore - calendarId is added dynamically
                    calendarId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{
                            backgroundColor: calendar.backgroundColor,
                          }}
                        />
                        <span>{calendar.summary}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Description */}
            <div className='space-y-4'>
              <Label className='text-sm font-medium'>Descripción</Label>
              {isEditing ? (
                <div className='border rounded-md'>
                  <ReactQuillWrapper
                    value={editedEvent.description || ""}
                    onChange={(value) =>
                      setEditedEvent({
                        ...editedEvent,
                        description: value,
                      })
                    }
                    className='bg-background'
                    theme='snow'
                    placeholder='Agregar descripción del evento...'
                  />
                </div>
              ) : (
                <div className='p-4 bg-muted/50 rounded-md min-h-[100px]'>
                  {event.description ? (
                    <div
                      className='prose prose-sm max-w-none event-description'
                      dangerouslySetInnerHTML={{
                        __html: processDescription(event.description),
                      }}
                    />
                  ) : (
                    <span className='text-sm text-muted-foreground'>
                      No hay descripción para este evento
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "guests" && (
          <div className='p-6 space-y-6'>
            {/* Add Guests */}
            <div className='space-y-4'>
              <Label className='text-sm font-medium flex items-center gap-2'>
                <UsersIcon className='h-4 w-4' />
                Agregar invitado
              </Label>
              <div className='flex gap-2'>
                <Input
                  placeholder='email@ejemplo.com'
                  value={newAttendeeEmail}
                  onChange={(e) => setNewAttendeeEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAttendee();
                    }
                  }}
                  className='flex-1'
                />
                <Button
                  size='sm'
                  onClick={handleAddAttendee}
                  disabled={!newAttendeeEmail.trim() || isAddingAttendee}
                >
                  {isAddingAttendee ? (
                    <>
                      <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className='mr-2 h-4 w-4' />
                      Agregar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Guest Statistics */}
            {attendees.length > 0 && (
              <div className='space-y-4'>
                <Label className='text-sm font-medium'>
                  Resumen de invitados
                </Label>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                  <div className='p-3 bg-primary/5 rounded-md border border-primary/20'>
                    <div className='text-2xl font-bold text-primary'>
                      {acceptedCount}
                    </div>
                    <div className='text-xs text-primary'>Confirmados</div>
                  </div>
                  <div className='p-3 bg-destructive/5 rounded-md border border-destructive/20'>
                    <div className='text-2xl font-bold text-destructive'>
                      {declinedCount}
                    </div>
                    <div className='text-xs text-destructive'>Rechazados</div>
                  </div>
                  <div className='p-3 bg-accent/5 rounded-md border border-accent/20'>
                    <div className='text-2xl font-bold text-accent-foreground'>
                      {tentativeCount}
                    </div>
                    <div className='text-xs text-accent-foreground'>
                      Tentativos
                    </div>
                  </div>
                  <div className='p-3 bg-muted/5 rounded-md border border-muted/20'>
                    <div className='text-2xl font-bold text-muted-foreground'>
                      {pendingCount}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Pendientes
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Guest List */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>
                  Lista de invitados
                </Label>
                <Badge variant='secondary'>{attendees.length} invitados</Badge>
              </div>

              {attendees.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <UsersIcon className='h-12 w-12 mx-auto mb-2 opacity-50' />
                  <p className='text-sm'>No hay invitados en este evento</p>
                  <p className='text-xs'>
                    Agrega invitados usando el campo de arriba
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {attendees.map((attendee, index) => (
                    <div
                      key={attendee.email || index}
                      className='flex items-center justify-between p-3 bg-muted/30 rounded-md border border-border'
                    >
                      <div className='flex items-center gap-3 flex-1 min-w-0'>
                        {getStatusIcon(attendee.responseStatus)}
                        <div className='flex-1 min-w-0'>
                          <div className='text-sm font-medium truncate'>
                            {attendee.displayName ||
                              attendee.email?.split("@")[0]}
                          </div>
                          <div className='text-xs text-muted-foreground font-mono truncate'>
                            {attendee.email}
                          </div>
                        </div>
                        <Badge
                          className={`${getStatusColor(attendee.responseStatus)} text-xs`}
                        >
                          {getStatusLabel(attendee.responseStatus)}
                        </Badge>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveAttendee(attendee.email!)}
                        className='h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10'
                      >
                        <UserMinusIcon className='h-3 w-3' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
