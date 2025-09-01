"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import {
  MapPin,
  Users,
  Video,
  Check,
  X,
  Clock,
  Calendar,
  Phone,
  FileText,
} from "lucide-react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { useRouter } from "next/navigation";
import { AVAILABLE_COLUMNS } from "@/src/features/calendar/components/ColumnController";
import { toast } from "@/src/components/ui/use-toast";
// Migración a componentes atómicos - versión mejorada
import {
  EditableDescriptionField,
  EditableAttendeesField,
  EditableCalendarField,
  EditableDateTimeField,
  EditableTitleField
} from "@/src/features/calendar/components";

export const getEventsColumns = (
  defaultCalendarId: string,
  onRefresh: () => void,
  visibleColumns: string[] = Object.keys(AVAILABLE_COLUMNS),
  calendars: Array<{
    id: string;
    summary: string;
    colorId?: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }> = [],
  onEventEdit?: (event: GoogleCalendarEvent) => void,
  router?: any
): ColumnDef<GoogleCalendarEvent>[] => {

  // Helper para obtener el color del calendario
  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find((cal) => cal.id === calendarId);
    return {
      backgroundColor: calendar?.backgroundColor || "hsl(var(--primary))",
      foregroundColor:
        calendar?.foregroundColor || "hsl(var(--primary-foreground))",
      colorId: calendar?.colorId || "default",
      summary: calendar?.summary || "Unknown Calendar",
    };
  };

  const formatEventDate = (event: GoogleCalendarEvent) => {
    const start = event.start?.dateTime || event.start?.date;
    if (!start) return "Fecha no disponible";

    const date = new Date(start);
    const isAllDay = !!event.start?.date;

    if (isAllDay) {
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = (event: GoogleCalendarEvent) => {
    const now = new Date();
    const start = new Date(event.start?.dateTime || event.start?.date || "");
    const end = new Date(event.end?.dateTime || event.end?.date || "");

    if (now < start)
      return { status: "upcoming", color: "primary", label: "Próximo" };
    if (now > end)
      return { status: "past", color: "secondary", label: "Pasado" };
    return { status: "ongoing", color: "success", label: "En curso" };
  };

  const handleDeleteEvent = async (eventId: string, calendarId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}?calendarId=${calendarId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error deleting event");
      }

      onRefresh();
    } catch (error: any) {
      alert(`Error eliminando evento: ${error.message}`);
    }
  };

  // Function to update event description
  const handleUpdateDescription = async (
    eventId: string,
    calendarId: string,
    description: string
  ) => {
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/update?calendarId=${calendarId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description }),
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          const errorText = await response.text();
          console.error("Response text:", errorText);
          throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}`
          );
        }
        throw new Error(
          errorData.error || "Error al actualizar la descripción"
        );
      }

      toast({
        title: "Descripción actualizada",
        description: "Los cambios se guardaron correctamente",
        duration: 3000,
      });

      onRefresh();
    } catch (error: any) {
      console.error("Error updating description:", error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la descripción",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  // Function to update event title
  const handleUpdateTitle = async (
    eventId: string,
    calendarId: string,
    summary: string
  ) => {
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/update?calendarId=${calendarId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ summary }),
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          const errorText = await response.text();
          console.error("Response text:", errorText);
          throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}`
          );
        }
        throw new Error(
          errorData.error || "Error al actualizar el título"
        );
      }

      toast({
        title: "Título actualizado",
        description: "Los cambios se guardaron correctamente",
        duration: 3000,
      });

      onRefresh();
    } catch (error: any) {
      console.error("Error updating title:", error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el título",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  // Function to update event attendees
  const handleUpdateAttendees = async (
    eventId: string,
    calendarId: string,
    attendees: any[]
  ) => {
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/update?calendarId=${calendarId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attendees }),
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // Si no se puede parsear JSON, usar el texto de la respuesta
          const errorText = await response.text();
          console.error("Response text:", errorText);
          throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}`
          );
        }

        // Manejar errores específicos
        if (response.status === 403) {
          if (errorData.details) {
            throw new Error(`${errorData.error} ${errorData.details}`);
          } else {
            throw new Error(
              errorData.error || "No tienes permisos para modificar este evento"
            );
          }
        }

        throw new Error(errorData.error || "Error al actualizar los invitados");
      }

      toast({
        title: "Invitados actualizados",
        description: "Los cambios se guardaron correctamente",
        duration: 3000,
      });

      onRefresh();
    } catch (error: any) {
      console.error("Error updating attendees:", error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar los invitados",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  // Function to move event to different calendar
  const handleMoveEventToCalendar = async (
    eventId: string,
    oldCalendarId: string,
    newCalendarId: string
  ) => {
    try {
      // Use the update API which now handles calendar moves correctly
      const moveResponse = await fetch(
        `/api/calendar/events/${eventId}/update?calendarId=${oldCalendarId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calendarId: newCalendarId,
          }),
        }
      );

      if (!moveResponse.ok) {
        let errorData;
        try {
          errorData = await moveResponse.json();
        } catch (jsonError) {
          const errorText = await moveResponse.text();
          console.error("Response text:", errorText);
          throw new Error(
            `Error del servidor: ${moveResponse.status} ${moveResponse.statusText}`
          );
        }
        throw new Error(errorData.error || "Error al mover el evento");
      }

      const result = await moveResponse.json();

      // Handle different success scenarios
      if (result.success) {
        const title = result.moved ? "Evento movido" : "Evento actualizado";
        const description = result.moved 
          ? "El evento se movió correctamente al nuevo calendario"
          : "El evento se actualizó correctamente";
          
        toast({
          title,
          description,
          duration: 3000,
        });
      } else if (result.isRecurringEventIssue && result.fallbackUsed) {
        // Special handling for recurring events that used fallback
        toast({
          title: "Evento copiado",
          description: "Este evento recurrente se copió al nuevo calendario (no se puede mover directamente)",
          duration: 5000,
        });
      }

      onRefresh();
    } catch (error: any) {
      console.error("Error moving event:", error);
      toast({
        title: "Error",
        description: error.message || "Error al mover el evento",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  // Function to update event date/time with duration preservation
  const handleUpdateDateTime = async (
    eventId: string,
    calendarId: string,
    field: "start" | "end",
    value: { dateTime?: string; date?: string },
    currentEvent?: GoogleCalendarEvent
  ) => {
    try {
      let updateData: any = {};

      // If updating start date, we need to preserve the duration and update end date accordingly
      if (field === "start" && currentEvent) {
        const currentStart = new Date(
          currentEvent.start?.dateTime || currentEvent.start?.date || ""
        );
        const currentEnd = new Date(
          currentEvent.end?.dateTime || currentEvent.end?.date || ""
        );
        const newStart = new Date(value.dateTime || value.date || "");

        // Calculate the duration of the session
        const durationMs = currentEnd.getTime() - currentStart.getTime();

        // Ensure minimum duration of 15 minutes for timed events
        const minDuration = value.dateTime ? 15 * 60 * 1000 : 0; // 15 minutes in ms for timed events
        const adjustedDuration = Math.max(durationMs, minDuration);

        // Calculate new end date by adding the duration to the new start date
        const newEnd = new Date(newStart.getTime() + adjustedDuration);

        // Set both start and end in the update
        updateData = {
          start: value,
          end: value.dateTime
            ? { dateTime: newEnd.toISOString() }
            : { date: newEnd.toISOString().split("T")[0] },
        };
      } else if (field === "end" && currentEvent) {
        // For end date updates, validate that it's after the start date
        const currentStart = new Date(
          currentEvent.start?.dateTime || currentEvent.start?.date || ""
        );
        const newEnd = new Date(value.dateTime || value.date || "");

        if (newEnd <= currentStart) {
          throw new Error(
            "La fecha de fin debe ser posterior a la fecha de inicio"
          );
        }

        updateData = { [field]: value };
      } else {
        // Fallback for other cases
        updateData = { [field]: value };
      }

      const response = await fetch(
        `/api/calendar/events/${eventId}/update?calendarId=${calendarId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          const errorText = await response.text();
          console.error("Response text:", errorText);
          throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}`
          );
        }
        throw new Error(
          errorData.error ||
            `Error al actualizar ${field === "start" ? "fecha de inicio" : "fecha de fin"}`
        );
      }

      const responseData = await response.json();

      if (field === "start") {
        toast({
          title: "Fecha y hora actualizadas",
          description:
            "Se actualizó la fecha de inicio y se mantuvo la duración de la sesión",
          duration: 3000,
        });
      } else {
        toast({
          title: "Fecha de fin actualizada",
          description: "Los cambios se guardaron correctamente",
          duration: 3000,
        });
      }

      onRefresh();
    } catch (error: any) {
      console.error(`Error updating ${field}:`, error);
      toast({
        title: "Error",
        description:
          error.message ||
          `Error al actualizar ${field === "start" ? "fecha de inicio" : "fecha de fin"}`,
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  // Función para generar una columna basada en el ID
  const generateColumn = (columnId: string): ColumnDef<GoogleCalendarEvent> => {
    const event = (row: any) => row.original as GoogleCalendarEvent;

    switch (columnId) {
      case "summary":
        return {
          accessorKey: "summary",
          header: "Título",
          cell: ({ row }) => {
            const eventData = event(row);
            const eventId = eventData.id;
            const calendarId = (eventData as any).calendarId || defaultCalendarId;
            const summary = eventData.summary || "";
            
            if (!eventId) {
              return (
                <div className='flex items-center gap-2'>
                  <CalendarIcon className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                  <span className='font-medium truncate'>
                    {summary || "Sin título"}
                  </span>
                </div>
              );
            }
            
            return (
              <EditableTitleField
                title={summary}
                eventId={eventId}
                calendarId={calendarId}
                onUpdate={handleUpdateTitle}
              />
            );
          },
        };

      case "start":
        return {
          accessorKey: "start",
          header: "Fecha/Hora Inicio",
          cell: ({ row }) => {
            const eventData = event(row);
            const eventId = eventData.id!;
            const calendarId =
              (eventData as any).calendarId || defaultCalendarId;

            return (
              <EditableDateTimeField
                dateTimeValue={eventData.start}
                eventId={eventId}
                calendarId={calendarId}
                field='start'
                label='Fecha de inicio'
                currentEvent={eventData}
                onUpdate={handleUpdateDateTime}
              />
            );
          },
        };

      case "end":
        return {
          accessorKey: "end",
          header: "Fecha/Hora Fin",
          cell: ({ row }) => {
            const eventData = event(row);
            const eventId = eventData.id!;
            const calendarId =
              (eventData as any).calendarId || defaultCalendarId;

            return (
              <EditableDateTimeField
                dateTimeValue={eventData.end}
                eventId={eventId}
                calendarId={calendarId}
                field='end'
                label='Fecha de fin'
                currentEvent={eventData}
                onUpdate={handleUpdateDateTime}
              />
            );
          },
        };

      case "status":
        return {
          accessorKey: "status",
          header: "Estado",
          cell: ({ row }) => {
            const eventStatus = getEventStatus(event(row));
            return (
              <Badge className='bg-muted-foreground text-card border-card-foreground/20 font-semibold shadow-sm hover:bg-muted-foreground/90 transition-colors'>
                {eventStatus.label}
              </Badge>
            );
          },
          filterFn: (row, id, value) => {
            const eventStatus = getEventStatus(event(row));
            return value.includes(eventStatus.status);
          },
        };

      case "location":
        return {
          accessorKey: "location",
          header: "Ubicación",
          cell: ({ row }) => (
            <div
              className='text-sm text-foreground truncate max-w-[200px]'
              title={event(row).location}
            >
              {event(row).location ? (
                <div className='flex items-center gap-1.5 text-foreground'>
                  <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
                  <span className='truncate max-w-32'>
                    {event(row).location}
                  </span>
                </div>
              ) : (
                <span className='text-muted-foreground'>-</span>
              )}
            </div>
          ),
        };

      case "attendees":
        return {
          accessorKey: "attendees",
          header: "Invitados",
          cell: ({ row }) => {
            const eventData = event(row);
            const eventId = eventData.id!;
            const calendarId =
              (eventData as any).calendarId || defaultCalendarId;
            const attendees = eventData.attendees || [];

            return (
              <EditableAttendeesField
                attendees={attendees}
                eventId={eventId}
                calendarId={calendarId}
                onUpdate={handleUpdateAttendees}
              />
            );
          },
          filterFn: (row, id, value: string[]) => {
            const attendees = event(row).attendees || [];
            if (!value || value.length === 0) return true;
            return value.some((filterEmail) =>
              attendees.some(
                (attendee) =>
                  attendee.email
                    ?.toLowerCase()
                    .includes(filterEmail.toLowerCase()) ||
                  attendee.displayName
                    ?.toLowerCase()
                    .includes(filterEmail.toLowerCase())
              )
            );
          },
        };

      case "description":
        return {
          accessorKey: "description",
          header: "Descripción",
          cell: ({ row }) => {
            const eventData = event(row);
            const eventId = eventData.id!;
            const calendarId =
              (eventData as any).calendarId || defaultCalendarId;
            const description = eventData.description || "";

            return (
              <EditableDescriptionField
                description={description}
                eventId={eventId}
                calendarId={calendarId}
                onUpdate={handleUpdateDescription}
              />
            );
          },
        };

      case "created":
        return {
          accessorKey: "created",
          header: "Fecha Creación",
          cell: ({ row }) => {
            const created = event(row).created;
            if (!created)
              return <span className='text-muted-foreground'>-</span>;
            return (
              <div className='text-sm'>
                {new Date(created).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            );
          },
        };

      case "updated":
        return {
          accessorKey: "updated",
          header: "Última Modificación",
          cell: ({ row }) => {
            const updated = event(row).updated;
            if (!updated)
              return <span className='text-muted-foreground'>-</span>;
            return (
              <div className='text-sm'>
                {new Date(updated).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            );
          },
        };

      case "creator":
        return {
          accessorKey: "creator",
          header: "Creador",
          cell: ({ row }) => {
            const creator = event(row).creator;
            if (!creator)
              return <span className='text-muted-foreground'>-</span>;

            // Buscar si el email del creador coincide con algún calendario
            const creatorCalendar = calendars.find(
              (cal) => cal.id === creator.email
            );
            const calendarColor = creatorCalendar
              ? {
                  backgroundColor:
                    creatorCalendar.backgroundColor || "hsl(var(--primary))",
                  foregroundColor:
                    creatorCalendar.foregroundColor ||
                    "hsl(var(--primary-foreground))",
                  colorId: creatorCalendar.colorId || "default",
                }
              : null;

            return (
              <div className='flex items-center gap-2 text-sm'>
                {/* Círculo de color si es un calendario */}
                {calendarColor && (
                  <div
                    className='w-3 h-3 rounded-full border border-border flex-shrink-0'
                    style={{
                      backgroundColor: calendarColor.backgroundColor,
                      border: `1px solid ${calendarColor.foregroundColor}`,
                    }}
                    title={`Calendario: ${calendarColor.colorId}`}
                  />
                )}

                <div className='flex-1'>
                  <div className='font-medium text-foreground'>
                    {creator.displayName ||
                      creator.email?.split("@")[0] ||
                      "Sin nombre"}
                  </div>
                  <div className='text-xs text-muted-foreground font-mono'>
                    {creator.email}
                  </div>
                  {calendarColor && (
                    <div className='text-xs text-primary flex items-center gap-1.5'>
                      <Calendar className='h-3.5 w-3.5' />
                      Calendario
                    </div>
                  )}
                </div>
              </div>
            );
          },
        };

      case "organizer":
        return {
          accessorKey: "organizer",
          header: "Organizador",
          cell: ({ row }) => {
            const organizer = event(row).organizer;
            if (!organizer)
              return <span className='text-muted-foreground'>-</span>;

            // Buscar si el email del organizador coincide con algún calendario
            const organizerCalendar = calendars.find(
              (cal) => cal.id === organizer.email
            );
            const calendarColor = organizerCalendar
              ? {
                  backgroundColor:
                    organizerCalendar.backgroundColor || "hsl(var(--primary))",
                  foregroundColor:
                    organizerCalendar.foregroundColor ||
                    "hsl(var(--primary-foreground))",
                  colorId: organizerCalendar.colorId || "default",
                }
              : null;

            const copyOrganizerId = () => {
              const organizerId = organizer.email || "N/A";
              navigator.clipboard.writeText(organizerId);
              toast({
                title: "ID del organizador copiado",
                description: `${organizerId} copiado al portapapeles`,
                duration: 3000,
              });
            };

            const copyShareLink = () => {
              const calendarId = organizer.email;
              if (calendarId) {
                const shareUrl = `https://calendar.google.com/calendar/u/1?cid=${encodeURIComponent(
                  btoa(calendarId)
                )}`;
                navigator.clipboard.writeText(shareUrl);
                toast({
                  title: "Enlace de calendario copiado",
                  description:
                    "Enlace para compartir calendario copiado al portapapeles",
                  duration: 3000,
                });
              }
            };

            const copyIframeEmbed = () => {
              const calendarId = organizer.email;
              if (calendarId) {
                const encodedId = encodeURIComponent(calendarId);
                const iframe = `<iframe src="https://calendar.google.com/calendar/embed?src=${encodedId}&ctz=Europe%2FMadrid" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"></iframe>`;
                navigator.clipboard.writeText(iframe);
                toast({
                  title: "Código iframe copiado",
                  description:
                    "Código para embeber calendario copiado al portapapeles",
                  duration: 3000,
                });
              }
            };

            return (
              <div className='flex items-center gap-2 text-sm'>
                {/* Círculo de color si es un calendario */}
                {calendarColor && (
                  <div
                    className='w-3 h-3 rounded-full border border-border flex-shrink-0'
                    style={{
                      backgroundColor: calendarColor.backgroundColor,
                      border: `1px solid ${calendarColor.foregroundColor}`,
                    }}
                    title={`Calendario: ${calendarColor.colorId}`}
                  />
                )}

                <div className='flex-1'>
                  <div className='font-medium text-foreground'>
                    {organizer.displayName ||
                      organizer.email?.split("@")[0] ||
                      "Sin nombre"}
                  </div>
                  {calendarColor && (
                    <div className='text-xs text-primary flex items-center gap-1.5'>
                      <Calendar className='h-3.5 w-3.5' />
                      Calendario
                    </div>
                  )}
                </div>

                {/* Copy buttons container */}
                <div className='flex items-center gap-1'>
                  {/* Copy ID button */}
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={(e) => {
                      e.stopPropagation();
                      copyOrganizerId();
                    }}
                    className='h-6 w-6 p-0 text-muted-foreground hover:text-foreground'
                    title={`Copiar ID del organizador: ${
                      organizer.email || "N/A"
                    }`}
                  >
                    <DocumentDuplicateIcon className='h-3 w-3' />
                  </Button>

                  {/* Copy share link button */}
                  {organizer.email && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        copyShareLink();
                      }}
                      className='h-6 w-6 p-0 text-muted-foreground hover:text-primary'
                      title='Copiar enlace para compartir calendario de Google Calendar'
                    >
                      <ShareIcon className='h-3 w-3' />
                    </Button>
                  )}

                  {/* Copy iframe embed button */}
                  {organizer.email && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        copyIframeEmbed();
                      }}
                      className='h-6 w-6 p-0 text-muted-foreground hover:text-card-foreground'
                      title='Copiar código iframe para embeber calendario en web'
                    >
                      <CodeBracketIcon className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              </div>
            );
          },
        };

      case "visibility":
        return {
          accessorKey: "visibility",
          header: "Visibilidad",
          cell: ({ row }) => {
            const visibility = event(row).visibility || "default";
            const colors = {
              default:
                "bg-muted-foreground text-card border-card-foreground/20 font-semibold shadow-sm hover:bg-muted-foreground/90 transition-colors",
              public:
                "bg-muted-foreground text-card border-card-foreground/20 font-semibold shadow-sm hover:bg-muted-foreground/90 transition-colors",
              private:
                "bg-muted-foreground text-card border-card-foreground/20 font-semibold shadow-sm hover:bg-muted-foreground/90 transition-colors",
              confidential:
                "bg-muted-foreground text-card border-card-foreground/20 font-semibold shadow-sm hover:bg-muted-foreground/90 transition-colors",
            };
            return (
              <Badge
                className={
                  colors[visibility as keyof typeof colors] || colors.default
                }
              >
                {visibility}
              </Badge>
            );
          },
        };

      case "transparency":
        return {
          accessorKey: "transparency",
          header: "Transparencia",
          cell: ({ row }) => {
            const transparency = event(row).transparency || "opaque";
            return (
              <Badge className='bg-muted-foreground text-card border-card-foreground/20 font-semibold shadow-sm hover:bg-muted-foreground/90 transition-colors'>
                {transparency === "transparent" ? "Libre" : "Ocupado"}
              </Badge>
            );
          },
        };

      case "htmlLink":
        return {
          accessorKey: "htmlLink",
          header: "Enlace Web",
          cell: ({ row }) => {
            const htmlLink = event(row).htmlLink;
            if (!htmlLink)
              return <span className='text-muted-foreground'>-</span>;
            return (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => window.open(htmlLink, "_blank")}
                className='text-primary p-0 h-auto'
              >
                Ver en Google Calendar
              </Button>
            );
          },
        };

      case "hangoutLink":
        return {
          accessorKey: "hangoutLink",
          header: "Google Meet",
          cell: ({ row }) => {
            const hangoutLink = event(row).hangoutLink;
            const conferenceData = event(row).conferenceData;

            if (!hangoutLink && !conferenceData) {
              return <span className='text-muted-foreground'>Sin Meet</span>;
            }

            return (
              <div className='space-y-1'>
                {hangoutLink && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => window.open(hangoutLink, "_blank")}
                    className='bg-primary text-primary-foreground border-primary hover:bg-primary-foreground hover:text-primary h-7 px-2 text-xs w-full flex items-center gap-1.5 transition-colors'
                  >
                    <Video className='h-3.5 w-3.5' />
                    Unirse a Meet
                  </Button>
                )}

                {conferenceData?.conferenceId && (
                  <div className='text-xs text-foreground font-mono bg-muted/50 p-1 rounded'>
                    ID: {conferenceData.conferenceId}
                  </div>
                )}

                {conferenceData?.entryPoints?.some(
                  (ep: any) => ep.entryPointType === "video"
                ) && (
                  <div className='flex items-center gap-1 text-xs text-card-foreground'>
                    <span className='w-2 h-2 bg-primary rounded-full'></span>
                    Video activo
                  </div>
                )}
              </div>
            );
          },
        };

      case "meetMembers":
        return {
          accessorKey: "meetMembers",
          header: "Participantes",
          cell: ({ row }) => {
            const members = event(row).meetMembers || [];
            const meetUrl = event(row).conferenceData?.entryPoints?.find(
              ep => ep.entryPointType === 'video'
            )?.uri;
            
            if (members.length === 0) {
              return (
                <div className='flex items-center gap-1'>
                  {meetUrl ? (
                    <span className='text-muted-foreground text-xs'>📅 Meeting privado</span>
                  ) : (
                    <span className='text-muted-foreground text-xs'>Sin Meet</span>
                  )}
                </div>
              );
            }
            
            return (
              <div className='space-y-1'>
                {members.slice(0, 3).map((member, idx) => (
                  <div key={idx} className='flex items-center gap-2'>
                    <Badge 
                      variant={member.role === 'COHOST' ? 'default' : 'secondary'}
                      className='text-xs px-1.5 py-0.5'
                    >
                      {member.role === 'COHOST' ? 'Organizador' : 'Invitado'}
                    </Badge>
                    <span className='text-xs text-foreground truncate max-w-[120px]' title={member.email}>
                      {member.name || member.email.split('@')[0]}
                    </span>
                  </div>
                ))}
                {members.length > 3 && (
                  <span className='text-xs text-muted-foreground'>
                    +{members.length - 3} más
                  </span>
                )}
              </div>
            );
          },
        };

      case "conferenceData":
        return {
          accessorKey: "conferenceData",
          header: "Datos Conferencia",
          cell: ({ row }) => {
            const conferenceData = event(row).conferenceData;
            const hangoutLink = event(row).hangoutLink;

            if (!conferenceData && !hangoutLink) {
              return (
                <span className='text-muted-foreground'>Sin conferencia</span>
              );
            }

            return (
              <div className='text-sm max-w-[300px] space-y-2'>
                {/* Conference Solution */}
                {conferenceData?.conferenceSolution && (
                  <div className='flex items-center gap-2 p-3 bg-muted rounded-lg border border-border'>
                    <div className='w-6 h-6 bg-primary/15 rounded flex items-center justify-center'>
                      <Video className='h-3.5 w-3.5 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-foreground text-xs'>
                        {conferenceData.conferenceSolution.name ||
                          "Google Meet"}
                      </div>
                      {/* <div className="text-xs text-muted-foreground">
                        {conferenceData.conferenceSolution.iconUri
                          ? "Con icono"
                          : "Estándar"}
                      </div> */}
                    </div>
                  </div>
                )}

                {/* Conference ID */}
                {conferenceData?.conferenceId && (
                  <div className='p-3 bg-muted/50 rounded'>
                    <div className='text-xs text-muted-foreground mb-1'>
                      ID de Conferencia:
                    </div>
                    <div className='font-mono text-xs text-foreground break-all'>
                      {conferenceData.conferenceId}
                    </div>
                  </div>
                )}

                {/* Entry Points */}
                {conferenceData?.entryPoints &&
                  conferenceData.entryPoints.length > 0 && (
                    <div className='space-y-1'>
                      <div className='text-xs text-muted-foreground font-medium'>
                        Puntos de Acceso:
                      </div>
                      {conferenceData.entryPoints.map(
                        (entry: any, index: number) => (
                          <div
                            key={index}
                            className='flex items-center gap-2 p-1 bg-muted/50 rounded text-xs'
                          >
                            <div className='flex-shrink-0'>
                              {entry.entryPointType === "video" && (
                                <Video className='h-3.5 w-3.5 text-primary' />
                              )}
                              {entry.entryPointType === "phone" && (
                                <div className='text-muted-foreground'>Tel</div>
                              )}
                              {entry.entryPointType === "sip" && (
                                <div className='text-muted-foreground'>SIP</div>
                              )}
                              {entry.entryPointType === "more" && "⚙️"}
                            </div>
                            <div className='flex-1 min-w-0'>
                              {entry.entryPointType === "video" && (
                                <div>
                                  <div className='font-medium text-card-foreground'>
                                    Video
                                  </div>
                                  {entry.uri && (
                                    <button
                                      onClick={() =>
                                        window.open(entry.uri, "_blank")
                                      }
                                      className='text-primary underline hover:no-underline truncate block'
                                    >
                                      Unirse por video
                                    </button>
                                  )}
                                </div>
                              )}
                              {entry.entryPointType === "phone" && (
                                <div>
                                  <div className='font-medium text-foreground'>
                                    Teléfono
                                  </div>
                                  <div className='font-mono text-foreground'>
                                    {entry.uri?.replace("tel:", "") ||
                                      "No disponible"}
                                  </div>
                                  {entry.pin && (
                                    <div className='text-muted-foreground'>
                                      PIN: {entry.pin}
                                    </div>
                                  )}
                                </div>
                              )}
                              {entry.entryPointType === "sip" && (
                                <div>
                                  <div className='font-medium text-foreground'>
                                    SIP
                                  </div>
                                  <div className='text-foreground truncate'>
                                    {entry.uri || entry.label || "Disponible"}
                                  </div>
                                </div>
                              )}
                              {entry.entryPointType === "more" && (
                                <div>
                                  <div className='font-medium text-foreground'>
                                    Más opciones
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    {entry.uri && (
                                      <button
                                        onClick={() =>
                                          window.open(entry.uri, "_blank")
                                        }
                                        className='text-primary underline hover:no-underline'
                                      >
                                        Acceso telefónico web
                                      </button>
                                    )}
                                  </div>
                                  {entry.pin && (
                                    <div className='text-xs text-foreground bg-muted px-1 rounded mt-1'>
                                      PIN:{" "}
                                      <span className='font-mono font-bold'>
                                        {entry.pin}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {/* Signature */}
                {conferenceData?.signature && (
                  <div className='p-1 bg-muted rounded-lg border border-border'>
                    <div className='text-xs text-foreground'>
                      🔐 Firma: {conferenceData.signature.substring(0, 20)}...
                    </div>
                  </div>
                )}

                {/* Notes */}
                {conferenceData?.notes && (
                  <div className='p-3 bg-muted rounded-lg border border-border'>
                    <div className='text-xs text-foreground'>
                      <div className='flex items-center gap-1.5'>
                        <FileText className='h-3.5 w-3.5' />
                        {conferenceData.notes}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback for hangoutLink only */}
                {!conferenceData && hangoutLink && (
                  <div className='p-3 bg-muted rounded-lg border border-border'>
                    <div className='text-xs text-card-foreground mb-1'>
                      Google Meet (Legacy)
                    </div>
                    <button
                      onClick={() => window.open(hangoutLink, "_blank")}
                      className='text-primary underline hover:no-underline text-xs'
                    >
                      Enlace directo disponible
                    </button>
                  </div>
                )}
              </div>
            );
          },
        };

      case "meetingId":
        return {
          accessorKey: "meetingId",
          header: "ID Reunión",
          cell: ({ row }) => {
            const conferenceData = event(row).conferenceData;
            const meetingId = conferenceData?.conferenceId;

            if (!meetingId)
              return <span className='text-muted-foreground'>-</span>;

            return (
              <div className='text-sm'>
                <div className='font-mono text-xs bg-muted p-1 rounded'>
                  {meetingId}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(meetingId)}
                  className='text-xs text-primary hover:underline mt-1'
                >
                  Copiar ID
                </button>
              </div>
            );
          },
        };

      case "meetingCode":
        return {
          accessorKey: "meetingCode",
          header: "Código Reunión",
          cell: ({ row }) => {
            const conferenceData = event(row).conferenceData;
            const hangoutLink = event(row).hangoutLink;

            // Extraer código de meet del enlace si está disponible
            let meetingCode: string | null = null;
            if (hangoutLink) {
              const match = hangoutLink.match(/meet\.google\.com\/([a-z-]+)/);
              meetingCode = match ? match[1] || null : null;
            }

            if (!meetingCode)
              return <span className='text-muted-foreground'>-</span>;

            return (
              <div className='text-sm'>
                <div className='font-mono text-sm font-medium text-card-foreground'>
                  {meetingCode}
                </div>
                <button
                  onClick={() =>
                    meetingCode && navigator.clipboard.writeText(meetingCode)
                  }
                  className='text-xs text-primary hover:underline'
                >
                  Copiar código
                </button>
              </div>
            );
          },
        };

      case "meetingPhone":
        return {
          accessorKey: "meetingPhone",
          header: "Acceso Telefónico",
          cell: ({ row }) => {
            const conferenceData = event(row).conferenceData;
            const phoneEntries =
              conferenceData?.entryPoints?.filter(
                (ep: any) => ep.entryPointType === "phone"
              ) || [];

            if (phoneEntries.length === 0) {
              return (
                <span className='text-muted-foreground'>
                  Sin acceso telefónico
                </span>
              );
            }

            return (
              <div className='text-sm space-y-1'>
                {phoneEntries.map((phone: any, index: number) => (
                  <div
                    key={index}
                    className='p-3 bg-muted rounded-lg border border-border'
                  >
                    <div className='flex items-center gap-2'>
                      <span>
                        <Phone className='h-4 w-4' />
                      </span>
                      <div className='flex-1'>
                        <div className='font-mono text-sm text-foreground'>
                          {phone.label ||
                            phone.uri?.replace("tel:", "") ||
                            "No disponible"}
                        </div>
                        {phone.pin && (
                          <div className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1'>
                            PIN:{" "}
                            <span className='font-mono font-bold'>
                              {phone.pin}
                            </span>
                          </div>
                        )}
                        {phone.regionCode && (
                          <div className='text-xs text-muted-foreground mt-1'>
                            {phone.regionCode}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => window.open(phone.uri, "_self")}
                        className='text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90'
                        title='Llamar'
                      >
                        <Phone className='h-4 w-4' /> Llamar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          },
        };

      case "meetingNotes":
        return {
          accessorKey: "meetingNotes",
          header: "Notas Meet",
          cell: ({ row }) => {
            const conferenceData = event(row).conferenceData;
            const notes = conferenceData?.notes;

            if (!notes)
              return <span className='text-muted-foreground'>Sin notas</span>;

            return (
              <div className='text-sm max-w-[200px]'>
                <div className='p-3 bg-muted rounded-lg border border-border'>
                  <div className='text-foreground text-xs flex items-center gap-1.5'>
                    <FileText className='h-3.5 w-3.5' />
                    {notes}
                  </div>
                </div>
              </div>
            );
          },
        };

      case "recurrence":
        return {
          accessorKey: "recurrence",
          header: "Recurrencia",
          cell: ({ row }) => {
            const recurrence = event(row).recurrence;
            if (!recurrence || recurrence.length === 0)
              return <span className='text-muted-foreground'>-</span>;
            return (
              <Badge className='bg-muted-foreground text-card border-card-foreground/20 font-semibold shadow-sm hover:bg-muted-foreground/90 transition-colors'>
                Recurrente
              </Badge>
            );
          },
        };

      case "colorId":
        return {
          accessorKey: "colorId",
          header: "Color",
          cell: ({ row }) => {
            const colorId = event(row).colorId;
            if (!colorId)
              return <span className='text-muted-foreground'>-</span>;
            return (
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 rounded-full bg-muted-foreground'></div>
                <span className='text-sm'>Color {colorId}</span>
              </div>
            );
          },
        };

      case "calendar":
        return {
          id: "calendar",
          header: "Calendario",
          cell: ({ row }) => {
            const eventData = event(row);
            const calendarId = (eventData as any).calendarId;
            const eventId = eventData.id!;

            if (!calendarId)
              return <span className='text-muted-foreground'>-</span>;

            return (
              <EditableCalendarField
                currentCalendarId={calendarId}
                eventId={eventId}
                calendars={calendars}
                onUpdate={handleMoveEventToCalendar}
              />
            );
          },
          filterFn: (row, id, value: string[]) => {
            const calendarId = (event(row) as any).calendarId;
            if (!value || value.length === 0) return true;
            return value.includes(calendarId);
          },
        };

      case "actions":
        return {
          id: "actions",
          header: "Acciones",
          cell: ({ row }) => (
            <div className='flex items-center gap-1'>
              {event(row).htmlLink && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => window.open(event(row).htmlLink, "_blank")}
                  className='h-8 w-8 p-0'
                  title='Ver en Google Calendar'
                >
                  <EyeIcon className='h-4 w-4' />
                </Button>
              )}

              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  if (onEventEdit) {
                    onEventEdit(event(row));
                  } else if (router) {
                    router.push(
                      `/admin/calendar/events/${event(row).id}?calendarId=${
                        (event(row) as any).calendarId || defaultCalendarId
                      }`
                    );
                  }
                }}
                className='h-8 w-8 p-0'
                title='Editar evento'
              >
                <PencilIcon className='h-4 w-4' />
              </Button>

              <Button
                variant='ghost'
                size='sm'
                onClick={() =>
                  handleDeleteEvent(
                    event(row).id!,
                    (event(row) as any).calendarId || defaultCalendarId
                  )
                }
                className='h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10'
                title='Eliminar evento'
              >
                <TrashIcon className='h-4 w-4' />
              </Button>
            </div>
          ),
        };

      default:
        // Columna genérica para propiedades no implementadas específicamente
        return {
          accessorKey: columnId,
          header:
            AVAILABLE_COLUMNS[columnId as keyof typeof AVAILABLE_COLUMNS]
              ?.label || columnId,
          cell: ({ row }) => {
            const value = (event(row) as any)[columnId];
            if (value === undefined || value === null)
              return <span className='text-muted-foreground'>-</span>;

            if (typeof value === "boolean") {
              return (
                <Badge className='bg-muted-foreground text-card border-card-foreground/20 font-semibold shadow-sm hover:bg-muted-foreground/90 transition-colors'>
                  {value ? "Sí" : "No"}
                </Badge>
              );
            }

            if (typeof value === "object") {
              return <span className='text-sm text-foreground'>Objeto</span>;
            }

            return (
              <div
                className='text-sm truncate max-w-[200px]'
                title={String(value)}
              >
                {String(value)}
              </div>
            );
          },
        };
    }
  };

  // Generar solo las columnas visibles
  const columns = visibleColumns
    .map((columnId) => generateColumn(columnId))
    .filter(Boolean);

  // Siempre incluir la columna de acciones al final si no está explícitamente incluida
  if (!visibleColumns.includes("actions")) {
    columns.push(generateColumn("actions"));
  }

  return columns;
};
