/**
 * EVENTDETAILSMODAL - Modal para mostrar y editar detalles de eventos de calendario
 * Utiliza el patrón de secciones navegables con ResponsiveModal
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React, { lazy, useMemo } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { SectionNavigationModal } from "./SectionNavigationModal";
import { Button } from "@/src/components/ui/button";
import { toast } from "@/src/components/ui/use-toast";
import { 
  InformationCircleIcon,
  PencilSquareIcon,
  UserGroupIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

// Lazy load de las secciones
const GeneralSection = lazy(() => import("../../organisms/sections/GeneralSection").then(m => ({ default: m.GeneralSection })));
const EditSection = lazy(() => import("../../organisms/sections/EditSection").then(m => ({ default: m.EditSection })));
const ParticipantsSection = lazy(() => import("../../organisms/sections/ParticipantsSection").then(m => ({ default: m.ParticipantsSection })));

interface EventDetailsModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Evento a mostrar/editar */
  event: GoogleCalendarEvent | null;
  /** Lista de calendarios disponibles */
  calendars?: Array<{
    id: string;
    summary: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
  /** ID del calendario del evento */
  calendarId?: string;
  /** Callback para guardar cambios */
  onSave?: (updatedEvent: Partial<GoogleCalendarEvent>) => Promise<void>;
  /** Callback para eliminar evento */
  onDelete?: () => Promise<void>;
  /** Sección inicial a mostrar */
  initialSection?: "general" | "edit" | "participants";
  /** Variante del modal */
  variant?: "top" | "bottom" | "left" | "right";
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  calendars = [],
  calendarId = "primary",
  onSave,
  onDelete,
  initialSection = "general",
  variant = "bottom",
}) => {
  // Props globales para todas las secciones
  const globalProps = useMemo(() => ({
    event,
    calendars,
    calendarId,
    onSave,
    onDelete,
  }), [event, calendars, calendarId, onSave, onDelete]);

  // Configuración de secciones
  const sections = useMemo(() => [
    {
      id: "general",
      title: "Información General",
      icon: InformationCircleIcon,
      description: "Detalles básicos del evento",
      component: GeneralSection,
      props: {
        event,
        calendars,
      },
      searchable: true,
      keywords: ["información", "general", "detalles", "fecha", "hora", "ubicación"],
    },
    {
      id: "edit",
      title: "Editar Evento",
      icon: PencilSquareIcon,
      description: "Modificar los datos del evento",
      component: EditSection,
      props: {
        event,
        calendars,
        onSave: async (updatedEvent: Partial<GoogleCalendarEvent>) => {
          if (onSave) {
            try {
              await onSave(updatedEvent);
              // El toast se muestra desde EditSection
            } catch (error) {
              // El error se maneja desde EditSection
              throw error;
            }
          }
        },
      },
      searchable: true,
      keywords: ["editar", "modificar", "cambiar", "actualizar", "guardar"],
    },
    {
      id: "participants",
      title: "Participantes",
      icon: UserGroupIcon,
      description: "Lista de asistentes y sus respuestas",
      component: ParticipantsSection,
      props: {
        event,
      },
      searchable: true,
      keywords: ["participantes", "asistentes", "invitados", "respuestas", "confirmados"],
    },
  ], [event, calendars, onSave]);

  // Footer personalizado con acciones
  const customFooter = useMemo(() => {
    if (!event) return null;

    return (
      <div className="flex items-center justify-between w-full">
        <div className="text-sm text-muted-foreground">
          {event.status === 'confirmed' ? '✓ Evento confirmado' : 
           event.status === 'tentative' ? '⚠ Evento tentativo' : 
           '❓ Estado desconocido'}
        </div>
        
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                const confirmed = confirm("¿Estás seguro de que quieres eliminar este evento?");
                if (confirmed && onDelete) {
                  try {
                    await onDelete();
                    toast({
                      title: "Evento eliminado",
                      description: "El evento se eliminó correctamente",
                      duration: 3000,
                    });
                    onClose();
                  } catch (error: any) {
                    toast({
                      title: "Error",
                      description: error.message || "Error al eliminar el evento",
                      variant: "destructive",
                      duration: 5000,
                    });
                  }
                }
              }}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    );
  }, [event, onDelete, onClose]);

  // Si no hay evento, no mostrar el modal
  if (!event) return null;

  const eventTitle = event.summary || "Evento sin título";
  const eventDate = event.start?.dateTime 
    ? new Date(event.start.dateTime).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    : event.start?.date 
      ? new Date(event.start.date).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })
      : "";

  return (
    <SectionNavigationModal
      isOpen={isOpen}
      onClose={onClose}
      sections={sections}
      title={eventTitle}
      description={eventDate ? `${eventDate}` : undefined}
      initialSectionId={initialSection}
      variant={variant}
      globalProps={globalProps}
      customFooter={customFooter}
      maxWidth="5xl"
      maxHeight="95vh"
    />
  );
};