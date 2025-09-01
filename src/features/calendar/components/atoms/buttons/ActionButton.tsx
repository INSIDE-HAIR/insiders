/**
 * ActionButton - Atomic Component
 * 
 * Button IDÉNTICO estéticamente al original en columns.tsx
 * + Estado de loading con skeleton  
 * Copiado exacto de: columns.tsx acciones (líneas ~1407-1449)
 */

"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { ActionButtonProps } from "../types";

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = "edit",
  onClick,
  isLoading = false,
  title,
  disabled = false,
}) => {
  // Loading skeleton - mantiene mismo tamaño que original
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-muted-foreground/20 rounded"></div>
      </div>
    );
  }

  const configs = {
    edit: {
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      className: "h-8 w-8 p-0",
      defaultTitle: "Editar"
    },
    delete: {
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      className: "h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10",
      defaultTitle: "Eliminar"
    },
    view: {
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      className: "h-8 w-8 p-0",
      defaultTitle: "Ver"
    }
  };

  const config = configs[variant];

  return (
    <Button
      variant='ghost'
      size='sm'
      className={config.className}
      onClick={onClick}
      title={title || config.defaultTitle}
      disabled={disabled}
    >
      {config.icon}
    </Button>
  );
};

ActionButton.displayName = "ActionButton";