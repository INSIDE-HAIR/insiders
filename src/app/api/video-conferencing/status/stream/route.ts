/**
 * Real-time Status Streaming API Route
 * Provides Server-Sent Events for real-time status updates
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusMonitoringService } from "@/features/video-conferencing/services/StatusMonitoringService";
import { VideoConferencingService } from "@/features/video-conferencing/services/VideoConferencingService";

// Initialize services
const videoConferencingConfig = {
  googleMeet: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI || "",
    scopes: ["https://www.googleapis.com/auth/meetings.space.created"],
  },
  zoom: {
    clientId: process.env.ZOOM_CLIENT_ID || "",
    clientSecret: process.env.ZOOM_CLIENT_SECRET || "",
    redirectUri: process.env.ZOOM_REDIRECT_URI || "",
    scopes: ["meeting:write", "meeting:read"],
  },
  vimeo: {
    clientId: process.env.VIMEO_CLIENT_ID || "",
    clientSecret: process.env.VIMEO_CLIENT_SECRET || "",
    redirectUri: process.env.VIMEO_REDIRECT_URI || "",
    scopes: ["create", "edit", "delete"],
  },
};

const videoConferencingService = new VideoConferencingService(
  videoConferencingConfig
);
const statusMonitoringService = new StatusMonitoringService(
  prisma,
  videoConferencingService
);

// =============================================================================
// GET /api/video-conferencing/status/stream
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const videoSpaceIds = searchParams
      .get("videoSpaceIds")
      ?.split(",")
      .filter(Boolean);
    const intervalMs = parseInt(searchParams.get("interval") || "30000", 10); // Default 30 seconds
    const provider = searchParams.get("provider") as
      | "MEET"
      | "ZOOM"
      | "VIMEO"
      | undefined;

    // Validate interval
    if (intervalMs < 10000 || intervalMs > 300000) {
      return NextResponse.json(
        { error: "Interval must be between 10 and 300 seconds" },
        { status: 400 }
      );
    }

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    let isActive = true;

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({
          type: "connected",
          timestamp: new Date().toISOString(),
          message: "Status monitoring stream connected",
        })}\\n\\n`;

        controller.enqueue(encoder.encode(initialMessage));

        // Function to send status updates
        const sendStatusUpdate = async () => {
          if (!isActive) return;

          try {
            const result = await statusMonitoringService.checkBatchStatus({
              videoSpaceIds,
              ownerId: session.user.id,
              provider,
              batchSize: 20,
              timeout: 25000, // Slightly less than interval
            });

            if (result.success) {
              const message = `data: ${JSON.stringify({
                type: "status_update",
                timestamp: new Date().toISOString(),
                data: result.data,
              })}\\n\\n`;

              controller.enqueue(encoder.encode(message));
            } else {
              const errorMessage = `data: ${JSON.stringify({
                type: "error",
                timestamp: new Date().toISOString(),
                error: result.error,
                code: result.code,
              })}\\n\\n`;

              controller.enqueue(encoder.encode(errorMessage));
            }
          } catch (error) {
            console.error("Error in status stream:", error);

            const errorMessage = `data: ${JSON.stringify({
              type: "error",
              timestamp: new Date().toISOString(),
              error: "Internal server error",
              details: error instanceof Error ? error.message : "Unknown error",
            })}\\n\\n`;

            controller.enqueue(encoder.encode(errorMessage));
          }
        };

        // Send initial status update
        sendStatusUpdate();

        // Set up periodic updates
        const intervalId = setInterval(sendStatusUpdate, intervalMs);

        // Clean up when stream is closed
        const cleanup = () => {
          isActive = false;
          clearInterval(intervalId);
        };

        // Handle client disconnect
        request.signal.addEventListener("abort", cleanup);

        // Auto-cleanup after 30 minutes to prevent resource leaks
        setTimeout(
          () => {
            cleanup();
            controller.close();
          },
          30 * 60 * 1000
        );
      },

      cancel() {
        isActive = false;
      },
    });

    // Return Server-Sent Events response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/video-conferencing/status/stream:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
