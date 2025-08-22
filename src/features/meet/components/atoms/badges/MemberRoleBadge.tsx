import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export interface MemberRoleBadgeProps {
  role: "ROLE_UNSPECIFIED" | "COHOST";
  className?: string;
}

/**
 * Badge que muestra el rol de un miembro en una sala de Meet
 * COHOST: Co-anfitrión con permisos elevados
 * ROLE_UNSPECIFIED: Participante regular
 */
export const MemberRoleBadge: React.FC<MemberRoleBadgeProps> = ({ 
  role, 
  className 
}) => {
  const isCohost = role === "COHOST";
  
  return (
    <Badge 
      variant={isCohost ? "default" : "secondary"}
      className={cn(className)}
    >
      {isCohost ? "Co-anfitrión" : "Participante"}
    </Badge>
  );
};