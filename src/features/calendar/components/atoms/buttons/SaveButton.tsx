"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { CheckIcon } from "@heroicons/react/24/outline";

export interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "outline" | "default" | "secondary";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
  isLoading?: boolean;
  isSaved?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  variant = "default",
  size = "sm",
  showIcon = true,
  isLoading = false,
  isSaved = false,
  className = "",
  children = "Guardar",
  disabled,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading || isSaved}
      className={`${isSaved ? 'bg-emerald-600 hover:bg-emerald-600' : ''} ${className}`}
      {...props}
    >
      {showIcon && !isLoading && (
        <CheckIcon className={`h-4 w-4 mr-1 ${isSaved ? 'text-white' : ''}`} />
      )}
      {isLoading && (
        <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {isSaved ? 'Guardado' : isLoading ? 'Guardando...' : children}
    </Button>
  );
};

// Loading skeleton
export const SaveButtonSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-6 w-20 bg-muted rounded" />
  </div>
);