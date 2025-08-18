/**
 * Individual Video Space API Routes
 * Handles GET, PATCH, DELETE operations for a specific video space
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/src/features/video-conferencing/middleware/authMiddleware";
import { createGlobalErrorHandler } from "@/src/features/video-conferencing/middleware/globalErrorHandler";
import { z } from "zod";

const prisma = new PrismaClient();
const globalErrorHandler = createGlobalErrorHandler(prisma);

// Validation schema for updating video space
const updateVideoSpaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  settings: z
    .object({
      maxParticipants: z.number().min(1).max(1000).optional(),
      requiresAuth: z.boolean().optional(),
      recordingEnabled: z.boolean().optional(),
      chatEnabled: z.boolean().optional(),
      screenShareEnabled: z.boolean().optional(),
      waitingRoomEnabled: z.boolean().optional(),
    })
    .optional(),
});

/**
 * GET /api/video-conferencing/spaces/[id]
 * Get a specific video space
 */
export const GET = globalErrorHandler.wrapApiHandlerWithContext(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const videoSpace = await prisma.videoSpace.findUnique({
      where: { id },
      include: {
        integrationAccount: true,
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

    return NextResponse.json(videoSpace);
  }
);

/**
 * PATCH /api/video-conferencing/spaces/[id]
 * Update a specific video space
 */
export const PATCH = globalErrorHandler.wrapApiHandlerWithContext(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateVideoSpaceSchema.parse(body);

    // Check if video space exists
    const existingSpace = await prisma.videoSpace.findUnique({
      where: { id },
    });

    if (!existingSpace) {
      return NextResponse.json(
        { error: "Video space not found" },
        { status: 404 }
      );
    }

    // Update the video space
    const updatedVideoSpace = await prisma.videoSpace.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        settings: validatedData.settings,
        updatedAt: new Date(),
      },
      include: {
        integrationAccount: true,
        _count: {
          select: {
            meetingRecords: true,
          },
        },
      },
    });

    return NextResponse.json(updatedVideoSpace);
  }
);

/**
 * DELETE /api/video-conferencing/spaces/[id]
 * Delete a specific video space
 */
export const DELETE = globalErrorHandler.wrapApiHandlerWithContext(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Check if video space exists
    const existingSpace = await prisma.videoSpace.findUnique({
      where: { id },
    });

    if (!existingSpace) {
      return NextResponse.json(
        { error: "Video space not found" },
        { status: 404 }
      );
    }

    // Delete related records first (if any)
    await prisma.meetingRecord.deleteMany({
      where: { videoSpaceId: id },
    });

    // Delete the video space
    await prisma.videoSpace.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  }
);
