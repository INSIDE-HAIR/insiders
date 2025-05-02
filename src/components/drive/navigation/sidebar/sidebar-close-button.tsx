"use client";

import { X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSidebar } from "@/src/components/ui/sidebar";
import { useEffect, useState } from "react";

export function SidebarCloseButton() {
  const { toggleSidebar, openMobile, open } = useSidebar();
  const [isInIframe, setIsInIframe] = useState(false);

  // Verificar si el sidebar está abierto (en cualquier modo)
  const isSidebarOpen = openMobile || open;

  useEffect(() => {
    // Detectar si estamos en un iframe
    setIsInIframe(window.self !== window.top);
  }, []);

  // No mostrar el botón si el sidebar está cerrado
  if (!isSidebarOpen) {
    return null;
  }

  // Determinar la clase según si estamos en un iframe o no
  const buttonClassName = isInIframe
    ? "absolute top-4 right-4 bg-inside hover:bg-[#bfef33] text-zinc-900 shadow-md rounded-full flex items-center justify-center z-50 sidebar-close-button-iframe"
    : "absolute top-4 right-4 bg-inside hover:bg-[#bfef33] text-zinc-900 shadow-md rounded-full flex items-center justify-center z-50";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={buttonClassName}
      title="Cerrar panel lateral"
      data-sidebar-close-button="true"
      style={{
        width: "32px",
        height: "32px",
        margin: "8px", // Agregar margen alrededor del botón
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
      }}
    >
      <X className="h-5 w-5" />
    </Button>
  );
}
