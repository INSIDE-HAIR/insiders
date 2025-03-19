/**
 * HierarchyViewer
 *
 * Componente para visualizar la jerarquía de elementos
 */

"use client";

import React from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import ComponentFactory from "./factory/ComponentFactory";
import { cn } from "@/src/lib/utils";

interface HierarchyViewerProps {
  hierarchy: HierarchyItem[];
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
}

export function HierarchyViewer({
  hierarchy,
  className,
  onItemClick,
}: HierarchyViewerProps) {
  return (
    <div className={cn("hierarchy-viewer", className)}>
      {hierarchy.map((item) => (
        <ComponentFactory key={item.id} item={item} onItemClick={onItemClick} />
      ))}
    </div>
  );
}
