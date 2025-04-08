"use client";

import { useEffect, useCallback, memo } from "react";
import { useContent } from "@/src/context/marketing-salon/content-context";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { cn } from "@/src/lib/utils/utils";

interface TabNavigationProps {
  items: HierarchyItem[];
  level: number;
  currentId?: string;
}

/**
 * TabNavigation
 *
 * Componente que gestiona la navegación por pestañas.
 * Muestra las pestañas disponibles y maneja la selección de pestañas activas.
 *
 * @param {HierarchyItem[]} items - Lista de elementos de pestaña
 * @param {number} level - Nivel de profundidad en la jerarquía
 * @param {string} currentId - ID de la pestaña actualmente seleccionada
 * @returns Componente de navegación por pestañas
 */
export const TabNavigation = memo(function TabNavigation({
  items,
  level,
  currentId,
}: TabNavigationProps) {
  const { addToNavigationPath } = useContent();

  // Filtrar tabs sin contenido real y ordenarlos
  const activeAndOrderedTabs = items
    .filter((tab) => hasContent(tab))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleTabClick = useCallback(
    (item: HierarchyItem) => {
      addToNavigationPath({
        id: item.id,
        type: "tab",
        level: level,
      });
    },
    [addToNavigationPath, level]
  );

  // Seleccionar automáticamente el primer tab si no hay ninguno seleccionado
  useEffect(() => {
    if (!currentId && activeAndOrderedTabs.length > 0) {
      handleTabClick(activeAndOrderedTabs[0]);
    }
  }, [currentId, activeAndOrderedTabs, handleTabClick]);

  // Si no hay tabs con contenido, no renderizar nada
  if (activeAndOrderedTabs.length === 0) return null;

  return (
    <div className='w-full mb-6 max-w-md mx-auto'>
      <div className='flex flex-wrap h-full bg-transparent text-white border-none overflow-x-auto w-full justify-center'>
        {activeAndOrderedTabs.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item)}
            className={cn(
              "py-3 px-4 text-sm font-medium transition-colors relative whitespace-nowrap rounded-none",
              currentId === item.id
                ? "bg-[#CEFF66] text-zinc-900 font-semibold"
                : "bg-zinc-700 text-white hover:bg-zinc-600"
            )}
          >
            {item.displayName}
          </button>
        ))}
      </div>
    </div>
  );
});

/**
 * Función auxiliar para determinar si un elemento tiene contenido real
 *
 * @param {HierarchyItem} item - Elemento a verificar
 * @returns {boolean} True si el elemento tiene contenido, false en caso contrario
 */
export function hasContent(item: HierarchyItem): boolean {
  // Si es un archivo, tiene contenido
  if (item.driveType === "file") {
    return true;
  }

  // Si es una carpeta, verificar si tiene hijos con contenido
  if (item.children.length === 0) {
    return false;
  }

  // Si tiene archivos directos, tiene contenido
  if (item.children.some((child) => child.driveType === "file")) {
    return true;
  }

  // Si tiene carpetas hijas, verificar recursivamente si alguna tiene contenido
  return item.children.some((child) => hasContent(child));
}
