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

const logger = new Logger("API:Drive:RouteMapping");

const prisma = new PrismaClient();
/**
 * GET /api/drive/[routeType]/[routeSubtype]
 * Obtiene la jerarquía para una ruta específica con caché
 * Query params:
 * - maxDepth: Profundidad máxima de la jerarquía (opcional)
 * - forceRefresh: Si es "true", fuerza la actualización de la caché
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { routeType: string; routeSubtype: string } }
) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { routeType, routeSubtype } = params;
    if (!routeType || !routeSubtype) {
      return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
    }

    // Buscar la configuración de ruta
    const routeMapping = await prisma.driveRootMapping.findUnique({
      where: {
        routeType_routeSubtype: {
          routeType,
          routeSubtype,
        },
      },
    });

    if (!routeMapping) {
      return NextResponse.json(
        { error: "Ruta no configurada" },
        { status: 404 }
      );
    }

    // Si la ruta está inactiva, devolver error
    if (!routeMapping.isActive) {
      return NextResponse.json(
        { error: "Esta sección no está disponible actualmente" },
        { status: 403 }
      );
    }

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url);
    const maxDepthParam = searchParams.get("maxDepth");
    const maxDepth = maxDepthParam
      ? parseInt(maxDepthParam)
      : routeMapping.defaultDepth;
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    // Construir clave de caché
    const cacheKey = `${routeType}_${routeSubtype}_${routeMapping.rootFolderId}_${maxDepth}`;

    // Verificar caché si no se fuerza actualización
    if (!forceRefresh) {
      const cachedEntry = await prisma.driveCacheEntry.findUnique({
        where: { cacheKey },
      });

      // Definir tiempo de expiración (4 horas)
      const cacheExpiration = 4 * 60 * 60 * 1000; // 4 horas en ms

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
          `Usando caché para ruta ${routeType}/${routeSubtype} (${Math.floor(
            (new Date().getTime() - cachedEntry.updatedAt.getTime()) / 1000 / 60
          )} min de antigüedad)`
        );

        // Devolver datos desde caché
        return NextResponse.json({
          routeMapping: {
            type: routeMapping.routeType,
            subtype: routeMapping.routeSubtype,
            displayName: routeMapping.displayName,
          },
          root: cachedEntry.hierarchyData,
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

    // Construir jerarquía usando el ID de carpeta raíz configurado
    const options: HierarchyOptions = {
      rootFolderId: routeMapping.rootFolderId,
      maxDepth,
      processMetadata: true,
      includeHidden: false,
    };

    logger.info(
      `Obteniendo jerarquía fresca para ${routeType}/${routeSubtype} (maxDepth: ${maxDepth})`
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
          cacheType: "root",
          routeType,
          routeSubtype,
          folderId: routeMapping.rootFolderId,
          maxDepth,
          cacheKey,
          hierarchyData: JSON.parse(JSON.stringify(hierarchyResponse.root)),
          itemCount: hierarchyResponse.stats.totalItems,
          buildTimeMs: buildTime,
        },
      });
      logger.info(`Caché actualizada para ${routeType}/${routeSubtype}`);
    } catch (cacheError) {
      logger.error("Error al guardar en caché", cacheError);
    }

    // Devolver los datos frescos
    return NextResponse.json({
      routeMapping: {
        type: routeMapping.routeType,
        subtype: routeMapping.routeSubtype,
        displayName: routeMapping.displayName,
      },
      root: hierarchyResponse.root,
      stats: {
        ...hierarchyResponse.stats,
        fromCache: false,
        buildTimeMs: buildTime,
      },
    });
  } catch (error: any) {
    logger.error(
      `Error al obtener jerarquía para ruta ${params.routeType}/${params.routeSubtype}`,
      error
    );
    return NextResponse.json(
      { error: error.message || "Error al obtener jerarquía" },
      { status: 500 }
    );
  }
}
