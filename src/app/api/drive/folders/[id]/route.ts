import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { Logger } from "@drive/utils/logger";

const logger = new Logger("API:Folders:ID");

/**
 * GET /api/drive/folders/[id]
 * Obtiene información de una carpeta específica
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

    // Obtener ID de la carpeta
    const folderId = params.id;

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Obtener detalles de la carpeta
    const folder = await driveService.getFolder(folderId);

    if (!folder) {
      return NextResponse.json(
        { error: "Carpeta no encontrada" },
        { status: 404 }
      );
    }

    // Obtener contenido de la carpeta
    const contents = await driveService.getFolderContents(folderId);

    logger.info(
      `Obtenida carpeta ${folderId} con ${contents.length} elementos`
    );

    return NextResponse.json({
      folder,
      contents,
      count: contents.length,
    });
  } catch (error: any) {
    logger.error(`Error al obtener carpeta ${params.id}`, error);
    return NextResponse.json(
      { error: error.message || "Error al obtener carpeta" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/drive/folders/[id]
 * Actualiza una carpeta existente
 * Body:
 * - name: Nuevo nombre de la carpeta (opcional)
 * - description: Nueva descripción (opcional)
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

    // Obtener ID de la carpeta
    const folderId = params.id;

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const { name, description } = body;

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Verificar que la carpeta existe
    const folder = await driveService.getFolder(folderId);
    if (!folder) {
      return NextResponse.json(
        { error: "Carpeta no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar la carpeta
    const updatedFolder = await driveService.updateFolder(folderId, {
      name,
      description,
    });

    logger.info(`Carpeta ${folderId} actualizada`);

    return NextResponse.json(updatedFolder);
  } catch (error: any) {
    logger.error(`Error al actualizar carpeta ${params.id}`, error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar carpeta" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/drive/folders/[id]
 * Elimina una carpeta
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

    // Obtener ID de la carpeta
    const folderId = params.id;

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Verificar que la carpeta existe
    const folder = await driveService.getFolder(folderId);
    if (!folder) {
      return NextResponse.json(
        { error: "Carpeta no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la carpeta
    await driveService.deleteFile(folderId);

    logger.info(`Carpeta ${folderId} eliminada`);

    return NextResponse.json({
      success: true,
      message: "Carpeta eliminada correctamente",
    });
  } catch (error: any) {
    logger.error(`Error al eliminar carpeta ${params.id}`, error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar carpeta" },
      { status: 500 }
    );
  }
}
