import React from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import ComponentFactory from "../factory/ComponentFactory";
import { cn } from "@/src/lib/utils";

interface AccordionViewProps {
  hierarchy: HierarchyItem[];
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
}

export function AccordionView({
  hierarchy,
  className,
  onItemClick,
}: AccordionViewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {hierarchy.map((item) => (
        <ComponentFactory key={item.id} item={item} onItemClick={onItemClick} />
      ))}
    </div>
  );
}
