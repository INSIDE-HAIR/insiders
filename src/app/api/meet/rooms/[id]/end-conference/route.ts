import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

/**
 * POST /api/meet/rooms/[id]/end-conference
 * Termina la conferencia activa de un espacio de Meet
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: spaceId } = await params;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener token
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 500 });
    }

    console.log(`🛑 Attempting to end active conference for space ${spaceId}`);

    // Primero verificar si hay una conferencia activa
    const spaceResponse = await fetch(`https://meet.googleapis.com/v2/spaces/${spaceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'application/json'
      }
    });

    if (!spaceResponse.ok) {
      const errorText = await spaceResponse.text();
      console.error(`Failed to get space details: ${spaceResponse.status}`, errorText);
      return NextResponse.json({
        error: `Failed to get space details: ${spaceResponse.status} ${spaceResponse.statusText}`,
        details: errorText
      }, { status: spaceResponse.status });
    }

    const spaceData = await spaceResponse.json();
    
    // Verificar si hay una conferencia activa
    if (!spaceData.activeConference?.conferenceRecord) {
      return NextResponse.json({
        success: false,
        message: "No hay una conferencia activa en este espacio",
        spaceId: spaceId
      });
    }

    const activeConferenceRecord = spaceData.activeConference.conferenceRecord;
    console.log(`📞 Found active conference: ${activeConferenceRecord}`);

    // Terminar la conferencia activa
    const endConferenceResponse = await fetch(
      `https://meet.googleapis.com/v2/spaces/${spaceId}:endActiveConference`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }
    );

    if (!endConferenceResponse.ok) {
      const errorText = await endConferenceResponse.text();
      console.error(`Failed to end conference: ${endConferenceResponse.status}`, errorText);
      
      // Manejar errores específicos
      if (endConferenceResponse.status === 404) {
        return NextResponse.json({
          success: false,
          message: "La conferencia ya no está activa o no se encontró",
          spaceId: spaceId
        });
      }
      
      if (endConferenceResponse.status === 403) {
        return NextResponse.json({
          success: false,
          message: "No tienes permisos para terminar esta conferencia",
          spaceId: spaceId
        }, { status: 403 });
      }
      
      return NextResponse.json({
        error: `Failed to end conference: ${endConferenceResponse.status} ${endConferenceResponse.statusText}`,
        details: errorText
      }, { status: endConferenceResponse.status });
    }

    const endResult = await endConferenceResponse.json();
    console.log(`✅ Conference ended successfully for space ${spaceId}`);

    // Verificar nuevamente el estado del espacio para confirmar
    const verifyResponse = await fetch(`https://meet.googleapis.com/v2/spaces/${spaceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'application/json'
      }
    });

    let newStatus = "unknown";
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      newStatus = verifyData.activeConference?.conferenceRecord ? "still_active" : "ended";
    }

    return NextResponse.json({
      success: true,
      message: "Conferencia terminada exitosamente",
      spaceId: spaceId,
      endedConferenceRecord: activeConferenceRecord,
      currentStatus: newStatus,
      endTime: new Date().toISOString(),
      result: endResult
    });

  } catch (error: any) {
    console.error("Failed to end conference:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error ending conference",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}