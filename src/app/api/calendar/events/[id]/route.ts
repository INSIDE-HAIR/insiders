import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { Logger } from "@/src/features/calendar/utils/logger";
import { getMeetInfo } from "@/src/features/calendar/utils/meetUtils";
import { z } from "zod";
import { 
  EventVisibility, 
  EventTransparency, 
  ReminderMethod, 
  RecurrenceFrequency 
} from "@/src/features/calendar/types";

const logger = new Logger("API:EventDetail");

// Schema para actualizar evento (todos los campos opcionales)
const updateEventSchema = z.object({
  summary: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  
  // Fecha y hora
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  allDay: z.boolean().optional(),
  timeZone: z.string().optional(),
  
  // Invitados
  attendees: z.array(z.object({
    email: z.string().email(),
    displayName: z.string().optional(),
    optional: z.boolean().default(false)
  })).optional(),
  
  // Recordatorios
  reminders: z.array(z.object({
    method: z.nativeEnum(ReminderMethod),
    minutes: z.number().min(0).max(40320)
  })).optional(),
  
  // Recurrencia
  recurrence: z.object({
    frequency: z.nativeEnum(RecurrenceFrequency),
    interval: z.number().min(1).default(1),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    count: z.number().min(1).optional(),
    byWeekDay: z.array(z.string()).optional()
  }).optional(),
  
  // Configuraciones
  visibility: z.nativeEnum(EventVisibility).optional(),
  transparency: z.nativeEnum(EventTransparency).optional(),
  guestsCanInviteOthers: z.boolean().optional(),
  guestsCanModify: z.boolean().optional(),
  guestsCanSeeOtherGuests: z.boolean().optional()
});

/**
 * GET /api/calendar/events/[id]
 * Obtiene un evento específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Obtener calendarId de query params (por defecto 'primary')
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary';

    logger.info(`Fetching event: ${eventId} from calendar: ${calendarId}`);

    // Inicializar servicio
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener evento
    const event = await calendarService.getEvent(calendarId, eventId);

    // Agregar información de Google Meet si existe
    const meetInfo = getMeetInfo(event);
    const eventWithMeetInfo = {
      ...event,
      meetInfo // Información adicional de Meet extraída
    };

    logger.info(`Event fetched successfully: ${eventId}`, { hasMeet: !!meetInfo });

    return NextResponse.json(eventWithMeetInfo);

  } catch (error: any) {
    logger.error(`Failed to fetch event ${params.id}`, error);
    
    // Manejar errores específicos de Google Calendar
    if (error.message.includes('Not Found')) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Error fetching event",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

/**
 * Función helper para actualizar eventos
 */
async function updateEvent(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Parsear body
    const body = await request.json();
    
    // Obtener calendarId de query params primero, luego del body
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || body.calendarId || 'primary';
    
    // Validar datos
    const validationResult = updateEventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid event data", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const eventData = validationResult.data;

    logger.info(`Updating event: ${eventId} in calendar: ${calendarId}`);

    // Inicializar servicio
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Actualizar evento
    const updatedEvent = await calendarService.updateEvent(calendarId, eventId, eventData);

    logger.info(`Event updated successfully: ${eventId}`);

    return NextResponse.json(updatedEvent);

  } catch (error: any) {
    logger.error(`Failed to update event ${params.id}`, error);
    
    // Manejar errores específicos
    if (error.message.includes('Not Found')) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Error updating event",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/calendar/events/[id]
 * Actualiza un evento existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateEvent(request, { params });
}

/**
 * PATCH /api/calendar/events/[id]
 * Actualiza un evento existente (alias de PUT)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateEvent(request, { params });
}

/**
 * DELETE /api/calendar/events/[id]
 * Elimina un evento
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Obtener calendarId de query params
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary';

    logger.info(`Deleting event: ${eventId} from calendar: ${calendarId}`);

    // Inicializar servicio
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Eliminar evento
    await calendarService.deleteEvent(calendarId, eventId);

    logger.info(`Event deleted successfully: ${eventId}`);

    return NextResponse.json({ 
      message: "Event deleted successfully",
      eventId,
      calendarId 
    });

  } catch (error: any) {
    logger.error(`Failed to delete event ${params.id}`, error);
    
    // Manejar errores específicos
    if (error.message.includes('Not Found')) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Error deleting event",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}