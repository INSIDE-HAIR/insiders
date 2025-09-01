/**
 * CountBadge - Atomic Component
 * 
 * Badge contador de elementos reutilizable
 * + Estado de loading con skeleton
 */

"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";

interface CountBadgeProps {
  count: number;
  label?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  isLoading?: boolean;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  label,
  variant = "secondary",
  isLoading = false,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-5 w-16 bg-muted-foreground/20 rounded-full"></div>
      </div>
    );
  }

  return (
    <Badge variant={variant} className={className}>
      {count} {label && (count === 1 ? label : `${label}s`)}
    </Badge>
  );
};

CountBadge.displayName = "CountBadge";