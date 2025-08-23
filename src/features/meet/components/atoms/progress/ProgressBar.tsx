import React from "react";
import { cn } from "@/src/lib/utils";

export interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

/**
 * Barra de progreso atómica para participación
 * Colores automáticos según percentage: >80% verde, >50% amarillo, resto rojo
 * 
 * @example
 * <ProgressBar percentage={85} showLabel />
 * <ProgressBar percentage={45} size="sm" />
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showLabel = false,
  size = "md",
  variant = "default",
  className
}) => {
  
  // Auto variant basado en percentage si es default
  const effectiveVariant = variant === "default" 
    ? percentage > 80 ? "success" 
      : percentage > 50 ? "warning" 
      : "danger"
    : variant;

  const sizeClasses = {
    sm: "h-1",
    md: "h-2", 
    lg: "h-3"
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500", 
    danger: "bg-red-500"
  };

  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      {showLabel && (
        <div className="flex items-center gap-1 mb-1">
          <span>Timeline:</span>
          <div className={cn("flex-1 bg-muted rounded overflow-hidden", sizeClasses[size])}>
            <div 
              className={cn("h-full transition-all duration-300", variantClasses[effectiveVariant])}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>
          <span>{clampedPercentage}%</span>
        </div>
      )}
      
      {!showLabel && (
        <div className={cn("bg-muted rounded overflow-hidden", sizeClasses[size])}>
          <div 
            className={cn("h-full transition-all duration-300", variantClasses[effectiveVariant])}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};