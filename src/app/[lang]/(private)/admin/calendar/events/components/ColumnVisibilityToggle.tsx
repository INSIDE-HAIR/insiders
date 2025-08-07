"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/components/shared/icons";

import { Column } from "@tanstack/react-table";

interface ColumnVisibilityToggleProps<TData> {
  column: Column<TData>;
  onToggleVisibility: (columnId: string) => void;
}

export const ColumnVisibilityToggle: React.FC<
  ColumnVisibilityToggleProps<any>
> = ({ column, onToggleVisibility }) => {
  const isVisible = column.getIsVisible();
  const columnId = column.id;

  // No mostrar para columnas especiales
  if (columnId === "select" || columnId === "actions") {
    return null;
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      className={`h-6 w-6 p-0 transition-all duration-200 ${
        isVisible
          ? "text-primary bg-primary/10 hover:bg-primary/20"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={() => onToggleVisibility(columnId)}
      title={`${isVisible ? "Ocultar" : "Mostrar"} columna`}
    >
      <Icons.Eye className='h-3 w-3' />
    </Button>
  );
};
