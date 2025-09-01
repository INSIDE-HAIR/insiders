"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { 
  CheckIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export type ResponseStatusType = "accepted" | "declined" | "needsAction" | "tentative";

export interface ResponseStatusProps {
  status: ResponseStatusType;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const ResponseStatus: React.FC<ResponseStatusProps> = ({
  status,
  showIcon = true,
  size = "default",
  className = "",
}) => {
  const getStatusConfig = (status: ResponseStatusType) => {
    switch (status) {
      case "accepted":
        return {
          label: "Aceptado",
          icon: CheckIcon,
          bgColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
        };
      case "declined":
        return {
          label: "Rechazado",
          icon: XMarkIcon,
          bgColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        };
      case "tentative":
        return {
          label: "Tentativo",
          icon: ClockIcon,
          bgColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        };
      case "needsAction":
        return {
          label: "Sin respuesta",
          icon: QuestionMarkCircleIcon,
          bgColor: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        };
      default:
        return {
          label: "Desconocido",
          icon: QuestionMarkCircleIcon,
          bgColor: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    default: "text-xs px-2 py-1", 
    lg: "text-sm px-2.5 py-1.5"
  };

  return (
    <Badge 
      className={`${sizeClasses[size]} flex items-center gap-1 font-medium ${config.bgColor} border-0 ${className}`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};

// Loading skeleton
export const ResponseStatusSkeleton: React.FC<{ size?: "sm" | "default" | "lg" }> = ({ size = "default" }) => {
  const sizeClasses = {
    sm: "h-5 w-16",
    default: "h-6 w-20",
    lg: "h-7 w-24"
  };
  
  return (
    <div className={`animate-pulse bg-muted rounded ${sizeClasses[size]}`} />
  );
};