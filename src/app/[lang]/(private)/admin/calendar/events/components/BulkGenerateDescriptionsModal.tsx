"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { 
  DocumentTextIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon
} from "@heroicons/react/24/outline";

interface BulkGenerateDescriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvents: GoogleCalendarEvent[];
  onConfirm: (
    eventIds: Array<{ eventId: string; calendarId: string }>,
    options: {
      template: string;
      includeAttendees: boolean;
      includeLocation: boolean;
      includeDateTime: boolean;
    }
  ) => Promise<void>;
}

interface GenerationOptions {
  template: string;
  includeAttendees: boolean;
  includeLocation: boolean;
  includeDateTime: boolean;
}

const templateOptions = [
  { value: "clásico", label: "Clásico", description: "Como las descripciones nativas de Google Calendar (recomendado)" },
  { value: "automático", label: "Automático", description: "Descripción genérica para cualquier tipo de evento" },
  { value: "reunión", label: "Reunión", description: "Para reuniones de trabajo y coordinación" },
  { value: "formación", label: "Formación", description: "Para sesiones de entrenamiento y capacitación" },
  { value: "presentación", label: "Presentación", description: "Para presentaciones y demos" },
  { value: "seguimiento", label: "Seguimiento", description: "Para sesiones de seguimiento y revisión" },
  { value: "personalizado", label: "Plantilla Personalizada", description: "Define tu propia plantilla con variables" }
];

export const BulkGenerateDescriptionsModal: React.FC<BulkGenerateDescriptionsModalProps> = ({
  isOpen,
  onClose,
  selectedEvents,
  onConfirm,
}) => {
  const [options, setOptions] = useState<GenerationOptions>({
    template: "clásico",
    includeAttendees: true,
    includeLocation: true,
    includeDateTime: true,
  });
  
  const [customTemplate, setCustomTemplate] = useState<string>(
    `{titulo}
{fecha_completa} · {rango_horario}
Zona horaria: {zona_horaria}
Información para unirse con Google Meet
Enlace de la videollamada: {meet_link}`
  );
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClose = () => {
    if (!isGenerating) {
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (selectedEvents.length === 0) {
      setError("No hay eventos seleccionados");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Preparar datos para la API
      const eventIds = selectedEvents.map(event => ({
        eventId: event.id!,
        calendarId: (event as any).calendarId || 'primary'
      }));

      const requestOptions = {
        ...options,
        ...(options.template === "personalizado" && { customTemplate })
      };
      
      await onConfirm(eventIds, requestOptions);
      
      setSuccess(`Se generaron descripciones para ${selectedEvents.length} evento${selectedEvents.length !== 1 ? 's' : ''} exitosamente`);
      
      // Cerrar automáticamente después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error en modal de generación:', error);
      let errorMessage = "Error al generar descripciones";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplate = templateOptions.find(t => t.value === options.template);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            Generar Descripciones Automáticas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de eventos seleccionados */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckIcon className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''} seleccionado{selectedEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-sm text-blue-700 max-h-32 overflow-y-auto">
              {selectedEvents.slice(0, 5).map((event, index) => (
                <div key={event.id} className="truncate">
                  • {event.summary}
                </div>
              ))}
              {selectedEvents.length > 5 && (
                <div className="text-blue-600 font-medium">
                  ... y {selectedEvents.length - 5} más
                </div>
              )}
            </div>
          </div>

          {/* Progreso */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-center text-sm">
                <span>Generando descripciones...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Alertas */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <ExclamationCircleIcon className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Opciones de configuración */}
          {!isGenerating && !success && (
            <div className="space-y-4">
              {/* Template de descripción */}
              <div className="space-y-2">
                <Label htmlFor="template">Plantilla de Descripción</Label>
                <Select
                  value={options.template}
                  onValueChange={(value) => setOptions(prev => ({ ...prev, template: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateOptions.map(template => (
                      <SelectItem key={template.value} value={template.value}>
                        <div>
                          <div className="font-medium">{template.label}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <p className="text-sm text-gray-600">
                    {selectedTemplate.description}
                  </p>
                )}
              </div>

              {/* Opciones de incluir información */}
              <div className="space-y-3">
                <Label>Información a incluir en la descripción:</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDateTime"
                    checked={options.includeDateTime}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeDateTime: checked as boolean }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="includeDateTime" className="text-sm">
                      Fecha y hora del evento
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeLocation"
                    checked={options.includeLocation}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeLocation: checked as boolean }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="includeLocation" className="text-sm">
                      Ubicación (si está disponible)
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAttendees"
                    checked={options.includeAttendees}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeAttendees: checked as boolean }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="includeAttendees" className="text-sm">
                      Lista de participantes
                    </Label>
                  </div>
                </div>
              </div>

              {/* Editor de plantilla personalizada */}
              {options.template === "personalizado" && (
                <div className="space-y-3">
                  <Label htmlFor="customTemplate">Plantilla Personalizada</Label>
                  <div className="space-y-2">
                    <textarea
                      id="customTemplate"
                      value={customTemplate}
                      onChange={(e) => setCustomTemplate(e.target.value)}
                      className="w-full h-32 px-3 py-2 border rounded-md text-sm font-mono"
                      placeholder="Escribe tu plantilla aquí..."
                    />
                    <div className="text-xs text-gray-500">
                      <strong>Variables disponibles:</strong>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <span>• {"{titulo}"} - Título del evento</span>
                        <span>• {"{fecha_inicio}"} - Fecha de inicio</span>
                        <span>• {"{hora_inicio}"} - Hora de inicio</span>
                        <span>• {"{fecha_fin}"} - Fecha de fin</span>
                        <span>• {"{hora_fin}"} - Hora de fin</span>
                        <span>• {"{duracion}"} - Duración del evento</span>
                        <span>• {"{ubicacion}"} - Ubicación</span>
                        <span>• {"{meet_link}"} - Enlace de Google Meet</span>
                        <span>• {"{zona_horaria}"} - Zona horaria</span>
                        <span>• {"{lista_participantes}"} - Lista de participantes</span>
                        <span>• {"{num_participantes}"} - N° de participantes</span>
                        <span>• {"{organizador}"} - Organizador del evento</span>
                        <span>• {"{fecha_completa}"} - Fecha completa con día</span>
                        <span>• {"{rango_horario}"} - Rango de horas</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vista previa */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Vista previa de la descripción:
                </Label>
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {generatePreviewDescription(selectedEvents[0], options, customTemplate)}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
          >
            {success ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!success && (
            <Button
              onClick={handleConfirm}
              disabled={isGenerating || selectedEvents.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>Generando...</>
              ) : (
                <>
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Generar Descripciones
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function generatePreviewDescription(
  event: GoogleCalendarEvent | undefined, 
  options: GenerationOptions,
  customTemplate: string
): string {
  if (!event) return "Vista previa no disponible";

  const { template, includeAttendees, includeLocation, includeDateTime } = options;
  
  // Si es plantilla personalizada, procesarla
  if (template === "personalizado") {
    return processPreviewCustomTemplate(customTemplate, event, options);
  }
  
  // Plantilla clásica (nueva por defecto)
  if (template === "clásico") {
    const title = event.summary || "IBM España - Módulo 1 (08/09/2025)";
    let description = title;
    
    if (includeDateTime) {
      description += "\nLunes, 8 de septiembre · 9:30am – 1:30pm";
      description += "\nZona horaria: Europe/Madrid";
    }
    
    description += "\nInformación para unirse con Google Meet";
    description += "\nEnlace de la videollamada: https://meet.google.com/ejemplo-link";
    
    if (includeLocation) {
      description += "\nUbicación: [Ubicación del evento]";
    }
    
    return description;
  }
  
  // Otras plantillas
  let description = "";
  const title = event.summary || "Evento de ejemplo";
  
  switch (template) {
    case "reunión":
      description = `${title}\n\nReunión programada para revisar temas importantes y coordinar próximos pasos.`;
      break;
    case "formación":
      description = `${title}\n\nSesión de formación diseñada para mejorar conocimientos y habilidades del equipo.`;
      break;
    case "presentación":
      description = `${title}\n\nPresentación de resultados, propuestas o informes relevantes para el proyecto.`;
      break;
    case "seguimiento":
      description = `${title}\n\nSesión de seguimiento para revisar avances, identificar bloqueadores y planificar próximas acciones.`;
      break;
    default:
      description = `${title}\n\nEvento programado para coordinar actividades y mantener comunicación efectiva del equipo.`;
  }

  const additionalInfo = [];

  if (includeDateTime) {
    additionalInfo.push("lunes, 8 de septiembre de 2025\n09:30 - 13:30");
  }

  if (includeLocation) {
    additionalInfo.push("Ubicación: [Ubicación del evento]");
  }

  additionalInfo.push("Información para unirse con Google Meet\nEnlace de la videollamada: https://meet.google.com/ejemplo-link");

  if (includeAttendees) {
    additionalInfo.push("Participantes:\n⏳ pedro@ejemplo.com\n⏳ lorena@ejemplo.com");
  }

  if (additionalInfo.length > 0) {
    description += "\n\n" + additionalInfo.join("\n\n");
  }

  return description;
}

function processPreviewCustomTemplate(template: string, event: GoogleCalendarEvent | undefined, options: GenerationOptions): string {
  let processed = template;
  
  // Variables de ejemplo para la vista previa
  const variables = {
    '{titulo}': event?.summary || 'IBM España - Módulo 1 (08/09/2025)',
    '{fecha_inicio}': '8/9/2025',
    '{hora_inicio}': '09:30',
    '{fecha_fin}': '8/9/2025',
    '{hora_fin}': '13:30',
    '{duracion}': '4h',
    '{ubicacion}': 'Sala de reuniones virtual',
    '{meet_link}': 'https://meet.google.com/ejemplo-link',
    '{zona_horaria}': 'Europe/Madrid',
    '{lista_participantes}': options.includeAttendees ? '⏳ pedro@ejemplo.com\n⏳ lorena@ejemplo.com' : '',
    '{num_participantes}': '2',
    '{organizador}': 'Organizador Ejemplo',
    '{fecha_completa}': 'Lunes, 8 de septiembre',
    '{rango_horario}': '09:30 – 13:30'
  };
  
  // Reemplazar variables
  Object.entries(variables).forEach(([key, value]) => {
    processed = processed.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  return processed;
}