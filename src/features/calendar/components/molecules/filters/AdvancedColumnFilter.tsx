/**
 * AdvancedColumnFilter - Molecular Component
 * 
 * Filtro de columna IDÉNTICO al original AdvancedColumnFilter.tsx
 * Composición usando atoms: FilterButton, SearchInput, FilterCheckbox
 * + Estado de loading con skeleton
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Atoms
import { FilterButton } from "../../atoms/buttons/FilterButton";
import { SearchInput } from "../../atoms/inputs/SearchInput";
import { FilterCheckbox } from "../../atoms/checkboxes/FilterCheckbox";

interface AdvancedColumnFilterProps<TData> {
  column: Column<TData, unknown>;
  options: any[];
  onApplyFilter: (columnId: string, filterValues: any[]) => void;
  onRemoveFilter: (columnId: string, filterValue: any) => void;
  appliedFilters: any[];
  isLoading?: boolean;
}

export function AdvancedColumnFilter<TData>({
  column,
  options,
  onApplyFilter,
  onRemoveFilter,
  appliedFilters,
  isLoading = false,
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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="relative animate-pulse">
        <div className="h-6 w-6 bg-muted-foreground/20 rounded"></div>
      </div>
    );
  }

  // Filtrar opciones basado en el término de búsqueda - copiado exacto líneas 53-55
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
      {/* Filter Button - usando atom */}
      <FilterButton
        onClick={() => setIsOpen(!isOpen)}
        hasActiveFilters={hasActiveFilters}
        filterCount={appliedFilters.length}
      />

      {/* Applied Filters Badges - copiado exacto líneas 95-124 */}
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

      {/* Dropdown - copiado exacto líneas 126-193 */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-background border border-border rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search - usando atom */}
          <div className="sticky top-0 bg-background border-b border-border p-3">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar..."
            />
          </div>

          {/* Options - usando FilterCheckbox atom */}
          <div className="p-1 max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron opciones
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((option, index) => (
                  <FilterCheckbox
                    key={index}
                    checked={selectedValues.has(option)}
                    onChange={() => handleToggleValue(option)}
                    label={String(option)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions - copiado exacto líneas 174-191 */}
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

AdvancedColumnFilter.displayName = "AdvancedColumnFilter";