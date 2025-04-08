import type { HierarchyItem } from "@/src/features/drive/types/index";

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
