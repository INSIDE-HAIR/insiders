import React from "react";
import { cn } from "@/src/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "muted" | "success" | "warning" | "error";
  className?: string;
}

/**
 * Componente atómico Spinner
 * Spinner de carga reutilizable con variantes completas de color y tamaño
 * 
 * @example
 * <Spinner size="md" variant="primary" />
 * <Spinner size="lg" variant="success" />
 * <Spinner size="xl" variant="error" />
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "primary",
  className
}) => {
  const sizeClasses = {
    sm: "w-3 h-3 border",
    md: "w-4 h-4 border-2", 
    lg: "w-6 h-6 border-2",
    xl: "w-8 h-8 border-2"
  };

  const baseStyle = "border-gray-600";
  
  // Usar colores CSS del sistema directamente
  const variantClasses = {
    primary: "border-t-primary",     // Usa var(--primary) del CSS
    secondary: "border-t-secondary", // Usa var(--secondary) del CSS
    success: "border-t-success",     // Usa var(--success) del CSS
    warning: "border-t-warning",     // Usa var(--warning) del CSS
    error: "border-t-destructive",   // Usa var(--destructive) del CSS
    muted: "border-t-muted"          // Usa var(--muted) del CSS
  };
  
  const spinnerClassName = cn(
    "rounded-full animate-spin", 
    sizeClasses[size], 
    baseStyle, 
    variantClasses[variant], 
    className
  );

  return (
    <div 
      className={spinnerClassName}
      aria-label="Cargando..."
      role="status"
    />
  );
};