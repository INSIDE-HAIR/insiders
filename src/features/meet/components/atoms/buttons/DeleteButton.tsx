import React from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export interface DeleteButtonProps {
  onDelete: () => void;
  size?: "sm" | "default" | "lg";
  className?: string;
  ariaLabel?: string;
}

/**
 * Botón atómico destructivo para eliminar elementos
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <DeleteButton 
 *   onDelete={() => console.log('Eliminar')} 
 *   ariaLabel="Eliminar miembro"
 * />
 */
export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  size = "sm",
  className,
  ariaLabel = "Eliminar"
}) => {
  
  return (
    <Button
      size={size}
      variant="ghost"
      className={cn(
        "text-destructive hover:text-destructive hover:bg-destructive/10",
        className
      )}
      onClick={onDelete}
      aria-label={ariaLabel}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>
    </Button>
  );
};