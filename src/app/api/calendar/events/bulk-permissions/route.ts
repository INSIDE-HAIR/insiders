import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

interface PermissionsUpdateRequest {
  eventId: string;
  calendarId: string;
}

interface BulkPermissionsRequest {
  events: PermissionsUpdateRequest[];
  permissions: {
    guestsCanInviteOthers?: boolean;
    guestsCanModify?: boolean;
    guestsCanSeeOtherGuests?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: BulkPermissionsRequest = await request.json();
    const { events, permissions } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Events array is required" },
        { status: 400 }
      );
    }

    if (!permissions || Object.keys(permissions).length === 0) {
      return NextResponse.json(
        { error: "At least one permission field is required" },
        { status: 400 }
      );
    }

    // Initialize calendar service
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    const results = {
      processed: events.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{
        eventId: string;
        title?: string;
        error: string;
      }>,
    };

    // Process each event permission update
    for (const eventRequest of events) {
      try {
        const { eventId, calendarId } = eventRequest;

        if (!eventId || !calendarId) {
          results.failed++;
          results.errors.push({
            eventId: eventId || 'unknown',
            error: 'Missing eventId or calendarId',
          });
          continue;
        }

        // Get current event to preserve other properties
        const currentEvent = await calendarService.getEvent(calendarId, eventId);
        if (!currentEvent) {
          results.failed++;
          results.errors.push({
            eventId,
            error: 'Event not found',
          });
          continue;
        }

        // Create update data preserving current event properties and applying permission changes
        const eventForm = {
          summary: currentEvent.summary,
          description: currentEvent.description || '',
          location: currentEvent.location || '',
          startDate: currentEvent.start?.date || currentEvent.start?.dateTime?.split('T')[0] || '',
          startTime: currentEvent.start?.dateTime ? currentEvent.start.dateTime.split('T')[1].substring(0, 5) : undefined,
          endDate: currentEvent.end?.date || currentEvent.end?.dateTime?.split('T')[0] || '',
          endTime: currentEvent.end?.dateTime ? currentEvent.end.dateTime.split('T')[1].substring(0, 5) : undefined,
          allDay: !!currentEvent.start?.date,
          timeZone: currentEvent.start?.timeZone || 'Europe/Madrid',
          calendarId: calendarId,
          attendees: currentEvent.attendees?.map(att => ({
            email: att.email,
            displayName: att.displayName,
            optional: att.optional
          })) || [],
          reminders: currentEvent.reminders?.overrides || [],
          visibility: currentEvent.visibility as any || 'default',
          transparency: currentEvent.transparency as any || 'opaque',
          
          // Apply permission changes or keep current values
          guestsCanInviteOthers: permissions.guestsCanInviteOthers !== undefined 
            ? permissions.guestsCanInviteOthers 
            : (currentEvent.guestsCanInviteOthers || false),
          guestsCanModify: permissions.guestsCanModify !== undefined 
            ? permissions.guestsCanModify 
            : (currentEvent.guestsCanModify || false),
          guestsCanSeeOtherGuests: permissions.guestsCanSeeOtherGuests !== undefined 
            ? permissions.guestsCanSeeOtherGuests 
            : (currentEvent.guestsCanSeeOtherGuests || true),
            
          conferenceData: currentEvent.conferenceData
        };

        // Update the event with new permissions using the calendar service
        const updatedEvent = await calendarService.updateEvent(calendarId, eventId, eventForm);
        
        if (!updatedEvent) {
          results.failed++;
          results.errors.push({
            eventId,
            title: currentEvent.summary,
            error: 'Failed to update event permissions',
          });
          continue;
        }

        results.successful++;

      } catch (error: any) {
        console.error(`Error updating permissions for event ${eventRequest.eventId}:`, error);
        results.failed++;
        results.errors.push({
          eventId: eventRequest.eventId,
          error: error.message || 'Unknown error occurred',
        });
      }
    }

    return NextResponse.json(results);

  } catch (error: any) {
    console.error("Error in bulk permissions update:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}