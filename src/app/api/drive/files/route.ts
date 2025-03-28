import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@drive/services/analyzer/fileAnalyzer";
import { Logger } from "@drive/utils/logger";
import { FileItem, isFileItem } from "@drive/types/hierarchy";
import { DriveType } from "@drive/types/drive";
import { extractPreviewPattern } from "@drive/types/suffix";
import { HierarchyService } from "@drive/services/hierarchy/hierarchyService";

const logger = new Logger("API:Files");

/**
 * GET /api/drive/files
 * Obtiene una lista de archivos según los criterios especificados
 * Query params:
 * - folderId: ID de la carpeta padre (opcional, por defecto 'root')
 * - query: Texto de búsqueda (opcional)
 * - mimeType: Tipo MIME a filtrar (opcional)
 * - limit: Número máximo de resultados (opcional, por defecto 100)
 * - groupPreviews: Si es "true", agrupa archivos con sus portadas relacionadas (-P1, -P2, etc.)
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
    const folderId = searchParams.get("folderId") || "root";
    const query = searchParams.get("query") || undefined;
    const mimeType = searchParams.get("mimeType") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit") as string)
      : 100;
    const groupPreviews = searchParams.get("groupPreviews") === "true";

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();
    const fileAnalyzer = new FileAnalyzer();
    const hierarchyService = new HierarchyService(driveService, fileAnalyzer);

    // Obtener archivos
    let files = [];

    if (query) {
      // Si hay una consulta, realizar búsqueda
      const searchResponse = await driveService.searchFiles({
        query,
        pageSize: limit,
      });
      files = searchResponse.files;
    } else {
      // Si no hay consulta, obtener archivos de la carpeta
      const folderContents = await driveService.getFolderContents(folderId);
      // Filtrar solo archivos (no carpetas)
      files = folderContents.filter((item) => !driveService.isFolder(item));

      // Aplicar filtro por MIME type si se especifica
      if (mimeType) {
        files = files.filter((file) => file.mimeType === mimeType);
      }

      // Aplicar límite
      files = files.slice(0, limit);
    }

    // Convertir a FileItems
    let fileItems: FileItem[] = files.map((file) => {
      // Asegurar que description sea al menos un string vacío
      file.description = file.description || "";

      // Extraer información de patrón de portada
      const { isPreview, previewPattern, baseName } = extractPreviewPattern(
        file.name
      );

      const fileItem: FileItem = {
        ...file,
        size: file.size?.toString(),
        driveType: DriveType.FILE,
        originalName: file.name,
        displayName: file.name,
        depth: 0,
        parentId: file.parents?.[0] || "root",
        order: 0,
        prefixes: [],
        suffixes: [],
        children: [],
        previewPattern,
        baseName,
        previewItems: [],
        isPreviewOf: isPreview ? undefined : undefined,
      };

      return fileItem;
    });

    // Procesar patrones de portada si se solicitó
    if (groupPreviews) {
      logger.info(
        "Procesando patrones de portadas para agrupar archivos relacionados"
      );

      // Procesar los items y asegurar que el resultado sea FileItem[]
      const processedItems = hierarchyService.processPreviewItems(fileItems);
      fileItems = processedItems.filter((item) =>
        isFileItem(item)
      ) as FileItem[];

      // Filtrar para eliminar portadas asignadas a archivos principales
      // Solo mantener archivos principales y archivos sin relación
      fileItems = fileItems.filter((item) => !item.isPreviewOf);

      // Asegurar que todos los items tengan previewItems inicializado
      fileItems = fileItems.map((item) => ({
        ...item,
        previewItems: item.previewItems || [],
      }));

      logger.info(
        `Después de agrupar portadas: ${fileItems.length} archivos principales`
      );
    }

    // Añadir información de tipo de archivo
    const filesWithTypeInfo = fileItems.map((fileItem) => ({
      ...fileItem,
      typeInfo: fileAnalyzer.analyzeFile(fileItem),
      previewItems: fileItem.previewItems || [],
    }));

    logger.info(`Obtenidos ${filesWithTypeInfo.length} archivos`);

    return NextResponse.json({
      folderId,
      files: filesWithTypeInfo,
      count: filesWithTypeInfo.length,
    });
  } catch (error: any) {
    logger.error("Error al obtener archivos", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener archivos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drive/files
 * Sube un nuevo archivo a Google Drive
 * Utiliza FormData con los siguientes campos:
 * - file: Archivo a subir
 * - parentId: ID de la carpeta donde subir el archivo (opcional, por defecto 'root')
 * - description: Descripción del archivo (opcional)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener datos del formulario
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const parentId = (formData.get("parentId") as string) || "root";
    const description = (formData.get("description") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Subir archivo
    const uploadedFile = await driveService.uploadFile(file, {
      parentId,
      description,
    });

    logger.info(`Archivo subido: ${file.name} (${uploadedFile.id})`);

    return NextResponse.json(uploadedFile, { status: 201 });
  } catch (error: any) {
    logger.error("Error al subir archivo", error);
    return NextResponse.json(
      { error: error.message || "Error al subir archivo" },
      { status: 500 }
    );
  }
}
