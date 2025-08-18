import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

/**
 * GET /api/meet/rooms/[id]/participants-by-session
 * Obtiene participantes agrupados por sesión/conferencia
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

    console.log(`👥 Getting participants by session for space ${spaceId}`);

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
        sessions: [],
        message: "No se pudieron obtener los registros de conferencias"
      });
    }

    const conferenceData = await conferenceResponse.json();
    const conferenceRecords = conferenceData.conferenceRecords || [];

    // Procesar cada sesión/conferencia
    const sessionParticipants: any[] = [];
    
    for (const record of conferenceRecords) {
      try {
        // Obtener participantes de esta conferencia
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
          
          // Procesar participantes de esta sesión
          const sessionParticipantsList = [];
          
          for (const participant of participants) {
            try {
              // Obtener sesiones del participante para calcular tiempo total en esta conferencia
              const sessionsUrl = `https://meet.googleapis.com/v2/${participant.name}/participantSessions`;
              
              const sessionsResponse = await fetch(sessionsUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token.token}`,
                  'Accept': 'application/json'
                }
              });

              let totalDurationInThisConference = 0;
              let sessionsInThisConference = [];
              
              if (sessionsResponse.ok) {
                const sessionsData = await sessionsResponse.json();
                const sessions = sessionsData.participantSessions || [];
                
                // Calcular tiempo total en esta conferencia específica
                sessionsInThisConference = sessions.map((session: any) => {
                  const startTime = new Date(session.startTime);
                  const endTime = session.endTime ? new Date(session.endTime) : null;
                  const duration = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) : null;
                  
                  if (duration) {
                    totalDurationInThisConference += duration;
                  }
                  
                  return {
                    startTime: session.startTime,
                    endTime: session.endTime,
                    duration: duration,
                    isActive: !session.endTime
                  };
                });
              }

              // Determinar tipo de usuario
              let userInfo = {
                type: 'unknown',
                displayName: 'Usuario desconocido',
                identifier: null
              };

              if (participant.signedinUser) {
                userInfo = {
                  type: 'signed_in',
                  displayName: participant.signedinUser.displayName,
                  identifier: participant.signedinUser.user
                };
              } else if (participant.anonymousUser) {
                userInfo = {
                  type: 'anonymous',
                  displayName: participant.anonymousUser.displayName,
                  identifier: null
                };
              } else if (participant.phoneUser) {
                userInfo = {
                  type: 'phone',
                  displayName: participant.phoneUser.displayName,
                  identifier: null
                };
              }

              // Calcular tiempo de entrada y salida en esta conferencia
              const joinTime = participant.earliestStartTime ? 
                new Date(participant.earliestStartTime).toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'Europe/Madrid'
                }) : 'Desconocida';

              const leaveTime = participant.latestEndTime ? 
                new Date(participant.latestEndTime).toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'Europe/Madrid'
                }) : 'Aún conectado';

              sessionParticipantsList.push({
                name: participant.name,
                participantId: participant.name?.split('/').pop(),
                userInfo: userInfo,
                totalDurationMinutes: totalDurationInThisConference,
                joinTime: joinTime,
                leaveTime: leaveTime,
                earliestStartTime: participant.earliestStartTime,
                latestEndTime: participant.latestEndTime,
                sessionsCount: sessionsInThisConference.length,
                sessions: sessionsInThisConference,
                isStillActive: !participant.latestEndTime,
                // Información adicional
                joinedEarly: participant.earliestStartTime && new Date(participant.earliestStartTime) < new Date(record.startTime),
                leftEarly: participant.latestEndTime && record.endTime && new Date(participant.latestEndTime) < new Date(record.endTime)
              });
              
            } catch (sessionError) {
              console.error(`Error getting sessions for participant ${participant.name}:`, sessionError);
              // Agregar participante sin datos de sesión
              let userInfo = {
                type: 'unknown',
                displayName: 'Usuario desconocido',
                identifier: null
              };

              if (participant.signedinUser) {
                userInfo = {
                  type: 'signed_in',
                  displayName: participant.signedinUser.displayName,
                  identifier: participant.signedinUser.user
                };
              } else if (participant.anonymousUser) {
                userInfo = {
                  type: 'anonymous',
                  displayName: participant.anonymousUser.displayName,
                  identifier: null
                };
              } else if (participant.phoneUser) {
                userInfo = {
                  type: 'phone',
                  displayName: participant.phoneUser.displayName,
                  identifier: null
                };
              }

              sessionParticipantsList.push({
                name: participant.name,
                participantId: participant.name?.split('/').pop(),
                userInfo: userInfo,
                totalDurationMinutes: 0,
                joinTime: 'Desconocida',
                leaveTime: 'Desconocida',
                earliestStartTime: participant.earliestStartTime,
                latestEndTime: participant.latestEndTime,
                sessionsCount: 0,
                sessions: [],
                isStillActive: !participant.latestEndTime,
                joinedEarly: false,
                leftEarly: false
              });
            }
          }

          // Calcular estadísticas de la sesión
          const conferenceStart = new Date(record.startTime);
          const conferenceEnd = record.endTime ? new Date(record.endTime) : new Date();
          const conferenceDurationMinutes = Math.round((conferenceEnd.getTime() - conferenceStart.getTime()) / (1000 * 60));
          
          // Ordenar participantes por tiempo de participación (mayor a menor)
          sessionParticipantsList.sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);

          const sessionData = {
            // Información de la conferencia/sesión
            conferenceRecord: record.name,
            conferenceRecordId: record.name?.split('/').pop(),
            startTime: record.startTime,
            endTime: record.endTime,
            duration: conferenceDurationMinutes,
            spaceId: spaceId,
            
            // Información de participantes
            participants: sessionParticipantsList,
            participantCount: sessionParticipantsList.length,
            
            // Estadísticas de la sesión
            totalParticipationMinutes: sessionParticipantsList.reduce((sum, p) => sum + p.totalDurationMinutes, 0),
            averageParticipationMinutes: sessionParticipantsList.length > 0 ? 
              Math.round(sessionParticipantsList.reduce((sum, p) => sum + p.totalDurationMinutes, 0) / sessionParticipantsList.length) : 0,
            activeParticipants: sessionParticipantsList.filter(p => p.isStillActive).length,
            
            // Fecha formateada para la UI
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
            sessionDateTime: `${conferenceStart.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            })}, ${conferenceStart.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Madrid'
            })}`,
            
            // Estado de la sesión
            isActive: !record.endTime,
            hasRecording: false, // Se podría calcular consultando recordings
            hasTranscript: false // Se podría calcular consultando transcripts
          };

          sessionParticipants.push(sessionData);
          
          console.log(`📅 Processed session ${record.name.split('/').pop()} with ${sessionParticipantsList.length} participants`);
        } else {
          console.log(`No participants found for conference ${record.name.split('/').pop()}`);
        }
      } catch (error) {
        console.error(`Error processing conference ${record.name}:`, error);
      }
    }

    // Ordenar sesiones por fecha más reciente primero
    sessionParticipants.sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`✅ Retrieved ${sessionParticipants.length} sessions with participants for space ${spaceId}`);

    return NextResponse.json({
      sessions: sessionParticipants,
      totalSessions: sessionParticipants.length,
      totalUniqueParticipants: [...new Set(sessionParticipants.flatMap(s => s.participants.map((p: any) => p.userInfo.displayName)))].length,
      spaceId: spaceId,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Failed to get participants by session:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error getting participants by session",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}