import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

/**
 * GET /api/meet/rooms/[id]/participants-report
 * Obtiene un reporte detallado de participantes con todas las sesiones y métricas
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

    console.log(`📊 Getting detailed participants report for space ${spaceId}`);

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
        participants: [],
        message: "No se pudieron obtener los registros de conferencias"
      });
    }

    const conferenceData = await conferenceResponse.json();
    const conferenceRecords = conferenceData.conferenceRecords || [];

    // Reporte detallado de participantes
    const detailedParticipants: any[] = [];
    const participantSummary: { [key: string]: any } = {};
    
    for (const record of conferenceRecords) {
      try {
        // Obtener participantes de la conferencia
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
              // Obtener todas las sesiones del participante
              const sessionsUrl = `https://meet.googleapis.com/v2/${participant.name}/participantSessions`;
              
              const sessionsResponse = await fetch(sessionsUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token.token}`,
                  'Accept': 'application/json'
                }
              });

              let sessions = [];
              let sessionDetails = [];
              
              if (sessionsResponse.ok) {
                const sessionsData = await sessionsResponse.json();
                sessions = sessionsData.participantSessions || [];
                
                // Procesar cada sesión para obtener métricas detalladas
                sessionDetails = sessions.map((session: any) => {
                  const startTime = new Date(session.startTime);
                  const endTime = session.endTime ? new Date(session.endTime) : null;
                  const duration = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) : null;
                  
                  return {
                    startTime: session.startTime,
                    endTime: session.endTime,
                    duration: duration,
                    isActive: !session.endTime,
                    sessionName: session.name,
                    // Calcular tiempo del día
                    timeOfDay: startTime.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      timeZone: 'Europe/Madrid'
                    }),
                    dayOfWeek: startTime.toLocaleDateString('es-ES', { 
                      weekday: 'long',
                      timeZone: 'Europe/Madrid'
                    })
                  };
                });
              }

              // Identificar tipo de usuario y obtener información
              let userInfo = {
                type: 'unknown',
                displayName: 'Usuario desconocido',
                identifier: null,
                email: null
              };

              if (participant.signedinUser) {
                userInfo = {
                  type: 'signed_in',
                  displayName: participant.signedinUser.displayName,
                  identifier: participant.signedinUser.user,
                  email: null // No disponible directamente en la API
                };
              } else if (participant.anonymousUser) {
                userInfo = {
                  type: 'anonymous',
                  displayName: participant.anonymousUser.displayName,
                  identifier: null,
                  email: null
                };
              } else if (participant.phoneUser) {
                userInfo = {
                  type: 'phone',
                  displayName: participant.phoneUser.displayName,
                  identifier: null,
                  email: null
                };
              }

              // Calcular métricas del participante
              const totalDuration = sessionDetails.reduce((sum: number, session: any) => sum + (session.duration || 0), 0);
              const avgSessionDuration = sessionDetails.length > 0 ? Math.round(totalDuration / sessionDetails.length) : 0;
              
              // Calcular duración total de la conferencia
              const conferenceStart = new Date(record.startTime);
              const conferenceEnd = record.endTime ? new Date(record.endTime) : new Date();
              const conferenceDuration = Math.round((conferenceEnd.getTime() - conferenceStart.getTime()) / (1000 * 60));
              
              // Calcular porcentaje de participación
              const participationPercentage = conferenceDuration > 0 ? Math.round((totalDuration / conferenceDuration) * 100) : 0;

              const participantDetails = {
                // Información básica
                name: participant.name,
                participantId: participant.name?.split('/').pop(),
                conferenceRecord: record.name,
                conferenceRecordId: record.name?.split('/').pop(),
                conferenceStartTime: record.startTime,
                conferenceEndTime: record.endTime,
                conferenceDuration: conferenceDuration,
                
                // Información del usuario
                userInfo: userInfo,
                
                // Tiempos de participación
                earliestStartTime: participant.earliestStartTime,
                latestEndTime: participant.latestEndTime,
                
                // Métricas de sesiones
                totalSessions: sessions.length,
                totalDurationMinutes: totalDuration,
                avgSessionDuration: avgSessionDuration,
                participationPercentage: participationPercentage,
                
                // Detalles de sesiones
                sessions: sessionDetails,
                
                // Información adicional
                joinedEarly: participant.earliestStartTime < record.startTime,
                leftEarly: participant.latestEndTime && record.endTime && participant.latestEndTime < record.endTime,
                stillActive: !participant.latestEndTime,
                
                // Dispositivos utilizados (inferido del tipo de usuario)
                deviceTypes: [userInfo.type === 'phone' ? 'phone' : 'computer'],
                
                // Fecha formateada
                meetingDate: new Date(record.startTime).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              };

              detailedParticipants.push(participantDetails);

              // Agregar al resumen por participante
              const key = userInfo.displayName;
              if (!participantSummary[key]) {
                participantSummary[key] = {
                  displayName: userInfo.displayName,
                  userType: userInfo.type,
                  identifier: userInfo.identifier,
                  totalMeetings: 0,
                  totalDurationMinutes: 0,
                  totalSessions: 0,
                  avgParticipationPercentage: 0,
                  firstSeen: participantDetails.conferenceStartTime,
                  lastSeen: participantDetails.conferenceStartTime,
                  meetingDates: []
                };
              }
              
              participantSummary[key].totalMeetings++;
              participantSummary[key].totalDurationMinutes += totalDuration;
              participantSummary[key].totalSessions += sessions.length;
              participantSummary[key].avgParticipationPercentage += participationPercentage;
              participantSummary[key].meetingDates.push(participantDetails.meetingDate);
              
              // Actualizar fechas
              if (new Date(participantDetails.conferenceStartTime) < new Date(participantSummary[key].firstSeen)) {
                participantSummary[key].firstSeen = participantDetails.conferenceStartTime;
              }
              if (new Date(participantDetails.conferenceStartTime) > new Date(participantSummary[key].lastSeen)) {
                participantSummary[key].lastSeen = participantDetails.conferenceStartTime;
              }
              
            } catch (sessionError) {
              console.error(`Error getting sessions for participant ${participant.name}:`, sessionError);
            }
          }
          
          console.log(`👥 Processed ${participants.length} participants for conference ${record.name.split('/').pop()}`);
        }
      } catch (error) {
        console.error(`Error processing conference ${record.name}:`, error);
      }
    }

    // Finalizar resumen de participantes
    const summaryArray = Object.values(participantSummary).map((summary: any) => ({
      ...summary,
      avgParticipationPercentage: summary.totalMeetings > 0 ? Math.round(summary.avgParticipationPercentage / summary.totalMeetings) : 0
    })).sort((a: any, b: any) => b.totalDurationMinutes - a.totalDurationMinutes);

    // Ordenar participantes por fecha más reciente
    detailedParticipants.sort((a, b) => {
      const dateA = new Date(a.conferenceStartTime);
      const dateB = new Date(b.conferenceStartTime);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`✅ Generated detailed report with ${detailedParticipants.length} participant records`);

    return NextResponse.json({
      participants: detailedParticipants,
      participantsSummary: summaryArray,
      totalParticipantRecords: detailedParticipants.length,
      uniqueParticipants: summaryArray.length,
      conferenceRecordsAnalyzed: conferenceRecords.length,
      spaceId: spaceId,
      reportGeneratedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Failed to generate participants report:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error generating participants report",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}