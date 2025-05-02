"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSidebar } from "@/src/components/ui/sidebar";
import { useEffect, useState } from "react";

export function SidebarToggle() {
  const { toggleSidebar, openMobile, open } = useSidebar();
  const [isInIframe, setIsInIframe] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Verificar si el sidebar está abierto (en cualquier modo)
  const isSidebarOpen = openMobile || open;

  useEffect(() => {
    // Detectar si estamos en un iframe
    setIsInIframe(window.self !== window.top);

    // Obtener altura real del viewport y actualizarla si cambia
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    // Actualizar al inicio y cuando cambie el tamaño
    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);

    // También actualizar en orientación change en móviles
    window.addEventListener("orientationchange", updateViewportHeight);

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
    };
  }, []);

  // No mostrar este botón si:
  // - Estamos en un iframe o
  // - El sidebar ya está abierto
  if (isInIframe || isSidebarOpen) {
    return null;
  }

  // Calcular posición bottom basada en la altura real del viewport
  const bottomPosition =
    viewportHeight > 0 ? Math.max(20, viewportHeight * 0.05) : 20;

  return (
    <div
      className="fixed-mobile-container"
      style={{
        position: "fixed",
        bottom: `${bottomPosition}px`,
        left: "20px",
        zIndex: 50,
        width: "56px",
        height: "56px",
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="bg-inside hover:bg-[#bfef33] text-zinc-900 shadow-lg rounded-full flex items-center justify-center md:hidden"
        title="Mostrar panel lateral"
        data-sidebar-regular-toggle="true"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          transform: "translateZ(0)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          animation: "pulse 2s infinite",
        }}
      >
        <PanelLeft className="h-6 w-6" />
      </Button>
    </div>
  );
}
