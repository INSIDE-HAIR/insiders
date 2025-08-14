"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "@/src/components/ui/use-toast";
import { processDescription } from "@/src/lib/description-utils";

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
      customTemplate?: string;
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
  {
    value: "clásico",
    label: "Clásico",
    description:
      "Como las descripciones nativas de Google Calendar (recomendado)",
  },
  {
    value: "automático",
    label: "Automático",
    description: "Descripción genérica para cualquier tipo de evento",
  },
  {
    value: "reunión",
    label: "Reunión",
    description: "Para reuniones de trabajo y coordinación",
  },
  {
    value: "formación",
    label: "Formación",
    description: "Para sesiones de entrenamiento y capacitación",
  },
  {
    value: "presentación",
    label: "Presentación",
    description: "Para presentaciones y demos",
  },
  {
    value: "seguimiento",
    label: "Seguimiento",
    description: "Para sesiones de seguimiento y revisión",
  },
  {
    value: "personalizado",
    label: "Plantilla Personalizada",
    description: "Define tu propia plantilla con variables",
  },
];

export const BulkGenerateDescriptionsModal: React.FC<
  BulkGenerateDescriptionsModalProps
> = ({ isOpen, onClose, selectedEvents, onConfirm }) => {
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

  const handleClose = () => {
    if (!isGenerating) {
      setError(null);
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (selectedEvents.length === 0) {
      toast({
        title: "Sin eventos seleccionados",
        description: "Debes seleccionar al menos un evento",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Preparar datos para la API
      const eventIds = selectedEvents.map((event) => ({
        eventId: event.id!,
        calendarId: (event as any).calendarId || "primary",
      }));

      const requestOptions = {
        ...options,
        ...(options.template === "personalizado" && { customTemplate }),
      };

      await onConfirm(eventIds, requestOptions);

      toast({
        title: "Descripciones generadas",
        description: `Se generaron descripciones para ${selectedEvents.length} evento${selectedEvents.length !== 1 ? "s" : ""} exitosamente`,
        duration: 3000,
      });

      // Cerrar automáticamente después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error en modal de generación:", error);
      let errorMessage = "Error al generar descripciones";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error.error) {
        errorMessage = error.error;
      }

      // Limpiar el error anterior y establecer el nuevo
      setError(null);
      setTimeout(() => {
        setError(errorMessage);
      }, 100);

      toast({
        title: "Error al generar descripciones",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplate = templateOptions.find(
    (t) => t.value === options.template
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <DocumentTextIcon className='h-5 w-5 text-primary' />
            Generar Descripciones Automáticas
          </DialogTitle>
          <DialogDescription>
            Genera descripciones automáticas para {selectedEvents.length} evento
            {selectedEvents.length !== 1 ? "s" : ""} seleccionado
            {selectedEvents.length !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Lista de eventos seleccionados */}
          <div>
            <Label className='text-sm font-medium'>
              Eventos seleccionados:
            </Label>
            <div className='mt-2 space-y-1 max-h-24 overflow-y-auto'>
              {selectedEvents.slice(0, 3).map((event, index) => (
                <div
                  key={`${event.id}-${(event as any).calendarId || "default"}`}
                  className='text-sm text-muted-foreground bg-primary/5 p-2 rounded border border-primary/20'
                >
                  • {event.summary || "Sin título"}
                </div>
              ))}
              {selectedEvents.length > 3 && (
                <div className='text-sm text-muted-foreground italic'>
                  +{selectedEvents.length - 3} evento
                  {selectedEvents.length - 3 !== 1 ? "s" : ""} más...
                </div>
              )}
            </div>
          </div>

          {/* Alertas */}
          {error && (
            <Alert className='border-red-200 bg-red-50'>
              <ExclamationCircleIcon className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-700'>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Opciones de configuración */}
          {!isGenerating && (
            <div className='space-y-4'>
              {/* Template de descripción */}
              <div className='space-y-2'>
                <Label htmlFor='template'>Plantilla de Descripción</Label>
                <Select
                  value={options.template}
                  onValueChange={(value) =>
                    setOptions((prev) => ({ ...prev, template: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona una plantilla' />
                  </SelectTrigger>
                  <SelectContent>
                    {templateOptions.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        <div>
                          <div className='font-medium text-left'>
                            {template.label}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {template.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <p className='text-sm text-gray-600'>
                    {selectedTemplate.description}
                  </p>
                )}
              </div>

              {/* Opciones de incluir información */}
              <div className='space-y-3'>
                <Label>Información a incluir en la descripción:</Label>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='includeDateTime'
                    checked={options.includeDateTime}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeDateTime: checked as boolean,
                      }))
                    }
                  />
                  <div className='flex items-center gap-2'>
                    <ClockIcon className='h-4 w-4 text-gray-500' />
                    <Label htmlFor='includeDateTime' className='text-sm'>
                      Fecha y hora del evento
                    </Label>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='includeLocation'
                    checked={options.includeLocation}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeLocation: checked as boolean,
                      }))
                    }
                  />
                  <div className='flex items-center gap-2'>
                    <MapPinIcon className='h-4 w-4 text-gray-500' />
                    <Label htmlFor='includeLocation' className='text-sm'>
                      Ubicación (si está disponible)
                    </Label>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='includeAttendees'
                    checked={options.includeAttendees}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeAttendees: checked as boolean,
                      }))
                    }
                  />
                  <div className='flex items-center gap-2'>
                    <UsersIcon className='h-4 w-4 text-gray-500' />
                    <Label htmlFor='includeAttendees' className='text-sm'>
                      Lista de participantes
                    </Label>
                  </div>
                </div>
              </div>

              {/* Editor de plantilla personalizada */}
              {options.template === "personalizado" && (
                <div className='space-y-3'>
                  <Label htmlFor='customTemplate'>
                    Plantilla Personalizada
                  </Label>
                  <div className='space-y-2'>
                    <textarea
                      id='customTemplate'
                      value={customTemplate}
                      onChange={(e) => setCustomTemplate(e.target.value)}
                      className='w-full h-32 px-3 py-2 border rounded-md text-sm font-mono bg-background'
                      placeholder='Escribe tu plantilla aquí...'
                    />
                    <div className='text-xs text-gray-500'>
                      <strong>Variables disponibles:</strong>
                      <div className='grid grid-cols-2 gap-1 mt-1'>
                        <span>• {"{titulo}"} - Título del evento</span>
                        <span>• {"{fecha_inicio}"} - Fecha de inicio</span>
                        <span>• {"{hora_inicio}"} - Hora de inicio</span>
                        <span>• {"{fecha_fin}"} - Fecha de fin</span>
                        <span>• {"{hora_fin}"} - Hora de fin</span>
                        <span>• {"{duracion}"} - Duración del evento</span>
                        <span>• {"{ubicacion}"} - Ubicación</span>
                        <span>• {"{meet_link}"} - Enlace de Google Meet</span>
                        <span>• {"{zona_horaria}"} - Zona horaria</span>
                        <span>
                          • {"{lista_participantes}"} - Lista de participantes
                        </span>
                        <span>
                          • {"{num_participantes}"} - N° de participantes
                        </span>
                        <span>
                          • {"{organizador}"} - Organizador del evento
                        </span>
                        <span>
                          • {"{fecha_completa}"} - Fecha completa con día
                        </span>
                        <span>• {"{rango_horario}"} - Rango de horas</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vista previa */}
              <div className='border rounded-lg p-3 bg-primary/5 text-primary border-primary/20'>
                <Label className='text-sm font-medium text-primary mb-2 block'>
                  Vista previa de la descripción:
                </Label>
                <div
                  className='text-sm text-foreground event-description'
                  dangerouslySetInnerHTML={{
                    __html: generatePreviewDescription(
                      selectedEvents[0],
                      options,
                      customTemplate
                    ),
                  }}
                />
              </div>
            </div>
          )}

          {/* Progreso */}
          {isGenerating && (
            <div className='space-y-2'>
              <div className='flex items-center justify-center text-sm'>
                <span>Generando descripciones...</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div className='bg-primary h-2 rounded-full animate-pulse'></div>
              </div>
            </div>
          )}

          {/* Advertencia */}
          <div className='flex items-start gap-2 p-3 bg-warning/10 border border-warning rounded-md'>
            <ExclamationTriangleIcon className='h-5 w-5 text-warning flex-shrink-0 mt-0.5 stroke-warning' />
            <div className='text-sm text-warning'>
              <p className='font-medium'>Importante:</p>
              <p>
                Las descripciones se generarán automáticamente para todos los
                eventos seleccionados. Los enlaces de Google Meet se incluirán
                si están disponibles.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={handleClose}
            disabled={isGenerating}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={isGenerating || selectedEvents.length === 0}
            className='bg-primary hover:bg-primary/90 text-primary-foreground font-semibold'
          >
            {isGenerating ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Generando...
              </>
            ) : (
              <>
                <DocumentTextIcon className='mr-2 h-4 w-4' />
                Generar para {selectedEvents.length} Evento
                {selectedEvents.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
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

  const { template, includeAttendees, includeLocation, includeDateTime } =
    options;

  // Si es plantilla personalizada, procesarla
  if (template === "personalizado") {
    return processPreviewCustomTemplate(customTemplate, event, options);
  }

  // Plantilla clásica (nueva por defecto)
  if (template === "clásico") {
    const title = event.summary || "IBM España - Módulo 1 (08/09/2025)";
    let description = `<p><strong>${title}</strong></p>`;

    if (includeDateTime) {
      description += `<p>Lunes, 8 de septiembre · 9:30am – 1:30pm</p>`;
      description += `<p>Zona horaria: Europe/Madrid</p>`;
    }

    description += `<p>Información para unirse con Google Meet</p>`;
    description += `<p>Enlace de la videollamada: <a href="https://meet.google.com/ejemplo-link">https://meet.google.com/ejemplo-link</a></p>`;

    if (includeLocation) {
      description += `<p>Ubicación: [Ubicación del evento]</p>`;
    }

    return description;
  }

  // Otras plantillas
  let description = "";
  const title = event.summary || "Evento de ejemplo";

  switch (template) {
    case "reunión":
      description = `<p><strong>${title}</strong></p><p>Reunión programada para revisar temas importantes y coordinar próximos pasos.</p>`;
      break;
    case "formación":
      description = `<p><strong>${title}</strong></p><p>Sesión de formación diseñada para mejorar conocimientos y habilidades del equipo.</p>`;
      break;
    case "presentación":
      description = `<p><strong>${title}</strong></p><p>Presentación de resultados, propuestas o informes relevantes para el proyecto.</p>`;
      break;
    case "seguimiento":
      description = `<p><strong>${title}</strong></p><p>Sesión de seguimiento para revisar avances, identificar bloqueadores y planificar próximas acciones.</p>`;
      break;
    default:
      description = `<p><strong>${title}</strong></p><p>Evento programado para coordinar actividades y mantener comunicación efectiva del equipo.</p>`;
  }

  const additionalInfo = [];

  if (includeDateTime) {
    additionalInfo.push(
      `<p>lunes, 8 de septiembre de 2025<br>09:30 - 13:30</p>`
    );
  }

  if (includeLocation) {
    additionalInfo.push(`<p>Ubicación: [Ubicación del evento]</p>`);
  }

  additionalInfo.push(
    `<p>Información para unirse con Google Meet</p><p>Enlace de la videollamada: <a href="https://meet.google.com/ejemplo-link">https://meet.google.com/ejemplo-link</a></p>`
  );

  if (includeAttendees) {
    additionalInfo.push(
      `<p>Participantes:<br>⏳ pedro@ejemplo.com<br>⏳ lorena@ejemplo.com</p>`
    );
  }

  if (additionalInfo.length > 0) {
    description += additionalInfo.join("");
  }

  return processDescription(description);
}

function processPreviewCustomTemplate(
  template: string,
  event: GoogleCalendarEvent | undefined,
  options: GenerationOptions
): string {
  let processed = template;

  // Variables de ejemplo para la vista previa
  const variables = {
    "{titulo}": event?.summary || "IBM España - Módulo 1 (08/09/2025)",
    "{fecha_inicio}": "8/9/2025",
    "{hora_inicio}": "09:30",
    "{fecha_fin}": "8/9/2025",
    "{hora_fin}": "13:30",
    "{duracion}": "4h",
    "{ubicacion}": "Sala de reuniones virtual",
    "{meet_link}": "https://meet.google.com/ejemplo-link",
    "{zona_horaria}": "Europe/Madrid",
    "{lista_participantes}": options.includeAttendees
      ? "⏳ pedro@ejemplo.com<br>⏳ lorena@ejemplo.com"
      : "",
    "{num_participantes}": "2",
    "{organizador}": "Organizador Ejemplo",
    "{fecha_completa}": "Lunes, 8 de septiembre",
    "{rango_horario}": "09:30 – 13:30",
  };

  // Reemplazar variables
  Object.entries(variables).forEach(([key, value]) => {
    processed = processed.replace(
      new RegExp(key.replace(/[{}]/g, "\\$&"), "g"),
      value
    );
  });

  // Convertir saltos de línea en HTML
  processed = processed.replace(/\n/g, "<br>");

  // Convertir texto plano en párrafos HTML
  if (!processed.includes("<p>") && !processed.includes("<br>")) {
    processed = `<p>${processed}</p>`;
  }

  return processDescription(processed);
}
