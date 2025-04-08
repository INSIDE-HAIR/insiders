"use client";

import { useState, useEffect } from "react";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import {
  getEmbedUrl,
  getPreviewUrl,
  getTransformedUrl,
} from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

interface GoogleSlidesRendererProps {
  item: HierarchyItem;
}

/**
 * GoogleSlidesRenderer
 *
 * Componente especializado para renderizar presentaciones de Google Slides.
 * Construye automáticamente la URL de embed a partir de la información del elemento.
 *
 * Características:
 * - Detección y construcción automática de URL de embed para Google Slides
 * - Soporte para diferentes formatos de URL de Google Slides
 * - Estado de carga con feedback visual
 * - Renderizado responsivo con relación de aspecto 16:9
 *
 * @param {HierarchyItem} item - Elemento de contenido que contiene la información de la presentación
 * @returns Presentación de Google Slides embebida con controles completos
 */
export function GoogleSlidesRenderer({ item }: GoogleSlidesRendererProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Procesar las URLs disponibles para construir la URL de embed
    const directEmbedUrl = getEmbedUrl(item);
    const previewUrl = getPreviewUrl(item);

    if (directEmbedUrl || previewUrl) {
      // Para presentaciones de Google Slides, necesitamos usar la URL de publicación
      // que tiene un formato diferente con un ID más largo
      const presentationId = item.id; // ID de la presentación

      // Estrategia 1: Usar directamente la URL de embed si ya tiene el formato correcto
      if (
        directEmbedUrl &&
        directEmbedUrl.includes("docs.google.com/presentation")
      ) {
        setEmbedUrl(directEmbedUrl);
      } else {
        // Estrategia 2: Construir la URL de embed a partir del ID de la presentación
        // Formato: https://docs.google.com/presentation/d/{ID}/embed?start=false&loop=false&delayms=3000
        setEmbedUrl(
          `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`
        );
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [item]); // Dependencia: solo re-ejecutar cuando cambia el item

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className='aspect-video w-full bg-zinc-800 flex items-center justify-center text-zinc-400'>
        Cargando presentación...
      </div>
    );
  }

  // Mostrar mensaje de error si no se puede construir la URL
  if (!embedUrl) {
    return (
      <div className='p-4 bg-zinc-800 text-zinc-300'>
        <p className='mb-2'>No se pudo cargar la presentación.</p>
        <p className='text-sm'>
          La URL de embed no está disponible para este archivo.
        </p>
      </div>
    );
  }

  // Renderizar la presentación con relación de aspecto 16:9
  return (
    <div className='w-full max-w-4xl mx-auto mb-8'>
      <div
        className='relative w-full overflow-hidden'
        style={{ paddingBottom: "56.25%" }}
      >
        <iframe
          src={embedUrl}
          frameBorder='0'
          width='100%'
          height='100%'
          allowFullScreen={true}
          className='absolute top-0 left-0 w-full h-full border border-zinc-300'
          title={item.displayName}
        ></iframe>
      </div>
    </div>
  );
}
