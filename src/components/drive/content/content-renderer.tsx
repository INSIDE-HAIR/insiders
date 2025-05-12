"use client";

import React, { memo } from "react";
import { useContent } from "@/src/context/DriveCompoentesContext";
import { ContentHeader } from "@/src/components/drive/layout/content-header";
import { RecursiveContentRenderer } from "@/src/components/drive/content/recursive-content-renderer";
import { useSidebar } from "@/src/components/ui/sidebar";

/**
 * ContentRenderer
 *
 * Componente principal que inicia la renderización del contenido.
 * Actúa como punto de entrada para la visualización de contenido seleccionado
 * en la navegación. Muestra el encabezado y el contenido principal.
 *
 * Utiliza RecursiveContentRenderer para mostrar el contenido de forma jerárquica.
 *
 * @returns El contenido completo con encabezado y área de contenido
 */
export const ContentRenderer = memo(function ContentRenderer({
  isInIframe = false,
}: {
  isInIframe?: boolean;
}) {
  const { navigationPath, getItemById } = useContent();
  const { open: sidebarOpen } = useSidebar();

  // Si no hay elementos seleccionados, mostrar mensaje
  if (navigationPath.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No hay contenido disponible</p>
      </div>
    );
  }

  // Obtener el elemento de la barra lateral seleccionado
  const sidebarItem = getItemById(navigationPath[0].id);
  if (!sidebarItem) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No hay contenido disponible</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${
        isInIframe ? "h-full" : "h-full"
      } overflow-hidden`}
    >
      <ContentHeader title={sidebarItem.displayName} />
      <div
        className={`flex-1 overflow-auto bg-white ${
          isInIframe ? "max-h-full pt-2" : ""
        }`}
        style={{
          marginTop: isInIframe ? "100px" : "0",
          paddingTop: isInIframe ? "10px" : "0",
          transition: "margin-left 0.3s ease",
        }}
      >
        <div
          className={`w-full overflow-visible py-6 ${
            isInIframe ? "pb-6" : "pb-[120px]"
          }`}
        >
          <RecursiveContentRenderer
            level={1}
            parentId={navigationPath[0].id}
            parentType="sidebar"
            isInIframe={isInIframe}
          />
        </div>
      </div>
    </div>
  );
});
