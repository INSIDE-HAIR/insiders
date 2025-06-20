"use client";

import React, { memo } from "react";
import { useSession } from "next-auth/react";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { RecursiveContentRenderer } from "@/src/components/drive/content/recursive-content-renderer";
import { ContentGrid } from "@/src/components/drive/content/content-grid";
import { DirectFileUploadManager } from "@/src/components/drive/upload/DirectFileUploadManager";
import { TrueDirectUploadZone } from "@/src/components/drive/upload/TrueDirectUploadZone";

import { hasPrefix } from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

interface SectionNavigationProps {
  sections: HierarchyItem[];
  level: number;
  isInIframe?: boolean;
  onContentUpdated?: () => void;
}

/**
 * SectionNavigation
 *
 * Componente que gestiona la navegación por secciones.
 * Muestra las secciones disponibles y su contenido.
 *
 * @param {HierarchyItem[]} sections - Lista de elementos de sección
 * @param {number} level - Nivel de profundidad en la jerarquía
 * @param {boolean} isInIframe - Indica si el contenido se está renderizando en un iframe
 * @param {function} onContentUpdated - Callback para refrescar el contenido cuando hay cambios
 * @returns Componente de navegación por secciones
 */
export const SectionNavigation = memo(function SectionNavigation({
  sections,
  level,
  isInIframe = false,
  onContentUpdated,
}: SectionNavigationProps) {
  return (
    <div className='w-full px-4'>
      {/* Renderizar cada sección con su contenido */}
      <div className='space-y-2'>
        {sections.map((section) => (
          <SectionWithContent
            key={section.id}
            section={section}
            level={level}
            isInIframe={isInIframe}
            onContentUpdated={onContentUpdated}
          />
        ))}
      </div>
    </div>
  );
});

interface SectionWithContentProps {
  section: HierarchyItem;
  level: number;
  isInIframe?: boolean;
  onContentUpdated?: () => void;
}

/**
 * SectionWithContent
 *
 * Componente que muestra una sección individual con su contenido.
 * Puede renderizar subsecciones recursivamente o mostrar el contenido directamente.
 *
 * @param {HierarchyItem} section - Elemento de sección a mostrar
 * @param {number} level - Nivel de profundidad en la jerarquía
 * @param {boolean} isInIframe - Indica si el contenido se está renderizando en un iframe
 * @param {function} onContentUpdated - Callback para refrescar el contenido cuando hay cambios
 * @returns Componente de sección con su contenido
 */
const SectionWithContent = memo(function SectionWithContent({
  section,
  level,
  isInIframe = false,
  onContentUpdated,
}: SectionWithContentProps) {
  const { data: session } = useSession();

  // Obtener los elementos hijos de la sección
  const sectionItems = section.children.sort((a, b) => a.order - b.order);

  // Verificar si el usuario es admin
  const isAdmin = session?.user?.role === "ADMIN";

  // Debug logging temporal
  if (isAdmin) {
    console.log(
      `SectionWithContent - Section: ${section.displayName}, ID: ${section.id}`
    );
  }

  return (
    <div className='flex flex-col w-full items-center'>
      <h2 className='text-xl font-semibold text-black w-full text-center m-4'>
        {section.displayName}
      </h2>

      <div className='w-full'>
        {/* Si la sección tiene subsecciones, renderizarlas recursivamente */}
        {sectionItems.some((item) => hasPrefix(item, "section")) ? (
          <RecursiveContentRenderer
            level={level + 1}
            parentId={section.id}
            parentType='section'
            isInIframe={isInIframe}
            onContentUpdated={onContentUpdated}
          />
        ) : (
          /* Si no tiene subsecciones, renderizar el contenido directamente */
          <ContentGrid
            items={sectionItems}
            onContentUpdated={onContentUpdated}
          />
        )}
      </div>

      {/* Drop zone debajo de cada section (solo para administradores) */}
      {isAdmin && (
        <div className='w-full mt-4 mb-2 border border-zinc-500 rounded-lg shadow-lg py-5 px-5 bg-zinc-100'>
          <div className='text-center font-bold text-black mb-2 tracking-wide'>
            📁 ZONA DE CARGA • {section.displayName.toUpperCase()}
          </div>
          <DirectFileUploadManager
            folderId={section.id}
            folderName={section.displayName}
            className='max-w-lg mx-auto'
          />
        </div>
      )}
    </div>
  );
});
