/**
 * Alias Statistics API Route
 * Handles alias usage statistics and analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AliasService } from "@/features/video-conferencing/services/AliasService";
import { z } from "zod";

const aliasService = new AliasService(prisma);

// Validation schema for stats query
const aliasStatsQuerySchema = z.object({
  videoSpaceId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid video space ID format")
    .optional(),
});

// =============================================================================
// GET /api/video-conferencing/aliases/stats
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

    const validationResult = aliasStatsQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { videoSpaceId } = validationResult.data;

    // Get alias statistics
    const result = await aliasService.getAliasStats(
      session.user.id,
      videoSpaceId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      );
    }

    // Transform response data
    const responseData = {
      ...result.data!,
      recentlyAccessedAliases: result.data!.recentlyAccessedAliases.map(
        (alias) => ({
          ...alias,
          lastAccessedAt: alias.lastAccessedAt.toISOString(),
        })
      ),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in GET /api/video-conferencing/aliases/stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
