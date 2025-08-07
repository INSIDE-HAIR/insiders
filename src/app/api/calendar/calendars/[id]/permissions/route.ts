import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

export async function GET(
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

    const calendarId = params.id;
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    try {
      const calendarInfo = await calendarService.getCalendar(calendarId);

      const permissions = {
        calendarId,
        summary: calendarInfo.summary,
        accessRole: calendarInfo.accessRole,
        canRead: true,
        canWrite:
          calendarInfo.accessRole === "owner" ||
          calendarInfo.accessRole === "writer",
        canDelete: calendarInfo.accessRole === "owner",
        isOwner: calendarInfo.accessRole === "owner",
        isPrimary: calendarInfo.primary || false,
      };

      return NextResponse.json({
        success: true,
        permissions,
      });
    } catch (calendarError: any) {
      // Si no se puede obtener el calendario, probablemente no existe o no hay acceso
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo verificar los permisos del calendario",
          details: calendarError.message,
        },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Error checking calendar permissions:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
