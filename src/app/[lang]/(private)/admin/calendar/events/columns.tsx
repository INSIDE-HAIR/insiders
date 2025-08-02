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
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { useRouter } from "next/navigation";
import { AVAILABLE_COLUMNS } from "./components/ColumnController";
import { toast } from "@/src/components/ui/use-toast";

export const useEventsColumns = (
  defaultCalendarId: string,
  onRefresh: () => void,
  visibleColumns: string[] = Object.keys(AVAILABLE_COLUMNS),
  calendars: Array<{
    id: string;
    summary: string;
    colorId?: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }> = []
): ColumnDef<GoogleCalendarEvent>[] => {
  const router = useRouter();

  // Helper para obtener el color del calendario
  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find((cal) => cal.id === calendarId);
    return {
      backgroundColor: calendar?.backgroundColor || "#4285f4",
      foregroundColor: calendar?.foregroundColor || "#ffffff",
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
      return { status: "upcoming", color: "blue", label: "Próximo" };
    if (now > end) return { status: "past", color: "gray", label: "Pasado" };
    return { status: "ongoing", color: "green", label: "En curso" };
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

  // Función para generar una columna basada en el ID
  const generateColumn = (columnId: string): ColumnDef<GoogleCalendarEvent> => {
    const event = (row: any) => row.original as GoogleCalendarEvent;

    switch (columnId) {
      case "summary":
        return {
          accessorKey: "summary",
          header: "Título",
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium truncate" title={event(row).summary}>
                {event(row).summary || "Sin título"}
              </span>
            </div>
          ),
        };

      case "start":
        return {
          accessorKey: "start",
          header: "Fecha/Hora Inicio",
          cell: ({ row }) => (
            <div className="text-sm">{formatEventDate(event(row))}</div>
          ),
        };

      case "end":
        return {
          accessorKey: "end",
          header: "Fecha/Hora Fin",
          cell: ({ row }) => {
            const end = event(row).end?.dateTime || event(row).end?.date;
            if (!end) return <span className="text-gray-500">-</span>;

            const date = new Date(end);
            const isAllDay = !!event(row).end?.date;

            if (isAllDay) {
              return (
                <div className="text-sm">
                  {date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              );
            }
            return (
              <div className="text-sm">
                {date.toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
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
              <Badge
                variant={
                  eventStatus.color === "blue" || eventStatus.color === "green"
                    ? "default"
                    : "secondary"
                }
                className={
                  eventStatus.color === "green"
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : eventStatus.color === "blue"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }
              >
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
              className="text-sm text-gray-600 truncate max-w-[200px]"
              title={event(row).location}
            >
              {event(row).location ? `📍 ${event(row).location}` : "-"}
            </div>
          ),
        };

      case "attendees":
        return {
          accessorKey: "attendees",
          header: "Invitados",
          cell: ({ row }) => {
            const attendees = event(row).attendees || [];

            if (attendees.length === 0) {
              return <div className="text-sm text-gray-500">-</div>;
            }

            // Agrupar por estado para mejor visualización
            const statusCounts = {
              accepted: attendees.filter((a) => a.responseStatus === "accepted")
                .length,
              declined: attendees.filter((a) => a.responseStatus === "declined")
                .length,
              tentative: attendees.filter(
                (a) => a.responseStatus === "tentative"
              ).length,
              needsAction: attendees.filter(
                (a) => a.responseStatus === "needsAction"
              ).length,
            };

            return (
              <div className="text-sm max-w-[400px]">
                {/* Resumen de estados */}
                <div className="flex gap-3 mb-2 p-2 bg-blue-50 rounded">
                  {statusCounts.accepted > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-medium text-green-700">
                        {statusCounts.accepted} ✓
                      </span>
                    </div>
                  )}
                  {statusCounts.declined > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="font-medium text-red-700">
                        {statusCounts.declined} ✗
                      </span>
                    </div>
                  )}
                  {statusCounts.tentative > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="font-medium text-yellow-700">
                        {statusCounts.tentative} ?
                      </span>
                    </div>
                  )}
                  {statusCounts.needsAction > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="font-medium text-gray-600">
                        {statusCounts.needsAction} ⏳
                      </span>
                    </div>
                  )}
                </div>

                {/* Lista detallada de invitados */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {attendees.map((attendee, index) => {
                    const statusConfig = {
                      accepted: {
                        color: "bg-green-500",
                        text: "text-green-700",
                        label: "Aceptado",
                        icon: "✓",
                      },
                      declined: {
                        color: "bg-red-500",
                        text: "text-red-700",
                        label: "Rechazado",
                        icon: "✗",
                      },
                      tentative: {
                        color: "bg-yellow-500",
                        text: "text-yellow-700",
                        label: "Tentativo",
                        icon: "?",
                      },
                      needsAction: {
                        color: "bg-gray-400",
                        text: "text-gray-600",
                        label: "Sin respuesta",
                        icon: "⏳",
                      },
                    };

                    const config =
                      statusConfig[
                        attendee.responseStatus as keyof typeof statusConfig
                      ] || statusConfig.needsAction;

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-1 bg-gray-50 rounded text-xs"
                      >
                        <div className="flex-1">
                          <div className="font-mono text-gray-900 text-xs">
                            {attendee.email}
                          </div>
                          {attendee.displayName && (
                            <div className="text-gray-600 text-xs">
                              {attendee.displayName}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span
                            className={`w-2 h-2 ${config.color} rounded-full`}
                            title={config.label}
                          ></span>
                          <span
                            className={`text-xs font-medium ${config.text}`}
                          >
                            {config.icon}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-gray-500 mt-2 font-medium border-t pt-1">
                  Total: {attendees.length} invitado
                  {attendees.length !== 1 ? "s" : ""}
                </div>
              </div>
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
          cell: ({ row }) => (
            <div
              className="text-sm text-gray-500 truncate max-w-[300px]"
              title={event(row).description}
            >
              {event(row).description || "-"}
            </div>
          ),
        };

      case "created":
        return {
          accessorKey: "created",
          header: "Fecha Creación",
          cell: ({ row }) => {
            const created = event(row).created;
            if (!created) return <span className="text-gray-500">-</span>;
            return (
              <div className="text-sm">
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
            if (!updated) return <span className="text-gray-500">-</span>;
            return (
              <div className="text-sm">
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
            if (!creator) return <span className="text-gray-500">-</span>;

            // Buscar si el email del creador coincide con algún calendario
            const creatorCalendar = calendars.find(
              (cal) => cal.id === creator.email
            );
            const calendarColor = creatorCalendar
              ? {
                  backgroundColor: creatorCalendar.backgroundColor || "#4285f4",
                  foregroundColor: creatorCalendar.foregroundColor || "#ffffff",
                  colorId: creatorCalendar.colorId || "default",
                }
              : null;

            return (
              <div className="flex items-center gap-2 text-sm">
                {/* Círculo de color si es un calendario */}
                {calendarColor && (
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                    style={{
                      backgroundColor: calendarColor.backgroundColor,
                      border: `1px solid ${calendarColor.foregroundColor}`,
                    }}
                    title={`Calendario: ${calendarColor.colorId}`}
                  />
                )}

                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {creator.displayName ||
                      creator.email?.split("@")[0] ||
                      "Sin nombre"}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {creator.email}
                  </div>
                  {calendarColor && (
                    <div className="text-xs text-blue-600">📅 Calendario</div>
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
            if (!organizer) return <span className="text-gray-500">-</span>;

            // Buscar si el email del organizador coincide con algún calendario
            const organizerCalendar = calendars.find(
              (cal) => cal.id === organizer.email
            );
            const calendarColor = organizerCalendar
              ? {
                  backgroundColor:
                    organizerCalendar.backgroundColor || "#4285f4",
                  foregroundColor:
                    organizerCalendar.foregroundColor || "#ffffff",
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
              <div className="flex items-center gap-2 text-sm">
                {/* Círculo de color si es un calendario */}
                {calendarColor && (
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                    style={{
                      backgroundColor: calendarColor.backgroundColor,
                      border: `1px solid ${calendarColor.foregroundColor}`,
                    }}
                    title={`Calendario: ${calendarColor.colorId}`}
                  />
                )}

                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {organizer.displayName ||
                      organizer.email?.split("@")[0] ||
                      "Sin nombre"}
                  </div>
                  {calendarColor && (
                    <div className="text-xs text-blue-600">📅 Calendario</div>
                  )}
                </div>

                {/* Copy buttons container */}
                <div className="flex items-center gap-1">
                  {/* Copy ID button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyOrganizerId();
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    title={`Copiar ID del organizador: ${
                      organizer.email || "N/A"
                    }`}
                  >
                    <DocumentDuplicateIcon className="h-3 w-3" />
                  </Button>

                  {/* Copy share link button */}
                  {organizer.email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyShareLink();
                      }}
                      className="h-6 w-6 p-0 text-blue-400 hover:text-blue-600"
                      title="Copiar enlace para compartir calendario de Google Calendar"
                    >
                      <ShareIcon className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Copy iframe embed button */}
                  {organizer.email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyIframeEmbed();
                      }}
                      className="h-6 w-6 p-0 text-green-400 hover:text-green-600"
                      title="Copiar código iframe para embeber calendario en web"
                    >
                      <CodeBracketIcon className="h-3 w-3" />
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
              default: "bg-blue-100 text-blue-800",
              public: "bg-green-100 text-green-800",
              private: "bg-red-100 text-red-800",
              confidential: "bg-orange-100 text-orange-800",
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
              <Badge
                variant={transparency === "transparent" ? "outline" : "default"}
              >
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
            if (!htmlLink) return <span className="text-gray-500">-</span>;
            return (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(htmlLink, "_blank")}
                className="text-blue-600 p-0 h-auto"
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
              return <span className="text-gray-500">Sin Meet</span>;
            }

            return (
              <div className="space-y-1">
                {hangoutLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(hangoutLink, "_blank")}
                    className="text-green-600 border-green-200 hover:bg-green-50 h-7 px-2 text-xs w-full"
                  >
                    🎥 Unirse a Meet
                  </Button>
                )}

                {conferenceData?.conferenceId && (
                  <div className="text-xs text-gray-600 font-mono bg-gray-50 p-1 rounded">
                    ID: {conferenceData.conferenceId}
                  </div>
                )}

                {conferenceData?.entryPoints?.some(
                  (ep: any) => ep.entryPointType === "video"
                ) && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Video activo
                  </div>
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
              return <span className="text-gray-500">Sin conferencia</span>;
            }

            return (
              <div className="text-sm max-w-[300px] space-y-2">
                {/* Conference Solution */}
                {conferenceData?.conferenceSolution && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      🎥
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-blue-900 text-xs">
                        {conferenceData.conferenceSolution.name ||
                          "Google Meet"}
                      </div>
                      <div className="text-xs text-blue-700">
                        {conferenceData.conferenceSolution.iconUri
                          ? "Con icono"
                          : "Estándar"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Conference ID */}
                {conferenceData?.conferenceId && (
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500 mb-1">
                      ID de Conferencia:
                    </div>
                    <div className="font-mono text-xs text-gray-900 break-all">
                      {conferenceData.conferenceId}
                    </div>
                  </div>
                )}

                {/* Entry Points */}
                {conferenceData?.entryPoints &&
                  conferenceData.entryPoints.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 font-medium">
                        Puntos de Acceso:
                      </div>
                      {conferenceData.entryPoints.map(
                        (entry: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-1 bg-gray-50 rounded text-xs"
                          >
                            <div className="flex-shrink-0">
                              {entry.entryPointType === "video" && "🎥"}
                              {entry.entryPointType === "phone" && "📞"}
                              {entry.entryPointType === "sip" && "📡"}
                              {entry.entryPointType === "more" && "⚙️"}
                            </div>
                            <div className="flex-1 min-w-0">
                              {entry.entryPointType === "video" && (
                                <div>
                                  <div className="font-medium text-green-700">
                                    Video
                                  </div>
                                  {entry.uri && (
                                    <button
                                      onClick={() =>
                                        window.open(entry.uri, "_blank")
                                      }
                                      className="text-green-600 hover:underline truncate block"
                                    >
                                      Unirse por video
                                    </button>
                                  )}
                                </div>
                              )}
                              {entry.entryPointType === "phone" && (
                                <div>
                                  <div className="font-medium text-blue-700">
                                    Teléfono
                                  </div>
                                  <div className="font-mono text-gray-600">
                                    {entry.uri?.replace("tel:", "") ||
                                      "No disponible"}
                                  </div>
                                  {entry.pin && (
                                    <div className="text-gray-500">
                                      PIN: {entry.pin}
                                    </div>
                                  )}
                                </div>
                              )}
                              {entry.entryPointType === "sip" && (
                                <div>
                                  <div className="font-medium text-gray-700">
                                    SIP
                                  </div>
                                  <div className="text-gray-600 truncate">
                                    {entry.uri || entry.label || "Disponible"}
                                  </div>
                                </div>
                              )}
                              {entry.entryPointType === "more" && (
                                <div>
                                  <div className="font-medium text-purple-700">
                                    Más opciones
                                  </div>
                                  <div className="text-purple-600 text-xs">
                                    {entry.uri && (
                                      <button
                                        onClick={() =>
                                          window.open(entry.uri, "_blank")
                                        }
                                        className="text-purple-600 hover:underline"
                                      >
                                        Acceso telefónico web
                                      </button>
                                    )}
                                  </div>
                                  {entry.pin && (
                                    <div className="text-xs text-purple-700 bg-purple-50 px-1 rounded mt-1">
                                      PIN:{" "}
                                      <span className="font-mono font-bold">
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
                  <div className="p-1 bg-yellow-50 rounded">
                    <div className="text-xs text-yellow-700">
                      🔐 Firma: {conferenceData.signature.substring(0, 20)}...
                    </div>
                  </div>
                )}

                {/* Notes */}
                {conferenceData?.notes && (
                  <div className="p-2 bg-amber-50 rounded">
                    <div className="text-xs text-amber-800">
                      📝 {conferenceData.notes}
                    </div>
                  </div>
                )}

                {/* Fallback for hangoutLink only */}
                {!conferenceData && hangoutLink && (
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-xs text-green-700 mb-1">
                      Google Meet (Legacy)
                    </div>
                    <button
                      onClick={() => window.open(hangoutLink, "_blank")}
                      className="text-green-600 hover:underline text-xs"
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

            if (!meetingId) return <span className="text-gray-500">-</span>;

            return (
              <div className="text-sm">
                <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                  {meetingId}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(meetingId)}
                  className="text-xs text-blue-600 hover:underline mt-1"
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
              meetingCode = match ? match[1] : null;
            }

            if (!meetingCode) return <span className="text-gray-500">-</span>;

            return (
              <div className="text-sm">
                <div className="font-mono text-sm font-medium text-green-700">
                  {meetingCode}
                </div>
                <button
                  onClick={() =>
                    meetingCode && navigator.clipboard.writeText(meetingCode)
                  }
                  className="text-xs text-blue-600 hover:underline"
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
                <span className="text-gray-500">Sin acceso telefónico</span>
              );
            }

            return (
              <div className="text-sm space-y-1">
                {phoneEntries.map((phone: any, index: number) => (
                  <div key={index} className="p-2 bg-blue-50 rounded">
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      <div className="flex-1">
                        <div className="font-mono text-sm text-blue-900">
                          {phone.label ||
                            phone.uri?.replace("tel:", "") ||
                            "No disponible"}
                        </div>
                        {phone.pin && (
                          <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded mt-1">
                            PIN:{" "}
                            <span className="font-mono font-bold">
                              {phone.pin}
                            </span>
                          </div>
                        )}
                        {phone.regionCode && (
                          <div className="text-xs text-gray-600 mt-1">
                            🌍 {phone.regionCode}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => window.open(phone.uri, "_self")}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        title="Llamar"
                      >
                        📞 Llamar
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

            if (!notes) return <span className="text-gray-500">Sin notas</span>;

            return (
              <div className="text-sm max-w-[200px]">
                <div className="p-2 bg-amber-50 rounded">
                  <div className="text-amber-800 text-xs">📝 {notes}</div>
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
              return <span className="text-gray-500">-</span>;
            return <Badge variant="outline">Recurrente</Badge>;
          },
        };

      case "colorId":
        return {
          accessorKey: "colorId",
          header: "Color",
          cell: ({ row }) => {
            const colorId = event(row).colorId;
            if (!colorId) return <span className="text-gray-500">-</span>;
            return (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                <span className="text-sm">Color {colorId}</span>
              </div>
            );
          },
        };

      case "calendar":
        return {
          id: "calendar",
          header: "Calendario",
          cell: ({ row }) => {
            const calendarId = (event(row) as any).calendarId;
            if (!calendarId) return <span className="text-gray-500">-</span>;

            const calendarColor = getCalendarColor(calendarId);

            return (
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                  style={{
                    backgroundColor: calendarColor.backgroundColor,
                    border: `2px solid ${calendarColor.foregroundColor}`,
                  }}
                  title={`Color: ${calendarColor.colorId}`}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="font-medium text-gray-900 truncate"
                    title={calendarColor.summary}
                  >
                    {calendarColor.summary}
                  </div>
                  <div
                    className="text-xs text-gray-500 font-mono truncate"
                    title={calendarId}
                  >
                    {calendarId.length > 20
                      ? `${calendarId.substring(0, 20)}...`
                      : calendarId}
                  </div>
                </div>
              </div>
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
            <div className="flex items-center gap-1">
              {event(row).htmlLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(event(row).htmlLink, "_blank")}
                  className="h-8 w-8 p-0"
                  title="Ver en Google Calendar"
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(
                    `/admin/calendar/events/${event(row).id}?calendarId=${
                      (event(row) as any).calendarId || defaultCalendarId
                    }`
                  )
                }
                className="h-8 w-8 p-0"
                title="Editar evento"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleDeleteEvent(
                    event(row).id!,
                    (event(row) as any).calendarId || defaultCalendarId
                  )
                }
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Eliminar evento"
              >
                <TrashIcon className="h-4 w-4" />
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
              return <span className="text-gray-500">-</span>;

            if (typeof value === "boolean") {
              return (
                <Badge variant={value ? "default" : "outline"}>
                  {value ? "Sí" : "No"}
                </Badge>
              );
            }

            if (typeof value === "object") {
              return <span className="text-sm text-gray-600">Objeto</span>;
            }

            return (
              <div
                className="text-sm truncate max-w-[200px]"
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
