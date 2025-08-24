/**
 * CONFIRMATIONDIALOG - Modal atómico de confirmación
 * Componente reutilizable para confirmaciones destructivas y no destructivas
 * Sigue patrones de shadcn/ui con atomic design
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { cn } from "@/src/lib/utils";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export type ConfirmationType = 
  | "delete"      // Destructivo - eliminar permanente
  | "remove"      // Destructivo - remover/quitar
  | "duplicate"   // No destructivo - duplicar
  | "save"        // No destructivo - guardar cambios
  | "confirm"     // No destructivo - confirmar acción
  | "warning";    // Advertencia - acción con consecuencias

export interface ConfirmationDialogProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Función que se ejecuta al confirmar */
  onConfirm: () => void;
  /** Tipo de confirmación que define estilos y comportamiento */
  type: ConfirmationType;
  /** Título del modal */
  title: string;
  /** Descripción o mensaje del modal */
  description: string;
  /** Texto del botón de confirmación (opcional) */
  confirmText?: string;
  /** Texto del botón de cancelación (opcional) */
  cancelText?: string;
  /** Si está en estado de carga */
  loading?: boolean;
  /** Nombre del elemento a confirmar (para contexto) */
  itemName?: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Modal de confirmación atómico siguiendo patrones de shadcn/ui
 * 
 * @example
 * <ConfirmationDialog
 *   isOpen={showDeleteDialog}
 *   onClose={() => setShowDeleteDialog(false)}
 *   onConfirm={handleDelete}
 *   type="delete"
 *   title="Eliminar Sala"
 *   description="Esta acción no se puede deshacer"
 *   itemName="Reunión de Equipo"
 * />
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  description,
  confirmText,
  cancelText = "Cancelar",
  loading = false,
  itemName,
  className,
}) => {
  // No renderizar si el modal no está abierto para evitar errores de inicialización
  if (!isOpen) {
    return null;
  }
  // Configuración por tipo de confirmación
  const typeConfig = {
    delete: {
      icon: <TrashIcon className="h-5 w-5 text-red-600" />,
      iconBg: "bg-red-100",
      confirmVariant: "destructive" as const,
      defaultConfirmText: "Eliminar",
      defaultTitle: "Eliminar elemento"
    },
    remove: {
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />,
      iconBg: "bg-orange-100", 
      confirmVariant: "destructive" as const,
      defaultConfirmText: "Remover",
      defaultTitle: "Remover elemento"
    },
    duplicate: {
      icon: <DocumentDuplicateIcon className="h-5 w-5 text-blue-600" />,
      iconBg: "bg-blue-100",
      confirmVariant: "default" as const,
      defaultConfirmText: "Duplicar", 
      defaultTitle: "Duplicar elemento"
    },
    save: {
      icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
      iconBg: "bg-green-100",
      confirmVariant: "default" as const,
      defaultConfirmText: "Guardar",
      defaultTitle: "Guardar cambios"
    },
    confirm: {
      icon: <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600" />,
      iconBg: "bg-blue-100",
      confirmVariant: "default" as const,
      defaultConfirmText: "Confirmar",
      defaultTitle: "Confirmar acción"
    },
    warning: {
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />,
      iconBg: "bg-yellow-100",
      confirmVariant: "default" as const,
      defaultConfirmText: "Continuar",
      defaultTitle: "Advertencia"
    }
  };

  const config = typeConfig[type];
  
  // Early return si no hay configuración válida
  if (!config) {
    console.error(`ConfirmationDialog: Invalid type "${type}"`);
    return null;
  }
  
  const finalConfirmText = confirmText || config.defaultConfirmText;

  const handleConfirm = () => {
    onConfirm();
    // No cerramos automáticamente para permitir estados de loading
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={cn("sm:max-w-md", className)}>
        <AlertDialogHeader>
          {/* Icono y título */}
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full", config.iconBg)}>
              {config.icon}
            </div>
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          
          <AlertDialogDescription className="text-left mt-2">
            {description}
            {itemName && (
              <>
                <br />
                <span className="font-medium text-foreground mt-1 block">
                  "{itemName}"
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              config.confirmVariant === "destructive" && "bg-red-600 hover:bg-red-700 focus:ring-red-600",
              "min-w-[100px]"
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                {type === "delete" ? "Eliminando..." : 
                 type === "duplicate" ? "Duplicando..." :
                 type === "remove" ? "Removiendo..." :
                 "Procesando..."}
              </div>
            ) : (
              finalConfirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};