/**
 * Video Spaces API Routes
 * Handles CRUD operations for video conferencing spaces
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  CreateVideoSpaceRequestSchema,
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

// Query parameters schema for GET requests
const VideoSpaceQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional()
    .default("20"),
  provider: z.enum(["MEET", "ZOOM", "VIMEO"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DISABLED", "EXPIRED"]).optional(),
  cohort: z.string().optional(),
  search: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  sortBy: z
    .enum(["name", "createdAt", "updatedAt", "lastActiveAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * GET /api/video-conferencing/video-spaces
 * Retrieve video spaces with filtering, pagination, and search
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = VideoSpaceQuerySchema.parse(queryParams);
    const {
      page,
      limit,
      provider,
      status,
      cohort,
      search,
      tags,
      sortBy,
      sortOrder,
    } = validatedQuery;

    // Build where clause
    const where: any = {
      ownerId: session.user.id,
    };

    if (provider) {
      where.provider = provider;
    }

    if (status) {
      where.status = status;
    }

    if (cohort) {
      where.cohort = cohort;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      where.tags = {
        hasSome: tagArray,
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute query with pagination
    const [videoSpaces, totalCount] = await Promise.all([
      prisma.videoSpace.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          _count: {
            select: {
              meetingRecords: true,
            },
          },
        },
      }),
      prisma.videoSpace.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Transform response
    const response = {
      data: videoSpaces,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        provider,
        status,
        cohort,
        search,
        tags: tags ? tags.split(",") : undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching video spaces:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
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
 * POST /api/video-conferencing/video-spaces
 * Create a new video space
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
    const validatedData = CreateVideoSpaceRequestSchema.parse(body);

    // Verify integration account belongs to user
    const integrationAccount = await prisma.integrationAccount.findFirst({
      where: {
        id: validatedData.integrationAccountId,
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    if (!integrationAccount) {
      return NextResponse.json(
        { error: "Integration account not found or inactive" },
        { status: 404 }
      );
    }

    // Verify provider matches
    if (integrationAccount.provider !== validatedData.provider) {
      return NextResponse.json(
        { error: "Provider mismatch with integration account" },
        { status: 400 }
      );
    }

    // Create room with provider service
    const roomResult = await videoConferencingService.createRoom(
      validatedData.provider,
      validatedData.config,
      validatedData.integrationAccountId
    );

    if (!roomResult.success) {
      return NextResponse.json(
        {
          error: "Failed to create room with provider",
          details: roomResult.error,
        },
        { status: 400 }
      );
    }

    // Extract provider-specific data
    const providerData = roomResult.data;
    const providerRoomId = videoConferencingService.extractRoomId(
      validatedData.provider,
      providerData
    );
    const providerJoinUri = videoConferencingService.formatRoomUrl(
      validatedData.provider,
      providerData
    );

    // Create video space in database
    const videoSpace = await prisma.videoSpace.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        provider: validatedData.provider,
        status: "ACTIVE",
        providerRoomId,
        providerJoinUri,
        providerData,
        settings: validatedData.config,
        ownerId: session.user.id,
        cohort: validatedData.cohort,
        tags: validatedData.tags || [],
        integrationAccountId: validatedData.integrationAccountId,
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
      },
    });

    // Validate response
    const validatedResponse = VideoSpaceResponseSchema.parse({
      ...videoSpace,
      createdAt: videoSpace.createdAt.toISOString(),
      updatedAt: videoSpace.updatedAt.toISOString(),
      lastActiveAt: videoSpace.lastActiveAt?.toISOString() || null,
    });

    return NextResponse.json(validatedResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating video space:", error);

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
