"use client";
import { useEffect, useState, memo } from "react";
import { AppSidebar } from "@/src/components/marketing-salon/navigation/sidebar/app-sidebar";
import { ContentRenderer } from "@/src/components/marketing-salon/content/content-renderer";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import { SidebarToggle } from "@/src/components/marketing-salon/navigation/sidebar/sidebar-toggle";

/**
 * ContentLayout
 *
 * Componente principal que estructura el layout de la aplicación.
 * Incluye la barra lateral, el área de contenido y el botón para mostrar/ocultar
 * la barra lateral en dispositivos móviles.
 *
 * Gestiona el estado de la barra lateral según el tamaño de la pantalla.
 *
 * @returns Layout principal de la aplicación
 */
const ContentLayout = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
    <SidebarProvider defaultOpen={isLargeScreen}>
      <div className='flex h-screen w-full overflow-hidden bg-zinc-900 text-zinc-100'>
        <AppSidebar />
        <div className='flex-1 h-full overflow-hidden'>
          <ContentRenderer />
        </div>
        <SidebarToggle />
      </div>
    </SidebarProvider>
  );
};

export default memo(ContentLayout);
