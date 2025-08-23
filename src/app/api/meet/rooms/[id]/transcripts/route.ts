import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

/**
 * GET /api/meet/rooms/[id]/transcripts
 * Obtiene todas las transcripciones de un espacio de Meet basado en sus conference records
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

    console.log(`📝 Getting transcripts for space ${spaceId}`);

    // Primero obtener los conference records del espacio
    const filter = `space.name="spaces/${spaceId}"`;
    const conferenceRecordsUrl = new URL('https://meet.googleapis.com/v2/conferenceRecords');
    conferenceRecordsUrl.searchParams.append('filter', filter);
    conferenceRecordsUrl.searchParams.append('pageSize', '50');

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
        transcripts: [],
        message: "No se pudieron obtener los registros de conferencias"
      });
    }

    const conferenceData = await conferenceResponse.json();
    const conferenceRecords = conferenceData.conferenceRecords || [];

    console.log(`📊 Found ${conferenceRecords.length} conference records`);

    // Obtener transcripciones para cada conference record
    const allTranscripts: any[] = [];
    
    for (const record of conferenceRecords) {
      try {
        const transcriptsUrl = `https://meet.googleapis.com/v2/${record.name}/transcripts`;
        
        const transcriptsResponse = await fetch(transcriptsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.token}`,
            'Accept': 'application/json'
          }
        });

        if (transcriptsResponse.ok) {
          const transcriptsData = await transcriptsResponse.json();
          const transcripts = transcriptsData.transcripts || [];
          
          // Agregar información del conference record a cada transcripción
          for (const transcript of transcripts) {
            try {
              // Obtener más detalles de la transcripción si está disponible
              let transcriptEntries = [];
              const entriesUrl = `https://meet.googleapis.com/v2/${transcript.name}/entries?pageSize=5`; // Solo primeras 5 entradas para preview
              
              const entriesResponse = await fetch(entriesUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token.token}`,
                  'Accept': 'application/json'
                }
              });

              if (entriesResponse.ok) {
                const entriesData = await entriesResponse.json();
                transcriptEntries = entriesData.entries || [];
              }

              const docsDocument = transcript.docsDestination?.document || null;
              const docsExportUri = transcript.docsDestination?.exportUri || null;
              
              console.log(`📄 Processing transcript ${transcript.name?.split('/').pop()}:`, {
                state: transcript.state,
                docsDocument,
                docsExportUri,
                hasDocsDestination: !!transcript.docsDestination,
                entriesCount: transcriptEntries.length
              });
              
              allTranscripts.push({
                ...transcript,
                conferenceRecord: record.name,
                conferenceStartTime: record.startTime,
                conferenceEndTime: record.endTime,
                transcriptId: transcript.name?.split('/').pop(),
                conferenceRecordId: record.name?.split('/').pop(),
                // Preview de las primeras entradas
                entriesPreview: transcriptEntries.slice(0, 3).map((entry: any) => ({
                  participant: entry.participant,
                  text: entry.text?.substring(0, 100) + (entry.text?.length > 100 ? '...' : ''),
                  startTime: entry.startTime
                })),
                totalEntries: transcriptEntries.length,
                // Calcular duración si está disponible
                duration: transcript.startTime && transcript.endTime ? 
                  Math.round((new Date(transcript.endTime).getTime() - new Date(transcript.startTime).getTime()) / (1000 * 60)) : null,
                // Extraer campos necesarios de Google Meet API
                document: docsDocument, // Google Docs document ID
                exportUri: docsExportUri, // URL para abrir en Google Docs
              });
            } catch (entryError) {
              // Si no podemos obtener las entradas, agregar la transcripción sin preview
              allTranscripts.push({
                ...transcript,
                conferenceRecord: record.name,
                conferenceStartTime: record.startTime,
                conferenceEndTime: record.endTime,
                transcriptId: transcript.name?.split('/').pop(),
                conferenceRecordId: record.name?.split('/').pop(),
                entriesPreview: [],
                totalEntries: 0,
                // Extraer campos necesarios de Google Meet API
                document: transcript.docsDestination?.document || null, // Google Docs document ID
                exportUri: transcript.docsDestination?.exportUri || null, // URL para abrir en Google Docs
              });
            }
          }
          
          console.log(`📄 Found ${transcripts.length} transcripts for conference ${record.name.split('/').pop()}`);
        } else {
          console.log(`No transcripts found for conference ${record.name.split('/').pop()}`);
        }
      } catch (error) {
        console.error(`Error getting transcripts for ${record.name}:`, error);
      }
    }

    // Ordenar transcripciones por fecha más reciente primero
    allTranscripts.sort((a, b) => {
      const dateA = new Date(a.startTime || a.conferenceStartTime || 0);
      const dateB = new Date(b.startTime || b.conferenceStartTime || 0);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`✅ Retrieved ${allTranscripts.length} total transcripts for space ${spaceId}`);

    return NextResponse.json({
      transcripts: allTranscripts,
      totalTranscripts: allTranscripts.length,
      spaceId: spaceId,
      conferenceRecordsChecked: conferenceRecords.length
    });

  } catch (error: any) {
    console.error("Failed to get transcripts:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error getting transcripts",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}