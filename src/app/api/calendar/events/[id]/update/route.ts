import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

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

    const updateData = await request.json();

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

    // Verificar permisos del calendario antes de intentar actualizar
    try {
      const calendarInfo = await calendarService.getCalendar(calendarId);

      // Verificar si el usuario tiene permisos de escritura
      if (calendarInfo.accessRole === "reader") {
        return NextResponse.json(
          {
            error: "No tienes permisos de escritura en este calendario",
            details: `El calendario '${calendarId}' es de solo lectura para tu cuenta. Solo puedes ver eventos, no modificarlos.`,
          },
          { status: 403 }
        );
      }
    } catch (calendarError: any) {
      console.warn(
        "No se pudo verificar permisos del calendario:",
        calendarError
      );
      // Continuar con la actualización si no se puede verificar
    }

    // Actualizar usando la API directa para mayor control
    const calendar = (calendarService as any).calendar;

    // Preparar datos de actualización
    const eventUpdate = {
      ...currentEvent,
      ...updateData,
      // Asegurar que ciertos campos críticos se mantengan
      id: eventId,
      start: updateData.start || currentEvent.start,
      end: updateData.end || currentEvent.end,
    };

    try {
      const updatedEvent = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: eventUpdate,
      });

      return NextResponse.json({
        success: true,
        event: updatedEvent.data,
      });
    } catch (googleError: any) {
      console.error("Google Calendar API error:", googleError);

      // Manejar errores específicos de Google Calendar API
      if (googleError.code === 403) {
        return NextResponse.json(
          {
            error:
              "No tienes permisos para modificar eventos en este calendario. Verifica que tengas permisos de escritura en el calendario.",
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
    console.error("Error updating event:", error);

    return NextResponse.json(
      {
        error: error.message || "Error interno del servidor",
        details: error.code ? `Código de error: ${error.code}` : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    await calendarService.deleteEvent(calendarId, eventId);

    return NextResponse.json({
      success: true,
      message: "Evento eliminado correctamente",
    });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
