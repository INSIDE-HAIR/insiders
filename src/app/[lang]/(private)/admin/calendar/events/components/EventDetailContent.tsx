"use client";

import React, { useState, useEffect } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import {
  XMarkIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  MapPinIcon,
  BellIcon,
  CalendarIcon,
  EyeIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  SpeakerXMarkIcon,
  PlusIcon,
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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { invitedUsers } from "./constants";

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
  const [editedEvent, setEditedEvent] = useState<Partial<GoogleCalendarEvent>>(event);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "find-time" | "guests">("details");
  const [showMoreActions, setShowMoreActions] = useState(false);

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

  const handleSave = async () => {
    try {
      await onSave(editedEvent);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving event:", error);
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

      const result = await response.json();
      setEditedEvent({ ...editedEvent, hangoutLink: result.meetLink });
    } catch (error) {
      console.error("Error adding Google Meet:", error);
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
    } catch (error) {
      console.error("Error removing Google Meet:", error);
    }
  };

  const currentCalendar = calendars.find(
    (cal) => cal.id === (event as any).calendarId
  );

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background w-full md:w-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-4 flex-1">
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-background/80 rounded-full transition-all duration-200 shadow-sm"
              >
                <XMarkIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent.summary || ""}
                  onChange={(e) =>
                    setEditedEvent({
                      ...editedEvent,
                      summary: e.target.value,
                    })
                  }
                  className="text-xl font-semibold w-full border-none outline-none bg-transparent placeholder-muted-foreground text-foreground"
                  placeholder="Agregar título del evento"
                />
              ) : (
                <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                  {event.summary}
                </h1>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 px-4 md:px-6"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? "Guardar" : "Editar"}
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="flex items-center gap-1 border-input hover:border-border hover:bg-accent/50 transition-all duration-200"
              >
                Más acciones
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
              {showMoreActions && (
                <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-xl z-10 min-w-48 py-2">
                  <button className="w-full text-left px-4 py-2 hover:bg-accent/50 flex items-center gap-3 text-foreground transition-colors">
                    <DocumentDuplicateIcon className="h-4 w-4" />
                    Duplicar evento
                  </button>
                  <div className="border-t border-border my-1"></div>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive flex items-center gap-3 transition-colors"
                    onClick={onDelete}
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Eliminar evento
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date and Time Section */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-background border border-gray-200 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {formatDateTime(event.start)}
              </span>
            </div>
            <span className="text-sm text-gray-400 font-medium">a</span>
            <div className="flex items-center gap-2 bg-background border border-gray-200 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-gray-700">
                {formatDateTime(event.end)}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="text-xs text-primary font-medium">
                (GMT+02:00) Europa central - Madrid
              </span>
            </div>
            <button className="text-primary text-sm hover:text-primary font-medium hover:underline transition-colors">
              Zona horaria
            </button>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={!!event.start?.date}
                className="group-hover:border-blue-500 transition-colors"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Todo el día
              </span>
            </label>
            <Select defaultValue="no-repeat">
              <SelectTrigger className="w-40 border-gray-200 hover:border-border transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-repeat">No se repite</SelectItem>
                <SelectItem value="daily">Diariamente</SelectItem>
                <SelectItem value="weekly">Semanalmente</SelectItem>
                <SelectItem value="monthly">Mensualmente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50/30">
          <nav className="flex">
            <button
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
                activeTab === "details"
                  ? "text-primary border-primary bg-background shadow-sm"
                  : "text-gray-600 border-transparent hover:text-gray-800 hover:bg-background/50"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Detalles del evento
              {activeTab === "details" && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              )}
            </button>
            <button
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
                activeTab === "find-time"
                  ? "text-primary border-primary bg-background shadow-sm"
                  : "text-gray-600 border-transparent hover:text-gray-800 hover:bg-background/50"
              }`}
              onClick={() => setActiveTab("find-time")}
            >
              Encontrar un hueco
              {activeTab === "find-time" && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              )}
            </button>
            <button
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 relative ${
                activeTab === "guests"
                  ? "text-primary border-primary bg-background shadow-sm"
                  : "text-gray-600 border-transparent hover:text-gray-800 hover:bg-background/50"
              }`}
              onClick={() => setActiveTab("guests")}
            >
              Invitados
              {activeTab === "guests" && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "details" && (
            <div className="p-6 space-y-6">
              {/* Google Meet Section */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-4 h-4 bg-card-foreground rounded"></div>
                </div>
                <div className="flex-1">
                  {editedEvent.hangoutLink || event.hangoutLink ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Google Meet</span>
                        <ChevronDownIcon className="h-4 w-4" />
                        <button
                          className="ml-auto hover:bg-gray-100 p-1 rounded"
                          onClick={handleRemoveGoogleMeet}
                          title="Eliminar Google Meet"
                        >
                          <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="bg-card rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() =>
                              window.open(
                                editedEvent.hangoutLink ||
                                  event.hangoutLink,
                                "_blank"
                              )
                            }
                          >
                            Unirse con Google Meet
                          </Button>
                          <div className="flex items-center gap-2">
                            <button
                              className="p-1 hover:bg-card rounded"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  editedEvent.hangoutLink ||
                                    event.hangoutLink ||
                                    ""
                                )
                              }
                              title="Copiar enlace"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 hover:bg-card rounded">
                              <Cog6ToothIcon className="h-4 w-4" />
                            </button>
                            <ChevronDownIcon className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="truncate">
                            {editedEvent.hangoutLink || event.hangoutLink}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                editedEvent.hangoutLink ||
                                  event.hangoutLink ||
                                  ""
                              )
                            }
                            title="Copiar enlace"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Google Meet</span>
                        <ChevronDownIcon className="h-4 w-4" />
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleAddGoogleMeet}
                        className="text-primary border-primary hover:bg-card"
                      >
                        Agregar Google Meet
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Location Section */}
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-6 w-6 text-gray-400" />
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedEvent.location || ""}
                      onChange={(e) =>
                        setEditedEvent({
                          ...editedEvent,
                          location: e.target.value,
                        })
                      }
                      className="w-full border-none outline-none text-gray-400"
                      placeholder="Añade una ubicación"
                    />
                  ) : (
                    <span className="text-gray-400">
                      {event.location || "Añade una ubicación"}
                    </span>
                  )}
                </div>
              </div>

              {/* Notification Section */}
              <div className="flex items-center gap-3">
                <BellIcon className="h-6 w-6 text-gray-400" />
                <div className="flex-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    Añadir una notificación
                  </button>
                </div>
              </div>

              {/* Calendar Section */}
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
                <div className="flex-1 flex items-center gap-3">
                  <Select defaultValue={currentCalendar?.id}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {calendars.map((calendar) => (
                        <SelectItem key={calendar.id} value={calendar.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: calendar.backgroundColor,
                              }}
                            />
                            {calendar.summary}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Visibility Section */}
              <div className="flex items-center gap-3">
                <EyeIcon className="h-6 w-6 text-gray-400" />
                <div className="flex-1 flex items-center gap-3">
                  <Select defaultValue={event.visibility || "default"}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">
                        Disponibilidad por defecto
                      </SelectItem>
                      <SelectItem value="busy">Ocupado</SelectItem>
                      <SelectItem value="free">Libre</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="predetermined">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="predetermined">
                        Visibilidad predeterminada
                      </SelectItem>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                La disponibilidad podría mostrarse en otras aplicaciones de
                Google
              </div>

              {/* Description Editor */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <SpeakerXMarkIcon className="h-4 w-4" />
                  <button className="text-primary hover:underline border border-dashed border-border px-2 py-1 rounded">
                    Crear notas de la reunión con IA
                  </button>
                </div>

                {/* Rich Text Editor Toolbar */}
                <div className="border-t border-b py-2">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <BoldIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ItalicIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <UnderlineIcon className="h-4 w-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ListBulletIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <NumberedListIcon className="h-4 w-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <LinkIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <SpeakerXMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Description Text Area */}
                <div className="bg-gray-50 rounded p-4 min-h-32">
                  {isEditing ? (
                    <ReactQuill
                      value={editedEvent.description || ""}
                      onChange={(value) =>
                        setEditedEvent({
                          ...editedEvent,
                          description: value,
                        })
                      }
                      className="bg-background"
                    />
                  ) : (
                    <div
                      className="prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80 [&_a]:font-medium"
                      dangerouslySetInnerHTML={{
                        __html: event.description || "",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "find-time" && (
            <div className="p-6">
              <div className="text-center text-gray-500">
                Funcionalidad de búsqueda de horarios disponibles
              </div>
            </div>
          )}

          {activeTab === "guests" && (
            <div className="p-6">
              <div className="text-center text-gray-500">
                Vista de gestión de invitados
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Guests */}
      <div className="w-full md:w-80 border-l bg-gray-50">
        <div className="p-4 border-b bg-background">
          <h3 className="font-medium mb-3">Invitados</h3>

          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Añadir invitados"
              className="w-full pl-3 pr-10 py-2 border rounded-md text-sm"
            />
            <PlusIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{invitedUsers.length} invitados</span>
            <div className="flex items-center gap-2">
              <span>
                {invitedUsers.filter((a) => a.responseStatus === "accepted").length} sí
              </span>
              <span>
                {invitedUsers.filter((a) => a.responseStatus === "declined").length} no
              </span>
              <span>
                {invitedUsers.filter((a) => a.responseStatus === "needsAction").length} en espera
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {invitedUsers.map((attendee, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">
                  {attendee.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {attendee.email}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <button className="text-primary text-sm hover:underline">
            Sugerencias de horas
          </button>
        </div>

        <div className="p-4 border-t">
          <h4 className="font-medium mb-3">Permisos de invitados</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked />
              Editar el evento
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked />
              Invitar a otros
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked />
              Ver la lista de invitados
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};