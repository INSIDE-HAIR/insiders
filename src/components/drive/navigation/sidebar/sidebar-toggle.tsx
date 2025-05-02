"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSidebar } from "@/src/components/ui/sidebar";

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="fixed z-50 left-4 bottom-4 bg-inside hover:bg-[#bfef33] text-zinc-900 shadow-lg rounded-full h-14 w-14 flex items-center justify-center md:hidden"
      title="Mostrar panel lateral"
      style={{
        position: "fixed",
        bottom: "16px",
        left: "16px",
        transform: "translateZ(0)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <PanelLeft className="h-6 w-6" />
    </Button>
  );
}
