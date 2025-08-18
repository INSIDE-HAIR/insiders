/**
 * Link Aliases API Routes
 * Handles CRUD operations for video space aliases
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AliasService } from "@/features/video-conferencing/services/AliasService";
import {
  createLinkAliasRequestSchema,
  linkAliasFiltersSchema,
  linkAliasResponseSchema,
  linkAliasListResponseSchema,
} from "@/features/video-conferencing/validations/alias";

const aliasService = new AliasService(prisma);

// =============================================================================
// GET /api/video-conferencing/aliases
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

    const validationResult = linkAliasFiltersSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const filters = validationResult.data;

    // Get aliases
    const result = await aliasService.getAliases(filters, session.user.id);

    if (!result.success) {
      const statusCode = result.code === "VIDEO_SPACE_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    // Transform response data
    const responseData = {
      data: result.data!.data.map((alias) => ({
        ...alias,
        createdAt: alias.createdAt.toISOString(),
        updatedAt: alias.updatedAt.toISOString(),
        lastAccessedAt: alias.lastAccessedAt?.toISOString() || null,
      })),
      pagination: {
        page: result.data!.page,
        limit: result.data!.limit,
        totalCount: result.data!.total,
        totalPages: result.data!.totalPages,
        hasNextPage: result.data!.hasNextPage,
        hasPreviousPage: result.data!.hasPreviousPage,
      },
      filters: {
        videoSpaceId: filters.videoSpaceId,
        isActive: filters.isActive,
        search: filters.search,
      },
    };

    // Validate response
    const responseValidation =
      linkAliasListResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.error("Response validation failed:", responseValidation.error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in GET /api/video-conferencing/aliases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/video-conferencing/aliases
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
    const validationResult = createLinkAliasRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const createRequest = validationResult.data;

    // Create alias
    const result = await aliasService.createAlias(
      createRequest,
      session.user.id
    );

    if (!result.success) {
      let statusCode = 400;
      if (result.code === "VIDEO_SPACE_NOT_FOUND") {
        statusCode = 404;
      } else if (result.code === "ALIAS_ALREADY_EXISTS") {
        statusCode = 409;
      }

      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    // Transform response data
    const responseData = {
      ...result.data!,
      createdAt: result.data!.createdAt.toISOString(),
      updatedAt: result.data!.updatedAt.toISOString(),
      lastAccessedAt: result.data!.lastAccessedAt?.toISOString() || null,
    };

    // Validate response
    const responseValidation = linkAliasResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.error("Response validation failed:", responseValidation.error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/video-conferencing/aliases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
