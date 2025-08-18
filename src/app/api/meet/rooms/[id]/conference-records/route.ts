import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

/**
 * GET /api/meet/rooms/[id]/conference-records
 * Obtiene el historial de reuniones (conference records) de un espacio de Meet
 */
export async function GET(
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

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const pageSize = searchParams.get('pageSize') || '10';
    const pageToken = searchParams.get('pageToken') || '';

    // Construir filtro para obtener solo las reuniones de este espacio
    const filter = `space.name="spaces/${spaceId}"`;
    
    // Obtener conference records del espacio
    const conferenceRecordsUrl = new URL('https://meet.googleapis.com/v2/conferenceRecords');
    conferenceRecordsUrl.searchParams.append('filter', filter);
    conferenceRecordsUrl.searchParams.append('pageSize', pageSize);
    if (pageToken) {
      conferenceRecordsUrl.searchParams.append('pageToken', pageToken);
    }

    const response = await fetch(conferenceRecordsUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get conference records: ${response.status}`, errorText);
      
      // Si es 404, probablemente no hay registros
      if (response.status === 404) {
        return NextResponse.json({
          conferenceRecords: [],
          totalRecords: 0,
          message: "No se encontraron reuniones para este espacio"
        });
      }
      
      return NextResponse.json({
        error: `Failed to get conference records: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Procesar los conference records para agregar información útil
    const processedRecords = (data.conferenceRecords || []).map((record: any) => {
      // Calcular duración si hay startTime y endTime
      let duration = null;
      if (record.startTime && record.endTime) {
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);
        duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // en minutos
      }

      return {
        name: record.name,
        startTime: record.startTime,
        endTime: record.endTime,
        expireTime: record.expireTime,
        space: record.space,
        duration: duration,
        // El ID del record para usar en otros endpoints
        recordId: record.name?.split('/').pop()
      };
    });

    console.log(`✅ Retrieved ${processedRecords.length} conference records for space ${spaceId}`);

    return NextResponse.json({
      conferenceRecords: processedRecords,
      nextPageToken: data.nextPageToken,
      totalRecords: processedRecords.length,
      spaceId: spaceId
    });

  } catch (error: any) {
    console.error("Failed to get conference records:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error getting conference records",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}