/**
 * API endpoint para actualizar fechas de inicio y fin de salas de Meet
 * PATCH /api/meet/rooms/[id]/dates
 */

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/config/auth/auth";
import { ApiKeyAuth } from "@/src/middleware/api-key-auth";
import prisma from "@/src/lib/prisma";

interface UpdateDatesRequest {
  startDate?: string;
  endDate?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params;
  console.log(`🔄 [DATES API] PATCH request iniciado para roomId: ${roomId}`);

  try {
    // Verificar autenticación por sesión o API Key
    const session = await auth();
    const apiKeyValidation = await ApiKeyAuth.validateApiKey(request);

    let isAuthenticated = false;
    let authMethod = "none";
    let userId = null;

    if (session?.user?.email) {
      isAuthenticated = true;
      authMethod = "session";
      userId = session.user.id;
      console.log(
        `🔐 [DATES API] Autenticado por sesión: ${session.user.email}`
      );
      console.log(`👤 [DATES API] Rol de usuario: ${session.user.role}`);
    } else if (apiKeyValidation.valid && apiKeyValidation.context) {
      isAuthenticated = true;
      authMethod = "api_key";
      userId = apiKeyValidation.context.userId;
      console.log(`🔑 [DATES API] Autenticado por API Key: ${userId}`);
    }

    if (!isAuthenticated) {
      console.log(`❌ [DATES API] Error de autenticación - no autenticado`);
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin (solo para sesión, las API Keys ya están validadas)
    if (authMethod === "session" && session && session.user?.role !== "ADMIN") {
      console.log(
        `🚫 [DATES API] Error de autorización - usuario ${session.user.email} con rol ${session.user.role} intentó actualizar fechas`
      );
      return NextResponse.json(
        {
          error:
            "No autorizado. Solo administradores pueden actualizar fechas de salas.",
        },
        { status: 403 }
      );
    }

    if (!roomId) {
      console.log(`❌ [DATES API] Error - ID de sala faltante`);
      return NextResponse.json(
        { error: "ID de sala requerido" },
        { status: 400 }
      );
    }

    // Parsear el body de la request
    let body: UpdateDatesRequest;
    try {
      body = await request.json();
      console.log(`📥 [DATES API] Body parseado:`, {
        startDate: body.startDate,
        endDate: body.endDate,
        roomId,
      });
    } catch (error) {
      console.log(`❌ [DATES API] Error parseando body:`, error);
      return NextResponse.json(
        { error: "Formato de datos inválido" },
        { status: 400 }
      );
    }

    const { startDate, endDate } = body;

    // Validar fechas si se proporcionan
    console.log(
      `🔍 [DATES API] Validando fechas - startDate: ${startDate}, endDate: ${endDate}`
    );

    if (startDate && isNaN(new Date(startDate).getTime())) {
      console.log(`❌ [DATES API] Fecha de inicio inválida: ${startDate}`);
      return NextResponse.json(
        { error: "Fecha de inicio inválida" },
        { status: 400 }
      );
    }

    if (endDate && isNaN(new Date(endDate).getTime())) {
      console.log(`❌ [DATES API] Fecha de fin inválida: ${endDate}`);
      return NextResponse.json(
        { error: "Fecha de fin inválida" },
        { status: 400 }
      );
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      console.log(
        `📅 [DATES API] Validando rango de fechas - inicio: ${start.toISOString()}, fin: ${end.toISOString()}`
      );

      if (end <= start) {
        console.log(
          `❌ [DATES API] Error de validación - fecha fin (${end.toISOString()}) no es posterior a fecha inicio (${start.toISOString()})`
        );
        return NextResponse.json(
          { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
          { status: 400 }
        );
      }
    }

    // Buscar la sala en la base de datos
    console.log(`🔍 Buscando sala con spaceId: ${roomId}`);
    const existingRoom = await prisma.meetSpace.findUnique({
      where: { spaceId: roomId },
    });

    if (!existingRoom) {
      console.log(`❌ Sala no encontrada con spaceId: ${roomId}`);
      // Intentar crear el registro si no existe
      console.log(`🆕 Creando nuevo registro para spaceId: ${roomId}`);
      const newRoom = await prisma.meetSpace.create({
        data: {
          spaceId: roomId,
          displayName: `Sala ${roomId}`,
          createdBy:
            authMethod === "session" && session
              ? session.user.email
              : `api_key_${userId}`,
        },
      });
      console.log(`✅ Nuevo registro creado:`, newRoom);
    } else {
      console.log(`✅ Sala encontrada:`, existingRoom);
    }

    // Actualizar las fechas en la base de datos
    console.log(`📅 Actualizando fechas para spaceId: ${roomId}`);
    console.log(`📅 startDate: ${startDate}`);
    console.log(`📅 endDate: ${endDate}`);

    const updatedRoom = await prisma.meetSpace.update({
      where: { spaceId: roomId },
      data: {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    console.log(`✅ Sala actualizada:`, updatedRoom);

    const responseData = {
      success: true,
      message: "Fechas actualizadas correctamente",
      room: {
        spaceId: updatedRoom.spaceId,
        startDate: updatedRoom.startDate?.toISOString(),
        endDate: updatedRoom.endDate?.toISOString(),
      },
    };

    console.log(`🎉 [DATES API] Respuesta exitosa enviada:`, responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error(
      `💥 [DATES API] Error crítico actualizando fechas de sala ${roomId}:`,
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        roomId,
        timestamp: new Date().toISOString(),
      }
    );

    // Manejo de errores específicos de Prisma
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; meta?: any };
      console.error(`🗃️ [DATES API] Error específico de Prisma:`, {
        code: prismaError.code,
        meta: prismaError.meta,
        roomId,
      });

      switch (prismaError.code) {
        case "P2002":
          console.log(
            `⚠️ [DATES API] Conflicto de datos únicos para sala ${roomId}`
          );
          return NextResponse.json(
            { error: "Conflicto de datos" },
            { status: 409 }
          );
        case "P2025":
          console.log(
            `❌ [DATES API] Sala ${roomId} no encontrada durante actualización`
          );
          return NextResponse.json(
            { error: "Sala no encontrada" },
            { status: 404 }
          );
        default:
          console.log(
            `❓ [DATES API] Error Prisma no manejado:`,
            prismaError.code
          );
          break;
      }
    }

    const errorResponse = {
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : "Unknown error"
          : undefined,
    };

    console.error(
      `💥 [DATES API] Enviando respuesta de error 500:`,
      errorResponse
    );
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Endpoint para obtener las fechas actuales (opcional)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params;
  console.log(`📖 [DATES API] GET request iniciado para roomId: ${roomId}`);

  try {
    // Verificar autenticación por sesión o API Key
    const session = await auth();
    const apiKeyValidation = await ApiKeyAuth.validateApiKey(request);

    let isAuthenticated = false;
    let authMethod = "none";
    let userId = null;

    if (session?.user?.email) {
      isAuthenticated = true;
      authMethod = "session";
      userId = session.user.id;
      console.log(
        `🔐 [DATES API] GET - Autenticado por sesión: ${session.user.email}`
      );
    } else if (apiKeyValidation.valid && apiKeyValidation.context) {
      isAuthenticated = true;
      authMethod = "api_key";
      userId = apiKeyValidation.context.userId;
      console.log(`🔑 [DATES API] GET - Autenticado por API Key: ${userId}`);
    }

    if (!isAuthenticated) {
      console.log(
        `❌ [DATES API] GET - Error de autenticación - no autenticado`
      );
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin (solo para sesión, las API Keys ya están validadas)
    if (authMethod === "session" && session && session.user?.role !== "ADMIN") {
      console.log(
        `🚫 [DATES API] GET - Error de autorización - usuario ${session.user.email} con rol ${session.user.role}`
      );
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    if (!roomId) {
      console.log(`❌ [DATES API] GET - ID de sala faltante`);
      return NextResponse.json(
        { error: "ID de sala requerido" },
        { status: 400 }
      );
    }

    // Buscar la sala en la base de datos
    console.log(
      `🔍 [DATES API] GET - Buscando sala en BD con spaceId: ${roomId}`
    );
    const room = await prisma.meetSpace.findUnique({
      where: { spaceId: roomId },
      select: {
        spaceId: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!room) {
      console.log(
        `❌ [DATES API] GET - Sala no encontrada con spaceId: ${roomId}`
      );
      return NextResponse.json(
        { error: "Sala no encontrada" },
        { status: 404 }
      );
    }

    console.log(`✅ [DATES API] GET - Sala encontrada:`, {
      spaceId: room.spaceId,
      startDate: room.startDate?.toISOString(),
      endDate: room.endDate?.toISOString(),
    });

    const responseData = {
      spaceId: room.spaceId,
      startDate: room.startDate?.toISOString(),
      endDate: room.endDate?.toISOString(),
    };

    console.log(
      `📤 [DATES API] GET - Respuesta exitosa enviada:`,
      responseData
    );
    return NextResponse.json(responseData);
  } catch (error) {
    console.error(
      `💥 [DATES API] GET - Error crítico obteniendo fechas de sala ${roomId}:`,
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        roomId,
        timestamp: new Date().toISOString(),
      }
    );

    const errorResponse = {
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : "Unknown error"
          : undefined,
    };

    console.error(
      `💥 [DATES API] GET - Enviando respuesta de error 500:`,
      errorResponse
    );
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
