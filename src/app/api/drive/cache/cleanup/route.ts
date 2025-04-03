import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { PrismaClient } from "@prisma/client";
import { Logger } from "@drive/utils/logger";

const prisma = new PrismaClient();

const logger = new Logger("API:Drive:Cache:Cleanup");

/**
 * POST /api/drive/cache/cleanup
 * Realiza limpieza programada de la caché
 * Body:
 * - maxAgeDays: Antigüedad máxima en días para mantener cachés (opcional, por defecto 7)
 * - lowUsageThreshold: Umbral de uso bajo para eliminar cachés (opcional, por defecto 3)
 * - lowUsageAgeDays: Antigüedad en días para cachés de bajo uso (opcional, por defecto 2)
 * - apiKey: Clave API para autorizar la limpieza (requerida)
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticación mediante API key para permitir llamadas desde cron jobs
    const body = await request.json();
    const {
      apiKey,
      maxAgeDays = 7,
      lowUsageThreshold = 3,
      lowUsageAgeDays = 2,
    } = body;

    const validApiKey = process.env.CACHE_CLEANUP_API_KEY;

    // Verificar autenticación mediante API key o sesión de admin
    const session = await auth();
    const isAdmin = session?.user && session.user.role === "ADMIN";

    if (!isAdmin && (!apiKey || apiKey !== validApiKey)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Calcular fechas límite
    const oldCacheDate = new Date();
    oldCacheDate.setDate(oldCacheDate.getDate() - maxAgeDays);

    const lowUsageCacheDate = new Date();
    lowUsageCacheDate.setDate(lowUsageCacheDate.getDate() - lowUsageAgeDays);

    // 1. Eliminar cachés antiguas
    const oldCachesResult = await prisma.driveCacheEntry.deleteMany({
      where: {
        updatedAt: {
          lt: oldCacheDate,
        },
      },
    });

    logger.info(
      `Eliminadas ${oldCachesResult.count} cachés antiguas (>${maxAgeDays} días)`
    );

    // 2. Eliminar cachés con bajo uso
    const lowUsageCachesResult = await prisma.driveCacheEntry.deleteMany({
      where: {
        accessCount: {
          lt: lowUsageThreshold,
        },
        updatedAt: {
          lt: lowUsageCacheDate,
        },
      },
    });

    logger.info(
      `Eliminadas ${lowUsageCachesResult.count} cachés de bajo uso (<${lowUsageThreshold} accesos en ${lowUsageAgeDays} días)`
    );

    // Obtener estadísticas actuales
    const totalCaches = await prisma.driveCacheEntry.count();
    const oldestCache = await prisma.driveCacheEntry.findFirst({
      orderBy: {
        updatedAt: "asc",
      },
    });

    const newestCache = await prisma.driveCacheEntry.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Calcular estadísticas
    const stats = {
      totalCachesRemoved: oldCachesResult.count + lowUsageCachesResult.count,
      remainingCaches: totalCaches,
      oldestCacheAge: oldestCache
        ? Math.floor(
            (new Date().getTime() - oldestCache.updatedAt.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
      newestCacheAge: newestCache
        ? Math.floor(
            (new Date().getTime() - newestCache.updatedAt.getTime()) /
              (1000 * 60)
          )
        : 0,
    };

    return NextResponse.json({
      success: true,
      message: `Limpieza de caché completada: ${stats.totalCachesRemoved} entradas eliminadas`,
      stats,
    });
  } catch (error: any) {
    logger.error("Error al limpiar caché", error);
    return NextResponse.json(
      { error: error.message || "Error al limpiar caché" },
      { status: 500 }
    );
  }
}
