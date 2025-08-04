import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

interface PreviewDescriptionRequest {
  calendarId: string;
  template?: string;
  customTemplate?: string;
  includeAttendees?: boolean;
  includeLocation?: boolean;
  includeDateTime?: boolean;
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    const { id: eventId } = params;
    const body: PreviewDescriptionRequest = await request.json();
    const {
      calendarId,
      template = "automático",
      customTemplate,
      includeAttendees = true,
      includeLocation = true,
      includeDateTime = true
    } = body;

    if (!calendarId) {
      return NextResponse.json(
        { error: "calendarId es requerido" },
        { status: 400 }
      );
    }

    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener el evento actual
    const event = await calendarService.getEvent(calendarId, eventId);

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Generar descripción de preview (sin guardar)
    const previewDescription = generateEventDescription(event, {
      template,
      customTemplate,
      includeAttendees,
      includeLocation,
      includeDateTime
    });

    return NextResponse.json({
      success: true,
      preview: previewDescription,
      event: {
        id: event.id,
        summary: event.summary,
        calendarId
      }
    });

  } catch (error: any) {
    console.error("Error generating preview:", error);
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
      description = `<p><strong>${title}</strong></p><p>Reunión programada para revisar temas importantes y coordinar próximos pasos.</p>`;
      break;
    case "formación":
      description = `<p><strong>${title}</strong></p><p>Sesión de formación diseñada para mejorar conocimientos y habilidades del equipo.</p>`;
      break;
    case "presentación":
      description = `<p><strong>${title}</strong></p><p>Presentación de resultados, propuestas o informes relevantes para el proyecto.</p>`;
      break;
    case "seguimiento":
      description = `<p><strong>${title}</strong></p><p>Sesión de seguimiento para revisar avances, identificar bloqueadores y planificar próximas acciones.</p>`;
      break;
    default:
      description = `<p><strong>${title}</strong></p><p>Evento programado para coordinar actividades y mantener comunicación efectiva del equipo.</p>`;
  }

  // Agregar información adicional
  const additionalInfo = [];
  
  // Información de fecha y hora
  if (includeDateTime && (event.start?.dateTime || event.start?.date)) {
    const dateTimeInfo = formatDateTime(event);
    additionalInfo.push(`<strong>📅 Fecha y hora:</strong><br>${dateTimeInfo}`);
  }

  // Información de ubicación
  if (includeLocation && event.location) {
    additionalInfo.push(`<strong>📍 Ubicación:</strong> ${event.location}`);
  }

  // Enlace de Google Meet
  if (event.hangoutLink) {
    additionalInfo.push(`<strong>💻 Información para unirse con Google Meet</strong><br><a href="${event.hangoutLink}" target="_blank">Enlace de la videollamada</a>`);
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
      .join("<br>");
    
    additionalInfo.push(`<strong>👥 Participantes:</strong><br>${participantsList}`);
  }

  // Combinar todo
  if (additionalInfo.length > 0) {
    description += additionalInfo.map(info => `<p>${info.replace(/\n/g, '<br>')}</p>`).join('');
  }

  return description;
}

function generateClassicTemplate(event: any, options: any): string {
  const title = event.summary || "Evento sin título";
  let description = `<p><strong>${title}</strong></p>`;
  
  // Fecha y hora
  if (options.includeDateTime && (event.start?.dateTime || event.start?.date)) {
    const startDate = new Date(event.start.dateTime || event.start.date);
    const endDate = event.end?.dateTime || event.end?.date ? new Date(event.end.dateTime || event.end.date) : null;
    
    if (event.start.date && !event.start.dateTime) {
      // Evento de todo el día
      description += `<p>${startDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric',
        month: 'long'
      })} (Todo el día)</p>`;
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
      
      description += `<p>${dayMonth} · ${timeRange}<br>Zona horaria: Europe/Madrid</p>`;
    }
  }

  // Google Meet
  if (event.hangoutLink) {
    description += `<p><strong>Información para unirse con Google Meet</strong><br><a href="${event.hangoutLink}" target="_blank">Enlace de la videollamada</a></p>`;
  }

  // Ubicación
  if (options.includeLocation && event.location) {
    description += `<p><strong>Ubicación:</strong> ${event.location}</p>`;
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
  
  result += `<br>${startDate.toLocaleTimeString('es-ES', { 
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