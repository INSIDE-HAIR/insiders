import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { MeetMembersService } from "@/src/features/meet/services/MeetMembersService";

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
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const membersService = new MeetMembersService(calendarService.auth);

    // Obtener token
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 500 });
    }

    console.log(`📊 Getting analytics for space ${spaceId}`);

    // 1. Obtener miembros permanentes (co-hosts + regulares)
    let permanentMembers = { total: 0, cohosts: 0, regularMembers: 0 };
    try {
      const membersResponse = await membersService.listMembers(spaceId, {
        pageSize: 100,
        fields: 'name,email,role'
      });

      const members = membersResponse.members || [];
      
      // Debug detallado de roles
      console.log(`🏷️ Member roles breakdown:`);
      members.forEach((m: any, i: number) => {
        console.log(`  ${i+1}. ${m.email} → Role: "${m.role}"`);
      });
      
      const coHostsCount = members.filter((m: any) => m.role === 'COHOST').length;
      const regularCount = members.filter((m: any) => 
        !m.role || m.role === 'ROLE_UNSPECIFIED' || m.role === 'PARTICIPANT'
      ).length;
      
      permanentMembers = {
        total: members.length,
        cohosts: coHostsCount,
        regularMembers: regularCount
      };
      
      console.log(`📊 Members calculation: Total=${permanentMembers.total}, CoHosts=${coHostsCount}, Regular=${regularCount}`);
    } catch (membersError) {
      console.warn(`⚠️ Could not fetch members for ${spaceId}:`, membersError);
    }

    // 2. Obtener conference records y calcular métricas de participantes
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

    // Inicializar métricas por defecto
    let participants = { invited: 0, uninvited: 0, unique: 0 };
    let sessions = { 
      total: 0, 
      totalDurationSeconds: 0, 
      averageDurationSeconds: 0, 
      averageParticipantsPerSession: 0 
    };
    let recentActivity = {
      lastMeetingDate: null as string | null,
      lastParticipantCount: 0,
      daysSinceLastMeeting: null as number | null
    };

    if (!conferenceResponse.ok) {
      console.warn(`⚠️ Could not fetch conference records for ${spaceId}: ${conferenceResponse.status}`);
      
      return NextResponse.json({
        spaceId,
        permanentMembers,
        participants,
        sessions,
        recentActivity,
        message: "No se pudieron obtener los registros de conferencias"
      });
    }

    const conferenceData = await conferenceResponse.json();
    const conferenceRecords = conferenceData.conferenceRecords || [];

    if (conferenceRecords.length === 0) {
      console.log(`ℹ️ No conference records found for space ${spaceId}`);
      
      return NextResponse.json({
        spaceId,
        permanentMembers,
        participants,
        sessions,
        recentActivity,
        message: "No hay historial de reuniones"
      });
    }

    // 3. Procesar conference records para obtener métricas
    let validSessionsCount = 0; // Contador de sesiones válidas (con filtros aplicados)
    let allParticipantCounts: number[] = [];
    
    // Crear un mapa de asistentes únicos con su información
    let uniqueAttendees = new Map<string, {
      type: 'signed_in' | 'anonymous' | 'phone';
      displayName: string;
      identifier: string;
      isInvited: boolean;
    }>();

    // Almacenar información de sesiones válidas para actividad reciente
    let validSessions: Array<{
      startTime: string;
      participantCount: number;
    }> = [];

    // Ordenar por fecha para obtener la más reciente
    conferenceRecords.sort((a: any, b: any) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // Procesar cada conferencia
    for (const record of conferenceRecords) {
      try {
        // Calcular duración de la sesión en segundos
        const startTime = new Date(record.startTime);
        const endTime = record.endTime ? new Date(record.endTime) : new Date();
        const sessionDurationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

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
          const sessionParticipants = participantsData.participants || [];
          
          // **FILTROS DE CALIDAD DE SESIÓN**
          // Excluir sesiones con 0 participantes o duración < 10 minutos (600 segundos)
          const MIN_DURATION_SECONDS = 600; // 10 minutos
          const MIN_PARTICIPANTS = 2 // 2 o más participantes
          
          if (sessionParticipants.length < MIN_PARTICIPANTS) {
            console.log(`⚠️ Skipping session with ${sessionParticipants.length} participants (below minimum ${MIN_PARTICIPANTS})`);
            continue; // Saltar esta sesión
          }
          
          if (sessionDurationSeconds < MIN_DURATION_SECONDS) {
            console.log(`⚠️ Skipping session with ${sessionDurationSeconds}s duration (below minimum ${MIN_DURATION_SECONDS}s)`);
            continue; // Saltar esta sesión
          }
          
          // Sesión válida - incluir en métricas
          console.log(`✅ Processing valid session: ${sessionParticipants.length} participants, ${sessionDurationSeconds}s duration`);
          validSessionsCount++;
          sessions.totalDurationSeconds += sessionDurationSeconds;
          
          // Contar participantes de esta sesión
          allParticipantCounts.push(sessionParticipants.length);
          
          // Agregar a lista de sesiones válidas para actividad reciente
          validSessions.push({
            startTime: record.startTime,
            participantCount: sessionParticipants.length
          });
          
          // Procesar cada participante de la sesión
          for (const participant of sessionParticipants) {
            let attendeeKey = '';
            let attendeeInfo = {
              type: 'anonymous' as 'signed_in' | 'anonymous' | 'phone',
              displayName: 'Usuario desconocido',
              identifier: '',
              isInvited: false
            };

            if (participant.signedinUser) {
              // Usuario autenticado - usar su ID único de Google (más confiable)
              const userId = participant.signedinUser.user;
              const displayName = participant.signedinUser.displayName;
              
              // Usar el user ID como clave única (más confiable que displayName)
              attendeeKey = userId || `signed_${displayName}`;
              attendeeInfo = {
                type: 'signed_in',
                displayName: displayName,
                identifier: userId,
                isInvited: false // Lo determinaremos comparando con miembros
              };
            } else if (participant.anonymousUser) {
              // Usuario anónimo - usar displayName (mismo anónimo = misma persona)
              attendeeKey = `anonymous_${participant.anonymousUser.displayName}`;
              attendeeInfo = {
                type: 'anonymous',
                displayName: participant.anonymousUser.displayName,
                identifier: '',
                isInvited: false
              };
            } else if (participant.phoneUser) {
              // Usuario por teléfono - usar displayName 
              attendeeKey = `phone_${participant.phoneUser.displayName}`;
              attendeeInfo = {
                type: 'phone',
                displayName: participant.phoneUser.displayName,
                identifier: '',
                isInvited: false
              };
            }

            if (attendeeKey) {
              // Solo agregar si no existe (evita duplicados entre sesiones)
              if (!uniqueAttendees.has(attendeeKey)) {
                uniqueAttendees.set(attendeeKey, attendeeInfo);
                console.log(`➕ Added unique attendee: ${attendeeInfo.displayName} (${attendeeInfo.type}) | Key: ${attendeeKey} | ID: ${attendeeInfo.identifier}`);
              }
            }
          }
        }
        
      } catch (error) {
        console.warn(`⚠️ Error processing conference ${record.name}:`, error);
      }
    }

    // 4. Comparar asistentes con miembros permanentes para determinar quiénes son invitados
    console.log(`📋 Comparing ${uniqueAttendees.size} unique attendees with ${permanentMembers.total} permanent members`);
    
    // Crear sets para diferentes formas de identificar miembros permanentes
    const memberEmails = new Set<string>();
    const memberIdentifiers = new Set<string>();
    const memberDisplayNames = new Set<string>();
    
    try {
      const membersResponse = await membersService.listMembers(spaceId, {
        pageSize: 100,
        fields: 'name,email,role,user'
      });

      const members = membersResponse.members || [];
      
      for (const member of members) {
        // Agregar email si existe
        if (member.email) {
          memberEmails.add(member.email.toLowerCase());
          // También agregar la parte antes del @ como posible displayName
          const emailName = member.email.split('@')[0];
          memberDisplayNames.add(emailName.toLowerCase());
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
        console.log(`👤 Member: ${member.email} | DisplayName: ${member.user?.displayName} | UserID: ${member.user?.name}`);
      }
      
      console.log(`👥 Member emails (${memberEmails.size}): ${Array.from(memberEmails).join(', ')}`);
      console.log(`📝 Member display names (${memberDisplayNames.size}): ${Array.from(memberDisplayNames).join(', ')}`);
      console.log(`🔗 Member identifiers (${memberIdentifiers.size}): ${Array.from(memberIdentifiers).join(', ')}`);
    } catch (error) {
      console.warn('⚠️ Could not fetch detailed member info for comparison:', error);
    }

    // Clasificar asistentes como invitados o no invitados
    let invitedAttendees = 0;
    let uninvitedAttendees = 0;
    
    for (const [key, attendee] of uniqueAttendees) {
      let isInvited = false;
      
      if (attendee.type === 'signed_in') {
        // Para usuarios autenticados, comparar con miembros permanentes
        const attendeeDisplayName = attendee.displayName?.toLowerCase() || '';
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
        else if (attendeeDisplayName && memberDisplayNames.has(attendeeDisplayName)) {
          isInvited = true;
          console.log(`✅ Matched by display name: ${attendeeDisplayName}`);
        }
        // 4. Verificar si el displayName contiene palabras clave de miembros
        else {
          // Buscar coincidencias parciales con nombres de miembros
          let partialMatch = false;
          for (const memberName of memberDisplayNames) {
            // Comparar si el display name del asistente contiene el nombre del miembro
            if (attendeeDisplayName.includes(memberName) || memberName.includes(attendeeDisplayName)) {
              isInvited = true;
              partialMatch = true;
              console.log(`✅ Partial match found: ${attendeeDisplayName} matches member ${memberName}`);
              break;
            }
          }
          
          if (!partialMatch) {
            // Verificar si el displayName contiene un email que coincida
            const emailMatch = attendeeDisplayName.match(/[\w\.-]+@[\w\.-]+\.\w+/);
            if (emailMatch && memberEmails.has(emailMatch[0].toLowerCase())) {
              isInvited = true;
              console.log(`✅ Matched by extracted email: ${emailMatch[0]}`);
            } else {
              console.log(`❌ No match found for: ${attendeeDisplayName} (ID: ${attendeeId})`);
            }
          }
        }
      } else {
        console.log(`🚫 Non-signed user always uninvited: ${attendee.displayName} (${attendee.type})`);
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
      unique: uniqueAttendees.size
    };
    
    // Usar validSessionsCount en lugar del total original
    sessions.total = validSessionsCount;
    
    console.log(`📊 Final count: ${invitedAttendees} invited, ${uninvitedAttendees} uninvited, ${uniqueAttendees.size} total unique`);
    console.log(`📊 Session filtering: ${validSessionsCount}/${conferenceRecords.length} sessions passed quality filters`);
    console.log(`👥 Attendee breakdown:`, Array.from(uniqueAttendees.entries()).map(([key, info]) => `${key} (${info.type})`));

    sessions.averageDurationSeconds = sessions.total > 0 
      ? Math.round(sessions.totalDurationSeconds / sessions.total) 
      : 0;

    sessions.averageParticipantsPerSession = allParticipantCounts.length > 0
      ? Math.round((allParticipantCounts.reduce((sum, count) => sum + count, 0) / allParticipantCounts.length) * 10) / 10  // 1 decimal
      : 0;

    // 5. Actividad reciente - solo considerar sesiones válidas
    if (validSessions.length > 0 && validSessions[0]) {
      // Las sesiones válidas ya están ordenadas por fecha descendente (más recientes primero)
      const mostRecentValidSession = validSessions[0];
      recentActivity = {
        lastMeetingDate: mostRecentValidSession.startTime,
        lastParticipantCount: mostRecentValidSession.participantCount,
        daysSinceLastMeeting: Math.floor((Date.now() - new Date(mostRecentValidSession.startTime).getTime()) / (1000 * 60 * 60 * 24))
      };
      console.log(`📅 Most recent valid session: ${mostRecentValidSession.startTime} with ${mostRecentValidSession.participantCount} participants`);
    } else {
      // No hay sesiones válidas
      recentActivity = {
        lastMeetingDate: null,
        lastParticipantCount: 0,
        daysSinceLastMeeting: null
      };
      console.log(`📅 No valid sessions found for recent activity`);
    }

    console.log(`✅ Analytics calculated for space ${spaceId}:`, {
      totalMembers: permanentMembers.total,
      cohosts: permanentMembers.cohosts,
      totalSessions: sessions.total,
      uniqueParticipants: participants.unique
    });

    return NextResponse.json({
      spaceId,
      permanentMembers,
      participants,
      sessions,
      recentActivity,
      calculatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Failed to generate analytics:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error generating analytics",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}