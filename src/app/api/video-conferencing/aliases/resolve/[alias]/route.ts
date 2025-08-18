/**
 * Alias Resolution API Route
 * Handles public alias resolution and redirection
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AliasService } from "@/features/video-conferencing/services/AliasService";
import { aliasResolutionSchema } from "@/features/video-conferencing/validations/alias";

const aliasService = new AliasService(prisma);

// =============================================================================
// GET /api/video-conferencing/aliases/resolve/[alias]
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { alias: string } }
) {
  try {
    const alias = params.alias;

    // Validate alias format
    if (!alias || typeof alias !== "string") {
      return NextResponse.json(
        { error: "Invalid alias format" },
        { status: 400 }
      );
    }

    // Resolve alias
    const result = await aliasService.resolveAlias(alias);

    if (!result.success) {
      let statusCode = 404;
      let message = "Alias not found";

      switch (result.code) {
        case "ALIAS_NOT_FOUND":
          statusCode = 404;
          message = "Alias not found or inactive";
          break;
        case "VIDEO_SPACE_INACTIVE":
          statusCode = 410; // Gone
          message = "Video space is not active";
          break;
        case "NO_JOIN_URL":
          statusCode = 503; // Service Unavailable
          message = "Video space has no join URL";
          break;
        default:
          statusCode = 500;
          message = "Failed to resolve alias";
      }

      return NextResponse.json(
        { error: message, code: result.code },
        { status: statusCode }
      );
    }

    // Check if this is a redirect request or data request
    const { searchParams } = new URL(request.url);
    const redirect = searchParams.get("redirect") !== "false";

    if (redirect) {
      // Redirect to the video space
      return NextResponse.redirect(result.data!.redirectUrl, 302);
    } else {
      // Return resolution data
      const responseData = {
        ...result.data!,
        lastAccessedAt: result.data!.lastAccessedAt,
      };

      // Validate response
      const responseValidation = aliasResolutionSchema.safeParse(responseData);
      if (!responseValidation.success) {
        console.error("Response validation failed:", responseValidation.error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }

      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error(
      `Error in GET /api/video-conferencing/aliases/resolve/${params.alias}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
