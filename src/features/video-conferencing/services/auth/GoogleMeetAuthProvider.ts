/**
 * Google Meet Authentication Provider
 * Handles OAuth 2.0 flow and token management for Google Meet API
 */

import type { VideoProvider, ServiceResponse } from "../../types";

import type {
  MeetServiceConfig,
  MeetAuthResult,
  MEET_SCOPES,
} from "../../types/meet";

import type {
  IAuthProvider,
  IIntegrationAccountRepository,
} from "../interfaces";
import {
  ProviderAuthError,
  TokenExpiredError,
  InvalidScopesError,
  createProviderError,
} from "../errors";

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// =============================================================================
// Google Meet Authentication Provider
// =============================================================================

export class GoogleMeetAuthProvider implements IAuthProvider {
  public readonly provider: VideoProvider = "MEET";
  private prisma: PrismaClient;
  private encryptionKey: string;

  constructor(
    private config: MeetServiceConfig,
    integrationAccountRepository?: IIntegrationAccountRepository
  ) {
    this.prisma = new PrismaClient();
    this.encryptionKey =
      process.env.ENCRYPTION_KEY || "default-key-change-in-production";
  }

  // =============================================================================
  // Encryption/Decryption Utilities
  // =============================================================================

  private encrypt(text: string): string {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(this.encryptionKey, "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  }

  private decrypt(encryptedText: string): string {
    try {
      const algorithm = "aes-256-cbc";
      const key = crypto.scryptSync(this.encryptionKey, "salt", 32);
      const textParts = encryptedText.split(":");
      const iv = Buffer.from(textParts.shift()!, "hex");
      const encryptedData = textParts.join(":");
      const decipher = crypto.createDecipher(algorithm, key);

      let decrypted = decipher.update(encryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new ProviderAuthError(
        "MEET",
        "Failed to decrypt token",
        error as Error
      );
    }
  }

  // =============================================================================
  // OAuth Flow
  // =============================================================================

  generateAuthUrl(
    scopes: string[],
    redirectUri: string,
    state?: string
  ): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

    if (state) {
      params.append("state", state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<
    ServiceResponse<{
      accessToken: string;
      refreshToken?: string;
      expiresAt: Date;
      scopes: string[];
      userInfo?: any;
    }>
  > {
    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new ProviderAuthError(
          "MEET",
          `Token exchange failed: ${errorData.error_description || errorData.error}`,
          undefined,
          tokenResponse.status
        );
      }

      const tokenData = await tokenResponse.json();

      // Get user info
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );

      let userInfo = null;
      if (userInfoResponse.ok) {
        userInfo = await userInfoResponse.json();
      }

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

      return {
        success: true,
        data: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: expiresAt,
          scopes: tokenData.scope ? tokenData.scope.split(" ") : [],
          userInfo: userInfo,
        },
      };
    } catch (error) {
      const authError =
        error instanceof ProviderAuthError
          ? error
          : createProviderError("MEET", error, "exchangeCodeForTokens");
      return {
        success: false,
        error: authError.message,
        code: authError.code,
      };
    }
  }

  // =============================================================================
  // Token Management
  // =============================================================================

  async refreshAccessToken(refreshToken: string): Promise<
    ServiceResponse<{
      accessToken: string;
      refreshToken?: string;
      expiresAt: Date;
    }>
  > {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new TokenExpiredError(
          "MEET",
          new Error(errorData.error_description || errorData.error)
        );
      }

      const tokenData = await response.json();

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

      return {
        success: true,
        data: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || refreshToken, // Google may not return new refresh token
          expiresAt: expiresAt,
        },
      };
    } catch (error) {
      const authError =
        error instanceof ProviderAuthError
          ? error
          : createProviderError("MEET", error, "refreshAccessToken");
      return {
        success: false,
        error: authError.message,
        code: authError.code,
      };
    }
  }

  // =============================================================================
  // Token Validation
  // =============================================================================

  async validateToken(accessToken: string): Promise<ServiceResponse<boolean>> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
      );

      if (!response.ok) {
        return {
          success: true,
          data: false,
        };
      }

      const tokenInfo = await response.json();

      // Check if token is expired
      const expiresIn = parseInt(tokenInfo.expires_in);
      if (expiresIn <= 0) {
        return {
          success: true,
          data: false,
        };
      }

      // Check if token has required scopes
      const tokenScopes = tokenInfo.scope ? tokenInfo.scope.split(" ") : [];
      const requiredScopes = this.getRequiredScopes();
      const hasRequiredScopes = requiredScopes.every((scope) =>
        tokenScopes.includes(scope)
      );

      return {
        success: true,
        data: hasRequiredScopes,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Token validation failed",
        code: "TOKEN_VALIDATION_ERROR",
      };
    }
  }

  // =============================================================================
  // Account Information
  // =============================================================================

  async getAccountInfo(accessToken: string): Promise<
    ServiceResponse<{
      accountId: string;
      accountName: string;
      accountEmail?: string;
      scopes: string[];
    }>
  > {
    try {
      // Get user info
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new ProviderAuthError(
          "MEET",
          "Failed to get user info",
          undefined,
          userInfoResponse.status
        );
      }

      const userInfo = await userInfoResponse.json();

      // Get token info for scopes
      const tokenInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
      );
      let scopes: string[] = [];

      if (tokenInfoResponse.ok) {
        const tokenInfo = await tokenInfoResponse.json();
        scopes = tokenInfo.scope ? tokenInfo.scope.split(" ") : [];
      }

      return {
        success: true,
        data: {
          accountId: userInfo.id,
          accountName: userInfo.name || userInfo.email,
          accountEmail: userInfo.email,
          scopes: scopes,
        },
      };
    } catch (error) {
      const authError =
        error instanceof ProviderAuthError
          ? error
          : createProviderError("MEET", error, "getAccountInfo");
      return {
        success: false,
        error: authError.message,
        code: authError.code,
      };
    }
  }

  // =============================================================================
  // Scope Management
  // =============================================================================

  getRequiredScopes(): string[] {
    return [
      "https://www.googleapis.com/auth/meetings.space.created",
      "https://www.googleapis.com/auth/meetings.space.readonly",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/drive.file",
    ];
  }

  validateScopes(scopes: string[]): boolean {
    const requiredScopes = this.getRequiredScopes();
    return requiredScopes.every((scope) => scopes.includes(scope));
  }

  // =============================================================================
  // Integration Account Helpers
  // =============================================================================

  async validateIntegrationAccount(
    integrationAccountId: string
  ): Promise<boolean> {
    try {
      const account = await this.prisma.integrationAccount.findUnique({
        where: { id: integrationAccountId },
      });

      if (!account || account.provider !== "MEET") {
        return false;
      }

      if (account.status !== "ACTIVE") {
        return false;
      }

      // Check if token is expired
      if (account.tokenExpiry && account.tokenExpiry <= new Date()) {
        // Try to refresh the token
        if (account.refreshToken) {
          const refreshResult = await this.refreshTokens(integrationAccountId);
          return refreshResult;
        }
        return false;
      }

      // Validate the access token
      const decryptedToken = this.decrypt(account.accessToken);
      const validationResult = await this.validateToken(decryptedToken);

      return validationResult.success && validationResult.data === true;
    } catch (error) {
      console.error("Failed to validate integration account:", error);
      return false;
    }
  }

  async refreshTokens(integrationAccountId: string): Promise<boolean> {
    try {
      const account = await this.prisma.integrationAccount.findUnique({
        where: { id: integrationAccountId },
      });

      if (!account || account.provider !== "MEET" || !account.refreshToken) {
        return false;
      }

      const decryptedRefreshToken = this.decrypt(account.refreshToken);
      const refreshResult = await this.refreshAccessToken(
        decryptedRefreshToken
      );

      if (!refreshResult.success) {
        // Mark account as expired
        await this.prisma.integrationAccount.update({
          where: { id: integrationAccountId },
          data: {
            status: "EXPIRED",
            updatedAt: new Date(),
          },
        });
        return false;
      }

      // Update the account with new tokens
      await this.prisma.integrationAccount.update({
        where: { id: integrationAccountId },
        data: {
          accessToken: this.encrypt(refreshResult.data!.accessToken),
          refreshToken: refreshResult.data!.refreshToken
            ? this.encrypt(refreshResult.data!.refreshToken)
            : account.refreshToken,
          tokenExpiry: refreshResult.data!.expiresAt,
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to refresh tokens:", error);
      return false;
    }
  }

  async getAuthenticatedClient(integrationAccountId: string): Promise<any> {
    try {
      const account = await this.prisma.integrationAccount.findUnique({
        where: { id: integrationAccountId },
      });

      if (!account || account.provider !== "MEET") {
        throw new ProviderAuthError(
          "MEET",
          "Integration account not found or invalid provider"
        );
      }

      // Check if token is expired and refresh if needed
      if (account.tokenExpiry && account.tokenExpiry <= new Date()) {
        if (!account.refreshToken) {
          throw new TokenExpiredError("MEET");
        }

        const refreshResult = await this.refreshTokens(integrationAccountId);
        if (!refreshResult) {
          throw new TokenExpiredError("MEET");
        }

        // Fetch the updated account
        const updatedAccount = await this.prisma.integrationAccount.findUnique({
          where: { id: integrationAccountId },
        });

        if (!updatedAccount) {
          throw new ProviderAuthError(
            "MEET",
            "Failed to fetch updated account"
          );
        }

        return {
          accessToken: this.decrypt(updatedAccount.accessToken),
          provider: "MEET",
          accountId: updatedAccount.id,
          scopes: updatedAccount.scopes,
        };
      }

      // Return authenticated client with current tokens
      return {
        accessToken: this.decrypt(account.accessToken),
        provider: "MEET",
        accountId: account.id,
        scopes: account.scopes,
      };
    } catch (error) {
      console.error("Failed to get authenticated client:", error);
      return null;
    }
  }

  // =============================================================================
  // Database Integration Methods
  // =============================================================================

  async createIntegrationAccount(
    userId: string,
    authResult: {
      accessToken: string;
      refreshToken?: string;
      expiresAt: Date;
      scopes: string[];
      userInfo?: any;
    }
  ): Promise<ServiceResponse<string>> {
    try {
      const account = await this.prisma.integrationAccount.create({
        data: {
          provider: "MEET",
          accountName: authResult.userInfo?.name || "Google Meet Account",
          accountEmail: authResult.userInfo?.email,
          accessToken: this.encrypt(authResult.accessToken),
          refreshToken: authResult.refreshToken
            ? this.encrypt(authResult.refreshToken)
            : null,
          tokenExpiry: authResult.expiresAt,
          scopes: authResult.scopes,
          status: "ACTIVE",
          userId: userId,
          webhookConfig: {
            webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/meet`,
            secretToken: crypto.randomBytes(32).toString("hex"),
            events: [
              "conference.started",
              "conference.ended",
              "participant.joined",
              "participant.left",
            ],
            isActive: true,
            failureCount: 0,
          },
        },
      });

      return {
        success: true,
        data: account.id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create integration account",
        code: "CREATE_ACCOUNT_ERROR",
      };
    }
  }

  // =============================================================================
  // Cleanup
  // =============================================================================

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
