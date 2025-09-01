/**
 * useCalendarSync - Integration Hook
 * 
 * Hook para gestionar sincronización con Google Calendar
 * Extraído de la lógica existente de integración con APIs
 * Centraliza operaciones de sincronización y polling de cambios
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { toast } from "@/src/components/ui/use-toast";

interface CalendarSyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  pendingChanges: number;
  syncError: string | null;
}

interface UseCalendarSyncOptions {
  calendarIds: string[];
  autoSync?: boolean;
  syncInterval?: number; // en milisegundos
  retryAttempts?: number;
  retryDelay?: number;
  onSyncSuccess?: (events: GoogleCalendarEvent[]) => void;
  onSyncError?: (error: string) => void;
}

interface UseCalendarSyncReturn {
  status: CalendarSyncStatus;
  
  // Actions
  sync: () => Promise<void>;
  forceSync: () => Promise<void>;
  stopSync: () => void;
  startAutoSync: () => void;
  
  // Offline/Online handling
  syncWhenOnline: () => void;
  clearPendingChanges: () => void;
  
  // Utils
  canSync: boolean;
  nextSyncIn: number; // segundos hasta próxima sync
}

export const useCalendarSync = (
  options: UseCalendarSyncOptions
): UseCalendarSyncReturn => {
  const {
    calendarIds,
    autoSync = true,
    syncInterval = 30000, // 30 segundos
    retryAttempts = 3,
    retryDelay = 5000, // 5 segundos
    onSyncSuccess,
    onSyncError,
  } = options;

  const [status, setStatus] = useState<CalendarSyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSync: null,
    isSyncing: false,
    pendingChanges: 0,
    syncError: null,
  });

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [nextSyncTime, setNextSyncTime] = useState<Date | null>(null);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Monitorear estado de conexión
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true, syncError: null }));
      if (autoSync) {
        sync();
      }
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
      stopSync();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync]);

  // Auto-sync
  useEffect(() => {
    if (!autoSync || !status.isOnline || calendarIds.length === 0) return;

    startAutoSync();
    return stopSync;
  }, [autoSync, status.isOnline, calendarIds, syncInterval]);

  // Función principal de sincronización
  const sync = useCallback(async (attempt = 0): Promise<void> => {
    if (!status.isOnline || calendarIds.length === 0) return;
    
    // Cancelar sincronización anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setStatus(prev => ({
      ...prev,
      isSyncing: true,
      syncError: null,
    }));

    try {
      const queryParams = new URLSearchParams();
      calendarIds.forEach(id => queryParams.append('calendarIds', id));
      
      // Agregar timestamp de última sincronización si existe
      if (status.lastSync) {
        queryParams.append('updatedMin', status.lastSync.toISOString());
      }

      const response = await fetch(`/api/calendar/sync?${queryParams}`, {
        signal: abortControllerRef.current.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Error de sincronización`);
      }

      const data = await response.json();
      const events = data.events || [];

      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        syncError: null,
        pendingChanges: Math.max(0, prev.pendingChanges - events.length),
      }));

      onSyncSuccess?.(events);

      // Programar próxima sincronización
      if (autoSync && syncInterval > 0) {
        setNextSyncTime(new Date(Date.now() + syncInterval));
      }

    } catch (error: any) {
      if (error.name === 'AbortError') return; // Sincronización cancelada
      
      console.error('Calendar sync error:', error);
      
      const errorMessage = error.message || 'Error de sincronización desconocido';
      
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }));

      onSyncError?.(errorMessage);

      // Reintentar si no hemos alcanzado el máximo de intentos
      if (attempt < retryAttempts) {
        retryTimeoutRef.current = setTimeout(() => {
          sync(attempt + 1);
        }, retryDelay);
      } else {
        toast({
          title: "Error de sincronización",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }, [status.isOnline, status.lastSync, calendarIds, onSyncSuccess, onSyncError, autoSync, syncInterval, retryAttempts, retryDelay]);

  // Sincronización forzada (ignora lastSync)
  const forceSync = useCallback(async () => {
    setStatus(prev => ({ ...prev, lastSync: null }));
    await sync();
  }, [sync]);

  // Detener auto-sync
  const stopSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setNextSyncTime(null);
  }, []);

  // Iniciar auto-sync
  const startAutoSync = useCallback(() => {
    stopSync(); // Limpiar anterior
    
    if (syncInterval <= 0) return;
    
    syncIntervalRef.current = setInterval(() => {
      if (!status.isSyncing && status.isOnline) {
        sync();
      }
    }, syncInterval);
    
    // Sync inicial
    if (!status.isSyncing && status.isOnline) {
      sync();
    }
  }, [syncInterval, status.isSyncing, status.isOnline, sync, stopSync]);

  // Sincronizar cuando vuelva la conexión
  const syncWhenOnline = useCallback(() => {
    if (status.isOnline) {
      sync();
    } else {
      setStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
    }
  }, [status.isOnline, sync]);

  // Limpiar cambios pendientes
  const clearPendingChanges = useCallback(() => {
    setStatus(prev => ({ ...prev, pendingChanges: 0 }));
  }, []);

  // Calcular tiempo hasta próxima sincronización
  const nextSyncIn = nextSyncTime 
    ? Math.max(0, Math.floor((nextSyncTime.getTime() - Date.now()) / 1000))
    : 0;

  const canSync = status.isOnline && !status.isSyncing && calendarIds.length > 0;

  return {
    status,
    sync,
    forceSync,
    stopSync,
    startAutoSync,
    syncWhenOnline,
    clearPendingChanges,
    canSync,
    nextSyncIn,
  };
};