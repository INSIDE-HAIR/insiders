import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export interface AccessTypeBadgeProps {
  type: "OPEN" | "TRUSTED" | "RESTRICTED";
  className?: string;
}

/**
 * Badge que muestra el tipo de acceso de una sala de Meet
 * OPEN: Acceso libre, cualquiera puede unirse
 * TRUSTED: Solo miembros de la organización
 * RESTRICTED: Solo invitados específicos
 */
export const AccessTypeBadge: React.FC<AccessTypeBadgeProps> = ({ 
  type, 
  className 
}) => {
  const variants = {
    OPEN: "bg-green-100 text-green-700 hover:bg-green-200",
    TRUSTED: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    RESTRICTED: "bg-red-100 text-red-700 hover:bg-red-200"
  };
  
  const labels = {
    OPEN: "Libre",
    TRUSTED: "Organizacional",
    RESTRICTED: "Solo Invitados"
  };
  
  return (
    <Badge className={cn(variants[type], className)}>
      {labels[type]}
    </Badge>
  );
};