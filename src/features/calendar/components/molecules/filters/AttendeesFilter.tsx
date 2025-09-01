"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { 
  UserGroupIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { SearchInput } from "../../atoms/inputs/SearchInput";

interface AttendeesFilterProps {
  events: GoogleCalendarEvent[];
  selectedAttendees: string[];
  onSelectionChange: (attendees: string[]) => void;
  isLoading?: boolean;
}

export const AttendeesFilter: React.FC<AttendeesFilterProps> = ({
  events,
  selectedAttendees,
  onSelectionChange,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extraer todos los attendees únicos de todos los eventos
  const allAttendees = useMemo(() => {
    const attendeeMap = new Map<string, { email: string; displayName?: string; count: number }>();
    
    events.forEach(event => {
      if (event.attendees) {
        event.attendees.forEach(attendee => {
          if (attendee.email) {
            const existing = attendeeMap.get(attendee.email);
            if (existing) {
              existing.count++;
              // Actualizar displayName si no lo tenía
              if (!existing.displayName && attendee.displayName) {
                existing.displayName = attendee.displayName;
              }
            } else {
              attendeeMap.set(attendee.email, {
                email: attendee.email,
                displayName: attendee.displayName,
                count: 1
              });
            }
          }
        });
      }
    });

    return Array.from(attendeeMap.values()).sort((a, b) => {
      // Primero por frecuencia (más eventos), luego alfabético
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.email.localeCompare(b.email);
    });
  }, [events]);

  // Filtrar attendees basado en la búsqueda
  const filteredAttendees = useMemo(() => {
    if (!searchTerm) return allAttendees;
    
    const search = searchTerm.toLowerCase();
    return allAttendees.filter(attendee => 
      attendee.email.toLowerCase().includes(search) ||
      (attendee.displayName && attendee.displayName.toLowerCase().includes(search))
    );
  }, [allAttendees, searchTerm]);

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

  const handleToggleAttendee = (email: string) => {
    const newSelection = selectedAttendees.includes(email)
      ? selectedAttendees.filter(a => a !== email)
      : [...selectedAttendees, email];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(filteredAttendees.map(a => a.email));
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  const getAttendeeDisplayName = (attendee: { email: string; displayName?: string }) => {
    return attendee.displayName || attendee.email.split('@')[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center justify-between min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <UserGroupIcon className="h-4 w-4" />
          <span>
            {selectedAttendees.length === 0 
              ? "Todos los invitados"
              : `${selectedAttendees.length} invitado${selectedAttendees.length !== 1 ? 's' : ''}`
            }
          </span>
        </div>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Badges de attendees seleccionados */}
      {selectedAttendees.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedAttendees.slice(0, 3).map(email => {
            const attendee = allAttendees.find(a => a.email === email);
            return (
              <Badge 
                key={email} 
                className="bg-card-foreground text-card border-card-foreground/20 font-semibold shadow-sm text-xs flex items-center gap-1"
              >
                {attendee ? getAttendeeDisplayName(attendee) : email.split('@')[0]}
                <button
                  onClick={() => handleToggleAttendee(email)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {selectedAttendees.length > 3 && (
            <Badge className="bg-muted text-muted-foreground border-border font-semibold shadow-sm text-xs">
              +{selectedAttendees.length - 3} más
            </Badge>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-xl">
          {/* Header */}
          <div className="p-4 border-b bg-muted border-border rounded-t-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Filtrar por Invitados</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            
            {/* Búsqueda */}
            <SearchInput
              placeholder="Buscar invitados..."
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
                disabled={isLoading}
                className="text-xs h-7"
              >
                Seleccionar todos ({filteredAttendees.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectNone}
                disabled={isLoading}
                className="text-xs h-7"
              >
                Deseleccionar todos
              </Button>
            </div>
          </div>

          {/* Lista de attendees */}
          <div className="max-h-64 overflow-y-auto">
            {filteredAttendees.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron invitados
              </div>
            ) : (
              <div className="p-2">
                {filteredAttendees.map((attendee) => {
                  const isSelected = selectedAttendees.includes(attendee.email);
                  
                  return (
                    <div
                      key={attendee.email}
                      className="flex items-center gap-3 p-2 hover:bg-accent/50 rounded cursor-pointer transition-colors"
                      onClick={() => handleToggleAttendee(attendee.email)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Manejado por el onClick del div
                        className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2 focus:ring-offset-2"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          {getAttendeeDisplayName(attendee)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {attendee.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {attendee.count} evento{attendee.count !== 1 ? 's' : ''}
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
            {selectedAttendees.length > 0 ? (
              <>Filtrando por {selectedAttendees.length} de {allAttendees.length} invitados</>
            ) : (
              <>Mostrando eventos de todos los {allAttendees.length} invitados</>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Loading skeleton
export const AttendeesFilterSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-10 w-48 bg-muted rounded-md" />
  </div>
);