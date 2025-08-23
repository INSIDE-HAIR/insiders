import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export interface FilterOption<T = string> {
  value: T;
  label: string;
  count?: number; // Para mostrar cantidad de elementos
  disabled?: boolean;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
}

export type FilterSelectSize = "sm" | "default" | "lg";

export interface FilterSelectProps<T = string> {
  options: FilterOption<T>[];
  value?: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  size?: FilterSelectSize;
  disabled?: boolean;
  showCounts?: boolean; // Mostrar contadores en las opciones
  clearable?: boolean;  // Permitir limpiar selección
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  label?: string;
  description?: string;
}

/**
 * Select molecular especializado para filtros con contadores y badges
 * Optimizado para filtrar listas con feedback visual de cantidad de elementos
 * 
 * @example
 * <FilterSelect 
 *   options={[
 *     { value: "all", label: "Todos", count: 27 },
 *     { value: "cohost", label: "Co-anfitrión", count: 3 },
 *     { value: "participant", label: "Participante", count: 24 }
 *   ]}
 *   value={selectedFilter}
 *   onValueChange={setSelectedFilter}
 *   placeholder="Filtrar por rol"
 *   showCounts
 * />
 * 
 * <FilterSelect 
 *   options={memberStatusOptions}
 *   value={statusFilter}  
 *   onValueChange={handleStatusFilter}
 *   size="sm"
 *   clearable
 * />
 */
export const FilterSelect = <T extends string = string>({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  size = "default",
  disabled = false,
  showCounts = false,
  clearable = false,
  className,
  triggerClassName,
  contentClassName,
  label,
  description
}: FilterSelectProps<T>) => {
  
  // Manejar cambio de valor incluyendo clear
  const handleValueChange = (newValue: string) => {
    if (newValue === "__clear__" && clearable) {
      onValueChange("" as T);
      return;
    }
    onValueChange(newValue as T);
  };

  // Obtener opción seleccionada
  const selectedOption = options.find(option => option.value === value);
  
  // Clases de tamaño
  const sizeClasses = {
    sm: "h-8 text-sm",
    default: "h-10 text-sm",
    lg: "h-12 text-base"
  };

  // Calcular total de elementos si showCounts
  const totalCount = showCounts ? options.reduce((sum, option) => sum + (option.count || 0), 0) : 0;

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      {/* Label opcional */}
      {label && (
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-foreground">
            {label}
            {showCounts && totalCount > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {totalCount} total
              </Badge>
            )}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <Select
        value={value || ""}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className={cn(
            sizeClasses[size],
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent className={cn("min-w-[200px]", contentClassName)}>
          {/* Opción para limpiar si está habilitada */}
          {clearable && value && (
            <>
              <SelectItem value="__clear__" className="text-muted-foreground italic">
                Limpiar filtro
              </SelectItem>
              <div className="border-t border-border my-1" />
            </>
          )}
          
          {/* Opciones normales */}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                option.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex-1">{option.label}</span>
                
                <div className="flex items-center gap-2 ml-2">
                  {/* Badge personalizado */}
                  {option.badge && (
                    <Badge 
                      variant={option.badge.variant || "secondary"}
                      className="text-xs"
                    >
                      {option.badge.text}
                    </Badge>
                  )}
                  
                  {/* Contador */}
                  {showCounts && typeof option.count === 'number' && (
                    <Badge variant="outline" className="text-xs min-w-[20px] text-center">
                      {option.count}
                    </Badge>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
          
          {/* Mensaje si no hay opciones */}
          {options.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No hay opciones disponibles
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};