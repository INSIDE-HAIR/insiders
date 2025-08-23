import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { MeetMembersService } from "@/src/features/meet/services/MeetMembersService";
import type { 
  GoogleMeetConferenceRecord,
  GoogleMeetConferenceRecordsResponse,
  GoogleMeetParticipant,
  GoogleMeetParticipantsResponse,
  GoogleMeetParticipantSession,
  GoogleMeetParticipantSessionsResponse,
  ProcessedAttendee,
  ProcessedParticipantInfo,
  ParticipantRanking,
  AnalyticsResponse,
  ParticipantType
} from "@/src/features/meet/services/interfaces/GoogleMeetTypes";

/**
 * Convierte minutos a formato HH:MM:SS
 */
const formatMinutesToHMS = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const seconds = Math.floor((minutes % 1) * 60);
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Convierte segundos a formato HH:MM:SS
 */
const formatSecondsToHMS = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * GET /api/meet/rooms/[id]/analytics
 * Obtiene métricas resumidas de participantes para room cards
 * Versión optimizada del participants-report solo con métricas esenciales
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
      return NextResponse.json(
        { error: "Space ID is required" },
        { status: 400 }
      );
    }

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const membersService = new MeetMembersService(calendarService.auth);

    // Obtener token
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      return NextResponse.json(
        { error: "No access token available" },
        { status: 500 }
      );
    }

    console.log(`📊 Getting analytics for space ${spaceId}`);

    // 1. Obtener miembros permanentes (co-hosts + regulares)
    let permanentMembers = { total: 0, cohosts: 0, regularMembers: 0 };
    try {
      const membersResponse = await membersService.listMembers(spaceId, {
        pageSize: 100,
        fields: "name,email,role",
      });

      const members = membersResponse.members || [];

      // Debug detallado de roles
      console.log(`🏷️ Member roles breakdown:`);
      members.forEach((m: any, i: number) => {
        console.log(`  ${i + 1}. ${m.email} → Role: "${m.role}"`);
      });

      const coHostsCount = members.filter(
        (m: any) => m.role === "COHOST"
      ).length;
      const regularCount = members.filter(
        (m: any) =>
          !m.role || m.role === "ROLE_UNSPECIFIED" || m.role === "PARTICIPANT"
      ).length;

      permanentMembers = {
        total: members.length,
        cohosts: coHostsCount,
        regularMembers: regularCount,
      };

      console.log(
        `📊 Members calculation: Total=${permanentMembers.total}, CoHosts=${coHostsCount}, Regular=${regularCount}`
      );
    } catch (membersError) {
      console.warn(`⚠️ Could not fetch members for ${spaceId}:`, membersError);
    }

    // 2. Obtener conference records y calcular métricas de participantes
    const filter = `space.name="spaces/${spaceId}"`;
    const conferenceRecordsUrl = new URL(
      "https://meet.googleapis.com/v2/conferenceRecords"
    );
    conferenceRecordsUrl.searchParams.append("filter", filter);
    conferenceRecordsUrl.searchParams.append("pageSize", "50");

    const conferenceResponse = await fetch(conferenceRecordsUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.token}`,
        Accept: "application/json",
      },
    });

    // Inicializar métricas por defecto
    let participants = { invited: 0, uninvited: 0, unique: 0 };
    let sessions = {
      total: 0,
      totalDurationSeconds: 0,
      averageDurationSeconds: 0,
      averageParticipantsPerSession: 0,
    };
    let recentActivity = {
      lastMeetingDate: null as string | null,
      lastParticipantCount: 0,
      daysSinceLastMeeting: null as number | null,
    };

    if (!conferenceResponse.ok) {
      console.warn(
        `⚠️ Could not fetch conference records for ${spaceId}: ${conferenceResponse.status}`
      );

      return NextResponse.json({
        spaceId,
        permanentMembers,
        participants,
        sessions,
        recentActivity,
        message: "No se pudieron obtener los registros de conferencias",
      });
    }

    const conferenceData: GoogleMeetConferenceRecordsResponse = await conferenceResponse.json();
    const conferenceRecords: GoogleMeetConferenceRecord[] = conferenceData.conferenceRecords || [];
    
    console.log('📊 CONFERENCE RECORDS DATA:', {
      total: conferenceRecords.length,
      records: conferenceRecords.map(record => ({
        name: record.name,
        startTime: record.startTime,
        endTime: record.endTime,
        spaceName: record.space?.name
      }))
    });

    if (conferenceRecords.length === 0) {
      console.log(`ℹ️ No conference records found for space ${spaceId}`);

      return NextResponse.json({
        spaceId,
        permanentMembers,
        participants,
        sessions,
        recentActivity,
        message: "No hay historial de reuniones",
      });
    }

    // 3. Procesar conference records para obtener métricas
    let validSessionsCount = 0; // Contador de sesiones válidas (con filtros aplicados)
    let allParticipantCounts: number[] = [];

    // Crear un mapa de asistentes únicos con su información y participación
    const uniqueAttendees = new Map<string, ProcessedAttendee>();

    // Almacenar información de sesiones válidas para actividad reciente
    let validSessions: Array<{
      startTime: string;
      participantCount: number;
    }> = [];

    // Ordenar por fecha para obtener la más reciente
    conferenceRecords.sort(
      (a: any, b: any) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // Procesar cada conferencia
    for (const record of conferenceRecords) {
      try {
        // Esta conferencia será procesada basándose en participaciones reales
        console.log(`🔄 Processing conference: ${record.name}`);

        // 📊 Obtener participantes de esta conferencia usando el patrón de las APIs de backup
        const participantsUrl = `https://meet.googleapis.com/v2/${record.name}/participants`;

        const participantsResponse = await fetch(participantsUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.token}`,
            Accept: "application/json",
          },
        });

        if (participantsResponse.ok) {
          const participantsData: GoogleMeetParticipantsResponse = await participantsResponse.json();
          const participants: GoogleMeetParticipant[] = participantsData.participants || [];
          
          console.log(`📊 Found ${participants.length} participants for conference ${record.name}`);
          console.log('📊 PARTICIPANTS DATA:', participants.map(p => ({
            name: p.name,
            displayName: p.signedinUser?.displayName || p.anonymousUser?.displayName || p.phoneUser?.displayName,
            type: p.signedinUser ? 'signed_in' : p.anonymousUser ? 'anonymous' : 'phone',
            earliestStartTime: p.earliestStartTime,
            latestEndTime: p.latestEndTime
          })));
          
          if (participants.length === 0) {
            console.log(`⚠️ Skipping conference with 0 participants`);
            continue;
          }

          validSessionsCount++;
          allParticipantCounts.push(participants.length);

          // Agregar a lista de sesiones válidas para actividad reciente
          validSessions.push({
            startTime: record.startTime,
            participantCount: participants.length,
          });

          // 🔄 Procesar cada participante siguiendo el patrón de las APIs de backup
          for (const participant of participants) {
            try {
              // Obtener todas las sesiones de este participante específico
              const participantSessionsUrl = `https://meet.googleapis.com/v2/${participant.name}/participantSessions`;

              const sessionsResponse = await fetch(participantSessionsUrl, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token.token}`,
                  Accept: "application/json",
                },
              });

              let participantSessions: GoogleMeetParticipantSession[] = [];
              let totalParticipationMinutes = 0;

              if (sessionsResponse.ok) {
                const sessionsData: GoogleMeetParticipantSessionsResponse = await sessionsResponse.json();
                participantSessions = sessionsData.participantSessions || [];
                
                console.log(`📊 PARTICIPANT SESSIONS for ${participant.name}:`, participantSessions.map(s => ({
                  name: s.name,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  participant: s.participant
                })));
                
                // Calcular duración real total de todas las sesiones de este participante
                totalParticipationMinutes = participantSessions.reduce((sum: number, session: GoogleMeetParticipantSession) => {
                  if (session.startTime && session.endTime) {
                    const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
                    return sum + duration;
                  }
                  return sum;
                }, 0);
              }

              console.log(`👤 Processing participant: ${participant.signedinUser?.displayName || participant.anonymousUser?.displayName || 'Unknown'}, Sessions: ${participantSessions.length}, Total minutes: ${totalParticipationMinutes}`);

              // Identificar información del usuario siguiendo el patrón de backup
              let attendeeKey = "";
              let attendeeInfo: ProcessedParticipantInfo = {
                type: "anonymous",
                displayName: "Usuario desconocido",
                identifier: "",
                isInvited: false,
              };

              if (participant.signedinUser) {
                const userId = participant.signedinUser.user;
                const displayName = participant.signedinUser.displayName;
                
                // Usar displayName como clave principal, luego userId
                attendeeKey = displayName || userId || `signed_${Math.random()}`;
                
                attendeeInfo = {
                  type: "signed_in",
                  displayName: displayName,
                  identifier: userId,
                  isInvited: false,
                };
              } else if (participant.anonymousUser) {
                const displayName = participant.anonymousUser.displayName;
                attendeeKey = `anonymous_${displayName}`;
                
                attendeeInfo = {
                  type: "anonymous",
                  displayName: displayName,
                  identifier: "",
                  isInvited: false,
                };
              } else if (participant.phoneUser) {
                const displayName = participant.phoneUser.displayName;
                attendeeKey = `phone_${displayName}`;
                
                attendeeInfo = {
                  type: "phone",
                  displayName: displayName,
                  identifier: "",
                  isInvited: false,
                };
              }

              if (attendeeKey && totalParticipationMinutes > 0) {
                const sessionId = record.name.split('/').pop() || 'unknown';
                
                // Calcular duración total de la conferencia
                const conferenceDurationMinutes = record.endTime 
                  ? (new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / (1000 * 60)
                  : totalParticipationMinutes; // Si no hay endTime, usar la duración del participante como estimación
                
                // Crear detalles de sesiones para este participante
                // IMPORTANTE: participantSessions son los segmentos de participación DENTRO de una conferencia
                // Un participante puede entrar/salir varias veces, creando múltiples segmentos
                const sessionDetails = [{
                  sessionId,
                  // Duración total del participante en esta conferencia (suma de todos los segmentos)
                  duration: totalParticipationMinutes,
                  // Hora de inicio de la conferencia (no del segmento individual)
                  startTime: record.startTime,
                  // Duración total de la conferencia para calcular porcentaje
                  conferenceDuration: conferenceDurationMinutes,
                  // Información adicional sobre los segmentos individuales
                  segments: participantSessions
                    .filter((session: GoogleMeetParticipantSession) => session.startTime && session.endTime)
                    .map((session: GoogleMeetParticipantSession) => ({
                      segmentStart: session.startTime,
                      segmentEnd: session.endTime || session.startTime,
                      segmentDuration: session.endTime 
                        ? (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60)
                        : 0
                    }))
                }];
                
                console.log(`📊 SESSION DETAILS for ${attendeeInfo.displayName}:`, sessionDetails);

                if (!uniqueAttendees.has(attendeeKey)) {
                  // Primera vez que vemos a este participante
                  uniqueAttendees.set(attendeeKey, {
                    ...attendeeInfo,
                    sessionsAttended: [sessionId],
                    totalMinutesReal: totalParticipationMinutes,
                    participationSessions: sessionDetails
                  });
                  
                  sessions.totalDurationSeconds += totalParticipationMinutes * 60;
                  
                  console.log(
                    `➕ Added attendee: ${attendeeInfo.displayName} (${attendeeInfo.type}) | ${totalParticipationMinutes} min total`
                  );
                } else {
                  // Ya existe, agregar datos de esta conferencia
                  const existingAttendee = uniqueAttendees.get(attendeeKey)!;
                  
                  if (!existingAttendee.sessionsAttended.includes(sessionId)) {
                    existingAttendee.sessionsAttended.push(sessionId);
                    existingAttendee.totalMinutesReal += totalParticipationMinutes;
                    existingAttendee.participationSessions.push(...sessionDetails);
                    
                    sessions.totalDurationSeconds += totalParticipationMinutes * 60;
                    
                    console.log(
                      `🔄 Updated attendee: ${existingAttendee.displayName} | +${totalParticipationMinutes} min | Total: ${existingAttendee.totalMinutesReal} min`
                    );
                  }
                }
              }

            } catch (participantError) {
              console.error(`Error processing participant ${participant.name}:`, participantError);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error processing conference ${record.name}:`, error);
      }
    }

    // 4. Comparar asistentes con miembros permanentes para determinar quiénes son invitados
    console.log(
      `📋 Comparing ${uniqueAttendees.size} unique attendees with ${permanentMembers.total} permanent members`
    );

    // Crear sets para diferentes formas de identificar miembros permanentes
    const memberEmails = new Set<string>();
    const memberIdentifiers = new Set<string>();
    const memberDisplayNames = new Set<string>();

    try {
      const membersResponse = await membersService.listMembers(spaceId, {
        pageSize: 100,
        fields: "name,email,role,user",
      });

      const members = membersResponse.members || [];

      for (const member of members) {
        // Agregar email si existe
        if (member.email) {
          memberEmails.add(member.email.toLowerCase());
          // También agregar la parte antes del @ como posible displayName
          const emailName = member.email.split("@")[0];
          if (emailName) {
            memberDisplayNames.add(emailName.toLowerCase());
          }
        }

        // Agregar identificadores de usuario de diferentes formas
        if (member.user?.name) {
          memberIdentifiers.add(member.user.name);
        }

        // También agregar el member name como identificador (formato: spaces/{spaceId}/members/{memberId})
        if (member.name) {
          memberIdentifiers.add(member.name);
        }

        // Agregar display name si existe
        if (member.user?.displayName) {
          memberDisplayNames.add(member.user.displayName.toLowerCase());
        }

        // Log detallado de cada miembro
        console.log(
          `👤 Member: ${member.email} | DisplayName: ${member.user?.displayName} | UserID: ${member.user?.name}`
        );
      }

      console.log(
        `👥 Member emails (${memberEmails.size}): ${Array.from(memberEmails).join(", ")}`
      );
      console.log(
        `📝 Member display names (${memberDisplayNames.size}): ${Array.from(memberDisplayNames).join(", ")}`
      );
      console.log(
        `🔗 Member identifiers (${memberIdentifiers.size}): ${Array.from(memberIdentifiers).join(", ")}`
      );
    } catch (error) {
      console.warn(
        "⚠️ Could not fetch detailed member info for comparison:",
        error
      );
    }

    // Clasificar asistentes como invitados o no invitados
    let invitedAttendees = 0;
    let uninvitedAttendees = 0;

    for (const [, attendee] of uniqueAttendees) {
      let isInvited = false;

      if (attendee.type === "signed_in") {
        // Para usuarios autenticados, comparar con miembros permanentes
        const attendeeDisplayName = attendee.displayName?.toLowerCase() || "";
        const attendeeId = attendee.identifier;

        // Intentar múltiples formas de comparación

        // 1. Comparar por email exacto
        if (attendeeDisplayName && memberEmails.has(attendeeDisplayName)) {
          isInvited = true;
          console.log(`✅ Matched by email: ${attendeeDisplayName}`);
        }
        // 2. Comparar por identificador de usuario
        else if (attendeeId && memberIdentifiers.has(attendeeId)) {
          isInvited = true;
          console.log(`✅ Matched by identifier: ${attendeeId}`);
        }
        // 3. Comparar por display name
        else if (
          attendeeDisplayName &&
          memberDisplayNames.has(attendeeDisplayName)
        ) {
          isInvited = true;
          console.log(`✅ Matched by display name: ${attendeeDisplayName}`);
        }
        // 4. Verificar si el displayName contiene palabras clave de miembros
        else {
          // Buscar coincidencias parciales con nombres de miembros
          let partialMatch = false;
          for (const memberName of memberDisplayNames) {
            // Comparar si el display name del asistente contiene el nombre del miembro
            if (
              attendeeDisplayName.includes(memberName) ||
              memberName.includes(attendeeDisplayName)
            ) {
              isInvited = true;
              partialMatch = true;
              console.log(
                `✅ Partial match found: ${attendeeDisplayName} matches member ${memberName}`
              );
              break;
            }
          }

          if (!partialMatch) {
            // Verificar si el displayName contiene un email que coincida
            const emailMatch = attendeeDisplayName.match(
              /[\w\.-]+@[\w\.-]+\.\w+/
            );
            if (emailMatch && memberEmails.has(emailMatch[0].toLowerCase())) {
              isInvited = true;
              console.log(`✅ Matched by extracted email: ${emailMatch[0]}`);
            } else {
              console.log(
                `❌ No match found for: ${attendeeDisplayName} (ID: ${attendeeId})`
              );
            }
          }
        }
      } else {
        console.log(
          `🚫 Non-signed user always uninvited: ${attendee.displayName} (${attendee.type})`
        );
      }

      if (isInvited) {
        invitedAttendees++;
      } else {
        uninvitedAttendees++;
      }
    }

    // 5. Calcular métricas finales
    participants = {
      invited: invitedAttendees,
      uninvited: uninvitedAttendees,
      unique: uniqueAttendees.size,
    };

    // Usar validSessionsCount en lugar del total original
    sessions.total = validSessionsCount;

    console.log(
      `📊 Final count: ${invitedAttendees} invited, ${uninvitedAttendees} uninvited, ${uniqueAttendees.size} total unique`
    );
    console.log(
      `📊 Session filtering: ${validSessionsCount}/${conferenceRecords.length} sessions passed quality filters`
    );
    console.log(
      `👥 Attendee breakdown:`,
      Array.from(uniqueAttendees.entries()).map(
        ([key, info]) => `${key} (${info.type})`
      )
    );

    sessions.averageDurationSeconds =
      sessions.total > 0
        ? sessions.totalDurationSeconds / sessions.total
        : 0;

    sessions.averageParticipantsPerSession =
      allParticipantCounts.length > 0
        ? allParticipantCounts.reduce((sum, count) => sum + count, 0) /
              allParticipantCounts.length // 1 decimal
        : 0;

    // 5. Actividad reciente - solo considerar sesiones válidas
    if (validSessions.length > 0 && validSessions[0]) {
      // Las sesiones válidas ya están ordenadas por fecha descendente (más recientes primero)
      const mostRecentValidSession = validSessions[0];
      recentActivity = {
        lastMeetingDate: mostRecentValidSession.startTime,
        lastParticipantCount: mostRecentValidSession.participantCount,
        daysSinceLastMeeting: Math.floor(
          (Date.now() - new Date(mostRecentValidSession.startTime).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      };
      console.log(
        `📅 Most recent valid session: ${mostRecentValidSession.startTime} with ${mostRecentValidSession.participantCount} participants`
      );
    } else {
      // No hay sesiones válidas
      recentActivity = {
        lastMeetingDate: null,
        lastParticipantCount: 0,
        daysSinceLastMeeting: null,
      };
      console.log(`📅 No valid sessions found for recent activity`);
    }

    // 6. Crear ranking de participantes reales con datos reales de participación
    const participantRanking = Array.from(uniqueAttendees.entries())
      .map(([, attendee]) => {
        // Calcular última actividad real
        const lastSession = attendee.participationSessions
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];
        
        return {
          rank: 0, // Se asignará después del sorting
          participant: {
            name: attendee.displayName,
            email: (() => {
              // Intentar extraer email del displayName si no hay identifier
              if (attendee.identifier && attendee.identifier.includes('@')) {
                return attendee.identifier;
              }
              // Extraer email del displayName si contiene uno
              const emailMatch = attendee.displayName.match(/[\w\.-]+@[\w\.-]+\.\w+/);
              if (emailMatch) {
                return emailMatch[0];
              }
              // Si es usuario autenticado pero no tenemos email, no mostrar email
              return '';
            })(),
            type: attendee.type,
            isInvited: attendee.isInvited
          },
          // ✅ USAR DATOS REALES DE PARTICIPACIÓN
          totalMinutes: attendee.totalMinutesReal,
          totalMinutesFormatted: formatMinutesToHMS(attendee.totalMinutesReal),
          sessionsCount: attendee.sessionsAttended.length,
          averageMinutesPerSession: attendee.sessionsAttended.length > 0 
            ? attendee.totalMinutesReal / attendee.sessionsAttended.length
            : 0,
          averageMinutesPerSessionFormatted: attendee.sessionsAttended.length > 0 
            ? formatMinutesToHMS(attendee.totalMinutesReal / attendee.sessionsAttended.length)
            : "00:00:00",
          lastActivity: lastSession?.startTime || recentActivity.lastMeetingDate || new Date().toISOString(),
          
          // 🆕 DESGLOSE DETALLADO DE CADA SESIÓN (conferencia completa, no segmentos)
          sessionDetails: attendee.participationSessions
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) // Más reciente primero
            .map((session) => {
              // Si el participante entró/salió múltiples veces, mostrar nota
              const hasMultipleSegments = session.segments && session.segments.length > 1;
              const segmentNote = hasMultipleSegments 
                ? ` (${session.segments!.length} entradas)`
                : '';
                
              return {
                sessionId: session.sessionId,
                startTime: session.startTime,
                formattedStartTime: new Date(session.startTime).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) + segmentNote,
                durationMinutes: session.duration,
                durationFormatted: formatMinutesToHMS(session.duration),
                // Calcular porcentaje de participación en esta sesión específica
                participationPercentage: session.conferenceDuration && session.conferenceDuration > 0
                  ? Math.min(100, Math.round((session.duration / session.conferenceDuration) * 100))
                  : 100,
                sessionDate: new Date(session.startTime).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }),
                dayOfWeek: new Date(session.startTime).toLocaleDateString('es-ES', {
                  weekday: 'long'
                }),
                timeOfDay: new Date(session.startTime).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              };
            }),
            
          // 📊 ESTADÍSTICAS ADICIONALES POR PARTICIPANTE
          participationStats: {
            totalSessionsInSpace: attendee.sessionsAttended.length,
            longestSession: attendee.participationSessions.length > 0 
              ? Math.max(...attendee.participationSessions.map(s => s.duration))
              : 0,
            shortestSession: attendee.participationSessions.length > 0 
              ? Math.min(...attendee.participationSessions.map(s => s.duration))
              : 0,
            averageSessionDuration: attendee.sessionsAttended.length > 0 
              ? attendee.totalMinutesReal / attendee.sessionsAttended.length
              : 0,
            // 🆕 Formatos HH:MM:SS
            longestSessionFormatted: attendee.participationSessions.length > 0 
              ? formatMinutesToHMS(Math.max(...attendee.participationSessions.map(s => s.duration)))
              : "00:00:00",
            shortestSessionFormatted: attendee.participationSessions.length > 0 
              ? formatMinutesToHMS(Math.min(...attendee.participationSessions.map(s => s.duration)))
              : "00:00:00",
            averageSessionDurationFormatted: attendee.sessionsAttended.length > 0 
              ? formatMinutesToHMS(attendee.totalMinutesReal / attendee.sessionsAttended.length)
              : "00:00:00",
            totalMinutesFormatted: formatMinutesToHMS(attendee.totalMinutesReal),
            firstParticipation: attendee.participationSessions
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]?.startTime,
            lastParticipation: lastSession?.startTime,
            // Días únicos de participación
            uniqueDays: [...new Set(attendee.participationSessions.map(s => 
              new Date(s.startTime).toLocaleDateString('es-ES')
            ))].length,
            // Patrón de horarios (mañana, tarde, noche)
            timePatterns: {
              morning: attendee.participationSessions.filter(s => {
                const hour = new Date(s.startTime).getHours();
                return hour >= 6 && hour < 12;
              }).length,
              afternoon: attendee.participationSessions.filter(s => {
                const hour = new Date(s.startTime).getHours();
                return hour >= 12 && hour < 18;
              }).length,
              evening: attendee.participationSessions.filter(s => {
                const hour = new Date(s.startTime).getHours();
                return hour >= 18 && hour <= 23;
              }).length,
              night: attendee.participationSessions.filter(s => {
                const hour = new Date(s.startTime).getHours();
                return hour >= 0 && hour < 6;
              }).length
            }
          }
        };
      })
      .sort((a, b) => {
        // Ordenar por: 1) Invitados primero, 2) Más sesiones, 3) Más minutos
        if (a.participant.isInvited && !b.participant.isInvited) return -1;
        if (!a.participant.isInvited && b.participant.isInvited) return 1;
        if (a.sessionsCount !== b.sessionsCount) return b.sessionsCount - a.sessionsCount;
        return b.totalMinutes - a.totalMinutes;
      })
      .map((item, index) => ({ ...item, rank: index + 1 })); // Re-asignar ranks después del sorting

    console.log(`✅ Analytics calculated for space ${spaceId}:`, {
      totalMembers: permanentMembers.total,
      cohosts: permanentMembers.cohosts,
      totalSessions: sessions.total,
      uniqueParticipants: participants.unique,
      participantRankingCount: participantRanking.length
    });

    // 📊 LOG COMPLETO DE TODOS LOS DATOS PARA DEBUGGING
    const finalResponse: AnalyticsResponse = {
      spaceId,
      permanentMembers,
      participants,
      sessions,
      recentActivity,
      participantRanking,
      calculatedAt: new Date().toISOString(),
    };

    console.log('🔍 FINAL ANALYTICS RESPONSE - COMPLETE DATA:');
    console.log('spaceId:', finalResponse.spaceId);
    console.log('permanentMembers:', JSON.stringify(finalResponse.permanentMembers, null, 2));
    console.log('participants:', JSON.stringify(finalResponse.participants, null, 2));
    console.log('sessions:', JSON.stringify(finalResponse.sessions, null, 2));
    console.log('recentActivity:', JSON.stringify(finalResponse.recentActivity, null, 2));
    console.log('participantRanking count:', finalResponse.participantRanking.length);
    
    finalResponse.participantRanking.forEach((participant, index) => {
      console.log(`\n👤 PARTICIPANT #${index + 1}:`);
      console.log('  rank:', participant.rank);
      console.log('  name:', participant.participant.name);
      console.log('  email:', participant.participant.email);
      console.log('  type:', participant.participant.type);
      console.log('  isInvited:', participant.participant.isInvited);
      console.log('  totalMinutes:', participant.totalMinutes);
      console.log('  totalMinutesFormatted:', participant.totalMinutesFormatted);
      console.log('  sessionsCount:', participant.sessionsCount);
      console.log('  averageMinutesPerSession:', participant.averageMinutesPerSession);
      console.log('  averageMinutesPerSessionFormatted:', participant.averageMinutesPerSessionFormatted);
      console.log('  lastActivity:', participant.lastActivity);
      console.log('  sessionDetails count:', participant.sessionDetails?.length || 0);
      console.log('  participationStats:', JSON.stringify(participant.participationStats, null, 4));
    });

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error("Failed to generate analytics:", error);

    return NextResponse.json(
      {
        error: error.message || "Error generating analytics",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
