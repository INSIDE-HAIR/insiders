"use client";

import React from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export interface ColumnVisibilityIndicatorProps {
  isVisible: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "icon" | "text" | "both";
  className?: string;
}

export const ColumnVisibilityIndicator: React.FC<ColumnVisibilityIndicatorProps> = ({
  isVisible,
  size = "default",
  variant = "icon",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const textSizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base"
  };

  const Icon = isVisible ? EyeIcon : EyeSlashIcon;
  const text = isVisible ? "Visible" : "Oculto";
  const colorClass = isVisible ? "text-primary" : "text-muted-foreground";

  return (
    <div className={`flex items-center gap-1 ${colorClass} ${className}`}>
      {(variant === "icon" || variant === "both") && (
        <Icon className={sizeClasses[size]} />
      )}
      {(variant === "text" || variant === "both") && (
        <span className={textSizeClasses[size]}>{text}</span>
      )}
    </div>
  );
};

// Loading skeleton
export const ColumnVisibilityIndicatorSkeleton: React.FC<{ 
  size?: "sm" | "default" | "lg";
  variant?: "icon" | "text" | "both";
}> = ({ size = "default", variant = "icon" }) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const textSizeClasses = {
    sm: "h-3 w-12",
    default: "h-4 w-16",
    lg: "h-5 w-20"
  };

  return (
    <div className="flex items-center gap-1 animate-pulse">
      {(variant === "icon" || variant === "both") && (
        <div className={`bg-muted rounded ${sizeClasses[size]}`} />
      )}
      {(variant === "text" || variant === "both") && (
        <div className={`bg-muted rounded ${textSizeClasses[size]}`} />
      )}
    </div>
  );
};