/**
 * Spinner - Atomic Wrapper Component
 * 
 * Wrapper del Spinner de shadcn para mantener compatibilidad
 * Mantiene estética IDÉNTICA usando componente shadcn
 */

"use client";

import React from "react";
import { Spinner as ShadcnSpinner } from "@/src/components/ui/spinner";
import { cn } from "@/src/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <ShadcnSpinner 
      className={cn(
        sizeClasses[size],
        className
      )}
    />
  );
};

Spinner.displayName = "Spinner";