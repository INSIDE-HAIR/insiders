/**
 * DriveExplorer
 *
 * Página principal para explorar el contenido de Google Drive
 * y visualizar la jerarquía construida
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Logger } from "@/src/features/drive/utils/logger";
import { ViewSelector } from "./components/views";
import { HierarchyItem } from "@drive/types/hierarchy";
import { useNotifications, Toaster } from "./components/ui";
import { UserSession } from "@/src/types/routes";
import { Button } from "@/src/components/ui/button";
import { Folder } from "lucide-react";
import TailwindGrid from "@/src/components/shared/grid/TailwindGrid";

const logger = new Logger("DriveExplorer");

// ID de la carpeta raíz desde variables de entorno
const ROOT_FOLDER_ID =
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ROOT_FOLDER_ID ||
  "19wn0b3uaOT81NVxQARXLht8Nbukn-0u_";

interface DriveExplorerClientProps {
  user: UserSession;
}

export const DriveExplorerClient: React.FC<DriveExplorerClientProps> = ({
  user,
}) => {
  const router = useRouter();
  const [folderDetails, setFolderDetails] = useState<{
    id: string;
    name: string;
    hierarchy: HierarchyItem[];
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalHierarchy, setOriginalHierarchy] = useState<HierarchyItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notifications = useNotifications();

  // Usar useRef para evitar que notifications cambie en cada renderizado
  const fetchHierarchy = useCallback(async () => {
    try {
      setIsLoading(true);
      const notificationId = notifications.addNotification(
        "loading",
        "Loading drive hierarchy..."
      );

      // Usar el mismo endpoint que la página de detalle
      const response = await fetch(
        `/api/drive/explorer/folder/${ROOT_FOLDER_ID}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch hierarchy");
      }
      const data = await response.json();

      // Asegurarse de que la jerarquía es un array
      const hierarchy = Array.isArray(data.hierarchy)
        ? data.hierarchy
        : [data.root];

      // Guardar la jerarquía original para búsquedas locales
      setOriginalHierarchy(hierarchy);

      setFolderDetails({
        id: data.id || ROOT_FOLDER_ID,
        name: data.name || "Drive Explorer",
        hierarchy: hierarchy,
      });

      setError(null);
      notifications.updateNotification(
        notificationId,
        "success",
        "Drive hierarchy loaded successfully"
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      notifications.addNotification("error", message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efecto que carga la jerarquía (ya tenemos usuario autenticado)
  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  // Función recursiva para filtrar elementos de la jerarquía
  const filterHierarchyItems = (
    items: HierarchyItem[],
    query: string
  ): HierarchyItem[] => {
    if (!query.trim()) return items;

    const normalizedQuery = query.toLowerCase();

    return items.reduce<HierarchyItem[]>((filtered, item) => {
      // Verificar si el nombre o la descripción coinciden con la búsqueda
      const nameMatch =
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.displayName.toLowerCase().includes(normalizedQuery);
      const descMatch = item.description
        ?.toLowerCase()
        .includes(normalizedQuery);

      if (nameMatch || descMatch) {
        // Si hay coincidencia, incluir el elemento completo
        filtered.push(item);
        return filtered;
      }

      // Para carpetas, buscar en los hijos recursivamente
      if (item.driveType === "folder" && item.children.length > 0) {
        const matchingChildren = filterHierarchyItems(item.children, query);

        if (matchingChildren.length > 0) {
          // Crear una copia de la carpeta pero solo con los hijos que coinciden
          filtered.push({
            ...item,
            children: matchingChildren,
          });
        }
      }

      return filtered;
    }, []);
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Ejecutar la búsqueda automáticamente después de establecer el query
    if (!query.trim()) {
      // Si la búsqueda está vacía, mostrar la jerarquía original
      if (folderDetails) {
        setFolderDetails({
          ...folderDetails,
          hierarchy: originalHierarchy,
          name: "Drive Explorer",
        });
      }
    } else {
      // Debouncing básico: solo buscar si hay algo escrito
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // Si la búsqueda está vacía, mostrar la jerarquía original
      if (folderDetails) {
        setFolderDetails({
          ...folderDetails,
          hierarchy: originalHierarchy,
          name: "Drive Explorer",
        });
      }
      return;
    }

    try {
      setIsLoading(true);

      // Filtrar la jerarquía localmente
      const results = filterHierarchyItems(originalHierarchy, searchQuery);

      setFolderDetails({
        id: ROOT_FOLDER_ID,
        name: `Search: ${searchQuery}`,
        hierarchy: results,
      });

      setError(null); // Limpiar errores previos
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      notifications.addNotification("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: HierarchyItem) => {
    if (item.driveType === "folder") {
      router.push(`/drive/${item.id}`);
    }
  };

  return (
    <div>
      <DocHeader
        title='Drive Explorer'
        description='Explora el contenido de Google Drive y visualiza la jerarquía construida'
        icon={Folder}
      />

      <DocContent>
        <TailwindGrid fullSize>
          <main className='col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-1 lg:col-end-13  order-2 md:order-1 z-30  col-span-full'>
            {/* Search Bar */}
            <div className='flex gap-2 mb-6'>
              <div className='relative flex-1'>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  placeholder='Search in drive...'
                  className='w-full px-4 py-2 pl-10 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                />
                <MagnifyingGlassIcon className='absolute left-3 top-2.5 h-5 w-5 text-muted-foreground' />
              </div>
              <button
                onClick={handleSearch}
                className='px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              >
                Search
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className='mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg'>
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className='flex justify-center items-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
              </div>
            ) : (
              /* Content View */
              folderDetails && (
                <div className='bg-card text-card-foreground border border-border rounded-lg shadow-sm'>
                  <ViewSelector
                    hierarchy={folderDetails.hierarchy}
                    onItemClick={handleItemClick}
                  />
                </div>
              )
            )}
          </main>
        </TailwindGrid>

        {/* Toaster para notificaciones */}
        <Toaster />
      </DocContent>
    </div>
  );
};
