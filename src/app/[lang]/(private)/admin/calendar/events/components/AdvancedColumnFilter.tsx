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
        className={`h-6 w-6 p-0 ${hasActiveFilters ? 'text-blue-600' : 'text-gray-400'}`}
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
                className="ml-1 hover:text-red-600"
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
        <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-7 text-xs"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-500">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer text-xs"
                  onClick={() => handleToggleValue(option)}
                >
                  <div className={`w-3 h-3 border rounded flex items-center justify-center ${
                    selectedValues.has(option) 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedValues.has(option) && (
                      <CheckIcon className="w-2 h-2 text-white" />
                    )}
                  </div>
                  <span className="flex-1 truncate" title={String(option)}>
                    {String(option)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="border-t p-2 flex gap-2">
            <Button
              variant="outline"
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