import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";

interface DateTimeUpdateRequest {
  eventId: string;
  calendarId: string;
  updateData: {
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
  };
}

interface BulkDateTimeRequest {
  updates: DateTimeUpdateRequest[];
}

interface UpdateResult {
  eventId: string;
  success: boolean;
  error?: string;
  title?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body: BulkDateTimeRequest = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Updates array is required" },
        { status: 400 }
      );
    }

    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    const results: UpdateResult[] = [];
    let successful = 0;
    let failed = 0;

    // Process each update
    for (const update of updates) {
      try {
        const { eventId, calendarId, updateData } = update;

        if (!eventId || !calendarId || !updateData) {
          results.push({
            eventId: eventId || "unknown",
            success: false,
            error: "Missing eventId, calendarId, or updateData",
          });
          failed++;
          continue;
        }

        // Get current event for validation and context
        const currentEvent = await calendarService.getEvent(calendarId, eventId);
        if (!currentEvent) {
          results.push({
            eventId,
            success: false,
            error: "Event not found",
            title: "Unknown event",
          });
          failed++;
          continue;
        }

        // Validate date/time logic similar to handleUpdateDateTime
        let finalUpdateData = { ...updateData };

        // Handle time-only updates for all-day events
        // If we're changing an all-day event to a timed event, make sure we handle it correctly
        if (updateData.start?.dateTime && currentEvent.start?.date) {
          // Converting from all-day to timed event - this is a time-only update
          // The new start dateTime already has the correct date and new time
          const newStartDateTime = new Date(updateData.start.dateTime);
          
          if (updateData.end?.dateTime) {
            const newEndDateTime = new Date(updateData.end.dateTime);
            // Validate that end is after start
            if (newEndDateTime <= newStartDateTime) {
              const minDuration = 15 * 60 * 1000; // 15 minutes minimum
              const adjustedEnd = new Date(newStartDateTime.getTime() + minDuration);
              finalUpdateData.end = { dateTime: adjustedEnd.toISOString() };
            }
          }
        } 
        // If updating start date, ensure duration logic is preserved
        else if (updateData.start && currentEvent) {
          const currentStart = new Date(
            currentEvent.start?.dateTime || currentEvent.start?.date || ""
          );
          const currentEnd = new Date(
            currentEvent.end?.dateTime || currentEvent.end?.date || ""
          );
          const newStart = new Date(
            updateData.start.dateTime || updateData.start.date || ""
          );

          // If we have both start and end in the update, validate end is after start
          if (updateData.end) {
            const newEnd = new Date(
              updateData.end.dateTime || updateData.end.date || ""
            );
            
            if (newEnd <= newStart) {
              // Adjust end to be at least 15 minutes after start for timed events
              const minDuration = updateData.start.dateTime ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000; // 15 min or 1 day
              const adjustedEnd = new Date(newStart.getTime() + minDuration);
              
              finalUpdateData.end = updateData.start.dateTime
                ? { dateTime: adjustedEnd.toISOString() }
                : { date: adjustedEnd.toISOString().split("T")[0] };
            }
          }
        }

        // If only updating end date, validate it's after start
        if (updateData.end && !updateData.start && currentEvent) {
          const currentStart = new Date(
            currentEvent.start?.dateTime || currentEvent.start?.date || ""
          );
          const newEnd = new Date(
            updateData.end.dateTime || updateData.end.date || ""
          );

          if (newEnd <= currentStart) {
            results.push({
              eventId,
              success: false,
              error: "End date must be after start date",
              title: currentEvent.summary,
            });
            failed++;
            continue;
          }
        }

        // Perform the update using Google Calendar API directly
        const calendar = (calendarService as any).calendar;
        
        const updatedEvent = await calendar.events.patch({
          calendarId,
          eventId,
          requestBody: finalUpdateData,
        });

        if (updatedEvent.data) {
          results.push({
            eventId,
            success: true,
            title: currentEvent.summary,
          });
          successful++;
        } else {
          throw new Error("Update returned no event");
        }
      } catch (error: any) {
        console.error(`Failed to update event ${update.eventId}:`, error);
        results.push({
          eventId: update.eventId,
          success: false,
          error: error.message || "Unknown error",
        });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: updates.length,
      successful,
      failed,
      results: failed > 0 ? results.filter(r => !r.success) : [], // Only return errors if any
      summary: `${successful} updated successfully${failed > 0 ? `, ${failed} failed` : ""}`,
    });
  } catch (error: any) {
    console.error("Bulk datetime update error:", error);
    return NextResponse.json(
      {
        error: "Error processing bulk datetime update",
        details: error.message,
      },
      { status: 500 }
    );
  }
}