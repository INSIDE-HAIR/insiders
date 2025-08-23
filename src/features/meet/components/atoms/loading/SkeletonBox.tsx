import React from "react";
import { cn } from "@/src/lib/utils";

export interface SkeletonBoxProps {
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  className?: string;
}

/**
 * Componente atómico SkeletonBox
 * Rectángulo animado para skeleton loading
 * 
 * @example
 * <SkeletonBox width="w-12" height="h-4" rounded="sm" />
 * <SkeletonBox width={48} height={16} rounded="md" />
 */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = "w-full",
  height = "h-4",
  rounded = "sm",
  className
}) => {
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  };

  // Si width/height son números, convertir a píxeles
  const widthStyle = typeof width === 'number' ? { width: `${width}px` } : {};
  const heightStyle = typeof height === 'number' ? { height: `${height}px` } : {};
  const widthClass = typeof width === 'string' ? width : '';
  const heightClass = typeof height === 'string' ? height : '';

  return (
    <div 
      className={cn(
        "bg-gray-600 animate-pulse",
        widthClass,
        heightClass,
        roundedClasses[rounded],
        className
      )}
      style={{
        ...widthStyle,
        ...heightStyle
      }}
      aria-hidden="true"
    />
  );
};