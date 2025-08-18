/**
 * Zoom Authentication Provider
 * Handles OAuth 2.0 and Server-to-Server authentication for Zoom API
 */

import type { VideoProvider, ServiceResponse } from "../../types";

import type {
  ZoomServiceConfig,
  ZoomAuthResult,
  ZOOM_OAUTH_SCOPES,
} from "../../types/zoom";

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
// Zoom Authentication Provider
// =============================================================================

export class ZoomAuthProvider implements IAuthProvider {
  public readonly provider: VideoProvider = "ZOOM";
  private prisma: PrismaClient;
  private encryptionKey: string;

  constructor(
    private config: ZoomServiceConfig,
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
        "ZOOM",
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
    // Zoom OAuth URL
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(" "),
    });

    if (state) {
      params.append("state", state);
    }

    return `https://zoom.us/oauth/authorize?${params.toString()}`;
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
      // Exchange code for tokens
      const tokenResponse = await fetch("https://zoom.us/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new ProviderAuthError(
          "ZOOM",
          `Token exchange failed: ${errorData.error_description || errorData.error}`,
          undefined,
          tokenResponse.status
        );
      }

      const tokenData = await tokenResponse.json();

      // Get user info
      const userInfoResponse = await fetch("https://api.zoom.us/v2/users/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

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
          : createProviderError("ZOOM", error, "exchangeCodeForTokens");
      return {
        success: false,
        error: authError.message,
        code: authError.code,
      };
    }
  }

  // =============================================================================
  // Server-to-Server Authentication (for Zoom Apps)
  // =============================================================================

  async getServerToServerToken(): Promise<
    ServiceResponse<{
      accessToken: string;
      expiresAt: Date;
      tokenType: "Bearer";
    }>
  > {
    try {
      if (!this.config.accountId) {
        throw new ProviderAuthError(
          "ZOOM",
          "Account ID is required for Server-to-Server authentication"
        );
      }

      const response = await fetch("https://zoom.us/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "account_credentials",
          account_id: this.config.accountId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ProviderAuthError(
          "ZOOM",
          `Server-to-Server token request failed: ${errorData.error_description || errorData.error}`,
          undefined,
          response.status
        );
      }

      const tokenData = await response.json();

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

      return {
        success: true,
        data: {
          accessToken: tokenData.access_token,
          expiresAt: expiresAt,
          tokenType: "Bearer",
        },
      };
    } catch (error) {
      const authError =
        error instanceof ProviderAuthError
          ? error
          : createProviderError("ZOOM", error, "getServerToServerToken");
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
      const response = await fetch("https://zoom.us/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new TokenExpiredError(
          "ZOOM",
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
          refreshToken: tokenData.refresh_token || refreshToken, // Zoom may not return new refresh token
          expiresAt: expiresAt,
        },
      };
    } catch (error) {
      const authError =
        error instanceof ProviderAuthError
          ? error
          : createProviderError("ZOOM", error, "refreshAccessToken");
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
      const response = await fetch("https://api.zoom.us/v2/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        data: response.ok,
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
      const userInfoResponse = await fetch("https://api.zoom.us/v2/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new ProviderAuthError(
          "ZOOM",
          "Failed to get user info",
          undefined,
          userInfoResponse.status
        );
      }

      const userInfo = await userInfoResponse.json();

      // Get account info
      const accountResponse = await fetch(
        "https://api.zoom.us/v2/accounts/me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      let accountInfo = null;
      if (accountResponse.ok) {
        accountInfo = await accountResponse.json();
      }

      return {
        success: true,
        data: {
          accountId: userInfo.account_id || accountInfo?.id || userInfo.id,
          accountName:
            userInfo.display_name ||
            userInfo.first_name + " " + userInfo.last_name,
          accountEmail: userInfo.email,
          scopes: this.config.scopes || this.getRequiredScopes(),
        },
      };
    } catch (error) {
      const authError =
        error instanceof ProviderAuthError
          ? error
          : createProviderError("ZOOM", error, "getAccountInfo");
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
      "meeting:write",
      "meeting:read",
      "recording:read",
      "report:read",
      "user:read",
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

      if (!account || account.provider !== "ZOOM") {
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

      if (!account || account.provider !== "ZOOM" || !account.refreshToken) {
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

      if (!account || account.provider !== "ZOOM") {
        throw new ProviderAuthError(
          "ZOOM",
          "Integration account not found or invalid provider"
        );
      }

      // Check if token is expired and refresh if needed
      if (account.tokenExpiry && account.tokenExpiry <= new Date()) {
        if (!account.refreshToken) {
          throw new TokenExpiredError("ZOOM");
        }

        const refreshResult = await this.refreshTokens(integrationAccountId);
        if (!refreshResult) {
          throw new TokenExpiredError("ZOOM");
        }

        // Fetch the updated account
        const updatedAccount = await this.prisma.integrationAccount.findUnique({
          where: { id: integrationAccountId },
        });

        if (!updatedAccount) {
          throw new ProviderAuthError(
            "ZOOM",
            "Failed to fetch updated account"
          );
        }

        return {
          accessToken: this.decrypt(updatedAccount.accessToken),
          provider: "ZOOM",
          accountId: updatedAccount.id,
          scopes: updatedAccount.scopes,
        };
      }

      // Return authenticated client with current tokens
      return {
        accessToken: this.decrypt(account.accessToken),
        provider: "ZOOM",
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
          provider: "ZOOM",
          accountName:
            authResult.userInfo?.display_name ||
            authResult.userInfo?.first_name +
              " " +
              authResult.userInfo?.last_name ||
            "Zoom Account",
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
            webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/zoom`,
            secretToken: crypto.randomBytes(32).toString("hex"),
            events: [
              "meeting.started",
              "meeting.ended",
              "meeting.participant_joined",
              "meeting.participant_left",
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
