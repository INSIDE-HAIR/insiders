"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSidebar } from "@/src/components/ui/sidebar";
import { useEffect, useState } from "react";

export function IframeSidebarToggle() {
  const { toggleSidebar, openMobile, open } = useSidebar();
  const [isInIframe, setIsInIframe] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Verificar si el sidebar está abierto (en cualquier modo)
  const isSidebarOpen = openMobile || open;

  useEffect(() => {
    // Detect if the component is inside an iframe
    setIsInIframe(window.self !== window.top);

    // Ocultar el otro botón si estamos en un iframe
    // Para evitar duplicados
    if (window.self !== window.top) {
      const regularToggle = document.querySelector(
        '[data-sidebar-regular-toggle="true"]'
      );
      if (regularToggle) {
        regularToggle.classList.add("hidden");
      }
    }

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

  // No mostrar el botón si:
  // - No estamos en un iframe o
  // - El sidebar ya está abierto
  if (!isInIframe || isSidebarOpen) {
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
        zIndex: 2147483647,
        width: "60px",
        height: "60px",
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="iframe-button"
        data-sidebar-iframe-toggle="true"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: "#CEFF66",
          color: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 20px rgba(206, 255, 102, 0.7)",
          animation: "pulse 2s infinite",
        }}
      >
        <PanelLeft className="h-8 w-8" />
      </Button>
    </div>
  );
}
