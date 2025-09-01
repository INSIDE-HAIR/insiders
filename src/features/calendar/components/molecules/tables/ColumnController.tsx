/**
 * ColumnController - Molecular Component
 * 
 * Controller IDÉNTICO estéticamente al original ColumnController.tsx
 * + Estado de loading con skeleton
 * Copiado exacto de: ColumnController.tsx líneas completas (solo UI, lógica intacta)
 */

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
import { SkeletonBox } from "../../atoms/loading/SkeletonBox";

// Copiado exacto líneas 15-274 - AVAILABLE_COLUMNS definición completa
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
    defaultVisible: false
  },
  
  // Participantes del Meeting
  meetMembers: {
    id: "meetMembers",
    label: "Participantes",
    description: "Participantes del meeting (invitados del calendario)",
    category: "Meeting",
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
    description: "Fecha de creación del evento",
    category: "Metadatos",
    defaultVisible: false
  },
  updated: {
    id: "updated", 
    label: "Última Modificación",
    description: "Fecha de última modificación",
    category: "Metadatos",
    defaultVisible: false
  },
  creator: {
    id: "creator",
    label: "Creador",
    description: "Persona que creó el evento",
    category: "Participantes",
    defaultVisible: false
  },
  organizer: {
    id: "organizer",
    label: "Organizador",
    description: "Organizador principal del evento",
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
    description: "Si el tiempo aparece como ocupado",
    category: "Configuración",
    defaultVisible: false
  },
  htmlLink: {
    id: "htmlLink",
    label: "Enlace Web",
    description: "Enlace web al evento en Google Calendar",
    category: "Enlaces",
    defaultVisible: false
  },
  hangoutLink: {
    id: "hangoutLink",
    label: "Google Meet",
    description: "Enlace de Google Meet para videoconferencia",
    category: "Meet/Conferencia",
    defaultVisible: true
  },
  
  // Propiedades específicas de conferencia
  conferenceData: {
    id: "conferenceData",
    label: "Datos Conferencia",
    description: "Información detallada de la conferencia (Meet, Zoom, etc.)",
    category: "Meet/Conferencia",
    defaultVisible: false
  },
  meetingId: {
    id: "meetingId",
    label: "ID Reunión",
    description: "Identificador único de la reunión",
    category: "Meet/Conferencia",  
    defaultVisible: false
  },
  meetingCode: {
    id: "meetingCode",
    label: "Código Reunión",
    description: "Código corto para acceder a la reunión",
    category: "Meet/Conferencia",
    defaultVisible: false
  },
  meetingPhone: {
    id: "meetingPhone",
    label: "Acceso Telefónico",
    description: "Información de acceso telefónico a la reunión",
    category: "Meet/Conferencia",
    defaultVisible: false
  },
  meetingNotes: {
    id: "meetingNotes",
    label: "Notas Meet",
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
  },
  
  // Propiedades adicionales de Google Calendar API
  sequence: {
    id: "sequence",
    label: "Secuencia",
    description: "Número de secuencia del evento",
    category: "Metadatos",
    defaultVisible: false
  },
  recurringEventId: {
    id: "recurringEventId",
    label: "ID Recurrencia",
    description: "ID del evento recurrente principal",
    category: "Recurrencia",
    defaultVisible: false
  },
  recurrence: {
    id: "recurrence",
    label: "Reglas Recurrencia",
    description: "Reglas de recurrencia del evento",
    category: "Recurrencia",
    defaultVisible: false
  },
  originalStartTime: {
    id: "originalStartTime",
    label: "Hora Inicio Original",
    description: "Hora de inicio original para instancias de eventos recurrentes",
    category: "Recurrencia",
    defaultVisible: false
  },
  iCalUID: {
    id: "iCalUID",
    label: "iCal UID",
    description: "Identificador único iCal del evento",
    category: "Metadatos",
    defaultVisible: false
  }
};

interface ColumnControllerProps {
  visibleColumns: string[];
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  isLoading?: boolean;
}

export const ColumnController: React.FC<ColumnControllerProps> = ({
  visibleColumns,
  onColumnVisibilityChange,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Loading skeleton
  if (isLoading) {
    return (
      <SkeletonBox width={120} height={32} rounded="md" />
    );
  }

  // Obtener categorías únicas - copiado exacto línea 291
  const categories = ["all", ...new Set(Object.values(AVAILABLE_COLUMNS).map(col => col.category))];

  // Filtrar columnas - copiado exacto líneas 293-299
  const filteredColumns = Object.values(AVAILABLE_COLUMNS).filter(column => {
    const matchesSearch = column.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         column.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || column.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Close dropdown on outside click
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

  const visibleCount = visibleColumns.length;
  const totalCount = Object.keys(AVAILABLE_COLUMNS).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4" />
        Columnas ({visibleCount}/{totalCount})
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                Configurar Columnas
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Buscar columnas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs h-6 px-2"
                >
                  {category === "all" ? "Todas" : category}
                </Button>
              ))}
            </div>

            {/* Columns List */}
            <div className="space-y-2">
              {filteredColumns.map(column => {
                const isVisible = visibleColumns.includes(column.id);
                
                return (
                  <div
                    key={column.id}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleToggleColumn(column.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isVisible ? (
                        <EyeIcon className="h-4 w-4 text-primary" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${
                          isVisible ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {column.label}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0"
                        >
                          {column.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {column.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {isVisible && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Stats */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {visibleCount} de {totalCount} columnas visibles
                </span>
                <span>
                  {filteredColumns.length} resultados
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ColumnController.displayName = "ColumnController";