"use client";

import type { HierarchyItem } from "@/src/features/drive/types/index";
import { ComponentSelector } from "@/src/components/drive/selectors/component-selector";
import { GoogleSlidesRenderer } from "@/src/components/drive/renderers/google-slides-renderer";
import { mimeTypeIncludes } from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

interface ContentGridProps {
  items: HierarchyItem[];
  onContentUpdated?: () => void;
}

/**
 * ContentGrid
 *
 * Componente que muestra una cuadrícula de elementos de contenido.
 * Adapta la visualización según el tipo de contenido (PDFs, Google Slides, etc.)
 *
 * @param {HierarchyItem[]} items - Lista de elementos a mostrar en la cuadrícula
 * @returns Cuadrícula de contenido adaptada al tipo de elementos
 */
export function ContentGrid({ items, onContentUpdated }: ContentGridProps) {
  // Check if all items are PDFs - if so, use the custom grid
  const allPdfs =
    items.length > 0 && items.every((item) => mimeTypeIncludes(item, "pdf"));

  // Check if there are Google Slides presentations
  const hasGoogleSlides = items.some(
    (item) => item.mimeType === "application/vnd.google-apps.presentation"
  );

  if (hasGoogleSlides) {
    return (
      <div className='w-full flex flex-col items-center'>
        {items.map((item) => (
          <div key={item.id} className='w-full mb-8'>
            {item.mimeType === "application/vnd.google-apps.presentation" ? (
              <div className='w-full max-w-4xl mx-auto'>
                <h3 className='text-lg font-medium text-black w-full text-center mb-4'>
                  {item.displayName}
                </h3>
                <GoogleSlidesRenderer item={item} />
              </div>
            ) : (
              <div className='flex justify-center'>
                <ComponentSelector
                  item={item}
                  onItemUpdated={onContentUpdated}
                  onItemDeleted={onContentUpdated}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (allPdfs) {
    return <PdfGrid items={items} onContentUpdated={onContentUpdated} />;
  }

  // Otherwise use the original grid
  return (
    <div className='flex flex-wrap gap-6 justify-center'>
      {items.map((item) => (
        <div key={item.id}>
          <ComponentSelector
            item={item}
            onItemUpdated={onContentUpdated}
            onItemDeleted={onContentUpdated}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * PdfGrid
 *
 * Componente especializado para mostrar una cuadrícula de PDFs.
 *
 * @param {HierarchyItem[]} items - Lista de PDFs a mostrar
 * @returns Cuadrícula especializada para PDFs
 */
function PdfGrid({
  items,
  onContentUpdated,
}: {
  items: HierarchyItem[];
  onContentUpdated?: () => void;
}) {
  return (
    <div className='flex flex-wrap gap-6 justify-center p-4'>
      {items.map((item) => (
        <div key={item.id}>
          <ComponentSelector
            item={item}
            onItemUpdated={onContentUpdated}
            onItemDeleted={onContentUpdated}
          />
        </div>
      ))}
    </div>
  );
}
