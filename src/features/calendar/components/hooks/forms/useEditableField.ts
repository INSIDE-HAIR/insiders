/**
 * useEditableField - Form Hook
 * 
 * Hook para gestionar campos editables inline
 * Extraído de la lógica existente en EditableAttendees, EditableDateTime, etc.
 * Centraliza el manejo de estados de edición y validación
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "@/src/components/ui/use-toast";

interface UseEditableFieldOptions<T> {
  initialValue: T;
  onSave?: (value: T, originalValue: T) => Promise<void>;
  onCancel?: () => void;
  validator?: (value: T) => string | null;
  autoSave?: boolean;
  saveDelay?: number;
}

interface UseEditableFieldReturn<T> {
  value: T;
  originalValue: T;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean;
  
  // Actions
  startEditing: () => void;
  stopEditing: () => void;
  setValue: (value: T) => void;
  save: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export const useEditableField = <T>(
  options: UseEditableFieldOptions<T>
): UseEditableFieldReturn<T> => {
  const {
    initialValue,
    onSave,
    onCancel,
    validator,
    autoSave = false,
    saveDelay = 1000,
  } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [originalValue, setOriginalValue] = useState<T>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Determinar si hay cambios
  const hasChanges = JSON.stringify(value) !== JSON.stringify(originalValue);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save cuando hay cambios (si está habilitado)
  useEffect(() => {
    if (!autoSave || !hasChanges || !isEditing) return;

    // Limpiar timeout anterior
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Crear nuevo timeout
    autoSaveTimeoutRef.current = setTimeout(async () => {
      await save();
    }, saveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [value, hasChanges, isEditing, autoSave, saveDelay]);

  // Actualizar valores cuando cambie el inicial
  useEffect(() => {
    if (!isEditing) {
      setValue(initialValue);
      setOriginalValue(initialValue);
    }
  }, [initialValue, isEditing]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setError(null);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    setError(null);
    
    // Limpiar auto-save timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, []);

  const handleSetValue = useCallback((newValue: T) => {
    setValue(newValue);
    setError(null);
  }, []);

  const save = useCallback(async () => {
    if (!hasChanges || isLoading) return;

    // Validar valor antes de guardar
    if (validator) {
      const validationError = validator(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (!onSave) {
      // Si no hay función de guardado, solo actualizar estado local
      setOriginalValue(value);
      stopEditing();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(value, originalValue);
      setOriginalValue(value);
      stopEditing();
      
      toast({
        title: "Guardado",
        description: "Los cambios se han guardado correctamente",
        duration: 2000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [value, originalValue, hasChanges, isLoading, validator, onSave, stopEditing]);

  const cancel = useCallback(() => {
    setValue(originalValue);
    setError(null);
    stopEditing();
    onCancel?.();
  }, [originalValue, stopEditing, onCancel]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setOriginalValue(initialValue);
    setError(null);
    stopEditing();
  }, [initialValue, stopEditing]);

  return {
    value,
    originalValue,
    isEditing,
    isLoading,
    error,
    hasChanges,
    startEditing,
    stopEditing,
    setValue: handleSetValue,
    save,
    cancel,
    reset,
  };
};

// Hook especializado para arrays (como participantes)
export const useEditableArray = <T>(
  options: Omit<UseEditableFieldOptions<T[]>, 'validator'> & {
    validator?: (value: T[]) => string | null;
    itemValidator?: (item: T) => boolean;
  }
) => {
  const { itemValidator, ...baseOptions } = options;
  
  const baseHook = useEditableField(baseOptions);
  
  const addItem = useCallback((item: T) => {
    if (itemValidator && !itemValidator(item)) {
      return false;
    }
    
    baseHook.setValue([...baseHook.value, item]);
    return true;
  }, [baseHook, itemValidator]);
  
  const removeItem = useCallback((index: number) => {
    const newArray = [...baseHook.value];
    newArray.splice(index, 1);
    baseHook.setValue(newArray);
  }, [baseHook]);
  
  const updateItem = useCallback((index: number, newItem: T) => {
    if (itemValidator && !itemValidator(newItem)) {
      return false;
    }
    
    const newArray = [...baseHook.value];
    newArray[index] = newItem;
    baseHook.setValue(newArray);
    return true;
  }, [baseHook, itemValidator]);
  
  return {
    ...baseHook,
    addItem,
    removeItem,
    updateItem,
  };
};