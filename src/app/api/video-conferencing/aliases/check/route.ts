/**
 * Alias Availability Check API Route
 * Handles checking if an alias is available
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AliasService } from "@/features/video-conferencing/services/AliasService";
import { z } from "zod";

const aliasService = new AliasService(prisma);

// Validation schema for alias check
const aliasCheckSchema = z.object({
  alias: z
    .string()
    .min(1, "Alias is required")
    .max(100, "Alias must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Alias can only contain letters, numbers, hyphens, and underscores"
    )
    .refine(
      (alias) => !alias.startsWith("-") && !alias.endsWith("-"),
      "Alias cannot start or end with a hyphen"
    )
    .refine(
      (alias) => !alias.startsWith("_") && !alias.endsWith("_"),
      "Alias cannot start or end with an underscore"
    ),
});

// =============================================================================
// GET /api/video-conferencing/aliases/check
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
    const alias = searchParams.get("alias");

    if (!alias) {
      return NextResponse.json(
        { error: "Alias parameter is required" },
        { status: 400 }
      );
    }

    const validationResult = aliasCheckSchema.safeParse({ alias });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid alias format",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Check availability
    const result = await aliasService.isAliasAvailable(alias);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      alias,
      available: result.data,
      message: result.data ? "Alias is available" : "Alias is already taken",
    });
  } catch (error) {
    console.error("Error in GET /api/video-conferencing/aliases/check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
