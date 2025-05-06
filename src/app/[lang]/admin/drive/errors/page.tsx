"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Users,
  Mail,
  Tag,
  RefreshCw,
  Check,
  ChevronsUpDown,
  UserPlus,
  X,
  Search,
  Calendar,
  Pencil,
  Trash2,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CategoryManager } from "./components/category-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { cn } from "@/src/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";

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
  category?: string;
  assignedTo?: string[];
  categoryRef?: {
    id: string;
    name: string;
    color: string;
  };
};

type ErrorCategory = {
  id: string;
  name: string;
  description?: string;
  color: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
};

type RecipientConfig = {
  id: string;
  recipients: string[];
  ccRecipients: string[];
  bccRecipients: string[];
  active: boolean;
  updatedAt: string;
};

type UserRole = "ADMIN" | "CLIENT" | "EMPLOYEE";

// Componente personalizado basado en ChipInput para seleccionar usuarios
function UserChipSelect({
  users,
  selectedIds,
  onChange,
  placeholder = "Seleccionar usuarios...",
}: {
  users: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown cuando se hace clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleRemoveUser = (userId: string) => {
    onChange(selectedIds.filter((id) => id !== userId));
  };

  const filteredUsers = users.filter(
    (user) =>
      !selectedIds.includes(user.id) &&
      (user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email.toLowerCase().includes(searchValue.toLowerCase()))
  );

  const selectedUsers = users.filter((user) => selectedIds.includes(user.id));

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="flex flex-wrap gap-2 p-2 min-h-10 border rounded-md cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {selectedUsers.map((user) => (
          <Badge
            key={user.id}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {user.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveUser(user.id);
              }}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <div className="flex-grow flex items-center">
          <input
            type="text"
            className="flex-grow outline-none bg-transparent"
            placeholder={selectedUsers.length === 0 ? placeholder : ""}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
          <div className="p-2 border-b flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              className="flex-grow outline-none bg-transparent"
              placeholder="Buscar usuarios..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filteredUsers.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No se encontraron usuarios
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => {
                    onChange([...selectedIds, user.id]);
                    setSearchValue("");
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");

  // Estados para categorías y usuarios
  const [categories, setCategories] = useState<ErrorCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [updatingReport, setUpdatingReport] = useState(false);
  const [resolvedDate, setResolvedDate] = useState<string>("");

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

        // Cargar categorías y usuarios
        await fetchCategories();
        await fetchUsers();
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

  // Configurar los valores seleccionados cuando se abre el modal de reporte
  useEffect(() => {
    if (selectedReport && isReportDialogOpen) {
      setSelectedCategory(selectedReport.category || "none");
      setSelectedUsers(selectedReport.assignedTo || []);
      setSelectedStatus(selectedReport.status);
      setNewNote(selectedReport.notes || "");

      // Inicializar la fecha de resolución si existe
      if (selectedReport.resolvedAt) {
        const date = new Date(selectedReport.resolvedAt);
        // Formato para datetime-local: YYYY-MM-DDThh:mm
        setResolvedDate(format(date, "yyyy-MM-dd'T'HH:mm"));
      } else {
        setResolvedDate("");
      }
    }
  }, [selectedReport, isReportDialogOpen]);

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/drive/error-categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar categorías");
      }

      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Cargar usuarios (administradores y empleados)
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/users/role?roles=ADMIN,EMPLOYEE");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar usuarios");
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Actualizar reportes después de cambios en categorías
  const handleCategoryChange = () => {
    // Recargar la lista de reportes para obtener las categorías actualizadas
    fetchReports();
    fetchCategories();
  };

  // Función auxiliar para cargar reportes
  const fetchReports = async () => {
    try {
      const response = await fetch("/api/drive/error-report");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar reportes");
      }

      setReports(data.reports);
      console.log("Reportes actualizados:", data.reports);
    } catch (err) {
      console.error("Error al recargar reportes:", err);
    }
  };

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
          category: selectedCategory === "none" ? null : selectedCategory,
          assignedTo: selectedUsers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar reporte");
      }

      // Actualizar la lista de reportes
      await fetchReports();
      setIsReportDialogOpen(false);
    } catch (err) {
      console.error("Error al actualizar reporte:", err);
      alert("Error al actualizar el reporte");
    } finally {
      setIsUpdating(false);
    }
  };

  // Actualizar un reporte completo
  const handleUpdateReport = async () => {
    if (!selectedReport) return;

    try {
      setUpdatingReport(true);

      // Procesar la fecha de resolución
      let resolvedAtDate = null;
      if (resolvedDate) {
        resolvedAtDate = new Date(resolvedDate);
        // Asegurar que la fecha sea válida
        if (isNaN(resolvedAtDate.getTime())) {
          resolvedAtDate = null;
        }
      }

      const response = await fetch(
        `/api/drive/error-report/${selectedReport.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: selectedStatus,
            notes: newNote || undefined,
            category: selectedCategory === "none" ? null : selectedCategory,
            assignedTo: selectedUsers,
            resolvedAt: resolvedAtDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar reporte");
      }

      // Actualizar la lista de reportes
      await fetchReports();
      setIsReportDialogOpen(false);
    } catch (err) {
      console.error("Error al actualizar reporte:", err);
      alert("Error al actualizar el reporte");
    } finally {
      setUpdatingReport(false);
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

  // Eliminar un reporte
  const handleDeleteReport = async () => {
    if (!selectedReport) return;

    try {
      setIsUpdating(true);

      const response = await fetch(
        `/api/drive/error-report/${selectedReport.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar reporte");
      }

      // Actualizar la lista de reportes
      await fetchReports();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error al eliminar reporte:", err);
      alert("Error al eliminar el reporte");
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

  // Renderizar badge de categoría
  const renderCategoryBadge = (report: ErrorReport) => {
    if (!report.categoryRef) return null;

    return (
      <Badge
        variant="outline"
        className="ml-2"
        style={{
          backgroundColor: `${report.categoryRef.color}20`,
          borderColor: report.categoryRef.color,
          color: report.categoryRef.color,
        }}
      >
        {report.categoryRef.name}
      </Badge>
    );
  };

  // Preparar opciones para el selector de usuarios
  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name,
    email: user.email,
    image: user.image,
  }));

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
        <h1 className="text-2xl font-bold">Gestión de Errores en Archivos</h1>

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

      <Tabs
        defaultValue="reports"
        className="mb-8"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Reportes
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorías
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6">
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
                    <TableHead>Categoría</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Resuelto</TableHead>
                    <TableHead>Asignado a</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{report.fileName}</span>
                          <div className="flex mt-1">
                            {renderStatusBadge(report.status)}
                          </div>
                        </div>
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
                        {report.categoryRef ? (
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${report.categoryRef.color}20`,
                              borderColor: report.categoryRef.color,
                              color: report.categoryRef.color,
                            }}
                          >
                            {report.categoryRef.name}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Sin categoría
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(report.createdAt),
                          "dd/MM/yyyy HH:mm",
                          {
                            locale: es,
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {report.resolvedAt
                          ? format(
                              new Date(report.resolvedAt),
                              "dd/MM/yyyy HH:mm",
                              {
                                locale: es,
                              }
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {report.assignedTo && report.assignedTo.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {report.assignedTo.length <= 2 ? (
                              report.assignedTo.map((userId) => {
                                const user = users.find((u) => u.id === userId);
                                return user ? (
                                  <Badge
                                    key={userId}
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {user.name.split(" ")[0]}
                                  </Badge>
                                ) : null;
                              })
                            ) : (
                              <>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {users
                                    .find((u) => u.id === report.assignedTo![0])
                                    ?.name.split(" ")[0] || ""}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  +{report.assignedTo.length - 1}
                                </Badge>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Sin asignar
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setNewNote(report.notes || "");
                                    setIsReportDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Eliminar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryManager onCategoryChange={handleCategoryChange} />
        </TabsContent>
      </Tabs>

      {/* Modal de detalles del reporte */}
      {selectedReport && (
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto">
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
                  Estado del reporte
                </h3>
                <div className="mt-1">
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {selectedStatus === "pending" && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                            <span>Pendiente</span>
                          </div>
                        )}
                        {selectedStatus === "in-progress" && (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 text-blue-500" />
                            <span>En progreso</span>
                          </div>
                        )}
                        {selectedStatus === "resolved" && (
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            <span>Resuelto</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                          <span>Pendiente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in-progress">
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 text-blue-500" />
                          <span>En progreso</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="resolved">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          <span>Resuelto</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Fecha de resolución
                </h3>
                <div className="mt-1 relative">
                  <div className="flex items-center">
                    <Input
                      type="datetime-local"
                      value={resolvedDate}
                      onChange={(e) => setResolvedDate(e.target.value)}
                      className="w-full pr-10"
                      placeholder="Seleccionar fecha y hora de resolución"
                    />
                    <Calendar className="absolute right-3 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Fecha y hora en que se resolvió el error
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                <div className="mt-1">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Asignados</h3>
                <div className="mt-1">
                  <UserChipSelect
                    users={users}
                    selectedIds={selectedUsers}
                    onChange={setSelectedUsers}
                    placeholder="Buscar y seleccionar usuarios asignados..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Personas asignadas a resolver este error
                </p>
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

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="default"
                className="w-full sm:w-auto"
                onClick={handleUpdateReport}
                disabled={updatingReport}
              >
                {updatingReport ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Actualizar
              </Button>

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

      {/* Modal de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <p>¿Está seguro que desea eliminar este reporte?</p>
            {selectedReport && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{selectedReport.fileName}</p>
                <p className="text-sm text-gray-500">
                  Reportado por: {selectedReport.fullName}
                </p>
              </div>
            )}
            <p className="text-sm text-destructive">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleDeleteReport}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar
            </Button>

            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
