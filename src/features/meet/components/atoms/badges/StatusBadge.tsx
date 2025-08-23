import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export type StatusType = 
  | "active" 
  | "inactive" 
  | "processing" 
  | "available" 
  | "error"
  | "connecting"
  | "completed"
  | "pending";

export interface StatusBadgeProps {
  status: StatusType;
  animated?: boolean;
  className?: string;
  children?: React.ReactNode; // Para texto personalizado
}

/**
 * Badge especializado para mostrar estados dinámicos
 * Sigue el design system con colores sólidos oscuros y texto claro
 * 
 * @example
 * <StatusBadge status="active" animated />
 * <StatusBadge status="processing" animated>Procesando grabación</StatusBadge>
 * <StatusBadge status="available">Disponible</StatusBadge>
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  animated = false,
  className,
  children
}) => {
  // Configuración de variantes siguiendo el design system
  const variants = {
    active: {
      className: "bg-green-900 text-green-100 hover:bg-green-800",
      icon: <div className="animate-pulse mr-1 h-2 w-2 bg-green-500 rounded-full" />,
      defaultText: "Conferencia Activa"
    },
    inactive: {
      className: "bg-gray-900 text-gray-100 hover:bg-gray-800", 
      icon: <div className="h-2 w-2 bg-gray-400 rounded-full" />,
      defaultText: "Inactivo"
    },
    processing: {
      className: "bg-yellow-900 text-yellow-100 hover:bg-yellow-800",
      icon: <ArrowPathIcon className="h-3 w-3 animate-spin" />,
      defaultText: "Procesando"
    },
    available: {
      className: "bg-blue-900 text-blue-100 hover:bg-blue-800",
      icon: <div className="h-2 w-2 bg-blue-400 rounded-full" />,
      defaultText: "Disponible"
    },
    error: {
      className: "bg-red-900 text-red-100 hover:bg-red-800",
      icon: <div className="h-2 w-2 bg-red-400 rounded-full" />,
      defaultText: "Error"
    },
    connecting: {
      className: "bg-purple-900 text-purple-100 hover:bg-purple-800",
      icon: <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse" />,
      defaultText: "Conectando"
    },
    completed: {
      className: "bg-green-900 text-green-100 hover:bg-green-800",
      icon: <div className="h-2 w-2 bg-green-400 rounded-full" />,
      defaultText: "Completado"
    },
    pending: {
      className: "bg-orange-900 text-orange-100 hover:bg-orange-800",
      icon: <div className="h-2 w-2 bg-orange-400 rounded-full" />,
      defaultText: "Pendiente"
    }
  };

  const config = variants[status];
  const shouldAnimate = animated && (status === "active" || status === "processing" || status === "connecting");

  return (
    <Badge className={cn(config.className, className)}>
      <div className="flex items-center gap-1">
        <span className={shouldAnimate ? "animate-pulse" : ""}>
          {config.icon}
        </span>
        <span>{children || config.defaultText}</span>
      </div>
    </Badge>
  );
};