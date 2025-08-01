"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { 
  AdjustmentsHorizontalIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { useCalendarFiltersStore } from "@/src/stores/calendarFiltersStore";

// Todas las propiedades disponibles de Google Calendar Events
export const AVAILABLE_COLUMNS = {
  // Propiedades básicas
  summary: {
    id: "summary",
    label: "Título",
    description: "Título del evento",
    category: "Básico",
    defaultVisible: true
  },
  start: {
    id: "start",
    label: "Fecha/Hora Inicio",
    description: "Fecha y hora de inicio del evento",
    category: "Tiempo",
    defaultVisible: true
  },
  end: {
    id: "end", 
    label: "Fecha/Hora Fin",
    description: "Fecha y hora de finalización del evento",
    category: "Tiempo",
    defaultVisible: false
  },
  status: {
    id: "status",
    label: "Estado",
    description: "Estado del evento (próximo, en curso, pasado)",
    category: "Estado",
    defaultVisible: true
  },
  location: {
    id: "location",
    label: "Ubicación",
    description: "Ubicación física o virtual del evento",
    category: "Básico",
    defaultVisible: true
  },
  attendees: {
    id: "attendees",
    label: "Invitados",
    description: "Lista de personas invitadas al evento",
    category: "Participantes",
    defaultVisible: true
  },
  description: {
    id: "description",
    label: "Descripción",
    description: "Descripción detallada del evento",
    category: "Básico",
    defaultVisible: true
  },
  
  // Propiedades adicionales disponibles
  created: {
    id: "created",
    label: "Fecha Creación",
    description: "Cuándo se creó el evento",
    category: "Metadatos",
    defaultVisible: false
  },
  updated: {
    id: "updated",
    label: "Última Modificación", 
    description: "Cuándo se modificó por última vez",
    category: "Metadatos",
    defaultVisible: false
  },
  creator: {
    id: "creator",
    label: "Creador",
    description: "Quien creó el evento",
    category: "Participantes",
    defaultVisible: false
  },
  organizer: {
    id: "organizer",
    label: "Organizador",
    description: "Quien organiza el evento",
    category: "Participantes",
    defaultVisible: false
  },
  visibility: {
    id: "visibility",
    label: "Visibilidad",
    description: "Nivel de visibilidad del evento",
    category: "Configuración",
    defaultVisible: false
  },
  transparency: {
    id: "transparency",
    label: "Transparencia",
    description: "Si el evento muestra tiempo ocupado/libre",
    category: "Configuración",
    defaultVisible: false
  },
  sequence: {
    id: "sequence",
    label: "Secuencia",
    description: "Número de revisión del evento",
    category: "Metadatos",
    defaultVisible: false
  },
  recurringEventId: {
    id: "recurringEventId",
    label: "ID Evento Recurrente",
    description: "ID del evento recurrente padre",
    category: "Recurrencia",
    defaultVisible: false
  },
  recurrence: {
    id: "recurrence",
    label: "Regla Recurrencia",
    description: "Reglas de repetición del evento",
    category: "Recurrencia",
    defaultVisible: false
  },
  originalStartTime: {
    id: "originalStartTime",
    label: "Hora Inicio Original",
    description: "Hora original de eventos recurrentes modificados",
    category: "Recurrencia",
    defaultVisible: false
  },
  iCalUID: {
    id: "iCalUID",
    label: "iCal UID",
    description: "Identificador único iCalendar",
    category: "Metadatos",
    defaultVisible: false
  },
  htmlLink: {
    id: "htmlLink",
    label: "Enlace Web",
    description: "URL para ver el evento en Google Calendar",
    category: "Enlaces",
    defaultVisible: false
  },
  hangoutLink: {
    id: "hangoutLink",
    label: "Enlace Meet",
    description: "URL de Google Meet si está configurado",
    category: "Meet/Conferencia",
    defaultVisible: true
  },
  conferenceData: {
    id: "conferenceData",
    label: "Datos Conferencia",
    description: "Información completa de videoconferencia",
    category: "Meet/Conferencia",
    defaultVisible: true
  },
  meetingId: {
    id: "meetingId",
    label: "ID de Reunión",
    description: "Identificador único de la reunión de Meet",
    category: "Meet/Conferencia",
    defaultVisible: false
  },
  meetingCode: {
    id: "meetingCode",
    label: "Código de Reunión",
    description: "Código de acceso rápido para Meet",
    category: "Meet/Conferencia",
    defaultVisible: false
  },
  meetingPhone: {
    id: "meetingPhone",
    label: "Teléfono de Acceso",
    description: "Números de teléfono para acceso por llamada",
    category: "Meet/Conferencia",
    defaultVisible: false
  },
  meetingNotes: {
    id: "meetingNotes",
    label: "Notas de Reunión",
    description: "Notas adicionales sobre el acceso a Meet",
    category: "Meet/Conferencia",
    defaultVisible: false
  },
  anyoneCanAddSelf: {
    id: "anyoneCanAddSelf",
    label: "Auto-invitación",
    description: "Si cualquiera puede agregarse al evento",
    category: "Configuración",
    defaultVisible: false
  },
  guestsCanInviteOthers: {
    id: "guestsCanInviteOthers",
    label: "Invitados Pueden Invitar",
    description: "Si los invitados pueden invitar a otros",
    category: "Configuración",
    defaultVisible: false
  },
  guestsCanModify: {
    id: "guestsCanModify",
    label: "Invitados Pueden Modificar",
    description: "Si los invitados pueden modificar el evento",
    category: "Configuración",
    defaultVisible: false
  },
  guestsCanSeeOtherGuests: {
    id: "guestsCanSeeOtherGuests",
    label: "Ver Otros Invitados",
    description: "Si los invitados pueden ver la lista completa",
    category: "Configuración",
    defaultVisible: false
  },
  privateCopy: {
    id: "privateCopy",
    label: "Copia Privada",
    description: "Si es una copia privada del evento",
    category: "Configuración",
    defaultVisible: false
  },
  locked: {
    id: "locked",
    label: "Bloqueado",
    description: "Si el evento está bloqueado para edición",
    category: "Estado",
    defaultVisible: false
  },
  source: {
    id: "source",
    label: "Fuente",
    description: "Fuente externa del evento",
    category: "Metadatos",
    defaultVisible: false
  },
  colorId: {
    id: "colorId",
    label: "ID Color",
    description: "ID del color asignado al evento",
    category: "Apariencia",
    defaultVisible: false
  },
  eventType: {
    id: "eventType",
    label: "Tipo Evento",
    description: "Tipo de evento (default, outOfOffice, etc.)",
    category: "Configuración",
    defaultVisible: false
  },
  calendar: {
    id: "calendar",
    label: "Calendario",
    description: "Calendario al que pertenece el evento",
    category: "Básico",
    defaultVisible: true
  }
};

interface ColumnControllerProps {
  visibleColumns: string[];
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
}

export const ColumnController: React.FC<ColumnControllerProps> = ({
  visibleColumns,
  onColumnVisibilityChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener categorías únicas
  const categories = ["all", ...new Set(Object.values(AVAILABLE_COLUMNS).map(col => col.category))];

  // Filtrar columnas
  const filteredColumns = Object.values(AVAILABLE_COLUMNS).filter(column => {
    const matchesSearch = column.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         column.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || column.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleToggleColumn = (columnId: string) => {
    const isVisible = visibleColumns.includes(columnId);
    onColumnVisibilityChange(columnId, !isVisible);
  };

  const handleShowDefaults = () => {
    Object.values(AVAILABLE_COLUMNS).forEach(column => {
      onColumnVisibilityChange(column.id, column.defaultVisible);
    });
  };

  const handleShowAll = () => {
    Object.values(AVAILABLE_COLUMNS).forEach(column => {
      onColumnVisibilityChange(column.id, true);
    });
  };

  const handleHideAll = () => {
    Object.values(AVAILABLE_COLUMNS).forEach(column => {
      onColumnVisibilityChange(column.id, false);
    });
  };

  const visibleCount = visibleColumns.length;
  const totalCount = Object.keys(AVAILABLE_COLUMNS).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        size="sm"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4" />
        Columnas
        <Badge variant="secondary" className="ml-1">
          {visibleCount}/{totalCount}
        </Badge>
      </Button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Gestionar Columnas</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            
            {/* Búsqueda */}
            <input
              type="text"
              placeholder="Buscar columnas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Filtros de categoría */}
            <div className="flex flex-wrap gap-1 mt-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === "all" ? "Todas" : category}
                </button>
              ))}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="p-3 border-b bg-gray-50">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowDefaults}
                className="text-xs h-7"
              >
                Por Defecto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowAll}
                className="text-xs h-7"
              >
                Mostrar Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHideAll}
                className="text-xs h-7"
              >
                Ocultar Todas
              </Button>
            </div>
          </div>

          {/* Lista de columnas */}
          <div className="max-h-96 overflow-y-auto">
            {filteredColumns.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No se encontraron columnas
              </div>
            ) : (
              <div className="p-2">
                {filteredColumns.map((column) => {
                  const isVisible = visibleColumns.includes(column.id);
                  
                  return (
                    <div
                      key={column.id}
                      className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                      onClick={() => handleToggleColumn(column.id)}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isVisible ? (
                          <EyeIcon className="h-4 w-4 text-blue-600" />
                        ) : (
                          <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            isVisible ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {column.label}
                          </span>
                          {column.defaultVisible && (
                            <Badge variant="outline" className="text-xs px-1">
                              Por defecto
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {column.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {column.category}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {column.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};