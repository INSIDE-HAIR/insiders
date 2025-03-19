import React from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { Construction } from "lucide-react";

interface ProgressViewProps {
  hierarchy: HierarchyItem[];
  className?: string;
}

export function ProgressView({ className }: ProgressViewProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center p-8", className)}
    >
      <Construction className="w-16 h-16 text-yellow-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Vista en Desarrollo</h3>
      <p className="text-gray-500 text-center">
        Esta vista está actualmente en desarrollo. ¡Pronto estará disponible!
      </p>
    </div>
  );
}
