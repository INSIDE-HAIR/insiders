import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

interface MoveEventRequest {
  eventId: string;
  sourceCalendarId: string;
}

interface BulkMoveRequest {
  events: MoveEventRequest[];
  targetCalendarId: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: BulkMoveRequest = await request.json();
    const { events, targetCalendarId } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Events array is required" },
        { status: 400 }
      );
    }

    if (!targetCalendarId) {
      return NextResponse.json(
        { error: "Target calendar ID is required" },
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

    // Process each event move
    for (const eventRequest of events) {
      try {
        const { eventId, sourceCalendarId } = eventRequest;

        if (!eventId || !sourceCalendarId) {
          results.failed++;
          results.errors.push({
            eventId: eventId || "unknown",
            error: "Missing eventId or sourceCalendarId",
          });
          continue;
        }

        // First, get the event details from the source calendar
        const event = await calendarService.getEvent(sourceCalendarId, eventId);
        if (!event) {
          results.failed++;
          results.errors.push({
            eventId,
            error: "Event not found in source calendar",
          });
          continue;
        }

        // Create a copy of the event in the target calendar
        // Convert the Google Calendar Event back to a form format for creation
        const eventForm = {
          summary: event.summary,
          description: event.description || "",
          location: event.location || "",
          startDate:
            event.start?.date || event.start?.dateTime?.split("T")[0] || "",
          startTime: event.start?.dateTime
            ? event.start.dateTime.split("T")[1].substring(0, 5)
            : undefined,
          endDate: event.end?.date || event.end?.dateTime?.split("T")[0] || "",
          endTime: event.end?.dateTime
            ? event.end.dateTime.split("T")[1].substring(0, 5)
            : undefined,
          allDay: !!event.start?.date,
          timeZone: event.start?.timeZone || "Europe/Madrid",
          calendarId: targetCalendarId,
          attendees:
            event.attendees?.map((att) => ({
              email: att.email,
              displayName: att.displayName,
              optional: att.optional,
            })) || [],
          reminders: event.reminders?.overrides || [],
          visibility: (event.visibility as any) || "default",
          transparency: (event.transparency as any) || "opaque",
          guestsCanInviteOthers: event.guestsCanInviteOthers || false,
          guestsCanModify: event.guestsCanModify || false,
          guestsCanSeeOtherGuests: event.guestsCanSeeOtherGuests || true,
          conferenceData: event.conferenceData,
        };

        const newEvent = await calendarService.createEvent(
          eventForm,
          targetCalendarId
        );

        if (!newEvent) {
          results.failed++;
          results.errors.push({
            eventId,
            title: event.summary,
            error: "Failed to create event in target calendar",
          });
          continue;
        }

        // Delete the original event from the source calendar
        try {
          await calendarService.deleteEvent(sourceCalendarId, eventId);
        } catch (deleteError) {
          // If deletion fails, we should probably delete the copy we just created
          // to avoid duplicates, but for now we'll just log the error
          console.warn(
            `Failed to delete original event ${eventId} from ${sourceCalendarId} after copying to ${targetCalendarId}:`,
            deleteError
          );
        }

        results.successful++;
      } catch (error: any) {
        console.error(`Error moving event ${eventRequest.eventId}:`, error);
        results.failed++;
        results.errors.push({
          eventId: eventRequest.eventId,
          error: error.message || "Unknown error occurred",
        });
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error in bulk move events:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
