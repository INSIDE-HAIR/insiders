/**
 * EDITSECTION - Sección de edición del evento de calendario
 * Permite editar los campos principales del evento
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useCallback } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { ReactQuillWrapper } from "@/src/components/ui/ReactQuillWrapper";
import { toast } from "@/src/components/ui/use-toast";
import { 
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  MapPinIcon,
  LinkIcon
} from "@heroicons/react/24/outline";

interface EditSectionProps {
  event: GoogleCalendarEvent;
  calendars?: Array<{
    id: string;
    summary: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
  onSave?: (updatedEvent: Partial<GoogleCalendarEvent>) => Promise<void>;
  onCancel?: () => void;
}

export const EditSection: React.FC<EditSectionProps> = ({
  event,
  calendars = [],
  onSave,
  onCancel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para los campos editables
  const [formData, setFormData] = useState({
    summary: event.summary || "",
    description: event.description || "",
    location: event.location || "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  // Inicializar fechas y horas
  React.useEffect(() => {
    if (event.start?.dateTime) {
      const startDate = new Date(event.start.dateTime);
      setFormData(prev => ({
        ...prev,
        startDate: startDate.toISOString().split('T')[0] || '',
        startTime: startDate.toTimeString().slice(0, 5),
      }));
    } else if (event.start?.date) {
      setFormData(prev => ({
        ...prev,
        startDate: event.start.date!,
        startTime: "",
      }));
    }

    if (event.end?.dateTime) {
      const endDate = new Date(event.end.dateTime);
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0] || '',
        endTime: endDate.toTimeString().slice(0, 5),
      }));
    } else if (event.end?.date) {
      setFormData(prev => ({
        ...prev,
        endDate: event.end.date!,
        endTime: "",
      }));
    }
  }, [event]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Si se cambia la fecha/hora de inicio, actualizar automáticamente la fecha/hora de fin
      // manteniendo la duración original
      if ((field === 'startDate' || field === 'startTime') && event.start && event.end) {
        try {
          // Calcular la duración original
          const originalStart = new Date(event.start.dateTime || event.start.date || '');
          const originalEnd = new Date(event.end.dateTime || event.end.date || '');
          const originalDuration = originalEnd.getTime() - originalStart.getTime();
          
          // Crear la nueva fecha de inicio
          let newStartDate: Date;
          if (field === 'startDate') {
            // Si cambia la fecha de inicio
            newStartDate = new Date(value + 'T' + (prev.startTime || '00:00'));
          } else {
            // Si cambia la hora de inicio
            newStartDate = new Date(prev.startDate + 'T' + value);
          }
          
          // Calcular la nueva fecha de fin manteniendo la duración
          const newEndDate = new Date(newStartDate.getTime() + originalDuration);
          
          // Actualizar también los campos de fin
          newData.endDate = newEndDate.toISOString().split('T')[0];
          newData.endTime = newEndDate.toTimeString().slice(0, 5);
        } catch (error) {
          console.warn('Error calculating end date/time:', error);
          // Si hay error, solo actualizar el campo solicitado
        }
      }
      
      return newData;
    });
  };

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      // Construir el objeto de evento actualizado
      const updatedEvent: Partial<GoogleCalendarEvent> = {
        summary: formData.summary,
        description: formData.description,
        location: formData.location || undefined,
      };

      // Manejar fechas
      if (formData.startDate) {
        if (formData.startTime) {
          // Evento con hora específica
          updatedEvent.start = {
            dateTime: `${formData.startDate}T${formData.startTime}:00`,
            timeZone: 'Europe/Madrid',
          };
        } else {
          // Evento de día completo
          updatedEvent.start = {
            date: formData.startDate,
          };
        }
      }

      if (formData.endDate) {
        if (formData.endTime) {
          // Evento con hora específica
          updatedEvent.end = {
            dateTime: `${formData.endDate}T${formData.endTime}:00`,
            timeZone: 'Europe/Madrid',
          };
        } else {
          // Evento de día completo (agregar un día)
          const nextDay = new Date(formData.endDate);
          nextDay.setDate(nextDay.getDate() + 1);
          updatedEvent.end = {
            date: nextDay.toISOString().split('T')[0],
          };
        }
      }

      await onSave(updatedEvent);
      setIsEditing(false);
      
      toast({
        title: "Evento actualizado",
        description: "Los cambios se guardaron correctamente",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: error.message || "Error al guardar los cambios",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave]);

  const handleCancel = () => {
    // Restaurar valores originales
    setFormData({
      summary: event.summary || "",
      description: event.description || "",
      location: event.location || "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
    setIsEditing(false);
    if (onCancel) onCancel();
  };

  return (
    <div className="space-y-6">
      {/* Header con botones de acción */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PencilSquareIcon className="h-5 w-5" />
              Editar Evento
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <PencilSquareIcon className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    size="sm"
                    disabled={isSaving}
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    size="sm"
                    disabled={isSaving}
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formulario de edición */}
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título */}
          <div>
            <Label htmlFor="summary">Título del evento</Label>
            {isEditing ? (
              <Input
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="Ingresa el título del evento"
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-lg font-semibold">
                {event.summary || "Sin título"}
              </p>
            )}
          </div>

          <Separator />

          {/* Fechas y horas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Fecha y hora de inicio
              </Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    placeholder="Hora (opcional para evento de día completo)"
                  />
                </div>
              ) : (
                <div className="mt-1">
                  {event.start?.dateTime ? (
                    <>
                      <p>{new Date(event.start.dateTime).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.start.dateTime).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </>
                  ) : event.start?.date ? (
                    <p>{new Date(event.start.date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  ) : (
                    <p className="text-muted-foreground">No especificado</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Fecha y hora de fin
              </Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    placeholder="Hora (opcional para evento de día completo)"
                  />
                </div>
              ) : (
                <div className="mt-1">
                  {event.end?.dateTime ? (
                    <>
                      <p>{new Date(event.end.dateTime).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.end.dateTime).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </>
                  ) : event.end?.date ? (
                    <p>{new Date(event.end.date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  ) : (
                    <p className="text-muted-foreground">No especificado</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Ubicación */}
          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              Ubicación
            </Label>
            {isEditing ? (
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ubicación del evento"
                className="mt-1"
              />
            ) : (
              <p className="mt-1">
                {event.location || <span className="text-muted-foreground">No especificado</span>}
              </p>
            )}
          </div>

          {/* Enlace de Meet (solo lectura) */}
          {event.hangoutLink && (
            <>
              <Separator />
              <div>
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Enlace de videollamada
                </Label>
                <a 
                  href={event.hangoutLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-blue-600 hover:text-blue-800 hover:underline block break-all"
                >
                  {event.hangoutLink}
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Descripción */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="h-64">
              <ReactQuillWrapper
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="Descripción del evento..."
                className="h-full"
              />
            </div>
          ) : (
            <div>
              {event.description ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              ) : (
                <p className="text-muted-foreground italic">Sin descripción</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};