import { GoogleCalendarEvent } from '../types';
import { PrismaClient } from '@prisma/client';

export interface CalendarKPIData {
  id?: string;
  calculatedAt: Date;
  lastUpdatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  totalUniqueAttendees: number;
  averageAttendeesPerEvent: number;
  totalEventHours: number;
  averageEventDuration: number;
  calendarBreakdown: Record<string, { 
    name: string; 
    eventCount: number;
    totalAttendees: number;
    averageAttendeesPerEvent: number;
  }>;
  eventStatusStats: {
    accepted: number;
    declined: number;
    tentative: number;
    needsAction: number;
  };
  meetingTypeStats: {
    withMeetLink: number;
    withoutMeetLink: number;
    inPerson: number;
  };
  dailyEventStats: Record<string, number>;
  hourlyDistribution: Record<string, number>;
  responseRateStats: {
    totalInvited: number;
    responded: number;
    responseRate: number;
  };
  // Advanced attendee metrics
  attendeeAnalytics?: {
    // Engagement metrics
    mostEngagedAttendees: Array<{ email: string; eventsCount: number; acceptanceRate: number }>;
    attendeeFrequency: {
      single: number; // Attendees who appear in only 1 event
      occasional: number; // 2-3 events
      regular: number; // 4-5 events
      frequent: number; // 6+ events
    };
    // Domain analysis
    domainBreakdown: Record<string, { count: number; uniqueAttendees: number }>;
    // Response patterns
    responseTimeStats: {
      quickResponders: number; // Responded same day
      normalResponders: number; // Responded within a week
      slowResponders: number; // Responded after a week or never
    };
    // Invitation patterns
    invitationStats: {
      totalInvitationsSent: number;
      averageAttendeesPerEvent: number;
      maxAttendeesInEvent: number;
      minAttendeesInEvent: number;
      eventsWithMostAttendees: Array<{ eventId: string; title: string; attendeeCount: number }>;
    };
  };
  version: number;
  generatedBy?: string;
  includeCompanyCalendars?: boolean;
}

export interface KPIUpdateResult {
  success: boolean;
  kpiData?: CalendarKPIData;
  processingTimeMs: number;
  eventsProcessed: number;
  error?: string;
}

export class CalendarKPIService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async calculateKPIs(
    events: GoogleCalendarEvent[],
    calendars: Array<{ id: string; summary: string }>,
    periodStart: Date,
    periodEnd: Date,
    generatedBy?: string,
    includeCompany?: boolean
  ): Promise<KPIUpdateResult> {
    const startTime = Date.now();
    
    try {
      const now = new Date();
      
      // Filter events within the period
      const filteredEvents = events.filter(event => {
        const eventStart = new Date(event.start?.dateTime || event.start?.date || '');
        return eventStart >= periodStart && eventStart <= periodEnd;
      });

      console.log('📊 KPI Calculation Debug:');
      console.log(`- Total events received: ${events.length}`);
      console.log(`- Events after date filter: ${filteredEvents.length}`);
      console.log(`- Calendars to process: ${calendars.length}`);
      console.log('- Calendar IDs:', calendars.map(c => c.id));

      // Basic counts
      const totalEvents = filteredEvents.length;
      const upcomingEvents = filteredEvents.filter(event => {
        const eventStart = new Date(event.start?.dateTime || event.start?.date || '');
        return eventStart > now;
      }).length;
      
      const completedEvents = filteredEvents.filter(event => {
        const eventEnd = new Date(event.end?.dateTime || event.end?.date || '');
        return eventEnd < now;
      }).length;

      const cancelledEvents = filteredEvents.filter(event => 
        event.status === 'cancelled'
      ).length;

      // Attendees analysis
      const allAttendees = new Set<string>();
      let totalInvitations = 0;
      let totalResponded = 0;
      
      const eventStatusStats = {
        accepted: 0,
        declined: 0,
        tentative: 0,
        needsAction: 0
      };

      filteredEvents.forEach(event => {
        if (event.attendees) {
          event.attendees.forEach(attendee => {
            if (attendee.email) {
              allAttendees.add(attendee.email);
              totalInvitations++;
              
              if (attendee.responseStatus && attendee.responseStatus !== 'needsAction') {
                totalResponded++;
              }
              
              if (attendee.responseStatus) {
                eventStatusStats[attendee.responseStatus as keyof typeof eventStatusStats]++;
              }
            }
          });
        }
      });

      const totalUniqueAttendees = allAttendees.size;
      const averageAttendeesPerEvent = totalEvents > 0 
        ? Math.round((totalInvitations / totalEvents) * 100) / 100
        : 0;

      // Time analysis
      let totalMinutes = 0;
      let eventsWithDuration = 0;

      filteredEvents.forEach(event => {
        const start = new Date(event.start?.dateTime || event.start?.date || '');
        const end = new Date(event.end?.dateTime || event.end?.date || '');
        
        if (start && end) {
          const durationMs = end.getTime() - start.getTime();
          const durationMinutes = durationMs / (1000 * 60);
          
          if (durationMinutes > 0 && durationMinutes < 1440) { // Less than 24 hours
            totalMinutes += durationMinutes;
            eventsWithDuration++;
          }
        }
      });

      const totalEventHours = Math.round((totalMinutes / 60) * 100) / 100;
      const averageEventDuration = eventsWithDuration > 0 
        ? Math.round((totalMinutes / eventsWithDuration) * 100) / 100
        : 0;

      // Calendar breakdown - apply company filter ONLY here for UI display
      const calendarsToShow = includeCompany 
        ? calendars 
        : calendars.filter(calendar => !calendar.id?.endsWith('@insidesalons.com'));

      const calendarBreakdown: Record<string, { 
        name: string; 
        eventCount: number;
        totalAttendees: number;
        averageAttendeesPerEvent: number;
      }> = {};
      
      // Process ONLY the calendars we want to show in breakdown
      calendarsToShow.forEach(calendar => {
        const calendarEvents = filteredEvents.filter(event => 
          (event as any).calendarId === calendar.id
        );
        
        console.log(`📅 Calendar: ${calendar.summary} (${calendar.id})`);
        console.log(`   - Events found: ${calendarEvents.length}`);
        
        // Calculate attendees for this calendar
        let calendarTotalAttendees = 0;
        calendarEvents.forEach(event => {
          if (event.attendees) {
            calendarTotalAttendees += event.attendees.length;
          }
        });
        
        console.log(`   - Total attendees: ${calendarTotalAttendees}`);
        
        const averageAttendeesForCalendar = calendarEvents.length > 0 
          ? Math.round((calendarTotalAttendees / calendarEvents.length) * 100) / 100
          : 0;
        
        calendarBreakdown[calendar.id] = {
          name: calendar.summary,
          eventCount: calendarEvents.length,
          totalAttendees: calendarTotalAttendees,
          averageAttendeesPerEvent: averageAttendeesForCalendar
        };
      });

      // Meeting types
      const meetingTypeStats = {
        withMeetLink: filteredEvents.filter(event => 
          event.conferenceData?.entryPoints?.some(entry => entry.entryPointType === 'video')
        ).length,
        withoutMeetLink: filteredEvents.filter(event => 
          !event.conferenceData?.entryPoints?.some(entry => entry.entryPointType === 'video')
        ).length,
        inPerson: filteredEvents.filter(event => 
          event.location && !event.conferenceData?.entryPoints?.some(entry => entry.entryPointType === 'video')
        ).length
      };

      // Daily distribution
      const dailyEventStats: Record<string, number> = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      };

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      filteredEvents.forEach(event => {
        const eventStart = new Date(event.start?.dateTime || event.start?.date || '');
        if (isNaN(eventStart.getTime())) return; // Skip invalid dates
        
        const dayOfWeek = eventStart.getDay();
        const dayName = dayNames[dayOfWeek];
        if (dayName && dailyEventStats[dayName] !== undefined) {
          dailyEventStats[dayName]++;
        }
      });

      // Hourly distribution
      const hourlyDistribution: Record<string, number> = {};
      for (let i = 0; i < 24; i++) {
        hourlyDistribution[i.toString().padStart(2, '0')] = 0;
      }

      filteredEvents.forEach(event => {
        if (event.start?.dateTime) {
          const eventStart = new Date(event.start.dateTime);
          if (!isNaN(eventStart.getTime())) {
            const hour = eventStart.getHours().toString().padStart(2, '0');
            if (hourlyDistribution[hour] !== undefined) {
              hourlyDistribution[hour]++;
            }
          }
        }
      });

      // Response rate stats
      const responseRateStats = {
        totalInvited: totalInvitations,
        responded: totalResponded,
        responseRate: totalInvitations > 0 
          ? Math.round((totalResponded / totalInvitations) * 10000) / 100
          : 0
      };

      // Advanced attendee analytics
      const attendeeAnalytics = this.calculateAttendeeAnalytics(filteredEvents);

      const kpiData: CalendarKPIData = {
        calculatedAt: now,
        lastUpdatedAt: now,
        periodStart,
        periodEnd,
        totalEvents,
        upcomingEvents,
        completedEvents,
        cancelledEvents,
        totalUniqueAttendees,
        averageAttendeesPerEvent,
        totalEventHours,
        averageEventDuration,
        calendarBreakdown,
        eventStatusStats,
        meetingTypeStats,
        dailyEventStats,
        hourlyDistribution,
        responseRateStats,
        attendeeAnalytics,
        version: 1,
        generatedBy,
        includeCompanyCalendars: includeCompany
      };

      const processingTimeMs = Date.now() - startTime;

      return {
        success: true,
        kpiData,
        processingTimeMs,
        eventsProcessed: filteredEvents.length
      };

    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      
      return {
        success: false,
        processingTimeMs,
        eventsProcessed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async saveKPIs(kpiData: CalendarKPIData, updateResult: KPIUpdateResult): Promise<string> {
    const savedKPI = await this.prisma.calendarKPI.create({
      data: {
        calculatedAt: kpiData.calculatedAt,
        lastUpdatedAt: kpiData.lastUpdatedAt,
        periodStart: kpiData.periodStart,
        periodEnd: kpiData.periodEnd,
        totalEvents: kpiData.totalEvents,
        upcomingEvents: kpiData.upcomingEvents,
        completedEvents: kpiData.completedEvents,
        cancelledEvents: kpiData.cancelledEvents,
        totalUniqueAttendees: kpiData.totalUniqueAttendees,
        averageAttendeesPerEvent: kpiData.averageAttendeesPerEvent,
        totalEventHours: kpiData.totalEventHours,
        averageEventDuration: kpiData.averageEventDuration,
        calendarBreakdown: kpiData.calendarBreakdown,
        eventStatusStats: kpiData.eventStatusStats,
        meetingTypeStats: kpiData.meetingTypeStats,
        dailyEventStats: kpiData.dailyEventStats,
        hourlyDistribution: kpiData.hourlyDistribution,
        responseRateStats: kpiData.responseRateStats,
        attendeeAnalytics: kpiData.attendeeAnalytics,
        version: kpiData.version,
        generatedBy: kpiData.generatedBy,
        includeCompanyCalendars: kpiData.includeCompanyCalendars
      }
    });

    // Log the update
    await this.prisma.calendarKPIUpdateLog.create({
      data: {
        kpiId: savedKPI.id,
        updatedBy: kpiData.generatedBy,
        updateType: 'manual',
        processingTimeMs: updateResult.processingTimeMs,
        eventsProcessed: updateResult.eventsProcessed,
        status: updateResult.success ? 'success' : 'error',
        errorMessage: updateResult.error
      }
    });

    return savedKPI.id;
  }

  async getLatestKPIs(includeCompany?: boolean): Promise<CalendarKPIData | null> {
    try {
      const latestKPI = await this.prisma.calendarKPI.findFirst({
        where: includeCompany !== undefined ? {
          includeCompanyCalendars: includeCompany
        } : undefined,
        orderBy: {
          calculatedAt: 'desc'
        }
      });

      if (!latestKPI) return null;

    return {
      id: latestKPI.id,
      calculatedAt: latestKPI.calculatedAt,
      lastUpdatedAt: latestKPI.lastUpdatedAt,
      periodStart: latestKPI.periodStart,
      periodEnd: latestKPI.periodEnd,
      totalEvents: latestKPI.totalEvents,
      upcomingEvents: latestKPI.upcomingEvents,
      completedEvents: latestKPI.completedEvents,
      cancelledEvents: latestKPI.cancelledEvents,
      totalUniqueAttendees: latestKPI.totalUniqueAttendees,
      averageAttendeesPerEvent: latestKPI.averageAttendeesPerEvent,
      totalEventHours: latestKPI.totalEventHours,
      averageEventDuration: latestKPI.averageEventDuration,
      calendarBreakdown: latestKPI.calendarBreakdown as Record<string, { 
        name: string; 
        eventCount: number;
        totalAttendees: number;
        averageAttendeesPerEvent: number;
      }>,
      eventStatusStats: latestKPI.eventStatusStats as any,
      meetingTypeStats: latestKPI.meetingTypeStats as any,
      dailyEventStats: latestKPI.dailyEventStats as Record<string, number>,
      hourlyDistribution: latestKPI.hourlyDistribution as Record<string, number>,
      responseRateStats: latestKPI.responseRateStats as any,
      attendeeAnalytics: latestKPI.attendeeAnalytics as any || undefined,
      version: latestKPI.version,
      generatedBy: latestKPI.generatedBy || undefined,
      includeCompanyCalendars: latestKPI.includeCompanyCalendars || false
    };
    } catch (error) {
      console.warn('Error fetching KPIs (possibly due to schema changes), returning null:', error);
      return null;
    }
  }

  async getKPIHistory(limit = 10): Promise<CalendarKPIData[]> {
    const kpis = await this.prisma.calendarKPI.findMany({
      orderBy: {
        calculatedAt: 'desc'
      },
      take: limit
    });

    return kpis.map(kpi => ({
      id: kpi.id,
      calculatedAt: kpi.calculatedAt,
      lastUpdatedAt: kpi.lastUpdatedAt,
      periodStart: kpi.periodStart,
      periodEnd: kpi.periodEnd,
      totalEvents: kpi.totalEvents,
      upcomingEvents: kpi.upcomingEvents,
      completedEvents: kpi.completedEvents,
      cancelledEvents: kpi.cancelledEvents,
      totalUniqueAttendees: kpi.totalUniqueAttendees,
      averageAttendeesPerEvent: kpi.averageAttendeesPerEvent,
      totalEventHours: kpi.totalEventHours,
      averageEventDuration: kpi.averageEventDuration,
      calendarBreakdown: kpi.calendarBreakdown as Record<string, { 
        name: string; 
        eventCount: number;
        totalAttendees: number;
        averageAttendeesPerEvent: number;
      }>,
      eventStatusStats: kpi.eventStatusStats as any,
      meetingTypeStats: kpi.meetingTypeStats as any,
      dailyEventStats: kpi.dailyEventStats as Record<string, number>,
      hourlyDistribution: kpi.hourlyDistribution as Record<string, number>,
      responseRateStats: kpi.responseRateStats as any,
      attendeeAnalytics: kpi.attendeeAnalytics as any || undefined,
      version: kpi.version,
      generatedBy: kpi.generatedBy || undefined,
      includeCompanyCalendars: kpi.includeCompanyCalendars || false
    }));
  }

  async deleteOldKPIs(daysToKeep = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.calendarKPI.deleteMany({
      where: {
        calculatedAt: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }

  private calculateAttendeeAnalytics(events: GoogleCalendarEvent[]) {
    const attendeeData = new Map<string, {
      eventsCount: number;
      responses: string[];
      acceptedCount: number;
      totalInvitations: number;
    }>();

    const domainStats = new Map<string, { count: number; uniqueAttendees: Set<string> }>();
    const eventAttendeesCounts: number[] = [];
    const eventsWithMostAttendees: Array<{ eventId: string; title: string; attendeeCount: number }> = [];

    // Process each event
    events.forEach(event => {
      if (!event.attendees) return;

      const attendeeCount = event.attendees.length;
      eventAttendeesCounts.push(attendeeCount);

      // Track events with most attendees (top 5)
      if (eventsWithMostAttendees.length < 5) {
        eventsWithMostAttendees.push({
          eventId: event.id || '',
          title: event.summary || 'Sin título',
          attendeeCount
        });
      } else {
        // Replace if this event has more attendees than the smallest in the list
        const minIndex = eventsWithMostAttendees.reduce((minIdx, item, idx, arr) => {
          const currentMin = arr[minIdx];
          return currentMin && item.attendeeCount < currentMin.attendeeCount ? idx : minIdx;
        }, 0);
        
        const minEvent = eventsWithMostAttendees[minIndex];
        if (minEvent && attendeeCount > minEvent.attendeeCount) {
          eventsWithMostAttendees[minIndex] = {
            eventId: event.id || '',
            title: event.summary || 'Sin título',
            attendeeCount
          };
        }
      }

      // Process each attendee
      event.attendees.forEach(attendee => {
        if (!attendee.email) return;

        const email = attendee.email;
        
        // Update attendee data
        if (!attendeeData.has(email)) {
          attendeeData.set(email, {
            eventsCount: 0,
            responses: [],
            acceptedCount: 0,
            totalInvitations: 0
          });
        }

        const data = attendeeData.get(email)!;
        data.eventsCount++;
        data.totalInvitations++;
        
        if (attendee.responseStatus) {
          data.responses.push(attendee.responseStatus);
          if (attendee.responseStatus === 'accepted') {
            data.acceptedCount++;
          }
        }

        // Domain analysis
        const domain = email.split('@')[1] || 'unknown';
        if (!domainStats.has(domain)) {
          domainStats.set(domain, { count: 0, uniqueAttendees: new Set() });
        }
        const domainData = domainStats.get(domain)!;
        domainData.count++;
        domainData.uniqueAttendees.add(email);
      });
    });

    // Calculate most engaged attendees (top 10 by events and acceptance rate)
    const mostEngagedAttendees = Array.from(attendeeData.entries())
      .map(([email, data]) => ({
        email,
        eventsCount: data.eventsCount,
        acceptanceRate: data.totalInvitations > 0 
          ? Math.round((data.acceptedCount / data.totalInvitations) * 10000) / 100
          : 0
      }))
      .sort((a, b) => b.eventsCount - a.eventsCount || b.acceptanceRate - a.acceptanceRate)
      .slice(0, 10);

    // Calculate attendee frequency distribution
    const attendeeFrequency = {
      single: 0,
      occasional: 0,
      regular: 0,
      frequent: 0
    };

    attendeeData.forEach(data => {
      if (data.eventsCount === 1) attendeeFrequency.single++;
      else if (data.eventsCount <= 3) attendeeFrequency.occasional++;
      else if (data.eventsCount <= 5) attendeeFrequency.regular++;
      else attendeeFrequency.frequent++;
    });

    // Convert domain stats
    const domainBreakdown: Record<string, { count: number; uniqueAttendees: number }> = {};
    domainStats.forEach((data, domain) => {
      domainBreakdown[domain] = {
        count: data.count,
        uniqueAttendees: data.uniqueAttendees.size
      };
    });

    // Calculate response time stats (simplified - using response status as proxy)
    const responseTimeStats = {
      quickResponders: 0,
      normalResponders: 0,
      slowResponders: 0
    };

    attendeeData.forEach(data => {
      const respondedCount = data.responses.filter(r => r !== 'needsAction').length;
      const responseRate = data.totalInvitations > 0 ? respondedCount / data.totalInvitations : 0;
      
      if (responseRate > 0.8) responseTimeStats.quickResponders++;
      else if (responseRate > 0.5) responseTimeStats.normalResponders++;
      else responseTimeStats.slowResponders++;
    });

    // Sort events with most attendees
    eventsWithMostAttendees.sort((a, b) => b.attendeeCount - a.attendeeCount);

    return {
      mostEngagedAttendees,
      attendeeFrequency,
      domainBreakdown,
      responseTimeStats,
      invitationStats: {
        totalInvitationsSent: eventAttendeesCounts.reduce((sum, count) => sum + count, 0),
        averageAttendeesPerEvent: eventAttendeesCounts.length > 0 
          ? Math.round((eventAttendeesCounts.reduce((sum, count) => sum + count, 0) / eventAttendeesCounts.length) * 100) / 100
          : 0,
        maxAttendeesInEvent: eventAttendeesCounts.length > 0 ? Math.max(...eventAttendeesCounts) : 0,
        minAttendeesInEvent: eventAttendeesCounts.length > 0 ? Math.min(...eventAttendeesCounts) : 0,
        eventsWithMostAttendees
      }
    };
  }
}