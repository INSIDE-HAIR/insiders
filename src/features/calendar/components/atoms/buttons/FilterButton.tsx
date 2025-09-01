/**
 * FilterButton - Atomic Component
 * 
 * Botón de filtro IDÉNTICO al usado en AdvancedColumnFilter líneas 86-93
 * + Estado de loading con skeleton
 */

"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { FunnelIcon } from "@heroicons/react/24/outline";

interface FilterButtonProps {
  onClick: () => void;
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  filterCount?: number;
  disabled?: boolean;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  onClick,
  hasActiveFilters = false,
  isLoading = false,
  filterCount = 0,
  disabled = false,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-6 bg-muted-foreground/20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={`h-6 w-6 p-0 ${hasActiveFilters ? 'text-primary' : 'text-muted-foreground'} ${className}`}
      >
        <FunnelIcon className="h-3 w-3" />
      </Button>
      {hasActiveFilters && filterCount > 0 && (
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-[8px] text-primary-foreground flex items-center justify-center">
          {filterCount > 9 ? '9+' : filterCount}
        </span>
      )}
    </div>
  );
};

FilterButton.displayName = "FilterButton";