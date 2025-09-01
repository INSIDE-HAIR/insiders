"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { Icons } from "@/src/components/shared/icons";
import { Column } from "@tanstack/react-table";

interface ColumnVisibilityIndicatorProps<TData> {
  column: Column<TData>;
  onShowColumn: (columnId: string) => void;
}

export const ColumnVisibilityIndicator: React.FC<
  ColumnVisibilityIndicatorProps<any>
> = ({ column, onShowColumn }) => {
  const isVisible = column.getIsVisible();
  const columnId = column.id;

  // Solo mostrar para columnas ocultas
  if (isVisible || columnId === "select" || columnId === "actions") {
    return null;
  }

  return (
    <Badge
      variant='secondary'
      className='bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors'
      onClick={() => onShowColumn(columnId)}
      title={`Mostrar columna ${columnId}`}
    >
      <Icons.Eye className='h-3 w-3 mr-1' />
      {columnId === "summary"
        ? "Título"
        : columnId === "attendees"
          ? "Invitados"
          : columnId === "location"
            ? "Ubicación"
            : columnId === "description"
              ? "Descripción"
              : columnId === "organizer"
                ? "Organizador"
                : columnId === "creator"
                  ? "Creador"
                  : columnId === "conferenceData"
                    ? "Meet"
                    : columnId}
    </Badge>
  );
};
