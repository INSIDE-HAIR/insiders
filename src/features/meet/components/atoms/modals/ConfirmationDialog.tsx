/**
 * ConfirmationDialog - Minimal implementation post-cleanup
 * Recreated as a minimal working component after mass cleanup
 */

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

export type ConfirmationType = "confirm" | "delete" | "warning" | "info";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: ConfirmationType;
  title?: string;
  message?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type = "confirm",
  title = "Confirmar acción",
  message,
  description,
  itemName,
  confirmText = "Confirmar",
  cancelText = "Cancelar", 
  variant = "default",
  loading = false,
}) => {
  // Use description if provided, fallback to message, or default
  const content = description || message || "¿Estás seguro de que deseas continuar?";
  
  // Auto-detect variant based on type
  const finalVariant = type === "delete" ? "destructive" : variant;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">{content}</p>
          {itemName && (
            <p className="text-sm font-medium mt-2">"{itemName}"</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            variant={finalVariant === "destructive" ? "destructive" : "default"} 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

ConfirmationDialog.displayName = "ConfirmationDialog";