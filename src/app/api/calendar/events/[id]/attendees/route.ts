import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

// Agregar o actualizar invitados
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get("calendarId") || "primary";
    const eventId = params.id;

    const { attendees, action = "add" } = await request.json();

    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener el evento actual
    const currentEvent = await calendarService.getEvent(calendarId, eventId);

    if (!currentEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    let updatedAttendees = [...(currentEvent.attendees || [])];

    if (action === "add") {
      // Agregar nuevos invitados (evitar duplicados)
      const existingEmails = updatedAttendees
        .map((a) => a.email?.toLowerCase())
        .filter(Boolean);
      const newAttendees = attendees
        .filter(
          (attendee: any) =>
            !existingEmails.includes(attendee.email.toLowerCase())
        )
        .map((attendee: any) => ({
          email: attendee.email,
          displayName: attendee.displayName || attendee.email.split("@")[0],
          responseStatus: "needsAction",
        }));

      updatedAttendees.push(...newAttendees);
    } else if (action === "remove") {
      // Eliminar invitados
      const emailsToRemove = attendees.map((a: any) => a.email.toLowerCase());
      updatedAttendees = updatedAttendees.filter(
        (attendee) =>
          !emailsToRemove.includes(attendee.email?.toLowerCase() || "")
      );
    } else if (action === "update") {
      // Actualizar invitados existentes
      updatedAttendees = updatedAttendees.map((attendee) => {
        const update = attendees.find(
          (a: any) => a.email.toLowerCase() === attendee.email?.toLowerCase()
        );
        return update ? { ...attendee, ...update } : attendee;
      });
    }

    // Usar la API directa para actualizar
    const calendar = (calendarService as any).calendar;

    const eventUpdate = {
      ...currentEvent,
      attendees: updatedAttendees,
    };

    try {
      const updatedEvent = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: eventUpdate,
        sendUpdates: "all", // Enviar notificaciones a los invitados
      });

      return NextResponse.json({
        success: true,
        event: updatedEvent.data,
        attendees: updatedEvent.data.attendees,
      });
    } catch (googleError: any) {
      console.error("Google Calendar API error:", googleError);

      // Manejar errores específicos de Google Calendar API
      if (googleError.code === 403) {
        return NextResponse.json(
          {
            error:
              "No tienes permisos para modificar eventos en este calendario",
            details:
              "El calendario puede ser de solo lectura o no tienes permisos de escritura",
          },
          { status: 403 }
        );
      }

      if (googleError.code === 404) {
        return NextResponse.json(
          { error: "Evento no encontrado en el calendario especificado" },
          { status: 404 }
        );
      }

      // Re-lanzar el error para que sea manejado por el catch exterior
      throw googleError;
    }
  } catch (error: any) {
    console.error("Error updating attendees:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Obtener sugerencias de invitados
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    // Aquí podrías implementar lógica para sugerir contactos
    // Por ahora, devolvemos un array vacío
    const suggestions: Array<{ email: string; name?: string }> = [];

    // En una implementación real, podrías:
    // 1. Buscar en Google Contacts API
    // 2. Buscar en tu base de datos de usuarios
    // 3. Buscar en eventos anteriores del usuario

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
    console.error("Error getting attendee suggestions:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
