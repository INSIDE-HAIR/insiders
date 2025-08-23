import React from "react";
import { cn } from "@/src/lib/utils";

export type StatusDotVariant = "active" | "inactive" | "processing" | "available" | "error";

export interface StatusDotProps {
  variant: StatusDotVariant;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Punto de estado atómico con animación opcional
 * Variants: active (verde), inactive (gris), processing (azul), available (verde), error (rojo)
 * 
 * @example
 * <StatusDot variant="active" animated />
 * <StatusDot variant="inactive" size="sm" />
 */
export const StatusDot: React.FC<StatusDotProps> = ({
  variant,
  animated = false,
  size = "md",
  className
}) => {
  
  const sizeClasses = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-3 w-3"
  };

  const variantClasses = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
    processing: "bg-blue-500",
    available: "bg-green-500",
    error: "bg-red-500"
  };

  const shouldAnimate = animated && (variant === "active" || variant === "processing");

  return (
    <div 
      className={cn(
        "rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        shouldAnimate && "animate-pulse",
        className
      )}
    />
  );
};