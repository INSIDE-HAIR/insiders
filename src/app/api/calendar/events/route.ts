import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { Logger } from "@/src/features/calendar/utils/logger";
import { z } from "zod";
import { 
  EventVisibility, 
  EventTransparency, 
  ReminderMethod, 
  RecurrenceFrequency 
} from "@/src/features/calendar/types";

const logger = new Logger("API:Events");

// Schema de validación para crear eventos
const createEventSchema = z.object({
  summary: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  
  // Fecha y hora
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid start time format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid end time format").optional(),
  allDay: z.boolean().default(false),
  timeZone: z.string().default("Europe/Madrid"),
  
  // Calendar (opcional, usa academia@insidesalons.com por defecto)
  calendarId: z.string().min(1).optional(),
  
  // Invitados
  attendees: z.array(z.object({
    email: z.string().email("Invalid email"),
    displayName: z.string().optional(),
    optional: z.boolean().default(false)
  })).default([]),
  
  // Recordatorios
  reminders: z.array(z.object({
    method: z.nativeEnum(ReminderMethod),
    minutes: z.number().min(0).max(40320) // Max 4 weeks
  })).default([]),
  
  // Recurrencia (opcional)
  recurrence: z.object({
    frequency: z.nativeEnum(RecurrenceFrequency),
    interval: z.number().min(1).default(1),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    count: z.number().min(1).optional(),
    byWeekDay: z.array(z.string()).optional()
  }).optional(),
  
  // Configuraciones
  visibility: z.nativeEnum(EventVisibility).default(EventVisibility.DEFAULT),
  transparency: z.nativeEnum(EventTransparency).default(EventTransparency.OPAQUE),
  guestsCanInviteOthers: z.boolean().default(true),
  guestsCanModify: z.boolean().default(false),
  guestsCanSeeOtherGuests: z.boolean().default(true)
});

// Schema para filtros de listado
const listEventsSchema = z.object({
  calendarId: z.string().optional(),
  timeMin: z.string().optional(),
  timeMax: z.string().optional(),
  q: z.string().optional(),
  maxResults: z.number().min(1).max(2500).default(250),
  orderBy: z.enum(['startTime', 'updated']).default('startTime'),
  pageToken: z.string().optional(),
  showDeleted: z.boolean().default(false),
  singleEvents: z.boolean().default(true)
});

/**
 * GET /api/calendar/events
 * Lista eventos con filtros opcionales
 */
export async function GET(request: NextRequest) {
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

    // Parsear query parameters
    const { searchParams } = new URL(request.url);
    const queryParams: any = Object.fromEntries(searchParams.entries());
    
    // Convertir strings a tipos apropiados
    if (queryParams.maxResults) {
      queryParams.maxResults = parseInt(queryParams.maxResults);
    }
    if (queryParams.showDeleted) {
      queryParams.showDeleted = queryParams.showDeleted === 'true';
    }
    if (queryParams.singleEvents) {
      queryParams.singleEvents = queryParams.singleEvents === 'true';
    }

    const validationResult = listEventsSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const filters = validationResult.data;
    const calendarId = filters.calendarId || 'primary';

    logger.info(`Fetching events for calendar: ${calendarId}`, filters);

    // Inicializar servicio
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener eventos
    const eventsResponse = await calendarService.getEvents(calendarId, filters);

    logger.info(`Found ${eventsResponse.items?.length || 0} events`);

    return NextResponse.json(eventsResponse);

  } catch (error: any) {
    logger.error("Failed to fetch events", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error fetching events",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/events
 * Crea un nuevo evento
 */
export async function POST(request: NextRequest) {
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

    // Parsear body
    const body = await request.json();
    
    // Validar datos
    const validationResult = createEventSchema.safeParse(body);
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

    logger.info(`Creating event: ${eventData.summary}`);

    // Inicializar servicio
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Crear evento (el servicio usa academia@insidesalons.com por defecto si no se especifica calendarId)
    const finalEventData = {
      ...eventData,
      calendarId: eventData.calendarId || 'academia@insidesalons.com'
    };
    const createdEvent = await calendarService.createEvent(finalEventData, finalEventData.calendarId);

    logger.info(`Event created successfully: ${createdEvent.id}`);

    return NextResponse.json(createdEvent, { status: 201 });

  } catch (error: any) {
    logger.error("Failed to create event", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error creating event",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}