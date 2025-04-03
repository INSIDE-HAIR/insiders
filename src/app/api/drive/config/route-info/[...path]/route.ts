import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/src/config/auth/auth";
import { Logger } from "@/src/features/drive/utils/logger";

const logger = new Logger("API:DriveConfig:RouteInfo");
const prisma = new PrismaClient();

/**
 * GET /api/drive/config/route-info/[...path]
 * Obtiene información de una ruta específica
 * Ejemplo: /api/drive/config/route-info/marketing/eventos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const path = params.path;

    // Mapear los segmentos de la ruta a niveles
    const routeLevels: Record<string, string> = {};
    for (let i = 0; i < Math.min(path.length, 5); i++) {
      routeLevels[`routeLevel${i + 1}`] = path[i];
    }

    // Buscar la ruta en la base de datos
    const routeMapping = await prisma.driveRootMapping.findFirst({
      where: {
        ...routeLevels,
        isActive: true,
      },
    });

    if (!routeMapping) {
      return NextResponse.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );
    }

    // Devolver información de la ruta
    return NextResponse.json({
      id: routeMapping.id,
      routeLevel1: routeMapping.routeLevel1,
      routeLevel2: routeMapping.routeLevel2,
      routeLevel3: routeMapping.routeLevel3,
      routeLevel4: routeMapping.routeLevel4,
      routeLevel5: routeMapping.routeLevel5,
      title: routeMapping.title,
      subtitle: routeMapping.subtitle,
      isActive: routeMapping.isActive,
      rootFolderId: routeMapping.rootFolderId,
      defaultDepth: routeMapping.defaultDepth,
    });
  } catch (error: any) {
    logger.error("Error al obtener información de ruta", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener información de ruta" },
      { status: 500 }
    );
  }
}
