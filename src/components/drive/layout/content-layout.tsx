"use client";
import { useEffect, useState, memo } from "react";
import { AppSidebar } from "@/src/components/drive/navigation/sidebar/app-sidebar";
import { ContentRenderer } from "@/src/components/drive/content/content-renderer";
import { SidebarProvider } from "@/src/components/ui/sidebar";

/**
 * ContentLayout
 *
 * Componente principal que estructura el layout de la aplicación.
 * Incluye la barra lateral y el área de contenido.
 * El botón para mostrar/ocultar la barra lateral está en el header.
 *
 * Gestiona el estado de la barra lateral según el tamaño de la pantalla.
 *
 * @returns Layout principal de la aplicación
 */
const ContentLayout = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Detect if we're in an iframe
    setIsInIframe(window.self !== window.top);

    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    // Comprobar el tamaño inicial
    checkScreenSize();

    // Configurar listener para cambios de tamaño
    window.addEventListener("resize", checkScreenSize);

    // Limpiar al desmontar
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  if (!isMounted) {
    return null; // Evitar renderizado en servidor
  }

  return (
    <SidebarProvider defaultOpen={isInIframe ? false : isLargeScreen}>
      <div
        className={`flex w-full overflow-hidden bg-white text-zinc-100 relative ${
          isInIframe ? "iframe-container" : ""
        }`}
        style={{
          height: isInIframe ? "100%" : "100vh",
          minHeight: isInIframe ? "auto" : "100vh",
          maxHeight: isInIframe ? "100%" : "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <AppSidebar isInIframe={isInIframe} />
        <div
          className={`flex-1 h-full overflow-hidden bg-white ${
            isInIframe ? "w-full iframe-content-container" : ""
          }`}
          style={{
            position: isInIframe ? "relative" : "static",
          }}
        >
          <ContentRenderer isInIframe={isInIframe} />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default memo(ContentLayout);
