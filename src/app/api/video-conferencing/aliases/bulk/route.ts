/**
 * Bulk Alias Operations API Route
 * Handles bulk operations on aliases
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AliasService } from "@/features/video-conferencing/services/AliasService";
import {
  bulkUpdateAliasesRequestSchema,
  bulkUpdateAliasesResponseSchema,
} from "@/features/video-conferencing/validations/alias";

const aliasService = new AliasService(prisma);

// =============================================================================
// PATCH /api/video-conferencing/aliases/bulk
// =============================================================================

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = bulkUpdateAliasesRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const bulkRequest = validationResult.data;

    // Perform bulk update
    const result = await aliasService.bulkUpdateAliases(
      bulkRequest,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      );
    }

    // Validate response
    const responseValidation = bulkUpdateAliasesResponseSchema.safeParse(
      result.data
    );
    if (!responseValidation.success) {
      console.error("Response validation failed:", responseValidation.error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(
      "Error in PATCH /api/video-conferencing/aliases/bulk:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
