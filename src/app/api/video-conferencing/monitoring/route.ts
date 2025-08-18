/**
 * Video Conferencing Monitoring API Routes
 * Handles real-time status monitoring endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusMonitoringService } from "@/features/video-conferencing/services/StatusMonitoringService";
import { z } from "zod";

const statusMonitoringService = new StatusMonitoringService();

// Validation schemas
const BatchStatusCheckSchema = z.object({
  videoSpaceIds: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
  ),
});

/**
 * POST /api/video-conferencing/monitoring
 * Check status for multiple video spaces
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { videoSpaceIds } = BatchStatusCheckSchema.parse(body);

    const result =
      await statusMonitoringService.checkMultipleVideoSpacesStatus(
        videoSpaceIds
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Batch status check error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video-conferencing/monitoring
 * Get status summary and recent activity
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("includeAll") === "true";

    // If includeAll is false, only show user's own video spaces
    const userId = includeAll ? undefined : session.user.id;

    const summary = await statusMonitoringService.getStatusSummary(userId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Status summary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
