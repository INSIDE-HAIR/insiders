"use client";

import type React from "react";
import { memo, useCallback, useEffect } from "react";
import { useContent } from "@/src/context/DriveCompoentesContext";
import { cn } from "@/src/lib/utils/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/src/components/ui/sidebar";
import { SidebarCloseButton } from "./sidebar-close-button";

interface AppSidebarProps {
  isInIframe?: boolean;
}

/**
 * AppSidebar
 *
 * Componente que muestra la barra lateral de navegación principal.
 * Permite seleccionar entre diferentes elementos de contenido.
 *
 * @returns Barra lateral de navegación con elementos seleccionables
 */
export const AppSidebar = memo(function AppSidebar({
  isInIframe = false,
}: AppSidebarProps) {
  const {
    getSidebarItems,
    navigationPath,
    addToNavigationPath,
    setNavigationPath,
  } = useContent();
  const sidebarItems = getSidebarItems();

  // Fix for touch events on Android
  useEffect(() => {
    // Add passive touch listeners to improve performance
    document.addEventListener("touchstart", () => {}, { passive: true });
    document.addEventListener("touchmove", () => {}, { passive: true });

    return () => {
      document.removeEventListener("touchstart", () => {});
      document.removeEventListener("touchmove", () => {});
    };
  }, []);

  /**
   * Maneja el clic en un elemento del sidebar
   * Resetea la ruta de navegación y establece el elemento seleccionado
   *
   * @param {HierarchyItem} item - Elemento seleccionado
   * @param {React.MouseEvent} e - Evento del mouse
   */
  const handleSidebarItemClick = useCallback(
    (item: any, e?: React.MouseEvent | React.TouchEvent) => {
      // Prevent default behavior if event is provided
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Reset navigation path to just this sidebar item
      // This will completely override any URL-based navigation
      setNavigationPath([
        {
          id: item.id,
          type: "sidebar",
          level: 0,
        },
      ]);

      // Then add this sidebar item to the path
      addToNavigationPath({
        id: item.id,
        type: "sidebar",
        level: 0,
      });

      console.log("Clicked sidebar item:", item.displayName);
    },
    [setNavigationPath, addToNavigationPath]
  );

  // Si no hay elementos en el sidebar con contenido, no mostrar nada
  if (sidebarItems.length === 0) {
    return null;
  }

  return (
    <Sidebar
      variant="sidebar"
      className={`bg-zinc-900 text-white border-r border-zinc-800 shadow-md ${
        isInIframe ? "iframe-fixed" : "absolute"
      } z-40`}
      collapsible="offcanvas"
    >
      {/* Botón de cierre (X verde) */}
      <SidebarCloseButton />

      <SidebarContent className="bg-zinc-900 text-white overflow-y-auto pt-20">
        <SidebarMenu>
          {sidebarItems.map((item) => {
            const isActive =
              navigationPath.length > 0 && navigationPath[0].id === item.id;

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  className={cn(
                    "h-12 px-6 py-3 rounded-none transition-colors text-left text-sm w-full cursor-pointer touch-manipulation",
                    isActive
                      ? "bg-inside border-l-4 border-l-[#CEFF66] text-zinc-900 font-medium"
                      : "hover:bg-zinc-800 hover:text-white border-l-4 border-l-transparent active:bg-inside active:text-zinc-900"
                  )}
                  onClick={(e) => handleSidebarItemClick(item, e)}
                  onTouchEnd={(e) => handleSidebarItemClick(item, e)}
                  role="button"
                  tabIndex={0}
                >
                  {item.displayName}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
});
