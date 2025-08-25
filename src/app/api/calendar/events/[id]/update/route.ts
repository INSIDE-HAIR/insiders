import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

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
    const targetCalendarId = updateData.calendarId;
    if (targetCalendarId && targetCalendarId !== calendarId) {
      try {
        // Use the move API to move the event
        const movedEvent = await calendarService.moveEvent(
          calendarId,
          eventId,
          targetCalendarId
        );

        // If there are additional updates after moving, apply them
        if (Object.keys(updateData).length > 1) {
          // Remove calendarId from updateData since we already moved it
          const { calendarId: _, ...remainingUpdates } = updateData;
          
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
        updateData
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
