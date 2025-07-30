import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

interface BulkGenerateDescriptionsRequest {
  eventIds: Array<{
    eventId: string;
    calendarId: string;
  }>;
  template?: string;
  customTemplate?: string;
  includeAttendees?: boolean;
  includeLocation?: boolean;
  includeDateTime?: boolean;
}

export async function POST(request: NextRequest) {
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

    const body: BulkGenerateDescriptionsRequest = await request.json();
    const { 
      eventIds, 
      template = "automático", 
      customTemplate,
      includeAttendees = true, 
      includeLocation = true, 
      includeDateTime = true 
    } = body;

    if (!eventIds || eventIds.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron eventos" },
        { status: 400 }
      );
    }

    const calendarService = new GoogleCalendarService();
    await calendarService.initialize(); // Asegurar que esté inicializado
    
    const results = [];
    const errors = [];

    for (const { eventId, calendarId } of eventIds) {
      try {
        // Obtener el evento actual
        const event = await calendarService.getEvent(calendarId, eventId);
        
        if (!event) {
          errors.push({
            eventId,
            calendarId,
            error: "Evento no encontrado"
          });
          continue;
        }

        // Generar descripción automática
        const generatedDescription = generateEventDescription(event, {
          template,
          customTemplate,
          includeAttendees,
          includeLocation,
          includeDateTime
        });

        // Crear un objeto mínimo para actualizar solo la descripción
        const eventUpdate = {
          summary: event.summary,
          start: event.start,
          end: event.end,
          description: generatedDescription,
          // Preservar otros campos importantes
          attendees: event.attendees,
          location: event.location,
          reminders: event.reminders,
          visibility: event.visibility,
          transparency: event.transparency
        };

        // Usar la API directa de Google Calendar
        const calendar = (calendarService as any).calendar;
        const updatedEvent = await calendar.events.update({
          calendarId,
          eventId,
          requestBody: eventUpdate,
        });

        results.push({
          eventId,
          calendarId,
          title: event.summary,
          generatedDescription,
          success: true
        });

      } catch (error: any) {
        console.error(`Error updating event ${eventId}:`, error);
        console.error(`Error details:`, {
          eventId,
          calendarId,
          errorMessage: error.message,
          errorStack: error.stack,
          errorName: error.name
        });
        errors.push({
          eventId,
          calendarId,
          title: "Error al obtener evento",
          error: error.message || "Error desconocido"
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: eventIds.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error: any) {
    console.error("Error in bulk generate descriptions:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function generateEventDescription(
  event: any,
  options: {
    template: string;
    includeAttendees: boolean;
    includeLocation: boolean;
    includeDateTime: boolean;
    customTemplate?: string;
  }
): string {
  const { template, includeAttendees, includeLocation, includeDateTime, customTemplate } = options;
  
  // Si hay una plantilla personalizada, usarla
  if (customTemplate) {
    return processCustomTemplate(customTemplate, event, options);
  }
  
  // Templates predefinidos mejorados
  let description = "";
  const title = event.summary || "Evento sin título";
  
  switch (template) {
    case "clásico":
      return generateClassicTemplate(event, options);
    case "reunión":
      description = `${title}\n\nReunión programada para revisar temas importantes y coordinar próximos pasos.`;
      break;
    case "formación":
      description = `${title}\n\nSesión de formación diseñada para mejorar conocimientos y habilidades del equipo.`;
      break;
    case "presentación":
      description = `${title}\n\nPresentación de resultados, propuestas o informes relevantes para el proyecto.`;
      break;
    case "seguimiento":
      description = `${title}\n\nSesión de seguimiento para revisar avances, identificar bloqueadores y planificar próximas acciones.`;
      break;
    default:
      description = `${title}\n\nEvento programado para coordinar actividades y mantener comunicación efectiva del equipo.`;
  }

  // Agregar información adicional
  const additionalInfo = [];
  
  // Información de fecha y hora
  if (includeDateTime && (event.start?.dateTime || event.start?.date)) {
    const dateTimeInfo = formatDateTime(event);
    additionalInfo.push(dateTimeInfo);
  }

  // Información de ubicación
  if (includeLocation && event.location) {
    additionalInfo.push(`Ubicación: ${event.location}`);
  }

  // Enlace de Google Meet
  if (event.hangoutLink) {
    additionalInfo.push(`Información para unirse con Google Meet\nEnlace de la videollamada: ${event.hangoutLink}`);
  }

  // Participantes
  if (includeAttendees && event.attendees && event.attendees.length > 0) {
    const participantsList = event.attendees
      .filter((attendee: any) => attendee.email)
      .map((attendee: any) => {
        const name = attendee.displayName || attendee.email;
        const status = getAttendeeStatusEmoji(attendee.responseStatus);
        return `${status} ${name}`;
      })
      .join("\n");
    
    additionalInfo.push(`Participantes:\n${participantsList}`);
  }

  // Combinar todo
  if (additionalInfo.length > 0) {
    description += "\n" + additionalInfo.join("\n\n");
  }

  return description;
}

function generateClassicTemplate(event: any, options: any): string {
  const title = event.summary || "Evento sin título";
  let description = title;
  
  // Fecha y hora
  if (options.includeDateTime && (event.start?.dateTime || event.start?.date)) {
    const startDate = new Date(event.start.dateTime || event.start.date);
    const endDate = event.end?.dateTime || event.end?.date ? new Date(event.end.dateTime || event.end.date) : null;
    
    if (event.start.date && !event.start.dateTime) {
      // Evento de todo el día
      description += `\n${startDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric',
        month: 'long'
      })} (Todo el día)`;
    } else {
      // Evento con hora específica
      const dayMonth = startDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric',
        month: 'long'
      });
      
      const startTime = startDate.toLocaleTimeString('es-ES', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      let timeRange = startTime;
      if (endDate) {
        const endTime = endDate.toLocaleTimeString('es-ES', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        timeRange = `${startTime} – ${endTime}`;
      }
      
      description += `\n${dayMonth} · ${timeRange}`;
      description += `\nZona horaria: Europe/Madrid`;
    }
  }

  // Google Meet
  if (event.hangoutLink) {
    description += `\nInformación para unirse con Google Meet`;
    description += `\nEnlace de la videollamada: ${event.hangoutLink}`;
  }

  // Ubicación
  if (options.includeLocation && event.location) {
    description += `\nUbicación: ${event.location}`;
  }

  return description;
}

function processCustomTemplate(template: string, event: any, options: any): string {
  let processed = template;
  
  // Variables disponibles
  const variables = {
    '{titulo}': event.summary || 'Evento sin título',
    '{fecha_inicio}': formatDate(event.start),
    '{hora_inicio}': formatTime(event.start),
    '{fecha_fin}': formatDate(event.end),
    '{hora_fin}': formatTime(event.end),
    '{duracion}': calculateDuration(event),
    '{ubicacion}': event.location || '',
    '{meet_link}': event.hangoutLink || '',
    '{zona_horaria}': 'Europe/Madrid',
    '{lista_participantes}': options.includeAttendees ? formatAttendeesList(event.attendees) : '',
    '{num_participantes}': event.attendees ? event.attendees.length.toString() : '0',
    '{organizador}': event.organizer?.displayName || event.organizer?.email || '',
    '{fecha_completa}': formatFullDate(event.start),
    '{rango_horario}': formatTimeRange(event.start, event.end)
  };
  
  // Reemplazar variables
  Object.entries(variables).forEach(([key, value]) => {
    processed = processed.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  return processed;
}

function formatDateTime(event: any): string {
  const startDate = new Date(event.start.dateTime || event.start.date);
  const endDate = event.end?.dateTime || event.end?.date ? new Date(event.end.dateTime || event.end.date) : null;
  
  if (event.start.date && !event.start.dateTime) {
    return `${startDate.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} (Todo el día)`;
  }
  
  let result = startDate.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  result += `\n${startDate.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
  
  if (endDate) {
    result += ` - ${endDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
  
  return result;
}

function formatDate(dateTime: any): string {
  if (!dateTime) return '';
  const date = new Date(dateTime.dateTime || dateTime.date);
  return date.toLocaleDateString('es-ES');
}

function formatTime(dateTime: any): string {
  if (!dateTime?.dateTime) return '';
  const date = new Date(dateTime.dateTime);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatFullDate(dateTime: any): string {
  if (!dateTime) return '';
  const date = new Date(dateTime.dateTime || dateTime.date);
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTimeRange(start: any, end: any): string {
  if (!start?.dateTime) return '';
  const startTime = formatTime(start);
  const endTime = formatTime(end);
  return endTime ? `${startTime} – ${endTime}` : startTime;
}

function calculateDuration(event: any): string {
  if (!event.start?.dateTime || !event.end?.dateTime) return '';
  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);
  const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
}

function formatAttendeesList(attendees: any[]): string {
  if (!attendees || attendees.length === 0) return '';
  
  return attendees
    .filter((attendee: any) => attendee.email)
    .map((attendee: any) => {
      const name = attendee.displayName || attendee.email;
      const status = getAttendeeStatusEmoji(attendee.responseStatus);
      return `${status} ${name}`;
    })
    .join('\n');
}

function getAttendeeStatusEmoji(status: string): string {
  switch (status) {
    case "accepted":
      return "✅";
    case "declined":
      return "❌";
    case "tentative":
      return "❓";
    case "needsAction":
    default:
      return "⏳";
  }
}