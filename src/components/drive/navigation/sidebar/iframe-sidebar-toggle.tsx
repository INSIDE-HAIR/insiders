"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSidebar } from "@/src/components/ui/sidebar";
import { useEffect, useState } from "react";

export function IframeSidebarToggle() {
  const { toggleSidebar } = useSidebar();
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Detect if the component is inside an iframe
    setIsInIframe(window.self !== window.top);
  }, []);

  if (!isInIframe) {
    return null; // Only show this special toggle in iframes
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="iframe-button"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 9999,
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "#CEFF66",
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
        opacity: 1,
        visibility: "visible",
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      <PanelLeft className="h-6 w-6" />
    </Button>
  );
}
