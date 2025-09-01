/**
 * useModalState - UI Hook
 * 
 * Hook para gestionar estado de modales
 * Extraído de la lógica existente en diversos modales de calendar
 * Centraliza apertura/cierre y datos de contexto de modales
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface ModalConfig<T = any> {
  isOpen: boolean;
  data?: T;
  context?: Record<string, any>;
}

interface UseModalStateOptions {
  onOpen?: () => void;
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
  retainDataOnClose?: boolean;
}

interface UseModalStateReturn<T = any> {
  isOpen: boolean;
  data: T | undefined;
  context: Record<string, any>;
  
  // Actions
  open: (data?: T, context?: Record<string, any>) => void;
  close: () => void;
  toggle: (data?: T, context?: Record<string, any>) => void;
  updateData: (data: Partial<T>) => void;
  updateContext: (context: Record<string, any>) => void;
  
  // Utils
  setData: (data: T | undefined) => void;
  clearData: () => void;
}

export const useModalState = <T = any>(
  options: UseModalStateOptions = {}
): UseModalStateReturn<T> => {
  const {
    onOpen,
    onClose,
    closeOnEscape = true,
    closeOnClickOutside = false,
    retainDataOnClose = false,
  } = options;

  const [config, setConfig] = useState<ModalConfig<T>>({
    isOpen: false,
    data: undefined,
    context: {},
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Manejar tecla ESC
  useEffect(() => {
    if (!closeOnEscape || !config.isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, config.isOpen]);

  // Manejar click fuera del modal
  useEffect(() => {
    if (!closeOnClickOutside || !config.isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnClickOutside, config.isOpen]);

  const open = useCallback((data?: T, context?: Record<string, any>) => {
    setConfig({
      isOpen: true,
      data,
      context: context || {},
    });
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setConfig(prev => ({
      isOpen: false,
      data: retainDataOnClose ? prev.data : undefined,
      context: retainDataOnClose ? prev.context : {},
    }));
    onClose?.();
  }, [onClose, retainDataOnClose]);

  const toggle = useCallback((data?: T, context?: Record<string, any>) => {
    if (config.isOpen) {
      close();
    } else {
      open(data, context);
    }
  }, [config.isOpen, open, close]);

  const updateData = useCallback((newData: Partial<T>) => {
    setConfig(prev => ({
      ...prev,
      data: prev.data ? { ...prev.data, ...newData } : newData as T,
    }));
  }, []);

  const updateContext = useCallback((newContext: Record<string, any>) => {
    setConfig(prev => ({
      ...prev,
      context: { ...prev.context, ...newContext },
    }));
  }, []);

  const setData = useCallback((data: T | undefined) => {
    setConfig(prev => ({
      ...prev,
      data,
    }));
  }, []);

  const clearData = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      data: undefined,
      context: {},
    }));
  }, []);

  return {
    isOpen: config.isOpen,
    data: config.data,
    context: config.context || {},
    open,
    close,
    toggle,
    updateData,
    updateContext,
    setData,
    clearData,
  };
};

// Hook especializado para modales de eventos
export const useEventModalState = () => {
  const base = useModalState<GoogleCalendarEvent>();
  
  const openForEvent = useCallback((event: GoogleCalendarEvent, mode: 'view' | 'edit' = 'view') => {
    base.open(event, { mode });
  }, [base]);
  
  const switchToEdit = useCallback(() => {
    base.updateContext({ mode: 'edit' });
  }, [base]);
  
  const switchToView = useCallback(() => {
    base.updateContext({ mode: 'view' });
  }, [base]);
  
  const isEditMode = base.context.mode === 'edit';
  const isViewMode = base.context.mode === 'view';
  
  return {
    ...base,
    openForEvent,
    switchToEdit,
    switchToView,
    isEditMode,
    isViewMode,
  };
};

// Hook especializado para modales bulk
export const useBulkModalState = () => {
  const base = useModalState<{
    events: GoogleCalendarEvent[];
    action: string;
    parameters?: Record<string, any>;
  }>();
  
  const openForBulkAction = useCallback((
    events: GoogleCalendarEvent[],
    action: string,
    parameters?: Record<string, any>
  ) => {
    base.open({ events, action, parameters });
  }, [base]);
  
  const updateParameters = useCallback((parameters: Record<string, any>) => {
    base.updateData({ parameters });
  }, [base]);
  
  const getSelectedEvents = useCallback(() => {
    return base.data?.events || [];
  }, [base.data]);
  
  const getBulkAction = useCallback(() => {
    return base.data?.action || '';
  }, [base.data]);
  
  const getParameters = useCallback(() => {
    return base.data?.parameters || {};
  }, [base.data]);
  
  return {
    ...base,
    openForBulkAction,
    updateParameters,
    getSelectedEvents,
    getBulkAction,
    getParameters,
  };
};

// Hook para múltiples modales gestionados
export const useMultiModalState = <TModals extends Record<string, any>>() => {
  const [modals, setModals] = useState<Record<keyof TModals, ModalConfig<any>>>(() => {
    return {} as Record<keyof TModals, ModalConfig<any>>;
  });

  const openModal = useCallback(<K extends keyof TModals>(
    modalName: K,
    data?: TModals[K],
    context?: Record<string, any>
  ) => {
    setModals(prev => ({
      ...prev,
      [modalName]: {
        isOpen: true,
        data,
        context: context || {},
      },
    }));
  }, []);

  const closeModal = useCallback(<K extends keyof TModals>(modalName: K) => {
    setModals(prev => ({
      ...prev,
      [modalName]: {
        isOpen: false,
        data: undefined,
        context: {},
      },
    }));
  }, []);

  const toggleModal = useCallback(<K extends keyof TModals>(
    modalName: K,
    data?: TModals[K],
    context?: Record<string, any>
  ) => {
    const modal = modals[modalName];
    if (modal?.isOpen) {
      closeModal(modalName);
    } else {
      openModal(modalName, data, context);
    }
  }, [modals, openModal, closeModal]);

  const isModalOpen = useCallback(<K extends keyof TModals>(modalName: K) => {
    return modals[modalName]?.isOpen || false;
  }, [modals]);

  const getModalData = useCallback(<K extends keyof TModals>(modalName: K) => {
    return modals[modalName]?.data;
  }, [modals]);

  const getModalContext = useCallback(<K extends keyof TModals>(modalName: K) => {
    return modals[modalName]?.context || {};
  }, [modals]);

  const closeAllModals = useCallback(() => {
    setModals({} as Record<keyof TModals, ModalConfig<any>>);
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    getModalData,
    getModalContext,
    closeAllModals,
  };
};