"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { EventDetailContent } from "../components/EventDetailContent";
import { toast } from "@/src/components/ui/use-toast";
import { Spinner } from "@/src/components/ui/spinner";

interface EventDetailPageState {
  event: GoogleCalendarEvent | null;
  calendars: Array<{
    id: string;
    summary: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
  isLoading: boolean;
  error: string | null;
}

const EventDetailPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const eventId = params?.id as string;
  const calendarId = searchParams?.get("calendarId") || "primary";

  const [state, setState] = useState<EventDetailPageState>({
    event: null,
    calendars: [],
    isLoading: true,
    error: null,
  });

  // Verificar autenticación
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

  const loadEventAndCalendars = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Cargar evento y calendarios en paralelo
      const [eventResponse, calendarsResponse] = await Promise.all([
        fetch(`/api/calendar/events/${eventId}?calendarId=${calendarId}`),
        fetch("/api/calendar/calendars"),
      ]);

      if (!eventResponse.ok) {
        throw new Error("Error al cargar el evento");
      }

      if (!calendarsResponse.ok) {
        throw new Error("Error al cargar los calendarios");
      }

      const eventData = await eventResponse.json();
      const calendarsData = await calendarsResponse.json();

      setState((prev) => ({
        ...prev,
        event: eventData.event || eventData,
        calendars: calendarsData.calendars || [],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Error loading event:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Error al cargar el evento",
        isLoading: false,
      }));
    }
  }, [eventId, calendarId]);

  // Cargar datos
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadEventAndCalendars();
    }
  }, [status, session, loadEventAndCalendars]);

  const handleSaveEvent = async (
    updatedEvent: Partial<GoogleCalendarEvent>
  ) => {
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

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        event: result.event,
      }));

      toast({
        title: "Evento actualizado",
        description: "Los cambios se guardaron correctamente",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: error.message || "Error al guardar los cambios",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  const handleDeleteEvent = async () => {
    const confirmed = confirm(
      "¿Estás seguro de que quieres eliminar este evento?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/update?calendarId=${calendarId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el evento");
      }

      toast({
        title: "Evento eliminado",
        description: "El evento se eliminó correctamente",
        duration: 3000,
      });

      // Redirigir a la lista de eventos
      router.push("/admin/calendar/events");
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el evento",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleClose = () => {
    router.push("/admin/calendar/events");
  };

  // Estados de carga y error
  if (status === "loading" || state.isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null;
  }

  if (state.error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {state.error}
        </div>
        <button
          onClick={() => router.push("/admin/calendar/events")}
          className='mt-4 text-blue-600 hover:underline'
        >
          ← Volver a la lista de eventos
        </button>
      </div>
    );
  }

  if (!state.event) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center text-gray-500'>Evento no encontrado</div>
        <button
          onClick={() => router.push("/admin/calendar/events")}
          className='mt-4 text-blue-600 hover:underline'
        >
          ← Volver a la lista de eventos
        </button>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <EventDetailContent
        event={state.event}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        calendars={state.calendars}
      />
    </div>
  );
};

export default EventDetailPage;
