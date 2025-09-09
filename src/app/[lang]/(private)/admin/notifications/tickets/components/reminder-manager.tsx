"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  ClockIcon,
  PlusCircle,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  InfoIcon,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Reminder = {
  id: string;
  status: "pending" | "in-progress";
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  interval: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastSent?: string;
};

interface ReminderManagerProps {
  onReminderChange?: () => void;
}

export function ReminderManager({ onReminderChange }: ReminderManagerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Estados para el formulario
  const [formStatus, setFormStatus] = useState<"pending" | "in-progress">(
    "pending"
  );
  const [formFrequency, setFormFrequency] = useState<
    "hourly" | "daily" | "weekly" | "monthly"
  >("daily");
  const [formInterval, setFormInterval] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar recordatorios
  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/drive/error-reminders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar recordatorios");
      }

      setReminders(data.reminders || []);
    } catch (err) {
      console.error("Error al cargar recordatorios:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar al iniciar
  useEffect(() => {
    fetchReminders();
  }, []);

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar entradas
      if (!formStatus || !formFrequency || !formInterval) {
        throw new Error("Todos los campos son obligatorios");
      }

      // Validar que el intervalo sea un número positivo
      const interval = parseInt(formInterval);
      if (isNaN(interval) || interval <= 0) {
        throw new Error("El intervalo debe ser un número positivo");
      }

      // Preparar datos
      const reminderData = {
        id: selectedReminder?.id,
        status: formStatus,
        frequency: formFrequency,
        interval,
        active: true,
      };

      // Determinar si es creación o actualización
      const method = selectedReminder ? "PUT" : "POST";
      const url = selectedReminder
        ? `/api/drive/error-reminders/${selectedReminder.id}`
        : "/api/drive/error-reminders";

      // Enviar solicitud
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar el recordatorio");
      }

      // Recargar recordatorios
      await fetchReminders();

      // Notificar cambio si hay callback
      if (onReminderChange) {
        onReminderChange();
      }

      // Cerrar diálogo y resetear formulario
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error al guardar recordatorio:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Configurar formulario para edición
  const handleEdit = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setFormStatus(reminder.status);
    setFormFrequency(reminder.frequency);
    setFormInterval(reminder.interval.toString());
    setIsDialogOpen(true);
  };

  // Preparar para crear nuevo recordatorio
  const handleCreate = () => {
    resetForm();
    setSelectedReminder(null);
    setIsDialogOpen(true);
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/drive/error-reminders/${deleteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el recordatorio");
      }

      // Recargar recordatorios
      await fetchReminders();

      // Notificar cambio si hay callback
      if (onReminderChange) {
        onReminderChange();
      }

      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (err) {
      console.error("Error al eliminar recordatorio:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsDeleting(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormStatus("pending");
    setFormFrequency("daily");
    setFormInterval("1");
    setError(null);
  };

  // Renderizar icono de estado
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "in-progress":
        return <Loader2 className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // Obtener texto descriptivo para la frecuencia
  const getFrequencyText = (frequency: string, interval: number) => {
    switch (frequency) {
      case "hourly":
        return `Cada ${interval} hora${interval !== 1 ? "s" : ""}`;
      case "daily":
        return `Cada ${interval} día${interval !== 1 ? "s" : ""}`;
      case "weekly":
        return `Cada ${interval} semana${interval !== 1 ? "s" : ""}`;
      case "monthly":
        return `Cada ${interval} mes${interval !== 1 ? "es" : ""}`;
      default:
        return `${frequency} (${interval})`;
    }
  };

  // Obtener texto para el estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En progreso";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        <p className="text-white">Cargando recordatorios...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Recordatorios</h2>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-zinc-900">
          <PlusCircle className="h-4 w-4" />
          Nuevo recordatorio
        </Button>
      </div>

      {error && (
        <div className="bg-red-800/20 border border-red-600 text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="text-center py-8 bg-zinc-800 rounded-lg border border-zinc-700">
          <ClockIcon className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">
            No hay recordatorios configurados
          </p>
          <Button onClick={handleCreate} variant="outline" className="mx-auto bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
            Crear el primer recordatorio
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-zinc-700 overflow-hidden bg-zinc-950">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-zinc-800 hover:bg-zinc-800 border-b border-zinc-700">
                  <TableHead className="text-zinc-300 font-medium">Tipo</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Frecuencia</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Última ejecución</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Estado</TableHead>
                  <TableHead className="text-zinc-300 font-medium text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.id} className="hover:bg-zinc-900/50 group border-b border-zinc-800 bg-zinc-950">
                    <TableCell className="text-zinc-200">
                      <div className="flex items-center">
                        {renderStatusIcon(reminder.status)}
                        <span className="ml-2">
                          {getStatusText(reminder.status)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-200">
                      {getFrequencyText(reminder.frequency, reminder.interval)}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {reminder.lastSent
                        ? format(
                            new Date(reminder.lastSent),
                            "dd/MM/yyyy HH:mm",
                            { locale: es }
                          )
                        : "Nunca ejecutado"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={reminder.active ? "default" : "outline"}
                        className={reminder.active ? 
                          "bg-green-600/20 text-green-400 border-green-600/50" : 
                          "bg-zinc-800/50 text-zinc-400 border-zinc-700"
                        }
                      >
                        {reminder.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(reminder)}
                          className="h-8 w-8 text-zinc-400 hover:text-primary hover:bg-zinc-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-zinc-800"
                          onClick={() => {
                            setDeleteId(reminder.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Modal de edición/creación de recordatorio */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedReminder ? "Editar recordatorio" : "Nuevo recordatorio"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 my-4">
              {error && (
                <div className="bg-red-800/20 border border-red-600 text-red-400 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="status" className="text-zinc-300">Estado de reportes</Label>
                <Select
                  value={formStatus}
                  onValueChange={(value: "pending" | "in-progress") =>
                    setFormStatus(value)
                  }
                >
                  <SelectTrigger id="status" className="w-full bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="pending" className="text-white hover:bg-zinc-700">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>Pendiente</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="in-progress" className="text-white hover:bg-zinc-700">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 text-blue-500" />
                        <span>En progreso</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-400 mt-1">
                  Los recordatorios se enviarán para reportes en este estado
                </p>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="frequency" className="text-zinc-300">Frecuencia</Label>
                  <Select
                    value={formFrequency}
                    onValueChange={(
                      value: "hourly" | "daily" | "weekly" | "monthly"
                    ) => setFormFrequency(value)}
                  >
                    <SelectTrigger id="frequency" className="w-full bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Selecciona frecuencia" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="hourly" className="text-white hover:bg-zinc-700">Horas</SelectItem>
                      <SelectItem value="daily" className="text-white hover:bg-zinc-700">Días</SelectItem>
                      <SelectItem value="weekly" className="text-white hover:bg-zinc-700">Semanas</SelectItem>
                      <SelectItem value="monthly" className="text-white hover:bg-zinc-700">Meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-1/3">
                  <Label htmlFor="interval" className="text-zinc-300">Intervalo</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={formInterval}
                    onChange={(e) => setFormInterval(e.target.value)}
                    className="w-full bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm mt-2 text-zinc-400">
                  <InfoIcon className="h-4 w-4 inline-block mr-1 text-blue-400" />
                  Los recordatorios se enviarán a los usuarios asignados a cada
                  reporte. Si un reporte no tiene usuarios asignados, se
                  utilizará la configuración general de destinatarios.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="ml-2 bg-primary hover:bg-primary/90 text-zinc-900">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar eliminación</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <p className="text-zinc-200">¿Está seguro que desea eliminar este recordatorio?</p>
            <p className="text-sm text-red-400">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="ml-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
