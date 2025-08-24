/**
 * USECONFIRMATION - Hook para manejar diálogos de confirmación
 * Proporciona interfaz consistente para confirmaciones en toda la app
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import { useState, useCallback } from "react";
import type { ConfirmationType } from "../components/atoms/modals/ConfirmationDialog";

export interface ConfirmationConfig {
  type: ConfirmationType;
  title: string;
  description: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmationState {
  isOpen: boolean;
  loading: boolean;
  config: ConfirmationConfig | null;
}

/**
 * Hook para manejar estados de confirmación de manera consistente
 * 
 * @example
 * const { showConfirmation, confirmationProps, confirm, cancel } = useConfirmation();
 * 
 * const handleDelete = () => {
 *   showConfirmation({
 *     type: "delete",
 *     title: "Eliminar Sala",
 *     description: "Esta acción no se puede deshacer",
 *     itemName: roomName
 *   }, async () => {
 *     await deleteRoom();
 *   });
 * };
 */
export const useConfirmation = () => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    loading: false,
    config: null,
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void | Promise<void>) | null>(null);

  // Mostrar diálogo de confirmación
  const showConfirmation = useCallback((config: ConfirmationConfig, onConfirm: () => void | Promise<void>) => {
    setState({
      isOpen: true,
      loading: false,
      config,
    });
    setOnConfirmCallback(() => onConfirm);
  }, []);

  // Confirmar acción
  const confirm = useCallback(async () => {
    if (!onConfirmCallback) return;
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await onConfirmCallback();
      
      // Cerrar el diálogo después de completar la acción
      setState({
        isOpen: false,
        loading: false,
        config: null,
      });
      setOnConfirmCallback(null);
    } catch (error) {
      // En caso de error, mantener el diálogo abierto pero quitar loading
      setState(prev => ({ ...prev, loading: false }));
      throw error; // Re-throw para que el componente padre pueda manejar el error
    }
  }, [onConfirmCallback]);

  // Cancelar acción
  const cancel = useCallback(() => {
    setState({
      isOpen: false,
      loading: false,
      config: null,
    });
    setOnConfirmCallback(null);
  }, []);

  // Props para el componente ConfirmationDialog
  const confirmationProps = {
    isOpen: state.isOpen,
    loading: state.loading,
    onClose: cancel,
    onConfirm: confirm,
    // Proporcionar valores por defecto para evitar errores
    type: (state.config?.type || "confirm") as ConfirmationType,
    title: state.config?.title || "",
    description: state.config?.description || "",
    itemName: state.config?.itemName,
    confirmText: state.config?.confirmText,
    cancelText: state.config?.cancelText,
  };

  return {
    // Estado
    isOpen: state.isOpen,
    loading: state.loading,
    config: state.config,
    
    // Métodos
    showConfirmation,
    confirm,
    cancel,
    
    // Props para el componente
    confirmationProps,
  };
};