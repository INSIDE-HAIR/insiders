import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { Logger } from "@/src/features/calendar/utils/logger";

const logger = new Logger("API:Calendars");

/**
 * GET /api/calendar/calendars
 * Lista todos los calendarios disponibles
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

    logger.info("Fetching calendars list");

    // Inicializar servicio de Calendar
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener calendarios
    const calendars = await calendarService.getCalendars();

    logger.info(`Found ${calendars.length} calendars`);

    return NextResponse.json({
      calendars,
      total: calendars.length
    });

  } catch (error: any) {
    logger.error("Failed to fetch calendars", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error fetching calendars",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}