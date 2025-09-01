"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export type EventStatusType = "confirmed" | "tentative" | "cancelled" | "pending" | "completed";

export interface EventStatusProps {
  status: EventStatusType;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const EventStatus: React.FC<EventStatusProps> = ({
  status,
  showIcon = true,
  size = "default",
  className = "",
}) => {
  const getStatusConfig = (status: EventStatusType) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmado",
          variant: "default" as const,
          icon: CheckCircleIcon,
          color: "text-emerald-600"
        };
      case "tentative":
        return {
          label: "Tentativo",
          variant: "secondary" as const,
          icon: ClockIcon,
          color: "text-amber-600"
        };
      case "cancelled":
        return {
          label: "Cancelado",
          variant: "destructive" as const,
          icon: XCircleIcon,
          color: "text-red-600"
        };
      case "pending":
        return {
          label: "Pendiente",
          variant: "outline" as const,
          icon: ExclamationTriangleIcon,
          color: "text-orange-600"
        };
      case "completed":
        return {
          label: "Completado",
          variant: "default" as const,
          icon: CheckCircleIcon,
          color: "text-blue-600"
        };
      default:
        return {
          label: "Desconocido",
          variant: "secondary" as const,
          icon: ExclamationTriangleIcon,
          color: "text-gray-600"
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
      variant={config.variant}
      className={`${sizeClasses[size]} flex items-center gap-1 font-medium ${className}`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};

// Loading skeleton
export const EventStatusSkeleton: React.FC<{ size?: "sm" | "default" | "lg" }> = ({ size = "default" }) => {
  const sizeClasses = {
    sm: "h-5 w-16",
    default: "h-6 w-20",
    lg: "h-7 w-24"
  };
  
  return (
    <div className={`animate-pulse bg-muted rounded ${sizeClasses[size]}`} />
  );
};