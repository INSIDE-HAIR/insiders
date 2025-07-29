import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { Logger } from "@/src/features/calendar/utils/logger";
import { processIBMEUEvents, validateEventData } from "@/src/features/calendar/utils/eventProcessor";
import { z } from "zod";
import { 
  EventVisibility, 
  EventTransparency, 
  ReminderMethod, 
  RecurrenceFrequency,
  CalendarImportData,
  ImportResult
} from "@/src/features/calendar/types";

const logger = new Logger("API:ImportJSON");

// Schema para validar evento individual en JSON
const jsonEventSchema = z.object({
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
  
  // Invitados
  attendees: z.array(z.object({
    email: z.string().email("Invalid email"),
    displayName: z.string().optional(),
    optional: z.boolean().default(false)
  })).default([]),
  
  // Recordatorios
  reminders: z.array(z.object({
    method: z.nativeEnum(ReminderMethod),
    minutes: z.number().min(0).max(40320)
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

// Schema para el archivo JSON completo
const importJsonSchema = z.object({
  calendarId: z.string().default('primary'),
  defaultTimeZone: z.string().default('Europe/Madrid'),
  events: z.array(jsonEventSchema).min(1, "At least one event is required")
});

/**
 * POST /api/calendar/import/json
 * Importa eventos desde un archivo JSON
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
    
    // Intentar procesar como formato IBMEU primero
    let eventsToImport;
    let calendarId = 'primary';
    
    try {
      eventsToImport = processIBMEUEvents(body);
      calendarId = body.calendarId || 'primary';
      logger.info(`Processing as IBMEU format: ${eventsToImport.length} events`);
    } catch (ibmeuError) {
      logger.info(`IBMEU format failed, trying standard format: ${ibmeuError}`);
      
      // Intentar formato estándar
      const validationResult = importJsonSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: "Invalid JSON structure. Supported formats: IBMEU enhanced or standard calendar import", 
            details: {
              ibmeuError: ibmeuError instanceof Error ? ibmeuError.message : 'Unknown error',
              standardFormatError: validationResult.error.errors
            }
          },
          { status: 400 }
        );
      }

      const importData = validationResult.data;
      calendarId = importData.calendarId;
      eventsToImport = importData.events.map(event => ({
        ...event,
        calendarId,
        timeZone: event.timeZone || importData.defaultTimeZone
      }));
    }

    logger.info(`Starting JSON import: ${eventsToImport.length} events to calendar ${calendarId}`);

    // Inicializar servicio
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Verificar acceso al calendario
    const hasAccess = await calendarService.hasCalendarAccess(calendarId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: `No access to calendar: ${calendarId}` },
        { status: 403 }
      );
    }

    // Ejecutar importación en batch
    const batchResult = await calendarService.createEventsInBatch(calendarId, eventsToImport);

    // Preparar resultado
    const result: ImportResult = {
      totalEvents: eventsToImport.length,
      successfulImports: batchResult.successful.length,
      failedImports: batchResult.failed.length,
      errors: batchResult.failed.map((failure, index) => ({
        eventIndex: index,
        eventTitle: failure.event.summary,
        error: failure.error
      })),
      importedEventIds: batchResult.successful.map(event => event.id!).filter(Boolean)
    };

    logger.info(`JSON import completed: ${result.successfulImports}/${result.totalEvents} successful`);

    // Determinar código de estado basado en resultados
    const statusCode = result.failedImports === 0 ? 200 : 
                      result.successfulImports === 0 ? 400 : 207; // 207 = Multi-Status

    return NextResponse.json(result, { status: statusCode });

  } catch (error: any) {
    logger.error("Failed to import JSON", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error importing JSON",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar/import/json
 * Retorna un ejemplo de estructura JSON para importación
 */
export async function GET(request: NextRequest) {
  try {
    const exampleJson: CalendarImportData = {
      calendarId: "primary",
      defaultTimeZone: "Europe/Madrid",
      events: [
        {
          summary: "Reunión de equipo",
          description: "Reunión semanal del equipo de desarrollo",
          location: "Sala de conferencias A",
          startDate: "2024-02-15",
          startTime: "09:00",
          endDate: "2024-02-15",
          endTime: "10:00",
          allDay: false,
          timeZone: "Europe/Madrid",
          attendees: [
            {
              email: "usuario@ejemplo.com",
              displayName: "Usuario Ejemplo",
              optional: false
            }
          ],
          reminders: [
            {
              method: ReminderMethod.EMAIL,
              minutes: 15
            },
            {
              method: ReminderMethod.POPUP,
              minutes: 5
            }
          ],
          visibility: EventVisibility.DEFAULT,
          transparency: EventTransparency.OPAQUE,
          guestsCanInviteOthers: true,
          guestsCanModify: false,
          guestsCanSeeOtherGuests: true
        },
        {
          summary: "Evento de todo el día",
          description: "Conferencia anual de tecnología",
          location: "Centro de convenciones",
          startDate: "2024-03-01",
          endDate: "2024-03-01",
          allDay: true,
          attendees: [],
          reminders: [
            {
              method: ReminderMethod.EMAIL,
              minutes: 1440 // 1 día antes
            }
          ],
          visibility: EventVisibility.PUBLIC
        },
        {
          summary: "Reunión recurrente",
          description: "Standup diario del equipo",
          location: "Sala virtual",
          startDate: "2024-02-20",
          startTime: "09:30",
          endDate: "2024-02-20",
          endTime: "10:00",
          allDay: false,
          recurrence: {
            frequency: RecurrenceFrequency.DAILY,
            interval: 1,
            count: 30 // 30 días
          },
          reminders: [
            {
              method: ReminderMethod.POPUP,
              minutes: 10
            }
          ]
        }
      ]
    };

    return NextResponse.json({
      message: "Example JSON structure for calendar import",
      example: exampleJson,
      notes: [
        "All events must have at least summary, startDate, and endDate",
        "Use allDay: true for all-day events (no times needed)",
        "Times should be in HH:MM format (24-hour)",
        "Dates should be in YYYY-MM-DD format",
        "Default calendarId is 'primary' if not specified",
        "Default timeZone is 'Europe/Madrid' if not specified",
        "Attendees emails must be valid",
        "Reminder minutes: max 40320 (28 days)",
        "For recurring events, specify either count or endDate, not both"
      ]
    });

  } catch (error: any) {
    logger.error("Failed to generate JSON example", error);
    
    return NextResponse.json(
      { error: "Error generating example" },
      { status: 500 }
    );
  }
}