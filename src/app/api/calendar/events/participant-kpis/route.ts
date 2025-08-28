import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/config/auth/auth';
import { ParticipantKPIService } from '@/src/features/calendar/services/ParticipantKPIService';
import { GoogleCalendarService } from '@/src/features/calendar/services/calendar/GoogleCalendarService';
import { ParticipantKPIsResponse } from '@/src/features/calendar/types/participant-kpis';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const emailsParam = searchParams.get('emails');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const calendarIdsParam = searchParams.get('calendarIds');

    if (!emailsParam) {
      return NextResponse.json(
        { error: 'Emails parameter is required' },
        { status: 400 }
      );
    }

    // Parse emails array
    const emails = emailsParam.split(',').map(email => email.trim()).filter(Boolean);
    
    if (emails.length === 0) {
      return NextResponse.json(
        { error: 'At least one email is required' },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    if (emails.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 participants allowed per request' },
        { status: 400 }
      );
    }

    // Parse calendar IDs if provided
    const calendarIds = calendarIdsParam 
      ? calendarIdsParam.split(',').map(id => id.trim()).filter(Boolean)
      : null;

    // Initialize calendar service
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Get calendars
    const allCalendars = await calendarService.getCalendars();
    const calendarsToProcess = calendarIds 
      ? allCalendars.filter(cal => calendarIds.includes(cal.id))
      : allCalendars;

    if (calendarsToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No calendars found or accessible' },
        { status: 404 }
      );
    }

    // Set date range (default to last 90 days if not specified)
    const now = new Date();
    const defaultStartDate = new Date(now);
    defaultStartDate.setDate(defaultStartDate.getDate() - 90);
    
    const timeMin = startDate ? new Date(startDate).toISOString() : defaultStartDate.toISOString();
    const timeMax = endDate ? new Date(endDate).toISOString() : undefined;

    // Fetch events from all calendars
    const allEvents: any[] = [];
    const errors: string[] = [];

    for (const calendar of calendarsToProcess) {
      try {
        const eventsResponse = await calendarService.getEvents(calendar.id, {
          timeMin,
          timeMax,
          maxResults: 500,
          orderBy: 'startTime',
          singleEvents: true
        });
        
        const events = eventsResponse.items || [];
        allEvents.push(...events);
      } catch (error) {
        console.warn(`Failed to fetch events from calendar ${calendar.id}:`, error);
        errors.push(`Calendar ${calendar.summary || calendar.id}: Failed to fetch events`);
      }
    }

    if (allEvents.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch events from any calendar',
          details: errors 
        },
        { status: 500 }
      );
    }

    // Calculate KPIs
    const kpiService = new ParticipantKPIService();
    const kpis = kpiService.calculateParticipantKPIs(allEvents, emails);

    // Get aggregated stats
    const aggregatedStats = kpiService.getAggregatedStats(kpis);

    const response: ParticipantKPIsResponse = {
      success: true,
      kpis,
      calculatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      ...response,
      metadata: {
        calendarsProcessed: calendarsToProcess.length,
        eventsProcessed: allEvents.length,
        participantsAnalyzed: emails.length,
        dateRange: {
          start: timeMin,
          end: timeMax
        },
        aggregatedStats,
        ...(errors.length > 0 && { warnings: errors })
      }
    });

  } catch (error) {
    console.error('Error calculating participant KPIs:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}