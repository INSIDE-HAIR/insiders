/**
 * Individual Video Space Monitoring API Routes
 * Handles monitoring for specific video spaces
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusMonitoringService } from "@/features/video-conferencing/services/StatusMonitoringService";
import { prisma } from "@/lib/prisma";

const statusMonitoringService = new StatusMonitoringService();

/**
 * GET /api/video-conferencing/monitoring/[id]
 * Check status for a specific video space
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid video space ID format" },
        { status: 400 }
      );
    }

    // Check if video space exists and user has access
    const videoSpace = await prisma.videoSpace.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!videoSpace) {
      return NextResponse.json(
        { error: "Video space not found" },
        { status: 404 }
      );
    }

    const statusUpdate =
      await statusMonitoringService.checkVideoSpaceStatus(id);

    return NextResponse.json(statusUpdate);
  } catch (error) {
    console.error("Individual status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/video-conferencing/monitoring/[id]
 * Start/stop monitoring for a specific video space
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid video space ID format" },
        { status: 400 }
      );
    }

    // Check if video space exists and user has access
    const videoSpace = await prisma.videoSpace.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!videoSpace) {
      return NextResponse.json(
        { error: "Video space not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action, intervalMs } = body;

    if (action === "start") {
      const interval = intervalMs || 300000; // Default 5 minutes
      statusMonitoringService.startMonitoring(id, interval);

      return NextResponse.json({
        message: "Monitoring started",
        videoSpaceId: id,
        intervalMs: interval,
      });
    } else if (action === "stop") {
      statusMonitoringService.stopMonitoring(id);

      return NextResponse.json({
        message: "Monitoring stopped",
        videoSpaceId: id,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use \"start\" or \"stop\"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Monitoring control error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
