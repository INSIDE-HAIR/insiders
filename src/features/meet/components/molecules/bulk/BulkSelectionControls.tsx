/**
 * BULKSELECTIONCONTROLS - Controles de selección masiva
 * Checkbox maestro y controles de selección por páginas/filtros
 */

import React from "react";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
  Square3Stack3DIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

export interface BulkSelectionControlsProps {
  totalItems: number;
  currentPageItems: number;
  selectedCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onSelectAll: () => void;
  onSelectPage: () => void;
  onSelectFiltered?: () => void;
  onClearSelection: () => void;
  filteredCount?: number;
  hasActiveFilters?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Controles avanzados para selección masiva de elementos
 * Incluye checkbox maestro con dropdown para diferentes tipos de selección
 */
export const BulkSelectionControls: React.FC<BulkSelectionControlsProps> = ({
  totalItems,
  currentPageItems,
  selectedCount,
  isAllSelected,
  isPartiallySelected,
  onSelectAll,
  onSelectPage,
  onSelectFiltered,
  onClearSelection,
  filteredCount,
  hasActiveFilters = false,
  disabled = false,
  className,
}) => {
  const getCheckboxState = (): boolean | "indeterminate" => {
    if (isAllSelected) return true;
    if (isPartiallySelected) return "indeterminate";
    return false;
  };

  const getSelectionText = (): string => {
    if (selectedCount === 0) return "Seleccionar";
    if (selectedCount === 1) return "1 elemento seleccionado";
    return `${selectedCount} elementos seleccionados`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Master checkbox with dropdown */}
      <div className="flex items-center">
        <Checkbox
          checked={getCheckboxState()}
          onCheckedChange={onSelectAll}
          disabled={disabled}
          className="mr-2"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-auto p-1 text-sm font-normal"
            >
              <Label className="cursor-pointer">
                {getSelectionText()}
              </Label>
              <ChevronDownIcon className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {/* Select current page */}
            <DropdownMenuItem onClick={onSelectPage} disabled={disabled}>
              <Square3Stack3DIcon className="mr-2 h-4 w-4" />
              <div className="flex-1">
                <div>Seleccionar página actual</div>
                <div className="text-xs text-muted-foreground">
                  {currentPageItems} elementos en esta página
                </div>
              </div>
            </DropdownMenuItem>

            {/* Select all filtered (if filters are active) */}
            {hasActiveFilters && onSelectFiltered && filteredCount && (
              <DropdownMenuItem onClick={onSelectFiltered} disabled={disabled}>
                <FunnelIcon className="mr-2 h-4 w-4" />
                <div className="flex-1">
                  <div>Seleccionar filtrados</div>
                  <div className="text-xs text-muted-foreground">
                    {filteredCount} elementos que coinciden con los filtros
                  </div>
                </div>
              </DropdownMenuItem>
            )}

            {/* Select all */}
            <DropdownMenuItem onClick={onSelectAll} disabled={disabled}>
              <CheckIcon className="mr-2 h-4 w-4" />
              <div className="flex-1">
                <div>Seleccionar todos</div>
                <div className="text-xs text-muted-foreground">
                  {totalItems} elementos en total
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Clear selection */}
            <DropdownMenuItem 
              onClick={onClearSelection} 
              disabled={disabled || selectedCount === 0}
            >
              <XMarkIcon className="mr-2 h-4 w-4" />
              <div className="flex-1">
                <div>Limpiar selección</div>
                <div className="text-xs text-muted-foreground">
                  Deseleccionar todos los elementos
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selection summary */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>•</span>
          <span>
            {selectedCount} de {hasActiveFilters && filteredCount ? filteredCount : totalItems} seleccionados
          </span>
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={disabled}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground underline"
            >
              Limpiar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};