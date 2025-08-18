import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

/**
 * GET /api/meet/rooms/[id]/recordings
 * Obtiene todas las grabaciones de un espacio de Meet basado en sus conference records
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

    console.log(`🎥 Getting recordings for space ${spaceId}`);

    // Primero obtener los conference records del espacio
    const filter = `space.name="spaces/${spaceId}"`;
    const conferenceRecordsUrl = new URL('https://meet.googleapis.com/v2/conferenceRecords');
    conferenceRecordsUrl.searchParams.append('filter', filter);
    conferenceRecordsUrl.searchParams.append('pageSize', '50'); // Más registros para buscar grabaciones

    const conferenceResponse = await fetch(conferenceRecordsUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'application/json'
      }
    });

    if (!conferenceResponse.ok) {
      console.error(`Failed to get conference records: ${conferenceResponse.status}`);
      return NextResponse.json({
        recordings: [],
        message: "No se pudieron obtener los registros de conferencias"
      });
    }

    const conferenceData = await conferenceResponse.json();
    const conferenceRecords = conferenceData.conferenceRecords || [];

    console.log(`📊 Found ${conferenceRecords.length} conference records`);

    // Obtener grabaciones para cada conference record
    const allRecordings: any[] = [];
    
    for (const record of conferenceRecords) {
      try {
        const recordingsUrl = `https://meet.googleapis.com/v2/${record.name}/recordings`;
        
        const recordingsResponse = await fetch(recordingsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.token}`,
            'Accept': 'application/json'
          }
        });

        if (recordingsResponse.ok) {
          const recordingsData = await recordingsResponse.json();
          const recordings = recordingsData.recordings || [];
          
          // Agregar información del conference record a cada grabación
          recordings.forEach((recording: any) => {
            allRecordings.push({
              ...recording,
              conferenceRecord: record.name,
              conferenceStartTime: record.startTime,
              conferenceEndTime: record.endTime,
              recordId: recording.name?.split('/').pop(),
              conferenceRecordId: record.name?.split('/').pop(),
              // Calcular duración de la grabación si está disponible
              duration: recording.startTime && recording.endTime ? 
                Math.round((new Date(recording.endTime).getTime() - new Date(recording.startTime).getTime()) / (1000 * 60)) : null
            });
          });
          
          console.log(`📹 Found ${recordings.length} recordings for conference ${record.name.split('/').pop()}`);
        } else {
          console.log(`No recordings found for conference ${record.name.split('/').pop()}`);
        }
      } catch (error) {
        console.error(`Error getting recordings for ${record.name}:`, error);
      }
    }

    // Ordenar grabaciones por fecha más reciente primero
    allRecordings.sort((a, b) => {
      const dateA = new Date(a.startTime || a.conferenceStartTime || 0);
      const dateB = new Date(b.startTime || b.conferenceStartTime || 0);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`✅ Retrieved ${allRecordings.length} total recordings for space ${spaceId}`);

    return NextResponse.json({
      recordings: allRecordings,
      totalRecordings: allRecordings.length,
      spaceId: spaceId,
      conferenceRecordsChecked: conferenceRecords.length
    });

  } catch (error: any) {
    console.error("Failed to get recordings:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error getting recordings",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}