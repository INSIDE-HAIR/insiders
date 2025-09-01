/**
 * useCalendarStore - Zustand Store
 * 
 * Store para gestión de estado global de calendarios
 * Centraliza información de calendarios disponibles y configuración
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Calendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole: 'owner' | 'writer' | 'reader';
  backgroundColor?: string;
  foregroundColor?: string;
  timeZone?: string;
  selected?: boolean;
}

interface CalendarState {
  // Estado de calendarios
  calendars: Calendar[];
  selectedCalendars: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Configuración
  defaultCalendarId: string | null;
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Actions
  setCalendars: (calendars: Calendar[]) => void;
  addCalendar: (calendar: Calendar) => void;
  updateCalendar: (id: string, updates: Partial<Calendar>) => void;
  removeCalendar: (id: string) => void;
  
  // Selección
  selectCalendar: (id: string) => void;
  deselectCalendar: (id: string) => void;
  toggleCalendar: (id: string) => void;
  selectAllCalendars: () => void;
  deselectAllCalendars: () => void;
  setSelectedCalendars: (ids: string[]) => void;
  
  // Estado de carga
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Configuración
  setDefaultCalendar: (id: string | null) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  
  // Utilidades
  refresh: () => Promise<void>;
  getCalendarById: (id: string) => Calendar | undefined;
  getSelectedCalendars: () => Calendar[];
  canWrite: (calendarId: string) => boolean;
  canOwn: (calendarId: string) => boolean;
  
  // Reset
  reset: () => void;
}

const initialState = {
  calendars: [],
  selectedCalendars: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  defaultCalendarId: null,
  autoRefresh: true,
  refreshInterval: 30000, // 30 segundos
};

export const useCalendarStore = create<CalendarState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Actions básicas
        setCalendars: (calendars: Calendar[]) => 
          set(
            (state) => ({ 
              calendars, 
              lastUpdated: new Date(),
              error: null 
            }),
            false,
            'calendar/setCalendars'
          ),
        
        addCalendar: (calendar: Calendar) => 
          set(
            (state) => ({ 
              calendars: [...state.calendars, calendar],
              lastUpdated: new Date()
            }),
            false,
            'calendar/addCalendar'
          ),
        
        updateCalendar: (id: string, updates: Partial<Calendar>) =>
          set(
            (state) => ({
              calendars: state.calendars.map(cal => 
                cal.id === id ? { ...cal, ...updates } : cal
              ),
              lastUpdated: new Date()
            }),
            false,
            'calendar/updateCalendar'
          ),
        
        removeCalendar: (id: string) =>
          set(
            (state) => ({
              calendars: state.calendars.filter(cal => cal.id !== id),
              selectedCalendars: state.selectedCalendars.filter(selId => selId !== id),
              lastUpdated: new Date()
            }),
            false,
            'calendar/removeCalendar'
          ),
        
        // Selección
        selectCalendar: (id: string) =>
          set(
            (state) => {
              if (!state.selectedCalendars.includes(id)) {
                return {
                  selectedCalendars: [...state.selectedCalendars, id]
                };
              }
              return state;
            },
            false,
            'calendar/selectCalendar'
          ),
        
        deselectCalendar: (id: string) =>
          set(
            (state) => ({
              selectedCalendars: state.selectedCalendars.filter(selId => selId !== id)
            }),
            false,
            'calendar/deselectCalendar'
          ),
        
        toggleCalendar: (id: string) =>
          set(
            (state) => ({
              selectedCalendars: state.selectedCalendars.includes(id)
                ? state.selectedCalendars.filter(selId => selId !== id)
                : [...state.selectedCalendars, id]
            }),
            false,
            'calendar/toggleCalendar'
          ),
        
        selectAllCalendars: () =>
          set(
            (state) => ({
              selectedCalendars: state.calendars.map(cal => cal.id)
            }),
            false,
            'calendar/selectAllCalendars'
          ),
        
        deselectAllCalendars: () =>
          set(
            { selectedCalendars: [] },
            false,
            'calendar/deselectAllCalendars'
          ),
        
        setSelectedCalendars: (ids: string[]) =>
          set(
            { selectedCalendars: ids },
            false,
            'calendar/setSelectedCalendars'
          ),
        
        // Estado de carga
        setLoading: (loading: boolean) =>
          set(
            { isLoading: loading },
            false,
            'calendar/setLoading'
          ),
        
        setError: (error: string | null) =>
          set(
            { error, isLoading: false },
            false,
            'calendar/setError'
          ),
        
        clearError: () =>
          set(
            { error: null },
            false,
            'calendar/clearError'
          ),
        
        // Configuración
        setDefaultCalendar: (id: string | null) =>
          set(
            { defaultCalendarId: id },
            false,
            'calendar/setDefaultCalendar'
          ),
        
        setAutoRefresh: (enabled: boolean) =>
          set(
            { autoRefresh: enabled },
            false,
            'calendar/setAutoRefresh'
          ),
        
        setRefreshInterval: (interval: number) =>
          set(
            { refreshInterval: interval },
            false,
            'calendar/setRefreshInterval'
          ),
        
        // Utilidades
        refresh: async () => {
          const state = get();
          
          try {
            state.setLoading(true);
            state.clearError();
            
            const response = await fetch('/api/calendar/calendars');
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || 'Error al cargar calendarios');
            }
            
            const data = await response.json();
            const calendars = data.calendars || [];
            
            state.setCalendars(calendars);
            
            // Auto-seleccionar calendarios si no hay ninguno seleccionado
            if (state.selectedCalendars.length === 0 && calendars.length > 0) {
              const primaryCalendar = calendars.find((cal: any) => cal.primary);
              if (primaryCalendar) {
                state.selectCalendar(primaryCalendar.id);
              } else {
                state.selectCalendar(calendars[0].id);
              }
            }
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            state.setError(errorMessage);
          } finally {
            state.setLoading(false);
          }
        },
        
        getCalendarById: (id: string) => {
          const state = get();
          return state.calendars.find(cal => cal.id === id);
        },
        
        getSelectedCalendars: () => {
          const state = get();
          return state.calendars.filter(cal => state.selectedCalendars.includes(cal.id));
        },
        
        canWrite: (calendarId: string) => {
          const calendar = get().getCalendarById(calendarId);
          return calendar?.accessRole === 'owner' || calendar?.accessRole === 'writer';
        },
        
        canOwn: (calendarId: string) => {
          const calendar = get().getCalendarById(calendarId);
          return calendar?.accessRole === 'owner';
        },
        
        // Reset
        reset: () =>
          set(
            initialState,
            false,
            'calendar/reset'
          ),
      }),
      {
        name: 'calendar-store',
        // Solo persistir configuración de usuario, no datos temporales
        partialize: (state) => ({
          selectedCalendars: state.selectedCalendars,
          defaultCalendarId: state.defaultCalendarId,
          autoRefresh: state.autoRefresh,
          refreshInterval: state.refreshInterval,
        }),
      }
    ),
    {
      name: 'calendar-store',
    }
  )
);

// Selectores para optimizar re-renders
export const useCalendars = () => useCalendarStore((state) => state.calendars);
export const useSelectedCalendars = () => useCalendarStore((state) => state.selectedCalendars);
export const useCalendarLoading = () => useCalendarStore((state) => state.isLoading);
export const useCalendarError = () => useCalendarStore((state) => state.error);
export const useCalendarById = (id: string) => useCalendarStore((state) => state.getCalendarById(id));
export const useSelectedCalendarsData = () => useCalendarStore((state) => state.getSelectedCalendars());