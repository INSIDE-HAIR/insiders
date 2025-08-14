import { NextRequest, NextResponse } from "next/server";
import { ApiKeyAuth } from "@/src/middleware/api-key-auth";
import { auth } from "@/src/config/auth/auth";
import crypto from "crypto";
import prisma from "@/prisma/database";
import { z } from "zod";

// Schema de validación para crear API Key
const CreateApiKeySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .regex(/^[a-zA-Z0-9\s\-_\.\(\)]+$/, "Name contains invalid characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : undefined)),
  expiresAt: z
    .union([
      z
        .string()
        .datetime("Invalid date format")
        .transform((val) => {
          const date = new Date(val);
          if (date <= new Date()) {
            throw new Error("Expiration date must be in the future");
          }
          return date;
        }),
      z.undefined(),
      z.null(),
    ])
    .optional()
    .transform((val) => (val === null ? undefined : val)),
  // Permitir especificar userId cuando se crea desde API Key
  userId: z.string().optional(),
});

/**
 * Generar una API Key única
 */
function generateApiKey(environment: string = "dev"): string {
  const randomBytes = crypto.randomBytes(16).toString("hex");
  return `ak_${environment}_${randomBytes}`;
}

/**
 * Hash de API Key para almacenamiento seguro
 */
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Extraer prefijo de API Key para mostrar
 */
function extractKeyPrefix(key: string): string {
  return key.substring(0, 12) + "...";
}

/**
 * POST /api/v1/admin/api-keys/create
 * Crear nueva API Key usando API Key
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener contexto de la API Key del middleware
    const apiKeyValidation = await ApiKeyAuth.validateApiKey(request);

    if (!apiKeyValidation.valid || !apiKeyValidation.context) {
      return NextResponse.json(
        { error: apiKeyValidation.error || "No API Key context found" },
        { status: apiKeyValidation.statusCode || 401 }
      );
    }

    const apiKeyContext = apiKeyValidation.context;

    console.log("🔑 Creando API Key con contexto:", apiKeyContext);

    // Parsear y validar body
    const body = await request.json();
    const validationResult = CreateApiKeySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid API key data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Intentar obtener la sesión del usuario autenticado
    let session;
    let userId;
    let authMethod = "api_key";

    try {
      session = await auth();
      if (session?.user) {
        // Si hay sesión, usar el ID del usuario autenticado
        userId = session.user.id;
        authMethod = "session";
        console.log("👤 Usuario autenticado por sesión:", userId);
      } else {
        // Si no hay sesión, usar el userId especificado en el body o el de la API Key
        userId = data.userId || apiKeyContext.userId;
        console.log("🔑 Usando userId de API Key:", userId);
      }
    } catch (error) {
      // Si hay error al obtener la sesión, usar el userId especificado o el de la API Key
      userId = data.userId || apiKeyContext.userId;
      console.log("🔑 Usando userId de API Key (error en sesión):", userId);
    }

    // Generar la clave real
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = extractKeyPrefix(apiKey);

    // Crear en base de datos con Prisma
    const newApiKey = await prisma.apiKey.create({
      data: {
        name: data.name,
        description: data.description || undefined,
        keyHash,
        keyPrefix,
        status: "ACTIVE",
        expiresAt: data.expiresAt || undefined,
        userId: userId, // Usar el userId determinado arriba
        totalRequests: 0,
        lastUsedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        keyPrefix: true,
        expiresAt: true,
        userId: true,
        totalRequests: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("✅ API Key creada exitosamente:", newApiKey.id);

    return NextResponse.json(
      {
        success: true,
        message: "API Key created successfully using API Key authentication",
        data: {
          apiKey: newApiKey,
          // ⚠️ IMPORTANTE: Solo se devuelve la clave completa UNA VEZ al crearla
          key: apiKey,
          createdBy: {
            keyId: apiKeyContext.keyId,
            userId: apiKeyContext.userId,
            finalUserId: userId,
            authMethod: authMethod,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
