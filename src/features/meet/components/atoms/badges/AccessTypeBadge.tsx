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
    OPEN: "bg-green-900 text-green-100 hover:bg-green-800",
    TRUSTED: "bg-yellow-900 text-yellow-100 hover:bg-yellow-800",
    RESTRICTED: "bg-red-900 text-red-100 hover:bg-red-800"
  };
  
  const labels = {
    OPEN: "Abierto",
    TRUSTED: "Organizacional",
    RESTRICTED: "Solo Invitados"
  };
  
  return (
    <Badge className={cn(variants[type], className)}>
      {labels[type]}
    </Badge>
  );
};