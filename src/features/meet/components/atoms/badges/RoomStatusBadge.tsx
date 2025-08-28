import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { RoomStatus, StatusLabels } from "../../../types/room-dates.types";

export interface RoomStatusBadgeProps {
  status?: RoomStatus;
  isActive?: boolean; // Retrocompatibilidad
  className?: string;
}

/**
 * Badge que muestra el estado de una sala basado en fechas
 */
export const RoomStatusBadge: React.FC<RoomStatusBadgeProps> = ({ 
  status,
  isActive, 
  className 
}) => {
  // Si no hay status, usar isActive para retrocompatibilidad
  if (!status) {
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
  }

  // Mapeo de colores según el estado
  const getStatusStyles = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.ALWAYS_OPEN:
      case RoomStatus.OPEN:
        return "bg-green-100 text-green-700 hover:bg-green-200";
      case RoomStatus.UPCOMING:
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case RoomStatus.CLOSED:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  const shouldPulse = status === RoomStatus.OPEN || status === RoomStatus.ALWAYS_OPEN;

  return (
    <Badge 
      className={cn(
        getStatusStyles(status),
        className
      )}
    >
      <span className={cn(
        "mr-1.5",
        shouldPulse && "animate-pulse"
      )}>
        ●
      </span>
      {StatusLabels[status]}
    </Badge>
  );
};