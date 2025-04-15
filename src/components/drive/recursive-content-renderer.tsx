"use client";

import { useContent } from "@/src/context/DriveCompoentesContext";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { GoogleSlidesRenderer } from "@/src/components/drive/renderers/google-slides-renderer";

// Importar los nuevos componentes
import { TabNavigation } from "@/src/components/drive/navigation/tab-navigation";
import { hasContent } from "@/src/components/drive/navigation/tab-navigation";
import { SectionNavigation } from "@/src/components/drive/navigation/section-navigation";
import { ContentGrid } from "@/src/components/drive/content/content-grid";
import { ComponentSelector } from "@/src/components/drive/selectors/component-selector";
import {
  hasPrefix,
  getEmbedUrl,
  mimeTypeIncludes,
  shouldHideFolder,
} from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

interface RecursiveContentRendererProps {
  level: number;
  parentId: string | null;
  parentType: string;
}

/**
 * RecursiveContentRenderer
 *
 * Componente principal que maneja la renderización recursiva de contenido.
 * Organiza y muestra diferentes tipos de contenido respetando la jerarquía:
 * - Botones
 * - Tabs
 * - Videos de Vimeo
 * - Presentaciones de Google Slides
 * - Secciones
 * - Otros elementos
 *
 * @param {number} level - Nivel de profundidad en la jerarquía de contenido
 * @param {string|null} parentId - ID del elemento padre
 * @param {string} parentType - Tipo del elemento padre (sidebar, tab, section)
 * @returns Contenido renderizado según la jerarquía y tipo
 */
export function RecursiveContentRenderer({
  level,
  parentId,
  parentType,
}: RecursiveContentRendererProps) {
  const { getChildrenByType, navigationPath, getItemById } = useContent();
  const currentPathItem = navigationPath.find((item) => item.level === level);
  const sidebarItem =
    navigationPath.length > 0 ? getItemById(navigationPath[0].id) : null;
  const sidebarTitle = sidebarItem?.displayName || "";

  // Obtener todos los elementos hijos del padre actual
  const getAllItems = (): HierarchyItem[] => {
    if (parentId) {
      const parent = getItemById(parentId);
      return (
        parent?.children
          .filter((item) => hasContent(item) && !shouldHideFolder(item))
          .sort((a, b) => a.order - b.order) || []
      );
    }
    return [];
  };

  // Obtener todos los elementos
  const allItems = getAllItems();

  // Buscar la carpeta especial "tabs" si existe
  const tabsFolder = allItems.find(
    (item) =>
      item.name.toLowerCase().includes("tabs") ||
      item.displayName.toLowerCase() === "tabs"
  );

  // Obtener tabs desde la carpeta de tabs si existe, o directamente si no hay carpeta
  const tabItems = tabsFolder
    ? tabsFolder.children.filter((item) => hasPrefix(item, "tab"))
    : allItems.filter((item) => hasPrefix(item, "tab"));

  // Elementos que están directamente en el nivel actual (no dentro de carpetas especiales)
  const directItems = allItems.filter(
    (item) =>
      item !== tabsFolder && // No es la carpeta de tabs
      !hasPrefix(item, "tab") && // No es un tab
      !hasPrefix(item, "section") // No es una sección
  );

  // Separar los elementos directos por tipo
  const googleFormItems = directItems.filter(
    (item) =>
      hasPrefix(item, "googleform") ||
      item.name.toLowerCase().includes("googleform") ||
      (item.description && item.description.includes("formUrl"))
  );

  const buttonItems = directItems.filter(
    (item) => hasPrefix(item, "button") && !googleFormItems.includes(item)
  );

  const vimeoItems = directItems.filter(
    (item) =>
      hasPrefix(item, "vimeo") || item.name.toLowerCase().includes("vimeo")
  );

  const googleSlidesItems = directItems.filter(
    (item) =>
      item.mimeType === "application/vnd.google-apps.presentation" ||
      hasPrefix(item, "googleslide") ||
      item.name.toLowerCase().includes("googleslide") ||
      (getEmbedUrl(item) &&
        getEmbedUrl(item)!.includes("docs.google.com/presentation"))
  );

  // Elementos de tipo modal
  const modalItems = directItems.filter(
    (item) =>
      item.name.toLowerCase().includes("modal") ||
      (item.prefixes.length > 0 &&
        item.prefixes.some((p) => String(p).toLowerCase().includes("modal")))
  );

  // Otros elementos directos (excluyendo modales, formularios, slides, etc.)
  const otherDirectItems = directItems.filter(
    (item) =>
      !buttonItems.includes(item) &&
      !vimeoItems.includes(item) &&
      !googleFormItems.includes(item) &&
      !googleSlidesItems.includes(item) &&
      !modalItems.includes(item)
  );

  // Secciones en el nivel actual
  const sectionItems = allItems.filter((item) => hasPrefix(item, "section"));

  // Si no hay elementos para renderizar, devolver null
  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className='w-full flex flex-col items-center max-w-screen-2xl mx-auto'>
      {/* Título principal (solo en el primer nivel) */}
      {level === 1 && (
        <h1 className='text-3xl font-bold text-center w-full text-black my-4'>
          {sidebarTitle}
        </h1>
      )}

      {/* 1. Renderizar formularios de Google primero */}
      {googleFormItems.length > 0 && (
        <div className='w-full flex flex-col items-center mb-6'>
          {googleFormItems.map((item) => (
            <div key={item.id} className='w-full max-w-md'>
              <ComponentSelector item={item} />
            </div>
          ))}
        </div>
      )}

      {/* 2. Renderizar botones */}
      {buttonItems.length > 0 && (
        <div className='w-full flex justify-center mb-6 max-w-md mx-auto'>
          {buttonItems.map((item) => (
            <div key={item.id} className='mx-2'>
              <ComponentSelector item={item} />
            </div>
          ))}
        </div>
      )}

      {/* 3. Renderizar modales */}
      {modalItems.length > 0 && (
        <div className='w-full flex justify-center items-center mb-6 mx-auto'>
          {modalItems.map((item) => (
            <div key={item.id} className='flex justify-center'>
              <ComponentSelector item={item} />
            </div>
          ))}
        </div>
      )}

      {/* 4. Renderizar tabs si existen */}
      {tabItems.length > 0 && (
        <TabNavigation
          items={tabItems}
          level={level}
          currentId={currentPathItem?.id}
        />
      )}

      {/* 5. Si hay un tab seleccionado, renderizar su contenido */}
      {currentPathItem &&
        tabItems.some((item) => item.id === currentPathItem.id) && (
          <div className='w-full flex justify-center overflow-hidden'>
            <div className='w-full overflow-hidden'>
              <RecursiveContentRenderer
                level={level + 1}
                parentId={currentPathItem.id}
                parentType='tab'
              />
            </div>
          </div>
        )}

      {/* 6. Renderizar videos de Vimeo */}
      {vimeoItems.length > 0 && (
        <div className='w-full flex flex-col items-center max-w-4xl mx-auto'>
          {vimeoItems.map((item) => (
            <div key={item.id} className='w-full max-w-4xl mb-8'>
              <ComponentSelector item={item} />
            </div>
          ))}
        </div>
      )}

      {/* 7. Renderizar presentaciones de Google Slides */}
      {googleSlidesItems.length > 0 && (
        <div className='w-full flex flex-col items-center max-w-5xl mx-auto'>
          {googleSlidesItems.map((item) => (
            <div key={item.id} className='w-full max-w-4xl mb-8'>
              <h2 className='text-xl font-semibold text-black w-full text-center mb-4'>
                {item.displayName}
              </h2>
              <GoogleSlidesRenderer item={item} />
            </div>
          ))}
        </div>
      )}

      {/* 8. Renderizar secciones si existen */}
      {sectionItems.length > 0 && (
        <SectionNavigation sections={sectionItems} level={level} />
      )}

      {/* 9. Renderizar otros elementos directos */}
      {otherDirectItems.length > 0 && (
        <div className='w-full mt-2'>
          <ContentGrid items={otherDirectItems} />
        </div>
      )}
    </div>
  );
}
