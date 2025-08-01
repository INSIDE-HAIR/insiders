import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";

/**
 * GET /api/admin/consultant-workload
 * 
 * Obtiene la carga horaria de consultores basada en eventos del calendario
 * Parámetros de consulta:
 * - startDate: Fecha de inicio (YYYY-MM-DD)
 * - endDate: Fecha de fin (YYYY-MM-DD)
 * - consultantFilter: Email específico de consultor (opcional)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo administradores." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const consultantFilter = searchParams.get('consultantFilter');

    // Validar parámetros de fecha
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate y endDate son requeridos" },
        { status: 400 }
      );
    }

    // Verificar variables de entorno para Google Calendar
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        { error: "Google Calendar no configurado correctamente" },
        { status: 500 }
      );
    }

    const { google } = require('googleapis');

    // Configurar autenticación de servicio
    const googleAuth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth: googleAuth });

    // Obtener lista de calendarios
    const calendarsResponse = await calendar.calendarList.list();
    const calendars = calendarsResponse.data.items || [];

    // Cargar eventos de todos los calendarios
    const allEvents: any[] = [];
    const timeMin = new Date(startDate).toISOString();
    const timeMax = new Date(endDate + 'T23:59:59').toISOString();

    for (const cal of calendars) {
      try {
        const eventsResponse = await calendar.events.list({
          calendarId: cal.id,
          timeMin,
          timeMax,
          maxResults: 100,
          singleEvents: true,
          orderBy: 'startTime',
          q: 'consulta OR consultoria OR sesión OR session OR meeting'
        });

        const events = eventsResponse.data.items || [];
        const eventsWithCalendar = events.map((event: any) => ({
          ...event,
          calendarId: cal.id,
          calendarSummary: cal.summary
        }));

        allEvents.push(...eventsWithCalendar);
      } catch (error) {
        console.warn(`Error loading events from calendar ${cal.id}:`, error);
      }
    }

    // Procesar eventos para extraer datos de carga horaria
    const consultantMap = new Map();

    allEvents.forEach(event => {
      if (!event.attendees || !event.start?.dateTime || !event.end?.dateTime) return;

      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

      // Identificar consultores
      const potentialConsultants = [
        ...(event.organizer ? [event.organizer] : []),
        ...(event.attendees || [])
      ].filter((person: any) => 
        person.email && 
        (person.email.includes('consultor') || 
         person.email.includes('consultant') ||
         person.email.includes('@insiders') ||
         person.responseStatus === 'accepted' ||
         person.email === event.organizer?.email)
      );

      // Aplicar filtro de consultor si se especifica
      const consultantsToProcess = consultantFilter 
        ? potentialConsultants.filter((c: any) => c.email === consultantFilter)
        : potentialConsultants;

      consultantsToProcess.forEach((consultant: any) => {
        if (!consultant.email) return;

        const email = consultant.email;
        const name = consultant.displayName || consultant.email.split('@')[0];
        const status = consultant.responseStatus || 'needsAction';

        if (!consultantMap.has(email)) {
          consultantMap.set(email, {
            consultantEmail: email,
            consultantName: name,
            totalSessions: 0,
            totalHours: 0,
            acceptedSessions: 0,
            pendingSessions: 0,
            declinedSessions: 0,
            tentativeSessions: 0,
            sessions: []
          });
        }

        const consultantData = consultantMap.get(email);
        consultantData.totalSessions++;
        
        // Contar por estado
        switch (status) {
          case 'accepted':
            consultantData.acceptedSessions++;
            consultantData.totalHours += duration / 60; // convert to hours
            break;
          case 'declined':
            consultantData.declinedSessions++;
            break;
          case 'tentative':
            consultantData.tentativeSessions++;
            break;
          default:
            consultantData.pendingSessions++;
        }

        consultantData.sessions.push({
          id: event.id,
          title: event.summary || 'Sin título',
          start: startTime,
          end: endTime,
          duration,
          status,
          attendees: (event.attendees || []).length,
          calendarId: event.calendarId,
          calendarSummary: event.calendarSummary,
          hangoutLink: event.hangoutLink,
          htmlLink: event.htmlLink
        });
      });
    });

    // Convertir a array y ordenar por horas totales
    const consultantWorkload = Array.from(consultantMap.values())
      .sort((a: any, b: any) => b.totalHours - a.totalHours);

    // Calcular estadísticas resumen
    const summary = {
      totalConsultants: consultantWorkload.length,
      totalSessions: consultantWorkload.reduce((sum: number, c: any) => sum + c.acceptedSessions, 0),
      totalHours: Math.round(consultantWorkload.reduce((sum: number, c: any) => sum + c.totalHours, 0) * 10) / 10,
      avgHoursPerConsultant: consultantWorkload.length > 0 
        ? Math.round((consultantWorkload.reduce((sum: number, c: any) => sum + c.totalHours, 0) / consultantWorkload.length) * 10) / 10
        : 0,
      totalPendingSessions: consultantWorkload.reduce((sum: number, c: any) => sum + c.pendingSessions, 0),
      totalDeclinedSessions: consultantWorkload.reduce((sum: number, c: any) => sum + c.declinedSessions, 0),
      totalTentativeSessions: consultantWorkload.reduce((sum: number, c: any) => sum + c.tentativeSessions, 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        consultants: consultantWorkload,
        summary,
        dateRange: {
          startDate,
          endDate
        },
        filters: {
          consultantFilter: consultantFilter || null
        }
      }
    });

  } catch (error: any) {
    console.error('Error en consultant-workload API:', error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}