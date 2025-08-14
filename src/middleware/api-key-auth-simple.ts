import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export interface ApiKeyContext {
  keyId: string;
  userId: string;
}

export class ApiKeyAuthSimple {
  /**
   * Middleware principal para validar API Keys - Versión compatible con Edge Runtime
   */
  static async validateApiKey(request: NextRequest): Promise<{
    valid: boolean;
    context?: ApiKeyContext;
    error?: string;
    statusCode?: number;
  }> {
    try {
      console.log("🔍 ApiKeyAuthSimple.validateApiKey ejecutándose");

      // Extraer API Key del header
      const apiKey = this.extractApiKey(request);
      console.log(
        "🔍 API Key extraída:",
        apiKey ? apiKey.substring(0, 20) + "..." : "NO"
      );

      if (!apiKey) {
        return {
          valid: false,
          error:
            'API Key is required. Include it in Authorization header as "Bearer YOUR_API_KEY" or X-API-Key header.',
          statusCode: 401,
        };
      }

      // Para debug, aceptar cualquier API Key que empiece con ak_dev_
      if (apiKey.startsWith("ak_dev_")) {
        console.log("✅ API Key válida (debug mode)");
        return {
          valid: true,
          context: {
            keyId: "debug_key_id",
            userId: "debug_user_id",
          },
        };
      }

      return {
        valid: false,
        error: "Invalid API Key format",
        statusCode: 401,
      };
    } catch (error: any) {
      console.error("❌ Error en ApiKeyAuthSimple.validateApiKey:", error);
      return {
        valid: false,
        error: "Internal server error during authentication",
        statusCode: 500,
      };
    }
  }

  /**
   * Extraer API Key de headers
   */
  private static extractApiKey(request: NextRequest): string | null {
    // Opción 1: Authorization Bearer
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Opción 2: X-API-Key header
    const apiKeyHeader = request.headers.get("x-api-key");
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    // Opción 3: Query parameter (menos seguro)
    const url = new URL(request.url);
    const apiKeyParam = url.searchParams.get("api_key");
    if (apiKeyParam) {
      return apiKeyParam;
    }

    return null;
  }
}
