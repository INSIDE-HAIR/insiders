import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export interface RoomStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

/**
 * Badge que muestra el estado de una sala (activa o inactiva)
 */
export const RoomStatusBadge: React.FC<RoomStatusBadgeProps> = ({ 
  isActive, 
  className 
}) => {
  return (
    <Badge 
      className={cn(
        isActive 
          ? "bg-green-100 text-green-700 hover:bg-green-200" 
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        className
      )}
    >
      <span className={cn(
        "mr-1.5",
        isActive && "animate-pulse"
      )}>
        ●
      </span>
      {isActive ? "Activa" : "Inactiva"}
    </Badge>
  );
};