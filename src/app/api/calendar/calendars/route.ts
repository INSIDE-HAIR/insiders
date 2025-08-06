import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { ApiKeyAuth } from "@/src/middleware/api-key-auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { Logger } from "@/src/features/calendar/utils/logger";

const logger = new Logger("API:Calendars");

/**
 * GET /api/calendar/calendars
 * Lista todos los calendarios disponibles
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación por sesión o API Key
    const session = await auth();
    const apiKeyValidation = await ApiKeyAuth.validateApiKey(request);

    let isAuthenticated = false;
    let authMethod = "none";
    let userId = null;

    if (session?.user) {
      isAuthenticated = true;
      authMethod = "session";
      userId = session.user.id;
      logger.info(`Authenticated via session: ${userId}`);
    } else if (apiKeyValidation.valid && apiKeyValidation.context) {
      isAuthenticated = true;
      authMethod = "api_key";
      userId = apiKeyValidation.context.userId;
      logger.info(`Authenticated via API Key: ${userId}`);
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin (solo para sesión, las API Keys ya están validadas)
    if (authMethod === "session" && session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    logger.info(`Fetching calendars list via ${authMethod}`);

    // Inicializar servicio de Calendar
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener calendarios
    const calendars = await calendarService.getCalendars();

    logger.info(`Found ${calendars.length} calendars`);

    return NextResponse.json({
      calendars,
      total: calendars.length,
      auth: {
        method: authMethod,
        userId: userId,
      },
    });
  } catch (error: any) {
    logger.error("Failed to fetch calendars", error);

    return NextResponse.json(
      {
        error: error.message || "Error fetching calendars",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
