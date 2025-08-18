/**
 * OAuth Callback API Route
 * Handles OAuth callbacks from video conferencing providers
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { IntegrationAccountService } from "@video-conferencing/services/IntegrationAccountService";
import { VideoProviderSchema } from "@video-conferencing/validations";
import { z } from "zod";

const integrationAccountService = new IntegrationAccountService();

// =============================================================================
// POST /api/video-conferencing/oauth/callback
// Handle OAuth callback from providers
// =============================================================================

const OAuthCallbackSchema = z.object({
  provider: VideoProviderSchema,
  code: z.string(),
  redirectUri: z.string().url(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = OAuthCallbackSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { provider, code, redirectUri, state, error, error_description } =
      validationResult.data;

    // Check if OAuth provider returned an error
    if (error) {
      return NextResponse.json(
        {
          error: "OAuth authorization failed",
          details: {
            error,
            error_description,
            provider,
          },
        },
        { status: 400 }
      );
    }

    // Handle the OAuth callback
    const result = await integrationAccountService.handleOAuthCallback(
      provider,
      code,
      redirectUri,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          code: result.code,
          provider,
        },
        { status: 400 }
      );
    }

    // Get the created account details
    const accountResult = await integrationAccountService.getIntegrationAccount(
      result.data!
    );

    if (!accountResult.success) {
      return NextResponse.json(
        { error: "Failed to retrieve created account" },
        { status: 500 }
      );
    }

    const account = accountResult.data!;

    // Remove sensitive data before sending to client
    const sanitizedAccount = {
      id: account.id,
      provider: account.provider,
      accountName: account.accountName,
      accountEmail: account.accountEmail,
      scopes: account.scopes,
      status: account.status,
      tokenExpiry: account.tokenExpiry,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: `${provider} account connected successfully`,
      data: sanitizedAccount,
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/video-conferencing/oauth/callback
// Handle OAuth callback via GET (for some providers that use GET redirects)
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const provider = searchParams.get("provider");
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");

    // Validate required parameters
    if (!provider || !code) {
      return NextResponse.redirect(
        new URL("/auth/error?error=missing_parameters", request.url)
      );
    }

    // Validate provider
    const providerResult = VideoProviderSchema.safeParse(
      provider.toUpperCase()
    );
    if (!providerResult.success) {
      return NextResponse.redirect(
        new URL("/auth/error?error=invalid_provider", request.url)
      );
    }

    // Check if OAuth provider returned an error
    if (error) {
      const errorUrl = new URL("/auth/error", request.url);
      errorUrl.searchParams.set("error", error);
      errorUrl.searchParams.set("provider", provider);
      if (error_description) {
        errorUrl.searchParams.set("description", error_description);
      }
      return NextResponse.redirect(errorUrl);
    }

    // Redirect to frontend with the authorization code
    // The frontend will then make a POST request to complete the OAuth flow
    const successUrl = new URL(
      "/video-conferencing/oauth/success",
      request.url
    );
    successUrl.searchParams.set("provider", provider);
    successUrl.searchParams.set("code", code);
    if (state) {
      successUrl.searchParams.set("state", state);
    }

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("OAuth callback GET error:", error);
    return NextResponse.redirect(
      new URL("/auth/error?error=internal_error", request.url)
    );
  }
}
