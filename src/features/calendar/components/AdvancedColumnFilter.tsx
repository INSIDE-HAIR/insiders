"use client";

import React, { useState, useRef, useEffect } from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { 
  FunnelIcon, 
  CheckIcon, 
  XMarkIcon,
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline";

interface AdvancedColumnFilterProps<TData> {
  column: Column<TData, unknown>;
  options: any[];
  onApplyFilter: (columnId: string, filterValues: any[]) => void;
  onRemoveFilter: (columnId: string, filterValue: any) => void;
  appliedFilters: any[];
}

export function AdvancedColumnFilter<TData>({
  column,
  options,
  onApplyFilter,
  onRemoveFilter,
  appliedFilters,
}: AdvancedColumnFilterProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<Set<any>>(
    new Set(appliedFilters)
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValues(new Set(appliedFilters));
  }, [appliedFilters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter((option) =>
    String(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleValue = (value: any) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    setSelectedValues(newSelected);
  };

  const handleApplyFilter = () => {
    onApplyFilter(column.id, Array.from(selectedValues));
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setSelectedValues(new Set());
    onApplyFilter(column.id, []);
    setIsOpen(false);
  };

  const handleRemoveFilterValue = (value: any) => {
    onRemoveFilter(column.id, value);
  };

  const hasActiveFilters = appliedFilters.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-6 w-6 p-0 ${hasActiveFilters ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <FunnelIcon className="h-3 w-3" />
      </Button>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1 mt-1">
          {appliedFilters.slice(0, 2).map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs px-1 py-0"
            >
              {String(filter).length > 10 
                ? `${String(filter).substring(0, 10)}...` 
                : String(filter)
              }
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilterValue(filter);
                }}
                className="ml-1 hover:text-destructive"
              >
                <XMarkIcon className="h-2 w-2" />
              </button>
            </Badge>
          ))}
          {appliedFilters.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              +{appliedFilters.length - 2}
            </Badge>
          )}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-background border border-border rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search */}
          <div className="sticky top-0 bg-background border-b border-border p-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Options */}
          <div className="p-1 max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron opciones
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 hover:bg-accent/50 rounded cursor-pointer transition-colors"
                    onClick={() => handleToggleValue(option)}
                  >
                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                      selectedValues.has(option) 
                        ? 'bg-primary border-primary' 
                        : 'border-input'
                    }`}>
                      {selectedValues.has(option) && (
                        <CheckIcon className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="flex-1 truncate text-sm text-foreground" title={String(option)}>
                      {String(option)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-muted border-t border-border p-2 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilter}
              className="h-6 px-2 text-xs flex-1"
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFilter}
              className="h-6 px-2 text-xs flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}