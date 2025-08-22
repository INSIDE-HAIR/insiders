import React from "react";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

export interface AccessTypeIconProps {
  type: "OPEN" | "TRUSTED" | "RESTRICTED";
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Icono que representa visualmente el tipo de acceso de una sala
 */
export const AccessTypeIcon: React.FC<AccessTypeIconProps> = ({
  type,
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const colorClasses = {
    OPEN: "text-green-500",
    TRUSTED: "text-yellow-500",
    RESTRICTED: "text-red-500",
  };

  const Icon = type === "OPEN" ? LockOpenIcon : LockClosedIcon;

  return (
    <Icon
      className={cn(
        sizeClasses[size],
        colorClasses[type],
        className
      )}
    />
  );
};