"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { 
  CalendarIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { SearchInput } from "../../atoms/inputs/SearchInput";

interface CalendarOption {
  id: string;
  summary: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

interface CalendarMultiSelectProps {
  calendars: CalendarOption[];
  selectedCalendars: string[];
  onSelectionChange: (calendarIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  maxSelectedDisplay?: number;
}

export const CalendarMultiSelect: React.FC<CalendarMultiSelectProps> = ({
  calendars,
  selectedCalendars,
  onSelectionChange,
  placeholder = "Seleccionar calendarios...",
  disabled = false,
  isLoading = false,
  className = "",
  maxSelectedDisplay = 2,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar calendarios basado en la búsqueda
  const filteredCalendars = calendars.filter((calendar) =>
    calendar.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleCalendar = (calendarId: string) => {
    const newSelection = selectedCalendars.includes(calendarId)
      ? selectedCalendars.filter(id => id !== calendarId)
      : [...selectedCalendars, calendarId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(filteredCalendars.map(cal => cal.id));
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 288; // max-h-72 = 288px
    const spaceBelow = viewportHeight - buttonRect.bottom - 20; // 20px buffer
    const spaceAbove = buttonRect.top - 20; // 20px buffer
    
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow && spaceAbove > 200) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom');
    }
  };

  const handleToggleDropdown = () => {
    if (!disabled && !isLoading) {
      if (!isOpen) {
        calculateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  const getDisplayText = () => {
    if (selectedCalendars.length === 0) return placeholder;
    if (selectedCalendars.length === 1) {
      const calendar = calendars.find(cal => cal.id === selectedCalendars[0]);
      return calendar?.summary || placeholder;
    }
    return `${selectedCalendars.length} calendarios seleccionados`;
  };

  const getSelectedCalendars = () => {
    return calendars.filter(cal => selectedCalendars.includes(cal.id));
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={handleToggleDropdown}
        disabled={disabled || isLoading}
        className="w-full justify-between min-w-[250px]"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span className="truncate">{getDisplayText()}</span>
        </div>
        <ChevronDownIcon 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {/* Badges de calendarios seleccionados */}
      {selectedCalendars.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {getSelectedCalendars().slice(0, maxSelectedDisplay).map((calendar) => (
            <Badge 
              key={calendar.id}
              style={{ 
                backgroundColor: calendar.backgroundColor || '#f3f4f6',
                color: calendar.foregroundColor || '#374151'
              }}
              className="text-xs px-2 py-1 flex items-center gap-1 border"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: calendar.foregroundColor || '#374151' }}
              />
              {calendar.summary.length > 15 
                ? `${calendar.summary.substring(0, 15)}...` 
                : calendar.summary
              }
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCalendar(calendar.id);
                }}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedCalendars.length > maxSelectedDisplay && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              +{selectedCalendars.length - maxSelectedDisplay} más
            </Badge>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 w-full bg-background border border-border rounded-lg shadow-xl max-h-72 overflow-hidden ${
          dropdownPosition === 'top' 
            ? 'bottom-full mb-1' 
            : 'top-full mt-1'
        }`}>
          {/* Header con búsqueda */}
          <div className="p-3 border-b bg-muted border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Seleccionar Calendarios</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            
            <SearchInput
              placeholder="Buscar calendarios..."
              value={searchTerm}
              onChange={setSearchTerm}
              isLoading={isLoading}
            />
          </div>

          {/* Acciones rápidas */}
          <div className="p-3 border-b bg-muted border-border">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isLoading || filteredCalendars.length === 0}
                className="text-xs h-7"
              >
                <CheckIcon className="h-3 w-3 mr-1" />
                Todos ({filteredCalendars.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectNone}
                disabled={isLoading || selectedCalendars.length === 0}
                className="text-xs h-7"
              >
                <XMarkIcon className="h-3 w-3 mr-1" />
                Ninguno
              </Button>
            </div>
          </div>

          {/* Lista de calendarios */}
          <div className="max-h-32 overflow-y-auto">
            {filteredCalendars.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchTerm ? 'No se encontraron calendarios' : 'No hay calendarios disponibles'}
              </div>
            ) : (
              <div className="p-2">
                {filteredCalendars.map((calendar) => {
                  const isSelected = selectedCalendars.includes(calendar.id);
                  
                  return (
                    <div
                      key={calendar.id}
                      className="flex items-center gap-3 p-2 hover:bg-accent/50 rounded cursor-pointer transition-colors"
                      onClick={() => handleToggleCalendar(calendar.id)}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => {}} // Manejado por el onClick del div
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      
                      <div
                        className="w-3 h-3 rounded-full border flex-shrink-0"
                        style={{ 
                          backgroundColor: calendar.backgroundColor || '#f3f4f6',
                          borderColor: calendar.foregroundColor || '#d1d5db'
                        }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">
                          {calendar.summary}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {calendar.colorId && `Color ID: ${calendar.colorId}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer con estadísticas */}
          <div className="p-3 border-t bg-muted border-border text-xs text-muted-foreground">
            {selectedCalendars.length} de {calendars.length} calendarios seleccionados
          </div>
        </div>
      )}
    </div>
  );
};

// Loading skeleton
export const CalendarMultiSelectSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-10 w-64 bg-muted rounded-md" />
  </div>
);