import React from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { HierarchyView } from "./HierarchyView";

interface ProgressViewProps {
  hierarchy: HierarchyItem[];
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
}

export function ProgressView({
  hierarchy,
  className,
  onItemClick,
}: ProgressViewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <HierarchyView items={hierarchy} onItemClick={onItemClick} />
    </div>
  );
}
