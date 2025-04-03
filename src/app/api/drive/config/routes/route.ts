import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { PrismaClient } from "@prisma/client";
import { Logger } from "@/src/features/drive/utils/logger";

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
      orderBy: { routeLevel1: "asc" },
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
 * - routeLevel1: Nivel 1 (obligatorio): ej. marketing
 * - routeLevel2: Nivel 2 (opcional): ej. eventos
 * - routeLevel3: Nivel 3 (opcional): ej. 2023
 * - routeLevel4: Nivel 4 (opcional): ej. q1
 * - routeLevel5: Nivel 5 (opcional): ej. enero
 * - title: Título principal
 * - subtitle: Subtítulo (opcional)
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
      id, // Id para edición, opcional
      routeLevel1,
      routeLevel2 = null,
      routeLevel3 = null,
      routeLevel4 = null,
      routeLevel5 = null,
      title,
      subtitle = null,
      rootFolderId,
      defaultDepth = 3,
      isActive = true,
    } = body;

    // Validar campos requeridos
    if (!routeLevel1 || !title || !rootFolderId) {
      return NextResponse.json(
        {
          error:
            "Faltan campos requeridos: nivel de ruta 1, título e ID de carpeta",
        },
        { status: 400 }
      );
    }

    // Verificar que no exista una ruta con la misma combinación de niveles (excepto al editar)
    if (!id) {
      const existingRoute = await prisma.driveRootMapping.findFirst({
        where: {
          routeLevel1,
          routeLevel2,
          routeLevel3,
          routeLevel4,
          routeLevel5,
        },
      });

      if (existingRoute) {
        return NextResponse.json(
          { error: "Ya existe una ruta con esta combinación de niveles" },
          { status: 400 }
        );
      }
    }

    // Crear o actualizar configuración de ruta
    let routeMapping;

    if (id) {
      // Edición de ruta existente
      routeMapping = await prisma.driveRootMapping.update({
        where: { id },
        data: {
          routeLevel1,
          routeLevel2,
          routeLevel3,
          routeLevel4,
          routeLevel5,
          title,
          subtitle,
          rootFolderId,
          defaultDepth,
          isActive,
          updatedAt: new Date(),
        },
      });
    } else {
      // Creación de nueva ruta
      routeMapping = await prisma.driveRootMapping.create({
        data: {
          routeLevel1,
          routeLevel2,
          routeLevel3,
          routeLevel4,
          routeLevel5,
          title,
          subtitle,
          rootFolderId,
          defaultDepth,
          isActive,
        },
      });
    }

    // Borrar caché existente para esta ruta
    try {
      // Invalidar cachés de ruta específica
      await prisma.driveCacheEntry.deleteMany({
        where: {
          routeLevel1: routeMapping.routeLevel1,
          routeLevel2: routeMapping.routeLevel2,
          routeLevel3: routeMapping.routeLevel3,
          routeLevel4: routeMapping.routeLevel4,
          routeLevel5: routeMapping.routeLevel5,
        },
      });

      // Invalidar también la caché de jerarquía relacionada con esta carpeta
      await prisma.driveCacheEntry.deleteMany({
        where: {
          folderId: routeMapping.rootFolderId,
          cacheType: "hierarchy",
        },
      });

      // Borrar también la caché de jerarquía general
      await prisma.driveCacheEntry.deleteMany({
        where: {
          cacheKey: {
            startsWith: `hierarchy_${routeMapping.rootFolderId}`,
          },
        },
      });

      // Construir ruta para el log
      const routePath = [
        routeMapping.routeLevel1,
        routeMapping.routeLevel2,
        routeMapping.routeLevel3,
        routeMapping.routeLevel4,
        routeMapping.routeLevel5,
      ]
        .filter(Boolean)
        .join("/");

      logger.info(
        `Cachés invalidadas para ruta ${routePath} y sus jerarquías asociadas`
      );
    } catch (cacheError) {
      logger.warn("Error al invalidar caché", cacheError);
    }

    logger.info(
      `Configuración de ruta ${id ? "actualizada" : "creada"}: ${
        routeMapping.title
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
 * - id: ID de la ruta a eliminar
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere especificar el ID de la ruta" },
        { status: 400 }
      );
    }

    // Verificar si existe la configuración
    const existingMapping = await prisma.driveRootMapping.findUnique({
      where: { id },
    });

    if (!existingMapping) {
      return NextResponse.json(
        { error: "Configuración de ruta no encontrada" },
        { status: 404 }
      );
    }

    // Construir ruta para el log
    const routePath = [
      existingMapping.routeLevel1,
      existingMapping.routeLevel2,
      existingMapping.routeLevel3,
      existingMapping.routeLevel4,
      existingMapping.routeLevel5,
    ]
      .filter(Boolean)
      .join("/");

    // Eliminar cachés asociadas a la ruta
    await prisma.driveCacheEntry.deleteMany({
      where: {
        routeLevel1: existingMapping.routeLevel1,
        routeLevel2: existingMapping.routeLevel2,
        routeLevel3: existingMapping.routeLevel3,
        routeLevel4: existingMapping.routeLevel4,
        routeLevel5: existingMapping.routeLevel5,
      },
    });

    // Invalidar también la caché de jerarquía relacionada con esta carpeta
    await prisma.driveCacheEntry.deleteMany({
      where: {
        folderId: existingMapping.rootFolderId,
        cacheType: "hierarchy",
      },
    });

    // Borrar también la caché de jerarquía general
    await prisma.driveCacheEntry.deleteMany({
      where: {
        cacheKey: {
          startsWith: `hierarchy_${existingMapping.rootFolderId}`,
        },
      },
    });

    logger.info(
      `Cachés invalidadas para ruta ${routePath} y sus jerarquías asociadas`
    );

    // Eliminar configuración
    await prisma.driveRootMapping.delete({
      where: { id },
    });

    logger.info(`Configuración de ruta eliminada: ${routePath}`);

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
