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
import { SpeakerXMarkIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { toast } from "@/src/components/ui/use-toast";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface DescriptionTemplateSelectorProps {
  eventId: string;
  calendarId: string;
  currentDescription?: string;
  onDescriptionGenerated: (newDescription: string) => void;
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
> = ({ eventId, calendarId, currentDescription, onDescriptionGenerated }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("automático");
  const [customTemplate, setCustomTemplate] = useState("");
  const [includeAttendees, setIncludeAttendees] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeDateTime, setIncludeDateTime] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/generate-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calendarId,
            template: selectedTemplate,
            customTemplate:
              selectedTemplate === "personalizado" ? customTemplate : undefined,
            includeAttendees,
            includeLocation,
            includeDateTime,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar descripción");
      }

      const result = await response.json();
      onDescriptionGenerated(result.description);

      toast({
        title: "Descripción generada",
        description: "La descripción se ha generado correctamente",
        duration: 3000,
      });

      setIsDialogOpen(false);
      setPreview(""); // Reset preview
    } catch (error: any) {
      console.error("Error generating description:", error);
      toast({
        title: "Error",
        description: error.message || "Error al generar la descripción",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadPreview = useCallback(async () => {
    if (!eventId || !calendarId) return;

    setIsLoadingPreview(true);
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/preview-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calendarId,
            template: selectedTemplate,
            customTemplate:
              selectedTemplate === "personalizado" ? customTemplate : undefined,
            includeAttendees,
            includeLocation,
            includeDateTime,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar preview");
      }

      const result = await response.json();
      setPreview(result.preview);
    } catch (error: any) {
      console.error("Error loading preview:", error);
      setPreview("Error al cargar preview");
    } finally {
      setIsLoadingPreview(false);
    }
  }, [eventId, calendarId, selectedTemplate, customTemplate, includeAttendees, includeLocation, includeDateTime]);

  // Load preview when dialog opens and when settings change
  useEffect(() => {
    if (isDialogOpen) {
      loadPreview();
    }
  }, [isDialogOpen, loadPreview]);

  // Reset states when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setPreview("");
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-600 hover:bg-blue-50 flex items-center gap-2"
        >
          <SpeakerXMarkIcon className="h-4 w-4" />
          Generar descripción
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Generar descripción con plantilla</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-full">
          {/* Left Panel - Configuration */}
          <div className="w-1/2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plantilla
              </label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plantilla personalizada
                </label>
                <Textarea
                  value={customTemplate}
                  onChange={(e) => setCustomTemplate(e.target.value)}
                  placeholder="Escribe tu plantilla personalizada aquí. Puedes usar variables como {titulo}, {fecha_inicio}, {ubicacion}, etc."
                  rows={4}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Variables disponibles:{" "}
                  {
                    "{titulo}, {fecha_inicio}, {hora_inicio}, {ubicacion}, {meet_link}, {lista_participantes}"
                  }
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Incluir información
              </h4>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={includeDateTime}
                  onCheckedChange={(checked) =>
                    setIncludeDateTime(checked === true)
                  }
                />
                Fecha y hora
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={includeLocation}
                  onCheckedChange={(checked) =>
                    setIncludeLocation(checked === true)
                  }
                />
                Ubicación
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={includeAttendees}
                  onCheckedChange={(checked) =>
                    setIncludeAttendees(checked === true)
                  }
                />
                Lista de participantes
              </label>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 border-l pl-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Vista previa
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 min-h-96 max-h-96 overflow-y-auto">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div
                  className="text-sm text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      preview ||
                      "<p class='text-gray-500 italic'>Configura las opciones para ver la vista previa</p>",
                  }}
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isGenerating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerateDescription}
                disabled={
                  isGenerating ||
                  (selectedTemplate === "personalizado" &&
                    !customTemplate.trim())
                }
              >
                {isGenerating ? "Generando..." : "Aplicar Plantilla"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
