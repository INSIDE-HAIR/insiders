import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

/**
 * GET /api/meet/rooms/[id]/smart-notes
 * Obtiene las notas inteligentes de Gemini para las sesiones de Meet
 * Nota: Esta es una implementación mock ya que la API de Google Meet no tiene endpoint dedicado para smart notes
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

    console.log(`🤖 Getting smart notes for space ${spaceId}`);

    // Obtener conference records del espacio
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
        smartNotes: [],
        message: "No se pudieron obtener los registros de conferencias"
      });
    }

    const conferenceData = await conferenceResponse.json();
    const conferenceRecords = conferenceData.conferenceRecords || [];

    // Mock smart notes data basado en las sesiones reales
    const smartNotes: any[] = [];
    
    for (const record of conferenceRecords) {
      try {
        // Crear notas mock basadas en la duración y datos de la sesión
        const conferenceStart = new Date(record.startTime);
        const conferenceEnd = record.endTime ? new Date(record.endTime) : new Date();
        const durationMinutes = Math.round((conferenceEnd.getTime() - conferenceStart.getTime()) / (1000 * 60));
        
        // Generar contenido de notas mock realista
        const topics = [
          "Revisión de objetivos del proyecto",
          "Análisis de métricas de rendimiento", 
          "Planificación de próximas iteraciones",
          "Resolución de problemas técnicos",
          "Coordinación entre equipos",
          "Evaluación de riesgos y mitigaciones"
        ];
        
        const actions = [
          "Actualizar documentación técnica",
          "Programar reunión de seguimiento",
          "Revisar implementación de funcionalidades",
          "Contactar con stakeholders externos",
          "Preparar presentación para dirección"
        ];

        const smartNote = {
          conferenceRecord: record.name,
          conferenceRecordId: record.name?.split('/').pop(),
          startTime: record.startTime,
          endTime: record.endTime,
          duration: durationMinutes,
          spaceId: spaceId,
          
          // Contenido de las notas inteligentes (mock)
          summary: `Reunión de ${durationMinutes} minutos realizada el ${conferenceStart.toLocaleDateString('es-ES')}. Se cubrieron ${Math.min(3, Math.ceil(durationMinutes / 15))} temas principales y se identificaron ${Math.min(2, Math.ceil(durationMinutes / 20))} acciones de seguimiento.`,
          
          keyTopics: topics.slice(0, Math.min(4, Math.ceil(durationMinutes / 15))).map((topic, index) => ({
            topic: topic,
            timestamp: `${Math.floor(index * (durationMinutes / 4))} min`,
            importance: Math.random() > 0.5 ? 'high' : 'medium'
          })),
          
          actionItems: actions.slice(0, Math.min(3, Math.ceil(durationMinutes / 20))).map((action, index) => ({
            action: action,
            assignee: `Participante ${index + 1}`,
            priority: Math.random() > 0.6 ? 'high' : 'medium',
            dueDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] // +7 días
          })),
          
          // Insights de la reunión
          insights: {
            participationLevel: Math.random() > 0.5 ? 'Alta' : 'Media',
            meetingEffectiveness: Math.round(70 + Math.random() * 25), // 70-95%
            recommendedFollowUp: durationMinutes > 30 ? 'Reunión de seguimiento recomendada' : 'Seguimiento por email suficiente'
          },
          
          // Transcripción procesada (simulada)
          processedTranscript: {
            wordCount: Math.round(durationMinutes * 150), // ~150 palabras por minuto
            speakerAnalysis: [
              { speaker: 'Moderador', timePercentage: 45, mainTopics: ['Agenda', 'Coordinación'] },
              { speaker: 'Participante 1', timePercentage: 30, mainTopics: ['Desarrollo', 'Implementación'] },
              { speaker: 'Participante 2', timePercentage: 25, mainTopics: ['Testing', 'QA'] }
            ]
          },
          
          // Metadatos
          generatedAt: new Date().toISOString(),
          version: '1.0',
          language: 'es-ES',
          confidence: Math.round(85 + Math.random() * 10), // 85-95%
          
          // Enlaces de descarga (mock)
          downloadLinks: {
            summary: `/api/meet/rooms/${spaceId}/smart-notes/${record.name?.split('/').pop()}/summary.pdf`,
            fullReport: `/api/meet/rooms/${spaceId}/smart-notes/${record.name?.split('/').pop()}/report.pdf`,
            actionItems: `/api/meet/rooms/${spaceId}/smart-notes/${record.name?.split('/').pop()}/actions.csv`
          },
          
          // Información para la UI
          sessionDate: conferenceStart.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          }),
          sessionTime: conferenceStart.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Madrid'
          }),
          status: record.endTime ? 'Completado' : 'En proceso',
          isActive: !record.endTime
        };

        smartNotes.push(smartNote);
        console.log(`🤖 Generated smart notes for conference ${record.name.split('/').pop()}`);
        
      } catch (error) {
        console.error(`Error generating smart notes for conference ${record.name}:`, error);
      }
    }

    // Ordenar por fecha más reciente primero
    smartNotes.sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`✅ Generated ${smartNotes.length} smart notes for space ${spaceId}`);

    return NextResponse.json({
      smartNotes: smartNotes,
      totalNotes: smartNotes.length,
      spaceId: spaceId,
      generatedAt: new Date().toISOString(),
      apiVersion: 'mock-v1.0',
      disclaimer: "Las notas inteligentes son generadas mediante simulación ya que Google Meet API no proporciona endpoint dedicado para esta funcionalidad."
    });

  } catch (error: any) {
    console.error("Failed to get smart notes:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error getting smart notes",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}