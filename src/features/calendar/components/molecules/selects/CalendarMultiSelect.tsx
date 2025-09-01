/**
 * CalendarMultiSelect - Molecular Component
 * 
 * Selector múltiple de calendarios usando Checkbox de shadcn
 * Mantiene estética IDÉNTICA con componentes shadcn
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Separator } from "@/src/components/ui/separator";
import { 
  CalendarDaysIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { SearchInput } from "../../atoms/inputs/SearchInput";
import { cn } from "@/src/lib/utils";

interface Calendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  selected?: boolean;
  primary?: boolean;
}

interface CalendarMultiSelectProps {
  calendars: Calendar[];
  selectedCalendarIds: string[];
  onSelectionChange: (calendarIds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  maxDisplayed?: number;
  allowSelectAll?: boolean;
}

export const CalendarMultiSelect: React.FC<CalendarMultiSelectProps> = ({
  calendars,
  selectedCalendarIds,
  onSelectionChange,
  placeholder = "Seleccionar calendarios...",
  className,
  disabled = false,
  isLoading = false,
  maxDisplayed = 3,
  allowSelectAll = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar calendarios basado en la búsqueda
  const filteredCalendars = calendars.filter(calendar =>
    calendar.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (calendar.description && calendar.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCalendars = calendars.filter(calendar => 
    selectedCalendarIds.includes(calendar.id)
  );

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleCalendar = (calendarId: string) => {
    const newSelection = selectedCalendarIds.includes(calendarId)
      ? selectedCalendarIds.filter(id => id !== calendarId)
      : [...selectedCalendarIds, calendarId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(filteredCalendars.map(calendar => calendar.id));
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  const displayedCalendars = selectedCalendars.slice(0, maxDisplayed);
  const remainingCount = selectedCalendars.length - maxDisplayed;

  const getCalendarColor = (calendar: Calendar) => {
    return calendar.backgroundColor || "#6366f1";
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-full bg-muted rounded-md" />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center space-x-2">
          <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {selectedCalendars.length === 0 
              ? placeholder
              : `${selectedCalendars.length} calendario${selectedCalendars.length > 1 ? 's' : ''}`
            }
          </span>
        </div>
        <ChevronDownIcon 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </Button>

      {/* Selected calendars badges */}
      {selectedCalendars.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {displayedCalendars.map((calendar) => (
            <Badge
              key={calendar.id}
              variant="secondary"
              className="flex items-center space-x-1 pr-1"
              style={{ borderLeftColor: getCalendarColor(calendar), borderLeftWidth: '3px' }}
            >
              <span className="text-xs truncate max-w-32">
                {calendar.summary}
                {calendar.primary && " (Principal)"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleCalendar(calendar.id)}
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <XMarkIcon className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" className="text-xs">
              +{remainingCount} más
            </Badge>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-xl">
          {/* Header */}
          <div className="p-4 border-b bg-muted border-border rounded-t-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Seleccionar Calendarios</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            
            {/* Búsqueda */}
            <SearchInput
              placeholder="Buscar calendarios..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          {/* Acciones rápidas */}
          {allowSelectAll && (
            <div className="p-3 border-b bg-muted border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs h-7"
                >
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Todos ({filteredCalendars.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectNone}
                  className="text-xs h-7"
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Ninguno
                </Button>
              </div>
            </div>
          )}

          {/* Lista de calendarios */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCalendars.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron calendarios
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredCalendars.map((calendar) => {
                  const isSelected = selectedCalendarIds.includes(calendar.id);
                  
                  return (
                    <div
                      key={calendar.id}
                      className="flex items-center gap-3 p-2 hover:bg-accent/50 rounded cursor-pointer transition-colors"
                      onClick={() => handleToggleCalendar(calendar.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleCalendar(calendar.id)}
                        className="pointer-events-none"
                      />
                      
                      {/* Color indicator */}
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCalendarColor(calendar) }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground flex items-center gap-1">
                          {calendar.summary}
                          {calendar.primary && (
                            <Badge variant="outline" className="text-xs">
                              Principal
                            </Badge>
                          )}
                        </div>
                        {calendar.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {calendar.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer con estadísticas */}
          <div className="p-3 border-t bg-muted border-border text-xs text-muted-foreground">
            {selectedCalendars.length > 0 ? (
              <>Seleccionados {selectedCalendars.length} de {calendars.length} calendarios</>
            ) : (
              <>0 de {calendars.length} calendarios seleccionados</>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

CalendarMultiSelect.displayName = "CalendarMultiSelect";