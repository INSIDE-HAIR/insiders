"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface CancelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "outline" | "default" | "secondary";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
  isLoading?: boolean;
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  variant = "ghost",
  size = "sm",
  showIcon = false,
  isLoading = false,
  className = "",
  children = "Cancelar",
  disabled,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={`${className}`}
      {...props}
    >
      {showIcon && !isLoading && <XMarkIcon className="h-4 w-4 mr-1" />}
      {isLoading && (
        <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Button>
  );
};

// Loading skeleton
export const CancelButtonSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-6 w-18 bg-muted rounded" />
  </div>
);