import React from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export interface CloseSessionButtonProps {
  onClick?: () => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}

/**
 * Botón atómico para cerrar sesión/conferencia
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <CloseSessionButton onClick={() => handleCloseSession()} />
 */
export const CloseSessionButton: React.FC<CloseSessionButtonProps> = ({
  onClick,
  className,
  size = "sm"
}) => {
  
  return (
    <Button
      size={size}
      variant="outline"
      className={cn(
        "text-destructive hover:bg-destructive hover:text-background border-destructive bg-destructive/10",
        className
      )}
      onClick={onClick}
    >
      Cerrar Sesión
    </Button>
  );
};