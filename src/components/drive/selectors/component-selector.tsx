"use client";

import type { HierarchyItem } from "@/src/features/drive/types/index";
import {
  determineComponentType,
  getContentType,
} from "@/src/features/drive/utils/marketing-salon/component-type-utils";
import { ButtonRenderer } from "@/src/components/drive/renderers/button-renderer";
import { VimeoRenderer } from "@/src/components/drive/renderers/vimeo-renderer";
import { GoogleSlidesRenderer } from "@/src/components/drive/renderers/google-slides-renderer";
import { GoogleFormRenderer } from "@/src/components/drive/renderers/google-form-renderer";
import { PdfRenderer } from "@/src/components/drive/renderers/pdf-renderer";
import { ImageRenderer } from "@/src/components/drive/renderers/image-renderer";
import { ModalRenderer } from "@/src/components/drive/renderers/modal-renderer";
import { DirectImageRenderer } from "@/src/components/drive/renderers/direct-image-renderer";
import { GenericRenderer } from "@/src/components/drive/renderers/generic-renderer";
import {
  hasPrefix,
  getFormUrl,
} from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

interface ComponentSelectorProps {
  item: HierarchyItem;
  index?: number;
}

/**
 * ComponentSelector
 *
 * Componente central que determina qué tipo de componente renderizar basado en las propiedades del item.
 * Actúa como un "factory" que selecciona el renderizador adecuado según el tipo de contenido.
 *
 * @param {HierarchyItem} item - El elemento de contenido a renderizar
 * @param {number} index - Índice opcional para identificar la posición del elemento
 * @returns El componente específico para el tipo de contenido
 */
export function ComponentSelector({ item, index }: ComponentSelectorProps) {
  // Procesamiento especial para formularios de Google
  // Si el elemento tiene el prefijo "googleform" o "form", añadimos la URL del formulario
  if (
    (hasPrefix(item, "googleform") ||
      hasPrefix(item, "form") ||
      item.name.toLowerCase().includes("googleform")) &&
    !getFormUrl(item)
  ) {
    // Extraer el ID del formulario del nombre si sigue un patrón específico
    // o usar una URL predeterminada
    const formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSdg7a7Ova2NuP67O2NQUf9kpnEHHPnAeqeqF3M2ECaKl4QWYQ/viewform?usp=header";

    // En lugar de modificar el objeto item directamente, lo pasamos como está.
    // La propiedad formUrl se manejará dentro de GoogleFormRenderer
  }

  // Determine component type based on prefixes and mimeType
  const componentType = determineComponentType(item);

  // Render appropriate component based on type
  switch (componentType) {
    case "button":
      return <ButtonRenderer item={item} />;
    case "vimeo":
      return <VimeoRenderer item={item} />;
    case "google-slides":
      return <GoogleSlidesRenderer item={item} />;
    case "google-form":
      return <GoogleFormRenderer item={item} />;
    case "pdf":
      return <PdfRenderer item={item} />;
    case "image":
      return <ImageRenderer item={item} />;
    case "modal":
      return <ModalRenderer item={item} />;
    case "direct-image":
      return <DirectImageRenderer item={item} />;
    default:
      return <GenericRenderer item={item} contentType={getContentType(item)} />;
  }
}
