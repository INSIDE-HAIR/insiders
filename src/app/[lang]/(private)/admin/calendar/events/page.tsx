/**
 * Calendar Events List
 *
 * Página para listar y gestionar eventos de calendario
 * Incluye filtros, búsqueda y acciones CRUD
 */

"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDebounce } from "@/src/hooks/use-debounce";
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
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { DataTable } from "./components/DataTable";
import { useEventsColumns } from "./columns";
import { CalendarMultiSelect } from "./components/CalendarMultiSelect";
import { ColumnController } from "./components/ColumnController";
import { AttendeesFilter } from "./components/AttendeesFilter";
import { EventDetailModal } from "./components/EventDetailModal";
import { BulkAddParticipantsModal } from "./components/BulkAddParticipantsModal";
import { BulkGenerateDescriptionsModal } from "./components/BulkGenerateDescriptionsModal";
import { BulkMoveCalendarModal } from "./components/BulkMoveCalendarModal";
import { BulkDateTimeModal } from "./components/BulkDateTimeModal";
import { ParticipantKPIGrid } from "./components/ParticipantKPIGrid";
import { DateTimeRangePicker } from "@/src/components/ui/date-picker";
import { useCalendarFiltersStore } from "@/src/stores/calendarFiltersStore";
import { toast } from "@/src/components/ui/use-toast";
import { Spinner } from "@/src/components/ui/spinner";
import { MapPin, Users } from "lucide-react";
import TailwindGrid from "@/src/components/shared/grid/TailwindGrid";

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
  selectedEventsForDescriptions: GoogleCalendarEvent[];
  isBulkDescriptionsModalOpen: boolean;
  selectedEventsForMove: GoogleCalendarEvent[];
  isBulkMoveModalOpen: boolean;
  selectedEventsForDateTime: GoogleCalendarEvent[];
  isBulkDateTimeModalOpen: boolean;
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
    selectedEventsForDescriptions: [],
    isBulkDescriptionsModalOpen: false,
    selectedEventsForMove: [],
    isBulkMoveModalOpen: false,
    selectedEventsForDateTime: [],
    isBulkDateTimeModalOpen: false,
  });

  const {
    activeCalendars,
    timeRange,
    search,
    viewMode,
    visibleColumns,
    attendeesFilter,
    customStartDate,
    customEndDate,
    setTimeRange,
    setCustomDateRange,
    setSearch,
    setViewMode,
    setColumnVisibility,
    setAttendeesFilter,
    initializeCalendars,
    resetFilters,
  } = useCalendarFiltersStore();

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

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

  const loadInitialData = useCallback(async () => {
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
  }, [initializeCalendars]);

  const loadEvents = useCallback(async () => {
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
              // Current week: Monday to Sunday
              const startOfWeek = new Date(now);
              const dayOfWeek = startOfWeek.getDay();
              const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
              startOfWeek.setDate(startOfWeek.getDate() + diff);
              startOfWeek.setHours(0, 0, 0, 0);
              
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(endOfWeek.getDate() + 6);
              endOfWeek.setHours(23, 59, 59, 999);
              
              timeMin = startOfWeek.toISOString();
              timeMax = endOfWeek.toISOString();
              break;
            case "month":
              // Current month: 1st to last day of month
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              startOfMonth.setHours(0, 0, 0, 0);
              
              const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              endOfMonth.setHours(23, 59, 59, 999);
              
              timeMin = startOfMonth.toISOString();
              timeMax = endOfMonth.toISOString();
              break;
            case "all":
              // Sin límite temporal, comenzar desde hace 1 mes
              const monthAgo = new Date(now);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              timeMin = monthAgo.toISOString();
              break;
            case "custom":
              if (customStartDate && customStartDate instanceof Date && !isNaN(customStartDate.getTime())) {
                timeMin = customStartDate.toISOString();
              }
              if (customEndDate && customEndDate instanceof Date && !isNaN(customEndDate.getTime())) {
                timeMax = customEndDate.toISOString();
              }
              break;
          }

          if (timeMin) params.append("timeMin", timeMin);
          if (timeMax) params.append("timeMax", timeMax);
          if (debouncedSearch) params.append("q", debouncedSearch);

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
  }, [activeCalendars, timeRange, debouncedSearch, customStartDate, customEndDate]);

  // Cargar datos iniciales - solo una vez cuando se autentica
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadInitialData();
    }
  }, [status, session?.user?.role, loadInitialData]);

  // Recargar eventos cuando cambien los filtros - usando las dependencias directas
  useEffect(() => {
    // Solo cargar eventos si hay calendarios seleccionados y calendarios disponibles
    if (state.calendars.length > 0 && activeCalendars.length > 0) {
      loadEvents();
    }
  }, [activeCalendars, timeRange, debouncedSearch, state.calendars.length, customStartDate, customEndDate, loadEvents]);

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

  const handleDeleteEventFromModal = async () => {
    if (!state.selectedEvent) return;

    const eventId = state.selectedEvent.id!;
    const calendarId =
      (state.selectedEvent as any).calendarId || activeCalendars[0];

    handleCloseModal();
    await handleDeleteEvent(eventId, calendarId);
  };

  const handleSaveEvent = async (
    updatedEvent: Partial<GoogleCalendarEvent>
  ) => {
    if (!state.selectedEvent) return;

    const eventId = state.selectedEvent.id!;
    const calendarId =
      (state.selectedEvent as any).calendarId || activeCalendars[0];

    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/update?calendarId=${calendarId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEvent),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el evento");
      }

      const result = await response.json();

      // Actualizar el evento en la lista local
      setState((prev) => ({
        ...prev,
        events: prev.events.map((event) =>
          event.id === eventId ? { ...event, ...result.event } : event
        ),
        selectedEvent: { ...state.selectedEvent, ...result.event },
      }));

      // Handle different success scenarios
      let title = "Evento actualizado";
      let description = "Los cambios se guardaron correctamente";

      if (result.moved) {
        title = "Evento movido";
        description = "El evento se movió correctamente al nuevo calendario";
      } else if (result.isRecurringEventIssue && result.fallbackUsed) {
        title = "Evento copiado";
        description =
          "Este evento recurrente se copió al nuevo calendario (no se puede mover directamente)";
      }

      toast({
        title,
        description,
        duration: result.isRecurringEventIssue ? 5000 : 3000,
      });
    } catch (error: any) {
      console.error("Error saving event:", error);

      // Check if this is a response parsing error where the request actually succeeded
      if (error.message?.includes("isRecurringEventIssue")) {
        // This is likely a fallback success case that got caught as an error
        toast({
          title: "Evento procesado",
          description:
            "El evento se procesó correctamente usando un método alternativo",
          duration: 5000,
        });
        return; // Don't re-throw for fallback success
      }

      toast({
        title: "Error",
        description: error.message || "Error al guardar los cambios",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  const handleBulkAddParticipants = (selectedEvents: GoogleCalendarEvent[]) => {
    setState((prev) => ({
      ...prev,
      selectedEventsForBulk: selectedEvents,
      isBulkModalOpen: true,
    }));
  };

  const handleCloseBulkModal = () => {
    setState((prev) => ({
      ...prev,
      selectedEventsForBulk: [],
      isBulkModalOpen: false,
    }));
  };

  const handleConfirmBulkAddParticipants = async (
    participants: string[],
    message?: string
  ) => {
    try {
      const promises = state.selectedEventsForBulk.map(async (event) => {
        const eventCalendarId = (event as any).calendarId || activeCalendars[0];

        // Obtener el evento actual para conservar los participantes existentes
        const currentAttendees = event.attendees || [];

        // Crear lista de nuevos participantes
        const newAttendees = participants.map((email) => ({
          email,
          responseStatus: "needsAction" as const,
        }));

        // Combinar participantes existentes con nuevos (evitar duplicados)
        const existingEmails = currentAttendees
          .map((a) => a.email?.toLowerCase())
          .filter(Boolean);
        const uniqueNewAttendees = newAttendees.filter(
          (newAttendee) =>
            !existingEmails.includes(newAttendee.email.toLowerCase())
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

        const response = await fetch(
          `/api/calendar/events/${event.id}?calendarId=${eventCalendarId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error en evento "${event.summary}": ${
              errorData.message || "Error desconocido"
            }`
          );
        }

        return response.json();
      });

      await Promise.all(promises);

      // Recargar eventos para mostrar los cambios
      loadEvents();
    } catch (error: any) {
      console.error("Error adding participants to events:", error);
      throw error; // Re-throw para que el modal pueda manejar el error
    }
  };

  const handleBulkGenerateDescriptions = (
    selectedEvents: GoogleCalendarEvent[]
  ) => {
    setState((prev) => ({
      ...prev,
      selectedEventsForDescriptions: selectedEvents,
      isBulkDescriptionsModalOpen: true,
    }));
  };

  const handleCloseBulkDescriptionsModal = () => {
    setState((prev) => ({
      ...prev,
      selectedEventsForDescriptions: [],
      isBulkDescriptionsModalOpen: false,
    }));
  };

  const handleConfirmBulkGenerateDescriptions = async (
    eventIds: Array<{ eventId: string; calendarId: string }>,
    options: {
      template: string;
      customTemplate?: string;
      includeAttendees: boolean;
      includeLocation: boolean;
      includeDateTime: boolean;
    }
  ) => {
    try {
      const response = await fetch(
        "/api/calendar/events/bulk-generate-descriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventIds,
            ...options,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar descripciones");
      }

      const result = await response.json();

      // Recargar eventos para mostrar los cambios
      await loadEvents();

      // Verificar si al menos algunos eventos se procesaron correctamente
      if (result.successful > 0) {
        // Mostrar notificación de éxito
        toast({
          title: "Descripciones generadas",
          description: `Se generaron descripciones para ${result.successful} de ${result.processed} eventos`,
          duration: 3000,
        });
      }

      // Si hubo errores, mostrar detalles
      if (result.failed > 0 && result.errors && result.errors.length > 0) {
        // Solo log en desarrollo para debugging, no como error crítico
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Algunos eventos tuvieron errores durante la generación:",
            result.errors
          );
        }

        // Crear un mensaje de error más detallado
        const errorMessages = result.errors
          .slice(0, 3)
          .map((err: any) => {
            const eventTitle = err.title || err.eventId || "Evento desconocido";
            const errorMsg = err.error || "Error desconocido";
            return `• ${eventTitle}: ${errorMsg}`;
          })
          .join("\n");

        const errorSummary = `${result.failed} de ${result.processed} eventos no pudieron procesarse`;
        const fullMessage = `${errorSummary}\n\n${errorMessages}${
          result.errors.length > 3 ? "\n\n...y más errores" : ""
        }`;

        // Solo mostrar toast de error si no se procesó ningún evento correctamente
        if (result.successful === 0) {
          toast({
            title: "Error al generar descripciones",
            description: fullMessage,
            variant: "destructive",
            duration: 10000,
          });
        } else {
          // Si algunos eventos se procesaron correctamente, mostrar como advertencia
          toast({
            title: "Algunos eventos tuvieron errores",
            description: fullMessage,
            variant: "destructive",
            duration: 10000,
          });
        }
      }
    } catch (error: any) {
      // Log detallado para debugging
      console.error("Error crítico en generación de descripciones:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        error: error,
      });

      // Crear un mensaje de error más informativo
      let errorMessage = "Error al generar descripciones";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error.error) {
        errorMessage = error.error;
      }

      // Lanzar un error más estructurado
      const structuredError = new Error(errorMessage);
      structuredError.name = "BulkDescriptionError";
      throw structuredError;
    }
  };

  const handleBulkGenerateMeetLinks = async (
    selectedEvents: GoogleCalendarEvent[]
  ) => {
    if (selectedEvents.length === 0) return;

    const confirmed = confirm(
      `¿Estás seguro de que quieres generar enlaces de Google Meet para ${
        selectedEvents.length
      } evento${selectedEvents.length !== 1 ? "s" : ""}?`
    );

    if (!confirmed) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const promises = selectedEvents.map(async (event) => {
        const eventCalendarId = (event as any).calendarId || activeCalendars[0];

        // Configurar conferenceData para Google Meet
        const updateData = {
          conferenceData: {
            createRequest: {
              requestId: `meet-${event.id}-${Date.now()}`,
              conferenceSolutionKey: {
                type: "hangoutsMeet",
              },
            },
          },
        };

        const response = await fetch(
          `/api/calendar/events/${event.id}?calendarId=${eventCalendarId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error en evento "${event.summary}": ${
              errorData.message || "Error desconocido"
            }`
          );
        }

        return response.json();
      });

      await Promise.all(promises);

      // Recargar eventos para mostrar los cambios
      await loadEvents();

      // Mostrar notificación de éxito
      toast({
        title: "Enlaces de Meet generados",
        description: `Se generaron enlaces de Google Meet para ${
          selectedEvents.length
        } evento${selectedEvents.length !== 1 ? "s" : ""}`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error generating Meet links:", error);

      // Mostrar notificación de error
      toast({
        title: "Error",
        description: error.message || "Error al generar enlaces de Google Meet",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleBulkMoveCalendar = (selectedEvents: GoogleCalendarEvent[]) => {
    setState((prev) => ({
      ...prev,
      selectedEventsForMove: selectedEvents,
      isBulkMoveModalOpen: true,
    }));
  };

  const handleCloseBulkMoveModal = () => {
    setState((prev) => ({
      ...prev,
      selectedEventsForMove: [],
      isBulkMoveModalOpen: false,
    }));
  };

  const handleConfirmBulkMoveCalendar = async (targetCalendarId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Prepare events for bulk move
      const eventsToMove = state.selectedEventsForMove.map((event) => ({
        eventId: event.id,
        sourceCalendarId: (event as any).calendarId || "primary",
      }));

      const response = await fetch("/api/calendar/events/bulk-move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: eventsToMove,
          targetCalendarId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      toast({
        title: "Eventos movidos",
        description: `Se movieron ${result.successful} evento(s) exitosamente${
          result.failed > 0 ? `. Falló: ${result.failed}` : ""
        }`,
        variant: result.failed > 0 ? "destructive" : "default",
        duration: 5000,
      });

      // Reload events if successful
      if (result.successful > 0) {
        loadEvents();
      }

      handleCloseBulkMoveModal();
    } catch (error: any) {
      console.error("Error moving events:", error);
      toast({
        title: "Error",
        description: error.message || "Error al mover los eventos",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleBulkUpdateDateTime = (selectedEvents: GoogleCalendarEvent[]) => {
    setState((prev) => ({
      ...prev,
      selectedEventsForDateTime: selectedEvents,
      isBulkDateTimeModalOpen: true,
    }));
  };

  const handleCloseBulkDateTimeModal = () => {
    setState((prev) => ({
      ...prev,
      selectedEventsForDateTime: [],
      isBulkDateTimeModalOpen: false,
    }));
  };

  const handleConfirmBulkUpdateDateTime = async (
    updates: Array<{
      eventId: string;
      calendarId: string;
      updateData: any;
    }>
  ) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch("/api/calendar/events/bulk-datetime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updates,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      toast({
        title: "Fechas actualizadas",
        description: `Se actualizaron ${result.successful} evento(s) exitosamente${
          result.failed > 0 ? `. Falló: ${result.failed}` : ""
        }`,
        variant: result.failed > 0 ? "destructive" : "default",
        duration: 5000,
      });

      // Reload events if successful
      if (result.successful > 0) {
        loadEvents();
      }

      handleCloseBulkDateTimeModal();
    } catch (error: any) {
      console.error("Error updating event dates:", error);
      toast({
        title: "Error",
        description:
          error.message || "Error al actualizar las fechas de los eventos",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  if (status === "loading") {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <TailwindGrid fullSize padding='' className='z-0'>
      <div className='z-0 col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-1 lg:col-end-13  order-2 md:order-1 col-span-full'>
        <div className='flex-1 p-6'>
          {/* Header */}
          <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6 md:mb-8'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-foreground mb-2'>
                Eventos de Calendar
              </h1>
              <p className='text-muted-foreground'>
                Gestiona y visualiza eventos de Google Calendar
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-2 md:gap-3'>
              {/* View Toggle */}
              <div className='flex items-center border border-border rounded-lg p-1 bg-background'>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size='sm'
                  onClick={() => setViewMode("table")}
                  className='h-8 px-2 text-xs md:text-sm'
                >
                  <TableCellsIcon className='h-4 w-4 mr-1' />
                  Tabla
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size='sm'
                  onClick={() => setViewMode("list")}
                  className='h-8 px-2 text-xs md:text-sm'
                >
                  <ListBulletIcon className='h-4 w-4 mr-1' />
                  Lista
                </Button>
                <Button
                  variant={viewMode === "json" ? "default" : "ghost"}
                  size='sm'
                  onClick={() => setViewMode("json")}
                  className='h-8 px-2 text-xs md:text-sm'
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
            <CardContent className='p-4 md:p-6'>
              <div className='space-y-4'>
                {/* Primera fila: Calendarios, Período, Invitados */}
                <div className="space-y-4">
                  {/* Row 1: Calendar Multi-Selection and Attendees Filter */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {/* Calendar Multi-Selection */}
                    <div>
                      <label className='block text-sm font-medium text-foreground mb-2'>
                        Calendarios
                      </label>
                      <CalendarMultiSelect calendars={state.calendars} />
                    </div>

                    {/* Attendees Filter */}
                    <div>
                      <label className='block text-sm font-medium text-foreground mb-2'>
                        Filtrar por Invitados
                      </label>
                      <AttendeesFilter
                        events={state.events}
                        selectedAttendees={attendeesFilter}
                        onSelectionChange={setAttendeesFilter}
                      />
                    </div>
                  </div>

                  {/* Row 2: Time Range Presets */}
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2'>
                      Período
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={timeRange === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('all')}
                        className="text-xs"
                      >
                        Todos
                      </Button>
                      <Button
                        variant={timeRange === 'today' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('today')}
                        className="text-xs"
                      >
                        Hoy
                      </Button>
                      <Button
                        variant={timeRange === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('week')}
                        className="text-xs"
                      >
                        Esta semana
                      </Button>
                      <Button
                        variant={timeRange === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('month')}
                        className="text-xs"
                      >
                        Este mes
                      </Button>
                      <Button
                        variant={timeRange === 'upcoming' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('upcoming')}
                        className="text-xs"
                      >
                        Próximos
                      </Button>
                      <Button
                        variant={timeRange === 'custom' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('custom')}
                        className="text-xs"
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Personalizado
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Custom Date Range Picker - Only show when timeRange is 'custom' */}
                {timeRange === 'custom' && (
                  <div className="mt-4">
                    <DateTimeRangePicker
                      startValue={customStartDate}
                      endValue={customEndDate}
                      onStartChange={(date) => {
                        setCustomDateRange(date, customEndDate);
                      }}
                      onEndChange={(date) => {
                        setCustomDateRange(customStartDate, date);
                      }}
                      hourCycle={24}
                      granularity="minute"
                      startPlaceholder="Fecha y hora de inicio"
                      endPlaceholder="Fecha y hora de fin"
                      className="max-w-md"
                    />
                  </div>
                )}

                {/* Row 3: Search */}
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>
                    Buscar eventos
                  </label>
                  <div className='relative'>
                    <MagnifyingGlassIcon className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                    <input
                      type='text'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder='Buscar por título, descripción...'
                      className='w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participant KPI Cards - Only show when attendees are filtered */}
          {attendeesFilter.length > 0 && (
            <ParticipantKPIGrid
              selectedAttendees={attendeesFilter}
              events={state.events}
              onRemoveAttendee={(email) => {
                const newFilter = attendeesFilter.filter((a) => a !== email);
                setAttendeesFilter(newFilter);
              }}
              calendarIds={activeCalendars}
              dateRange={(() => {
                const now = new Date();
                let start: string | undefined;
                let end: string | undefined;

                switch (timeRange) {
                  case "upcoming":
                    start = now.toISOString();
                    break;
                  case "today":
                    const startOfDay = new Date(now);
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(now);
                    endOfDay.setHours(23, 59, 59, 999);
                    start = startOfDay.toISOString();
                    end = endOfDay.toISOString();
                    break;
                  case "week":
                    // Current week: Monday to Sunday
                    const startOfWeek = new Date(now);
                    const dayOfWeek = startOfWeek.getDay();
                    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
                    startOfWeek.setDate(startOfWeek.getDate() + diff);
                    startOfWeek.setHours(0, 0, 0, 0);
                    
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(endOfWeek.getDate() + 6);
                    endOfWeek.setHours(23, 59, 59, 999);
                    
                    start = startOfWeek.toISOString();
                    end = endOfWeek.toISOString();
                    break;
                  case "month":
                    // Current month: 1st to last day of month
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startOfMonth.setHours(0, 0, 0, 0);
                    
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    endOfMonth.setHours(23, 59, 59, 999);
                    
                    start = startOfMonth.toISOString();
                    end = endOfMonth.toISOString();
                    break;
                  case "all":
                    // Sin límite temporal, comenzar desde hace 1 mes
                    const monthAgo = new Date(now);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    start = monthAgo.toISOString();
                    break;
                  case "custom":
                    if (customStartDate && customStartDate instanceof Date && !isNaN(customStartDate.getTime())) {
                      start = customStartDate.toISOString();
                    }
                    if (customEndDate && customEndDate instanceof Date && !isNaN(customEndDate.getTime())) {
                      end = customEndDate.toISOString();
                    }
                    break;
                }

                return { start, end };
              })()}
            />
          )}

          {/* Error Alert */}
          {state.error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6'>
              {state.error}
            </div>
          )}

          {/* Events Display */}
          {state.isLoading ? (
            <div className='flex justify-center py-8'>
              <Spinner size='lg' />
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className='border-border bg-card'>
              <CardContent className='text-center py-8 text-muted-foreground'>
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
                  onBulkGenerateDescriptions={handleBulkGenerateDescriptions}
                  onBulkMoveCalendar={handleBulkMoveCalendar}
                  onBulkUpdateDateTime={handleBulkUpdateDateTime}
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
                      <pre className='bg-card text-card-foreground p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono border border-border'>
                        {JSON.stringify(filteredEvents, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className='border-border bg-card'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-foreground'>
                      <CalendarIcon className='h-5 w-5' />
                      Eventos ({filteredEvents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-4 md:p-6'>
                    <div className='space-y-4'>
                      {filteredEvents.map((event) => {
                        const eventStatus = getEventStatus(event);

                        return (
                          <div
                            key={`${event.id}-${(event as any).calendarId || "default"}`}
                            className='border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors bg-card'
                          >
                            <div className='flex justify-between items-start'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-2'>
                                  <h3 className='font-semibold text-foreground'>
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

                                <p className='text-sm text-muted-foreground mb-2'>
                                  {formatEventDate(event)}
                                </p>

                                {event.description && (
                                  <div
                                    className='text-sm text-muted-foreground mb-2 line-clamp-2 [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80 [&_a]:font-medium'
                                    dangerouslySetInnerHTML={{
                                      __html: event.description,
                                    }}
                                  />
                                )}

                                {event.location && (
                                  <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                                    <MapPin className='h-3.5 w-3.5' />
                                    <span>{event.location}</span>
                                  </div>
                                )}

                                {event.attendees &&
                                  event.attendees.length > 0 && (
                                    <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                                      <Users className='h-3.5 w-3.5' />
                                      <span>
                                        {event.attendees.length} invitados
                                      </span>
                                    </div>
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
                                  className='text-destructive hover:text-destructive hover:bg-destructive/10'
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
            onSave={handleSaveEvent}
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

          {/* Bulk Generate Descriptions Modal */}
          <BulkGenerateDescriptionsModal
            isOpen={state.isBulkDescriptionsModalOpen}
            onClose={handleCloseBulkDescriptionsModal}
            selectedEvents={state.selectedEventsForDescriptions}
            onConfirm={handleConfirmBulkGenerateDescriptions}
          />
          {/* Bulk Move Calendar Modal */}
          <BulkMoveCalendarModal
            isOpen={state.isBulkMoveModalOpen}
            onClose={handleCloseBulkMoveModal}
            selectedEvents={state.selectedEventsForMove}
            calendars={state.calendars}
            onMove={handleConfirmBulkMoveCalendar}
          />
          {/* Bulk Date/Time Update Modal */}
          <BulkDateTimeModal
            isOpen={state.isBulkDateTimeModalOpen}
            onClose={handleCloseBulkDateTimeModal}
            selectedEvents={state.selectedEventsForDateTime}
            onUpdate={handleConfirmBulkUpdateDateTime}
          />
        </div>
      </div>
    </TailwindGrid>
  );
};

export default CalendarEventsPage;
