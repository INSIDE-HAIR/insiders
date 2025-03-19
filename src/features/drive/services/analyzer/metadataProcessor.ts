/**
 * Procesador de Metadatos
 *
 * Se encarga de analizar y procesar archivos con sufijo _copy,
 * extrayendo metadatos y asociándolos a sus archivos principales.
 */

import { Logger } from "../../utils/logger";
import { GoogleDriveService } from "../drive/GoogleDriveService";
import { FileAnalyzer } from "./fileAnalyzer";
import { HierarchyItem, FileItem, isFileItem } from "../../types/hierarchy";
import { Suffix } from "../../types/suffix";

export interface MetadataOptions {
  /**
   * Si es verdadero, registra información detallada sobre el procesamiento
   * Por defecto: false
   */
  verbose?: boolean;

  /**
   * Formato esperado de los metadatos (json, text, yaml)
   * Por defecto: 'auto' (detecta automáticamente)
   */
  format?: "json" | "text" | "yaml" | "auto";
}

export class MetadataProcessor {
  private logger: Logger;
  private driveService: GoogleDriveService;
  private fileAnalyzer: FileAnalyzer;

  constructor(driveService: GoogleDriveService, fileAnalyzer: FileAnalyzer) {
    this.driveService = driveService;
    this.fileAnalyzer = fileAnalyzer;
    this.logger = new Logger("MetadataProcessor");
    this.logger.info("MetadataProcessor inicializado");
  }

  /**
   * Procesa los metadatos de un conjunto de items de jerarquía
   * Busca archivos con sufijo _copy y extrae sus metadatos
   *
   * @param items Lista de items de jerarquía a procesar
   * @param options Opciones de procesamiento
   * @returns La misma lista de items pero con metadatos procesados
   */
  async processMetadata(
    items: HierarchyItem[],
    options: MetadataOptions = {}
  ): Promise<HierarchyItem[]> {
    const { verbose = false, format = "auto" } = options;

    if (verbose) {
      this.logger.info(
        `Iniciando procesamiento de metadatos para ${items.length} elementos`
      );
    }

    // Identificar archivos _copy
    const copyFiles = this.identifyCopyFiles(items);
    if (verbose) {
      this.logger.info(
        `Encontrados ${copyFiles.length} archivos con sufijo _copy`
      );
    }

    // Procesar cada archivo _copy y asociarlo con su archivo principal
    for (const copyFile of copyFiles) {
      try {
        // Obtener el contenido del archivo _copy
        const content = await this.driveService.getFileContent(copyFile.id);
        if (!content) {
          this.logger.warn(
            `No se pudo obtener contenido del archivo ${copyFile.name}`
          );
          continue;
        }

        // Encontrar el archivo principal al que pertenece este _copy
        const mainFile = this.findMainFile(items, copyFile);
        if (!mainFile) {
          this.logger.warn(
            `No se encontró archivo principal para ${copyFile.name}`
          );
          continue;
        }

        // Procesar los metadatos según el formato
        const metadata = this.parseMetadataContent(content, format);

        // Asociar los metadatos al archivo principal
        mainFile.metadata = { ...mainFile.metadata, ...metadata };

        if (verbose) {
          this.logger.info(
            `Metadatos de ${copyFile.name} asociados a ${mainFile.name}`
          );
        }
      } catch (error) {
        this.logger.error(
          `Error procesando metadatos de ${copyFile.name}`,
          error
        );
      }
    }

    return items;
  }

  /**
   * Identifica todos los archivos con sufijo _copy en un conjunto de items
   * @param items Lista de items jerárquicos
   * @returns Lista de archivos FileItem con sufijo _copy
   */
  private identifyCopyFiles(items: HierarchyItem[]): FileItem[] {
    const copyFiles: FileItem[] = [];

    // Función recursiva para buscar archivos _copy
    const findCopyFiles = (item: HierarchyItem) => {
      if (isFileItem(item) && item.suffixes.includes(Suffix.COPY)) {
        copyFiles.push(item);
      }

      // Si tiene hijos (folder o similar), buscar recursivamente
      if ("children" in item && Array.isArray(item.children)) {
        item.children.forEach(findCopyFiles);
      }
    };

    // Iniciar búsqueda en todos los items
    items.forEach(findCopyFiles);
    return copyFiles;
  }

  /**
   * Encuentra el archivo principal al que corresponde un archivo _copy
   * @param items Todos los items de la jerarquía
   * @param copyFile El archivo _copy que se está procesando
   * @returns El archivo principal o undefined si no se encuentra
   */
  private findMainFile(
    items: HierarchyItem[],
    copyFile: FileItem
  ): FileItem | undefined {
    // Eliminar el sufijo _copy del nombre para obtener el nombre base
    const baseName = this.getBaseNameWithoutSuffix(copyFile.name, Suffix.COPY);

    // Buscar en el mismo directorio que el archivo _copy
    const parentId = copyFile.parents?.[0];

    // Función recursiva para buscar el archivo principal
    const findMainFileRecursive = (
      item: HierarchyItem
    ): FileItem | undefined => {
      // Verificar si este item es el archivo principal
      if (
        isFileItem(item) &&
        item.id !== copyFile.id && // No es el mismo archivo _copy
        this.getNormalizedName(item.name) ===
          this.getNormalizedName(baseName) && // Tiene el mismo nombre base
        item.parents?.[0] === parentId // Está en el mismo directorio
      ) {
        return item;
      }

      // Si tiene hijos, buscar recursivamente
      if ("children" in item && Array.isArray(item.children)) {
        for (const child of item.children) {
          const found = findMainFileRecursive(child);
          if (found) return found;
        }
      }

      return undefined;
    };

    // Buscar en todos los items
    for (const item of items) {
      const found = findMainFileRecursive(item);
      if (found) return found;
    }

    return undefined;
  }

  /**
   * Normaliza un nombre de archivo para hacer comparaciones consistentes
   * @param name Nombre a normalizar
   * @returns Nombre normalizado
   */
  private getNormalizedName(name: string): string {
    // Eliminar la extensión del archivo para comparar solo el nombre base
    return name.replace(/\.[^.]+$/, "");
  }

  /**
   * Elimina un sufijo específico del nombre de un archivo
   * @param name Nombre completo del archivo
   * @param suffix Sufijo a eliminar
   * @returns Nombre base sin el sufijo
   */
  private getBaseNameWithoutSuffix(name: string, suffix: string): string {
    const suffixPattern = new RegExp(`_${suffix}(\\.[^\\.]+)?$`);
    return name.replace(suffixPattern, "");
  }

  /**
   * Parsea el contenido de un archivo de metadatos según su formato
   * @param content Contenido del archivo
   * @param format Formato esperado (auto para detectar automáticamente)
   * @returns Objeto con los metadatos extraídos
   */
  private parseMetadataContent(
    content: string,
    format: "json" | "text" | "yaml" | "auto"
  ): Record<string, any> {
    // Si es 'auto', intentar detectar el formato
    if (format === "auto") {
      if (content.trim().startsWith("{")) {
        format = "json";
      } else if (content.includes(":\n")) {
        format = "yaml";
      } else {
        format = "text";
      }
    }

    try {
      switch (format) {
        case "json":
          return JSON.parse(content);

        case "yaml":
          // Implementación básica de parsing YAML
          // Para una implementación completa se recomendaría usar una librería
          const metadata: Record<string, any> = {};
          const lines = content.split("\n");
          for (const line of lines) {
            const match = line.match(/^\s*([^:]+):\s*(.*)$/);
            if (match) {
              const [_, key, value] = match;
              metadata[key.trim()] = value.trim();
            }
          }
          return metadata;

        case "text":
        default:
          // Formato de texto simple: clave: valor
          const textMetadata: Record<string, any> = {};
          const textLines = content.split("\n");
          for (const line of textLines) {
            const match = line.match(/^\s*([^:]+):\s*(.*)$/);
            if (match) {
              const [_, key, value] = match;
              textMetadata[key.trim()] = value.trim();
            }
          }
          // Si no hay pares clave-valor, usar como descripción
          if (Object.keys(textMetadata).length === 0) {
            return { description: content.trim() };
          }
          return textMetadata;
      }
    } catch (error) {
      this.logger.error(`Error parseando contenido de metadatos: ${error}`);
      // Si falla el parsing, devolver el contenido como descripción
      return { description: content.trim() };
    }
  }

  /**
   * Procesa metadatos especiales como títulos alternativos o descripciones
   * @param items Lista de items a procesar
   * @returns Lista de items procesados
   */
  processSpecialMetadata(items: HierarchyItem[]): HierarchyItem[] {
    const processItem = (item: HierarchyItem): HierarchyItem => {
      // Si el item tiene metadatos
      if (item.metadata) {
        // Procesar displayName si hay un título alternativo en los metadatos
        if (item.metadata.title) {
          item.displayName = item.metadata.title;
        } else if (item.metadata.displayName) {
          item.displayName = item.metadata.displayName;
        }

        // Procesar descripción si no existe ya
        if (!item.description && item.metadata.description) {
          item.description = item.metadata.description;
        }
      }

      // Procesar hijos recursivamente
      if ("children" in item && Array.isArray(item.children)) {
        item.children = item.children.map(processItem);
      }

      return item;
    };

    return items.map(processItem);
  }
}
