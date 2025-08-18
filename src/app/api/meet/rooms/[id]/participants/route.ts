import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

/**
 * GET /api/meet/rooms/[id]/participants
 * Obtiene el historial de participantes de un espacio de Meet basado en sus conference records
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

    console.log(`👥 Getting participants history for space ${spaceId}`);

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
        participantsHistory: [],
        message: "No se pudieron obtener los registros de conferencias"
      });
    }

    const conferenceData = await conferenceResponse.json();
    const conferenceRecords = conferenceData.conferenceRecords || [];

    console.log(`📊 Found ${conferenceRecords.length} conference records`);

    // Obtener participantes para cada conference record
    const allParticipants: any[] = [];
    const participantStats: { [key: string]: any } = {};
    
    for (const record of conferenceRecords) {
      try {
        const participantsUrl = `https://meet.googleapis.com/v2/${record.name}/participants`;
        
        const participantsResponse = await fetch(participantsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.token}`,
            'Accept': 'application/json'
          }
        });

        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json();
          const participants = participantsData.participants || [];
          
          for (const participant of participants) {
            try {
              // Obtener sesiones del participante para más detalles
              const sessionsUrl = `https://meet.googleapis.com/v2/${participant.name}/sessions`;
              
              const sessionsResponse = await fetch(sessionsUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token.token}`,
                  'Accept': 'application/json'
                }
              });

              let sessions = [];
              let totalDuration = 0;
              
              if (sessionsResponse.ok) {
                const sessionsData = await sessionsResponse.json();
                sessions = sessionsData.participantSessions || [];
                
                // Calcular duración total de participación
                sessions.forEach((session: any) => {
                  if (session.startTime && session.endTime) {
                    const sessionDuration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
                    totalDuration += sessionDuration;
                  }
                });
              }

              const participantData = {
                ...participant,
                conferenceRecord: record.name,
                conferenceStartTime: record.startTime,
                conferenceEndTime: record.endTime,
                participantId: participant.name?.split('/').pop(),
                conferenceRecordId: record.name?.split('/').pop(),
                sessions: sessions,
                totalDurationMinutes: Math.round(totalDuration),
                // Información de identificación del participante
                displayName: participant.anonymousUser?.displayName || 
                            participant.phoneUser?.displayName || 
                            participant.signalingId || 
                            'Usuario anónimo',
                userType: participant.anonymousUser ? 'anonymous' : 
                         participant.phoneUser ? 'phone' : 'authenticated'
              };

              allParticipants.push(participantData);

              // Acumular estadísticas por participante
              const key = participantData.displayName;
              if (!participantStats[key]) {
                participantStats[key] = {
                  displayName: participantData.displayName,
                  userType: participantData.userType,
                  totalMeetings: 0,
                  totalDurationMinutes: 0,
                  firstSeen: participantData.conferenceStartTime,
                  lastSeen: participantData.conferenceStartTime
                };
              }
              
              participantStats[key].totalMeetings++;
              participantStats[key].totalDurationMinutes += participantData.totalDurationMinutes;
              
              // Actualizar fechas
              if (new Date(participantData.conferenceStartTime) < new Date(participantStats[key].firstSeen)) {
                participantStats[key].firstSeen = participantData.conferenceStartTime;
              }
              if (new Date(participantData.conferenceStartTime) > new Date(participantStats[key].lastSeen)) {
                participantStats[key].lastSeen = participantData.conferenceStartTime;
              }
              
            } catch (sessionError) {
              console.error(`Error getting sessions for participant ${participant.name}:`, sessionError);
              // Agregar participante sin datos de sesión
              allParticipants.push({
                ...participant,
                conferenceRecord: record.name,
                conferenceStartTime: record.startTime,
                conferenceEndTime: record.endTime,
                participantId: participant.name?.split('/').pop(),
                conferenceRecordId: record.name?.split('/').pop(),
                sessions: [],
                totalDurationMinutes: 0,
                displayName: participant.anonymousUser?.displayName || 
                            participant.phoneUser?.displayName || 
                            participant.signalingId || 
                            'Usuario anónimo',
                userType: participant.anonymousUser ? 'anonymous' : 
                         participant.phoneUser ? 'phone' : 'authenticated'
              });
            }
          }
          
          console.log(`👤 Found ${participants.length} participants for conference ${record.name.split('/').pop()}`);
        } else {
          console.log(`No participants found for conference ${record.name.split('/').pop()}`);
        }
      } catch (error) {
        console.error(`Error getting participants for ${record.name}:`, error);
      }
    }

    // Ordenar participantes por fecha más reciente primero
    allParticipants.sort((a, b) => {
      const dateA = new Date(a.conferenceStartTime || 0);
      const dateB = new Date(b.conferenceStartTime || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Convertir estadísticas a array y ordenar por total de reuniones
    const statsArray = Object.values(participantStats).sort((a: any, b: any) => b.totalMeetings - a.totalMeetings);

    console.log(`✅ Retrieved ${allParticipants.length} participant records for space ${spaceId}`);

    return NextResponse.json({
      participantsHistory: allParticipants,
      participantStats: statsArray,
      totalParticipantRecords: allParticipants.length,
      uniqueParticipants: statsArray.length,
      spaceId: spaceId,
      conferenceRecordsChecked: conferenceRecords.length
    });

  } catch (error: any) {
    console.error("Failed to get participants history:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error getting participants history",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}