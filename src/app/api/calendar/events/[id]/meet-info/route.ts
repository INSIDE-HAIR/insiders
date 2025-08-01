import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { getMeetInfo, extractMeetId } from "@/src/features/calendar/utils/meetUtils";
import { Logger } from "@/src/features/calendar/utils/logger";

const logger = new Logger("API:MeetInfo");

/**
 * GET /api/calendar/events/[id]/meet-info
 * Obtiene información detallada de Google Meet de un evento
 */
export async function GET(
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

    logger.info(`Fetching Meet info for event: ${eventId}`);

    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener el evento
    const event = await calendarService.getEvent(calendarId, eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Extraer información de Meet
    const meetInfo = getMeetInfo(event);
    
    if (!meetInfo) {
      return NextResponse.json(
        { 
          error: "Este evento no tiene Google Meet habilitado",
          hasGoogleMeet: false 
        },
        { status: 404 }
      );
    }

    // Información adicional de la API
    const response = {
      hasGoogleMeet: true,
      meetId: meetInfo.meetId,
      meetUrl: meetInfo.meetUrl,
      conferenceType: meetInfo.conferenceType,
      entryPoints: meetInfo.entryPoints,
      // Información adicional del evento
      eventSummary: event.summary,
      eventStart: event.start,
      eventEnd: event.end,
      // Datos raw de conferencia para debugging
      conferenceDataRaw: event.conferenceData
    };

    logger.info(`Meet info retrieved successfully`, { meetId: meetInfo.meetId });

    return NextResponse.json(response);

  } catch (error: any) {
    logger.error("Error fetching Meet info:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/calendar/events/[id]/meet-info
 * Actualiza o manipula la información de Google Meet
 * 
 * Este endpoint permite:
 * - Regenerar el link de Meet (creando una nueva conferencia)
 * - Actualizar la configuración de la conferencia
 */
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
    
    const body = await request.json();
    const { action } = body;

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

    const calendar = (calendarService as any).calendar;

    switch (action) {
      case 'regenerate':
        // Regenerar el link de Meet (crear nueva conferencia)
        logger.info(`Regenerating Meet link for event: ${eventId}`);
        
        const regeneratedEvent = await calendar.events.update({
          calendarId,
          eventId,
          requestBody: {
            ...currentEvent,
            conferenceData: {
              createRequest: {
                requestId: `meet-regen-${eventId}-${Date.now()}`,
                conferenceSolutionKey: {
                  type: 'hangoutsMeet'
                }
              }
            }
          },
          conferenceDataVersion: 1
        });

        const newMeetInfo = getMeetInfo(regeneratedEvent.data);
        
        return NextResponse.json({
          success: true,
          action: 'regenerated',
          oldMeetId: extractMeetId(currentEvent),
          newMeetId: newMeetInfo?.meetId,
          meetUrl: newMeetInfo?.meetUrl,
          event: regeneratedEvent.data
        });

      case 'copyToDescription':
        // Copiar el link de Meet a la descripción del evento
        const meetInfo = getMeetInfo(currentEvent);
        
        if (!meetInfo) {
          return NextResponse.json(
            { error: "Este evento no tiene Google Meet" },
            { status: 400 }
          );
        }

        const updatedDescription = `${currentEvent.description || ''}\n\nGoogle Meet: ${meetInfo.meetUrl}`;
        
        const updatedEvent = await calendar.events.update({
          calendarId,
          eventId,
          requestBody: {
            ...currentEvent,
            description: updatedDescription
          }
        });

        return NextResponse.json({
          success: true,
          action: 'copiedToDescription',
          meetUrl: meetInfo.meetUrl,
          event: updatedEvent.data
        });

      default:
        return NextResponse.json(
          { error: "Acción no válida. Acciones permitidas: 'regenerate', 'copyToDescription'" },
          { status: 400 }
        );
    }

  } catch (error: any) {
    logger.error("Error updating Meet info:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}