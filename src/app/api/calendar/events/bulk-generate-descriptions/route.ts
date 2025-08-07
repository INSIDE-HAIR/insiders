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
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body: BulkGenerateDescriptionsRequest = await request.json();
    const {
      eventIds,
      template = "automático",
      customTemplate,
      includeAttendees = true,
      includeLocation = true,
      includeDateTime = true,
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
            error: "Evento no encontrado",
          });
          continue;
        }

        // Verificar permisos del calendario antes de actualizar
        try {
          const calendarInfo = await calendarService.getCalendar(calendarId);
          if (calendarInfo.accessRole === "reader") {
            throw new Error(
              "No tienes permisos de escritura en este calendario"
            );
          }

          // Verificar si el evento fue creado por otro usuario
          const currentUserEmail = session?.user?.email;
          const modificationCheck = canUserModifyEvent(event, currentUserEmail);

          if (!modificationCheck.canModify) {
            console.warn(
              `Evento ${eventId} no puede ser modificado: ${modificationCheck.reason}`
            );
            // No lanzar error aquí, intentar actualizar de todas formas
            // Google Calendar API manejará el error 403 si es necesario
          } else {
            console.log(
              `Evento ${eventId} puede ser modificado por ${currentUserEmail}`
            );
          }
        } catch (calendarError: any) {
          console.warn(
            `No se pudo verificar permisos del calendario ${calendarId}:`,
            calendarError.message
          );
          // Continuar con la actualización si no se puede verificar
        }

        // Generar descripción automática
        const generatedDescription = generateEventDescription(event, {
          template,
          customTemplate,
          includeAttendees,
          includeLocation,
          includeDateTime,
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
          transparency: event.transparency,
        };

        // Usar la API directa de Google Calendar
        const calendar = (calendarService as any).calendar;
        const updatedEvent = await calendar.events.update({
          calendarId,
          eventId,
          requestBody: eventUpdate,
        });

        // Verificar que la actualización fue exitosa
        if (!updatedEvent || !updatedEvent.data) {
          throw new Error(
            "La API de Google Calendar no devolvió datos del evento actualizado"
          );
        }

        // Verificar que la descripción se actualizó correctamente
        if (updatedEvent.data.description !== generatedDescription) {
          console.warn(
            `Descripción no se actualizó correctamente para evento ${eventId}`
          );
          console.warn(
            `Esperado: ${generatedDescription.substring(0, 100)}...`
          );
          console.warn(
            `Actual: ${updatedEvent.data.description?.substring(0, 100)}...`
          );
        }

        // Verificar que el evento se actualizó realmente
        if (!updatedEvent.data.id || updatedEvent.data.id !== eventId) {
          throw new Error(
            "El evento actualizado no coincide con el evento original"
          );
        }

        // Log de éxito para debugging
        console.log(
          `✅ Evento ${eventId} actualizado exitosamente en calendario ${calendarId}`
        );

        results.push({
          eventId,
          calendarId,
          title: event.summary,
          generatedDescription,
          success: true,
          updatedEventData: updatedEvent.data,
        });
      } catch (error: any) {
        console.error(`Error updating event ${eventId}:`, error);
        console.error(`Error details:`, {
          eventId,
          calendarId,
          errorMessage: error.message,
          errorStack: error.stack,
          errorName: error.name,
        });
        // Determinar el tipo de error para un mensaje más específico
        let errorTitle = "Error al procesar evento";
        let errorMessage = error.message || "Error desconocido";

        if (error.code === 403) {
          // Usar la función helper para determinar el tipo de error 403
          const currentUserEmail = session?.user?.email;
          const modificationCheck = canUserModifyEvent(event, currentUserEmail);

          if (!modificationCheck.canModify && modificationCheck.creatorEmail) {
            errorTitle = "Evento creado por otro usuario";
            errorMessage = `No puedes modificar eventos creados por ${modificationCheck.creatorEmail}. Solo el creador original puede modificar este evento.`;
          } else {
            errorTitle = "Sin permisos de escritura";
            errorMessage = "No tienes permisos para modificar este evento";
          }
        } else if (error.code === 404) {
          errorTitle = "Evento no encontrado";
          errorMessage = "El evento no existe o fue eliminado";
        } else if (error.message?.includes("quota")) {
          errorTitle = "Límite de API excedido";
          errorMessage =
            "Se ha excedido el límite de llamadas a la API de Google Calendar";
        } else if (error.message?.includes("permisos")) {
          errorTitle = "Sin permisos de escritura";
          errorMessage =
            "No tienes permisos para modificar eventos en este calendario";
        } else if (error.message?.includes("creado por otro usuario")) {
          errorTitle = "Evento creado por otro usuario";
          errorMessage =
            "No puedes modificar eventos creados por otros usuarios";
        } else if (error.message?.includes("no devolvió datos")) {
          errorTitle = "Error de respuesta de API";
          errorMessage =
            "Google Calendar no devolvió confirmación de la actualización";
        } else if (error.message?.includes("no coincide")) {
          errorTitle = "Error de sincronización";
          errorMessage =
            "El evento actualizado no coincide con el evento original";
        }

        errors.push({
          eventId,
          calendarId,
          title: errorTitle,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: eventIds.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
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
  const {
    template,
    includeAttendees,
    includeLocation,
    includeDateTime,
    customTemplate,
  } = options;

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
    additionalInfo.push(`<p>${dateTimeInfo}</p>`);
  }

  // Información de ubicación
  if (includeLocation && event.location) {
    additionalInfo.push(`<p>Ubicación: ${event.location}</p>`);
  }

  // Enlace de Google Meet
  if (event.hangoutLink) {
    additionalInfo.push(
      `<p>Información para unirse con Google Meet</p><p>Enlace de la videollamada: <a href="${event.hangoutLink}">${event.hangoutLink}</a></p>`
    );
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

    additionalInfo.push(`<p>Participantes:<br>${participantsList}</p>`);
  }

  // Combinar todo
  if (additionalInfo.length > 0) {
    description += additionalInfo.join("");
  }

  return description;
}

function generateClassicTemplate(event: any, options: any): string {
  const title = event.summary || "Evento sin título";
  let description = `<p><strong>${title}</strong></p>`;

  // Fecha y hora
  if (options.includeDateTime && (event.start?.dateTime || event.start?.date)) {
    const startDate = new Date(event.start.dateTime || event.start.date);
    const endDate =
      event.end?.dateTime || event.end?.date
        ? new Date(event.end.dateTime || event.end.date)
        : null;

    if (event.start.date && !event.start.dateTime) {
      // Evento de todo el día
      description += `<p>${startDate.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })} (Todo el día)</p>`;
    } else {
      // Evento con hora específica
      const dayMonth = startDate.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

      const startTime = startDate.toLocaleTimeString("es-ES", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      let timeRange = startTime;
      if (endDate) {
        const endTime = endDate.toLocaleTimeString("es-ES", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        timeRange = `${startTime} – ${endTime}`;
      }

      description += `<p>${dayMonth} · ${timeRange}</p>`;
      description += `<p>Zona horaria: Europe/Madrid</p>`;
    }
  }

  // Google Meet
  if (event.hangoutLink) {
    description += `<p>Información para unirse con Google Meet</p>`;
    description += `<p>Enlace de la videollamada: <a href="${event.hangoutLink}">${event.hangoutLink}</a></p>`;
  }

  // Ubicación
  if (options.includeLocation && event.location) {
    description += `<p>Ubicación: ${event.location}</p>`;
  }

  return description;
}

function processCustomTemplate(
  template: string,
  event: any,
  options: any
): string {
  let processed = template;

  // Variables disponibles
  const variables = {
    "{titulo}": event.summary || "Evento sin título",
    "{fecha_inicio}": formatDate(event.start),
    "{hora_inicio}": formatTime(event.start),
    "{fecha_fin}": formatDate(event.end),
    "{hora_fin}": formatTime(event.end),
    "{duracion}": calculateDuration(event),
    "{ubicacion}": event.location || "",
    "{meet_link}": event.hangoutLink || "",
    "{zona_horaria}": "Europe/Madrid",
    "{lista_participantes}": options.includeAttendees
      ? formatAttendeesList(event.attendees)
      : "",
    "{num_participantes}": event.attendees
      ? event.attendees.length.toString()
      : "0",
    "{organizador}":
      event.organizer?.displayName || event.organizer?.email || "",
    "{fecha_completa}": formatFullDate(event.start),
    "{rango_horario}": formatTimeRange(event.start, event.end),
  };

  // Reemplazar variables
  Object.entries(variables).forEach(([key, value]) => {
    processed = processed.replace(
      new RegExp(key.replace(/[{}]/g, "\\$&"), "g"),
      value
    );
  });

  // Convertir saltos de línea en HTML
  processed = processed.replace(/\n/g, "<br>");

  // Convertir texto plano en párrafos HTML si no hay tags HTML
  if (!processed.includes("<p>") && !processed.includes("<br>")) {
    processed = `<p>${processed}</p>`;
  }

  return processed;
}

function formatDateTime(event: any): string {
  const startDate = new Date(event.start.dateTime || event.start.date);
  const endDate =
    event.end?.dateTime || event.end?.date
      ? new Date(event.end.dateTime || event.end.date)
      : null;

  if (event.start.date && !event.start.dateTime) {
    return `${startDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })} (Todo el día)`;
  }

  let result = startDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  result += `\n${startDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  if (endDate) {
    result += ` - ${endDate.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return result;
}

function formatDate(dateTime: any): string {
  if (!dateTime) return "";
  const date = new Date(dateTime.dateTime || dateTime.date);
  return date.toLocaleDateString("es-ES");
}

function formatTime(dateTime: any): string {
  if (!dateTime?.dateTime) return "";
  const date = new Date(dateTime.dateTime);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDate(dateTime: any): string {
  if (!dateTime) return "";
  const date = new Date(dateTime.dateTime || dateTime.date);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTimeRange(start: any, end: any): string {
  if (!start?.dateTime) return "";
  const startTime = formatTime(start);
  const endTime = formatTime(end);
  return endTime ? `${startTime} – ${endTime}` : startTime;
}

function calculateDuration(event: any): string {
  if (!event.start?.dateTime || !event.end?.dateTime) return "";
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
  if (!attendees || attendees.length === 0) return "";

  return attendees
    .filter((attendee: any) => attendee.email)
    .map((attendee: any) => {
      const name = attendee.displayName || attendee.email;
      const status = getAttendeeStatusEmoji(attendee.responseStatus);
      return `${status} ${name}`;
    })
    .join("<br>");
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

/**
 * Verifica si el usuario actual puede modificar un evento
 */
function canUserModifyEvent(
  event: any,
  currentUserEmail?: string
): {
  canModify: boolean;
  reason?: string;
  creatorEmail?: string;
} {
  // Si no hay información del creador, asumir que se puede modificar
  if (!event.creator || !event.creator.email) {
    return { canModify: true };
  }

  const creatorEmail = event.creator.email;

  // Si no hay email del usuario actual, no se puede determinar
  if (!currentUserEmail) {
    return {
      canModify: false,
      reason: "No se puede determinar el usuario actual",
      creatorEmail,
    };
  }

  // Si el creador es el usuario actual, puede modificar
  if (creatorEmail === currentUserEmail) {
    return { canModify: true, creatorEmail };
  }

  // Si el creador es diferente, no puede modificar
  return {
    canModify: false,
    reason: `Evento creado por ${creatorEmail}`,
    creatorEmail,
  };
}
