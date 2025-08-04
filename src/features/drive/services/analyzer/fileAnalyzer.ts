/**
 * FileAnalyzer
 *
 * Servicio para analizar archivos y determinar su tipo,
 * prefijos, sufijos y otras características.
 */

import {
  HierarchyItem,
  FileItem,
  isFileItem,
  hasPrefix as itemHasPrefix,
  hasSuffix as itemHasSuffix,
} from "../../types/hierarchy";
import { Prefix } from "../../types/prefix";
import { Suffix } from "../../types/suffix";
import { Logger } from "../../utils/logger";

export interface FileAnalysis {
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  isDocument: boolean;
  isSpreadsheet: boolean;
  isPresentation: boolean;
  isPdf: boolean;
  hasPrefix: boolean;
  hasSuffix: boolean;
  prefixes: string[];
  suffixes: string[];
  nameWithoutAffixes: string;
  numericOrder: number | null;
  mimeCategory: string;
  size: {
    bytes: number;
    readable: string;
  };
}

export class FileAnalyzer {
  private logger: Logger;

  constructor() {
    this.logger = new Logger("FileAnalyzer");
  }

  /**
   * Analiza un archivo para determinar sus características
   * @param file Archivo a analizar
   * @returns Análisis detallado del archivo
   */
  analyzeFile(file: FileItem): FileAnalysis {
    this.logger.info(`Analizando archivo: ${file.name}`);

    // Categoría MIME
    const mimeCategory = this.getMimeCategory(file.mimeType);

    // Detectar prefijos y sufijos
    const prefixes: string[] = [];
    const suffixes: string[] = [];

    // Comprobar cada prefijo conocido
    Object.values(Prefix).forEach((prefix) => {
      if (typeof prefix === "string" && file.name.startsWith(prefix)) {
        prefixes.push(prefix);
      }
    });

    // Comprobar cada sufijo conocido
    Object.values(Suffix).forEach((suffix) => {
      if (typeof suffix === "string" && file.name.endsWith(suffix)) {
        suffixes.push(suffix);
      }
    });

    // Extraer prefijo numérico para orden
    const numericOrder = this.extractNumericPrefix(file.name);

    // Procesar tamaño del archivo
    const sizeBytes = file.size
      ? typeof file.size === "string"
        ? parseInt(file.size, 10)
        : file.size
      : 0;
    const sizeReadable = this.formatFileSize(sizeBytes);

    // Resultado del análisis
    return {
      isImage: this.isImage(file),
      isVideo: this.isVideo(file),
      isAudio: this.isAudio(file),
      isDocument: this.isDocument(file),
      isSpreadsheet: this.isSpreadsheet(file),
      isPresentation: this.isPresentation(file),
      isPdf: this.isPdf(file),
      hasPrefix: prefixes.length > 0,
      hasSuffix: suffixes.length > 0,
      prefixes,
      suffixes,
      nameWithoutAffixes: this.getNameWithoutAffixes(file.name),
      numericOrder,
      mimeCategory,
      size: {
        bytes: sizeBytes,
        readable: sizeReadable,
      },
    };
  }

  /**
   * Obtiene la categoría principal del tipo MIME
   * @param mimeType Tipo MIME del archivo
   * @returns Categoría principal del tipo MIME
   */
  getMimeCategory(mimeType: string): string {
    if (!mimeType) return "unknown";

    const parts = mimeType.split("/");
    return parts[0] || "unknown";
  }

  /**
   * Formatea el tamaño de un archivo a formato legible
   * @param bytes Tamaño en bytes
   * @returns Tamaño formateado como string legible
   */
  formatFileSize(bytes: number | string): string {
    // Convertir a número si es un string
    const size = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;

    if (size === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(k));

    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Verifica si el archivo es una imagen
   * @param file Archivo a verificar
   * @returns true si es una imagen
   */
  isImage(file: FileItem): boolean {
    return file.mimeType?.startsWith("image/") || false;
  }

  /**
   * Verifica si el archivo es un video
   * @param file Archivo a verificar
   * @returns true si es un video
   */
  isVideo(file: FileItem): boolean {
    return file.mimeType?.startsWith("video/") || false;
  }

  /**
   * Verifica si el archivo es un audio
   * @param file Archivo a verificar
   * @returns true si es un audio
   */
  isAudio(file: FileItem): boolean {
    return file.mimeType?.startsWith("audio/") || false;
  }

  /**
   * Verifica si el archivo es un documento
   * @param file Archivo a verificar
   * @returns true si es un documento
   */
  isDocument(file: FileItem): boolean {
    return (
      file.mimeType?.includes("document") ||
      file.mimeType?.includes("text/") ||
      false
    );
  }

  /**
   * Verifica si el archivo es una hoja de cálculo
   * @param file Archivo a verificar
   * @returns true si es una hoja de cálculo
   */
  isSpreadsheet(file: FileItem): boolean {
    return file.mimeType?.includes("spreadsheet") || false;
  }

  /**
   * Verifica si el archivo es una presentación
   * @param file Archivo a verificar
   * @returns true si es una presentación
   */
  isPresentation(file: FileItem): boolean {
    return file.mimeType?.includes("presentation") || false;
  }

  /**
   * Verifica si el archivo es un PDF
   * @param file Archivo a verificar
   * @returns true si es un PDF
   */
  isPdf(file: FileItem): boolean {
    return file.mimeType?.includes("pdf") || false;
  }

  /**
   * Extrae el prefijo numérico de un nombre
   * @param name Nombre a analizar
   * @returns Prefijo numérico extraído o null si no tiene
   */
  extractNumericPrefix(name: string): number | null {
    const match = name.match(/^(\d+)_/);
    return match ? parseInt(match[1] || '0', 10) : null;
  }

  /**
   * Obtiene el nombre sin prefijos ni sufijos
   * @param name Nombre completo
   * @returns Nombre sin afijos
   */
  getNameWithoutAffixes(name: string): string {
    let result = name;

    // Quitar prefijos numéricos
    result = result.replace(/^\d+_/, "");

    // Quitar prefijos conocidos
    Object.values(Prefix).forEach((prefix) => {
      if (typeof prefix === "string") {
        const prefixWithUnderscore = `${prefix}_`;
        if (result.includes(prefixWithUnderscore)) {
          result = result.replace(prefixWithUnderscore, "");
        }
      }
    });

    // Quitar sufijos conocidos
    Object.values(Suffix).forEach((suffix) => {
      if (typeof suffix === "string") {
        const suffixWithUnderscore = `_${suffix}`;
        if (result.endsWith(suffixWithUnderscore)) {
          result = result.substring(
            0,
            result.length - suffixWithUnderscore.length
          );
        }
      }
    });

    return result;
  }

  /**
   * Determina la importancia de un elemento para ordenamiento
   * basado en sus características
   * @param item Elemento a evaluar
   * @returns Valor numérico de importancia (mayor = más importante)
   */
  calculateItemImportance(item: HierarchyItem): number {
    let importance = 0;

    // Prioridad base por tipo
    if (isFileItem(item)) {
      importance += 10;

      // Análisis más detallado para archivos
      const analysis = this.analyzeFile(item as FileItem);
      if (analysis) {
        // Priorizar por tipo de contenido
        if (analysis.isDocument) importance += 5;
        if (analysis.isPdf) importance += 8;
        if (analysis.isSpreadsheet) importance += 6;
        if (analysis.isPresentation) importance += 7;
        if (analysis.isImage) importance += 3;
        if (analysis.isVideo) importance += 4;
        if (analysis.isAudio) importance += 2;

        // Aplicar prioridad por prefijo numérico
        if (analysis.numericOrder !== null) {
          importance += 100 - Math.min(analysis.numericOrder, 99); // Mayor prioridad a números más bajos
        }
      }
    } else {
      // Las carpetas tienen prioridad base mayor
      importance += 20;

      // Carpetas especiales
      if (itemHasPrefix(item, Prefix.TABS)) importance += 15;
      if (itemHasPrefix(item, Prefix.ACCORDION)) importance += 12;
      if (itemHasPrefix(item, Prefix.GRID)) importance += 10;

      // Carpetas con prefijo numérico
      const numericMatch = item.name.match(/^(\d+)_/);
      if (numericMatch) {
        const order = parseInt(numericMatch[1] || '0', 10);
        importance += 100 - Math.min(order, 99);
      }
    }

    // Elementos ocultos tienen la menor prioridad
    if (itemHasSuffix(item, Suffix.HIDDEN)) {
      importance -= 50;
    }

    return importance;
  }
}
