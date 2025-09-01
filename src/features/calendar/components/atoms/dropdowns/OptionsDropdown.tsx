"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/button";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface OptionsDropdownProps {
  options: DropdownOption[];
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  maxHeight?: number;
}

export const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  multiple = false,
  disabled = false,
  isLoading = false,
  className = "",
  maxHeight = 200,
}) => {
  // Set default value based on multiple mode
  const defaultValue = value ?? (multiple ? [] : "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (optionValue: string) => {
    if (multiple) {
      const currentArray = Array.isArray(value) ? value : [];
      const newValue = currentArray.includes(optionValue)
        ? currentArray.filter(v => v !== optionValue)
        : [...currentArray, optionValue];
      onValueChange(newValue);
    } else {
      onValueChange(optionValue);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    const currentValue = value ?? defaultValue;
    if (multiple) {
      const selectedCount = Array.isArray(currentValue) ? currentValue.length : 0;
      if (selectedCount === 0) return placeholder;
      if (selectedCount === 1) {
        const selectedOption = options.find(opt => Array.isArray(currentValue) && currentValue.includes(opt.value));
        return selectedOption?.label || placeholder;
      }
      return `${selectedCount} seleccionados`;
    } else {
      const selectedOption = options.find(opt => opt.value === currentValue);
      return selectedOption?.label || placeholder;
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className="w-full justify-between"
      >
        <span className="truncate">{getDisplayText()}</span>
        <ChevronDownIcon 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          <div className="py-1" style={{ maxHeight, overflowY: 'auto' }}>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => !option.disabled && handleOptionSelect(option.value)}
                disabled={option.disabled}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected(option.value) ? 'bg-accent' : ''
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected(option.value) && (
                  <CheckIcon className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No hay opciones disponibles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Loading skeleton
export const OptionsDropdownSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="w-full h-10 bg-muted rounded-md" />
  </div>
);