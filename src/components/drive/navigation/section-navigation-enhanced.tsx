"use client";

import React, { memo } from "react";
import { useSession } from "next-auth/react";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { RecursiveContentRenderer } from "@/src/components/drive/content/recursive-content-renderer";
import { ContentGrid } from "@/src/components/drive/content/content-grid";
import { EnhancedFileUploadManager } from "@/src/components/drive/upload/EnhancedFileUploadManager";
import { hasPrefix } from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

interface SectionNavigationProps {
  sections: HierarchyItem[];
  level: number;
  isInIframe?: boolean;
  onContentUpdated?: () => void;
}

/**
 * SectionNavigation (Enhanced Version)
 *
 * Componente que gestiona la navegación por secciones con sistema de carga mejorado.
 * Muestra las secciones disponibles y su contenido.
 *
 * MEJORAS:
 * - Usa EnhancedFileUploadManager (sin modal)
 * - Mejor feedback al usuario cuando se suben archivos
 * - Gestión más eficiente de la carga de archivos
 *
 * @param {HierarchyItem[]} sections - Lista de elementos de sección
 * @param {number} level - Nivel de profundidad en la jerarquía
 * @param {boolean} isInIframe - Indica si el contenido se está renderizando en un iframe
 * @param {function} onContentUpdated - Callback para refrescar el contenido cuando hay cambios
 * @returns Componente de navegación por secciones mejorado
 */
export const SectionNavigationEnhanced = memo(
  function SectionNavigationEnhanced({
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
            <SectionWithContentEnhanced
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
  }
);

interface SectionWithContentProps {
  section: HierarchyItem;
  level: number;
  isInIframe?: boolean;
  onContentUpdated?: () => void;
}

/**
 * SectionWithContent (Enhanced Version)
 *
 * Componente que muestra una sección individual con su contenido.
 * Puede renderizar subsecciones recursivamente o mostrar el contenido directamente.
 *
 * MEJORAS:
 * - Sistema de carga sin modal más fluido
 * - Mejor callback de actualización de contenido
 * - Experiencia de usuario mejorada
 *
 * @param {HierarchyItem} section - Elemento de sección a mostrar
 * @param {number} level - Nivel de profundidad en la jerarquía
 * @param {boolean} isInIframe - Indica si el contenido se está renderizando en un iframe
 * @param {function} onContentUpdated - Callback para refrescar el contenido cuando hay cambios
 * @returns Componente de sección con su contenido mejorado
 */
const SectionWithContentEnhanced = memo(function SectionWithContentEnhanced({
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

  // Callback mejorado para cuando se completa la carga
  const handleUploadComplete = (uploadedFiles: any[]) => {
    console.log(
      `✅ Se subieron ${uploadedFiles.length} archivo(s) a la sección: ${section.displayName}`
    );

    // Refrescar el contenido de la sección
    if (onContentUpdated) {
      onContentUpdated();
    }

    // Aquí podrías añadir más lógica como:
    // - Mostrar notificación toast
    // - Analytics/logging
    // - Sincronización con otros sistemas
  };

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

      {/* Drop zone mejorado debajo de cada section (solo para administradores) */}
      {isAdmin && (
        <div className='w-full mt-4 mb-2'>
          <div className='text-center text-xs text-gray-500 mb-2'>
            📁 Zona de carga mejorada para: {section.displayName}
          </div>
          {/* 🆕 NUEVO: EnhancedFileUploadManager sin modal */}
          <EnhancedFileUploadManager
            folderId={section.id}
            folderName={section.displayName}
            className='max-w-md mx-auto'
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}
    </div>
  );
});

// Exportar también la versión original para compatibilidad
export { SectionNavigation } from "./section-navigation";
