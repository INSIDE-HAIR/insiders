"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { HierarchyItem } from "@/src/features/drive/types/index";

interface NavigationPath {
  id: string;
  type: string;
  level: number;
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

// Función auxiliar para comprobar si un item tiene un prefix específico
const hasPrefix = (item: HierarchyItem, prefix: string): boolean => {
  return item.prefixes.some((p) => String(p) === prefix);
};

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para encontrar un elemento por su ID en toda la estructura - memoized
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

  // Modificar la función getSidebarItems para filtrar elementos sin contenido - memoized
  const getSidebarItems = useCallback((): HierarchyItem[] => {
    if (!contentData || contentData.length === 0) return [];

    // Asumimos que los elementos de la barra lateral están en el primer nivel
    // y tienen el prefijo 'sidebar'
    const clientFolder = contentData[0]; // Asumimos que el primer elemento es la carpeta del cliente
    return clientFolder.children
      .filter((item) => hasPrefix(item, "sidebar"))
      .filter((item) => hasContent(item)) // Filtrar elementos sin contenido
      .sort((a, b) => a.order - b.order);
  }, [contentData]);

  // Función genérica para obtener hijos de un elemento por tipo - memoized
  const getChildrenByType = useCallback(
    (parentId: string | null, type: string): HierarchyItem[] => {
      if (!parentId) {
        // Si no hay parentId, devolvemos los elementos de la barra lateral
        if (type === "sidebar") {
          return getSidebarItems();
        }
        return [];
      }

      const parent = getItemById(parentId);
      if (!parent) return [];

      // Buscar elementos directamente en los hijos
      const directChildren = parent.children.filter((item) =>
        hasPrefix(item, type)
      );
      if (directChildren.length > 0) {
        return directChildren.sort((a, b) => a.order - b.order);
      }

      // Si no hay hijos directos del tipo buscado, buscar en carpetas especiales
      // como "tabs" o "sections"
      const specialFolder = parent.children.find(
        (item) =>
          item.name.toLowerCase().includes(type) ||
          item.displayName.toLowerCase() === type
      );

      if (specialFolder) {
        return specialFolder.children
          .filter((item) => hasPrefix(item, type))
          .sort((a, b) => a.order - b.order);
      }

      return [];
    },
    [getItemById, getSidebarItems]
  );

  // Añadir un elemento a la ruta de navegación - memoized
  const addToNavigationPath = useCallback((item: NavigationPath) => {
    setNavigationPath((prev) => {
      // Eliminar todos los elementos después del nivel del nuevo elemento
      const newPath = prev.filter((p) => p.level < item.level);
      return [...newPath, item];
    });
    // No URL updates - sidebar navigation is completely independent
  }, []);

  // Eliminar elementos de la ruta de navegación después de un nivel específico - memoized
  const removeFromNavigationPathAfterLevel = useCallback((level: number) => {
    setNavigationPath((prev) => prev.filter((p) => p.level <= level));
  }, []);

  // Modificar la función selectFirstTab para que solo seleccione tabs no vacíos - memoized
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

  // Initialize navigation only once when the component mounts
  useEffect(() => {
    if (contentData.length > 0 && !isInitialized) {
      // Get all sidebar items
      const sidebarItems = getSidebarItems();

      // We'll still initialize with the first sidebar item
      // but after that, sidebar navigation will be independent of the URL
      if (sidebarItems.length > 0) {
        setNavigationPath([
          {
            id: sidebarItems[0].id,
            type: "sidebar",
            level: 0,
          },
        ]);

        // Only initialize tabs once
        setTimeout(() => {
          selectFirstTab(sidebarItems[0].id, 1);
          setIsInitialized(true);
        }, 0);
      }
    }
  }, [contentData, getSidebarItems, selectFirstTab, isInitialized]);

  // Provide memoized context value to prevent unnecessary rerenders
  const contextValue = useMemo(
    () => ({
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
    }),
    [
      contentData,
      navigationPath,
      routeParams,
      setNavigationPath,
      addToNavigationPath,
      removeFromNavigationPathAfterLevel,
      getItemById,
      getSidebarItems,
      getChildrenByType,
      selectFirstTab,
    ]
  );

  return (
    <ContentContext.Provider value={contextValue}>
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
