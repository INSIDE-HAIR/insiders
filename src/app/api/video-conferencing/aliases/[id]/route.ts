/**
 * Individual Link Alias API Routes
 * Handles operations on specific aliases by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AliasService } from "@/features/video-conferencing/services/AliasService";
import {
  updateLinkAliasRequestSchema,
  linkAliasResponseSchema,
} from "@/features/video-conferencing/validations/alias";

const aliasService = new AliasService(prisma);

// =============================================================================
// GET /api/video-conferencing/aliases/[id]
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
    const aliasId = params.id;
    if (!aliasId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid alias ID format" },
        { status: 400 }
      );
    }

    // Get alias
    const result = await aliasService.getAliasById(aliasId, session.user.id);

    if (!result.success) {
      const statusCode = result.code === "ALIAS_NOT_FOUND" ? 404 : 400;
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

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(
      `Error in GET /api/video-conferencing/aliases/${params.id}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// PATCH /api/video-conferencing/aliases/[id]
// =============================================================================

export async function PATCH(
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
    const aliasId = params.id;
    if (!aliasId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid alias ID format" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateLinkAliasRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const updateRequest = validationResult.data;

    // Update alias
    const result = await aliasService.updateAlias(
      aliasId,
      updateRequest,
      session.user.id
    );

    if (!result.success) {
      let statusCode = 400;
      if (result.code === "ALIAS_NOT_FOUND") {
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

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(
      `Error in PATCH /api/video-conferencing/aliases/${params.id}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/video-conferencing/aliases/[id]
// =============================================================================

export async function DELETE(
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
    const aliasId = params.id;
    if (!aliasId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid alias ID format" },
        { status: 400 }
      );
    }

    // Check for permanent deletion flag
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    // Delete alias
    const result = await aliasService.deleteAlias(
      aliasId,
      session.user.id,
      permanent
    );

    if (!result.success) {
      const statusCode = result.code === "ALIAS_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    const message = permanent
      ? "Alias permanently deleted"
      : "Alias deactivated";

    return NextResponse.json({ message });
  } catch (error) {
    console.error(
      `Error in DELETE /api/video-conferencing/aliases/${params.id}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
