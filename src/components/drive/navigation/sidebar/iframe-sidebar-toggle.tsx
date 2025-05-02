"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSidebar } from "@/src/components/ui/sidebar";
import { useEffect, useState } from "react";

export function IframeSidebarToggle() {
  const { toggleSidebar, openMobile, open } = useSidebar();
  const [isInIframe, setIsInIframe] = useState(false);

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
  }, []);

  // No mostrar el botón si:
  // - No estamos en un iframe o
  // - El sidebar ya está abierto
  if (!isInIframe || isSidebarOpen) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="iframe-button iframe-button-fixed-bottom"
      data-sidebar-iframe-toggle="true"
      style={{
        position: "fixed",
        bottom: "5dvh", // Cambio de top a bottom para ubicarlo abajo
        left: "5%", // Usa porcentaje relativo al ancho
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#CEFF66",
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 20px rgba(206, 255, 102, 0.7)",
      }}
    >
      <PanelLeft className="h-8 w-8" />
    </Button>
  );
}
