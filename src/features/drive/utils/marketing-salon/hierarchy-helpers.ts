import type { HierarchyItem } from "@/src/features/drive/types/index";
import { decodeFileName } from "./file-decoder";

/**
 * Verifica si un item tiene un prefijo específico
 */
export const hasPrefix = (item: HierarchyItem, prefix: string): boolean => {
  return item.prefixes.some((p) => String(p) === prefix);
};

/**
 * Verifica si un item tiene un sufijo específico
 */
export const hasSuffix = (item: HierarchyItem, suffix: string): boolean => {
  return item.suffixes.some((s) => String(s) === suffix);
};

/**
 * Verifica si un item tiene una propiedad específica
 */
export const hasProperty = <T extends HierarchyItem, K extends string>(
  item: T,
  prop: K
): boolean => {
  return prop in item;
};

/**
 * Accede de forma segura a una propiedad transformedUrl
 */
export const getTransformedUrl = (item: HierarchyItem) => {
  return hasProperty(item, "transformedUrl")
    ? (item as any).transformedUrl
    : undefined;
};

/**
 * Accede de forma segura a la URL de vista previa
 */
export const getPreviewUrl = (item: HierarchyItem): string | undefined => {
  const transformedUrl = getTransformedUrl(item);
  return transformedUrl?.preview;
};

/**
 * Accede de forma segura a la URL de descarga
 */
export const getDownloadUrl = (item: HierarchyItem): string | undefined => {
  const transformedUrl = getTransformedUrl(item);
  return transformedUrl?.download;
};

/**
 * Obtiene una URL de descarga con nombre de archivo decodificado
 */
export const getDownloadUrlWithDecodedName = (
  item: HierarchyItem
): string | undefined => {
  const downloadUrl = getDownloadUrl(item);
  if (!downloadUrl) return undefined;

  const decodedInfo = decodeFileName(item.name);
  if (!decodedInfo) return downloadUrl;

  // Agregar el nombre decodificado como parámetro de consulta
  const url = new URL(downloadUrl);
  url.searchParams.set(
    "response-content-disposition",
    `attachment; filename="${decodedInfo.fullName}"`
  );

  return url.toString();
};

/**
 * Accede de forma segura a la URL de embed
 */
export const getEmbedUrl = (item: HierarchyItem): string | undefined => {
  const transformedUrl = getTransformedUrl(item);
  return transformedUrl?.embed;
};

/**
 * Accede de forma segura a la propiedad formUrl
 */
export const getFormUrl = (item: HierarchyItem): string | undefined => {
  return hasProperty(item, "formUrl") ? (item as any).formUrl : undefined;
};

/**
 * Accede de forma segura a la propiedad previewItems
 */
export const getPreviewItems = (
  item: HierarchyItem
): HierarchyItem[] | undefined => {
  return hasProperty(item, "previewItems")
    ? (item as any).previewItems
    : undefined;
};

/**
 * Comprueba si el elemento tiene múltiples vistas previas
 */
export const hasMultiplePreviews = (item: HierarchyItem): boolean => {
  const previewItems = getPreviewItems(item);
  return !!previewItems && previewItems.length > 1;
};

/**
 * Verifica de forma segura si el mimeType incluye un texto específico
 */
export const mimeTypeIncludes = (
  item: HierarchyItem,
  text: string
): boolean => {
  return !!item.mimeType && item.mimeType.includes(text);
};

/**
 * Determina si una carpeta debe ocultarse basándose en contenido específico
 * como "donde ponerlo"
 */
export const shouldHideFolder = (item: HierarchyItem): boolean => {
  // Si no es una carpeta, no aplica
  if (item.driveType !== "folder") return false;

  // Verificar si la carpeta o sus hijos contienen "donde ponerlo"
  const containsDondePoner =
    item.name.toLowerCase().includes("donde ponerlo") ||
    item.displayName.toLowerCase().includes("donde ponerlo");

  // Si es una carpeta con "donde ponerlo" en el nombre, ocultar
  if (containsDondePoner) return true;

  // Verificar si TODOS sus hijos son carpetas con "donde ponerlo"
  if (item.children.length > 0) {
    const allChildrenAreDondePoner = item.children.every(
      (child) =>
        child.name.toLowerCase().includes("donde ponerlo") ||
        child.displayName.toLowerCase().includes("donde ponerlo")
    );

    // Si todos los hijos son "donde ponerlo", ocultar la carpeta
    if (allChildrenAreDondePoner && item.children.length > 0) return true;
  }

  return false;
};
