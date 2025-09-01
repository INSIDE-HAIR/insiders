"use client";

import React from "react";

export interface ProgressIndicatorProps {
  progress: number; // 0-100
  size?: "sm" | "default" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  size = "default",
  color = "primary",
  showPercentage = false,
  label,
  className = "",
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  const sizeClasses = {
    sm: "h-1",
    default: "h-2",
    lg: "h-3"
  };

  const colorClasses = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500"
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-muted-foreground font-medium">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-muted rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Loading skeleton
export const ProgressIndicatorSkeleton: React.FC<{ 
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}> = ({ size = "default", showLabel = false }) => {
  const sizeClasses = {
    sm: "h-1",
    default: "h-2",
    lg: "h-3"
  };

  return (
    <div className="w-full animate-pulse">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-8 bg-muted rounded" />
        </div>
      )}
      <div className={`w-full bg-muted rounded-full ${sizeClasses[size]}`} />
    </div>
  );
};