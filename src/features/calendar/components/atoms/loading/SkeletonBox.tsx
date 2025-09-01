/**
 * SkeletonBox - Atomic Wrapper Component
 * 
 * Wrapper del Skeleton de shadcn para mantener compatibilidad
 * Usa el componente Skeleton de shadcn internamente
 */

"use client";

import React from "react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

interface SkeletonBoxProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = "100%",
  height = "1rem",
  className,
  rounded = "md",
}) => {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded",
    lg: "rounded-lg", 
    full: "rounded-full"
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <Skeleton
      className={cn(
        roundedClasses[rounded],
        className
      )}
      style={style}
    />
  );
};

SkeletonBox.displayName = "SkeletonBox";