import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { PrismaClient } from "@prisma/client";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@drive/services/analyzer/fileAnalyzer";
import {
  HierarchyService,
  HierarchyOptions,
} from "@drive/services/hierarchy/hierarchyService";
import { Logger } from "@drive/utils/logger";

const logger = new Logger("API:Drive:RouteMapping:Folder");

const prisma = new PrismaClient();

/**
 * GET /api/drive/[routeType]/[routeSubtype]/folders/[id]
 * Obtiene la jerarquía para una carpeta específica dentro de una ruta
 * Query params:
 * - maxDepth: Profundidad máxima de la jerarquía (opcional)
 * - forceRefresh: Si es "true", fuerza la actualización de la caché
 */
export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: { routeType: string; routeSubtype: string; id: string } }
) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { routeType, routeSubtype, id: folderId } = params;
    if (!routeType || !routeSubtype || !folderId) {
      return NextResponse.json(
        { error: "Ruta o ID inválidos" },
        { status: 400 }
      );
    }

    // Buscar la configuración de ruta para contexto
    const routeMapping = await prisma.driveRootMapping.findUnique({
      where: {
        routeType_routeSubtype: {
          routeType,
          routeSubtype,
        },
      },
    });

    // La ruta debe existir y estar activa
    if (!routeMapping || !routeMapping.isActive) {
      return NextResponse.json(
        { error: "Esta sección no está disponible" },
        { status: 403 }
      );
    }

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url);
    const maxDepthParam = searchParams.get("maxDepth");
    // Para carpetas específicas usamos una profundidad menor por defecto
    const maxDepth = maxDepthParam
      ? parseInt(maxDepthParam)
      : Math.min(2, routeMapping.defaultDepth);
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    // Construir clave de caché para la carpeta específica
    const cacheKey = `folder_${folderId}_${maxDepth}_${routeType}_${routeSubtype}`;

    // Verificar caché si no se fuerza actualización
    if (!forceRefresh) {
      const cachedEntry = await prisma.driveCacheEntry.findUnique({
        where: { cacheKey },
      });

      // Definir tiempo de expiración (2 horas para carpetas específicas)
      const cacheExpiration = 2 * 60 * 60 * 1000; // 2 horas en ms

      if (
        cachedEntry &&
        new Date().getTime() - cachedEntry.updatedAt.getTime() < cacheExpiration
      ) {
        // Incrementar contador de accesos
        await prisma.driveCacheEntry.update({
          where: { id: cachedEntry.id },
          data: { accessCount: { increment: 1 } },
        });

        logger.info(
          `Usando caché para carpeta ${folderId} en ${routeType}/${routeSubtype} (${Math.floor(
            (new Date().getTime() - cachedEntry.updatedAt.getTime()) / 1000 / 60
          )} min de antigüedad)`
        );

        // Devolver datos desde caché
        return NextResponse.json({
          routeContext: {
            type: routeMapping.routeType,
            subtype: routeMapping.routeSubtype,
            displayName: routeMapping.displayName,
          },
          folder: {
            id: folderId,
            hierarchy: cachedEntry.hierarchyData,
          },
          stats: {
            totalItems: cachedEntry.itemCount,
            fromCache: true,
            cacheAge: Math.floor(
              (new Date().getTime() - cachedEntry.updatedAt.getTime()) /
                1000 /
                60
            ), // minutos
            maxDepth,
          },
        });
      }
    }

    // Si no hay caché válida o se fuerza actualización, obtener datos frescos
    const startTime = Date.now();

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();
    const fileAnalyzer = new FileAnalyzer();
    const hierarchyService = new HierarchyService(driveService, fileAnalyzer);

    // Verificar si la carpeta existe y obtener sus detalles
    const folder = await driveService.getFolder(folderId);
    if (!folder) {
      return NextResponse.json(
        { error: "Carpeta no encontrada" },
        { status: 404 }
      );
    }

    // Construir jerarquía para esta carpeta específica
    const options: HierarchyOptions = {
      rootFolderId: folderId,
      maxDepth,
      processMetadata: true,
      includeHidden: false,
    };

    logger.info(
      `Obteniendo jerarquía fresca para carpeta ${folderId} en ${routeType}/${routeSubtype} (maxDepth: ${maxDepth})`
    );
    const hierarchyResponse = await hierarchyService.buildHierarchy(options);
    const buildTime = Date.now() - startTime;

    // Guardar en caché
    try {
      await prisma.driveCacheEntry.upsert({
        where: { cacheKey },
        update: {
          hierarchyData: JSON.parse(JSON.stringify(hierarchyResponse.root)),
          itemCount: hierarchyResponse.stats.totalItems,
          buildTimeMs: buildTime,
          accessCount: 1, // Resetear contador de accesos
        },
        create: {
          cacheType: "folder",
          routeType,
          routeSubtype,
          folderId,
          maxDepth,
          cacheKey,
          hierarchyData: JSON.parse(JSON.stringify(hierarchyResponse.root)),
          itemCount: hierarchyResponse.stats.totalItems,
          buildTimeMs: buildTime,
        },
      });
      logger.info(
        `Caché actualizada para carpeta ${folderId} en ${routeType}/${routeSubtype}`
      );
    } catch (cacheError) {
      logger.error("Error al guardar en caché", cacheError);
    }

    // Devolver los datos frescos
    return NextResponse.json({
      routeContext: {
        type: routeMapping.routeType,
        subtype: routeMapping.routeSubtype,
        displayName: routeMapping.displayName,
      },
      folder: {
        id: folderId,
        name: folder.name,
        hierarchy: hierarchyResponse.root,
      },
      stats: {
        ...hierarchyResponse.stats,
        fromCache: false,
        buildTimeMs: buildTime,
      },
    });
  } catch (error: any) {
    logger.error(
      `Error al obtener jerarquía para carpeta ${params.id} en ruta ${params.routeType}/${params.routeSubtype}`,
      error
    );
    return NextResponse.json(
      { error: error.message || "Error al obtener jerarquía de carpeta" },
      { status: 500 }
    );
  }
}
