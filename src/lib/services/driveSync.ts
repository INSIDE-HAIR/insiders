import { PrismaClient } from "@prisma/client";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { HierarchyService } from "@drive/services/hierarchy/hierarchyService";
import { Logger } from "@drive/utils/logger";
import { HierarchyItem } from "@drive/types/hierarchy";
import { DriveType } from "@drive/types/drive";
import { extractPrefixes } from "@drive/types/prefix";
import { extractSuffixes, extractPreviewPattern } from "@drive/types/suffix";

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

  // Extraer información de patrón de portada
  const { isPreview, previewPattern, baseName } = extractPreviewPattern(
    item.name
  );

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
    previewItems: [], // Inicializar siempre como array vacío
    previewPattern,
    baseName,
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

export class DriveSyncService {
  private logger: Logger;

  constructor(
    private driveService: GoogleDriveService,
    private hierarchyService: HierarchyService,
    private prisma: PrismaClient
  ) {
    this.logger = new Logger("DriveSyncService");
  }

  async syncRoute(routeId: string): Promise<any> {
    const startTime = Date.now();

    try {
      // Buscar la ruta en la base de datos
      const route = await this.prisma.driveRoute.findUnique({
        where: { id: routeId },
      });

      if (!route) {
        throw new Error(`Route with ID ${routeId} not found`);
      }

      // Actualizar timestamp de último intento
      await this.prisma.driveRoute.update({
        where: { id: routeId },
        data: { lastSyncAttempt: new Date() },
      });

      // Obtener jerarquía para cada folderId
      const hierarchies: HierarchyItem[] = [];
      for (const folderId of route.folderIds) {
        const folder = await this.driveService.getFolder(folderId);
        if (!folder) {
          throw new Error(`Folder with ID ${folderId} not found`);
        }

        // Construir jerarquía usando la misma lógica que el endpoint
        const hierarchy = await buildHierarchyItem(
          folder,
          0,
          this.driveService
        );

        // Procesar las relaciones de previewItems
        const processedHierarchy = this.hierarchyService.processPreviewItems([
          hierarchy,
        ])[0];
        hierarchies.push(processedHierarchy);
      }

      // Calcular próxima sincronización (24 horas después)
      const nextSyncDue = new Date();
      nextSyncDue.setHours(nextSyncDue.getHours() + 24);

      // Actualizar ruta con nuevos datos
      const updatedRoute = await this.prisma.driveRoute.update({
        where: { id: routeId },
        data: {
          hierarchyData: JSON.parse(JSON.stringify(hierarchies)),
          lastUpdated: new Date(),
          nextSyncDue,
        },
      });

      // Registrar log de éxito
      const processingTime = Date.now() - startTime;
      await this.prisma.driveRouteLog.create({
        data: {
          routeId,
          operation: "refresh",
          success: true,
          hierarchySize: JSON.stringify(hierarchies).length,
          processingTime,
        },
      });

      return {
        success: true,
        route: updatedRoute,
        processingTime,
      };
    } catch (error: any) {
      this.logger.error(`Error syncing route ${routeId}`, error);

      // Registrar log de error
      await this.prisma.driveRouteLog.create({
        data: {
          routeId,
          operation: "refresh",
          success: false,
          errorMessage: error.message,
          processingTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  // Método para el cron job de sincronización
  async syncDueRoutes(): Promise<{ success: number; failed: number }> {
    const now = new Date();

    // Buscar rutas que necesiten sincronización
    const dueRoutes = await this.prisma.driveRoute.findMany({
      where: {
        isActive: true,
        nextSyncDue: {
          lte: now,
        },
      },
    });

    this.logger.info(
      `Found ${dueRoutes.length} routes due for synchronization`
    );

    let success = 0;
    let failed = 0;

    // Sincronizar cada ruta
    for (const route of dueRoutes) {
      try {
        await this.syncRoute(route.id);
        success++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed to sync route ${route.id}`, error);
      }
    }

    return { success, failed };
  }
}
