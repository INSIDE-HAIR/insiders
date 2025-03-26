import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { Logger } from "@drive/utils/logger";
import { DriveType } from "@drive/types/drive";
import { HierarchyItem } from "@drive/types/hierarchy";
import { extractPrefixes } from "@drive/types/prefix";
import { extractSuffixes } from "@drive/types/suffix";

const logger = new Logger("API:FolderHierarchy");

async function buildHierarchyItem(
  item: any,
  depth: number,
  driveService: GoogleDriveService
): Promise<HierarchyItem> {
  // Usar las funciones de utilidad correctas para extraer prefijos y sufijos
  const {
    prefixes,
    order,
    displayName: nameWithoutPrefixes,
  } = extractPrefixes(item.name);
  const { suffixes, displayName } = extractSuffixes(nameWithoutPrefixes);

  const baseItem = {
    id: item.id,
    name: item.name,
    originalName: item.name,
    displayName,
    description: item.description || "",
    driveType: driveService.isFolder(item) ? DriveType.FOLDER : DriveType.FILE,
    depth,
    prefixes,
    suffixes,
    order,
    mimeType: item.mimeType,
    size: item.size,
    modifiedTime: item.modifiedTime,
    thumbnailLink: item.thumbnailUrl || item.thumbnailLink,
    children: [],
    transformedUrl: {
      download: `https://drive.google.com/uc?id=${item.id}&export=download`,
      embed: `https://drive.google.com/file/d/${item.id}/view?usp=drivesdk`,
      preview: `https://lh3.googleusercontent.com/d/${item.id}`,
    },
  };

  if (driveService.isFolder(item)) {
    // Obtener contenido de la carpeta
    const contents = await driveService.getFolderContents(item.id);
    const children = await Promise.all(
      contents.map((child) =>
        buildHierarchyItem(child, depth + 1, driveService)
      )
    );
    return {
      ...baseItem,
      children,
      driveType: DriveType.FOLDER,
    } as HierarchyItem;
  }

  return {
    ...baseItem,
    driveType: DriveType.FILE,
  } as HierarchyItem;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const folderId = params.id;
    if (!folderId) {
      return NextResponse.json(
        { error: "Se requiere ID de carpeta" },
        { status: 400 }
      );
    }

    // Inicializar el servicio de Drive
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

    // Construir jerarquía completa
    const hierarchy = await buildHierarchyItem(folder, 0, driveService);

    // Preparar respuesta
    const response = {
      id: folder.id,
      name: folder.name,
      hierarchy: [hierarchy], // Envolver en array para mantener consistencia
    };

    logger.info(`Jerarquía completa obtenida para carpeta: ${folderId}`);
    return NextResponse.json(response);
  } catch (error: any) {
    logger.error("Error al obtener jerarquía de carpeta", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener jerarquía de carpeta" },
      { status: 500 }
    );
  }
}
