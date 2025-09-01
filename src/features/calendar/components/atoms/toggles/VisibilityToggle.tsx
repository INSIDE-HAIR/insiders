/**
 * VisibilityToggle - Atomic Component
 * 
 * Toggle IDÉNTICO estéticamente al original ColumnVisibilityToggle.tsx
 * + Estado de loading con skeleton 
 * Copiado exacto de: ColumnVisibilityToggle.tsx líneas 25-40
 */

"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/components/shared/icons";
import { VisibilityToggleProps } from "../types";

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({
  isVisible,
  onToggle,
  isLoading = false,
  title = "Toggle visibility",
}) => {
  // Loading skeleton - mantiene mismo tamaño que original
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-6 bg-muted-foreground/20 rounded"></div>
      </div>
    );
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
      onClick={onToggle}
      title={`${isVisible ? "Ocultar" : "Mostrar"} ${title}`}
    >
      <Icons.Eye className='h-3 w-3' />
    </Button>
  );
};

VisibilityToggle.displayName = "VisibilityToggle";