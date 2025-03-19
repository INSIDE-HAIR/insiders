import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@drive/services/analyzer/fileAnalyzer";
import {
  HierarchyService,
  HierarchyOptions,
} from "@drive/services/hierarchy/hierarchyService";
import { Logger } from "@drive/utils/logger";

const logger = new Logger("API:Hierarchy");

/**
 * GET /api/drive/hierarchy
 * Construye y devuelve una jerarquía completa a partir de una carpeta
 * Query params:
 * - rootId: ID de la carpeta raíz (opcional, por defecto 'root')
 * - includeHidden: Si es "true", incluye elementos ocultos (opcional, por defecto false)
 * - maxDepth: Profundidad máxima de la jerarquía (opcional, por defecto 10)
 * - processMetadata: Si es "true", procesa metadatos de archivos _copy (opcional, por defecto true)
 * - verboseMetadata: Si es "true", incluye logs detallados del procesamiento de metadatos (opcional, por defecto false)
 * - validate: Si es "true", valida la jerarquía después de construirla (opcional, por defecto true)
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
    const rootFolderId = searchParams.get("rootId") || "root";
    const includeHidden = searchParams.get("includeHidden") === "true";
    const maxDepthStr = searchParams.get("maxDepth");
    const maxDepth = maxDepthStr ? parseInt(maxDepthStr) : 10;
    const processMetadata = searchParams.get("processMetadata") !== "false";
    const verboseMetadata = searchParams.get("verboseMetadata") === "true";
    const autoValidate = searchParams.get("validate") !== "false";

    // Configurar opciones de jerarquía
    const options: HierarchyOptions = {
      rootFolderId,
      includeHidden,
      maxDepth,
      processMetadata,
      verboseMetadata,
      autoValidate,
    };

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();
    const fileAnalyzer = new FileAnalyzer();
    const hierarchyService = new HierarchyService(driveService, fileAnalyzer);

    // Construir la jerarquía
    logger.info(`Iniciando construcción de jerarquía desde ${rootFolderId}`);
    const hierarchyResponse = await hierarchyService.buildHierarchy(options);

    logger.info(
      `Jerarquía construida con ${hierarchyResponse.stats.totalItems} elementos (${hierarchyResponse.stats.totalFolders} carpetas, ${hierarchyResponse.stats.totalFiles} archivos)`
    );

    return NextResponse.json(hierarchyResponse);
  } catch (error: any) {
    logger.error("Error al construir jerarquía", error);
    return NextResponse.json(
      { error: error.message || "Error al construir jerarquía" },
      { status: 500 }
    );
  }
}
