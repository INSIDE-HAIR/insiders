import React from "react";
import { cn } from "@/src/lib/utils";
import { Spinner } from "./Spinner";

export interface LoadingMessageProps {
  message?: string;
  showSpinner?: boolean;
  spinnerSize?: "sm" | "md" | "lg";
  spinnerVariant?: "primary" | "secondary" | "muted";
  variant?: "default" | "primary" | "success" | "warning" | "error" | "muted";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Componente atómico LoadingMessage
 * Combina spinner con mensaje de carga con variantes completas
 * 
 * @example
 * <LoadingMessage message="Cargando datos..." variant="primary" />
 * <LoadingMessage message="Procesando..." variant="success" showSpinner={false} />
 * <LoadingMessage message="Error al cargar" variant="error" size="lg" />
 */
export const LoadingMessage: React.FC<LoadingMessageProps> = ({
  message = "Cargando...",
  showSpinner = true,
  spinnerSize = "md",
  spinnerVariant = "primary", 
  variant = "default",
  size = "md",
  className
}) => {
  // Variantes de color para el texto usando CSS variables del sistema
  const textVariants = {
    default: "text-muted-foreground",    // Usa var(--muted-foreground)
    primary: "text-primary",             // Usa var(--primary) - Verde lima del CSS
    success: "text-success",             // Usa var(--success)
    warning: "text-warning",             // Usa var(--warning) 
    error: "text-destructive",           // Usa var(--destructive)
    muted: "text-muted-foreground"       // Usa var(--muted-foreground)
  };

  // Tamaños de texto
  const textSizes = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  // Espaciado entre elementos según tamaño
  const gapSizes = {
    sm: "gap-1.5",
    md: "gap-2",
    lg: "gap-2.5"
  };

  // Auto-ajustar spinner variant según variant del mensaje
  const getSpinnerVariant = () => {
    if (variant === "primary") return "primary";
    if (variant === "muted") return "muted";
    return spinnerVariant;
  };

  return (
    <div className={cn(
      "flex items-center", 
      gapSizes[size],
      textVariants[variant],
      textSizes[size],
      className
    )}>
      {showSpinner && (
        <Spinner 
          size={spinnerSize} 
          variant={getSpinnerVariant()}
        />
      )}
      <span>{message}</span>
    </div>
  );
};