"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";

export interface CountBadgeProps {
  count: number;
  maxCount?: number;
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "default" | "lg";
  showZero?: boolean;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  maxCount = 99,
  variant = "secondary",
  size = "default",
  showZero = false,
  className = "",
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  const sizeClasses = {
    sm: "h-4 w-4 text-xs",
    default: "h-5 w-5 text-xs",
    lg: "h-6 w-6 text-sm"
  };

  return (
    <Badge 
      variant={variant}
      className={`${sizeClasses[size]} p-0 flex items-center justify-center font-semibold ${className}`}
    >
      {displayCount}
    </Badge>
  );
};

// Loading skeleton
export const CountBadgeSkeleton: React.FC<{ size?: "sm" | "default" | "lg" }> = ({ size = "default" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5", 
    lg: "h-6 w-6"
  };
  
  return (
    <div className={`animate-pulse bg-muted rounded-full ${sizeClasses[size]}`} />
  );
};