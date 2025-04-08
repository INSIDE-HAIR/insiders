import type { HierarchyItem } from "@/src/features/drive/types/index";
import { extractFormUrl } from "@/src/features/drive/utils/marketing-salon/description-parser";

// Helpers para evitar errores de tipo
const hasPrefix = (item: HierarchyItem, prefix: string): boolean => {
  return item.prefixes.some((p) => String(p) === prefix);
};

const hasSuffix = (item: HierarchyItem, suffix: string): boolean => {
  return item.suffixes.some((s) => String(s) === suffix);
};

// Verificar si un item tiene una propiedad específica de manera segura
const hasProperty = <T extends HierarchyItem, K extends string>(
  item: T,
  prop: K
): boolean => {
  return prop in item;
};

/**
 * Determina el tipo de componente basado en las propiedades del elemento
 *
 * @param {HierarchyItem} item - El elemento de contenido a analizar
 * @returns {string} El tipo de componente a renderizar
 */
export function determineComponentType(item: HierarchyItem): string {
  // Verificar si hay una URL de formulario en description
  const formUrlFromDescription = extractFormUrl(item);
  if (formUrlFromDescription) return "google-form";

  // Primero verificamos si hay prefijos específicos en el nombre
  if (hasPrefix(item, "button")) return "button";
  if (hasPrefix(item, "vimeo")) return "vimeo";
  if (hasPrefix(item, "image")) return "direct-image";
  if (hasPrefix(item, "pdf")) return "direct-pdf";
  if (hasPrefix(item, "video")) return "direct-video";
  if (hasPrefix(item, "audio")) return "direct-audio";
  if (
    hasPrefix(item, "googleform") ||
    hasPrefix(item, "form") ||
    (hasProperty(item, "formUrl") && (item as any).formUrl)
  )
    return "google-form";

  // Luego verificamos si hay palabras clave en el nombre
  if (item.name.toLowerCase().includes("vimeo")) return "vimeo";
  if (
    item.name.toLowerCase().includes("form") &&
    item.name.toLowerCase().includes("google")
  )
    return "google-form";

  // Detectar carpetas o archivos con "modal" en el nombre o prefijos
  if (
    item.name.toLowerCase().includes("modal") ||
    (item.prefixes.length > 0 &&
      item.prefixes.some((p) => String(p).toLowerCase().includes("modal")))
  )
    return "modal";

  // Finalmente, determinamos el tipo basado en el mimeType y URLs
  if (
    item.mimeType === "application/vnd.google-apps.presentation" ||
    (hasProperty(item, "transformedUrl") &&
      (item as any).transformedUrl?.embed &&
      (item as any).transformedUrl.embed.includes(
        "docs.google.com/presentation"
      ))
  )
    return "google-slides";

  if (
    hasProperty(item, "transformedUrl") &&
    (item as any).transformedUrl?.embed &&
    ((item as any).transformedUrl.embed.includes("docs.google.com/forms") ||
      (item as any).transformedUrl.embed.includes("forms.gle") ||
      ((item as any).transformedUrl.embed.includes("docs.google.com") &&
        (item as any).transformedUrl.embed.includes("viewform")))
  )
    return "google-form";

  if (item.mimeType && item.mimeType.includes("pdf")) return "pdf";
  if (item.mimeType && item.mimeType.includes("image")) return "image";
  if (item.mimeType && item.mimeType.includes("video")) return "video";
  if (item.mimeType && item.mimeType.includes("audio")) return "audio";

  return "generic";
}

/**
 * Determina el tipo de contenido para mostrar al usuario
 *
 * @param {HierarchyItem} item - El elemento de contenido a analizar
 * @returns {string} Etiqueta descriptiva del tipo de contenido
 */
export function getContentType(item: HierarchyItem) {
  if (item.mimeType && item.mimeType.includes("text")) return "Texto";
  if (item.mimeType && item.mimeType.includes("image")) return "Imagen";
  if (item.mimeType && item.mimeType.includes("pdf")) return "PDF";
  if (item.mimeType === "application/vnd.google-apps.presentation")
    return "Presentación";
  if (hasPrefix(item, "button")) return "Botón";
  if (hasPrefix(item, "vimeo") || item.name.toLowerCase().includes("vimeo"))
    return "Video";
  if (item.name.toLowerCase().includes("modal")) return "Modal";
  if (
    item.name.toLowerCase().includes("form") ||
    (hasProperty(item, "formUrl") && (item as any).formUrl) ||
    (hasProperty(item, "transformedUrl") &&
      (item as any).transformedUrl?.embed &&
      ((item as any).transformedUrl.embed.includes("docs.google.com/forms") ||
        (item as any).transformedUrl.embed.includes("viewform")))
  )
    return "Formulario";
  return "Archivo";
}

/**
 * Verifica si un elemento tiene el sufijo de descarga
 *
 * @param {HierarchyItem} item - El elemento a verificar
 * @returns {boolean} True si el elemento tiene el sufijo de descarga
 */
export function hasDownloadSuffix(item: HierarchyItem): boolean {
  return hasSuffix(item, "download");
}
