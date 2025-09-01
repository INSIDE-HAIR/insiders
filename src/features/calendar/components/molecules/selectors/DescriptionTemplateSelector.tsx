/**
 * DescriptionTemplateSelector - Molecular Component
 *
 * Selector de plantillas de descripción usando shadcn components
 * Migrado desde el componente original manteniendo estética IDÉNTICA
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { SpeakerXMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { toast } from "@/src/components/ui/use-toast";
import { cn } from "@/src/lib/utils";

interface DescriptionTemplateSelectorProps {
  eventId: string;
  calendarId: string;
  currentDescription?: string;
  onDescriptionGenerated: (newDescription: string) => void;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

const PREDEFINED_TEMPLATES = [
  { value: "clásico", label: "Clásico" },
  { value: "reunión", label: "Reunión" },
  { value: "formación", label: "Formación" },
  { value: "presentación", label: "Presentación" },
  { value: "seguimiento", label: "Seguimiento" },
  { value: "automático", label: "Automático" },
  { value: "personalizado", label: "Plantilla personalizada..." },
];

export const DescriptionTemplateSelector: React.FC<
  DescriptionTemplateSelectorProps
> = ({
  eventId,
  calendarId,
  currentDescription,
  onDescriptionGenerated,
  className,
  isLoading = false,
  disabled = false,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState("automático");
  const [customTemplate, setCustomTemplate] = useState("");
  const [includeAttendees, setIncludeAttendees] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeDateTime, setIncludeDateTime] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [preview, setPreview] = useState("");

  // Cargar plantilla personalizada guardada
  useEffect(() => {
    const savedTemplate = localStorage.getItem("calendar-custom-template");
    if (savedTemplate) {
      setCustomTemplate(savedTemplate);
    }
  }, []);

  // Generar preview de la plantilla
  const generatePreview = useCallback(() => {
    if (selectedTemplate === "personalizado" && customTemplate) {
      // Simular datos para preview
      let previewText = customTemplate
        .replace(/\{título\}/g, "Reunión de Equipo")
        .replace(/\{fecha\}/g, "15 de Diciembre, 2024")
        .replace(/\{hora\}/g, "10:00 AM - 11:00 AM")
        .replace(/\{ubicación\}/g, "Sala de Juntas")
        .replace(/\{asistentes\}/g, "Juan Pérez, María García");

      setPreview(previewText);
    } else if (selectedTemplate !== "personalizado") {
      // Templates predefinidas
      const templates = {
        clásico: `📅 Reunión: {título}
        
🕐 Fecha: {fecha}
⏰ Hora: {hora}
📍 Ubicación: {ubicación}

👥 Participantes: {asistentes}

📋 Agenda:
- Punto 1
- Punto 2
- Punto 3

---
Esta reunión ha sido programada automáticamente.`,

        reunión: `🤝 {título}

📊 Información:
• Fecha: {fecha}
• Hora: {hora}
• Lugar: {ubicación}
• Asistentes: {asistentes}

🎯 Objetivos:
- [ ] Objetivo 1
- [ ] Objetivo 2
- [ ] Objetivo 3`,

        formación: `📚 Sesión de Formación: {título}

📅 Cuándo: {fecha} a las {hora}
🏢 Dónde: {ubicación}
👨‍🏫 Participantes: {asistentes}

📖 Contenido:
1. Introducción
2. Desarrollo
3. Práctica
4. Q&A

💡 Preparación recomendada: Revisar material previo`,

        presentación: `🎤 Presentación: {título}

📊 Detalles:
📆 {fecha}
🕒 {hora}
📍 {ubicación}
👥 Audiencia: {asistentes}

🎯 Agenda:
• Introducción (5 min)
• Presentación principal (30 min)
• Q&A (10 min)
• Cierre (5 min)`,

        seguimiento: `🔄 Seguimiento: {título}

📈 Revisión programada para:
🗓️ {fecha} a las {hora}
📍 {ubicación}
🤝 Participantes: {asistentes}

📝 Puntos a revisar:
- Estado actual
- Próximos pasos
- Bloqueadores
- Decisiones pendientes`,

        automático: `{título}

{fecha} - {hora}
{ubicación}
{asistentes}`,
      };

      const template =
        templates[selectedTemplate as keyof typeof templates] ||
        templates["automático"];
      setPreview(
        template
          .replace(/\{título\}/g, "Reunión de Equipo")
          .replace(/\{fecha\}/g, "15 de Diciembre, 2024")
          .replace(/\{hora\}/g, "10:00 AM - 11:00 AM")
          .replace(/\{ubicación\}/g, "Sala de Juntas")
          .replace(/\{asistentes\}/g, "Juan Pérez, María García")
      );
    }
  }, [selectedTemplate, customTemplate]);

  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      let templateToUse = "";

      if (selectedTemplate === "personalizado") {
        if (!customTemplate.trim()) {
          toast({
            title: "Error",
            description: "Debe proporcionar una plantilla personalizada",
            variant: "destructive",
          });
          return;
        }
        templateToUse = customTemplate;
        // Guardar plantilla personalizada
        localStorage.setItem("calendar-custom-template", customTemplate);
      } else {
        // Usar plantilla predefinida
        const templates = {
          clásico: `📅 Reunión: {{titulo}}

🕐 Fecha: {{fecha}}
⏰ Hora: {{hora}}
${includeLocation ? "📍 Ubicación: {{ubicacion}}" : ""}

${includeAttendees ? "👥 Participantes: {{asistentes}}" : ""}

📋 Agenda:
- Punto 1
- Punto 2
- Punto 3

---
Esta reunión ha sido programada automáticamente.`,
          // ... otros templates
        };

        templateToUse =
          templates[selectedTemplate as keyof typeof templates] ||
          templates["clásico"];
      }

      // Simular llamada API para generar descripción
      const response = await fetch("/api/calendar/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          calendarId,
          template: templateToUse,
          includeAttendees,
          includeLocation,
          includeDateTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar descripción");
      }

      const { description } = await response.json();

      onDescriptionGenerated(description);
      setIsDialogOpen(false);

      toast({
        title: "Descripción generada",
        description: "La descripción se ha generado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-10 w-full' />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className='text-sm font-medium'>Plantilla de Descripción</Label>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant='outline'
            className='w-full justify-start'
            disabled={disabled}
          >
            <SparklesIcon className='mr-2 h-4 w-4' />
            Generar descripción automática
            {currentDescription && (
              <Badge variant='secondary' className='ml-auto'>
                Tiene descripción
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className='max-w-4xl max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <SparklesIcon className='h-5 w-5' />
              Generar Descripción Automática
            </DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-2 gap-6 py-4'>
            {/* Configuración */}
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Seleccionar Plantilla</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar plantilla...' />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_TEMPLATES.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate === "personalizado" && (
                <div className='space-y-2'>
                  <Label>Plantilla Personalizada</Label>
                  <Textarea
                    placeholder='Escribe tu plantilla usando variables como {título}, {fecha}, {hora}, {ubicación}, {asistentes}...'
                    value={customTemplate}
                    onChange={(e) => setCustomTemplate(e.target.value)}
                    rows={8}
                    className='text-sm font-mono'
                  />
                  <div className='text-xs text-muted-foreground'>
                    Variables disponibles: {"{título}"}, {"{fecha}"}, {"{hora}"}
                    , {"{ubicación}"}, {"{asistentes}"}
                  </div>
                </div>
              )}

              <Separator />

              <div className='space-y-3'>
                <Label>Incluir en la descripción</Label>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='include-attendees'
                    checked={includeAttendees}
                    onCheckedChange={(checked) =>
                      setIncludeAttendees(checked === true)
                    }
                  />
                  <Label htmlFor='include-attendees' className='text-sm'>
                    Lista de asistentes
                  </Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='include-location'
                    checked={includeLocation}
                    onCheckedChange={(checked) =>
                      setIncludeLocation(checked === true)
                    }
                  />
                  <Label htmlFor='include-location' className='text-sm'>
                    Ubicación del evento
                  </Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='include-datetime'
                    checked={includeDateTime}
                    onCheckedChange={(checked) =>
                      setIncludeDateTime(checked === true)
                    }
                  />
                  <Label htmlFor='include-datetime' className='text-sm'>
                    Fecha y hora
                  </Label>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className='space-y-2'>
              <Label>Vista Previa</Label>
              <div className='bg-muted p-4 rounded-lg min-h-[200px] text-sm whitespace-pre-line'>
                {preview ||
                  "Selecciona una plantilla para ver la vista previa..."}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDialogOpen(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                (selectedTemplate === "personalizado" && !customTemplate.trim())
              }
            >
              {isGenerating ? (
                <>
                  <SpeakerXMarkIcon className='mr-2 h-4 w-4 animate-spin' />
                  Generando...
                </>
              ) : (
                <>
                  <SparklesIcon className='mr-2 h-4 w-4' />
                  Generar Descripción
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Loading skeleton
export const DescriptionTemplateSelectorSkeleton: React.FC = () => (
  <div className='space-y-2 animate-pulse'>
    <Skeleton className='h-4 w-32' />
    <Skeleton className='h-10 w-full' />
  </div>
);

DescriptionTemplateSelector.displayName = "DescriptionTemplateSelector";
