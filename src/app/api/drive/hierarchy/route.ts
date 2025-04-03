import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { PrismaClient } from "@prisma/client";
import { GoogleDriveService } from "@/src/features/drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@/src/features/drive/services/analyzer/fileAnalyzer";
import {
  HierarchyService,
  HierarchyOptions,
} from "@/src/features/drive/services/hierarchy/hierarchyService";
import { Logger } from "@/src/features/drive/utils/logger";

const logger = new Logger("API:Drive:Hierarchy");
const prisma = new PrismaClient();

// Get the root folder ID from environment variables
const DEFAULT_ROOT_FOLDER_ID =
  process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "root";

/**
 * GET /api/drive/hierarchy
 * Obtiene la jerarquía completa o parcial de Google Drive
 *
 * Query params:
 * - rootId: ID de la carpeta raíz (opcional, por defecto se usa la carpeta configurada en variables de entorno)
 * - maxDepth: Profundidad máxima de la jerarquía (opcional, por defecto 2)
 * - includeHidden: Si es "true", incluye archivos ocultos (opcional, por defecto false)
 * - forceRefresh: Si es "true", fuerza la actualización de la caché (opcional, por defecto false)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url);
    const rootId = searchParams.get("rootId") || DEFAULT_ROOT_FOLDER_ID;
    const maxDepthParam = searchParams.get("maxDepth");
    const maxDepth = maxDepthParam ? parseInt(maxDepthParam) : 2; // Default to 2 levels
    const includeHidden = searchParams.get("includeHidden") === "true";
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    // Construir clave de caché
    const cacheKey = `hierarchy_${rootId}_${maxDepth}`;

    // Verificar caché si no se fuerza actualización
    if (!forceRefresh) {
      const cachedEntry = await prisma.driveCacheEntry.findUnique({
        where: { cacheKey },
      });

      // Definir tiempo de expiración (2 horas)
      const cacheExpiration = 2 * 60 * 60 * 1000;

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
          `Usando caché para jerarquía ${rootId} (${cacheAge} min de antigüedad)`
        );

        // Devolver datos en caché
        return NextResponse.json({
          root: cachedEntry.hierarchyData,
          stats: {
            totalItems: cachedEntry.itemCount,
            fromCache: true,
            cacheAge,
          },
        });
      }
    }

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();
    const fileAnalyzer = new FileAnalyzer();
    const hierarchyService = new HierarchyService(driveService, fileAnalyzer);

    // Construir opciones
    const options: HierarchyOptions = {
      rootFolderId: rootId,
      maxDepth,
      includeHidden,
      processMetadata: true,
    };

    logger.info(
      `Obteniendo jerarquía fresca para carpeta ${rootId} (maxDepth: ${maxDepth})`
    );

    // Obtener jerarquía
    const startTime = Date.now();
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
          cacheType: "hierarchy",
          folderId: rootId,
          maxDepth,
          cacheKey,
          hierarchyData: JSON.parse(JSON.stringify(hierarchyResponse.root)),
          itemCount: hierarchyResponse.stats.totalItems,
          buildTimeMs: buildTime,
        },
      });

      logger.info(`Caché actualizada para jerarquía ${rootId}`);
    } catch (cacheError) {
      logger.error("Error al guardar en caché", cacheError);
    }

    // Devolver respuesta
    return NextResponse.json({
      root: hierarchyResponse.root,
      stats: {
        ...hierarchyResponse.stats,
        fromCache: false,
        buildTimeMs: buildTime,
      },
    });
  } catch (error: any) {
    logger.error("Error al obtener jerarquía", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener jerarquía" },
      { status: 500 }
    );
  }
}
