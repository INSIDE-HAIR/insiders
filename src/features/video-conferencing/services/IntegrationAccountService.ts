/**
 * Integration Account Service
 * Manages OAuth integration accounts for all video conferencing providers
 */

import type {
  VideoProvider,
  ServiceResponse,
  IntegrationAccount,
} from "../types";

import type { IIntegrationAccountRepository } from "./interfaces";
import { GoogleMeetAuthProvider } from "./auth/GoogleMeetAuthProvider";
import { ZoomAuthProvider } from "./auth/ZoomAuthProvider";
import { VimeoAuthProvider } from "./auth/VimeoAuthProvider";

import {
  VideoConferencingError,
  ProviderAuthError,
  createProviderError,
  createDatabaseError,
} from "./errors";

import { PrismaClient } from "@prisma/client";

// =============================================================================
// Integration Account Repository Implementation
// =============================================================================

class IntegrationAccountRepository implements IIntegrationAccountRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(
    data: Omit<IntegrationAccount, "id" | "createdAt" | "updatedAt">
  ): Promise<IntegrationAccount> {
    try {
      const account = await this.prisma.integrationAccount.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return account as IntegrationAccount;
    } catch (error) {
      throw createDatabaseError("create", "IntegrationAccount", error);
    }
  }

  async findById(id: string): Promise<IntegrationAccount | null> {
    try {
      const account = await this.prisma.integrationAccount.findUnique({
        where: { id },
      });

      return account as IntegrationAccount | null;
    } catch (error) {
      throw createDatabaseError("read", "IntegrationAccount", error);
    }
  }

  async findByUserAndProvider(
    userId: string,
    provider: VideoProvider
  ): Promise<IntegrationAccount[]> {
    try {
      const accounts = await this.prisma.integrationAccount.findMany({
        where: {
          userId,
          provider,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return accounts as IntegrationAccount[];
    } catch (error) {
      throw createDatabaseError("read", "IntegrationAccount", error);
    }
  }

  async update(
    id: string,
    data: Partial<IntegrationAccount>
  ): Promise<IntegrationAccount> {
    try {
      const account = await this.prisma.integrationAccount.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return account as IntegrationAccount;
    } catch (error) {
      throw createDatabaseError("update", "IntegrationAccount", error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.integrationAccount.delete({
        where: { id },
      });
    } catch (error) {
      throw createDatabaseError("delete", "IntegrationAccount", error);
    }
  }

  async findActiveByProvider(
    provider: VideoProvider
  ): Promise<IntegrationAccount[]> {
    try {
      const accounts = await this.prisma.integrationAccount.findMany({
        where: {
          provider,
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return accounts as IntegrationAccount[];
    } catch (error) {
      throw createDatabaseError("read", "IntegrationAccount", error);
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// =============================================================================
// Integration Account Service
// =============================================================================

export class IntegrationAccountService {
  private repository: IntegrationAccountRepository;
  private authProviders: Map<VideoProvider, any> = new Map();

  constructor() {
    this.repository = new IntegrationAccountRepository();
    this.initializeAuthProviders();
  }

  private initializeAuthProviders(): void {
    // Initialize auth providers with default configs
    // In production, these would come from environment variables
    const meetConfig = {
      clientId: process.env.GOOGLE_MEET_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_MEET_CLIENT_SECRET || "",
      redirectUri: process.env.GOOGLE_MEET_REDIRECT_URI || "",
      scopes: [
        "https://www.googleapis.com/auth/meetings.space.created",
        "https://www.googleapis.com/auth/meetings.space.readonly",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/drive.file",
      ],
    };

    const zoomConfig = {
      clientId: process.env.ZOOM_CLIENT_ID || "",
      clientSecret: process.env.ZOOM_CLIENT_SECRET || "",
      accountId: process.env.ZOOM_ACCOUNT_ID,
      redirectUri: process.env.ZOOM_REDIRECT_URI,
      scopes: [
        "meeting:write",
        "meeting:read",
        "recording:read",
        "report:read",
        "user:read",
      ],
    };

    const vimeoConfig = {
      clientId: process.env.VIMEO_CLIENT_ID || "",
      clientSecret: process.env.VIMEO_CLIENT_SECRET || "",
      redirectUri: process.env.VIMEO_REDIRECT_URI,
      scopes: ["public", "private", "create", "edit", "upload", "stats"],
    };

    this.authProviders.set(
      "MEET",
      new GoogleMeetAuthProvider(meetConfig, this.repository)
    );
    this.authProviders.set(
      "ZOOM",
      new ZoomAuthProvider(zoomConfig, this.repository)
    );
    this.authProviders.set(
      "VIMEO",
      new VimeoAuthProvider(vimeoConfig, this.repository)
    );
  }

  private getAuthProvider(provider: VideoProvider): any {
    const authProvider = this.authProviders.get(provider);
    if (!authProvider) {
      throw new VideoConferencingError(
        `Auth provider not found: ${provider}`,
        "PROVIDER_NOT_FOUND",
        provider
      );
    }
    return authProvider;
  }

  // =============================================================================
  // OAuth Flow Management
  // =============================================================================

  async generateAuthUrl(
    provider: VideoProvider,
    redirectUri: string,
    state?: string
  ): Promise<ServiceResponse<string>> {
    try {
      const authProvider = this.getAuthProvider(provider);
      const requiredScopes = authProvider.getRequiredScopes();
      const authUrl = authProvider.generateAuthUrl(
        requiredScopes,
        redirectUri,
        state
      );

      return {
        success: true,
        data: authUrl,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate auth URL",
        code:
          error instanceof VideoConferencingError
            ? error.code
            : "AUTH_URL_ERROR",
      };
    }
  }

  async handleOAuthCallback(
    provider: VideoProvider,
    code: string,
    redirectUri: string,
    userId: string
  ): Promise<ServiceResponse<string>> {
    try {
      const authProvider = this.getAuthProvider(provider);

      // Exchange code for tokens
      const tokenResult = await authProvider.exchangeCodeForTokens(
        code,
        redirectUri
      );
      if (!tokenResult.success) {
        return {
          success: false,
          error: tokenResult.error,
          code: tokenResult.code,
        };
      }

      // Create integration account
      const accountResult = await authProvider.createIntegrationAccount(
        userId,
        tokenResult.data!
      );
      if (!accountResult.success) {
        return {
          success: false,
          error: accountResult.error,
          code: accountResult.code,
        };
      }

      return {
        success: true,
        data: accountResult.data!,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "OAuth callback failed",
        code:
          error instanceof VideoConferencingError
            ? error.code
            : "OAUTH_CALLBACK_ERROR",
      };
    }
  }

  // =============================================================================
  // Account Management
  // =============================================================================

  async getIntegrationAccounts(
    userId: string,
    provider?: VideoProvider
  ): Promise<ServiceResponse<IntegrationAccount[]>> {
    try {
      let accounts: IntegrationAccount[];

      if (provider) {
        accounts = await this.repository.findByUserAndProvider(
          userId,
          provider
        );
      } else {
        // Get all accounts for user across all providers
        const meetAccounts = await this.repository.findByUserAndProvider(
          userId,
          "MEET"
        );
        const zoomAccounts = await this.repository.findByUserAndProvider(
          userId,
          "ZOOM"
        );
        const vimeoAccounts = await this.repository.findByUserAndProvider(
          userId,
          "VIMEO"
        );

        accounts = [...meetAccounts, ...zoomAccounts, ...vimeoAccounts].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      return {
        success: true,
        data: accounts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get integration accounts",
        code: "GET_ACCOUNTS_ERROR",
      };
    }
  }

  async getIntegrationAccount(
    accountId: string
  ): Promise<ServiceResponse<IntegrationAccount>> {
    try {
      const account = await this.repository.findById(accountId);

      if (!account) {
        return {
          success: false,
          error: "Integration account not found",
          code: "ACCOUNT_NOT_FOUND",
        };
      }

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get integration account",
        code: "GET_ACCOUNT_ERROR",
      };
    }
  }

  async updateIntegrationAccount(
    accountId: string,
    updates: {
      accountName?: string;
      status?: "ACTIVE" | "EXPIRED" | "REVOKED" | "ERROR";
      webhookConfig?: any;
    }
  ): Promise<ServiceResponse<IntegrationAccount>> {
    try {
      const account = await this.repository.update(accountId, updates);

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update integration account",
        code: "UPDATE_ACCOUNT_ERROR",
      };
    }
  }

  async deleteIntegrationAccount(
    accountId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const account = await this.repository.findById(accountId);

      if (!account) {
        return {
          success: false,
          error: "Integration account not found",
          code: "ACCOUNT_NOT_FOUND",
        };
      }

      // Soft delete by marking as revoked
      await this.repository.update(accountId, {
        status: "REVOKED",
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete integration account",
        code: "DELETE_ACCOUNT_ERROR",
      };
    }
  }

  // =============================================================================
  // Token Management
  // =============================================================================

  async validateIntegrationAccount(
    accountId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const account = await this.repository.findById(accountId);

      if (!account) {
        return {
          success: false,
          error: "Integration account not found",
          code: "ACCOUNT_NOT_FOUND",
        };
      }

      const authProvider = this.getAuthProvider(account.provider);
      const isValid = await authProvider.validateIntegrationAccount(accountId);

      return {
        success: true,
        data: isValid,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate integration account",
        code: "VALIDATE_ACCOUNT_ERROR",
      };
    }
  }

  async refreshAccountTokens(
    accountId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const account = await this.repository.findById(accountId);

      if (!account) {
        return {
          success: false,
          error: "Integration account not found",
          code: "ACCOUNT_NOT_FOUND",
        };
      }

      const authProvider = this.getAuthProvider(account.provider);
      const refreshed = await authProvider.refreshTokens(accountId);

      return {
        success: true,
        data: refreshed,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to refresh account tokens",
        code: "REFRESH_TOKENS_ERROR",
      };
    }
  }

  async getAuthenticatedClient(
    accountId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const account = await this.repository.findById(accountId);

      if (!account) {
        return {
          success: false,
          error: "Integration account not found",
          code: "ACCOUNT_NOT_FOUND",
        };
      }

      const authProvider = this.getAuthProvider(account.provider);
      const client = await authProvider.getAuthenticatedClient(accountId);

      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "CLIENT_ERROR",
        };
      }

      return {
        success: true,
        data: client,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get authenticated client",
        code: "GET_CLIENT_ERROR",
      };
    }
  }

  // =============================================================================
  // Bulk Operations
  // =============================================================================

  async validateAllAccounts(userId: string): Promise<
    ServiceResponse<{
      valid: number;
      invalid: number;
      expired: number;
      details: Array<{
        accountId: string;
        provider: VideoProvider;
        status: "valid" | "invalid" | "expired";
        error?: string;
      }>;
    }>
  > {
    try {
      const accountsResult = await this.getIntegrationAccounts(userId);
      if (!accountsResult.success) {
        return {
          success: false,
          error: accountsResult.error,
          code: accountsResult.code,
        };
      }

      const accounts = accountsResult.data!;
      const results = {
        valid: 0,
        invalid: 0,
        expired: 0,
        details: [] as Array<{
          accountId: string;
          provider: VideoProvider;
          status: "valid" | "invalid" | "expired";
          error?: string;
        }>,
      };

      for (const account of accounts) {
        try {
          const validationResult = await this.validateIntegrationAccount(
            account.id
          );

          if (validationResult.success && validationResult.data) {
            results.valid++;
            results.details.push({
              accountId: account.id,
              provider: account.provider,
              status: "valid",
            });
          } else {
            results.invalid++;
            results.details.push({
              accountId: account.id,
              provider: account.provider,
              status: "invalid",
              error: validationResult.error,
            });
          }
        } catch (error) {
          results.expired++;
          results.details.push({
            accountId: account.id,
            provider: account.provider,
            status: "expired",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate accounts",
        code: "BULK_VALIDATE_ERROR",
      };
    }
  }

  // =============================================================================
  // Cleanup
  // =============================================================================

  async disconnect(): Promise<void> {
    await this.repository.disconnect();

    // Disconnect all auth providers
    for (const provider of this.authProviders.values()) {
      if (provider.disconnect) {
        await provider.disconnect();
      }
    }
  }
}
