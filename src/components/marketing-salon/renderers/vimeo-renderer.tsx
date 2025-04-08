"use client";

/**
 * VimeoRenderer
 *
 * Componente especializado para renderizar videos de Vimeo.
 * Extrae automáticamente el ID de Vimeo del nombre del archivo o utiliza un mapeo predefinido.
 *
 * Características:
 * - Detección automática del ID de Vimeo desde el nombre del archivo
 * - Soporte para IDs predefinidos para archivos específicos
 * - Interfaz de error amigable cuando no se puede determinar el ID
 * - Renderizado responsivo con relación de aspecto 16:9
 *
 * @param {HierarchyItem} item - Elemento de contenido que contiene la información del video
 * @returns Reproductor de video de Vimeo embebido con controles completos
 */

import { useState, useEffect } from "react";
import type { HierarchyItem } from "@/src/features/drive/types/index";

interface VimeoRendererProps {
  item: HierarchyItem;
}

export function VimeoRenderer({ item }: VimeoRendererProps) {
  const [vimeoId, setVimeoId] = useState<string | null>(null);

  useEffect(() => {
    // Intentar extraer ID de Vimeo del nombre del archivo
    const extractIdFromName = () => {
      // Buscar un patrón como "vimeo_123456789" en el nombre del archivo
      const matches = item.name.match(/vimeo[_-](\d+)/i);
      if (matches && matches[1]) {
        setVimeoId(matches[1]);
        return;
      }

      // Mapeo de nombres de archivo conocidos a IDs de Vimeo
      // Útil para archivos que no siguen la convención de nomenclatura
      const defaultIds: Record<string, string> = {
        "vimeo_contexto.txt": "824804225",
        "vimeo_Acción Principal.txt": "824804225",
        "01_vimeo_contexto.txt": "824804225",
        "01_vimeo_Acción Principal.txt": "824804225",
        "01_vimeo_1053382395.txt": "1053382395",
      };

      const id = defaultIds[item.name];
      if (id) {
        setVimeoId(id);
      }
    };

    extractIdFromName();
  }, [item.name]); // Dependencia: solo re-ejecutar cuando cambia el nombre del item

  // Mostrar mensaje de error si no se puede determinar el ID
  if (!vimeoId) {
    return (
      <div className='p-4 bg-zinc-800 text-zinc-300'>
        <p className='mb-2'>
          No se pudo determinar el ID de Vimeo para este archivo.
        </p>
        <p className='text-sm'>
          Sugerencia: Nombra el archivo incluyendo el ID de Vimeo (ej:
          vimeo_123456789.txt)
        </p>
      </div>
    );
  }

  // Renderizar el reproductor de Vimeo con relación de aspecto 16:9
  return (
    <div className='first:mt-0 mb-4 aspect-video border border-zinc-300 overflow-hidden flex w-full max-w-4xl mx-auto relative'>
      <div className='aspect-video w-full max-w-full'>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          allow='autoplay; fullscreen; picture-in-picture'
          allowFullScreen
          className='absolute top-0 left-0 w-full h-full'
          title={item.displayName}
        ></iframe>
      </div>
    </div>
  );
}
