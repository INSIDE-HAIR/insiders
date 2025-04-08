"use client";

import React from "react";
import { ViewSelector } from "@/src/app/[lang]/drive/components/views";
import { HierarchyItem } from "@drive/types/hierarchy";

interface ClientViewSelectorProps {
  hierarchy: HierarchyItem[];
}

export function ClientViewSelector({ hierarchy }: ClientViewSelectorProps) {
  // Manejar el click en un ítem
  const handleItemClick = (item: HierarchyItem) => {
    // Aquí puedes manejar la interacción con los elementos
    console.log("Item clicked:", item);

    // Si es un archivo con enlace, puedes abrir el enlace
    if (item.webViewLink) {
      window.open(item.webViewLink, "_blank");
    }
  };

  return <ViewSelector hierarchy={hierarchy} onItemClick={handleItemClick} />;
}

// También exportamos como default para dynamic import
export default ClientViewSelector;
