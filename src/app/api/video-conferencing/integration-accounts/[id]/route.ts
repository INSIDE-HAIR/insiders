/**
 * Individual Integration Account API Routes
 * Handles operations on specific integration accounts
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { IntegrationAccountService } from "@video-conferencing/services/IntegrationAccountService";
import { z } from "zod";

const integrationAccountService = new IntegrationAccountService();

// =============================================================================
// GET /api/video-conferencing/integration-accounts/[id]
// Get a specific integration account
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await integrationAccountService.getIntegrationAccount(
      params.id
    );

    if (!result.success) {
      const status = result.code === "ACCOUNT_NOT_FOUND" ? 404 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    const account = result.data!;

    // Check if user owns this account
    if (account.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      data: sanitizedAccount,
    });
  } catch (error) {
    console.error("Integration account GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// PATCH /api/video-conferencing/integration-accounts/[id]
// Update an integration account
// =============================================================================

const UpdateAccountSchema = z.object({
  accountName: z.string().min(1).max(200).optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "REVOKED", "ERROR"]).optional(),
  webhookConfig: z.record(z.any()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if account exists and user owns it
    const accountResult = await integrationAccountService.getIntegrationAccount(
      params.id
    );
    if (!accountResult.success) {
      const status = accountResult.code === "ACCOUNT_NOT_FOUND" ? 404 : 500;
      return NextResponse.json({ error: accountResult.error }, { status });
    }

    if (accountResult.data!.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = UpdateAccountSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const result = await integrationAccountService.updateIntegrationAccount(
      params.id,
      validationResult.data
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Remove sensitive data before sending to client
    const account = result.data!;
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
      data: sanitizedAccount,
    });
  } catch (error) {
    console.error("Integration account PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/video-conferencing/integration-accounts/[id]
// Delete (revoke) an integration account
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if account exists and user owns it
    const accountResult = await integrationAccountService.getIntegrationAccount(
      params.id
    );
    if (!accountResult.success) {
      const status = accountResult.code === "ACCOUNT_NOT_FOUND" ? 404 : 500;
      return NextResponse.json({ error: accountResult.error }, { status });
    }

    if (accountResult.data!.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await integrationAccountService.deleteIntegrationAccount(
      params.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Integration account revoked successfully",
    });
  } catch (error) {
    console.error("Integration account DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
