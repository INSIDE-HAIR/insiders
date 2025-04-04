/**
 * DriveExplorer
 *
 * Página principal para explorar el contenido de Google Drive
 * y visualizar la jerarquía construida
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSession, signIn } from "next-auth/react";
import { Logger } from "@/src/features/drive/utils/logger";
import { ViewSelector } from "./components/views";
import { HierarchyItem } from "@drive/types/hierarchy";
import { useNotifications, Toaster } from "./components/ui";

const logger = new Logger("DriveExplorer");

// ID de la carpeta raíz desde variables de entorno
const ROOT_FOLDER_ID =
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ROOT_FOLDER_ID ||
  "19wn0b3uaOT81NVxQARXLht8Nbukn-0u_";

const DriveExplorer: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [folderDetails, setFolderDetails] = useState<{
    id: string;
    name: string;
    hierarchy: HierarchyItem[];
  } | null>(null);
  const [originalHierarchy, setOriginalHierarchy] = useState<HierarchyItem[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notifications = useNotifications();

  useEffect(() => {
    if (status === "authenticated") {
      fetchHierarchy();
    } else if (status === "unauthenticated") {
      signIn("google", { callbackUrl: "/drive" });
    }
  }, [status]);

  const fetchHierarchy = async () => {
    try {
      setIsLoading(true);
      const notificationId = notifications.addNotification(
        "loading",
        "Loading drive hierarchy..."
      );

      // Usar el mismo endpoint que la página de detalle
      const response = await fetch(
        `/api/drive/hierarchy/folder/${ROOT_FOLDER_ID}`
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
  };

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

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Drive Explorer</h1>
        <p className="mb-4">Please sign in to access Drive Explorer</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/drive" })}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Drive Explorer</h1>

        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchQueryChange}
              placeholder="Search in drive..."
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          /* Content View */
          folderDetails && (
            <div className="bg-white rounded-lg shadow">
              <ViewSelector
                hierarchy={folderDetails.hierarchy}
                onItemClick={handleItemClick}
              />
            </div>
          )
        )}
      </div>

      {/* Toaster para notificaciones */}
      <Toaster />
    </>
  );
};

export default DriveExplorer;
