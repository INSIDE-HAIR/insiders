/**
 * Calendar Events List
 *
 * Página para listar y gestionar eventos de calendario
 * Incluye filtros, búsqueda y acciones CRUD
 */

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TableCellsIcon,
  ListBulletIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { DataTable } from "./components/DataTable";
import { useEventsColumns } from "./columns";
import { CalendarMultiSelect } from "./components/CalendarMultiSelect";
import { ColumnController } from "./components/ColumnController";
import { AttendeesFilter } from "./components/AttendeesFilter";
import { EventDetailModal } from "./components/EventDetailModal";
import { BulkAddParticipantsModal } from "./components/BulkAddParticipantsModal";
import { useCalendarFiltersStore } from "@/src/stores/calendarFiltersStore";
import { toast } from "@/src/components/ui/use-toast";

interface EventsPageState {
  events: GoogleCalendarEvent[];
  calendars: Array<{
    id: string;
    summary: string;
    colorId?: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
  isLoading: boolean;
  error: string | null;
  selectedEvent: GoogleCalendarEvent | null;
  isModalOpen: boolean;
  selectedEventsForBulk: GoogleCalendarEvent[];
  isBulkModalOpen: boolean;
}

const CalendarEventsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<EventsPageState>({
    events: [],
    calendars: [],
    isLoading: true,
    error: null,
    selectedEvent: null,
    isModalOpen: false,
    selectedEventsForBulk: [],
    isBulkModalOpen: false,
  });

  const {
    activeCalendars,
    timeRange,
    search,
    viewMode,
    visibleColumns,
    attendeesFilter,
    setTimeRange,
    setSearch,
    setViewMode,
    setColumnVisibility,
    setAttendeesFilter,
    initializeCalendars,
    resetFilters,
  } = useCalendarFiltersStore();

  // Verificar autenticación y permisos
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Cargar datos iniciales
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadInitialData();
    }
  }, [status, session]);

  // Recargar eventos cuando cambien los filtros
  useEffect(() => {
    if (state.calendars.length > 0) {
      loadEvents();
    }
  }, [activeCalendars, timeRange, search]);

  const loadInitialData = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Cargar calendarios disponibles
      const calendarsResponse = await fetch("/api/calendar/calendars");
      if (!calendarsResponse.ok) {
        throw new Error("Error loading calendars");
      }

      const calendarsData = await calendarsResponse.json();
      const calendars = calendarsData.calendars || [];

      setState((prev) => ({
        ...prev,
        calendars,
      }));

      // Inicializar calendarios activos (todos por defecto)
      const calendarIds = calendars.map((cal: any) => cal.id);
      initializeCalendars(calendarIds);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Error loading initial data",
        isLoading: false,
      }));
    }
  };

  const loadEvents = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Si no hay calendarios activos, no cargar eventos
      if (activeCalendars.length === 0) {
        setState((prev) => ({
          ...prev,
          events: [],
          isLoading: false,
        }));
        return;
      }

      // Cargar eventos de todos los calendarios activos
      const allEvents: GoogleCalendarEvent[] = [];

      for (const calendarId of activeCalendars) {
        try {
          // Construir parámetros de consulta
          const params = new URLSearchParams({
            calendarId: calendarId,
            maxResults: "100",
            orderBy: "startTime",
            singleEvents: "true",
          });

          // Agregar filtros de tiempo
          const now = new Date();
          let timeMin: string | undefined;
          let timeMax: string | undefined;

          switch (timeRange) {
            case "upcoming":
              timeMin = now.toISOString();
              break;
            case "today":
              const startOfDay = new Date(now);
              startOfDay.setHours(0, 0, 0, 0);
              const endOfDay = new Date(now);
              endOfDay.setHours(23, 59, 59, 999);
              timeMin = startOfDay.toISOString();
              timeMax = endOfDay.toISOString();
              break;
            case "week":
              timeMin = now.toISOString();
              const weekFromNow = new Date(now);
              weekFromNow.setDate(weekFromNow.getDate() + 7);
              timeMax = weekFromNow.toISOString();
              break;
            case "month":
              timeMin = now.toISOString();
              const monthFromNow = new Date(now);
              monthFromNow.setMonth(monthFromNow.getMonth() + 1);
              timeMax = monthFromNow.toISOString();
              break;
            case "all":
              // Sin límite temporal, comenzar desde hace 1 mes
              const monthAgo = new Date(now);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              timeMin = monthAgo.toISOString();
              break;
          }

          if (timeMin) params.append("timeMin", timeMin);
          if (timeMax) params.append("timeMax", timeMax);
          if (search) params.append("q", search);

          const response = await fetch(`/api/calendar/events?${params}`);
          if (response.ok) {
            const data = await response.json();
            const events = data.items || [];

            // Agregar información del calendario a cada evento
            const eventsWithCalendar = events.map(
              (event: GoogleCalendarEvent) => ({
                ...event,
                calendarId: calendarId,
              })
            );

            allEvents.push(...eventsWithCalendar);
          }
        } catch (calendarError) {
          console.warn(
            `Error loading events from calendar ${calendarId}:`,
            calendarError
          );
        }
      }

      // Ordenar todos los eventos por fecha
      allEvents.sort((a, b) => {
        const dateA = new Date(a.start?.dateTime || a.start?.date || "");
        const dateB = new Date(b.start?.dateTime || b.start?.date || "");
        return dateA.getTime() - dateB.getTime();
      });

      setState((prev) => ({
        ...prev,
        events: allEvents,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Error loading events",
        isLoading: false,
      }));
    }
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

      // Recargar eventos
      loadEvents();
    } catch (error: any) {
      alert(`Error eliminando evento: ${error.message}`);
    }
  };

  const columns = useEventsColumns(
    activeCalendars[0] || "primary",
    loadEvents,
    visibleColumns,
    state.calendars
  );

  const formatEventDate = (event: GoogleCalendarEvent) => {
    const start = event.start?.dateTime || event.start?.date;
    if (!start) return "Fecha no disponible";

    const date = new Date(start);
    const isAllDay = !!event.start?.date;

    if (isAllDay) {
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("es-ES", {
      weekday: "short",
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

    if (now < start) return { status: "upcoming", color: "blue" };
    if (now > end) return { status: "past", color: "gray" };
    return { status: "ongoing", color: "green" };
  };

  // Filtrar eventos por attendees
  const filteredEvents = React.useMemo(() => {
    if (attendeesFilter.length === 0) {
      return state.events;
    }

    return state.events.filter((event) => {
      if (!event.attendees || event.attendees.length === 0) {
        return false;
      }

      return event.attendees.some(
        (attendee) => attendee.email && attendeesFilter.includes(attendee.email)
      );
    });
  }, [state.events, attendeesFilter]);

  // Funciones para manejar el modal
  const handleRowClick = (event: GoogleCalendarEvent) => {
    setState((prev) => ({
      ...prev,
      selectedEvent: event,
      isModalOpen: true,
    }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      selectedEvent: null,
      isModalOpen: false,
    }));
  };

  const handleEditEvent = (eventId: string, calendarId: string) => {
    handleCloseModal();
    router.push(`/admin/calendar/events/${eventId}?calendarId=${calendarId}`);
  };

  const handleDeleteEventFromModal = (eventId: string, calendarId: string) => {
    handleCloseModal();
    handleDeleteEvent(eventId, calendarId);
  };

  const handleBulkAddParticipants = (selectedEvents: GoogleCalendarEvent[]) => {
    setState(prev => ({
      ...prev,
      selectedEventsForBulk: selectedEvents,
      isBulkModalOpen: true,
    }));
  };

  const handleCloseBulkModal = () => {
    setState(prev => ({
      ...prev,
      selectedEventsForBulk: [],
      isBulkModalOpen: false,
    }));
  };

  const handleConfirmBulkAddParticipants = async (participants: string[], message?: string) => {
    try {
      const promises = state.selectedEventsForBulk.map(async (event) => {
        const eventCalendarId = (event as any).calendarId || activeCalendars[0];
        
        // Obtener el evento actual para conservar los participantes existentes
        const currentAttendees = event.attendees || [];
        
        // Crear lista de nuevos participantes
        const newAttendees = participants.map(email => ({
          email,
          responseStatus: 'needsAction' as const,
        }));
        
        // Combinar participantes existentes con nuevos (evitar duplicados)
        const existingEmails = currentAttendees.map(a => a.email?.toLowerCase()).filter(Boolean);
        const uniqueNewAttendees = newAttendees.filter(
          newAttendee => !existingEmails.includes(newAttendee.email.toLowerCase())
        );
        
        const allAttendees = [...currentAttendees, ...uniqueNewAttendees];
        
        const updateData: any = {
          attendees: allAttendees,
        };
        
        // Agregar mensaje si se proporcionó
        if (message) {
          updateData.description = event.description 
            ? `${event.description}\n\n---\n${message}`
            : message;
        }
        
        const response = await fetch(`/api/calendar/events/${event.id}?calendarId=${eventCalendarId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error en evento "${event.summary}": ${errorData.message || 'Error desconocido'}`);
        }
        
        return response.json();
      });
      
      await Promise.all(promises);
      
      // Recargar eventos para mostrar los cambios
      loadEvents();
      
    } catch (error: any) {
      console.error('Error adding participants to events:', error);
      throw error; // Re-throw para que el modal pueda manejar el error
    }
  };

  const handleBulkGenerateMeetLinks = async (selectedEvents: GoogleCalendarEvent[]) => {
    if (selectedEvents.length === 0) return;

    const confirmed = confirm(
      `¿Estás seguro de que quieres generar enlaces de Google Meet para ${selectedEvents.length} evento${selectedEvents.length !== 1 ? 's' : ''}?`
    );

    if (!confirmed) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const promises = selectedEvents.map(async (event) => {
        const eventCalendarId = (event as any).calendarId || activeCalendars[0];
        
        // Configurar conferenceData para Google Meet
        const updateData = {
          conferenceData: {
            createRequest: {
              requestId: `meet-${event.id}-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              }
            }
          }
        };
        
        const response = await fetch(`/api/calendar/events/${event.id}?calendarId=${eventCalendarId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error en evento "${event.summary}": ${errorData.message || 'Error desconocido'}`);
        }
        
        return response.json();
      });
      
      await Promise.all(promises);
      
      // Recargar eventos para mostrar los cambios
      await loadEvents();
      
      // Mostrar notificación de éxito
      toast({
        title: "Enlaces de Meet generados",
        description: `Se generaron enlaces de Google Meet para ${selectedEvents.length} evento${selectedEvents.length !== 1 ? 's' : ''}`,
        duration: 3000,
      });
      
    } catch (error: any) {
      console.error('Error generating Meet links:', error);
      
      // Mostrar notificación de error
      toast({
        title: "Error",
        description: error.message || "Error al generar enlaces de Google Meet",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (status === "loading") {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Eventos de Calendar
          </h1>
          <p className='text-gray-600'>
            Gestiona y visualiza eventos de Google Calendar
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {/* View Toggle */}
          <div className='flex items-center border rounded-lg p-1'>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size='sm'
              onClick={() => setViewMode("table")}
              className='h-8 px-2'
            >
              <TableCellsIcon className='h-4 w-4 mr-1' />
              Tabla
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size='sm'
              onClick={() => setViewMode("list")}
              className='h-8 px-2'
            >
              <ListBulletIcon className='h-4 w-4 mr-1' />
              Lista
            </Button>
            <Button
              variant={viewMode === "json" ? "default" : "ghost"}
              size='sm'
              onClick={() => setViewMode("json")}
              className='h-8 px-2'
            >
              <CodeBracketIcon className='h-4 w-4 mr-1' />
              JSON
            </Button>
          </div>

          {/* Column Controller - Only show in table mode */}
          {viewMode === "table" && (
            <>
              <ColumnController
                visibleColumns={visibleColumns}
                onColumnVisibilityChange={setColumnVisibility}
              />
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  resetFilters();
                  // Recargar después de resetear para aplicar los cambios
                  setTimeout(() => window.location.reload(), 100);
                }}
                className='text-xs'
                title='Restaurar columnas por defecto incluyendo invitados'
              >
                Restaurar Columnas
              </Button>
            </>
          )}

          <Button
            onClick={() => router.push("/admin/calendar/events/create")}
            className='flex items-center gap-2'
          >
            <PlusIcon className='h-4 w-4' />
            Crear Evento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            {/* Primera fila: Calendarios, Período, Invitados */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Calendar Multi-Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Calendarios
                </label>
                <CalendarMultiSelect calendars={state.calendars} />
              </div>

              {/* Time Range */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Período
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className='w-full border rounded-md px-3 py-2 text-sm'
                >
                  <option value='all'>Todos</option>
                  <option value='upcoming'>Próximos</option>
                  <option value='today'>Hoy</option>
                  <option value='week'>Esta semana</option>
                  <option value='month'>Este mes</option>
                </select>
              </div>

              {/* Attendees Filter */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Filtrar por Invitados
                </label>
                <AttendeesFilter
                  events={state.events}
                  selectedAttendees={attendeesFilter}
                  onSelectionChange={setAttendeesFilter}
                />
              </div>
            </div>

            {/* Segunda fila: Búsqueda */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Buscar eventos
              </label>
              <div className='relative'>
                <MagnifyingGlassIcon className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Buscar por título, descripción...'
                  className='w-full pl-10 pr-4 py-2 border rounded-md text-sm'
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {state.error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6'>
          {state.error}
        </div>
      )}

      {/* Events Display */}
      {state.isLoading ? (
        <div className='flex justify-center py-8'>
          <LoadingSpinner />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className='text-center py-8 text-gray-500'>
            {state.events.length === 0
              ? "No se encontraron eventos con los filtros aplicados"
              : `No se encontraron eventos para los ${attendeesFilter.length} invitados seleccionados`}
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "table" ? (
            <DataTable
              columns={columns}
              data={filteredEvents}
              onRowClick={handleRowClick}
              onBulkAddParticipants={handleBulkAddParticipants}
              onBulkGenerateMeetLinks={handleBulkGenerateMeetLinks}
              calendars={state.calendars}
            />
          ) : viewMode === "json" ? (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CodeBracketIcon className='h-5 w-5' />
                  JSON View - Eventos ({filteredEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='relative'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(filteredEvents, null, 2)
                      );
                    }}
                    className='absolute top-2 right-2 z-10'
                  >
                    Copiar JSON
                  </Button>
                  <pre className='bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono'>
                    {JSON.stringify(filteredEvents, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CalendarIcon className='h-5 w-5' />
                  Eventos ({filteredEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {filteredEvents.map((event) => {
                    const eventStatus = getEventStatus(event);

                    return (
                      <div
                        key={event.id}
                        className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex justify-between items-start'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-2'>
                              <h3 className='font-medium text-gray-900'>
                                {event.summary}
                              </h3>
                              <Badge
                                variant={
                                  eventStatus.color === "blue"
                                    ? "default"
                                    : eventStatus.color === "green"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {eventStatus.status === "upcoming"
                                  ? "Próximo"
                                  : eventStatus.status === "ongoing"
                                  ? "En curso"
                                  : "Pasado"}
                              </Badge>
                            </div>

                            <p className='text-sm text-gray-600 mb-2'>
                              {formatEventDate(event)}
                            </p>

                            {event.description && (
                              <p className='text-sm text-gray-500 mb-2 line-clamp-2'>
                                {event.description}
                              </p>
                            )}

                            {event.location && (
                              <p className='text-sm text-gray-500'>
                                📍 {event.location}
                              </p>
                            )}

                            {event.attendees && event.attendees.length > 0 && (
                              <p className='text-sm text-gray-500'>
                                👥 {event.attendees.length} invitados
                              </p>
                            )}
                          </div>

                          <div className='flex items-center gap-2 ml-4'>
                            {event.htmlLink && (
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  window.open(event.htmlLink, "_blank")
                                }
                              >
                                <EyeIcon className='h-4 w-4' />
                              </Button>
                            )}

                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                router.push(
                                  `/admin/calendar/events/${
                                    event.id
                                  }?calendarId=${
                                    (event as any).calendarId ||
                                    activeCalendars[0]
                                  }`
                                )
                              }
                            >
                              <PencilIcon className='h-4 w-4' />
                            </Button>

                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleDeleteEvent(
                                  event.id!,
                                  (event as any).calendarId ||
                                    activeCalendars[0]
                                )
                              }
                              className='text-red-600 hover:text-red-700'
                            >
                              <TrashIcon className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal
        event={state.selectedEvent}
        isOpen={state.isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEventFromModal}
        calendars={state.calendars}
      />

      {/* Bulk Add Participants Modal */}
      <BulkAddParticipantsModal
        isOpen={state.isBulkModalOpen}
        onClose={handleCloseBulkModal}
        selectedEvents={state.selectedEventsForBulk}
        onConfirm={handleConfirmBulkAddParticipants}
      />
    </div>
  );
};

export default CalendarEventsPage;
