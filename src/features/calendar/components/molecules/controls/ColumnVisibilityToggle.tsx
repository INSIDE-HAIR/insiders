/**
 * ColumnVisibilityToggle - Molecular Component
 * 
 * Toggle de visibilidad de columnas usando Button de shadcn
 * Migrado desde el componente original manteniendo estética IDÉNTICA
 */

"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Column } from "@tanstack/react-table";
import { cn } from "@/src/lib/utils";

interface ColumnVisibilityToggleProps<TData> {
  column: Column<TData>;
  onToggleVisibility: (columnId: string) => void;
  className?: string;
  disabled?: boolean;
}

export const ColumnVisibilityToggle = <TData,>({
  column,
  onToggleVisibility,
  className,
  disabled = false,
}: ColumnVisibilityToggleProps<TData>) => {
  const isVisible = column.getIsVisible();
  const columnId = column.id;

  // No mostrar para columnas especiales
  if (columnId === "select" || columnId === "actions") {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-6 w-6 p-0 transition-all duration-200",
        isVisible
          ? "text-primary bg-primary/10 hover:bg-primary/20"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={() => !disabled && onToggleVisibility(columnId)}
      title={`${isVisible ? "Ocultar" : "Mostrar"} columna`}
      disabled={disabled}
    >
      <EyeIcon className="h-3 w-3" />
    </Button>
  );
};

// Loading skeleton
export const ColumnVisibilityToggleSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <Skeleton className="h-6 w-6" />
  </div>
);

ColumnVisibilityToggle.displayName = "ColumnVisibilityToggle";