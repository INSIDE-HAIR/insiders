import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@drive/services/analyzer/fileAnalyzer";
import { Logger } from "@drive/utils/logger";
import { FileItem, HierarchyItem } from "@drive/types/hierarchy";
import { DriveType } from "@drive/types/drive";
import { extractPreviewPattern } from "@drive/types/suffix";
import { HierarchyService } from "@drive/services/hierarchy/hierarchyService";

const logger = new Logger("API:Files:ID");

/**
 * GET /api/drive/files/[id]
 * Obtiene información detallada de un archivo específico
 * Query params:
 * - content: Si es "true", devuelve el contenido del archivo (si es posible)
 * - previews: Si es "true", busca y devuelve portadas relacionadas (-P1, -P2, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener ID del archivo
    const fileId = params.id;

    // Verificar si se debe incluir el contenido y/o portadas
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get("content") === "true";
    const includePreviews = searchParams.get("previews") === "true";

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();
    const fileAnalyzer = new FileAnalyzer();
    const hierarchyService = new HierarchyService(driveService, fileAnalyzer);

    // Obtener información del archivo
    const file = await driveService.getFile(fileId);

    if (!file) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    // Asegurar que description sea al menos un string vacío
    file.description = file.description || "";

    // Analizar el tipo de archivo
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
      previewItems: [],
      previewPattern: "",
      baseName: file.name,
    };

    // Extraer información de patrón de portada
    const { isPreview, previewPattern, baseName } = extractPreviewPattern(
      file.name
    );
    fileItem.previewPattern = previewPattern;
    fileItem.baseName = baseName;

    const typeInfo = fileAnalyzer.analyzeFile(fileItem);

    // Si se solicitaron portadas relacionadas
    if (includePreviews) {
      try {
        // Obtener archivos en la misma carpeta
        const parentId = file.parents?.[0];
        if (parentId) {
          const folderContents = await driveService.getFolderContents(parentId);

          // Filtrar archivos relacionados por nombre base
          const relatedFiles = folderContents.filter((item) => {
            if (item.id === fileId) return false; // Excluir el archivo actual

            const { baseName: itemBaseName } = extractPreviewPattern(item.name);
            return itemBaseName === baseName;
          });

          // Convertir a FileItems y procesar
          if (relatedFiles.length > 0) {
            const relatedFileItems = relatedFiles.map((item) => {
              const { isPreview, previewPattern, baseName } =
                extractPreviewPattern(item.name);
              const fileItem: FileItem = {
                ...item,
                size: item.size?.toString(),
                driveType: DriveType.FILE,
                originalName: item.name,
                displayName: item.name,
                depth: 0,
                parentId: item.parents?.[0] || "root",
                order: 0,
                prefixes: [],
                suffixes: [],
                children: [],
                previewPattern,
                baseName,
                previewItems: [],
                isPreviewOf: isPreview ? fileId : undefined,
              };
              return fileItem;
            });

            // Ordenar por número de portada
            relatedFileItems.sort((a, b) => {
              if (!a.previewPattern) return -1;
              if (!b.previewPattern) return 1;

              const numA = parseInt(a.previewPattern.replace("P", ""));
              const numB = parseInt(b.previewPattern.replace("P", ""));
              return numA - numB;
            });

            fileItem.previewItems = relatedFileItems;

            logger.info(
              `Encontradas ${relatedFileItems.length} portadas relacionadas para el archivo ${fileId}`
            );
          }
        }
      } catch (error) {
        logger.error(`Error al buscar portadas relacionadas: ${error}`);
      }
    }

    // Crear respuesta
    const response: {
      file: FileItem;
      typeInfo: any;
      relatedPreviews: FileItem[];
      content?: string;
      contentError?: string;
    } = {
      file: fileItem,
      typeInfo,
      relatedPreviews: fileItem.previewItems || [],
    };

    // Incluir contenido si se solicitó y es un tipo compatible
    if (includeContent) {
      try {
        const content = await driveService.getFileContent(fileId);
        if (content) {
          response.content = content;
        }
      } catch (contentError) {
        logger.warn(
          `No se pudo obtener el contenido del archivo ${fileId}`,
          contentError
        );
        response.contentError = "No se pudo obtener el contenido del archivo";
      }
    }

    logger.info(`Obtenido archivo ${fileId}`);

    return NextResponse.json(response);
  } catch (error: any) {
    logger.error(`Error al obtener archivo ${params.id}`, error);
    return NextResponse.json(
      { error: error.message || "Error al obtener archivo" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/drive/files/[id]
 * Actualiza un archivo existente
 * Body:
 * - name: Nuevo nombre (opcional)
 * - description: Nueva descripción (opcional)
 * - parentId: Nueva carpeta padre (opcional)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener ID del archivo
    const fileId = params.id;

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const { name, description, parentId } = body;

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Verificar que el archivo existe
    const file = await driveService.getFile(fileId);
    if (!file) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el archivo
    const updatedFile = await driveService.updateFile(fileId, {
      name,
      description,
      parentId,
    });

    logger.info(`Archivo ${fileId} actualizado`);

    return NextResponse.json(updatedFile);
  } catch (error: any) {
    logger.error(`Error al actualizar archivo ${params.id}`, error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar archivo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/drive/files/[id]
 * Elimina un archivo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener ID del archivo
    const fileId = params.id;

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Verificar que el archivo existe
    const file = await driveService.getFile(fileId);
    if (!file) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el archivo
    await driveService.deleteFile(fileId);

    logger.info(`Archivo ${fileId} eliminado`);

    return NextResponse.json({
      success: true,
      message: "Archivo eliminado correctamente",
    });
  } catch (error: any) {
    logger.error(`Error al eliminar archivo ${params.id}`, error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar archivo" },
      { status: 500 }
    );
  }
}
