import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export interface ApiKeyContext {
  keyId: string;
  userId: string;
}

export class ApiKeyAuthDebug {
  /**
   * Middleware principal para validar API Keys - Versión simplificada
   */
  static async validateApiKey(request: NextRequest): Promise<{
    valid: boolean;
    context?: ApiKeyContext;
    error?: string;
    statusCode?: number;
  }> {
    try {
      console.log("🔍 ApiKeyAuthDebug.validateApiKey ejecutándose");

      // Extraer API Key del header
      const apiKey = this.extractApiKey(request);
      console.log("🔍 API Key extraída:", apiKey ? "SÍ" : "NO");

      if (!apiKey) {
        return {
          valid: false,
          error:
            'API Key is required. Include it in Authorization header as "Bearer YOUR_API_KEY" or X-API-Key header.',
          statusCode: 401,
        };
      }

      // Hash de la clave para buscarla en BD
      const keyHash = this.hashApiKey(apiKey);
      console.log("🔍 Hash generado:", keyHash);

      // Buscar en base de datos
      const apiKeyRecord = await prisma.apiKey.findUnique({
        where: { keyHash },
        select: {
          id: true,
          name: true,
          status: true,
          expiresAt: true,
          userId: true,
          totalRequests: true,
          lastUsedAt: true,
        },
      });

      console.log("🔍 API Key encontrada en BD:", apiKeyRecord ? "SÍ" : "NO");

      if (!apiKeyRecord) {
        return {
          valid: false,
          error: "Invalid API Key",
          statusCode: 401,
        };
      }

      // Verificar estado de la clave
      if (apiKeyRecord.status !== "ACTIVE") {
        return {
          valid: false,
          error: `API Key is ${apiKeyRecord.status.toLowerCase()}`,
          statusCode: 401,
        };
      }

      // Verificar expiración
      if (apiKeyRecord.expiresAt && new Date() > apiKeyRecord.expiresAt) {
        return {
          valid: false,
          error: "API Key has expired",
          statusCode: 401,
        };
      }

      console.log("✅ API Key válida, usuario:", apiKeyRecord.userId);

      return {
        valid: true,
        context: {
          keyId: apiKeyRecord.id,
          userId: apiKeyRecord.userId,
        },
      };
    } catch (error: any) {
      console.error("❌ Error en ApiKeyAuthDebug.validateApiKey:", error);
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

  /**
   * Hash de API Key para almacenamiento seguro
   */
  private static hashApiKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex");
  }
}
