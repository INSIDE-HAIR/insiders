import React from "react";
import { cn } from "@/src/lib/utils";

export interface FieldLabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

/**
 * Componente atómico para labels de campos
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <FieldLabel>ID de la Sala</FieldLabel>
 * <FieldLabel htmlFor="meeting-code">Código de Reunión</FieldLabel>
 */
export const FieldLabel: React.FC<FieldLabelProps> = ({
  children,
  className,
  htmlFor
}) => {
  return (
    <label 
      className={cn("text-sm font-medium", className)}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
};