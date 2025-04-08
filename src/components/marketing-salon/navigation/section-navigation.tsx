"use client";

import React, { memo } from "react";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { RecursiveContentRenderer } from "@/src/components/marketing-salon/content/recursive-content-renderer";
import { ContentGrid } from "@/src/components/marketing-salon/content/content-grid";
import { hasPrefix } from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

interface SectionNavigationProps {
  sections: HierarchyItem[];
  level: number;
}

/**
 * SectionNavigation
 *
 * Componente que gestiona la navegación por secciones.
 * Muestra las secciones disponibles y su contenido.
 *
 * @param {HierarchyItem[]} sections - Lista de elementos de sección
 * @param {number} level - Nivel de profundidad en la jerarquía
 * @returns Componente de navegación por secciones
 */
export const SectionNavigation = memo(function SectionNavigation({
  sections,
  level,
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
          />
        ))}
      </div>
    </div>
  );
});

interface SectionWithContentProps {
  section: HierarchyItem;
  level: number;
}

/**
 * SectionWithContent
 *
 * Componente que muestra una sección individual con su contenido.
 * Puede renderizar subsecciones recursivamente o mostrar el contenido directamente.
 *
 * @param {HierarchyItem} section - Elemento de sección a mostrar
 * @param {number} level - Nivel de profundidad en la jerarquía
 * @returns Componente de sección con su contenido
 */
const SectionWithContent = memo(function SectionWithContent({
  section,
  level,
}: SectionWithContentProps) {
  // Obtener los elementos hijos de la sección
  const sectionItems = section.children.sort((a, b) => a.order - b.order);

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
          />
        ) : (
          /* Si no tiene subsecciones, renderizar el contenido directamente */
          <ContentGrid items={sectionItems} />
        )}
      </div>
    </div>
  );
});
