"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { HierarchyItem } from "@/src/features/drive/types/hierarchy";
import { Prefix } from "@/src/features/drive/types/prefix";

interface NavigationPath {
  id: string;
  type: string;
  level: number;
  name?: string;
}

interface RouteParams {
  id: string;
}

interface ContentContextProps {
  contentData: HierarchyItem[];
  navigationPath: NavigationPath[];
  routeParams: RouteParams | null;
  setNavigationPath: (path: NavigationPath[]) => void;
  addToNavigationPath: (item: NavigationPath) => void;
  removeFromNavigationPathAfterLevel: (level: number) => void;
  getItemById: (id: string) => HierarchyItem | undefined;
  getSidebarItems: () => HierarchyItem[];
  getChildrenByType: (parentId: string | null, type: string) => HierarchyItem[];
  selectFirstTab: (parentId: string, level: number) => void;
}

const ContentContext = createContext<ContentContextProps | undefined>(
  undefined
);

// Función auxiliar para determinar si un elemento tiene contenido real
function hasContent(item: HierarchyItem): boolean {
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

/**
 * ContentContext
 *
 * Contexto principal que gestiona el estado del contenido en toda la aplicación.
 * Proporciona funciones para:
 * - Obtener elementos del sidebar
 * - Gestionar la ruta de navegación
 * - Obtener elementos por ID o tipo
 * - Filtrar y ordenar elementos
 *
 * Todos los componentes que necesitan acceder a los datos de contenido
 * deben usar este contexto a través del hook useContent().
 */
export const ContentProvider: React.FC<{
  children: React.ReactNode;
  initialData: HierarchyItem[];
  routeParams?: RouteParams;
}> = ({ children, initialData, routeParams }) => {
  const [contentData, setContentData] = useState<HierarchyItem[]>(initialData);
  const [navigationPath, setNavigationPath] = useState<NavigationPath[]>([]);

  // Función para encontrar un elemento por su ID en toda la estructura
  const getItemById = useCallback(
    (id: string): HierarchyItem | undefined => {
      const findItem = (items: HierarchyItem[]): HierarchyItem | undefined => {
        for (const item of items) {
          if (item.id === id) return item;
          if (item.children.length > 0) {
            const found = findItem(item.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      return findItem(contentData);
    },
    [contentData]
  );

  // Modificar la función getSidebarItems para filtrar elementos sin contenido
  const getSidebarItems = useCallback((): HierarchyItem[] => {
    if (!contentData || contentData.length === 0) return [];

    // Asumimos que los elementos de la barra lateral están en el primer nivel
    // y tienen el prefijo 'sidebar'
    const clientFolder = contentData[0]; // Asumimos que el primer elemento es la carpeta del cliente
    return clientFolder.children
      .filter((item) => item.prefixes.includes(Prefix.SIDEBAR))
      .filter((item) => hasContent(item)) // Filtrar elementos sin contenido
      .sort((a, b) => a.order - b.order);
  }, [contentData]);

  // Función genérica para obtener hijos de un elemento por tipo
  const getChildrenByType = useCallback(
    (parentId: string | null, type: string): HierarchyItem[] => {
      const parent = parentId ? getItemById(parentId) : contentData[0];

      if (!parent) return [];

      return parent.children
        .filter((item) => item.prefixes.includes(type as unknown as Prefix))
        .filter((item) => hasContent(item))
        .sort((a, b) => a.order - b.order);
    },
    [contentData, getItemById]
  );

  // Añadir un elemento a la ruta de navegación
  const addToNavigationPath = useCallback((item: NavigationPath) => {
    setNavigationPath((prev) => {
      // Eliminar todos los elementos después del nivel del nuevo elemento
      const newPath = prev.filter((p) => p.level < item.level);
      return [...newPath, item];
    });
    // No URL updates - sidebar navigation is completely independent
  }, []);

  // Eliminar elementos de la ruta de navegación después de un nivel específico
  const removeFromNavigationPathAfterLevel = useCallback((level: number) => {
    setNavigationPath((prev) => prev.filter((p) => p.level <= level));
  }, []);

  // Modificar la función selectFirstTab para que solo seleccione tabs no vacíos
  const selectFirstTab = useCallback(
    (parentId: string, level: number) => {
      const tabs = getChildrenByType(parentId, "tab");

      // Filtrar tabs vacíos
      const nonEmptyTabs = tabs.filter((tab) => hasContent(tab));

      if (nonEmptyTabs.length > 0) {
        addToNavigationPath({
          id: nonEmptyTabs[0].id,
          type: "tab",
          level: level,
        });

        // Recursivamente seleccionar el primer tab del tab seleccionado
        selectFirstTab(nonEmptyTabs[0].id, level + 1);
      }
    },
    [getChildrenByType, addToNavigationPath]
  );

  // Efecto para seleccionar automáticamente el primer elemento de la barra lateral al iniciar
  useEffect(() => {
    // Si no hay elementos en la ruta, seleccionar el primer elemento de la barra lateral
    if (navigationPath.length === 0) {
      const sidebarItems = getSidebarItems();
      if (sidebarItems.length > 0) {
        const firstItem = sidebarItems[0];
        setNavigationPath([
          {
            id: firstItem.id,
            type: "sidebar",
            name: firstItem.displayName,
            level: 0,
          },
        ]);
        selectFirstTab(firstItem.id, 1);
      }
    }
  }, [navigationPath, setNavigationPath, getSidebarItems, selectFirstTab]);

  // Efecto para seleccionar automáticamente el primer tab al seleccionar un elemento
  // el primer tab del último elemento seleccionado
  useEffect(() => {
    if (navigationPath.length > 0) {
      const lastItem = navigationPath[navigationPath.length - 1];

      // Solo seleccionar automáticamente si el último elemento es un sidebar o un tab
      if (lastItem.type === "sidebar" || lastItem.type === "tab") {
        // Verificar si ya hay un tab seleccionado en el siguiente nivel
        const nextLevel = lastItem.level + 1;
        const hasNextLevelSelected = navigationPath.some(
          (item) => item.level === nextLevel
        );

        // Si no hay un tab seleccionado en el siguiente nivel, seleccionar el primero
        if (!hasNextLevelSelected) {
          selectFirstTab(lastItem.id, nextLevel);
        }
      }
    }
  }, [navigationPath, selectFirstTab]);

  return (
    <ContentContext.Provider
      value={{
        contentData,
        navigationPath,
        routeParams: routeParams || null,
        setNavigationPath,
        addToNavigationPath,
        removeFromNavigationPathAfterLevel,
        getItemById,
        getSidebarItems,
        getChildrenByType,
        selectFirstTab,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
