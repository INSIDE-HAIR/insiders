/**
 * Video Space Status Monitoring API Routes
 * Handles real-time status monitoring for video spaces
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusMonitoringService } from "@/features/video-conferencing/services/StatusMonitoringService";
import { VideoConferencingService } from "@/features/video-conferencing/services/VideoConferencingService";
import { z } from "zod";

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

// Validation schemas
const statusCheckQuerySchema = z.object({
  videoSpaceIds: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val.split(",").filter((id) => id.match(/^[0-9a-fA-F]{24}$/))
        : undefined
    ),
  provider: z.enum(["MEET", "ZOOM", "VIMEO"]).optional(),
  batchSize: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(50))
    .default("10"),
  timeout: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(5000).max(60000))
    .default("30000"),
});

const singleStatusQuerySchema = z.object({
  videoSpaceId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid video space ID format"),
});

// =============================================================================
// GET /api/video-conferencing/status
// =============================================================================

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

    const validationResult = statusCheckQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { videoSpaceIds, provider, batchSize, timeout } =
      validationResult.data;

    // Check batch status
    const result = await statusMonitoringService.checkBatchStatus({
      videoSpaceIds,
      ownerId: session.user.id,
      provider,
      batchSize,
      timeout,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/video-conferencing/status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/video-conferencing/status
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const videoSpaceIdsSchema = z.object({
      videoSpaceIds: z
        .array(
          z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid video space ID format")
        )
        .min(1, "At least one video space ID is required")
        .max(50, "Cannot check more than 50 video spaces at once"),
      batchSize: z.number().int().min(1).max(20).optional().default(10),
      timeout: z.number().int().min(5000).max(60000).optional().default(30000),
    });

    const validationResult = videoSpaceIdsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { videoSpaceIds, batchSize, timeout } = validationResult.data;

    // Check batch status for specific video spaces
    const result = await statusMonitoringService.checkBatchStatus({
      videoSpaceIds,
      ownerId: session.user.id,
      batchSize,
      timeout,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in POST /api/video-conferencing/status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
