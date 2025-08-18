/**
 * Individual Video Space Status API Route
 * Handles real-time status monitoring for a specific video space
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
// GET /api/video-conferencing/status/[id]
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate ObjectId format
    const videoSpaceId = params.id;
    if (!videoSpaceId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid video space ID format" },
        { status: 400 }
      );
    }

    // Get real-time status for the video space
    const result = await statusMonitoringService.getVideoSpaceStatus(
      videoSpaceId,
      session.user.id
    );

    if (!result.success) {
      const statusCode = result.code === "VIDEO_SPACE_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(
      `Error in GET /api/video-conferencing/status/${params.id}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
