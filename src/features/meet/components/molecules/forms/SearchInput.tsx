import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  MagnifyingGlassIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export type SearchInputSize = "sm" | "default" | "lg";

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  size?: SearchInputSize;
  disabled?: boolean;
  showSearchIcon?: boolean;
  showClearButton?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  minLength?: number; // Mínimo de caracteres para disparar búsqueda
}

/**
 * Input de búsqueda molecular con debounce y funcionalidades avanzadas
 * Optimizado para búsquedas en tiempo real con control de performance
 * 
 * @example
 * <SearchInput 
 *   placeholder="Buscar por nombre o email..."
 *   onSearch={(query) => filterMembers(query)}
 *   debounceMs={300}
 *   showClearButton
 * />
 * 
 * <SearchInput 
 *   placeholder="Filtrar secciones..."
 *   onSearch={handleSectionSearch}
 *   size="sm"
 *   minLength={2}
 * />
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Buscar...",
  value: controlledValue,
  onSearch,
  onClear,
  debounceMs = 300,
  size = "default",
  disabled = false,
  showSearchIcon = true,
  showClearButton = true,
  className,
  inputClassName,
  autoFocus = false,
  minLength = 1
}) => {
  // Estado interno si no es controlado
  const [internalValue, setInternalValue] = useState(controlledValue || "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Debounced search effect
  useEffect(() => {
    if (disabled) return;

    const timer = setTimeout(() => {
      // Solo buscar si cumple con minLength
      if (value.length >= minLength || value.length === 0) {
        onSearch(value);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, onSearch, debounceMs, disabled, minLength]);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
  }, [isControlled]);

  // Handle clear
  const handleClear = useCallback(() => {
    const newValue = "";
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onClear?.();
    onSearch(newValue);
  }, [isControlled, onClear, onSearch]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Búsqueda inmediata en Enter, sin debounce
      e.preventDefault();
      if (value.length >= minLength || value.length === 0) {
        onSearch(value);
      }
    }
    
    if (e.key === 'Escape') {
      // Limpiar en Escape
      handleClear();
    }
  }, [value, onSearch, minLength, handleClear]);

  // Clases de tamaño
  const sizeClasses = {
    sm: "h-8 text-sm",
    default: "h-10 text-sm", 
    lg: "h-12 text-base"
  };

  // Determinar si mostrar botón clear
  const shouldShowClear = showClearButton && value.length > 0 && !disabled;

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Search icon */}
      {showSearchIcon && (
        <div className="absolute left-3 z-10 pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      {/* Input field */}
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          sizeClasses[size],
          showSearchIcon && "pl-9",
          shouldShowClear && "pr-9",
          inputClassName
        )}
        aria-label={placeholder}
      />
      
      {/* Clear button */}
      {shouldShowClear && (
        <div className="absolute right-2 z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            <XMarkIcon className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};