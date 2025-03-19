import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@drive/services/analyzer/fileAnalyzer";
import { Logger } from "@drive/utils/logger";

const logger = new Logger("API:Folders");

/**
 * GET /api/drive/folders
 * Lista todas las carpetas disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Inicializar el servicio de Drive
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Obtener el ID de la carpeta raíz de las variables de entorno
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "root";

    // Obtener las carpetas
    const folders = await driveService.getFolders(rootFolderId);

    logger.info(`Obtenidas ${folders.length} carpetas`);

    return NextResponse.json(folders);
  } catch (error: any) {
    logger.error("Error al listar carpetas", error);
    return NextResponse.json(
      { error: error.message || "Error al listar carpetas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drive/folders
 * Crea una nueva carpeta en Google Drive
 * Body:
 * - name: Nombre de la carpeta
 * - parentId: ID de la carpeta padre (opcional, por defecto 'root')
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const { name, parentId = "root" } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Se requiere un nombre para la carpeta" },
        { status: 400 }
      );
    }

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Crear carpeta
    const folder = await driveService.createFolder(name, parentId);

    logger.info(`Carpeta creada: ${name} en ${parentId}`);

    return NextResponse.json(folder, { status: 201 });
  } catch (error: any) {
    logger.error("Error al crear carpeta", error);
    return NextResponse.json(
      { error: error.message || "Error al crear carpeta" },
      { status: 500 }
    );
  }
}
