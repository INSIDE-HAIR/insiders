"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSidebar } from "@/src/components/ui/sidebar";
import { useEffect, useState } from "react";

export function SidebarToggle() {
  const { toggleSidebar, openMobile, open } = useSidebar();
  const [isInIframe, setIsInIframe] = useState(false);

  // Verificar si el sidebar está abierto (en cualquier modo)
  const isSidebarOpen = openMobile || open;

  useEffect(() => {
    // Detectar si estamos en un iframe
    setIsInIframe(window.self !== window.top);
  }, []);

  // No mostrar este botón si:
  // - Estamos en un iframe o
  // - El sidebar ya está abierto
  if (isInIframe || isSidebarOpen) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="fixed z-50 bg-inside hover:bg-[#bfef33] text-zinc-900 shadow-lg rounded-full h-14 w-14 flex items-center justify-center md:hidden"
      title="Mostrar panel lateral"
      data-sidebar-regular-toggle="true"
      style={{
        position: "fixed",
        bottom: "5dvh", // Cambiado de top a bottom para ponerlo en la parte inferior
        left: "5%", // Usar porcentaje relativo al ancho
        transform: "translateZ(0)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        animation: "pulse 2s infinite",
      }}
    >
      <PanelLeft className="h-6 w-6" />
    </Button>
  );
}
