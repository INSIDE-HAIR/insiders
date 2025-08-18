/**
 * Video Spaces API Routes
 * Handles CRUD operations for video spaces
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/src/features/video-conferencing/middleware/authMiddleware";
import { createGlobalErrorHandler } from "@/src/features/video-conferencing/middleware/globalErrorHandler";
import { z } from "zod";

const prisma = new PrismaClient();
const globalErrorHandler = createGlobalErrorHandler(prisma);

// Validation schemas
const createVideoSpaceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  provider: z.enum(["MEET", "ZOOM", "VIMEO"]),
  scheduledStartTime: z.string().optional(),
  scheduledEndTime: z.string().optional(),
  maxParticipants: z.number().min(1).max(1000).optional(),
  alias: z.string().optional(),
  requiresAuth: z.boolean().default(false),
  recordingEnabled: z.boolean().default(false),
  chatEnabled: z.boolean().default(true),
  screenShareEnabled: z.boolean().default(true),
  waitingRoomEnabled: z.boolean().default(false),
  integrationAccountId: z.string().min(1),
});

const listVideoSpacesSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
  provider: z.enum(["MEET", "ZOOM", "VIMEO"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DISABLED", "EXPIRED"]).optional(),
  search: z.string().optional(),
});

/**
 * GET /api/video-conferencing/spaces
 * List video spaces with filtering and pagination
 */
export const GET = globalErrorHandler.wrapApiHandler(
  async (request: NextRequest) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedParams = listVideoSpacesSchema.parse(queryParams);

    const page = validatedParams.page || 1;
    const limit = validatedParams.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (validatedParams.provider) {
      where.provider = validatedParams.provider;
    }

    if (validatedParams.status) {
      where.status = validatedParams.status;
    }

    if (validatedParams.search) {
      where.OR = [
        { name: { contains: validatedParams.search, mode: "insensitive" } },
        {
          description: {
            contains: validatedParams.search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Execute queries
    const [videoSpaces, total] = await Promise.all([
      prisma.videoSpace.findMany({
        where,
        skip,
        take: limit,
        include: {
          integrationAccount: true,
          _count: {
            select: {
              meetingRecords: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.videoSpace.count({ where }),
    ]);

    const result = {
      videoSpaces,
      total,
      page,
      limit,
      hasMore: skip + videoSpaces.length < total,
    };

    return NextResponse.json(result);
  }
);

/**
 * POST /api/video-conferencing/spaces
 * Create a new video space
 */
export const POST = globalErrorHandler.wrapApiHandler(
  async (request: NextRequest) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createVideoSpaceSchema.parse(body);

    // Check if integration account exists and belongs to the user
    const integrationAccount = await prisma.integrationAccount.findFirst({
      where: {
        id: validatedData.integrationAccountId,
        userId: user.id,
      },
    });

    if (!integrationAccount) {
      return NextResponse.json(
        { error: "Integration account not found or access denied" },
        { status: 400 }
      );
    }

    // Create the video space
    const videoSpace = await prisma.videoSpace.create({
      data: {
        name: validatedData.title,
        description: validatedData.description,
        provider: validatedData.provider,
        status: "ACTIVE",
        providerRoomId: `${validatedData.provider.toLowerCase()}_${Date.now()}`,
        providerJoinUri: `https://mock-${validatedData.provider.toLowerCase()}.com/join/${Date.now()}`,
        ownerId: user.id,
        alias: validatedData.alias,
        maxParticipants: validatedData.maxParticipants,
        requiresAuth: validatedData.requiresAuth,
        recordingEnabled: validatedData.recordingEnabled,
        chatEnabled: validatedData.chatEnabled,
        screenShareEnabled: validatedData.screenShareEnabled,
        waitingRoomEnabled: validatedData.waitingRoomEnabled,
        scheduledStartTime: validatedData.scheduledStartTime
          ? new Date(validatedData.scheduledStartTime)
          : null,
        scheduledEndTime: validatedData.scheduledEndTime
          ? new Date(validatedData.scheduledEndTime)
          : null,
        integrationAccountId: validatedData.integrationAccountId,
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

    return NextResponse.json(videoSpace, { status: 201 });
  }
);
