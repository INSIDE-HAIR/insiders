import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export type SessionBadgeVariant = "active" | "finished" | "processing";

export interface SessionBadgeProps {
  variant: SessionBadgeVariant;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

/**
 * Badge atómico para estado de sesiones
 * Variants: active (pulsante), finished (neutral), processing (spinner)
 * 
 * @example
 * <SessionBadge variant="active" animated>
 *   <span className="mr-1">●</span>
 *   Activa
 * </SessionBadge>
 * 
 * <SessionBadge variant="finished">
 *   Finalizada
 * </SessionBadge>
 */
export const SessionBadge: React.FC<SessionBadgeProps> = ({
  variant,
  children,
  className,
  animated = false
}) => {
  
  const variantStyles = {
    active: "bg-green-900 text-green-100 hover:bg-green-800",
    finished: "bg-gray-500 text-gray-100 hover:bg-gray-600", 
    processing: "bg-blue-900 text-blue-100 hover:bg-blue-800"
  };

  return (
    <Badge 
      className={cn(
        variantStyles[variant],
        animated && variant === "active" && "animate-pulse",
        "ml-2",
        className
      )}
    >
      {children}
    </Badge>
  );
};