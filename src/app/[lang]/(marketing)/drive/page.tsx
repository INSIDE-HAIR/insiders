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
import { FolderIcon } from "@heroicons/react/24/solid";
import { useSession, signIn } from "next-auth/react";
import { Logger } from "@/src/features/drive/utils/logger";

const logger = new Logger("DriveExplorer");

interface Folder {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

const DriveExplorer: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFolders();
    } else if (status === "unauthenticated") {
      signIn("google", { callbackUrl: "/drive" });
    }
  }, [status]);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/drive/folders");
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      const data = await response.json();

      // Obtener la jerarquía completa para cada carpeta
      const foldersWithHierarchy = await Promise.all(
        data.map(async (folder: any) => {
          const hierarchyResponse = await fetch(
            `/api/drive/folders/${folder.id}/hierarchy`
          );
          if (hierarchyResponse.ok) {
            const hierarchyData = await hierarchyResponse.json();
            return hierarchyData.hierarchy[0]; // Tomamos el primer elemento ya que viene en array
          }
          return folder;
        })
      );

      setFolders(foldersWithHierarchy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchFolders();
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/drive/folders/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("Failed to search folders");
      }
      const data = await response.json();

      // Obtener la jerarquía completa para los resultados de búsqueda
      const foldersWithHierarchy = await Promise.all(
        data.map(async (folder: any) => {
          const hierarchyResponse = await fetch(
            `/api/drive/folders/${folder.id}/hierarchy`
          );
          if (hierarchyResponse.ok) {
            const hierarchyData = await hierarchyResponse.json();
            return hierarchyData.hierarchy[0];
          }
          return folder;
        })
      );

      setFolders(foldersWithHierarchy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Drive Explorer</h1>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search folders..."
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
        /* Folder List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => router.push(`/drive/${folder.id}`)}
            >
              <div className="flex items-center gap-3">
                <FolderIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-medium">{folder.name}</h3>
                  <p className="text-sm text-gray-500">
                    Last modified:{" "}
                    {new Date(folder.modifiedTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriveExplorer;
