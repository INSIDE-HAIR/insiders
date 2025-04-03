import type { ContentItem } from "@/src/features/drive/types/content-types";
import { extractFormUrl } from "@/src/lib/utils/marketing-salon/description-parser";

/**
 * Determina el tipo de componente basado en las propiedades del elemento
 *
 * @param {ContentItem} item - El elemento de contenido a analizar
 * @returns {string} El tipo de componente a renderizar
 */
export function determineComponentType(item: ContentItem): string {
  // Verificar si hay una URL de formulario en description
  const formUrlFromDescription = extractFormUrl(item);
  if (formUrlFromDescription) return "google-form";

  // Primero verificamos si hay prefijos específicos en el nombre
  if (item.prefixes.includes("button")) return "button";
  if (item.prefixes.includes("vimeo")) return "vimeo";
  if (item.prefixes.includes("image")) return "direct-image";
  if (item.prefixes.includes("pdf")) return "direct-pdf";
  if (item.prefixes.includes("video")) return "direct-video";
  if (item.prefixes.includes("audio")) return "direct-audio";
  if (
    item.prefixes.includes("googleform") ||
    item.prefixes.includes("form") ||
    item.formUrl
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
      item.prefixes.some((p) => p.toLowerCase().includes("modal")))
  )
    return "modal";

  // Finalmente, determinamos el tipo basado en el mimeType y URLs
  if (
    item.mimeType === "application/vnd.google-apps.presentation" ||
    (item.transformedUrl?.embed &&
      item.transformedUrl.embed.includes("docs.google.com/presentation"))
  )
    return "google-slides";
  if (
    item.transformedUrl?.embed &&
    (item.transformedUrl.embed.includes("docs.google.com/forms") ||
      item.transformedUrl.embed.includes("forms.gle") ||
      (item.transformedUrl.embed.includes("docs.google.com") &&
        item.transformedUrl.embed.includes("viewform")))
  )
    return "google-form";
  if (item.mimeType?.includes("pdf")) return "pdf";
  if (item.mimeType?.includes("image")) return "image";
  if (item.mimeType?.includes("video")) return "video";
  if (item.mimeType?.includes("audio")) return "audio";

  return "generic";
}

/**
 * Determina el tipo de contenido para mostrar al usuario
 *
 * @param {ContentItem} item - El elemento de contenido a analizar
 * @returns {string} Etiqueta descriptiva del tipo de contenido
 */
export function getContentType(item: ContentItem) {
  if (item.mimeType?.includes("text")) return "Texto";
  if (item.mimeType?.includes("image")) return "Imagen";
  if (item.mimeType?.includes("pdf")) return "PDF";
  if (item.mimeType === "application/vnd.google-apps.presentation")
    return "Presentación";
  if (item.prefixes.includes("button")) return "Botón";
  if (
    item.prefixes.includes("vimeo") ||
    item.name.toLowerCase().includes("vimeo")
  )
    return "Video";
  if (item.name.toLowerCase().includes("modal")) return "Modal";
  if (
    item.name.toLowerCase().includes("form") ||
    item.formUrl ||
    (item.transformedUrl?.embed &&
      (item.transformedUrl.embed.includes("docs.google.com/forms") ||
        item.transformedUrl.embed.includes("viewform")))
  )
    return "Formulario";
  return "Archivo";
}

/**
 * Verifica si un elemento tiene el sufijo de descarga
 *
 * @param {ContentItem} item - El elemento a verificar
 * @returns {boolean} True si el elemento tiene el sufijo de descarga
 */
export function hasDownloadSuffix(item: ContentItem): boolean {
  return item.suffixes.includes("download");
}
