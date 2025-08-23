import React from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowRightIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  PlayIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";

export type ActionType = 
  | "remove"     // X - Para desasignar, quitar, cerrar
  | "add"        // + - Para agregar, asignar
  | "delete"     // Trash - Para eliminar permanente  
  | "edit"       // Pencil - Para editar
  | "view"       // Eye - Para ver detalles
  | "next"       // Arrow right - Para siguiente
  | "expand"     // Chevron down - Para expandir
  | "collapse"   // Chevron up - Para colapsar
  | "refresh"    // Refresh - Para recargar
  | "play"       // Play - Para reproducir
  | "download"   // Download - Para descargar
  | "viewComplete" // Document - Ver completa
  | "export"     // Sparkles - Exportar
  | "pdf"        // PDF text - Descargar PDF
  | "external";  // External link - Abrir en nueva ventana

export type ActionSize = "xs" | "sm" | "default" | "lg";

export interface ActionButtonProps {
  action: ActionType;
  size?: ActionSize;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  className?: string;
  tooltip?: string; // Para accessibility
  ariaLabel?: string;
}

/**
 * Botón atómico para acciones comunes (remove, add, delete, etc.)
 * Tamaños optimizados y consistentes con iconos apropiados
 * 
 * @example
 * <ActionButton action="remove" size="xs" onClick={() => removeItem()} />
 * <ActionButton action="add" variant="outline" onClick={() => addItem()} />
 * <ActionButton action="delete" variant="destructive" onClick={() => deleteItem()} />
 * <ActionButton action="refresh" loading={isRefreshing} onClick={() => refresh()} />
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  size = "sm",
  variant = "ghost",
  disabled = false,
  loading = false,
  onClick,
  className,
  tooltip,
  ariaLabel
}) => {
  // Configuración de iconos por acción
  const actionConfig = {
    remove: {
      icon: <XMarkIcon className="h-3 w-3" />,
      defaultAriaLabel: "Remover elemento",
      hoverColor: "hover:bg-red-100 hover:text-red-700"
    },
    add: {
      icon: <PlusIcon className="h-4 w-4" />,
      defaultAriaLabel: "Agregar elemento", 
      hoverColor: "hover:bg-green-100 hover:text-green-700"
    },
    delete: {
      icon: <TrashIcon className="h-4 w-4" />,
      defaultAriaLabel: "Eliminar elemento",
      hoverColor: "hover:bg-red-100 hover:text-red-700"
    },
    edit: {
      icon: <PencilIcon className="h-4 w-4" />,
      defaultAriaLabel: "Editar elemento",
      hoverColor: "hover:bg-blue-100 hover:text-blue-700"
    },
    view: {
      icon: <EyeIcon className="h-4 w-4" />,
      defaultAriaLabel: "Ver detalles",
      hoverColor: "hover:bg-gray-100 hover:text-gray-700"
    },
    next: {
      icon: <ArrowRightIcon className="h-4 w-4" />,
      defaultAriaLabel: "Siguiente",
      hoverColor: "hover:bg-blue-100 hover:text-blue-700"
    },
    expand: {
      icon: <ChevronDownIcon className="h-4 w-4" />,
      defaultAriaLabel: "Expandir",
      hoverColor: "hover:bg-gray-100 hover:text-gray-700"
    },
    collapse: {
      icon: <ChevronUpIcon className="h-4 w-4" />,
      defaultAriaLabel: "Colapsar", 
      hoverColor: "hover:bg-gray-100 hover:text-gray-700"
    },
    refresh: {
      icon: <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />,
      defaultAriaLabel: "Refrescar",
      hoverColor: "hover:bg-blue-100 hover:text-blue-700"
    },
    play: {
      icon: <PlayIcon className="h-4 w-4" />,
      defaultAriaLabel: "Reproducir",
      hoverColor: "hover:bg-green-100 hover:text-green-700"
    },
    download: {
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      defaultAriaLabel: "Descargar",
      hoverColor: "hover:bg-blue-100 hover:text-blue-700"
    },
    viewComplete: {
      icon: <DocumentTextIcon className="h-4 w-4 mr-1" />,
      defaultAriaLabel: "Ver completa",
      hoverColor: "hover:bg-gray-100 hover:text-gray-700"
    },
    export: {
      icon: <SparklesIcon className="h-4 w-4 mr-1" />,
      defaultAriaLabel: "Exportar",
      hoverColor: "hover:bg-purple-100 hover:text-purple-700"
    },
    pdf: {
      icon: null, // Solo texto
      defaultAriaLabel: "Descargar PDF",
      hoverColor: "hover:bg-red-100 hover:text-red-700"
    },
    external: {
      icon: <ArrowTopRightOnSquareIcon className="h-4 w-4" />,
      defaultAriaLabel: "Abrir en nueva ventana",
      hoverColor: "hover:bg-blue-100 hover:text-blue-700"
    }
  };

  const config = actionConfig[action];

  // Tamaños optimizados para diferentes acciones
  const sizeClasses = {
    xs: "h-4 w-4 p-0", // Para botones X muy pequeños
    sm: "h-6 w-6 p-0", // Para botones de acción estándar
    default: "h-8 w-8", // Para botones normales
    lg: "h-10 w-10"    // Para botones grandes
  };

  // Determinar variant por defecto según la acción
  const getDefaultVariant = () => {
    if (action === "delete") return "destructive";
    if (action === "remove") return "ghost";
    return variant;
  };

  const finalVariant = variant === "ghost" && (action === "delete") ? "destructive" : getDefaultVariant();
  const finalAriaLabel = ariaLabel || config.defaultAriaLabel;

  return (
    <Button
      variant={finalVariant}
      size="sm"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        "cursor-pointer transition-colors flex-shrink-0",
        !disabled && !loading && config.hoverColor,
        // Estilo especial para botones destructivos pequeños
        (action === "remove" || action === "delete") && size === "xs" && 
          "hover:bg-red-50 hover:text-red-600 hover:border-red-200",
        className
      )}
      title={tooltip}
      aria-label={finalAriaLabel}
    >
      {config.icon}
      {action === "viewComplete" && "Ver completa"}
      {action === "export" && "Exportar"} 
      {action === "pdf" && "PDF"}
    </Button>
  );
};