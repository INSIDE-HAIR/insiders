import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

// Crear/Actualizar enlace de Google Meet
export async function POST(
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

    // Obtener el evento actual
    const currentEvent = await calendarService.getEvent(calendarId, eventId);
    
    if (!currentEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Usar la API directa para agregar Google Meet
    const calendar = (calendarService as any).calendar;
    
    const eventUpdate = {
      ...currentEvent,
      conferenceData: {
        createRequest: {
          requestId: `meet-${eventId}-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const updatedEvent = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventUpdate,
      conferenceDataVersion: 1, // Necesario para actualizar conferenceData
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent.data,
      meetLink: updatedEvent.data.hangoutLink
    });

  } catch (error: any) {
    console.error("Error adding Google Meet:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Eliminar enlace de Google Meet
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

    // Obtener el evento actual
    const currentEvent = await calendarService.getEvent(calendarId, eventId);
    
    if (!currentEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Usar la API directa para eliminar Google Meet
    const calendar = (calendarService as any).calendar;
    
    const eventUpdate: any = {
      ...currentEvent,
      conferenceData: null,
      hangoutLink: null
    };

    // Eliminar campos de conferencia
    delete eventUpdate.conferenceData;
    delete eventUpdate.hangoutLink;

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
    console.error("Error removing Google Meet:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}