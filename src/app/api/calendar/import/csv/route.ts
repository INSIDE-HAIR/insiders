import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { Logger } from "@/src/features/calendar/utils/logger";
import { z } from "zod";
import { 
  EventVisibility, 
  EventTransparency, 
  ReminderMethod,
  ImportResult,
  CsvEventData
} from "@/src/features/calendar/types";

const logger = new Logger("API:ImportCSV");

// Schema para validar datos CSV parseados
const csvEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  location: z.string().optional().default(""),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid start time format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid end time format").optional(),
  allDay: z.string().default("false"),
  timeZone: z.string().optional().default("Europe/Madrid"),
  attendeeEmails: z.string().optional().default(""),
  reminderMinutes: z.string().optional().default(""),
  visibility: z.string().optional().default("default"),
  transparency: z.string().optional().default("opaque")
});

/**
 * Convierte datos CSV a formato de formulario de evento
 */
function csvToEventForm(csvData: CsvEventData, calendarId: string) {
  // Procesar invitados
  const attendees = csvData.attendeeEmails
    ? csvData.attendeeEmails.split(';')
        .map(email => email.trim())
        .filter(email => email.length > 0)
        .map(email => ({ email, optional: false }))
    : [];

  // Procesar recordatorios
  const reminders = csvData.reminderMinutes
    ? csvData.reminderMinutes.split(';')
        .map(minutes => parseInt(minutes.trim()))
        .filter(minutes => !isNaN(minutes) && minutes >= 0)
        .map(minutes => ({ method: ReminderMethod.EMAIL, minutes }))
    : [];

  // Determinar visibilidad
  let visibility = EventVisibility.DEFAULT;
  if (csvData.visibility) {
    const vis = csvData.visibility.toLowerCase();
    if (vis === 'public') visibility = EventVisibility.PUBLIC;
    else if (vis === 'private') visibility = EventVisibility.PRIVATE;
    else if (vis === 'confidential') visibility = EventVisibility.CONFIDENTIAL;
  }

  // Determinar transparencia
  let transparency = EventTransparency.OPAQUE;
  if (csvData.transparency?.toLowerCase() === 'transparent') {
    transparency = EventTransparency.TRANSPARENT;
  }

  return {
    summary: csvData.title,
    description: csvData.description || '',
    location: csvData.location || '',
    startDate: csvData.startDate,
    startTime: csvData.startTime,
    endDate: csvData.endDate,
    endTime: csvData.endTime,
    allDay: csvData.allDay === 'true',
    timeZone: csvData.timeZone || 'Europe/Madrid',
    calendarId,
    attendees,
    reminders,
    visibility,
    transparency,
    guestsCanInviteOthers: true,
    guestsCanModify: false,
    guestsCanSeeOtherGuests: true
  };
}

/**
 * Parsea contenido CSV simple
 */
function parseCSV(csvContent: string): CsvEventData[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Procesar header
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Validar headers requeridos
  const requiredHeaders = ['title', 'startDate', 'endDate'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  // Procesar filas de datos
  const events: CsvEventData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    // Simple CSV parsing (handles basic quoted fields)
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue); // Add last value

    // Crear objeto evento
    const eventData: any = {};
    headers.forEach((header, index) => {
      eventData[header] = values[index]?.trim() || '';
    });

    events.push(eventData as CsvEventData);
  }

  return events;
}

/**
 * POST /api/calendar/import/csv
 * Importa eventos desde un archivo CSV
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

    // Obtener datos del request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const calendarId = (formData.get('calendarId') as string) || 'primary';

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    // Verificar que sea un archivo CSV
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
    }

    // Leer contenido del archivo
    const csvContent = await file.text();
    
    logger.info(`Starting CSV import from file: ${file.name}`);

    // Parsear CSV
    let csvEvents: CsvEventData[];
    try {
      csvEvents = parseCSV(csvContent);
    } catch (parseError: any) {
      return NextResponse.json(
        { error: `CSV parsing error: ${parseError.message}` },
        { status: 400 }
      );
    }

    logger.info(`Parsed ${csvEvents.length} events from CSV`);

    // Validar y convertir eventos
    const validEvents: any[] = [];
    const validationErrors: any[] = [];

    for (let i = 0; i < csvEvents.length; i++) {
      const csvEvent = csvEvents[i];
      
      try {
        // Validar datos CSV
        const validationResult = csvEventSchema.safeParse(csvEvent);
        if (!validationResult.success) {
          validationErrors.push({
            row: i + 2, // +2 porque empezamos en 1 y saltamos header
            title: csvEvent.title || 'Unknown',
            errors: validationResult.error.errors.map(e => e.message)
          });
          continue;
        }

        // Convertir a formato de evento
        const eventForm = csvToEventForm(validationResult.data, calendarId);
        validEvents.push(eventForm);
        
      } catch (error: any) {
        validationErrors.push({
          row: i + 2,
          title: csvEvent.title || 'Unknown',
          errors: [error.message]
        });
      }
    }

    // Si hay errores de validación, retornarlos
    if (validationErrors.length > 0 && validEvents.length === 0) {
      return NextResponse.json(
        { 
          error: "All events failed validation",
          validationErrors 
        },
        { status: 400 }
      );
    }

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
    const batchResult = await calendarService.createEventsInBatch(calendarId, validEvents);

    // Preparar resultado
    const result: ImportResult = {
      totalEvents: csvEvents.length,
      successfulImports: batchResult.successful.length,
      failedImports: batchResult.failed.length + validationErrors.length,
      errors: [
        // Errores de validación
        ...validationErrors.map(ve => ({
          eventIndex: ve.row - 2,
          eventTitle: ve.title,
          error: `Validation errors: ${ve.errors.join(', ')}`
        })),
        // Errores de creación
        ...batchResult.failed.map((failure, index) => ({
          eventIndex: validEvents.findIndex(e => e.summary === failure.event.summary),
          eventTitle: failure.event.summary,
          error: failure.error
        }))
      ],
      importedEventIds: batchResult.successful.map(event => event.id!).filter(Boolean)
    };

    logger.info(`CSV import completed: ${result.successfulImports}/${result.totalEvents} successful`);

    // Determinar código de estado
    const statusCode = result.failedImports === 0 ? 200 : 
                      result.successfulImports === 0 ? 400 : 207;

    return NextResponse.json(result, { status: statusCode });

  } catch (error: any) {
    logger.error("Failed to import CSV", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error importing CSV",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar/import/csv
 * Retorna template CSV para download
 */
export async function GET(request: NextRequest) {
  try {
    // Template CSV con ejemplos
    const csvTemplate = `title,description,location,startDate,startTime,endDate,endTime,allDay,timeZone,attendeeEmails,reminderMinutes,visibility,transparency
"Reunión de equipo","Reunión semanal del equipo","Sala A","2024-02-15","09:00","2024-02-15","10:00","false","Europe/Madrid","user1@example.com;user2@example.com","15;60","default","opaque"
"Conferencia","Conferencia anual de tecnología","Centro de convenciones","2024-03-01","08:00","2024-03-01","18:00","false","Europe/Madrid","","30","public","opaque"
"Evento todo el día","Día de la empresa","Oficina central","2024-04-01","","2024-04-01","","true","Europe/Madrid","team@company.com","1440","default","transparent"
"Standup diario","Reunión de seguimiento diario","Sala virtual","2024-02-20","09:30","2024-02-20","10:00","false","Europe/Madrid","dev-team@company.com","10","default","opaque"`;

    return new NextResponse(csvTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="calendar_import_template.csv"'
      }
    });

  } catch (error: any) {
    logger.error("Failed to generate CSV template", error);
    
    return NextResponse.json(
      { error: "Error generating template" },
      { status: 500 }
    );
  }
}