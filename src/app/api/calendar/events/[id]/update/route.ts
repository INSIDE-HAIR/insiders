import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary';
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

    const updatedEvent = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventUpdate,
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent.data
    });

  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary';
    const eventId = params.id;

    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    await calendarService.deleteEvent(calendarId, eventId);

    return NextResponse.json({
      success: true,
      message: "Evento eliminado correctamente"
    });

  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}