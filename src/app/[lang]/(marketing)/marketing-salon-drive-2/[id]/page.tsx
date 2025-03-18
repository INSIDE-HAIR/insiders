"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchFolderById } from "../_components";
import HierarchyComponentsSelector from "@/src/components/shared/hierarchy-components-selector/hierarchy-components-selector";
import LoadingIndicator from "@/src/components/shared/ui/loading-indicator";
import ErrorDisplay from "@/src/components/shared/ui/error-display";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/types/drive";

export default function FolderDetailsPage() {
  const params = useParams() || {};
  const router = useRouter();
  const folderId = params.id as string;

  const [folderDetails, setFolderDetails] = useState<any>(null);
  const [hierarchyData, setHierarchyData] = useState<HierarchyItem | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar detalles de la carpeta
  useEffect(() => {
    const loadFolderDetails = async () => {
      if (!folderId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await fetchFolderById(folderId);
        setFolderDetails(data);

        // Obtener la estructura jerárquica desde la respuesta
        if (data && "hierarchyMap" in data) {
          setHierarchyData(data.hierarchyMap as HierarchyItem);
        }
      } catch (err) {
        console.error("Error al cargar detalles de carpeta:", err);
        setError("No se pudieron cargar los detalles de la carpeta");
      } finally {
        setLoading(false);
      }
    };

    loadFolderDetails();
  }, [folderId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleNavigate = (itemId: string) => {
    router.push(`/marketing-salon-drive-2/${itemId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Contenido de carpeta</h1>
          <button
            onClick={handleGoBack}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
          >
            ← Volver
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingIndicator />
          </div>
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : (
          <div className="space-y-6">
            {/* Información básica de la carpeta */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium mb-2">
                Información de la carpeta
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <span className="font-medium">Nombre:</span>{" "}
                    {folderDetails?.name || "No disponible"}
                  </p>
                  <p>
                    <span className="font-medium">ID:</span> {folderId}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Tipo:</span>{" "}
                    {folderDetails?.type || "No disponible"}
                  </p>
                  <p>
                    <span className="font-medium">Elementos:</span>{" "}
                    {hierarchyData?.childrens?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Visualizador de jerarquía */}
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-4">Contenido Jerárquico</h2>
              {hierarchyData ? (
                <div className="border rounded-lg p-4 bg-white">
                  <HierarchyComponentsSelector
                    item={hierarchyData}
                    marketingCards={folderDetails?.marketingCards}
                    onNavigate={handleNavigate}
                    accordionMode={true}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos jerárquicos disponibles
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
