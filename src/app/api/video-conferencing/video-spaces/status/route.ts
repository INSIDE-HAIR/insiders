/**
 * Video Spaces Status API Route
 * Handles batch status checking for multiple video spaces
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { VideoConferencingService } from "@/features/video-conferencing/services/VideoConferencingService";
import { z } from "zod";

// Initialize video conferencing service
const videoConferencingService = new VideoConferencingService({
  googleMeet: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
    scopes: ["https://www.googleapis.com/auth/meetings.space.created"],
  },
  zoom: {
    clientId: process.env.ZOOM_CLIENT_ID || "",
    clientSecret: process.env.ZOOM_CLIENT_SECRET || "",
    redirectUri: process.env.ZOOM_OAUTH_REDIRECT_URI || "",
    scopes: ["meeting:write", "meeting:read", "recording:read"],
  },
  vimeo: {
    clientId: process.env.VIMEO_CLIENT_ID || "",
    clientSecret: process.env.VIMEO_CLIENT_SECRET || "",
    redirectUri: process.env.VIMEO_OAUTH_REDIRECT_URI || "",
    scopes: ["create", "edit", "delete", "interact"],
  },
});

// Request schema for batch status check
const BatchStatusRequestSchema = z.object({
  videoSpaceIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"))
    .min(1)
    .max(50),
});

/**
 * POST /api/video-conferencing/video-spaces/status
 * Get real-time status for multiple video spaces
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { videoSpaceIds } = BatchStatusRequestSchema.parse(body);

    // Find video spaces belonging to the user
    const videoSpaces = await prisma.videoSpace.findMany({
      where: {
        id: { in: videoSpaceIds },
        ownerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        provider: true,
        status: true,
        providerRoomId: true,
        integrationAccountId: true,
        lastActiveAt: true,
      },
    });

    if (videoSpaces.length === 0) {
      return NextResponse.json(
        { error: "No video spaces found" },
        { status: 404 }
      );
    }

    // Prepare batch status check
    const statusCheckRequests = videoSpaces.map((space) => ({
      provider: space.provider,
      roomId: space.providerRoomId,
      integrationAccountId: space.integrationAccountId,
    }));

    // Get batch status from providers
    const batchStatusResult =
      await videoConferencingService.getBatchRoomStatus(statusCheckRequests);

    if (!batchStatusResult.success) {
      return NextResponse.json(
        {
          error: "Failed to get batch status",
          details: batchStatusResult.error,
        },
        { status: 500 }
      );
    }

    // Process results and update database
    const statusUpdates: Array<{
      id: string;
      name: string;
      provider: string;
      previousStatus: string;
      currentStatus: string | null;
      lastActiveAt: string | null;
      error?: string;
    }> = [];

    const dbUpdates: Array<Promise<any>> = [];

    for (let i = 0; i < videoSpaces.length; i++) {
      const space = videoSpaces[i];
      const statusResult = batchStatusResult.data![i];

      const statusUpdate = {
        id: space.id,
        name: space.name,
        provider: space.provider,
        previousStatus: space.status,
        currentStatus: statusResult.status,
        lastActiveAt: space.lastActiveAt?.toISOString() || null,
        error: statusResult.error,
      };

      statusUpdates.push(statusUpdate);

      // Update database if status changed
      if (statusResult.status && statusResult.status !== space.status) {
        const updateData: any = {
          status: statusResult.status,
          updatedAt: new Date(),
        };

        // Update lastActiveAt if room became active
        if (statusResult.status === "ACTIVE") {
          updateData.lastActiveAt = new Date();
          statusUpdate.lastActiveAt = updateData.lastActiveAt.toISOString();
        }

        dbUpdates.push(
          prisma.videoSpace.update({
            where: { id: space.id },
            data: updateData,
          })
        );
      }
    }

    // Execute all database updates
    if (dbUpdates.length > 0) {
      await Promise.allSettled(dbUpdates);
    }

    // Return status updates
    const response = {
      statusUpdates,
      summary: {
        total: statusUpdates.length,
        updated: dbUpdates.length,
        active: statusUpdates.filter((s) => s.currentStatus === "ACTIVE")
          .length,
        inactive: statusUpdates.filter((s) => s.currentStatus === "INACTIVE")
          .length,
        errors: statusUpdates.filter((s) => s.error).length,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error checking batch status:", error);

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
 * GET /api/video-conferencing/video-spaces/status
 * Get status summary for all user's video spaces
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get status summary from database
    const statusSummary = await prisma.videoSpace.groupBy({
      by: ["status", "provider"],
      where: {
        ownerId: session.user.id,
      },
      _count: {
        id: true,
      },
    });

    // Transform to more readable format
    const summary = {
      byStatus: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
      byProviderAndStatus: {} as Record<string, Record<string, number>>,
      total: 0,
    };

    statusSummary.forEach((item) => {
      const { status, provider, _count } = item;
      const count = _count.id;

      // By status
      summary.byStatus[status] = (summary.byStatus[status] || 0) + count;

      // By provider
      summary.byProvider[provider] =
        (summary.byProvider[provider] || 0) + count;

      // By provider and status
      if (!summary.byProviderAndStatus[provider]) {
        summary.byProviderAndStatus[provider] = {};
      }
      summary.byProviderAndStatus[provider][status] = count;

      // Total
      summary.total += count;
    });

    // Get recent activity
    const recentActivity = await prisma.videoSpace.findMany({
      where: {
        ownerId: session.user.id,
        lastActiveAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      select: {
        id: true,
        name: true,
        provider: true,
        status: true,
        lastActiveAt: true,
      },
      orderBy: {
        lastActiveAt: "desc",
      },
      take: 10,
    });

    const response = {
      summary,
      recentActivity: recentActivity.map((space) => ({
        ...space,
        lastActiveAt: space.lastActiveAt?.toISOString() || null,
      })),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error getting status summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
