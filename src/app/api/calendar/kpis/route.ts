import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/config/auth/auth';
import { CalendarKPIService } from '@/src/features/calendar/services/CalendarKPIService';
import { GoogleCalendarService } from '@/src/features/calendar/services/calendar/GoogleCalendarService';

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
    const includeCompany = searchParams.get('includeCompany') === 'true';

    const kpiService = new CalendarKPIService();
    const latestKPIs = await kpiService.getLatestKPIs(includeCompany);

    if (!latestKPIs) {
      return NextResponse.json(
        { error: 'No KPIs found', hasData: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      hasData: true,
      kpis: latestKPIs,
    });

  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');
    const includeCompany = searchParams.get('includeCompany') === 'true';

    // Default to last 30 days if no period specified
    const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = periodEnd ? new Date(periodEnd) : new Date();

    // Initialize and fetch calendars directly using the service
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const allCalendars = await calendarService.getCalendars();

    // ALWAYS fetch events from ALL calendars for accurate global metrics
    // The includeCompany filter will only affect the calendar breakdown UI
    const allEvents: any[] = [];
    
    for (const calendar of allCalendars) {
      try {
        const eventsResponse = await calendarService.getEvents(calendar.id, {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          maxResults: 500,
          orderBy: 'startTime',
          singleEvents: true
        });
        
        // Add calendar info to each event
        const events = eventsResponse.items || [];
        const eventsWithCalendar = events.map((event: any) => ({
          ...event,
          calendarId: calendar.id,
        }));
        
        allEvents.push(...eventsWithCalendar);
      } catch (error) {
        console.warn(`Failed to fetch events from calendar ${calendar.id}:`, error);
      }
    }

    // Calculate KPIs
    const kpiService = new CalendarKPIService();
    const result = await kpiService.calculateKPIs(
      allEvents,
      allCalendars, // Pass ALL calendars, the service will handle the filtering
      startDate,
      endDate,
      session.user.id,
      includeCompany
    );

    if (!result.success || !result.kpiData) {
      return NextResponse.json(
        { error: result.error || 'Failed to calculate KPIs' },
        { status: 500 }
      );
    }

    // Save KPIs to database
    const kpiId = await kpiService.saveKPIs(result.kpiData, result);

    return NextResponse.json({
      success: true,
      kpiId,
      kpis: result.kpiData,
      processingInfo: {
        processingTimeMs: result.processingTimeMs,
        eventsProcessed: result.eventsProcessed,
        calendarsProcessed: allCalendars.length
      }
    });

  } catch (error) {
    console.error('Error updating KPIs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}