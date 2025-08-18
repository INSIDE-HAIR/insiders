/**
 * Manual Resync API Endpoint
 * GET/POST/DELETE /api/video-conferencing/resync
 */
import { NextRequest, NextResponse } from "next/server";
import { ManualResyncService } from "@/features/video-conferencing/services/ManualResyncService";
import { VideoProvider } from "@prisma/client";
import { z } from "zod";

// Initialize resync service
const resyncService = new ManualResyncService();

// Validation schemas
const createResyncSchema = z.object({
  provider: z.enum(["ZOOM", "MEET", "VIMEO"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  videoSpaceId: z.string().optional(),
  includeParticipants: z.boolean().optional().default(true),
  includeRecordings: z.boolean().optional().default(true),
  includeTranscriptions: z.boolean().optional().default(true),
  forceUpdate: z.boolean().optional().default(false),
  requestedBy: z.string().min(1),
});

const retryResyncSchema = z.object({
  requestId: z.string().min(1),
});

const cancelResyncSchema = z.object({
  requestId: z.string().min(1),
});

// GET - Get resync requests and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const requestId = searchParams.get("requestId");

    switch (action) {
      case "stats":
        const stats = resyncService.getResyncStats();
        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            timestamp: new Date().toISOString(),
          },
        });

      case "request":
        if (!requestId) {
          return NextResponse.json(
            {
              success: false,
              error: "Request ID is required",
            },
            { status: 400 }
          );
        }

        const resyncRequest = resyncService.getResyncRequest(requestId);
        if (!resyncRequest) {
          return NextResponse.json(
            {
              success: false,
              error: "Resync request not found",
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: resyncRequest,
        });

      case "list":
        const status = searchParams.get("status");
        const provider = searchParams.get("provider") as VideoProvider;
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        let requests = resyncService.getAllResyncRequests();

        // Apply filters
        if (status) {
          requests = requests.filter((r) => r.status === status);
        }
        if (provider) {
          requests = requests.filter((r) => r.provider === provider);
        }

        // Sort by requested date (newest first)
        requests.sort(
          (a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()
        );

        // Apply pagination
        const totalCount = requests.length;
        const paginatedRequests = requests.slice(offset, offset + limit);

        return NextResponse.json({
          success: true,
          data: {
            requests: paginatedRequests,
            pagination: {
              total: totalCount,
              limit,
              offset,
              hasMore: offset + limit < totalCount,
            },
          },
        });

      default:
        // Return general resync information
        const allRequests = resyncService.getAllResyncRequests();
        const allStats = resyncService.getResyncStats();

        return NextResponse.json({
          success: true,
          data: {
            stats: allStats,
            recentRequests: allRequests
              .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
              .slice(0, 10),
            timestamp: new Date().toISOString(),
          },
        });
    }
  } catch (error) {
    console.error("Resync GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get resync information",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create new resync request or perform actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "create":
        // Create new resync request
        const createValidation = createResyncSchema.safeParse(body);
        if (!createValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid resync request data",
              details: createValidation.error.errors,
            },
            { status: 400 }
          );
        }

        const {
          provider,
          startDate,
          endDate,
          videoSpaceId,
          includeParticipants,
          includeRecordings,
          includeTranscriptions,
          forceUpdate,
          requestedBy,
        } = createValidation.data;

        const requestId = await resyncService.createResyncRequest(
          provider,
          new Date(startDate),
          new Date(endDate),
          {
            videoSpaceId,
            includeParticipants,
            includeRecordings,
            includeTranscriptions,
            forceUpdate,
            requestedBy,
          }
        );

        return NextResponse.json({
          success: true,
          message: "Resync request created successfully",
          data: {
            requestId,
            request: resyncService.getResyncRequest(requestId),
          },
        });

      case "retry":
        // Retry failed resync request
        const retryValidation = retryResyncSchema.safeParse(body);
        if (!retryValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid retry request data",
              details: retryValidation.error.errors,
            },
            { status: 400 }
          );
        }

        const retrySuccess = await resyncService.retryResyncRequest(
          retryValidation.data.requestId
        );

        if (!retrySuccess) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Cannot retry request - request not found or not in failed state",
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Resync request retry initiated",
          data: {
            requestId: retryValidation.data.requestId,
            request: resyncService.getResyncRequest(
              retryValidation.data.requestId
            ),
          },
        });

      case "cancel":
        // Cancel resync request
        const cancelValidation = cancelResyncSchema.safeParse(body);
        if (!cancelValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid cancel request data",
              details: cancelValidation.error.errors,
            },
            { status: 400 }
          );
        }

        const cancelSuccess = await resyncService.cancelResyncRequest(
          cancelValidation.data.requestId
        );

        if (!cancelSuccess) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Cannot cancel request - request not found or already completed",
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Resync request cancelled successfully",
          data: {
            requestId: cancelValidation.data.requestId,
            request: resyncService.getResyncRequest(
              cancelValidation.data.requestId
            ),
          },
        });

      case "cleanup":
        // Clean up old requests
        const olderThanDays = parseInt(body.olderThanDays || "30");
        const cleanedCount = resyncService.cleanupOldRequests(olderThanDays);

        return NextResponse.json({
          success: true,
          message: `Cleaned up ${cleanedCount} old resync requests`,
          data: {
            cleanedCount,
            olderThanDays,
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Use ?action=create, ?action=retry, ?action=cancel, or ?action=cleanup",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Resync POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process resync request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Cancel or delete resync requests
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    const action = searchParams.get("action");

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error: "Request ID is required",
        },
        { status: 400 }
      );
    }

    switch (action) {
      case "cancel":
        const cancelSuccess =
          await resyncService.cancelResyncRequest(requestId);

        if (!cancelSuccess) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Cannot cancel request - request not found or already completed",
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Resync request cancelled successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Use ?action=cancel",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Resync DELETE error:", error);

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
