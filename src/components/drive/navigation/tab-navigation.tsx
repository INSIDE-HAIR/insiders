"use client";

import { useEffect, useCallback, memo } from "react";
import { useContent } from "@/src/context/DriveComponentsContext";
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

  const handleTabInteraction = useCallback(
    (item: HierarchyItem, event?: React.MouseEvent | React.TouchEvent) => {
      // Prevent default events to avoid issues with touch devices
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      console.log("Tab interaction with:", item.displayName);

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
      handleTabInteraction(activeAndOrderedTabs[0]);
    }
  }, [currentId, activeAndOrderedTabs, handleTabInteraction]);

  // Si no hay tabs con contenido, no renderizar nada
  if (activeAndOrderedTabs.length === 0) return null;

  return (
    <div className='w-full mb-6 max-w-md mx-auto'>
      <div className='flex flex-wrap h-full bg-transparent text-white border-none overflow-x-auto w-full justify-center'>
        {activeAndOrderedTabs.map((item) => (
          <button
            key={item.id}
            onClick={(e) => handleTabInteraction(item, e)}
            onTouchEnd={(e) => handleTabInteraction(item, e)}
            className={cn(
              "py-3 px-4 text-sm font-medium transition-colors relative whitespace-nowrap rounded-none cursor-pointer touch-manipulation",
              currentId === item.id
                ? "bg-inside text-zinc-900 font-semibold"
                : "bg-zinc-700 text-white hover:bg-zinc-600 active:bg-zinc-600"
            )}
            role='tab'
            aria-selected={currentId === item.id}
            tabIndex={0}
            style={{ WebkitTapHighlightColor: "transparent" }}
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
  console.log(`Evaluando hasContent para: ${item.displayName}`, item);

  // Si es un archivo, siempre tiene contenido
  if (item.driveType === "file") {
    return true;
  }

  // Si no tiene hijos, no tiene contenido
  if (item.children.length === 0) {
    return false;
  }

  // Para "Donde ponerlo", solo mostrar si tiene archivos directos
  if (item.displayName.includes("Donde ponerlo")) {
    const hasFiles = item.children.some((child) => child.driveType === "file");
    console.log(`"Donde ponerlo" (${item.id}): tiene archivos? ${hasFiles}`);
    return hasFiles;
  }

  // Comprobar si tiene archivos directos (excluir carpetas)
  const hasFiles = item.children.some((child) => child.driveType === "file");

  // Si todos sus hijos son carpetas, verificar si alguna tiene contenido válido
  // (excluyendo carpetas "Donde ponerlo" que no tengan archivos)
  const hasValidFolders = item.children
    .filter(
      (child) =>
        // Solo considerar carpetas
        child.driveType === "folder" &&
        // Excluir "Donde ponerlo" sin archivos
        !(
          child.displayName.includes("Donde ponerlo") &&
          !child.children.some((grandchild) => grandchild.driveType === "file")
        )
    )
    .some(
      (validFolder) =>
        // Debe tener contenido válido
        !validFolder.displayName.includes("Donde ponerlo") &&
        hasContent(validFolder)
    );

  const result = hasFiles || hasValidFolders;
  console.log(
    `Resultado para ${item.displayName}: ${result} (archivos: ${hasFiles}, carpetas válidas: ${hasValidFolders})`
  );

  return result;
}
