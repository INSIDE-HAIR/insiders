/**
 * useEventsStore - Zustand Store
 * 
 * Store para gestión de estado global de eventos de calendario
 * Centraliza cache de eventos, optimizaciones y estado de sincronización
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GoogleCalendarEvent } from '@/src/features/calendar/types';

interface EventsState {
  // Cache de eventos por calendario
  eventsByCalendar: Record<string, GoogleCalendarEvent[]>;
  allEvents: GoogleCalendarEvent[];
  
  // Estado de carga
  isLoading: boolean;
  loadingCalendars: Set<string>;
  error: string | null;
  
  // Metadatos de cache
  lastFetch: Record<string, Date>;
  lastSync: Date | null;
  cacheExpiry: number; // en milisegundos
  
  // Filtros activos (cache de resultados)
  filteredEvents: GoogleCalendarEvent[];
  activeFilters: Record<string, any>;
  searchTerm: string;
  
  // Selección de eventos
  selectedEvents: Set<string>;
  
  // Métricas calculadas (cache)
  metrics: {
    total: number;
    withMeet: number;
    withoutMeet: number;
    upcoming: number;
    past: number;
    ongoing: number;
    byCalendar: Record<string, number>;
  };
  
  // Actions
  setEvents: (calendarId: string, events: GoogleCalendarEvent[]) => void;
  addEvent: (event: GoogleCalendarEvent) => void;
  updateEvent: (eventId: string, updates: Partial<GoogleCalendarEvent>) => void;
  removeEvent: (eventId: string) => void;
  
  // Bulk operations
  setAllEvents: (events: GoogleCalendarEvent[]) => void;
  mergeEvents: (calendarIds: string[], events: GoogleCalendarEvent[]) => void;
  clearEvents: (calendarIds?: string[]) => void;
  
  // Loading state
  setLoading: (loading: boolean, calendarId?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Cache management
  invalidateCache: (calendarId?: string) => void;
  isCacheValid: (calendarId: string) => boolean;
  refreshEvents: (calendarIds: string[]) => Promise<void>;
  
  // Filtering
  applyFilters: (filters: Record<string, any>, searchTerm?: string) => void;
  clearFilters: () => void;
  
  // Selection
  selectEvent: (eventId: string) => void;
  deselectEvent: (eventId: string) => void;
  toggleEvent: (eventId: string) => void;
  selectAllEvents: (events?: GoogleCalendarEvent[]) => void;
  deselectAllEvents: () => void;
  
  // Metrics
  recalculateMetrics: () => void;
  
  // Utils
  getEventById: (eventId: string) => GoogleCalendarEvent | undefined;
  getEventsByCalendar: (calendarId: string) => GoogleCalendarEvent[];
  getSelectedEvents: () => GoogleCalendarEvent[];
  
  // Reset
  reset: () => void;
}

const initialMetrics = {
  total: 0,
  withMeet: 0,
  withoutMeet: 0,
  upcoming: 0,
  past: 0,
  ongoing: 0,
  byCalendar: {},
};

const initialState = {
  eventsByCalendar: {},
  allEvents: [],
  isLoading: false,
  loadingCalendars: new Set<string>(),
  error: null,
  lastFetch: {},
  lastSync: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutos
  filteredEvents: [],
  activeFilters: {},
  searchTerm: '',
  selectedEvents: new Set<string>(),
  metrics: initialMetrics,
};

export const useEventsStore = create<EventsState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Establecer eventos de un calendario específico
      setEvents: (calendarId: string, events: GoogleCalendarEvent[]) =>
        set(
          (state) => {
            const newEventsByCalendar = {
              ...state.eventsByCalendar,
              [calendarId]: events,
            };
            
            // Recalcular todos los eventos
            const allEvents = Object.values(newEventsByCalendar).flat();
            
            return {
              eventsByCalendar: newEventsByCalendar,
              allEvents,
              lastFetch: {
                ...state.lastFetch,
                [calendarId]: new Date(),
              },
              loadingCalendars: new Set([...state.loadingCalendars].filter(id => id !== calendarId)),
              error: null,
            };
          },
          false,
          'events/setEvents'
        ),
      
      // Agregar un evento individual
      addEvent: (event: GoogleCalendarEvent) =>
        set(
          (state) => {
            const calendarId = (event as any).calendarId || 'default';
            const currentEvents = state.eventsByCalendar[calendarId] || [];
            const updatedEvents = [...currentEvents, event];
            
            const newEventsByCalendar = {
              ...state.eventsByCalendar,
              [calendarId]: updatedEvents,
            };
            
            const allEvents = Object.values(newEventsByCalendar).flat() as GoogleCalendarEvent[];
            
            return {
              ...state,
              eventsByCalendar: newEventsByCalendar,
              allEvents,
            };
          },
          false,
          'events/addEvent'
        ),
      
      // Actualizar un evento
      updateEvent: (eventId: string, updates: Partial<GoogleCalendarEvent>) =>
        set(
          (state) => {
            const newEventsByCalendar = { ...state.eventsByCalendar };
            let found = false;
            
            // Buscar y actualizar el evento en todos los calendarios
            Object.keys(newEventsByCalendar).forEach(calendarId => {
              newEventsByCalendar[calendarId] = newEventsByCalendar[calendarId]?.map(event => {
                if (event.id === eventId) {
                  found = true;
                  return { ...event, ...updates };
                }
                return event;
              }) || [];
            });
            
            if (!found) return state;
            
            const allEvents = Object.values(newEventsByCalendar).flat();
            
            return {
              eventsByCalendar: newEventsByCalendar,
              allEvents,
            };
          },
          false,
          'events/updateEvent'
        ),
      
      // Eliminar un evento
      removeEvent: (eventId: string) =>
        set(
          (state) => {
            const newEventsByCalendar = { ...state.eventsByCalendar };
            
            Object.keys(newEventsByCalendar).forEach(calendarId => {
              newEventsByCalendar[calendarId] = newEventsByCalendar[calendarId]?.filter(
                event => event.id !== eventId
              ) || [];
            });
            
            const allEvents = Object.values(newEventsByCalendar).flat();
            const selectedEvents = new Set([...state.selectedEvents].filter(id => id !== eventId));
            
            return {
              eventsByCalendar: newEventsByCalendar,
              allEvents,
              selectedEvents,
            };
          },
          false,
          'events/removeEvent'
        ),
      
      // Establecer todos los eventos
      setAllEvents: (events: GoogleCalendarEvent[]) =>
        set(
          {
            allEvents: events,
            lastSync: new Date(),
            error: null,
          },
          false,
          'events/setAllEvents'
        ),
      
      // Merge de eventos de múltiples calendarios
      mergeEvents: (calendarIds: string[], events: GoogleCalendarEvent[]) =>
        set(
          (state) => {
            const newEventsByCalendar = { ...state.eventsByCalendar };
            const now = new Date();
            
            // Limpiar calendarios especificados y agregar nuevos eventos
            calendarIds.forEach(calendarId => {
              newEventsByCalendar[calendarId] = events.filter(
                event => (event as any).calendarId === calendarId
              );
            });
            
            const allEvents = Object.values(newEventsByCalendar).flat();
            
            const newLastFetch = { ...state.lastFetch };
            calendarIds.forEach(id => {
              newLastFetch[id] = now;
            });
            
            return {
              eventsByCalendar: newEventsByCalendar,
              allEvents,
              lastFetch: newLastFetch,
              lastSync: now,
              error: null,
            };
          },
          false,
          'events/mergeEvents'
        ),
      
      // Limpiar eventos
      clearEvents: (calendarIds?: string[]) =>
        set(
          (state) => {
            if (!calendarIds) {
              return {
                eventsByCalendar: {},
                allEvents: [],
                filteredEvents: [],
                selectedEvents: new Set(),
                lastFetch: {},
                metrics: initialMetrics,
              };
            }
            
            const newEventsByCalendar = { ...state.eventsByCalendar };
            const newLastFetch = { ...state.lastFetch };
            
            calendarIds.forEach(calendarId => {
              delete newEventsByCalendar[calendarId];
              delete newLastFetch[calendarId];
            });
            
            const allEvents = Object.values(newEventsByCalendar).flat();
            
            return {
              eventsByCalendar: newEventsByCalendar,
              allEvents,
              lastFetch: newLastFetch,
            };
          },
          false,
          'events/clearEvents'
        ),
      
      // Estado de carga
      setLoading: (loading: boolean, calendarId?: string) =>
        set(
          (state) => {
            if (calendarId) {
              const newLoadingCalendars = new Set(state.loadingCalendars);
              if (loading) {
                newLoadingCalendars.add(calendarId);
              } else {
                newLoadingCalendars.delete(calendarId);
              }
              
              return {
                loadingCalendars: newLoadingCalendars,
                isLoading: newLoadingCalendars.size > 0,
              };
            }
            
            return { isLoading: loading };
          },
          false,
          'events/setLoading'
        ),
      
      setError: (error: string | null) =>
        set(
          { error, isLoading: false, loadingCalendars: new Set() },
          false,
          'events/setError'
        ),
      
      clearError: () =>
        set(
          { error: null },
          false,
          'events/clearError'
        ),
      
      // Gestión de cache
      invalidateCache: (calendarId?: string) =>
        set(
          (state) => {
            if (!calendarId) {
              return { lastFetch: {}, lastSync: null };
            }
            
            const newLastFetch = { ...state.lastFetch };
            delete newLastFetch[calendarId];
            
            return { lastFetch: newLastFetch };
          },
          false,
          'events/invalidateCache'
        ),
      
      isCacheValid: (calendarId: string) => {
        const state = get();
        const lastFetch = state.lastFetch[calendarId];
        
        if (!lastFetch) return false;
        
        const age = Date.now() - lastFetch.getTime();
        return age < state.cacheExpiry;
      },
      
      refreshEvents: async (calendarIds: string[]) => {
        const state = get();
        
        try {
          // Marcar calendarios como cargando
          calendarIds.forEach(id => state.setLoading(true, id));
          state.clearError();
          
          const queryParams = new URLSearchParams();
          calendarIds.forEach(id => queryParams.append('calendarIds', id));
          
          const response = await fetch(`/api/calendar/events?${queryParams}`);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al cargar eventos');
          }
          
          const data = await response.json();
          const events = data.events || [];
          
          state.mergeEvents(calendarIds, events);
          state.recalculateMetrics();
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          state.setError(errorMessage);
        } finally {
          calendarIds.forEach(id => state.setLoading(false, id));
        }
      },
      
      // Filtros
      applyFilters: (filters: Record<string, any>, searchTerm = '') => {
        const state = get();
        let filteredEvents = [...state.allEvents];
        
        // Aplicar filtros
        Object.entries(filters).forEach(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return;
          
          filteredEvents = filteredEvents.filter(event => {
            const eventValue = (event as any)[key];
            
            if (Array.isArray(value)) {
              return value.includes(eventValue);
            }
            
            if (typeof value === 'object' && value.start && value.end) {
              const eventDate = new Date(event.start?.dateTime || event.start?.date || '');
              return eventDate >= new Date(value.start) && eventDate <= new Date(value.end);
            }
            
            return eventValue === value;
          });
        });
        
        // Aplicar búsqueda por texto
        if (searchTerm) {
          const lowerSearchTerm = searchTerm.toLowerCase();
          filteredEvents = filteredEvents.filter(event => {
            return (
              event.summary?.toLowerCase().includes(lowerSearchTerm) ||
              event.description?.toLowerCase().includes(lowerSearchTerm) ||
              event.location?.toLowerCase().includes(lowerSearchTerm) ||
              event.attendees?.some(attendee => 
                attendee.email?.toLowerCase().includes(lowerSearchTerm)
              )
            );
          });
        }
        
        set(
          {
            filteredEvents,
            activeFilters: filters,
            searchTerm,
          },
          false,
          'events/applyFilters'
        );
      },
      
      clearFilters: () =>
        set(
          {
            filteredEvents: [],
            activeFilters: {},
            searchTerm: '',
          },
          false,
          'events/clearFilters'
        ),
      
      // Selección
      selectEvent: (eventId: string) =>
        set(
          (state) => ({
            selectedEvents: new Set([...state.selectedEvents, eventId]),
          }),
          false,
          'events/selectEvent'
        ),
      
      deselectEvent: (eventId: string) =>
        set(
          (state) => {
            const newSelected = new Set(state.selectedEvents);
            newSelected.delete(eventId);
            return { selectedEvents: newSelected };
          },
          false,
          'events/deselectEvent'
        ),
      
      toggleEvent: (eventId: string) =>
        set(
          (state) => {
            const newSelected = new Set(state.selectedEvents);
            if (newSelected.has(eventId)) {
              newSelected.delete(eventId);
            } else {
              newSelected.add(eventId);
            }
            return { selectedEvents: newSelected };
          },
          false,
          'events/toggleEvent'
        ),
      
      selectAllEvents: (events?: GoogleCalendarEvent[]) =>
        set(
          (state) => {
            const eventsToSelect = events || state.allEvents;
            return {
              ...state,
              selectedEvents: new Set(eventsToSelect.map(event => event.id).filter(Boolean) as string[]),
            };
          },
          false,
          'events/selectAllEvents'
        ),
      
      deselectAllEvents: () =>
        set(
          { selectedEvents: new Set() },
          false,
          'events/deselectAllEvents'
        ),
      
      // Métricas
      recalculateMetrics: () =>
        set(
          (state) => {
            const events = state.allEvents;
            const now = new Date();
            
            let withMeet = 0;
            let upcoming = 0;
            let past = 0;
            let ongoing = 0;
            const byCalendar: Record<string, number> = {};
            
            events.forEach(event => {
              // Conteo por calendario
              const calendarId = (event as any).calendarId || 'default';
              byCalendar[calendarId] = (byCalendar[calendarId] || 0) + 1;
              
              // Meet links
              if (event.hangoutLink || event.conferenceData) {
                withMeet++;
              }
              
              // Estado temporal
              const start = new Date(event.start?.dateTime || event.start?.date || '');
              const end = new Date(event.end?.dateTime || event.end?.date || '');
              
              if (now < start) {
                upcoming++;
              } else if (now > end) {
                past++;
              } else {
                ongoing++;
              }
            });
            
            return {
              metrics: {
                total: events.length,
                withMeet,
                withoutMeet: events.length - withMeet,
                upcoming,
                past,
                ongoing,
                byCalendar,
              },
            };
          },
          false,
          'events/recalculateMetrics'
        ),
      
      // Utilidades
      getEventById: (eventId: string) => {
        const state = get();
        return state.allEvents.find(event => event.id === eventId);
      },
      
      getEventsByCalendar: (calendarId: string) => {
        const state = get();
        return state.eventsByCalendar[calendarId] || [];
      },
      
      getSelectedEvents: () => {
        const state = get();
        return state.allEvents.filter(event => event.id && state.selectedEvents.has(event.id));
      },
      
      // Reset
      reset: () =>
        set(
          initialState,
          false,
          'events/reset'
        ),
    }),
    {
      name: 'events-store',
    }
  )
);

// Selectores optimizados
export const useAllEvents = () => useEventsStore((state) => state.allEvents);
export const useFilteredEvents = () => useEventsStore((state) => 
  state.filteredEvents.length > 0 ? state.filteredEvents : state.allEvents
);
export const useSelectedEvents = () => useEventsStore((state) => state.selectedEvents);
export const useEventsLoading = () => useEventsStore((state) => state.isLoading);
export const useEventsError = () => useEventsStore((state) => state.error);
export const useEventsMetrics = () => useEventsStore((state) => state.metrics);
export const useEventById = (id: string) => useEventsStore((state) => state.getEventById(id));
export const useEventsByCalendar = (calendarId: string) => useEventsStore((state) => state.getEventsByCalendar(calendarId));