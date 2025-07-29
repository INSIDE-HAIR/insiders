import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { Logger } from "@/src/features/calendar/utils/logger";

const logger = new Logger("API:AccountInfo");

/**
 * GET /api/calendar/account/info
 * Obtiene información detallada de la cuenta de Google Calendar
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

    logger.info("Fetching Calendar account information");

    // Inicializar servicio de Calendar
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener todos los calendarios
    const calendars = await calendarService.getCalendars();
    
    // Identificar calendario primario
    const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];
    
    // Obtener información de la cuenta desde el calendario primario
    const accountInfo = {
      email: primaryCalendar?.id === 'primary' ? primaryCalendar.summary : primaryCalendar?.id,
      displayName: primaryCalendar?.summary,
      totalCalendars: calendars.length,
      primaryCalendarId: primaryCalendar?.id,
      primaryCalendarName: primaryCalendar?.summary,
      accessRole: primaryCalendar?.accessRole,
      timeZone: primaryCalendar?.timeZone || 'Europe/Madrid'
    };

    // Obtener calendarios organizados por tipo
    const calendarsByType = {
      primary: calendars.filter(cal => cal.primary),
      owned: calendars.filter(cal => cal.accessRole === 'owner' && !cal.primary),
      shared: calendars.filter(cal => cal.accessRole === 'writer' || cal.accessRole === 'reader'),
      subscription: calendars.filter(cal => cal.accessRole === 'freeBusyReader')
    };

    logger.info(`Account info retrieved for: ${accountInfo.email}`);

    return NextResponse.json({
      account: accountInfo,
      calendars: calendars,
      calendarsByType,
      summary: {
        totalCalendars: calendars.length,
        ownedCalendars: calendarsByType.owned.length + calendarsByType.primary.length,
        sharedCalendars: calendarsByType.shared.length,
        subscriptionCalendars: calendarsByType.subscription.length
      }
    });

  } catch (error: any) {
    logger.error("Failed to fetch account information", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error fetching account information",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}