/**
 * Meeting Data Synchronization API Endpoint
 * GET/POST /api/video-conferencing/sync
 */

import { NextRequest, NextResponse } from "next/server";
import {
  MeetingDataSyncService,
  SyncOptions,
} from "@/features/video-conferencing/services/MeetingDataSyncService";
import { WebhookEvent } from "@/features/video-conferencing/services/WebhookRoutingService";
import { VideoProvider } from "@prisma/client";
import { z } from "zod";

// Initialize sync service
const syncService = new MeetingDataSyncService();

// Validation schemas
const manualSyncSchema = z.object({
  provider: z.enum(["ZOOM", "MEET", "VIMEO"]),
  meetingId: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.record(z.any()).optional(),
  options: z
    .object({
      forceUpdate: z.boolean().optional(),
      includeParticipants: z.boolean().optional(),
      includeRecordings: z.boolean().optional(),
      includeTranscriptions: z.boolean().optional(),
      batchSize: z.number().int().min(1).max(1000).optional(),
    })
    .optional(),
});

const batchSyncSchema = z.object({
  events: z
    .array(
      z.object({
        provider: z.enum(["ZOOM", "MEET", "VIMEO"]),
        meetingId: z.string().min(1),
        eventType: z.string().min(1),
        payload: z.record(z.any()).optional(),
        timestamp: z.string().datetime().optional(),
      })
    )
    .min(1)
    .max(100),
  options: z
    .object({
      forceUpdate: z.boolean().optional(),
      includeParticipants: z.boolean().optional(),
      includeRecordings: z.boolean().optional(),
      includeTranscriptions: z.boolean().optional(),
      batchSize: z.number().int().min(1).max(1000).optional(),
    })
    .optional(),
});

// GET - Get sync status and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats":
        const stats = syncService.getSyncStats();
        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            timestamp: new Date().toISOString(),
          },
        });

      case "health":
        const healthStats = syncService.getSyncStats();
        const isHealthy =
          healthStats.queueLength < 1000 && !healthStats.processing;

        return NextResponse.json(
          {
            success: true,
            data: {
              healthy: isHealthy,
              status: isHealthy ? "operational" : "degraded",
              ...healthStats,
              timestamp: new Date().toISOString(),
            },
          },
          {
            status: isHealthy ? 200 : 503,
          }
        );

      default:
        // Return general sync information
        return NextResponse.json({
          success: true,
          data: {
            stats: syncService.getSyncStats(),
            supportedProviders: ["ZOOM", "MEET", "VIMEO"],
            supportedEventTypes: [
              "meeting.started",
              "meeting.ended",
              "meeting.participant_joined",
              "meeting.participant_left",
              "recording.completed",
              "recording.transcript_completed",
            ],
            timestamp: new Date().toISOString(),
          },
        });
    }
  } catch (error) {
    console.error("Sync GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get sync information",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Trigger manual synchronization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "manual":
        // Manual single event sync
        const manualValidation = manualSyncSchema.safeParse(body);
        if (!manualValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid manual sync data",
              details: manualValidation.error.errors,
            },
            { status: 400 }
          );
        }

        const { provider, meetingId, eventType, payload, options } =
          manualValidation.data;

        // Create webhook event for sync
        const webhookEvent: WebhookEvent = {
          id: `manual_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          provider,
          eventType,
          meetingId,
          userId: undefined,
          timestamp: new Date(),
          payload: payload || {},
          processed: false,
          retryCount: 0,
        };

        const syncResult = await syncService.syncFromWebhook(
          webhookEvent,
          options || {}
        );

        return NextResponse.json({
          success: true,
          data: {
            syncResult,
            eventId: webhookEvent.id,
            timestamp: new Date().toISOString(),
          },
        });

      case "batch":
        // Batch sync multiple events
        const batchValidation = batchSyncSchema.safeParse(body);
        if (!batchValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid batch sync data",
              details: batchValidation.error.errors,
            },
            { status: 400 }
          );
        }

        const { events, options: batchOptions } = batchValidation.data;
        const batchResults = [];

        for (const eventData of events) {
          const webhookEvent: WebhookEvent = {
            id: `batch_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            provider: eventData.provider,
            eventType: eventData.eventType,
            meetingId: eventData.meetingId,
            userId: undefined,
            timestamp: eventData.timestamp
              ? new Date(eventData.timestamp)
              : new Date(),
            payload: eventData.payload || {},
            processed: false,
            retryCount: 0,
          };

          try {
            const syncResult = await syncService.syncFromWebhook(
              webhookEvent,
              batchOptions || {}
            );
            batchResults.push({
              eventId: webhookEvent.id,
              meetingId: eventData.meetingId,
              success: syncResult.success,
              result: syncResult,
            });
          } catch (error) {
            batchResults.push({
              eventId: webhookEvent.id,
              meetingId: eventData.meetingId,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        const successCount = batchResults.filter((r) => r.success).length;
        const failureCount = batchResults.length - successCount;

        return NextResponse.json({
          success: true,
          data: {
            totalEvents: batchResults.length,
            successCount,
            failureCount,
            results: batchResults,
            timestamp: new Date().toISOString(),
          },
        });

      case "queue":
        // Queue events for async processing
        const queueValidation = batchSyncSchema.safeParse(body);
        if (!queueValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid queue data",
              details: queueValidation.error.errors,
            },
            { status: 400 }
          );
        }

        const { events: queueEvents, options: queueOptions } =
          queueValidation.data;

        for (const eventData of queueEvents) {
          const webhookEvent: WebhookEvent = {
            id: `queued_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            provider: eventData.provider,
            eventType: eventData.eventType,
            meetingId: eventData.meetingId,
            userId: undefined,
            timestamp: eventData.timestamp
              ? new Date(eventData.timestamp)
              : new Date(),
            payload: eventData.payload || {},
            processed: false,
            retryCount: 0,
          };

          await syncService.queueSync(webhookEvent, queueOptions || {});
        }

        return NextResponse.json({
          success: true,
          data: {
            queuedEvents: queueEvents.length,
            queueStats: syncService.getSyncStats(),
            timestamp: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Use ?action=manual, ?action=batch, or ?action=queue",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Sync POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process sync request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Clear sync queue or reset sync state
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "queue":
        syncService.clearSyncQueue();
        return NextResponse.json({
          success: true,
          message: "Sync queue cleared successfully",
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Use ?action=queue",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Sync DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process delete request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
