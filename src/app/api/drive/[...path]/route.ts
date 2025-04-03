import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleDriveExplorer } from "@/src/features/drive/services/drive/GoogleDriveExplorer";
import { GoogleDriveService } from "@/src/features/drive/services/drive/GoogleDriveService";
import { Logger } from "@/src/features/drive/utils/logger";
import { auth } from "@/src/config/auth/auth";
import { FileAnalyzer } from "@/src/features/drive/services/analyzer/fileAnalyzer";
import {
  HierarchyService,
  HierarchyOptions,
} from "@/src/features/drive/services/hierarchy/hierarchyService";

const logger = new Logger("API:Drive");
const prisma = new PrismaClient();
const driveService = new GoogleDriveService();
const fileAnalyzer = new FileAnalyzer();
const hierarchyService = new HierarchyService(driveService, fileAnalyzer);

/**
 * GET /api/drive/[...path]
 * Gestiona todas las peticiones a rutas de Google Drive
 * Ejemplos:
 * - /api/drive/marketing/eventos
 * - /api/drive/marketing/eventos/folders/123456
 *
 * Query params:
 * - maxDepth: Profundidad máxima de la jerarquía (opcional)
 * - forceRefresh: Si es "true", fuerza la actualización de la caché
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const path = params.path;
    if (!path || path.length === 0) {
      return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
    }

    // Determinar si es una ruta de carpeta específica
    let folderId: string | null = null;
    let routePath = [...path];

    // Verificar si la ruta incluye 'folders' seguido de un ID
    const folderIndex = path.indexOf("folders");
    if (folderIndex !== -1 && folderIndex < path.length - 1) {
      folderId = path[folderIndex + 1];
      // Extraer la ruta principal (sin folders/id)
      routePath = path.slice(0, folderIndex);
    }

    // Mapear los segmentos de la ruta a niveles
    const routeLevels: Record<string, string> = {};
    for (let i = 0; i < Math.min(routePath.length, 5); i++) {
      routeLevels[`routeLevel${i + 1}`] = routePath[i];
    }

    // Buscar la configuración de ruta
    const routeMapping = await prisma.driveRootMapping.findFirst({
      where: {
        ...routeLevels,
        isActive: true,
      },
    });

    if (!routeMapping) {
      return NextResponse.json(
        { error: "Ruta no configurada" },
        { status: 404 }
      );
    }

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url);
    const maxDepthParam = searchParams.get("maxDepth");
    const maxDepth = maxDepthParam
      ? parseInt(maxDepthParam)
      : routeMapping.defaultDepth;
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    // Determinar el ID de carpeta raíz a usar
    const rootFolderId = folderId || routeMapping.rootFolderId;

    // Construir clave de caché
    const routeKey = routePath.join("_");
    const cacheKey = folderId
      ? `folder_${folderId}_${maxDepth}_${routeKey}`
      : `route_${routeKey}_${routeMapping.rootFolderId}_${maxDepth}`;

    // Verificar caché si no se fuerza actualización
    if (!forceRefresh) {
      const cachedEntry = await prisma.driveCacheEntry.findUnique({
        where: { cacheKey },
      });

      // Definir tiempo de expiración (diferente según el tipo)
      const cacheExpiration = folderId
        ? 2 * 60 * 60 * 1000 // 2 horas para carpetas específicas
        : 4 * 60 * 60 * 1000; // 4 horas para rutas principales

      if (
        cachedEntry &&
        new Date().getTime() - cachedEntry.updatedAt.getTime() < cacheExpiration
      ) {
        // Incrementar contador de accesos
        await prisma.driveCacheEntry.update({
          where: { id: cachedEntry.id },
          data: { accessCount: { increment: 1 } },
        });

        const cacheAge = Math.floor(
          (new Date().getTime() - cachedEntry.updatedAt.getTime()) / 1000 / 60
        );

        logger.info(
          `Usando caché para ${
            folderId ? `carpeta ${folderId}` : `ruta ${routePath.join("/")}`
          } (${cacheAge} min de antigüedad)`
        );

        // Estructura de respuesta común
        const response = {
          routeInfo: {
            path: routePath,
            title: routeMapping.title,
            subtitle: routeMapping.subtitle,
            levels: {
              level1: routeMapping.routeLevel1,
              level2: routeMapping.routeLevel2,
              level3: routeMapping.routeLevel3,
              level4: routeMapping.routeLevel4,
              level5: routeMapping.routeLevel5,
            },
          },
          // Para carpetas específicas, proporcionamos datos adicionales
          ...(folderId
            ? {
                folder: {
                  id: folderId,
                  hierarchy: cachedEntry.hierarchyData,
                },
              }
            : {
                root: cachedEntry.hierarchyData,
              }),
          stats: {
            totalItems: cachedEntry.itemCount,
            fromCache: true,
            cacheAge,
            maxDepth,
          },
        };

        return NextResponse.json(response);
      }
    }

    // Si no hay caché válida o se fuerza actualización, obtener datos frescos
    const startTime = Date.now();

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();
    const fileAnalyzer = new FileAnalyzer();
    const hierarchyService = new HierarchyService(driveService, fileAnalyzer);

    // Si es una carpeta específica, verificar que existe
    if (folderId) {
      const folder = await driveService.getFolder(folderId);
      if (!folder) {
        return NextResponse.json(
          { error: "Carpeta no encontrada" },
          { status: 404 }
        );
      }
    }

    // Construir jerarquía
    const options: HierarchyOptions = {
      rootFolderId,
      maxDepth,
      processMetadata: true,
      includeHidden: false,
    };

    logger.info(
      `Obteniendo jerarquía fresca para ${
        folderId ? `carpeta ${folderId}` : `ruta ${routePath.join("/")}`
      } (maxDepth: ${maxDepth})`
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
          cacheType: folderId ? "folder" : "root",
          ...routeLevels, // Incluir todos los niveles de ruta
          folderId: folderId || null,
          maxDepth,
          cacheKey,
          hierarchyData: JSON.parse(JSON.stringify(hierarchyResponse.root)),
          itemCount: hierarchyResponse.stats.totalItems,
          buildTimeMs: buildTime,
        },
      });

      logger.info(
        `Caché actualizada para ${
          folderId ? `carpeta ${folderId}` : `ruta ${routePath.join("/")}`
        }`
      );
    } catch (cacheError) {
      logger.error("Error al guardar en caché", cacheError);
    }

    // Estructura de respuesta común para datos frescos
    const response = {
      routeInfo: {
        path: routePath,
        title: routeMapping.title,
        subtitle: routeMapping.subtitle,
        levels: {
          level1: routeMapping.routeLevel1,
          level2: routeMapping.routeLevel2,
          level3: routeMapping.routeLevel3,
          level4: routeMapping.routeLevel4,
          level5: routeMapping.routeLevel5,
        },
      },
      // Para carpetas específicas, proporcionamos datos adicionales
      ...(folderId
        ? {
            folder: {
              id: folderId,
              hierarchy: hierarchyResponse.root,
            },
          }
        : {
            root: hierarchyResponse.root,
          }),
      stats: {
        ...hierarchyResponse.stats,
        fromCache: false,
        buildTimeMs: buildTime,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    logger.error(
      `Error al obtener jerarquía para ruta ${params.path.join("/")}`,
      error
    );
    return NextResponse.json(
      { error: error.message || "Error al obtener jerarquía" },
      { status: 500 }
    );
  }
}
