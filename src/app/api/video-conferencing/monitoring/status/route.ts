/**
 * Monitoring Status API Routes
 * Handles monitoring status information
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusMonitoringService } from "@/features/video-conferencing/services/StatusMonitoringService";

const statusMonitoringService = new StatusMonitoringService();

/**
 * GET /api/video-conferencing/monitoring/status
 * Get current monitoring status for all video spaces
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const monitoringStatus = statusMonitoringService.getMonitoringStatus();

    return NextResponse.json({
      monitoringStatus,
      totalMonitored: monitoringStatus.filter((status) => status.isMonitoring)
        .length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Monitoring status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/video-conferencing/monitoring/status
 * Stop all monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "stopAll") {
      statusMonitoringService.stopAllMonitoring();

      return NextResponse.json({
        message: "All monitoring stopped",
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use \"stopAll\"' },
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
