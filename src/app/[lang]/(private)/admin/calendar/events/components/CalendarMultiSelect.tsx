"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCalendarFiltersStore } from "@/src/stores/calendarFiltersStore";

interface Calendar {
  id: string;
  summary: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

interface CalendarMultiSelectProps {
  calendars: Calendar[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const CalendarMultiSelect: React.FC<CalendarMultiSelectProps> = ({
  calendars,
  onSelectionChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    activeCalendars, 
    toggleCalendar, 
    setActiveCalendars 
  } = useCalendarFiltersStore();

  // Filter calendars based on search term
  const filteredCalendars = calendars.filter(calendar =>
    calendar.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(""); // Clear search when closing
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(activeCalendars);
    }
  }, [activeCalendars, onSelectionChange]);

  const handleToggleCalendar = (calendarId: string) => {
    toggleCalendar(calendarId);
  };

  const handleSelectAll = () => {
    const allIds = calendars.map(cal => cal.id);
    setActiveCalendars(allIds);
  };

  const handleSelectNone = () => {
    setActiveCalendars([]);
  };

  const handleSelectFiltered = () => {
    const filteredIds = filteredCalendars.map(cal => cal.id);
    const newSelection = [...new Set([...activeCalendars, ...filteredIds])];
    setActiveCalendars(newSelection);
  };

  const selectedCount = activeCalendars.length;
  const totalCount = calendars.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between text-left font-normal"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {selectedCount === 0 
              ? "Seleccionar calendarios"
              : selectedCount === totalCount
                ? "Todos los calendarios"
                : `${selectedCount} calendario${selectedCount > 1 ? 's' : ''}`
            }
          </span>
          {selectedCount > 0 && selectedCount < totalCount && (
            <Badge variant="secondary" className="text-xs">
              {selectedCount}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search bar */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar calendarios..."
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Header with select all/none */}
          <div className="sticky top-[65px] bg-gray-50 border-b border-gray-200 p-2">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-6 px-2 text-xs"
              >
                Todos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectNone}
                className="h-6 px-2 text-xs"
              >
                Ninguno
              </Button>
              {searchTerm && filteredCalendars.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectFiltered}
                  className="h-6 px-2 text-xs text-blue-600"
                >
                  Filtrados
                </Button>
              )}
            </div>
          </div>

          {/* Calendar options */}
          <div className="p-1 max-h-48 overflow-y-auto">
            {filteredCalendars.map((calendar) => {
              const isSelected = activeCalendars.includes(calendar.id);
              
              return (
                <div
                  key={calendar.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                  onClick={() => handleToggleCalendar(calendar.id)}
                >
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    isSelected 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  
                  {/* Calendar Color */}
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                    style={{ 
                      backgroundColor: calendar.backgroundColor || '#4285f4',
                      border: `2px solid ${calendar.foregroundColor || '#ffffff'}`
                    }}
                    title={`Color: ${calendar.colorId || 'default'}`}
                  />
                  
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-gray-900">
                      {calendar.summary}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No results message */}
          {filteredCalendars.length === 0 && searchTerm && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No se encontraron calendarios que coincidan con &quot;{searchTerm}&quot;
            </div>
          )}

          {calendars.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No hay calendarios disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};