/**
 * ColumnVisibilityIndicator - Molecular Component
 * 
 * Indicador de columnas ocultas usando Badge de shadcn
 * Migrado desde el componente original manteniendo estética IDÉNTICA
 */

"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Column } from "@tanstack/react-table";
import { cn } from "@/src/lib/utils";

interface ColumnVisibilityIndicatorProps<TData> {
  column: Column<TData>;
  onShowColumn: (columnId: string) => void;
  className?: string;
  disabled?: boolean;
}

const getColumnLabel = (columnId: string): string => {
  const labels: Record<string, string> = {
    summary: "Título",
    attendees: "Invitados", 
    location: "Ubicación",
    description: "Descripción",
    organizer: "Organizador",
    creator: "Creador",
    conferenceData: "Meet",
    start: "Inicio",
    end: "Fin",
    status: "Estado",
    visibility: "Visibilidad",
  };
  
  return labels[columnId] || columnId;
};

export const ColumnVisibilityIndicator = <TData,>({
  column,
  onShowColumn,
  className,
  disabled = false,
}: ColumnVisibilityIndicatorProps<TData>) => {
  const isVisible = column.getIsVisible();
  const columnId = column.id;

  // Solo mostrar para columnas ocultas
  if (isVisible || columnId === "select" || columnId === "actions") {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => !disabled && onShowColumn(columnId)}
      title={`Mostrar columna ${getColumnLabel(columnId)}`}
    >
      <EyeIcon className="h-3 w-3 mr-1" />
      {getColumnLabel(columnId)}
    </Badge>
  );
};

// Loading skeleton
export const ColumnVisibilityIndicatorSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <Skeleton className="h-6 w-20" />
  </div>
);

ColumnVisibilityIndicator.displayName = "ColumnVisibilityIndicator";