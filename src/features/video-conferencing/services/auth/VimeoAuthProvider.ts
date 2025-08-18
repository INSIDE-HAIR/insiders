/**
 * Vimeo Authentication Provider
 * Handles OAuth 2.0 flow and token management for Vimeo API
 */

import type { VideoProvider, ServiceResponse } from "../../types";

import type {
  VimeoServiceConfig,
  VimeoAuthResult,
  VIMEO_SCOPES,
} from "../../types/vimeo";

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
// Vimeo Authentication Provider
// =============================================================================

export class VimeoAuthProvider implements IAuthProvider {
  public readonly provider: VideoProvider = "VIMEO";
  private prisma: PrismaClient;
  private encryptionKey: string;

  constructor(
    private config: VimeoServiceConfig,
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
        "VIMEO",
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
    // Vimeo OAuth URL
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(" "),
    });

    if (state) {
      params.append("state", state);
    }

    return `https://api.vimeo.com/oauth/authorize?${params.toString()}`;
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
      const tokenResponse = await fetch(
        "https://api.vimeo.com/oauth/access_token",
        {
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
        }
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new ProviderAuthError(
          "VIMEO",
          `Token exchange failed: ${errorData.error_description || errorData.error}`,
          undefined,
          tokenResponse.status
        );
      }

      const tokenData = await tokenResponse.json();

      // Get user info
      const userInfoResponse = await fetch("https://api.vimeo.com/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      let userInfo = null;
      if (userInfoResponse.ok) {
        userInfo = await userInfoResponse.json();
      }

      // Vimeo tokens typically don't expire, but we set a far future date
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 10); // 10 years from now

      return {
        success: true,
        data: {
          accessToken: tokenData.access_token,
          refreshToken: undefined, // Vimeo doesn't use refresh tokens
          expiresAt: expiresAt,
          scopes: tokenData.scope ? tokenData.scope.split(" ") : [],
          userInfo: userInfo,
        },
      };
    } catch (error) {
      const authError =
        error instanceof ProviderAuthError
          ? error
          : createProviderError("VIMEO", error, "exchangeCodeForTokens");
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
    // Vimeo doesn't use refresh tokens - access tokens are long-lived
    return {
      success: false,
      error:
        "Vimeo does not support token refresh - access tokens are long-lived",
      code: "REFRESH_NOT_SUPPORTED",
    };
  }

  // =============================================================================
  // Token Validation
  // =============================================================================

  async validateToken(accessToken: string): Promise<ServiceResponse<boolean>> {
    try {
      const response = await fetch("https://api.vimeo.com/me", {
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
      const userInfoResponse = await fetch("https://api.vimeo.com/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new ProviderAuthError(
          "VIMEO",
          "Failed to get user info",
          undefined,
          userInfoResponse.status
        );
      }

      const userInfo = await userInfoResponse.json();

      return {
        success: true,
        data: {
          accountId:
            userInfo.uri.split("/").pop() || userInfo.link.split("/").pop(),
          accountName: userInfo.name,
          accountEmail: userInfo.email,
          scopes: this.config.scopes || this.getRequiredScopes(),
        },
      };
    } catch (error) {
      const authError =
        error instanceof ProviderAuthError
          ? error
          : createProviderError("VIMEO", error, "getAccountInfo");
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
    return ["public", "private", "create", "edit", "upload", "stats"];
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

      if (!account || account.provider !== "VIMEO") {
        return false;
      }

      if (account.status !== "ACTIVE") {
        return false;
      }

      // Vimeo tokens are long-lived, but we still validate them
      const decryptedToken = this.decrypt(account.accessToken);
      const validationResult = await this.validateToken(decryptedToken);

      return validationResult.success && validationResult.data === true;
    } catch (error) {
      console.error("Failed to validate integration account:", error);
      return false;
    }
  }

  async refreshTokens(integrationAccountId: string): Promise<boolean> {
    // Vimeo doesn't support token refresh, so we just validate the existing token
    try {
      const account = await this.prisma.integrationAccount.findUnique({
        where: { id: integrationAccountId },
      });

      if (!account || account.provider !== "VIMEO") {
        return false;
      }

      const decryptedToken = this.decrypt(account.accessToken);
      const validationResult = await this.validateToken(decryptedToken);

      if (!validationResult.success || !validationResult.data) {
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

      if (!account || account.provider !== "VIMEO") {
        throw new ProviderAuthError(
          "VIMEO",
          "Integration account not found or invalid provider"
        );
      }

      // Validate the token (Vimeo tokens are long-lived)
      const decryptedToken = this.decrypt(account.accessToken);
      const validationResult = await this.validateToken(decryptedToken);

      if (!validationResult.success || !validationResult.data) {
        throw new TokenExpiredError("VIMEO");
      }

      // Return authenticated client with current tokens
      return {
        accessToken: decryptedToken,
        provider: "VIMEO",
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
          provider: "VIMEO",
          accountName: authResult.userInfo?.name || "Vimeo Account",
          accountEmail: authResult.userInfo?.email,
          accessToken: this.encrypt(authResult.accessToken),
          refreshToken: null, // Vimeo doesn't use refresh tokens
          tokenExpiry: authResult.expiresAt,
          scopes: authResult.scopes,
          status: "ACTIVE",
          userId: userId,
          webhookConfig: {
            webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/vimeo`,
            secretToken: crypto.randomBytes(32).toString("hex"),
            events: [
              "video.upload",
              "video.available",
              "live_event.started",
              "live_event.ended",
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
