/**
 * Integration Accounts API Routes
 * Handles CRUD operations for integration accounts
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/src/features/video-conferencing/middleware/authMiddleware";
import { createGlobalErrorHandler } from "@/src/features/video-conferencing/middleware/globalErrorHandler";
import { z } from "zod";

const prisma = new PrismaClient();
const globalErrorHandler = createGlobalErrorHandler(prisma);

// Validation schemas
const createIntegrationAccountSchema = z.object({
  provider: z.enum(["MEET", "ZOOM", "VIMEO"]),
  accountName: z.string().min(1).max(255),
  accountEmail: z.string().email(),
});

/**
 * GET /api/video-conferencing/integration-accounts
 * List integration accounts
 */
export const GET = globalErrorHandler.wrapApiHandler(
  async (request: NextRequest) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integrationAccounts = await prisma.integrationAccount.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            videoSpaces: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map provider values for frontend compatibility
    const mappedAccounts = integrationAccounts.map((account) => ({
      ...account,
      provider: account.provider === "MEET" ? "GOOGLE_MEET" : account.provider,
    }));

    return NextResponse.json(mappedAccounts);
  }
);

/**
 * POST /api/video-conferencing/integration-accounts
 * Create a new integration account
 */
export const POST = globalErrorHandler.wrapApiHandler(
  async (request: NextRequest) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createIntegrationAccountSchema.parse(body);

    // Map provider values from frontend
    const providerMapping: Record<string, string> = {
      GOOGLE_MEET: "MEET",
      ZOOM: "ZOOM",
      VIMEO: "VIMEO",
    };

    const mappedProvider =
      providerMapping[validatedData.provider] || validatedData.provider;

    // Check if integration account already exists
    const existingAccount = await prisma.integrationAccount.findUnique({
      where: {
        provider_accountEmail: {
          provider: mappedProvider as any,
          accountEmail: validatedData.accountEmail,
        },
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        {
          error:
            "Integration account already exists for this provider and email",
        },
        { status: 400 }
      );
    }

    // Create the integration account
    const integrationAccount = await prisma.integrationAccount.create({
      data: {
        provider: mappedProvider as any,
        accountName: validatedData.accountName,
        accountEmail: validatedData.accountEmail,
        accessToken: "placeholder_token", // In production, this would be from OAuth
        scopes: ["basic"], // Default scopes
        status: "ACTIVE",
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            videoSpaces: true,
          },
        },
      },
    });

    // Map provider value back for frontend compatibility
    const mappedAccount = {
      ...integrationAccount,
      provider:
        integrationAccount.provider === "MEET"
          ? "GOOGLE_MEET"
          : integrationAccount.provider,
    };

    return NextResponse.json(mappedAccount, { status: 201 });
  }
);
