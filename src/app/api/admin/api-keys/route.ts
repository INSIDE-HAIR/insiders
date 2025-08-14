import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { ApiAuthHelper } from "@/src/lib/api-auth-helper";
import crypto from "crypto";
import prisma from "@/prisma/database";
import {
  CreateApiKeyRequestSchema,
  ApiKeyQueryParamsSchema,
  BulkDeleteApiKeysSchema,
  validateKeyEnvironment,
  extractKeyPrefix
} from "@/src/features/settings/validations/api-keys";

/**
 * Generar una API Key única
 */
function generateApiKey(environment?: string): string {
  const validatedEnv = validateKeyEnvironment(environment);
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `ak_${validatedEnv}_${randomBytes}`;
}

/**
 * Hash de la API Key para almacenamiento seguro
 */
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * GET /api/admin/api-keys
 * Listar API Keys del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parsear y validar query params con Zod
    const { searchParams } = new URL(request.url);
    const queryValidation = ApiKeyQueryParamsSchema.safeParse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.errors },
        { status: 400 }
      );
    }

    const { page, limit, status, search } = queryValidation.data;

    // Construir filtros para Prisma
    const where: any = {
      userId: session.user.id
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Por ahora usar datos mock ya que la tabla no está creada
    let total = 0;
    let apiKeys: any[] = [];
    
    try {
      // Intentar obtener de la base de datos
      total = await prisma.apiKey.count({ where });
      
      // Obtener API Keys paginadas
      const skip = (page - 1) * limit;
      apiKeys = await prisma.apiKey.findMany({
        where,
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
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      });

      return NextResponse.json({
        apiKeys,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      // Si la tabla no existe, usar datos mock
      console.log("Database table not found, using mock data");
      
      const mockApiKeys = [
        {
          id: "mock_1",
          name: "Production API Key",
          description: "Main API key for production environment",
          status: "ACTIVE",
          keyPrefix: "ak_prod_abc1...",
          expiresAt: null,
          userId: session.user.id,
          totalRequests: 15420,
          lastUsedAt: new Date("2024-01-15T10:30:00Z"),
          createdAt: new Date("2024-01-01T00:00:00Z"),
          updatedAt: new Date("2024-01-15T10:30:00Z")
        },
        {
          id: "mock_2",
          name: "Mobile App Key",
          description: "API key for mobile application",
          status: "ACTIVE",
          keyPrefix: "ak_mobile_xyz2...",
          expiresAt: new Date("2024-12-31T23:59:59Z"),
          userId: session.user.id,
          totalRequests: 8200,
          lastUsedAt: new Date("2024-01-16T08:15:00Z"),
          createdAt: new Date("2024-01-05T00:00:00Z"),
          updatedAt: new Date("2024-01-16T08:15:00Z")
        },
        {
          id: "mock_3",
          name: "Development Key",
          description: "API key for development and testing",
          status: "INACTIVE",
          keyPrefix: "ak_dev_def3...",
          expiresAt: null,
          userId: session.user.id,
          totalRequests: 450,
          lastUsedAt: new Date("2024-01-10T12:00:00Z"),
          createdAt: new Date("2024-01-10T00:00:00Z"),
          updatedAt: new Date("2024-01-16T12:00:00Z")
        }
      ];
      
      // Aplicar filtros a los datos mock
      let filteredKeys = mockApiKeys;
      if (status && status !== 'all') {
        filteredKeys = filteredKeys.filter(key => key.status === status);
      }
      
      // Aplicar paginación
      const skip = (page - 1) * limit;
      const paginatedKeys = filteredKeys.slice(skip, skip + limit);
      
      return NextResponse.json({
        apiKeys: paginatedKeys,
        pagination: {
          total: filteredKeys.length,
          page,
          limit,
          pages: Math.ceil(filteredKeys.length / limit)
        },
        usingMockData: true
      });
    }

  } catch (error: any) {
    console.error("Error listing API keys:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/api-keys
 * Crear nueva API Key
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parsear y validar body
    const body = await request.json();
    const validationResult = CreateApiKeyRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid API key data", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

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
        status: 'ACTIVE',
        expiresAt: data.expiresAt || undefined,
        userId: session.user.id,
        totalRequests: 0,
        lastUsedAt: null
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
        updatedAt: true
      }
    });

    return NextResponse.json({
      apiKey: newApiKey,
      // ⚠️ IMPORTANTE: Solo se devuelve la clave completa UNA VEZ al crearla
      key: apiKey,
      message: "API Key created successfully. Save this key securely - it won't be shown again."
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/api-keys
 * Eliminar múltiples API Keys
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parsear y validar body con Zod
    const body = await request.json();
    const validation = BulkDeleteApiKeysSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { keyIds } = validation.data;

    // Verificar que todas las claves pertenecen al usuario actual
    const existingKeys = await prisma.apiKey.findMany({
      where: {
        id: { in: keyIds },
        userId: session.user.id
      },
      select: { id: true }
    });

    if (existingKeys.length !== keyIds.length) {
      return NextResponse.json(
        { error: "Some API keys not found or don't belong to you" },
        { status: 404 }
      );
    }

    // Revocar las claves (no eliminar físicamente para auditoría)
    const revokedKeys = await prisma.apiKey.updateMany({
      where: {
        id: { in: keyIds },
        userId: session.user.id
      },
      data: {
        status: 'REVOKED',
        updatedAt: new Date()
      }
    });

    // Note: Rate limiting cache cleanup removed as it's not part of simplified schema

    return NextResponse.json({
      message: `${revokedKeys.count} API keys revoked successfully`,
      revokedCount: revokedKeys.count
    });

  } catch (error: any) {
    console.error("Error revoking API keys:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}