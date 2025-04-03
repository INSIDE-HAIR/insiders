import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { PrismaClient } from "@prisma/client";
import { Logger } from "@drive/utils/logger";

const prisma = new PrismaClient();
const logger = new Logger("API:Drive:Cache:Invalidate");

/**
 * POST /api/drive/cache/invalidate
 * Invalida una caché específica o un grupo de cachés
 * Body (todas las propiedades son opcionales, pero se debe especificar al menos una):
 * - routeType: Tipo de ruta para invalidar todas sus cachés
 * - routeSubtype: Subtipo de ruta (requiere routeType)
 * - folderId: ID de carpeta específica para invalidar
 * - cacheKey: Clave específica de caché para invalidar
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
    const { routeType, routeSubtype, folderId, cacheKey } = body;

    // Preparar criterios de búsqueda
    let where = {};
    let invalidationDescription = "global";

    if (cacheKey) {
      // Invalidación por clave específica
      where = { cacheKey };
      invalidationDescription = `clave ${cacheKey}`;
    } else if (folderId) {
      // Invalidación por ID de carpeta
      where = { folderId };
      invalidationDescription = `carpeta ${folderId}`;
    } else if (routeType && routeSubtype) {
      // Invalidación por ruta específica - necesitamos primero encontrar el mappingId
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
          { error: "Ruta no encontrada" },
          { status: 404 }
        );
      }

      where = { mappingId: routeMapping.id };
      invalidationDescription = `ruta ${routeType}/${routeSubtype}`;
    } else if (routeType) {
      // Invalidación por tipo de ruta - necesitamos encontrar todos los mappingIds
      const routeMappings = await prisma.driveRootMapping.findMany({
        where: { routeType },
      });

      if (routeMappings.length === 0) {
        return NextResponse.json(
          { error: "No se encontraron rutas del tipo especificado" },
          { status: 404 }
        );
      }

      where = {
        mappingId: {
          in: routeMappings.map((m) => m.id),
        },
      };
      invalidationDescription = `tipo de ruta ${routeType}`;
    } else {
      // Si no se especifica ningún criterio, devolver error
      return NextResponse.json(
        { error: "Se debe especificar al menos un criterio de invalidación" },
        { status: 400 }
      );
    }

    // Realizar invalidación (borrado)
    const deleteResult = await prisma.driveCacheEntry.deleteMany({
      where,
    });

    logger.info(
      `Invalidación de caché para ${invalidationDescription}: ${deleteResult.count} entradas eliminadas`
    );

    return NextResponse.json({
      success: true,
      message: `Caché invalidada para ${invalidationDescription}`,
      count: deleteResult.count,
    });
  } catch (error: any) {
    logger.error("Error al invalidar caché", error);
    return NextResponse.json(
      { error: error.message || "Error al invalidar caché" },
      { status: 500 }
    );
  }
}
