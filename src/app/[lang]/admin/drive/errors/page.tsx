"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Users,
  Mail,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type ErrorReport = {
  id: string;
  fileName: string;
  fileId?: string;
  message: string;
  fullName: string;
  email: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes?: string;
};

type RecipientConfig = {
  id: string;
  recipients: string[];
  ccRecipients: string[];
  bccRecipients: string[];
  active: boolean;
  updatedAt: string;
};

export default function ErrorReportsPage() {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [recipientConfig, setRecipientConfig] =
    useState<RecipientConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(
    null
  );
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Nuevos estados para editar la configuración de destinatarios
  const [editRecipients, setEditRecipients] = useState<string>("");
  const [editCcRecipients, setEditCcRecipients] = useState<string>("");
  const [editBccRecipients, setEditBccRecipients] = useState<string>("");

  // Cargar reportes y configuración al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar reportes de errores
        const reportsResponse = await fetch("/api/drive/error-report");
        const reportsData = await reportsResponse.json();

        if (!reportsResponse.ok) {
          throw new Error(reportsData.error || "Error al cargar reportes");
        }

        // Cargar configuración de destinatarios
        const configResponse = await fetch("/api/drive/error-report/config");
        const configData = await configResponse.json();

        if (!configResponse.ok) {
          throw new Error(configData.error || "Error al cargar configuración");
        }

        setReports(reportsData.reports);
        setRecipientConfig(configData.config);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error al cargar datos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Preparar la configuración para editar
  useEffect(() => {
    if (recipientConfig) {
      setEditRecipients(recipientConfig.recipients.join(", "));
      setEditCcRecipients(recipientConfig.ccRecipients.join(", "));
      setEditBccRecipients(recipientConfig.bccRecipients.join(", "));
    }
  }, [recipientConfig, isConfigDialogOpen]);

  // Actualizar estado de un reporte
  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      setIsUpdating(true);

      const response = await fetch(`/api/drive/error-report/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes: newNote || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar reporte");
      }

      // Actualizar la lista de reportes
      setReports(
        reports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status,
                notes: newNote,
                updatedAt: new Date().toISOString(),
              }
            : report
        )
      );

      setIsReportDialogOpen(false);
    } catch (err) {
      console.error("Error al actualizar reporte:", err);
      alert("Error al actualizar el reporte");
    } finally {
      setIsUpdating(false);
    }
  };

  // Actualizar configuración de destinatarios
  const updateRecipientsConfig = async () => {
    try {
      setIsUpdating(true);

      // Procesar listas de correos
      const recipients = editRecipients
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
      const ccRecipients = editCcRecipients
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
      const bccRecipients = editBccRecipients
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);

      const response = await fetch("/api/drive/error-report/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients,
          ccRecipients,
          bccRecipients,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar configuración");
      }

      setRecipientConfig(data.config);
      setIsConfigDialogOpen(false);
    } catch (err) {
      console.error("Error al actualizar configuración:", err);
      alert("Error al actualizar la configuración de destinatarios");
    } finally {
      setIsUpdating(false);
    }
  };

  // Renderizar badge de estado
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            <Clock className="h-3 w-3 mr-1" /> Pendiente
          </Badge>
        );
      case "in-progress":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> En proceso
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Resuelto
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p>Cargando reportes de errores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-red-500 mb-2">{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reportes de Errores en Archivos</h1>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsConfigDialogOpen(true)}
            className="flex items-center"
          >
            <Mail className="h-4 w-4 mr-2" />
            Configurar Destinatarios
          </Button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No hay reportes de errores registrados
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo</TableHead>
                <TableHead>Reportado por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {report.fileName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{report.fullName}</span>
                      <span className="text-sm text-gray-500">
                        {report.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>{renderStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setNewNote(report.notes || "");
                        setIsReportDialogOpen(true);
                      }}
                    >
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de detalles del reporte */}
      {selectedReport && (
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalles del Reporte</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Archivo</h3>
                <p className="mt-1">{selectedReport.fileName}</p>
                {selectedReport.fileId && (
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {selectedReport.fileId}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Reportado por
                </h3>
                <p className="mt-1">{selectedReport.fullName}</p>
                <p className="text-sm text-gray-500">{selectedReport.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Mensaje</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-wrap">
                    {selectedReport.message}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Fecha del reporte
                </h3>
                <p className="mt-1">
                  {format(
                    new Date(selectedReport.createdAt),
                    "dd/MM/yyyy HH:mm",
                    { locale: es }
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Estado actual
                </h3>
                <div className="mt-1">
                  {renderStatusBadge(selectedReport.status)}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Notas</h3>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Añadir notas sobre este reporte..."
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <div className="w-full sm:w-auto flex gap-2">
                {selectedReport.status !== "resolved" && (
                  <Button
                    variant="default"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      updateReportStatus(selectedReport.id, "resolved")
                    }
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Marcar como resuelto
                  </Button>
                )}

                {selectedReport.status === "pending" && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      updateReportStatus(selectedReport.id, "in-progress")
                    }
                    disabled={isUpdating}
                  >
                    En proceso
                  </Button>
                )}

                {selectedReport.status === "resolved" && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      updateReportStatus(selectedReport.id, "pending")
                    }
                    disabled={isUpdating}
                  >
                    Reabrir
                  </Button>
                )}
              </div>

              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setIsReportDialogOpen(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de configuración de destinatarios */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configuración de Destinatarios</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinatarios principales
              </label>
              <textarea
                value={editRecipients}
                onChange={(e) => setEditRecipients(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={2}
                placeholder="Correos separados por comas"
              />
              <p className="text-xs text-gray-500 mt-1">
                Personas que reciben directamente los reportes de errores
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinatarios en CC
              </label>
              <textarea
                value={editCcRecipients}
                onChange={(e) => setEditCcRecipients(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={2}
                placeholder="Correos separados por comas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinatarios en CCO
              </label>
              <textarea
                value={editBccRecipients}
                onChange={(e) => setEditBccRecipients(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={2}
                placeholder="Correos separados por comas"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              className="mr-2"
              onClick={() => setIsConfigDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={updateRecipientsConfig}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <></>
              )}
              Guardar configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
