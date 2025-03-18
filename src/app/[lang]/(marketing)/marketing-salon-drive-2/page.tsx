"use client";

import React, { useState } from "react";
import { FolderNavigation } from "./_components";

// Componente principal de la página
export default function MarketingSalonDrive2Page() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Manejador para cuando se selecciona una carpeta (desde cualquiera de los métodos)
  const handleFolderSelected = (folderId: string, folderPath: string) => {
    console.log("Carpeta seleccionada:", folderId, folderPath);
    setSelectedFolderId(folderId);
  };

  // Eliminamos el useEffect que leía parámetros de URL al cargar la página

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Marketing Salon Drive</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Selector de carpetas con vista previa integrada */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <FolderNavigation onFolderSelected={handleFolderSelected} />
          </div>
        </div>
      </div>
    </div>
  );
}
