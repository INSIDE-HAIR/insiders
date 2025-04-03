import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { PrismaClient } from "@prisma/client";
import { Logger } from "@drive/utils/logger";

const logger = new Logger("API:DriveConfig:Routes");

const prisma = new PrismaClient();
/**
 * GET /api/drive/config/routes
 * Obtiene todas las configuraciones de rutas para Drive
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación como administrador
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener todas las configuraciones de rutas
    const routeMappings = await prisma.driveRootMapping.findMany({
      orderBy: { routeType: "asc" },
    });

    return NextResponse.json({ routes: routeMappings });
  } catch (error: any) {
    logger.error("Error al obtener configuraciones de rutas", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener configuraciones de rutas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drive/config/routes
 * Crea o actualiza una configuración de ruta
 * Body:
 * - routeType: Tipo de ruta (marketing, academy, eventos)
 * - routeSubtype: Subtipo de ruta (marketing-salon, ibm, lmadrid)
 * - displayName: Nombre para mostrar
 * - rootFolderId: ID de carpeta raíz en Google Drive
 * - defaultDepth: Profundidad predeterminada (opcional)
 * - isActive: Si la ruta está activa (opcional)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación como administrador
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const {
      routeType,
      routeSubtype,
      displayName,
      rootFolderId,
      defaultDepth = 3,
      isActive = true,
    } = body;

    // Validar campos requeridos
    if (!routeType || !routeSubtype || !displayName || !rootFolderId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Crear o actualizar configuración de ruta
    const routeMapping = await prisma.driveRootMapping.upsert({
      where: {
        routeType_routeSubtype: {
          routeType,
          routeSubtype,
        },
      },
      update: {
        displayName,
        rootFolderId,
        defaultDepth,
        isActive,
        updatedAt: new Date(),
      },
      create: {
        routeType,
        routeSubtype,
        displayName,
        rootFolderId,
        defaultDepth,
        isActive,
      },
    });

    // Borrar caché existente para esta ruta
    try {
      await prisma.driveCacheEntry.deleteMany({
        where: {
          routeType: routeMapping.routeType,
          routeSubtype: routeMapping.routeSubtype,
        },
      });
      logger.info(`Caché invalidada para ruta ${routeType}/${routeSubtype}`);
    } catch (cacheError) {
      logger.warn("Error al invalidar caché", cacheError);
    }

    logger.info(
      `Configuración de ruta ${routeType}/${routeSubtype} ${
        body.id ? "actualizada" : "creada"
      }`
    );

    return NextResponse.json({ route: routeMapping });
  } catch (error: any) {
    logger.error("Error al guardar configuración de ruta", error);
    return NextResponse.json(
      { error: error.message || "Error al guardar configuración de ruta" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/drive/config/routes
 * Elimina una configuración de ruta
 * Query params:
 * - routeType: Tipo de ruta
 * - routeSubtype: Subtipo de ruta
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación como administrador
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url);
    const routeType = searchParams.get("routeType");
    const routeSubtype = searchParams.get("routeSubtype");

    if (!routeType || !routeSubtype) {
      return NextResponse.json(
        { error: "Se requiere especificar routeType y routeSubtype" },
        { status: 400 }
      );
    }

    // Verificar si existe la configuración
    const existingMapping = await prisma.driveRootMapping.findUnique({
      where: {
        routeType_routeSubtype: {
          routeType,
          routeSubtype,
        },
      },
    });

    if (!existingMapping) {
      return NextResponse.json(
        { error: "Configuración de ruta no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar configuración
    await prisma.driveRootMapping.delete({
      where: {
        id: existingMapping.id,
      },
    });

    // Eliminar cachés asociadas
    await prisma.driveCacheEntry.deleteMany({
      where: {
        routeType,
        routeSubtype,
      },
    });

    logger.info(`Configuración de ruta ${routeType}/${routeSubtype} eliminada`);

    return NextResponse.json({
      success: true,
      message: "Configuración de ruta eliminada correctamente",
    });
  } catch (error: any) {
    logger.error("Error al eliminar configuración de ruta", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar configuración de ruta" },
      { status: 500 }
    );
  }
}
