import React from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";

interface JsonViewProps {
  hierarchy: HierarchyItem[];
  className?: string;
}

export function JsonView({ hierarchy, className }: JsonViewProps) {
  return (
    <div
      className={cn(
        "bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto",
        className
      )}
    >
      <pre className="text-sm">{JSON.stringify(hierarchy, null, 2)}</pre>
    </div>
  );
}
