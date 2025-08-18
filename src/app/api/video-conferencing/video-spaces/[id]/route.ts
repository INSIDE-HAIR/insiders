/**
 * Individual Video Space API Routes
 * Handles operations on specific video spaces by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  UpdateVideoSpaceRequestSchema,
  VideoSpaceResponseSchema,
} from "@/features/video-conferencing/validation";
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

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/video-conferencing/video-spaces/[id]
 * Retrieve a specific video space by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
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

    // Find video space
    const videoSpace = await prisma.videoSpace.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        integrationAccount: {
          select: {
            id: true,
            provider: true,
            accountName: true,
            status: true,
          },
        },
        aliases: {
          where: { isActive: true },
          select: {
            id: true,
            alias: true,
            accessCount: true,
            lastAccessedAt: true,
          },
        },
        meetingRecords: {
          take: 5,
          orderBy: { startTime: "desc" },
          select: {
            id: true,
            providerMeetingId: true,
            title: true,
            startTime: true,
            endTime: true,
            duration: true,
            status: true,
            totalParticipants: true,
          },
        },
        _count: {
          select: {
            meetingRecords: true,
          },
        },
      },
    });

    if (!videoSpace) {
      return NextResponse.json(
        { error: "Video space not found" },
        { status: 404 }
      );
    }

    // Get real-time status from provider
    let currentStatus = videoSpace.status;
    try {
      const statusResult = await videoConferencingService.getRoomStatus(
        videoSpace.provider,
        videoSpace.providerRoomId,
        videoSpace.integrationAccountId
      );

      if (statusResult.success) {
        currentStatus = statusResult.data;

        // Update status in database if changed
        if (currentStatus !== videoSpace.status) {
          await prisma.videoSpace.update({
            where: { id },
            data: {
              status: currentStatus,
              lastActiveAt:
                currentStatus === "ACTIVE"
                  ? new Date()
                  : videoSpace.lastActiveAt,
            },
          });
        }
      }
    } catch (error) {
      console.warn("Failed to get real-time status:", error);
    }

    // Transform response
    const response = {
      ...videoSpace,
      status: currentStatus,
      createdAt: videoSpace.createdAt.toISOString(),
      updatedAt: videoSpace.updatedAt.toISOString(),
      lastActiveAt: videoSpace.lastActiveAt?.toISOString() || null,
      meetingRecords: videoSpace.meetingRecords.map((record) => ({
        ...record,
        startTime: record.startTime.toISOString(),
        endTime: record.endTime?.toISOString() || null,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching video space:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/video-conferencing/video-spaces/[id]
 * Update a specific video space
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateVideoSpaceRequestSchema.parse(body);

    // Find existing video space
    const existingVideoSpace = await prisma.videoSpace.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
      include: {
        integrationAccount: true,
      },
    });

    if (!existingVideoSpace) {
      return NextResponse.json(
        { error: "Video space not found" },
        { status: 404 }
      );
    }

    // Update provider room if config changed
    let providerUpdateResult = null;
    if (validatedData.config) {
      providerUpdateResult = await videoConferencingService.updateRoom(
        existingVideoSpace.provider,
        existingVideoSpace.providerRoomId,
        validatedData.config,
        existingVideoSpace.integrationAccountId
      );

      if (!providerUpdateResult.success) {
        return NextResponse.json(
          {
            error: "Failed to update room with provider",
            details: providerUpdateResult.error,
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }

    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    if (validatedData.cohort !== undefined) {
      updateData.cohort = validatedData.cohort;
    }

    if (validatedData.tags !== undefined) {
      updateData.tags = validatedData.tags;
    }

    if (validatedData.addedToCalendar !== undefined) {
      updateData.addedToCalendar = validatedData.addedToCalendar;
    }

    if (validatedData.calendarEventId !== undefined) {
      updateData.calendarEventId = validatedData.calendarEventId;
    }

    if (validatedData.config !== undefined) {
      updateData.settings = validatedData.config;

      // Update provider data if available
      if (providerUpdateResult?.data) {
        updateData.providerData = providerUpdateResult.data;
        updateData.providerJoinUri = videoConferencingService.formatRoomUrl(
          existingVideoSpace.provider,
          providerUpdateResult.data
        );
      }
    }

    // Update video space in database
    const updatedVideoSpace = await prisma.videoSpace.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        integrationAccount: {
          select: {
            id: true,
            provider: true,
            accountName: true,
            status: true,
          },
        },
        aliases: {
          where: { isActive: true },
          select: {
            id: true,
            alias: true,
            accessCount: true,
            lastAccessedAt: true,
          },
        },
      },
    });

    // Transform response
    const response = {
      ...updatedVideoSpace,
      createdAt: updatedVideoSpace.createdAt.toISOString(),
      updatedAt: updatedVideoSpace.updatedAt.toISOString(),
      lastActiveAt: updatedVideoSpace.lastActiveAt?.toISOString() || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating video space:", error);

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
 * DELETE /api/video-conferencing/video-spaces/[id]
 * Delete a specific video space (logical deletion)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
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

    // Find existing video space
    const existingVideoSpace = await prisma.videoSpace.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!existingVideoSpace) {
      return NextResponse.json(
        { error: "Video space not found" },
        { status: 404 }
      );
    }

    // Check for query parameter to determine deletion type
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // Hard delete - remove from provider and database
      try {
        // Delete from provider first
        await videoConferencingService.deleteRoom(
          existingVideoSpace.provider,
          existingVideoSpace.providerRoomId,
          existingVideoSpace.integrationAccountId
        );
      } catch (error) {
        console.warn("Failed to delete room from provider:", error);
        // Continue with database deletion even if provider deletion fails
      }

      // Delete from database (cascade will handle related records)
      await prisma.videoSpace.delete({
        where: { id },
      });

      return NextResponse.json(
        { message: "Video space permanently deleted" },
        { status: 200 }
      );
    } else {
      // Soft delete - mark as disabled
      const updatedVideoSpace = await prisma.videoSpace.update({
        where: { id },
        data: {
          status: "DISABLED",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          message: "Video space disabled",
          id: updatedVideoSpace.id,
          status: updatedVideoSpace.status,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error deleting video space:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
