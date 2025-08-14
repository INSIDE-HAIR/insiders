import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import prisma from "@/prisma/database";
import {
  UpdateApiKeyRequestSchema,
  validateKeyId
} from "@/src/features/settings/validations/api-keys";

/**
 * GET /api/admin/api-keys/[keyId]
 * Obtener detalles de una API Key específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
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

    // Extraer keyId de params
    const { keyId } = await params;

    // Validar keyId con Zod
    try {
      validateKeyId(keyId);
    } catch (error: any) {
      return NextResponse.json(
        { error: "Invalid key ID", details: error.message },
        { status: 400 }
      );
    }

    // Buscar la API Key en base de datos - versión simplificada
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id
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

    if (!apiKey) {
      return NextResponse.json({ error: "API Key not found" }, { status: 404 });
    }

    return NextResponse.json({
      apiKey: apiKey
    });

  } catch (error: any) {
    console.error("Error fetching API key details:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/api-keys/[keyId]
 * Actualizar API Key
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
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

    const { keyId } = await params;

    // Validar keyId con Zod
    try {
      validateKeyId(keyId);
    } catch (error: any) {
      return NextResponse.json(
        { error: "Invalid key ID", details: error.message },
        { status: 400 }
      );
    }

    // Parsear y validar body
    const body = await request.json();
    const validationResult = UpdateApiKeyRequestSchema.safeParse(body);
    
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

    // Verificar que la API Key existe y pertenece al usuario
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id
      }
    });

    if (!existingKey) {
      return NextResponse.json({ error: "API Key not found" }, { status: 404 });
    }

    // Actualizar la API Key
    const updatedApiKey = await prisma.apiKey.update({
      where: { 
        id: keyId,
        userId: session.user.id // Doble seguridad
      },
      data: {
        ...data,
        updatedAt: new Date()
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
      apiKey: updatedApiKey,
      message: "API Key updated successfully"
    });

  } catch (error: any) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/api-keys/[keyId]
 * Eliminar permanentemente API Key específica (solo si está revocada)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
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

    // Extraer keyId de params
    const { keyId } = await params;

    // Validar keyId con Zod
    try {
      validateKeyId(keyId);
    } catch (error: any) {
      return NextResponse.json(
        { error: "Invalid key ID", details: error.message },
        { status: 400 }
      );
    }

    // Verificar que la API Key existe y pertenece al usuario
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id
      }
    });

    if (!existingKey) {
      return NextResponse.json({ error: "API Key not found" }, { status: 404 });
    }

    // Solo permitir eliminar claves que están revocadas
    if (existingKey.status !== 'REVOKED') {
      return NextResponse.json(
        { error: "Only revoked API keys can be permanently deleted. Please revoke the key first." },
        { status: 400 }
      );
    }

    // Eliminar físicamente la clave de la base de datos
    await prisma.apiKey.delete({
      where: { 
        id: keyId,
        userId: session.user.id // Doble seguridad
      }
    });

    return NextResponse.json({
      message: "API Key permanently deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}