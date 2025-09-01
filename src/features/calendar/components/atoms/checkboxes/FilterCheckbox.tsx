/**
 * FilterCheckbox - Atomic Component
 * 
 * Checkbox de filtro IDÉNTICO al usado en AdvancedColumnFilter líneas 156-164
 * + Estado de loading con skeleton
 */

"use client";

import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

interface FilterCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  checked,
  onChange,
  label,
  isLoading = false,
  disabled = false,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-2 animate-pulse">
        <div className="w-4 h-4 bg-muted-foreground/20 rounded"></div>
        {label && <div className="h-4 bg-muted-foreground/20 rounded flex-1"></div>}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-2 hover:bg-accent/50 rounded cursor-pointer transition-colors ${className}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
        checked 
          ? 'bg-primary border-primary' 
          : 'border-input'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {checked && (
          <CheckIcon className="w-3 h-3 text-primary-foreground" />
        )}
      </div>
      {label && (
        <span className="flex-1 truncate text-sm text-foreground" title={label}>
          {label}
        </span>
      )}
    </div>
  );
};

FilterCheckbox.displayName = "FilterCheckbox";