/**
 * BulkGenerateDescriptionsModal - Organism Component
 *
 * Modal para generar descripciones masivamente usando plantillas y Quill editor
 * VERSIÓN ORIGINAL RESTAURADA con funcionalidad completa de plantillas
 */

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/src/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { ReactQuillWrapper } from "@/src/components/ui/ReactQuillWrapper";

// Import CSS personalizado para Quill
import "../../quill-custom.css";

interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[];
  description?: string;
}

interface BulkGenerateDescriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (template: string, overwriteExisting: boolean) => Promise<void>;
  selectedEvents: GoogleCalendarEvent[];
  isLoading?: boolean;
  className?: string;
}

// Plantillas originales restauradas del API
const defaultTemplates: Template[] = [
  {
    id: "clasico",
    name: "Clásico",
    description: "Formato clásico con información detallada",
    content:
      "<p><strong>{{title}}</strong></p>" +
      "<p>{{startDate}} · {{startTime}} – {{endTime}}</p>" +
      "<p>Zona horaria: Europe/Madrid</p>" +
      "<p><strong>Información para unirse con Google Meet</strong></p>" +
      "<p>Enlace de la videollamada: {{meetLink}}</p>" +
      "<p><strong>Ubicación:</strong> {{location}}</p>",
    variables: [
      "title",
      "startDate",
      "startTime",
      "endTime",
      "meetLink",
      "location",
    ],
  },
  {
    id: "reunion",
    name: "Reunión",
    description: "Plantilla para reuniones generales",
    content:
      "<p><strong>{{title}}</strong></p>" +
      "<p>Reunión programada para revisar temas importantes y coordinar próximos pasos.</p>" +
      "<p><strong>📅 Fecha:</strong> {{startDate}} de {{startTime}} a {{endTime}}</p>" +
      "<p><strong>📍 Ubicación:</strong> {{location}}</p>" +
      "<p><strong>👥 Participantes:</strong> {{attendees}}</p>",
    variables: [
      "title",
      "startDate",
      "startTime",
      "endTime",
      "location",
      "attendees",
    ],
  },
  {
    id: "formacion",
    name: "Formación",
    description: "Para sesiones de capacitación y formación",
    content:
      "<p><strong>{{title}}</strong></p>" +
      "<p>Sesión de formación diseñada para mejorar conocimientos y habilidades del equipo.</p>" +
      "<p><strong>🎓 Fecha:</strong> {{startDate}}</p>" +
      "<p><strong>🕐 Horario:</strong> {{startTime}} - {{endTime}}</p>" +
      "<p><strong>📍 Modalidad:</strong> {{location}}</p>" +
      "<p><strong>👨‍🎓 Participantes:</strong> {{attendees}}</p>",
    variables: [
      "title",
      "startDate",
      "startTime",
      "endTime",
      "location",
      "attendees",
    ],
  },
  {
    id: "presentacion",
    name: "Presentación",
    description: "Para presentaciones y demostraciones",
    content:
      "<p><strong>{{title}}</strong></p>" +
      "<p>Presentación de resultados, propuestas o informes relevantes para el proyecto.</p>" +
      "<p><strong>📅 Fecha:</strong> {{startDate}}</p>" +
      "<p><strong>🕐 Horario:</strong> {{startTime}} - {{endTime}}</p>" +
      "<p><strong>📍 Ubicación:</strong> {{location}}</p>" +
      "<p><strong>👥 Asistentes:</strong> {{attendees}}</p>",
    variables: [
      "title",
      "startDate",
      "startTime",
      "endTime",
      "location",
      "attendees",
    ],
  },
  {
    id: "seguimiento",
    name: "Seguimiento",
    description: "Para sesiones de seguimiento y revisión",
    content:
      "<p><strong>{{title}}</strong></p>" +
      "<p>Sesión de seguimiento para revisar avances, identificar bloqueadores y planificar próximas acciones.</p>" +
      "<p><strong>📅 Fecha:</strong> {{startDate}}</p>" +
      "<p><strong>🕐 Horario:</strong> {{startTime}} - {{endTime}}</p>" +
      "<p><strong>📍 Ubicación:</strong> {{location}}</p>" +
      "<p><strong>👥 Participantes:</strong> {{attendees}}</p>",
    variables: [
      "title",
      "startDate",
      "startTime",
      "endTime",
      "location",
      "attendees",
    ],
  },
];

// Variables disponibles para el editor personalizado
const availableVariables = [
  "title",
  "location",
  "startDate",
  "startTime",
  "endTime",
  "attendees",
  "meetLink",
  "organizer",
  "duration",
  "numParticipants",
];

export const BulkGenerateDescriptionsModal: React.FC<
  BulkGenerateDescriptionsModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedEvents,
  isLoading = false,
  className,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [customTemplate, setCustomTemplate] = useState("");
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const quillRef = useRef<any>(null);
  const [isQuillReady, setIsQuillReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Callback para manejar cambios en el template
  const handleTemplateChange = (value: string) => {
    setCustomTemplate(value);
  };

  // Callback mejorado para cambios en Quill con debounce
  const handleQuillChange = (value: string) => {
    console.log("🔥 Quill cambió a:", value);
    console.log("🔥 Valor anterior:", customTemplate);
    setCustomTemplate(value);

    // Forzar re-render del contador de variables con múltiples intentos
    setTimeout(() => {
      console.log("🔥 Forzando update 1");
      setForceUpdate((prev) => prev + 1);
    }, 0);

    // Segundo intento después de un poco más de tiempo
    setTimeout(() => {
      console.log("🔥 Forzando update 2");
      setForceUpdate((prev) => prev + 1);
    }, 100);
  };

  // Resetear estado al abrir/cerrar modal
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplateId("");
      setCustomTemplate("");
      setIsQuillReady(false);
      setForceUpdate(0);

      // Dar tiempo para que Quill se inicialice
      const timer = setTimeout(() => {
        setIsQuillReady(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Efecto para actualizar contadores cuando cambia el template
  useEffect(() => {
    console.log("🔥 useEffect customTemplate cambió:", customTemplate);
    if (customTemplate && isQuillReady) {
      // Pequeño delay para asegurar que Quill haya procesado el cambio
      const timer = setTimeout(() => {
        console.log("🔥 useEffect forzando update");
        setForceUpdate((prev) => prev + 1);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [customTemplate, isQuillReady]);

  // Efecto para agregar listener directo a Quill
  useEffect(() => {
    if (isQuillReady && quillRef.current) {
      console.log("🔥 Agregando listener directo a Quill");

      const quill = quillRef.current;

      // Listener para cambios de texto
      const textChangeHandler = () => {
        console.log("🔥 Quill text-change event disparado");
        const newValue = quill.root.innerHTML;
        console.log("🔥 Nuevo valor desde text-change:", newValue);

        setCustomTemplate(newValue);
        setForceUpdate((prev) => prev + 1);
      };

      // Listener para cambios de selección
      const selectionChangeHandler = () => {
        console.log("🔥 Quill selection-change event disparado");
        // Pequeño delay para asegurar que el contenido se haya actualizado
        setTimeout(() => {
          const newValue = quill.root.innerHTML;
          setCustomTemplate(newValue);
          setForceUpdate((prev) => prev + 1);
        }, 50);
      };

      // Agregar listeners
      quill.on("text-change", textChangeHandler);
      quill.on("selection-change", selectionChangeHandler);

      // Cleanup
      return () => {
        console.log("🔥 Removiendo listeners de Quill");
        quill.off("text-change", textChangeHandler);
        quill.off("selection-change", selectionChangeHandler);
      };
    }
  }, [isQuillReady]);

  // Efecto adicional para forzar conteo cuando cambia customTemplate
  useEffect(() => {
    console.log("🔥 useEffect directo customTemplate:", customTemplate);
    if (customTemplate) {
      // Forzar conteo inmediatamente
      setForceUpdate((prev) => {
        console.log("🔥 Forzando conteo directo, prev:", prev);
        return prev + 1;
      });
    }
  }, [customTemplate]);

  // Función para obtener texto directamente del editor Quill
  const getQuillText = () => {
    if (quillRef.current && quillRef.current.getText) {
      return quillRef.current.getText();
    }
    return "";
  };

  // Función helper para extraer texto plano del HTML y contar variables
  const getPlainTextFromHTML = (html: string): string => {
    if (!html || html === "<p><br></p>" || html.trim() === "") {
      return "";
    }

    // Crear un elemento temporal para parsear HTML
    if (typeof window !== "undefined") {
      const temp = document.createElement("div");
      temp.innerHTML = html;

      // Reemplazar los spans de variables con su texto
      const variableSpans = temp.querySelectorAll(".ql-variable");
      variableSpans.forEach((span) => {
        const variable = span.getAttribute("data-variable");
        if (variable) {
          span.textContent = `{{${variable}}}`;
        }
      });

      // También buscar variables que puedan estar en formato de código
      const codeElements = temp.querySelectorAll("code");
      codeElements.forEach((code) => {
        const text = code.textContent || "";
        if (text.match(/\{\{[^}]+\}\}/)) {
          // Mantener el formato de variable
          code.textContent = text;
        }
      });

      // Obtener el texto completo
      let plainText = temp.textContent || temp.innerText || "";

      // Si no hay texto, intentar extraer directamente del HTML
      if (!plainText || plainText.trim() === "") {
        plainText = html.replace(/<[^>]*>/g, "");
      }

      return plainText;
    }

    // Fallback para SSR - extraer variables de forma más robusta
    let plainText = html.replace(/<[^>]*>/g, "");

    return plainText;
  };

  // Contar variables usadas en el editor personalizado
  const usedVariables = useMemo(() => {
    console.log(
      "🔥 useMemo ejecutándose con:",
      customTemplate,
      "forceUpdate:",
      forceUpdate
    );
    const variableCounts: Record<string, number> = {};

    if (
      customTemplate &&
      customTemplate !== "<p><br></p>" &&
      customTemplate.trim()
    ) {
      // Obtener texto plano del HTML
      const plainTextFromHTML = getPlainTextFromHTML(customTemplate);

      // También intentar obtener texto directamente de Quill
      const quillText = getQuillText();

      // Usar el texto más largo/útil
      const plainText =
        quillText.length > plainTextFromHTML.length
          ? quillText
          : plainTextFromHTML;

      // Debug: mostrar el texto extraído
      console.log("HTML:", customTemplate);
      console.log("Texto extraído del HTML:", plainTextFromHTML);
      console.log("Texto de Quill:", quillText);
      console.log("Texto final usado:", plainText);

      availableVariables.forEach((variable) => {
        // Buscar todas las ocurrencias de {{variable}} usando regex global
        const pattern = new RegExp(`\\{\\{${variable}\\}\\}`, "g");
        const matches = plainText.match(pattern);
        const count = matches ? matches.length : 0;

        if (count > 0) {
          variableCounts[variable] = count;
        }
      });
    }

    console.log("Variables contadas:", variableCounts);
    return variableCounts;
  }, [customTemplate, forceUpdate]);

  const handleGenerate = async () => {
    if (!customTemplate.trim()) {
      return;
    }

    try {
      // Las descripciones siempre se sobrescribirán, es un hecho
      await onConfirm(customTemplate, true);
      onClose();
    } catch (error) {
      console.error("Error generating descriptions:", error);
    }
  };

  const processTemplatePreview = (
    content: string,
    event: GoogleCalendarEvent
  ) => {
    if (!event) return content;

    let processed = content;

    // Reemplazar variables básicas
    processed = processed.replace(
      /\{\{title\}\}/g,
      event.summary || "Sin título"
    );
    processed = processed.replace(
      /\{\{location\}\}/g,
      event.location || "Por definir"
    );
    processed = processed.replace(
      /\{\{organizer\}\}/g,
      event.organizer?.displayName || event.organizer?.email || ""
    );

    // Formatear fechas
    if (event.start?.dateTime || event.start?.date) {
      const startDate = new Date(event.start.dateTime || event.start.date!);
      processed = processed.replace(
        /\{\{startDate\}\}/g,
        startDate.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
      processed = processed.replace(
        /\{\{startTime\}\}/g,
        startDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    if (event.end?.dateTime || event.end?.date) {
      const endDate = new Date(event.end.dateTime || event.end.date!);
      processed = processed.replace(
        /\{\{endTime\}\}/g,
        endDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    // Procesar asistentes
    const attendeesList =
      event.attendees
        ?.map((a) => `• ${a.displayName || a.email}`)
        .join("<br>") || "Sin asistentes definidos";
    processed = processed.replace(/\{\{attendees\}\}/g, attendeesList);

    // Meet link
    processed = processed.replace(
      /\{\{meetLink\}\}/g,
      event.hangoutLink || "No disponible"
    );

    // Número de participantes
    processed = processed.replace(
      /\{\{numParticipants\}\}/g,
      (event.attendees?.length || 0).toString()
    );

    // Duración
    if (event.start?.dateTime && event.end?.dateTime) {
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      const durationText =
        hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
      processed = processed.replace(/\{\{duration\}\}/g, durationText);
    } else {
      processed = processed.replace(/\{\{duration\}\}/g, "No disponible");
    }

    return processed;
  };

  // Función para obtener el valor de ejemplo de una variable
  const getVariableExample = (variable: string): string => {
    if (!selectedEvents[0]) return "Ejemplo";

    const event = selectedEvents[0];

    switch (variable) {
      case "title":
        return event.summary || "Reunión de Equipo";
      case "location":
        return event.location || "Sala de Conferencias";
      case "startDate":
        return event.start?.dateTime
          ? new Date(event.start.dateTime).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "lunes, 1 de enero de 2024";
      case "startTime":
        return event.start?.dateTime
          ? new Date(event.start.dateTime).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "09:00";
      case "endTime":
        return event.end?.dateTime
          ? new Date(event.end.dateTime).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "10:00";
      case "attendees":
        return (
          event.attendees
            ?.slice(0, 2)
            .map((a) => a.displayName || a.email)
            .join(", ") || "Juan Pérez, María García"
        );
      case "meetLink":
        return event.hangoutLink || "https://meet.google.com/xyz-abc-def";
      case "organizer":
        return (
          event.organizer?.displayName ||
          event.organizer?.email ||
          "Organizador"
        );
      case "duration":
        if (event.start?.dateTime && event.end?.dateTime) {
          const duration = Math.round(
            (new Date(event.end.dateTime).getTime() -
              new Date(event.start.dateTime).getTime()) /
              (1000 * 60)
          );
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
        }
        return "1h 30min";
      case "numParticipants":
        return (event.attendees?.length || 3).toString();
      default:
        return "Ejemplo";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn("max-w-5xl max-h-[95vh] overflow-hidden", className)}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <SparklesIcon className='h-5 w-5' />
            Generar Descripciones Masivamente
          </DialogTitle>
          <DialogDescription>
            Genera descripciones personalizadas para {selectedEvents.length}{" "}
            evento{selectedEvents.length !== 1 ? "s" : ""} seleccionado
            {selectedEvents.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Plantillas predefinidas */}
          <div className='space-y-4'>
            <Label className='text-sm font-medium'>
              Plantillas Predefinidas
            </Label>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
              {templates.map((template) => (
                <HoverCard key={template.id}>
                  <HoverCardTrigger asChild>
                    <div
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                        selectedTemplateId === template.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        // Cargar la plantilla en el editor
                        handleTemplateChange(template.content);
                      }}
                    >
                      <div className='space-y-2'>
                        <h3 className='font-medium text-sm'>{template.name}</h3>
                        <p className='text-xs text-muted-foreground'>
                          {template.description}
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {template.variables.slice(0, 3).map((variable) => (
                            <Badge
                              key={variable}
                              variant='secondary'
                              className='text-xs'
                            >
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant='secondary' className='text-xs'>
                              +{template.variables.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className='w-80'>
                    <div className='space-y-3'>
                      <div>
                        <h4 className='font-semibold text-sm'>
                          Vista Previa: {template.name}
                        </h4>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {template.description}
                        </p>
                      </div>
                      <Separator />
                      <div
                        className='prose prose-sm max-w-none text-xs'
                        dangerouslySetInnerHTML={{
                          __html: selectedEvents[0]
                            ? processTemplatePreview(
                                template.content,
                                selectedEvents[0]
                              )
                            : template.content,
                        }}
                      />
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </div>

          {/* Editor unificado */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-medium'>Editor de Plantilla</Label>
              {selectedTemplateId && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSelectedTemplateId("");
                    handleTemplateChange("");
                  }}
                >
                  Limpiar
                </Button>
              )}
            </div>

            {/* Variables disponibles */}
            <div className='space-y-2'>
              <Label className='text-xs text-muted-foreground'>
                Variables disponibles:
              </Label>
              <TooltipProvider>
                <div className='flex flex-wrap gap-1'>
                  {availableVariables.map((variable) => {
                    const count = usedVariables[variable] || 0;
                    return (
                      <Tooltip key={variable}>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={count > 0 ? "default" : "outline"}
                            className='text-xs relative cursor-pointer hover:bg-primary/80'
                            onClick={() => {
                              const insertVariable = () => {
                                const quill = quillRef.current;

                                if (!quill || !quill.insertText) {
                                  // Fallback sin Quill - agregar al final
                                  handleTemplateChange(
                                    customTemplate === "" ||
                                      customTemplate === "<p><br></p>"
                                      ? `<p>{{${variable}}}</p>`
                                      : customTemplate.replace(
                                          /<\/p>([^<]*)$/,
                                          `{{${variable}}} </p>$1`
                                        )
                                  );
                                  setForceUpdate((prev) => prev + 1);
                                  return;
                                }

                                try {
                                  // Enfocar el editor
                                  quill.focus();

                                  // Pequeña pausa para asegurar el focus
                                  requestAnimationFrame(() => {
                                    // Obtener posición del cursor
                                    const selection = quill.getSelection();
                                    const position = selection
                                      ? selection.index
                                      : quill.getText().length - 1;

                                    // Insertar la variable como texto simple
                                    const variableText = `{{${variable}}}`;
                                    quill.insertText(
                                      position,
                                      variableText + " ",
                                      "user"
                                    );

                                    // Mover cursor después de la variable y el espacio
                                    quill.setSelection(
                                      position + variableText.length + 1
                                    );

                                    // Forzar actualización del estado
                                    setTimeout(() => {
                                      const newHtml = quill.root.innerHTML;
                                      handleTemplateChange(
                                        newHtml === "<p><br></p>" ? "" : newHtml
                                      );
                                      setForceUpdate((prev) => prev + 1);
                                    }, 0);
                                  });
                                } catch (error) {
                                  console.error(
                                    "Error inserting variable:",
                                    error
                                  );
                                  // Fallback - insertar como texto normal
                                  const selection = quill.getSelection();
                                  const position = selection
                                    ? selection.index
                                    : 0;
                                  quill.insertText(
                                    position,
                                    `{{${variable}}} `
                                  );
                                  setTimeout(() => {
                                    const newHtml = quill.root.innerHTML;
                                    handleTemplateChange(
                                      newHtml === "<p><br></p>" ? "" : newHtml
                                    );
                                    setForceUpdate((prev) => prev + 1);
                                  }, 0);
                                }
                              };

                              if (isQuillReady) {
                                insertVariable();
                              } else {
                                // Si Quill no está listo, esperar un poco
                                setTimeout(insertVariable, 100);
                              }
                            }}
                          >
                            {`{{${variable}}}`}
                            {count > 0 && (
                              <span className='ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-xs'>
                                {count}
                              </span>
                            )}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className='max-w-48'>
                            <p className='font-medium text-xs'>{`{{${variable}}}`}</p>
                            <p className='text-xs text-muted-foreground mt-1'>
                              Ejemplo:{" "}
                              <span className='font-mono'>
                                {getVariableExample(variable)}
                              </span>
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>

            <div className='h-80'>
              <ReactQuillWrapper
                ref={(ref) => {
                  quillRef.current = ref;
                  if (ref && !isQuillReady) {
                    setIsQuillReady(true);
                  }
                }}
                value={customTemplate}
                onChange={(value) => {
                  console.log(
                    "🔥 ReactQuillWrapper onChange llamado con:",
                    value
                  );
                  handleQuillChange(value);
                }}
                placeholder='Selecciona una plantilla o escribe tu plantilla personalizada aquí. Haz clic en las variables para agregarlas...'
                className='h-full'
              />
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Se procesarán {selectedEvents.length} evento
            {selectedEvents.length !== 1 ? "s" : ""}
            <span className='text-orange-600 font-medium'>
              {" "}
              (se sobrescribirán las descripciones existentes)
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !customTemplate.trim()}
            >
              {isLoading ? "Generando..." : "Generar Descripciones"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

BulkGenerateDescriptionsModal.displayName = "BulkGenerateDescriptionsModal";
