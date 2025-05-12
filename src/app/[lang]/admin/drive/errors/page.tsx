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
  Clock3,
  BellRing,
  SendIcon,
  Flag,
  Info,
  Bell,
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
  DialogDescription,
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
import { ReminderManager } from "./components/reminder-manager";
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
import { useToast } from "@/src/components/ui/use-toast";
import { Toaster } from "@/src/components/ui/toaster";
import {
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import { Send } from "lucide-react";

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

// Interfaz para plantillas de correo
type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  content: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
};

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
  const { toast } = useToast();
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

  // Add these new state variables
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [isMassActionDialogOpen, setIsMassActionDialogOpen] = useState(false);
  const [massActionType, setMassActionType] = useState<string | null>(null);
  const [selectedMassStatus, setSelectedMassStatus] = useState("pending");
  const [selectedMassCategory, setSelectedMassCategory] = useState("none");
  const [selectedMassUsers, setSelectedMassUsers] = useState<string[]>([]);
  const [isMassActionLoading, setIsMassActionLoading] = useState(false);

  // Add these new state variables
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [customDateStart, setCustomDateStart] = useState<string>("");
  const [customDateEnd, setCustomDateEnd] = useState<string>("");
  const [filteredReports, setFilteredReports] = useState<ErrorReport[]>([]);
  const [isCustomDateDialogOpen, setIsCustomDateDialogOpen] = useState(false);

  // Estado para envío de correos
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customEmailSubject, setCustomEmailSubject] = useState("");
  const [customEmailContent, setCustomEmailContent] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

  // Mostrar fecha actual cuando se cambia a resuelto
  useEffect(() => {
    if (selectedStatus === "resolved" && !resolvedDate) {
      setCurrentDateTime();
    }
  }, [selectedStatus]);

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
      // Mostrar toast de carga
      toast({
        title: "Actualizando reporte...",
        description: "Guardando los cambios en el reporte.",
        variant: "default",
      });

      // Procesar la fecha de resolución
      let resolvedAtDate = null;

      // Si se marca como resuelto pero no hay fecha de resolución, usar la fecha actual
      if (selectedStatus === "resolved") {
        if (resolvedDate) {
          resolvedAtDate = new Date(resolvedDate);
          // Asegurar que la fecha sea válida
          if (isNaN(resolvedAtDate.getTime())) {
            resolvedAtDate = new Date(); // Usar fecha actual si no es válida
          }
        } else {
          // Si no hay fecha de resolución pero está marcado como resuelto, usar fecha actual
          resolvedAtDate = new Date();
        }
      } else if (resolvedDate) {
        // Para otros estados, mantener la fecha de resolución si existe
        resolvedAtDate = new Date(resolvedDate);
        if (isNaN(resolvedAtDate.getTime())) {
          resolvedAtDate = null;
        }
      }

      // Detectar usuarios nuevos que se están asignando
      const currentAssignees = selectedReport.assignedTo || [];
      const newAssignees = selectedUsers.filter(
        (userId) => !currentAssignees.includes(userId)
      );

      // Preparar la lista de usuarios a notificar con sus emails
      const usersToNotify = newAssignees
        .map((userId) => {
          const user = users.find((u) => u.id === userId);
          return user
            ? { id: user.id, name: user.name, email: user.email }
            : null;
        })
        .filter(Boolean);

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
            notifyUsers: usersToNotify.length > 0 ? usersToNotify : undefined,
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

      // Mostrar toast de éxito
      toast({
        title: "Reporte actualizado",
        description: "El reporte se actualizó correctamente.",
        variant: "success",
      });
    } catch (err) {
      console.error("Error al actualizar reporte:", err);
      // Mostrar toast de error
      toast({
        title: "Error al actualizar",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "error",
      });
    } finally {
      setUpdatingReport(false);
    }
  };

  // Actualizar configuración de destinatarios
  const updateRecipientsConfig = async () => {
    try {
      setIsUpdating(true);
      // Mostrar toast de carga
      toast({
        title: "Actualizando configuración...",
        description: "Guardando la configuración de destinatarios.",
        variant: "default",
      });

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

      // Mostrar toast de éxito
      toast({
        title: "Configuración actualizada",
        description:
          "La configuración de destinatarios se actualizó correctamente.",
        variant: "success",
      });
    } catch (err) {
      console.error("Error al actualizar configuración:", err);
      // Mostrar toast de error
      toast({
        title: "Error al actualizar configuración",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Eliminar un reporte
  const handleDeleteReport = async () => {
    if (!selectedReport) return;

    try {
      setIsUpdating(true);
      // Mostrar toast de carga
      toast({
        title: "Eliminando reporte...",
        description: "Eliminando el reporte seleccionado.",
        variant: "default",
      });

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

      // Mostrar toast de éxito
      toast({
        title: "Reporte eliminado",
        description: "El reporte se eliminó correctamente.",
        variant: "success",
      });
    } catch (err) {
      console.error("Error al eliminar reporte:", err);
      // Mostrar toast de error
      toast({
        title: "Error al eliminar",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Enviar recordatorio inmediato
  const sendImmediateReminder = async (report: ErrorReport) => {
    try {
      setIsUpdating(true);
      // Mostrar toast de carga
      toast({
        title: "Enviando recordatorio...",
        description: "Enviando un recordatorio a los destinatarios.",
        variant: "default",
      });

      // Determinar los destinatarios
      const recipients: Array<string> = [];

      // Si hay usuarios asignados, usar sus emails
      if (report.assignedTo && report.assignedTo.length > 0) {
        // Encontrar usuarios por IDs
        for (const userId of report.assignedTo) {
          const user = users.find((u) => u.id === userId);
          if (user && user.email) {
            recipients.push(user.email);
          }
        }
      }
      // Si no hay usuarios asignados, usar la configuración general
      else if (recipientConfig && recipientConfig.recipients.length > 0) {
        recipientConfig.recipients.forEach((email) => {
          recipients.push(email);
        });
      }

      if (recipients.length === 0) {
        alert("No hay destinatarios configurados para enviar el recordatorio");
        return;
      }

      const response = await fetch(
        `/api/drive/error-report/${report.id}/reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipients,
            manualTrigger: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar recordatorio");
      }

      // Mostrar toast de éxito
      toast({
        title: "Recordatorio enviado",
        description: "El recordatorio se envió correctamente.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error al enviar recordatorio:", error);
      // Mostrar toast de error
      toast({
        title: "Error al enviar recordatorio",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "error",
      });
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

  // Función para establecer fecha y hora actuales en formato para datetime-local
  const setCurrentDateTime = () => {
    const now = new Date();
    // Formato: YYYY-MM-DDThh:mm (formato que espera input datetime-local)
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setResolvedDate(formattedDateTime);
  };

  // Function to toggle selection of a single report
  const toggleReportSelection = (reportId: string) => {
    setSelectedReportIds((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  // Function to toggle selection of all reports
  const toggleAllReports = () => {
    const displayReports = getDisplayReports();

    if (
      selectedReportIds.length === displayReports.length &&
      displayReports.length > 0
    ) {
      // If all visible reports are selected, unselect all
      setSelectedReportIds([]);
    } else {
      // Otherwise, select all visible reports
      setSelectedReportIds(displayReports.map((report) => report.id));
    }
  };

  // Function to execute mass action
  const executeMassAction = async () => {
    if (selectedReportIds.length === 0) return;

    try {
      setIsMassActionLoading(true);
      // Mostrar toast de carga
      toast({
        title: "Procesando acción masiva...",
        description: `Aplicando cambios a ${selectedReportIds.length} reportes.`,
        variant: "default",
      });

      let payload: any = {
        ids: selectedReportIds,
        action: massActionType,
      };

      // Add specific data based on action type
      switch (massActionType) {
        case "update-status":
          payload.data = { status: selectedMassStatus };
          break;
        case "assign-category":
          payload.data = {
            category:
              selectedMassCategory === "none" ? null : selectedMassCategory,
          };
          break;
        case "assign-users":
          payload.data = { assignedTo: selectedMassUsers };
          break;
      }

      const response = await fetch("/api/drive/error-report/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar acción masiva");
      }

      // Reload reports and reset selections
      await fetchReports();
      setSelectedReportIds([]);
      setIsMassActionDialogOpen(false);
      setMassActionType(null);

      // Mostrar toast de éxito
      toast({
        title: "Acción completada",
        description:
          data.message || `${data.count} reportes actualizados correctamente.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error ejecutando acción masiva:", error);
      // Mostrar toast de error
      toast({
        title: "Error en acción masiva",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "error",
      });
    } finally {
      setIsMassActionLoading(false);
    }
  };

  // Filter reports based on selected criteria
  useEffect(() => {
    let result = [...reports];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((report) => report.status === statusFilter);
    }

    // Apply date filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (dateRangeFilter) {
        case "7days":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
        case "3months":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "custom":
          if (customDateStart && customDateEnd) {
            const start = new Date(customDateStart);
            // Set end date to the end of the selected day (23:59:59)
            const end = new Date(customDateEnd);
            end.setHours(23, 59, 59, 999);

            result = result.filter((report) => {
              const reportDate = new Date(report.createdAt);
              return reportDate >= start && reportDate <= end;
            });
          }
          return; // Skip the default date filtering below
      }

      result = result.filter((report) => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= startDate;
      });
    }

    setFilteredReports(result);
  }, [reports, statusFilter, dateRangeFilter, customDateStart, customDateEnd]);

  // Get reports for rendering - either filtered or all
  const getDisplayReports = () => {
    return filteredReports.length > 0 ||
      statusFilter !== "all" ||
      dateRangeFilter !== "all"
      ? filteredReports
      : reports;
  };

  // Set default dates for custom filter when opening the dialog
  useEffect(() => {
    if (isCustomDateDialogOpen && (!customDateStart || !customDateEnd)) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setCustomDateStart(thirtyDaysAgo.toISOString().split("T")[0]);
      setCustomDateEnd(today.toISOString().split("T")[0]);
    }
  }, [isCustomDateDialogOpen, customDateStart, customDateEnd]);

  // Función para cargar plantillas de correo
  const fetchEmailTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await fetch("/api/drive/email-templates");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al cargar plantillas");
      }

      const data = await response.json();
      setEmailTemplates(data.templates || []);

      // Si hay plantillas y hay una por defecto, seleccionarla
      const defaultTemplate = data.templates.find(
        (t: EmailTemplate) => t.isDefault
      );
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate.id);
        setCustomEmailSubject(defaultTemplate.subject);
        setCustomEmailContent(defaultTemplate.content);
      } else if (data.templates.length > 0) {
        setSelectedTemplate(data.templates[0].id);
        setCustomEmailSubject(data.templates[0].subject);
        setCustomEmailContent(data.templates[0].content);
      }
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
      toast({
        title: "Error al cargar plantillas",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "error",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Función para cambiar la plantilla seleccionada
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);

    if (templateId === "custom") {
      // Si es personalizado, dejar campos vacíos o con valores por defecto
      setCustomEmailSubject("Resolución de problema reportado");
      setCustomEmailContent(
        "Estimado cliente,\n\nConsideramos que hemos resuelto el problema reportado. Si sigue teniendo problemas, no dude en responder a este correo.\n\nSaludos cordiales,\nEquipo de soporte"
      );
      return;
    }

    const template = emailTemplates.find((t) => t.id === templateId);
    if (template) {
      setCustomEmailSubject(template.subject);
      setCustomEmailContent(template.content);
    }
  };

  // Función para enviar correo de resolución
  const sendResolutionEmail = async () => {
    if (!selectedReport) return;

    try {
      setIsSendingEmail(true);

      // Determinar los destinatarios (email del cliente que reportó)
      const recipients = [selectedReport.email];

      // Obtener emails de usuarios asignados para CC
      const assignedUserEmails: string[] = [];
      if (selectedReport.assignedTo && selectedReport.assignedTo.length > 0) {
        selectedReport.assignedTo.forEach((userId) => {
          const user = users.find((u) => u.id === userId);
          if (user && user.email) {
            assignedUserEmails.push(user.email);
          }
        });
      }

      // Preparar contenido personalizado
      let emailContent = customEmailContent;

      // Reemplazar variables en el contenido
      emailContent = emailContent
        .replace(/\{nombreCliente\}/g, selectedReport.fullName)
        .replace(/\{nombreArchivo\}/g, selectedReport.fileName)
        .replace(
          /\{fechaReporte\}/g,
          new Date(selectedReport.createdAt).toLocaleDateString()
        )
        .replace(
          /\{correoAsignado\}/g,
          assignedUserEmails.join(", ") || "soporte@example.com"
        );

      const response = await fetch(
        `/api/drive/error-report/${selectedReport.id}/resolution-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipients,
            cc: assignedUserEmails,
            subject: customEmailSubject,
            content: emailContent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar correo");
      }

      // Cerrar modal
      setIsEmailModalOpen(false);

      // Mostrar toast de éxito
      toast({
        title: "Correo enviado",
        description: "El correo de resolución se envió correctamente.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error al enviar correo:", error);
      toast({
        title: "Error al enviar correo",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "error",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Editar un reporte
  const handleEditReport = (report: ErrorReport) => {
    setSelectedReport(report);

    // Establecer valores iniciales
    setSelectedStatus(report.status);
    setResolvedDate(report.resolvedAt || "");
    setSelectedCategory(report.category || "none");
    setSelectedUsers(report.assignedTo || []);
    setNewNote(report.notes || "");

    setIsReportDialogOpen(true);
  };

  // Cargar datos necesarios cuando se abre el diálogo de reporte
  useEffect(() => {
    if (isReportDialogOpen) {
      // Cargar categorías si no están cargadas
      if (categories.length === 0) {
        fetchCategories();
      }

      // Cargar usuarios si no están cargados
      if (users.length === 0) {
        fetchUsers();
      }
    }
  }, [isReportDialogOpen, categories.length, users.length]);

  // Cargar plantillas de correo cuando se abre el modal de correo
  useEffect(() => {
    if (isEmailModalOpen) {
      fetchEmailTemplates();
    }
  }, [isEmailModalOpen]);

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
      <Toaster />
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
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Reportes
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            Recordatorios
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
            <>
              {/* Bulk actions toolbar - appears when items are selected */}
              {selectedReportIds.length > 0 && (
                <div className="bg-blue-50 p-2 mb-4 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2 text-blue-700 font-medium">
                      {selectedReportIds.length}{" "}
                      {selectedReportIds.length === 1
                        ? "elemento seleccionado"
                        : "elementos seleccionados"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={massActionType || ""}
                      onValueChange={(value) => {
                        setMassActionType(value);
                        if (value) {
                          setIsMassActionDialogOpen(true);
                        }
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Acciones masivas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="update-status">
                          Cambiar estado
                        </SelectItem>
                        <SelectItem value="assign-category">
                          Asignar categoría
                        </SelectItem>
                        <SelectItem value="assign-users">
                          Asignar usuarios
                        </SelectItem>
                        <SelectItem value="delete">Eliminar</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedReportIds([])}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpiar selección
                    </Button>
                  </div>
                </div>
              )}

              {/* Filters section */}
              <div className="mb-4 flex flex-wrap gap-3 items-center border-b pb-4">
                {/* Status filter */}
                <div className="mt-1">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                          <span>Pendientes</span>
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

                {/* Date filter */}
                <div className="mt-1">
                  <Select
                    value={dateRangeFilter}
                    onValueChange={(value) => {
                      setDateRangeFilter(value);
                      if (value === "custom") {
                        setIsCustomDateDialogOpen(true);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo el tiempo</SelectItem>
                      <SelectItem value="7days">Últimos 7 días</SelectItem>
                      <SelectItem value="30days">Últimos 30 días</SelectItem>
                      <SelectItem value="3months">Últimos 3 meses</SelectItem>
                      <SelectItem value="6months">Últimos 6 meses</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Display selected custom date range if active */}
                {dateRangeFilter === "custom" &&
                  customDateStart &&
                  customDateEnd && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(customDateStart).toLocaleDateString()} -{" "}
                        {new Date(customDateEnd).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsCustomDateDialogOpen(true)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                {/* Filter counts */}
                <div className="ml-auto text-sm text-gray-500">
                  {getDisplayReports().length} de {reports.length} reportes
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedReportIds.length ===
                                getDisplayReports().length &&
                              getDisplayReports().length > 0
                            }
                            onChange={toggleAllReports}
                            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                          />
                        </div>
                      </TableHead>
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
                    {getDisplayReports().map((report) => (
                      <TableRow key={report.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedReportIds.includes(report.id)}
                              onChange={() => toggleReportSelection(report.id)}
                              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                            />
                          </div>
                        </TableCell>
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
                                  const user = users.find(
                                    (u) => u.id === userId
                                  );
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
                                      .find(
                                        (u) => u.id === report.assignedTo![0]
                                      )
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
                                      handleEditReport(report);
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
                                    onClick={() =>
                                      sendImmediateReminder(report)
                                    }
                                    disabled={
                                      isUpdating || report.status === "resolved"
                                    }
                                  >
                                    <BellRing className="h-4 w-4 text-blue-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Enviar recordatorio inmediato</p>
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

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedReport(report);
                                      setIsEmailModalOpen(true);
                                    }}
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Enviar correo de resolución</p>
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
            </>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryManager onCategoryChange={handleCategoryChange} />
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <ReminderManager onReminderChange={fetchReports} />
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
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="datetime-local"
                        value={resolvedDate}
                        onChange={(e) => setResolvedDate(e.target.value)}
                        className="w-full pr-10"
                        placeholder="Seleccionar fecha y hora de resolución"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={setCurrentDateTime}
                          >
                            <Clock3 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Usar fecha y hora actuales</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

      {/* Mass action dialog */}
      <Dialog
        open={isMassActionDialogOpen}
        onOpenChange={setIsMassActionDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {massActionType === "delete" && "Eliminar reportes"}
              {massActionType === "update-status" && "Cambiar estado"}
              {massActionType === "assign-category" && "Asignar categoría"}
              {massActionType === "assign-users" && "Asignar usuarios"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <p className="mb-4">
              {selectedReportIds.length}{" "}
              {selectedReportIds.length === 1
                ? "elemento seleccionado"
                : "elementos seleccionados"}
            </p>

            {massActionType === "delete" && (
              <div>
                <p className="text-destructive font-medium">
                  ¿Está seguro que desea eliminar todos los reportes
                  seleccionados?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            )}

            {massActionType === "update-status" && (
              <div>
                <Label>Nuevo estado</Label>
                <div className="mt-1">
                  <Select
                    value={selectedMassStatus}
                    onValueChange={setSelectedMassStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {selectedMassStatus === "pending" && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                            <span>Pendiente</span>
                          </div>
                        )}
                        {selectedMassStatus === "in-progress" && (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 text-blue-500" />
                            <span>En progreso</span>
                          </div>
                        )}
                        {selectedMassStatus === "resolved" && (
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
                {selectedMassStatus === "resolved" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Se establecerá la fecha de resolución automáticamente.
                  </p>
                )}
              </div>
            )}

            {massActionType === "assign-category" && (
              <div>
                <Label>Categoría</Label>
                <div className="mt-1">
                  <Select
                    value={selectedMassCategory}
                    onValueChange={setSelectedMassCategory}
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
            )}

            {massActionType === "assign-users" && (
              <div>
                <Label>Asignar a usuarios</Label>
                <div className="mt-1">
                  <UserChipSelect
                    users={users}
                    selectedIds={selectedMassUsers}
                    onChange={setSelectedMassUsers}
                    placeholder="Buscar y seleccionar usuarios..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Los usuarios seleccionados serán asignados a todos los
                  reportes seleccionados.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant={massActionType === "delete" ? "destructive" : "default"}
              className="w-full sm:w-auto"
              onClick={executeMassAction}
              disabled={isMassActionLoading}
            >
              {isMassActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : massActionType === "delete" ? (
                <Trash2 className="h-4 w-4 mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {massActionType === "delete"
                ? "Eliminar"
                : massActionType === "update-status"
                ? "Actualizar estado"
                : massActionType === "assign-category"
                ? "Asignar categoría"
                : "Asignar usuarios"}
            </Button>

            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsMassActionDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom date range dialog */}
      <Dialog
        open={isCustomDateDialogOpen}
        onOpenChange={setIsCustomDateDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar rango de fechas</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div>
              <Label htmlFor="start-date">Fecha de inicio</Label>
              <Input
                id="start-date"
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end-date">Fecha de fin</Label>
              <Input
                id="end-date"
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => {
                if (customDateStart && customDateEnd) {
                  setIsCustomDateDialogOpen(false);
                } else {
                  alert("Por favor seleccione fechas de inicio y fin válidas");
                }
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Aplicar filtro
            </Button>

            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsCustomDateDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de envío de correo de resolución */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Enviar correo de resolución</DialogTitle>
            <DialogDescription>
              Envía un correo al cliente para informarle que su problema ha sido
              resuelto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {selectedReport && (
              <div className="bg-slate-100 p-3 rounded-md mb-4">
                <p className="font-medium">{selectedReport.fileName}</p>
                <p className="text-sm">
                  Reportado por: {selectedReport.fullName}
                </p>
                <p className="text-sm">Correo: {selectedReport.email}</p>
                <div className="flex items-center mt-1">
                  {renderStatusBadge(selectedReport.status)}
                  {renderCategoryBadge(selectedReport)}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="template" className="text-sm font-medium">
                Plantilla
              </Label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
                disabled={loadingTemplates}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                      {template.isDefault && " (Predeterminada)"}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject" className="text-sm font-medium">
                Asunto
              </Label>
              <Input
                id="subject"
                value={customEmailSubject}
                onChange={(e) => setCustomEmailSubject(e.target.value)}
                placeholder="Asunto del correo"
                className="w-full bg-white"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium">
                Contenido
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="ml-2 cursor-help">
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Puedes usar las siguientes variables:
                        <br />
                        {"{nombreCliente}"} - Nombre del cliente
                        <br />
                        {"{nombreArchivo}"} - Nombre del archivo
                        <br />
                        {"{fechaReporte}"} - Fecha del reporte
                        <br />
                        {"{correoAsignado}"} - Correo del usuario asignado
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <textarea
                id="content"
                value={customEmailContent}
                onChange={(e) => setCustomEmailContent(e.target.value)}
                rows={10}
                className="w-full border rounded-md p-2 bg-white"
                placeholder="Contenido del correo"
              ></textarea>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="default"
              onClick={sendResolutionEmail}
              disabled={isSendingEmail}
              className="w-full sm:w-auto"
            >
              {isSendingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar correo
            </Button>

            <Button
              variant="secondary"
              onClick={() => setIsEmailModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
