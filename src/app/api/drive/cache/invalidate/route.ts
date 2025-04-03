import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { PrismaClient } from "@prisma/client";
import { Logger } from "@/src/features/drive/utils/logger";

const prisma = new PrismaClient();
const logger = new Logger("API:Drive:Cache:Invalidate");

/**
 * POST /api/drive/cache/invalidate
 * Invalida una caché específica o un grupo de cachés
 * Body (todas las propiedades son opcionales, pero se debe especificar al menos una):
 * - invalidateAll: Si es true, invalida todas las cachés
 * - routeLevel1-5: Niveles de ruta para invalidación específica
 * - folderId: ID de carpeta específica para invalidar
 * - invalidateHierarchies: Si es true, también invalida cachés de jerarquía relacionadas
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación como admin (solo admins pueden invalidar caché)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const {
      invalidateAll,
      routeLevel1,
      routeLevel2,
      routeLevel3,
      routeLevel4,
      routeLevel5,
      folderId,
      invalidateHierarchies = false,
    } = body;

    // Si se solicita invalidar toda la caché
    if (invalidateAll) {
      // Eliminar todas las entradas de caché
      await prisma.driveCacheEntry.deleteMany({});

      return NextResponse.json({
        message: "Toda la caché ha sido invalidada",
        invalidatedEntries: "all",
      });
    }

    // Si se proporciona un ID de carpeta específico
    if (folderId) {
      // Invalidar cachés relacionadas con esta carpeta
      const result = await prisma.driveCacheEntry.deleteMany({
        where: {
          folderId,
        },
      });

      // Si también se solicita invalidar jerarquías
      if (invalidateHierarchies) {
        await prisma.driveCacheEntry.deleteMany({
          where: {
            cacheKey: {
              startsWith: `hierarchy_${folderId}`,
            },
          },
        });

        return NextResponse.json({
          message: `La caché para la carpeta ${folderId} y sus jerarquías han sido invalidadas`,
          invalidatedEntries: result.count,
        });
      }

      return NextResponse.json({
        message: `La caché para la carpeta ${folderId} ha sido invalidada`,
        invalidatedEntries: result.count,
      });
    }

    // Validar que se proporcione al menos el nivel 1 de ruta para invalidación específica
    if (!routeLevel1) {
      return NextResponse.json(
        {
          error:
            "Se requiere especificar al menos el nivel 1 de ruta o un ID de carpeta para invalidar la caché",
        },
        { status: 400 }
      );
    }

    // Construir el filtro para la invalidación específica
    const filter: any = { routeLevel1 };

    // Añadir filtros adicionales si se proporcionan
    if (routeLevel2 !== undefined) filter.routeLevel2 = routeLevel2;
    if (routeLevel3 !== undefined) filter.routeLevel3 = routeLevel3;
    if (routeLevel4 !== undefined) filter.routeLevel4 = routeLevel4;
    if (routeLevel5 !== undefined) filter.routeLevel5 = routeLevel5;

    // Eliminar las entradas de caché que coincidan con el filtro
    const result = await prisma.driveCacheEntry.deleteMany({
      where: filter,
    });

    // Si también se solicita invalidar jerarquías, buscar la configuración de ruta
    // para obtener el folderId y eliminar las cachés relacionadas
    if (invalidateHierarchies) {
      const routeConfig = await prisma.driveRootMapping.findFirst({
        where: filter,
      });

      if (routeConfig?.rootFolderId) {
        await prisma.driveCacheEntry.deleteMany({
          where: {
            folderId: routeConfig.rootFolderId,
            cacheType: "hierarchy",
          },
        });

        await prisma.driveCacheEntry.deleteMany({
          where: {
            cacheKey: {
              startsWith: `hierarchy_${routeConfig.rootFolderId}`,
            },
          },
        });
      }
    }

    // Construir la ruta para el mensaje
    const routePath = [
      routeLevel1,
      routeLevel2,
      routeLevel3,
      routeLevel4,
      routeLevel5,
    ]
      .filter((level) => level !== undefined)
      .join("/");

    return NextResponse.json({
      message: `La caché para la ruta ${routePath} ha sido invalidada${
        invalidateHierarchies ? " incluyendo jerarquías relacionadas" : ""
      }`,
      invalidatedEntries: result.count,
    });
  } catch (error: any) {
    logger.error("Error al invalidar caché", error);
    return NextResponse.json(
      { error: error.message || "Error al invalidar caché" },
      { status: 500 }
    );
  }
}
