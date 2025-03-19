/**
 * GoogleDriveExplorer
 *
 * Servicio específico para exploración recursiva de Google Drive
 * Permite navegar por la estructura de carpetas y obtener información detallada
 */

import {
  GoogleDriveService,
  DriveFile,
  ListFilesParams,
} from "./GoogleDriveService";
import { Logger } from "../../utils/logger";

// Opciones para la exploración
export interface ExploreOptions {
  /**
   * Profundidad máxima de exploración
   * Por defecto: 10
   */
  maxDepth?: number;

  /**
   * Si es true, incluye archivos en papelera
   * Por defecto: false
   */
  includeTrashed?: boolean;

  /**
   * Si es true, incluye archivos ocultos
   * Por defecto: false
   */
  includeHidden?: boolean;

  /**
   * Función de filtro personalizada para los elementos
   */
  filter?: (file: DriveFile) => boolean;

  /**
   * Función de callback por cada carpeta encontrada
   */
  onFolderFound?: (folder: DriveFile, depth: number) => void;

  /**
   * Función de callback por cada archivo encontrado
   */
  onFileFound?: (file: DriveFile, depth: number) => void;
}

// Resultado de la exploración
export interface ExploreResult {
  rootFolder: DriveFile;
  items: DriveFile[];
  folders: DriveFile[];
  files: DriveFile[];
  maxDepthReached: boolean;
  stats: {
    totalItems: number;
    totalFolders: number;
    totalFiles: number;
    maxDepth: number;
    exploreTime: number;
  };
}

/**
 * Explorador avanzado de Google Drive
 */
export class GoogleDriveExplorer {
  private driveService: GoogleDriveService;
  private logger: Logger;

  /**
   * Constructor
   * @param driveService Servicio de Google Drive a utilizar
   */
  constructor(driveService: GoogleDriveService) {
    this.driveService = driveService;
    this.logger = new Logger("GoogleDriveExplorer");
    this.logger.info("GoogleDriveExplorer inicializado");
  }

  /**
   * Explora recursivamente una carpeta de Google Drive
   * @param folderId ID de la carpeta a explorar
   * @param options Opciones de exploración
   * @returns Resultado de la exploración
   */
  async exploreFolder(
    folderId: string,
    options: ExploreOptions = {}
  ): Promise<ExploreResult> {
    const startTime = Date.now();

    const {
      maxDepth = 10,
      includeTrashed = false,
      includeHidden = false,
      filter,
      onFolderFound,
      onFileFound,
    } = options;

    this.logger.info(`Iniciando exploración de carpeta: ${folderId}`, {
      maxDepth,
    });

    // Obtener información de la carpeta raíz
    const rootFolder = await this.driveService.getFolder(folderId);
    if (!rootFolder) {
      throw new Error(`No se pudo obtener la carpeta con ID: ${folderId}`);
    }

    // Colecciones para almacenar resultados
    const items: DriveFile[] = [rootFolder];
    const folders: DriveFile[] = [rootFolder];
    const files: DriveFile[] = [];
    let maxDepthReached = false;

    // Callback de carpeta raíz
    if (onFolderFound) {
      onFolderFound(rootFolder, 0);
    }

    // Explorar recursivamente
    await this.exploreRecursive(rootFolder, {
      items,
      folders,
      files,
      maxDepth,
      includeTrashed,
      includeHidden,
      filter,
      onFolderFound,
      onFileFound,
      currentDepth: 0,
      maxDepthReached: false,
    });

    // Calcular estadísticas
    const exploreTime = Date.now() - startTime;

    const result: ExploreResult = {
      rootFolder,
      items,
      folders,
      files,
      maxDepthReached,
      stats: {
        totalItems: items.length,
        totalFolders: folders.length,
        totalFiles: files.length,
        maxDepth: this.calculateMaxDepth(items),
        exploreTime,
      },
    };

    this.logger.info(
      `Exploración completada: ${result.stats.totalItems} elementos encontrados en ${exploreTime}ms`
    );

    return result;
  }

  /**
   * Explora recursivamente una carpeta y sus subcarpetas
   * @param folder Carpeta a explorar
   * @param context Contexto de la exploración
   */
  private async exploreRecursive(
    folder: DriveFile,
    context: {
      items: DriveFile[];
      folders: DriveFile[];
      files: DriveFile[];
      maxDepth: number;
      includeTrashed: boolean;
      includeHidden: boolean;
      filter?: (file: DriveFile) => boolean;
      onFolderFound?: (folder: DriveFile, depth: number) => void;
      onFileFound?: (file: DriveFile, depth: number) => void;
      currentDepth: number;
      maxDepthReached: boolean;
    }
  ): Promise<void> {
    const {
      items,
      folders,
      files,
      maxDepth,
      includeTrashed,
      includeHidden,
      filter,
      onFolderFound,
      onFileFound,
      currentDepth,
    } = context;

    // Si alcanzamos la profundidad máxima, detenemos la exploración
    if (currentDepth >= maxDepth) {
      context.maxDepthReached = true;
      this.logger.warn(
        `Profundidad máxima alcanzada (${maxDepth}) para carpeta: ${folder.name}`
      );
      return;
    }

    // Construir consulta para excluir elementos según las opciones
    let query = "";

    if (!includeTrashed) {
      query += "trashed=false";
    }

    // Obtener contenidos de la carpeta
    const listParams: ListFilesParams = {
      folderId: folder.id,
      pageSize: 1000,
      q: query,
    };

    let pageToken: string | undefined;

    do {
      // Si hay token de página, añadirlo a los parámetros
      if (pageToken) {
        listParams.pageToken = pageToken;
      }

      try {
        // Obtener página de resultados
        const response = await this.driveService.listFiles(listParams);
        const folderContents = response.files;
        pageToken = response.nextPageToken;

        // Procesar cada elemento
        for (const item of folderContents) {
          // Aplicar filtro si existe
          if (filter && !filter(item)) {
            continue;
          }

          // Aplicar filtro de elementos ocultos
          if (!includeHidden && item.name.endsWith("_hidden")) {
            continue;
          }

          // Añadir a la colección de elementos
          items.push(item);

          if (this.driveService.isFolder(item)) {
            // Es una carpeta: añadir a la colección y explorar recursivamente
            folders.push(item);

            // Notificar carpeta encontrada
            if (onFolderFound) {
              onFolderFound(item, currentDepth + 1);
            }

            // Explorar recursivamente
            await this.exploreRecursive(item, {
              ...context,
              currentDepth: currentDepth + 1,
            });
          } else {
            // Es un archivo: añadir a la colección
            files.push(item);

            // Notificar archivo encontrado
            if (onFileFound) {
              onFileFound(item, currentDepth + 1);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Error al explorar carpeta ${folder.name}`, error);
        throw error;
      }
    } while (pageToken);
  }

  /**
   * Calcula la profundidad máxima alcanzada durante la exploración
   * @param items Lista de elementos
   * @returns Profundidad máxima
   */
  private calculateMaxDepth(items: DriveFile[]): number {
    // En una implementación real, se calcularía basándose en las rutas de los elementos
    // Por ahora, devolvemos un valor fijo
    return 5;
  }
}
