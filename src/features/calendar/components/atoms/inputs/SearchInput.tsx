/**
 * SearchInput - Atomic Wrapper Component
 * 
 * Wrapper de Input de shadcn con icono de búsqueda
 * Mantiene la estética IDÉNTICA usando componentes shadcn
 */

"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  isLoading = false,
  className = "",
  disabled = false,
}) => {
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn("pl-10", className)}
      />
    </div>
  );
};

SearchInput.displayName = "SearchInput";