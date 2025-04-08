"use client";

import { useState } from "react";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { Button } from "@/src/components/ui/button";
import { FormInput, ExternalLink } from "lucide-react";
import { decodeFileName } from "@/src/features/drive/utils/marketing-salon/file-decoder";

// Importar la utilidad para extraer la URL del formulario
import { extractFormUrl } from "@/src/features/drive/utils/marketing-salon/description-parser";
import {
  getEmbedUrl,
  getFormUrl,
} from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

interface GoogleFormRendererProps {
  item: HierarchyItem;
}

/**
 * GoogleFormRenderer
 *
 * Componente especializado para renderizar enlaces a formularios de Google.
 * Extrae la URL del formulario de varias fuentes posibles y presenta un botón atractivo.
 *
 * Características:
 * - Extracción inteligente de URL de formulario desde múltiples fuentes
 * - Efecto de hover con animación suave
 * - Decodificación de información adicional del nombre del archivo
 * - Presentación visual consistente con la identidad de la aplicación
 *
 * @param {HierarchyItem} item - Elemento de contenido que contiene la información del formulario
 * @returns Botón estilizado que enlaza al formulario de Google
 */
export function GoogleFormRenderer({ item }: GoogleFormRendererProps) {
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Extrae la URL del formulario de Google desde múltiples fuentes posibles
   * Orden de prioridad:
   * 1. Campo description (propiedad formUrl)
   * 2. Propiedad formUrl directa
   * 3. URL de embed transformada
   * 4. URL de fallback predeterminada
   *
   * @returns {string} URL válida del formulario de Google
   */
  const getGoogleFormUrl = () => {
    // Estrategia 1: Extraer desde el campo description
    const formUrlFromDescription = extractFormUrl(item);
    if (formUrlFromDescription) {
      return formUrlFromDescription;
    }

    // Estrategia 2: Usar la propiedad formUrl directa
    const formUrlDirect = getFormUrl(item);
    if (formUrlDirect) {
      return formUrlDirect;
    }

    // Estrategia 3: Extraer desde la URL de embed transformada
    const embedUrl = getEmbedUrl(item);
    if (
      embedUrl &&
      (embedUrl.includes("docs.google.com/forms") ||
        embedUrl.includes("viewform"))
    ) {
      // Asegurar que la URL tenga el formato correcto para visualización
      let url = embedUrl;
      if (!url.includes("viewform")) {
        url = url.replace(/\/edit$/, "/viewform");
      }
      return url;
    }

    // Estrategia 4: URL de fallback predeterminada
    return "https://docs.google.com/forms/d/e/1FAIpQLSdg7a7Ova2NuP67O2NQUf9kpnEHHPnAeqeqF3M2ECaKl4QWYQ/viewform?usp=header";
  };

  const formUrl = getGoogleFormUrl();

  // Decodificar el nombre del archivo para obtener información adicional
  const decodedInfo = decodeFileName(item.name);

  // Determinar el título a mostrar (priorizar categoría decodificada)
  const displayTitle = decodedInfo
    ? `${decodedInfo.category}`
    : item.displayName || "Formulario";

  return (
    <div className='w-full max-w-sm mx-auto'>
      <Button
        className={`w-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center gap-3 py-4 px-6 rounded-md transition-all duration-200 ${
          isHovered ? "shadow-lg translate-y-[-2px]" : "shadow"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        asChild
      >
        <a
          href={formUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center'
        >
          <FormInput className='h-5 w-5 text-[#CEFF66]' />
          <span>{displayTitle}</span>
          <ExternalLink className='h-4 w-4 ml-1 opacity-70' />
        </a>
      </Button>
    </div>
  );
}
