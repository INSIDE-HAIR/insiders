"use client";

import type React from "react";
import { memo, useCallback } from "react";
import { useContent } from "@/src/context/marketing-salon/content-context";
import { cn } from "@/src/lib/utils/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/src/components/ui/sidebar";

/**
 * AppSidebar
 *
 * Componente que muestra la barra lateral de navegación principal.
 * Permite seleccionar entre diferentes elementos de contenido.
 *
 * @returns Barra lateral de navegación con elementos seleccionables
 */
export const AppSidebar = memo(function AppSidebar() {
  const {
    getSidebarItems,
    navigationPath,
    addToNavigationPath,
    setNavigationPath,
  } = useContent();
  const sidebarItems = getSidebarItems();

  /**
   * Maneja el clic en un elemento del sidebar
   * Resetea la ruta de navegación y establece el elemento seleccionado
   *
   * @param {HierarchyItem} item - Elemento seleccionado
   * @param {React.MouseEvent} e - Evento del mouse
   */
  const handleSidebarItemClick = useCallback(
    (item: any, e?: React.MouseEvent) => {
      // Prevent default behavior if event is provided
      if (e) {
        e.preventDefault();
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
    },
    [setNavigationPath, addToNavigationPath]
  );

  // Si no hay elementos en el sidebar con contenido, no mostrar nada
  if (sidebarItems.length === 0) {
    return null;
  }

  return (
    <Sidebar
      variant='sidebar'
      className='bg-zinc-900 text-white border-r border-zinc-800 shadow-md'
      collapsible='offcanvas'
    >
      <SidebarContent className='bg-zinc-900 text-white overflow-y-auto pt-20'>
        <SidebarMenu>
          {sidebarItems.map((item) => {
            const isActive =
              navigationPath.length > 0 && navigationPath[0].id === item.id;

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  className={cn(
                    "h-12 px-6 py-3 rounded-none transition-colors text-left text-sm w-full",
                    isActive
                      ? "bg-[#CEFF66] border-l-4 border-l-[#CEFF66] text-zinc-900 font-medium"
                      : "hover:bg-zinc-800 hover:text-white border-l-4 border-l-transparent active:bg-[#CEFF66] active:text-zinc-900"
                  )}
                  onClick={(e) => handleSidebarItemClick(item, e)}
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
