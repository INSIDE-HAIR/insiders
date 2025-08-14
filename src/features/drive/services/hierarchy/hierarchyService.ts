/**
 * HierarchyService
 *
 * Servicio de construcción de jerarquías
 * Transforma los datos planos de Google Drive en una estructura jerárquica
 */

import {
  HierarchyItem,
  FileItem,
  FolderItem,
  isFileItem,
  isFolderItem,
  HierarchyResponse,
} from "../../types/hierarchy";
import { DriveType } from "../../types/drive";
import { GoogleDriveService } from "../drive/GoogleDriveService";
import { FileAnalyzer } from "../analyzer/fileAnalyzer";
import { MetadataProcessor } from "../analyzer/metadataProcessor";
import { Logger } from "../../utils/logger";
import { extractPreviewPattern } from "../../types/suffix";
import {
  HierarchyValidator,
  ValidationIssue,
  generateValidationReport,
} from "../../utils/hierarchy/hierarchyValidator";

export interface HierarchyOptions {
  /**
   * Si es true, incluye archivos con sufijo _hidden
   * Por defecto: false
   */
  includeHidden?: boolean;

  /**
   * Si es true, ejecuta validación automática de la jerarquía
   * Por defecto: true
   */
  autoValidate?: boolean;

  /**
   * ID de la carpeta raíz para iniciar la exploración
   * Si no se especifica, se usa 'root'
   */
  rootFolderId?: string;

  /**
   * Profundidad máxima para la exploración
   * Por defecto: 10
   */
  maxDepth?: number;

  /**
   * Si es true, procesa metadatos de archivos _copy
   * Por defecto: true
   */
  processMetadata?: boolean;

  /**
   * Si es true, muestra información detallada del procesamiento de metadatos
   * Por defecto: false
   */
  verboseMetadata?: boolean;
}

export class HierarchyService {
  private logger: Logger;
  private driveService: GoogleDriveService;
  private fileAnalyzer: FileAnalyzer;
  private metadataProcessor: MetadataProcessor;

  constructor(driveService: GoogleDriveService, fileAnalyzer: FileAnalyzer) {
    this.driveService = driveService;
    this.fileAnalyzer = fileAnalyzer;
    this.metadataProcessor = new MetadataProcessor(driveService, fileAnalyzer);
    this.logger = new Logger("HierarchyService");
    this.logger.info("HierarchyService inicializado");
  }

  /**
   * Construye la jerarquía completa a partir de Google Drive
   * @param options Opciones de configuración
   * @returns Promesa con la jerarquía construida
   */
  async buildHierarchy(
    options: HierarchyOptions = {}
  ): Promise<HierarchyResponse> {
    const {
      includeHidden = false,
      autoValidate = true,
      rootFolderId = "root",
      maxDepth = 10,
      processMetadata = true,
      verboseMetadata = false,
    } = options;

    const startTime = Date.now();
    this.logger.info(
      `Iniciando construcción de jerarquía desde ${rootFolderId}`
    );

    try {
      // Obtener información de la carpeta raíz
      const rootFolder = await this.driveService.getFolder(rootFolderId);
      if (!rootFolder) {
        throw new Error(
          `No se pudo obtener la carpeta raíz con ID: ${rootFolderId}`
        );
      }

      // Crear el elemento base de la carpeta raíz
      const rootElement: FolderItem = {
        id: rootFolder.id,
        name: rootFolder.name,
        originalName: rootFolder.name,
        displayName: rootFolder.name,
        driveType: DriveType.FOLDER,
        depth: 0,
        order: 0,
        prefixes: [],
        suffixes: [],
        description: rootFolder.description,
        webViewLink: rootFolder.webViewLink,
        iconLink: rootFolder.iconLink,
        createdTime: rootFolder.createdTime,
        modifiedTime: rootFolder.modifiedTime,
        parents: rootFolder.parents,
        mimeType: rootFolder.mimeType,
        children: [],
      };

      // Construir jerarquía recursiva
      const hierarchy = await this.buildFolderHierarchy(
        rootElement,
        0,
        maxDepth,
        includeHidden
      );

      // Procesar metadatos (archivos _copy) si está habilitado
      if (processMetadata) {
        this.logger.info("Iniciando procesamiento de metadatos");

        // Procesar metadatos para la jerarquía completa
        await this.metadataProcessor.processMetadata([hierarchy], {
          verbose: verboseMetadata,
          format: "auto",
        });

        // Aplicar metadatos especiales (títulos alternativos, descripciones)
        this.metadataProcessor.processSpecialMetadata([hierarchy]);

        this.logger.info("Procesamiento de metadatos completado");
      }

      // Crear un mapa plano de todos los elementos
      const itemsMap = this.flattenHierarchy(hierarchy);

      // Calcular estadísticas
      const totalItems = itemsMap.size;
      const totalFolders = Array.from(itemsMap.values()).filter(
        isFolderItem
      ).length;
      const totalFiles = totalItems - totalFolders;

      // Calcular la profundidad máxima
      const calculatedMaxDepth = this.calculateMaxDepth(hierarchy);

      // Calcular tiempo de construcción
      const buildTime = Date.now() - startTime;

      // Crear la respuesta
      const response: HierarchyResponse = {
        rootId: rootFolderId,
        root: hierarchy,
        itemsMap,
        stats: {
          totalItems,
          totalFiles,
          totalFolders,
          maxDepth: calculatedMaxDepth,
          buildTime,
        },
      };

      // Opcional: validar la jerarquía construida
      if (autoValidate) {
        const issues = HierarchyValidator.validateHierarchy(hierarchy);
        if (issues && issues.length > 0) {
          this.logger.warn(generateValidationReport(issues));
        } else {
          this.logger.info("Validación de jerarquía completada sin problemas");
        }
      }

      this.logger.info(
        `Construcción de jerarquía completada exitosamente en ${buildTime}ms`
      );
      return response;
    } catch (error) {
      this.logger.error("Error al construir jerarquía", error);
      throw error;
    }
  }

  /**
   * Calcula la profundidad máxima de una jerarquía
   * @param item Elemento raíz
   * @param currentDepth Profundidad actual
   * @returns Profundidad máxima
   */
  private calculateMaxDepth(
    item: HierarchyItem,
    currentDepth: number = 0
  ): number {
    if (isFileItem(item)) {
      return currentDepth;
    }

    if (item.children.length === 0) {
      return currentDepth;
    }

    const childDepths = item.children.map((child) =>
      this.calculateMaxDepth(child, currentDepth + 1)
    );

    return Math.max(...childDepths);
  }

  /**
   * Construye recursivamente la jerarquía de una carpeta
   * @param folder Carpeta base para construir jerarquía
   * @param currentDepth Profundidad actual en la recursión
   * @param maxDepth Profundidad máxima a explorar
   * @param includeHidden Si es true, incluye elementos ocultos
   * @returns Promesa con la jerarquía de la carpeta
   */
  private async buildFolderHierarchy(
    folder: FolderItem,
    currentDepth: number,
    maxDepth: number,
    includeHidden: boolean
  ): Promise<FolderItem> {
    // Si alcanzamos la profundidad máxima, no exploramos más
    if (currentDepth >= maxDepth) {
      this.logger.warn(
        `Máxima profundidad alcanzada (${maxDepth}) para carpeta: ${folder.name}`
      );
      return {
        ...folder,
        children: [],
      };
    }

    try {
      // Obtener contenido de la carpeta desde Google Drive
      const folderContents = await this.driveService.getFolderContents(
        folder.id
      );

      // Procesar los elementos de la carpeta
      const children: HierarchyItem[] = [];

      for (const item of folderContents) {
        // Aplicar filtro de elementos ocultos si corresponde
        if (!includeHidden && item.name.endsWith("_hidden")) {
          continue;
        }

        if (this.driveService.isFolder(item)) {
          // Es una carpeta: construir recursivamente
          const folderItem: FolderItem = {
            id: item.id,
            name: item.name,
            originalName: item.name,
            displayName: item.name,
            driveType: DriveType.FOLDER,
            depth: currentDepth + 1,
            order: 0,
            prefixes: [],
            suffixes: [],
            description: item.description,
            webViewLink: item.webViewLink,
            iconLink: item.iconLink,
            createdTime: item.createdTime,
            modifiedTime: item.modifiedTime,
            parents: item.parents,
            mimeType: item.mimeType,
            children: [],
          };

          const folderHierarchy = await this.buildFolderHierarchy(
            folderItem,
            currentDepth + 1,
            maxDepth,
            includeHidden
          );

          children.push(folderHierarchy);
        } else {
          // Es un archivo
          const fileItem: FileItem = {
            id: item.id,
            name: item.name,
            originalName: item.name,
            displayName: item.name,
            driveType: DriveType.FILE,
            depth: currentDepth + 1,
            order: 0,
            prefixes: [],
            suffixes: [],
            description: item.description,
            webViewLink: item.webViewLink,
            iconLink: item.iconLink,
            createdTime: item.createdTime,
            modifiedTime: item.modifiedTime,
            parents: item.parents,
            mimeType: item.mimeType,
            size: item.size ? String(item.size) : undefined,
            md5Checksum: item.md5Checksum,
            thumbnailLink: item.thumbnailLink,
            hasThumbnail: item.hasThumbnail,
            children: [], // Add the missing "children" property
          };

          children.push(fileItem);
        }
      }

      // Ordenar los elementos según reglas específicas
      this.sortHierarchyItems(children);

      // Construir la jerarquía resultante
      return {
        ...folder,
        children,
      };
    } catch (error) {
      this.logger.error(
        `Error al construir jerarquía para carpeta ${folder.name}`,
        error
      );
      throw error;
    }
  }

  /**
   * Ordena los elementos de la jerarquía según reglas específicas
   * @param items Elementos a ordenar
   */
  sortHierarchyItems(items: HierarchyItem[]): void {
    items.sort((a, b) => {
      // Criterio 1: Carpetas primero
      if (isFolderItem(a) && isFileItem(b)) return -1;
      if (isFileItem(a) && isFolderItem(b)) return 1;

      // Criterio 2: Por prefijo numérico (si existe)
      const aNumPrefix = this.extractNumericPrefix(a.name);
      const bNumPrefix = this.extractNumericPrefix(b.name);

      if (aNumPrefix !== null && bNumPrefix !== null) {
        return aNumPrefix - bNumPrefix;
      }

      // Si solo uno tiene prefijo numérico, va primero
      if (aNumPrefix !== null) return -1;
      if (bNumPrefix !== null) return 1;

      // Criterio 3: Orden alfabético por nombre
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Extrae el prefijo numérico de un nombre si existe
   * @param name Nombre a analizar
   * @returns Número extraído o null si no existe
   */
  private extractNumericPrefix(name: string): number | null {
    const match = name.match(/^(\d+)[_\s-]/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  /**
   * Encuentra un elemento en la jerarquía por ID
   * @param hierarchy Jerarquía completa
   * @param itemId ID del elemento a buscar
   * @returns El elemento encontrado o null
   */
  findItemById(hierarchy: HierarchyItem, itemId: string): HierarchyItem | null {
    // Verificar el elemento actual
    if (hierarchy.id === itemId) {
      return hierarchy;
    }

    // Si es una carpeta, buscar recursivamente en los hijos
    if (isFolderItem(hierarchy)) {
      for (const child of hierarchy.children) {
        const found = this.findItemById(child, itemId);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Encuentra elementos en la jerarquía por nombre
   * @param hierarchy Jerarquía completa
   * @param name Nombre o parte del nombre a buscar
   * @param exact Si es true, busca coincidencia exacta
   * @returns Lista de elementos encontrados
   */
  findItemsByName(
    hierarchy: HierarchyItem,
    name: string,
    exact: boolean = false
  ): HierarchyItem[] {
    const results: HierarchyItem[] = [];

    // Función recursiva interna para buscar
    const search = (item: HierarchyItem) => {
      // Verificar si el nombre coincide
      if (exact) {
        if (item.name === name) {
          results.push(item);
        }
      } else {
        if (item.name.toLowerCase().includes(name.toLowerCase())) {
          results.push(item);
        }
      }

      // Si es una carpeta, buscar en los hijos
      if (isFolderItem(item)) {
        item.children.forEach(search);
      }
    };

    // Iniciar búsqueda desde la raíz
    search(hierarchy);
    return results;
  }

  /**
   * Obtiene la ruta completa de un elemento en la jerarquía
   * @param item Elemento para el que se quiere obtener la ruta
   * @param itemsMap Mapa de elementos por ID
   * @returns Array con la ruta desde la raíz hasta el elemento
   */
  getItemPath(
    item: HierarchyItem,
    itemsMap: Map<string, HierarchyItem>
  ): HierarchyItem[] {
    const path: HierarchyItem[] = [item];
    let currentItem = item;

    // Seguir subiendo por los padres hasta llegar a la raíz
    while (currentItem.parents && currentItem.parents.length > 0) {
      const parentId = currentItem.parents[0];
      const parent = itemsMap.get(parentId || '');

      if (!parent) break;

      path.unshift(parent);
      currentItem = parent;
    }

    return path;
  }

  /**
   * Genera un mapa plano de toda la jerarquía
   * @param hierarchy Jerarquía completa
   * @returns Mapa de elementos por ID
   */
  flattenHierarchy(hierarchy: HierarchyItem): Map<string, HierarchyItem> {
    const flatMap = new Map<string, HierarchyItem>();

    // Función recursiva interna para aplanar
    const flatten = (item: HierarchyItem) => {
      flatMap.set(item.id, item);

      if (isFolderItem(item)) {
        item.children.forEach(flatten);
      }
    };

    flatten(hierarchy);
    return flatMap;
  }

  /**
   * Procesa y agrupa archivos que son portadas relacionadas identificadas con patrones -P1, -P2, etc.
   * @param items Lista de elementos jerárquicos a procesar
   * @returns Lista procesada con las portadas agrupadas con sus archivos principales
   */
  processPreviewItems(items: HierarchyItem[]): HierarchyItem[] {
    try {
      this.logger.info("Procesando patrones de portadas");

      // Mapa global para agrupar por nombre base
      const baseNameMap: Map<string, FileItem[]> = new Map();

      // Función recursiva para recolectar todos los archivos
      const collectFiles = (items: HierarchyItem[]) => {
        items.forEach((item) => {
          if (isFileItem(item)) {
            // Extraer información de patrón de portada
            const { isPreview, previewPattern, baseName } =
              extractPreviewPattern(item.name);

            // Guardar información de patrón en el archivo
            item.previewPattern = previewPattern;
            item.baseName = baseName;
            item.previewItems = item.previewItems || [];

            // Si es una portada (P1, P2, etc), establecer el order basado en el número
            if (previewPattern) {
              const previewNumber = parseInt(
                previewPattern.replace("P", ""),
                10
              );
              item.order = previewNumber || 0;
            }

            // Normalizar el nombre base quitando la extensión y espacios
            const baseNameWithoutExt = baseName.replace(/\.[^.]+$/, "").trim();

            // Agregar al mapa global
            if (!baseNameMap.has(baseNameWithoutExt)) {
              baseNameMap.set(baseNameWithoutExt, []);
            }
            baseNameMap.get(baseNameWithoutExt)?.push(item);
          }

          // Procesar recursivamente los hijos si es una carpeta
          if (isFolderItem(item)) {
            collectFiles(item.children);
          }
        });
      };

      // Recolectar todos los archivos de la jerarquía
      collectFiles(items);

      // Procesar las relaciones encontradas
      baseNameMap.forEach((relatedFiles, baseNameWithoutExt) => {
        if (relatedFiles.length > 1) {
          // Encontrar el archivo principal (el que no tiene patrón de preview)
          const mainFile = relatedFiles.find((file) => !file.previewPattern);
          const previewFiles = relatedFiles.filter(
            (file) => file.previewPattern
          );

          if (mainFile) {
            // Ordenar portadas por número
            previewFiles.sort((a, b) => a.order - b.order);

            // Asignar portadas al archivo principal
            mainFile.previewItems = previewFiles;

            // Marcar las portadas con referencia al archivo principal
            previewFiles.forEach((preview) => {
              preview.isPreviewOf = mainFile.id;
            });

            this.logger.info(
              `Archivo ${mainFile.name} tiene ${previewFiles.length} portadas relacionadas en diferentes carpetas`
            );
          } else {
            // Si no hay archivo principal, usar el primer archivo como principal
            const firstFile = relatedFiles[0];
            const otherFiles = relatedFiles.slice(1);

            // Ordenar los otros archivos por número
            otherFiles.sort((a, b) => a.order - b.order);

            // Asignar como previewItems
            if (firstFile) {
              firstFile.previewItems = otherFiles;

              // Marcar los otros archivos como previews
              otherFiles.forEach((preview) => {
                preview.isPreviewOf = firstFile.id;
              });

              this.logger.info(
                `No se encontró archivo principal para ${baseNameWithoutExt}, usando ${firstFile.name} como principal`
              );
            }
          }
        }
      });

      // Función recursiva para filtrar portadas
      const filterPreviews = (items: HierarchyItem[]): HierarchyItem[] => {
        return items
          .map((item) => {
            if (isFolderItem(item)) {
              return {
                ...item,
                children: filterPreviews(item.children),
              };
            }
            return item;
          })
          .filter((item) => {
            if (isFileItem(item)) {
              // Mantener el archivo si no es una portada o si es el archivo principal
              return (
                !item.isPreviewOf ||
                (item.previewItems && item.previewItems.length > 0)
              );
            }
            return true; // Mantener todas las carpetas
          });
      };

      // Filtrar las portadas de la jerarquía
      return filterPreviews(items);
    } catch (error) {
      this.logger.error("Error procesando patrones de portada", error);
      return items;
    }
  }
}
