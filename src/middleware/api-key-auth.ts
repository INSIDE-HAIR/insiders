import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { headers } from "next/headers";
import {
  validateApiKeyFormat,
  extractKeyPrefix,
} from "@/src/features/settings/validations/api-keys";

const prisma = new PrismaClient();

export interface ApiKeyContext {
  keyId: string;
  userId: string;
}

export class ApiKeyAuth {
  /**
   * Middleware principal para validar API Keys
   */
  static async validateApiKey(request: NextRequest): Promise<{
    valid: boolean;
    context?: ApiKeyContext;
    error?: string;
    statusCode?: number;
  }> {
    try {
      console.log("🔍 ApiKeyAuth.validateApiKey ejecutándose");
      console.log("🔍 DATABASE_URL configurado:", !!process.env.DATABASE_URL);

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

      // Validar formato de la clave
      if (!validateApiKeyFormat(apiKey)) {
        console.log("❌ Formato de API Key inválido");
        return {
          valid: false,
          error: "Invalid API Key format",
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
        console.log("❌ API Key no encontrada en la base de datos");
        return {
          valid: false,
          error: "Invalid API Key",
          statusCode: 401,
        };
      }

      // Verificar estado de la clave
      if (apiKeyRecord.status !== "ACTIVE") {
        console.log(`❌ API Key está ${apiKeyRecord.status.toLowerCase()}`);
        return {
          valid: false,
          error: `API Key is ${apiKeyRecord.status.toLowerCase()}`,
          statusCode: 401,
        };
      }

      // Verificar expiración
      if (apiKeyRecord.expiresAt && new Date() > apiKeyRecord.expiresAt) {
        console.log("❌ API Key ha expirado");
        return {
          valid: false,
          error: "API Key has expired",
          statusCode: 401,
        };
      }

      console.log("✅ API Key válida, usuario:", apiKeyRecord.userId);

      // Actualizar último uso
      await this.updateLastUsed(apiKeyRecord.id);

      return {
        valid: true,
        context: {
          keyId: apiKeyRecord.id,
          userId: apiKeyRecord.userId,
        },
      };
    } catch (error: any) {
      console.error("❌ Error en ApiKeyAuth.validateApiKey:", error);
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

  /**
   * Actualizar último uso
   */
  private static async updateLastUsed(keyId: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { lastUsedAt: new Date() },
    });
  }
}

/**
 * Hook para usar en API routes
 */
export function useApiKeyContext(request: NextRequest): ApiKeyContext | null {
  const contextHeader = request.headers.get("x-api-key-context");
  if (contextHeader) {
    try {
      return JSON.parse(contextHeader);
    } catch {
      return null;
    }
  }
  return null;
}
