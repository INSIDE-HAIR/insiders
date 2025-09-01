import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { CalendarEventForm } from "@/src/features/calendar/types";

/**
 * Converts incoming update data to CalendarEventForm format
 */
function convertToCalendarEventForm(updateData: any, eventId: string): Partial<CalendarEventForm> {
  const converted: Partial<CalendarEventForm> = {};
  
  // Handle summary
  if (updateData.summary !== undefined) {
    converted.summary = updateData.summary;
  }
  
  // Handle description
  if (updateData.description !== undefined) {
    converted.description = updateData.description;
  }
  
  // Handle location
  if (updateData.location !== undefined) {
    converted.location = updateData.location;
  }
  
  // Handle start date/time - support both direct date strings and { dateTime, date } objects
  if (updateData.start !== undefined) {
    let startDateString: string | undefined;
    let isAllDay = false;
    
    if (typeof updateData.start === 'string') {
      startDateString = updateData.start;
    } else if (typeof updateData.start === 'object' && updateData.start !== null) {
      if (updateData.start.dateTime) {
        startDateString = updateData.start.dateTime;
        isAllDay = false;
      } else if (updateData.start.date) {
        startDateString = updateData.start.date;
        isAllDay = true;
      }
    }
    
    if (startDateString) {
      const startDate = new Date(startDateString);
      if (!isNaN(startDate.getTime())) {
        converted.startDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!isAllDay) {
          converted.startTime = startDate.toISOString().split('T')[1].substring(0, 5); // HH:MM
          converted.allDay = false;
          converted.timeZone = process.env.GOOGLE_CALENDAR_DEFAULT_TIMEZONE || 'Europe/Madrid';
        } else {
          converted.allDay = true;
        }
      }
    }
  }
  
  // Handle end date/time - support both direct date strings and { dateTime, date } objects
  if (updateData.end !== undefined) {
    let endDateString: string | undefined;
    let isAllDay = false;
    
    if (typeof updateData.end === 'string') {
      endDateString = updateData.end;
    } else if (typeof updateData.end === 'object' && updateData.end !== null) {
      if (updateData.end.dateTime) {
        endDateString = updateData.end.dateTime;
        isAllDay = false;
      } else if (updateData.end.date) {
        endDateString = updateData.end.date;
        isAllDay = true;
      }
    }
    
    if (endDateString) {
      const endDate = new Date(endDateString);
      if (!isNaN(endDate.getTime())) {
        converted.endDate = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!isAllDay) {
          converted.endTime = endDate.toISOString().split('T')[1].substring(0, 5); // HH:MM
        }
      }
    }
  }
  
  // Handle calendar move
  if (updateData.calendarId !== undefined) {
    converted.calendarId = updateData.calendarId;
  }
  
  // Handle other fields that might be present
  if (updateData.visibility !== undefined) {
    converted.visibility = updateData.visibility;
  }
  
  if (updateData.transparency !== undefined) {
    converted.transparency = updateData.transparency;
  }
  
  // Handle attendees
  if (updateData.attendees !== undefined) {
    converted.attendees = updateData.attendees.map((attendee: any) => ({
      email: attendee.email,
      displayName: attendee.displayName,
      optional: attendee.optional || false
    }));
  }
  
  return converted;
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get("calendarId") || "primary";
    const eventId = params.id;

    const updateData = await request.json();
    
    // Convert the update data to CalendarEventForm format if needed
    const convertedUpdateData = convertToCalendarEventForm(updateData, eventId);

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

    // Check if we need to move the event to a different calendar
    const targetCalendarId = convertedUpdateData.calendarId;
    if (targetCalendarId && targetCalendarId !== calendarId) {
      try {
        // Use the move API to move the event
        const movedEvent = await calendarService.moveEvent(
          calendarId,
          eventId,
          targetCalendarId
        );

        // If there are additional updates after moving, apply them
        if (Object.keys(convertedUpdateData).length > 1) {
          // Remove calendarId from convertedUpdateData since we already moved it
          const { calendarId: _, ...remainingUpdates } = convertedUpdateData;
          
          if (Object.keys(remainingUpdates).length > 0) {
            const updatedEvent = await calendarService.updateEvent(
              targetCalendarId,
              eventId,
              remainingUpdates
            );
            return NextResponse.json({
              success: true,
              event: updatedEvent,
              moved: true
            });
          }
        }

        return NextResponse.json({
          success: true,
          event: movedEvent,
          moved: true
        });
      } catch (moveError: any) {
        console.error("Error moving event:", moveError);
        
        // Provide more specific error messages based on the error type
        let userMessage = "Error al mover el evento al calendario destino";
        let isRecurringEventIssue = false;
        
        if (moveError.message?.includes('Cannot change the organizer of an instance')) {
          userMessage = "No se puede mover esta instancia de evento recurrente. El evento se copiará al nuevo calendario y se eliminará del original.";
          isRecurringEventIssue = true;
        } else if (moveError.message?.includes('recurring') || moveError.message?.includes('instance')) {
          userMessage = "Este evento recurrente se copiará al nuevo calendario ya que no se puede mover directamente.";
          isRecurringEventIssue = true;
        } else if (moveError.message?.includes('permission') || moveError.message?.includes('access')) {
          userMessage = "No tienes permisos suficientes para mover eventos entre estos calendarios.";
        } else if (moveError.message?.includes('not found')) {
          userMessage = "El evento o calendario no fue encontrado.";
        }
        
        return NextResponse.json(
          {
            error: userMessage,
            details: moveError.message,
            isRecurringEventIssue,
            fallbackUsed: true
          },
          { status: isRecurringEventIssue ? 200 : 500 } // 200 if fallback worked for recurring events
        );
      }
    }

    // If no calendar move, proceed with regular update
    // Verificar permisos del calendario antes de intentar actualizar
    try {
      const calendarInfo = await calendarService.getCalendar(calendarId);

      // Verificar si el usuario tiene permisos de escritura
      if (calendarInfo.accessRole === "reader") {
        return NextResponse.json(
          {
            error: "No tienes permisos de escritura en este calendario",
            details: `El calendario '${calendarId}' es de solo lectura para tu cuenta. Solo puedes ver eventos, no modificarlos.`,
          },
          { status: 403 }
        );
      }
    } catch (calendarError: any) {
      console.warn(
        "No se pudo verificar permisos del calendario:",
        calendarError
      );
      // Continuar con la actualización si no se puede verificar
    }

    // Use the service method for updating
    try {
      const updatedEvent = await calendarService.updateEvent(
        calendarId,
        eventId,
        convertedUpdateData
      );

      return NextResponse.json({
        success: true,
        event: updatedEvent,
      });
    } catch (googleError: any) {
      console.error("Google Calendar API error:", googleError);

      // Manejar errores específicos de Google Calendar API
      if (googleError.code === 403) {
        return NextResponse.json(
          {
            error:
              "No tienes permisos para modificar eventos en este calendario. Verifica que tengas permisos de escritura en el calendario.",
            details:
              "El calendario puede ser de solo lectura o no tienes permisos de escritura",
          },
          { status: 403 }
        );
      }

      if (googleError.code === 404) {
        return NextResponse.json(
          { error: "Evento no encontrado en el calendario especificado" },
          { status: 404 }
        );
      }

      // Re-lanzar el error para que sea manejado por el catch exterior
      throw googleError;
    }
  } catch (error: any) {
    console.error("Error updating event:", error);

    return NextResponse.json(
      {
        error: error.message || "Error interno del servidor",
        details: error.code ? `Código de error: ${error.code}` : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get("calendarId") || "primary";
    const eventId = params.id;

    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    await calendarService.deleteEvent(calendarId, eventId);

    return NextResponse.json({
      success: true,
      message: "Evento eliminado correctamente",
    });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
