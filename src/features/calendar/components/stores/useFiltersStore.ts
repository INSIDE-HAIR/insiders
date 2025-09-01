/**
 * useFiltersStore - Zustand Store
 * 
 * Store para gestión de filtros de eventos
 * Centraliza estado de filtros con persistencia en localStorage
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface DateRange {
  start?: string;
  end?: string;
}

export interface AttendeeFilter {
  includes?: string[];  // Debe incluir estos emails
  excludes?: string[];  // No debe incluir estos emails
  minCount?: number;    // Mínimo número de asistentes
  maxCount?: number;    // Máximo número de asistentes
}

export interface FilterState {
  // Filtros principales
  searchTerm: string;
  calendarIds: string[];
  dateRange: DateRange;
  
  // Filtros específicos
  hasHangoutLink: boolean | null;
  eventStatus: ('confirmed' | 'tentative' | 'cancelled')[];
  transparency: ('opaque' | 'transparent')[];
  
  // Filtros de asistentes
  attendeeFilter: AttendeeFilter;
  
  // Filtros avanzados
  isRecurring: boolean | null;
  hasAttachments: boolean | null;
  hasDescription: boolean | null;
  hasLocation: boolean | null;
  
  // Filtros personalizados por usuario
  customFilters: Record<string, any>;
  
  // Filtros guardados (presets)
  savedFilters: Record<string, {
    name: string;
    filters: Partial<FilterState>;
    createdAt: Date;
  }>;
  
  // Estado UI
  isAdvancedMode: boolean;
  activeFilterCount: number;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setCalendarIds: (ids: string[]) => void;
  setDateRange: (range: DateRange) => void;
  setHasHangoutLink: (value: boolean | null) => void;
  setEventStatus: (statuses: ('confirmed' | 'tentative' | 'cancelled')[]) => void;
  setTransparency: (values: ('opaque' | 'transparent')[]) => void;
  setAttendeeFilter: (filter: Partial<AttendeeFilter>) => void;
  setIsRecurring: (value: boolean | null) => void;
  setHasAttachments: (value: boolean | null) => void;
  setHasDescription: (value: boolean | null) => void;
  setHasLocation: (value: boolean | null) => void;
  setCustomFilter: (key: string, value: any) => void;
  removeCustomFilter: (key: string) => void;
  
  // Bulk operations
  setMultipleFilters: (filters: Partial<FilterState>) => void;
  clearAllFilters: () => void;
  clearSearchAndText: () => void;
  
  // Saved filters
  saveCurrentFilters: (name: string) => void;
  loadSavedFilters: (name: string) => void;
  deleteSavedFilters: (name: string) => void;
  
  // Advanced mode
  toggleAdvancedMode: () => void;
  setAdvancedMode: (enabled: boolean) => void;
  
  // Utilities
  getActiveFilters: () => Partial<FilterState>;
  hasActiveFilters: () => boolean;
  recalculateActiveCount: () => void;
  
  // Reset
  reset: () => void;
}

const initialState: Omit<FilterState, 'recalculateActiveCount' | 'getActiveFilters' | 'hasActiveFilters' | keyof ReturnType<typeof create>> = {
  // Filtros principales
  searchTerm: '',
  calendarIds: [],
  dateRange: {},
  
  // Filtros específicos
  hasHangoutLink: null,
  eventStatus: [],
  transparency: [],
  
  // Filtros de asistentes
  attendeeFilter: {},
  
  // Filtros avanzados
  isRecurring: null,
  hasAttachments: null,
  hasDescription: null,
  hasLocation: null,
  
  // Filtros personalizados
  customFilters: {},
  
  // Filtros guardados
  savedFilters: {},
  
  // Estado UI
  isAdvancedMode: false,
  activeFilterCount: 0,
  
  // Métodos se definirán en el store
  setSearchTerm: () => {},
  setCalendarIds: () => {},
  setDateRange: () => {},
  setHasHangoutLink: () => {},
  setEventStatus: () => {},
  setTransparency: () => {},
  setAttendeeFilter: () => {},
  setIsRecurring: () => {},
  setHasAttachments: () => {},
  setHasDescription: () => {},
  setHasLocation: () => {},
  setCustomFilter: () => {},
  removeCustomFilter: () => {},
  setMultipleFilters: () => {},
  clearAllFilters: () => {},
  clearSearchAndText: () => {},
  saveCurrentFilters: () => {},
  loadSavedFilters: () => {},
  deleteSavedFilters: () => {},
  toggleAdvancedMode: () => {},
  setAdvancedMode: () => {},
  reset: () => {},
};

export const useFiltersStore = create<FilterState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Filtros principales
        setSearchTerm: (term: string) =>
          set(
            (state) => ({ searchTerm: term }),
            false,
            'filters/setSearchTerm'
          ),
        
        setCalendarIds: (ids: string[]) =>
          set(
            { calendarIds: ids },
            false,
            'filters/setCalendarIds'
          ),
        
        setDateRange: (range: DateRange) =>
          set(
            (state) => ({ 
              dateRange: { ...state.dateRange, ...range } 
            }),
            false,
            'filters/setDateRange'
          ),
        
        // Filtros específicos
        setHasHangoutLink: (value: boolean | null) =>
          set(
            { hasHangoutLink: value },
            false,
            'filters/setHasHangoutLink'
          ),
        
        setEventStatus: (statuses: ('confirmed' | 'tentative' | 'cancelled')[]) =>
          set(
            { eventStatus: statuses },
            false,
            'filters/setEventStatus'
          ),
        
        setTransparency: (values: ('opaque' | 'transparent')[]) =>
          set(
            { transparency: values },
            false,
            'filters/setTransparency'
          ),
        
        // Filtros de asistentes
        setAttendeeFilter: (filter: Partial<AttendeeFilter>) =>
          set(
            (state) => ({
              attendeeFilter: { ...state.attendeeFilter, ...filter }
            }),
            false,
            'filters/setAttendeeFilter'
          ),
        
        // Filtros avanzados
        setIsRecurring: (value: boolean | null) =>
          set(
            { isRecurring: value },
            false,
            'filters/setIsRecurring'
          ),
        
        setHasAttachments: (value: boolean | null) =>
          set(
            { hasAttachments: value },
            false,
            'filters/setHasAttachments'
          ),
        
        setHasDescription: (value: boolean | null) =>
          set(
            { hasDescription: value },
            false,
            'filters/setHasDescription'
          ),
        
        setHasLocation: (value: boolean | null) =>
          set(
            { hasLocation: value },
            false,
            'filters/setHasLocation'
          ),
        
        // Filtros personalizados
        setCustomFilter: (key: string, value: any) =>
          set(
            (state) => ({
              customFilters: { ...state.customFilters, [key]: value }
            }),
            false,
            'filters/setCustomFilter'
          ),
        
        removeCustomFilter: (key: string) =>
          set(
            (state) => {
              const { [key]: removed, ...rest } = state.customFilters;
              return { customFilters: rest };
            },
            false,
            'filters/removeCustomFilter'
          ),
        
        // Operaciones masivas
        setMultipleFilters: (filters: Partial<FilterState>) =>
          set(
            (state) => ({ ...state, ...filters }),
            false,
            'filters/setMultipleFilters'
          ),
        
        clearAllFilters: () =>
          set(
            {
              searchTerm: '',
              calendarIds: [],
              dateRange: {},
              hasHangoutLink: null,
              eventStatus: [],
              transparency: [],
              attendeeFilter: {},
              isRecurring: null,
              hasAttachments: null,
              hasDescription: null,
              hasLocation: null,
              customFilters: {},
              activeFilterCount: 0,
            },
            false,
            'filters/clearAllFilters'
          ),
        
        clearSearchAndText: () =>
          set(
            { searchTerm: '' },
            false,
            'filters/clearSearchAndText'
          ),
        
        // Filtros guardados
        saveCurrentFilters: (name: string) =>
          set(
            (state) => {
              const currentFilters = state.getActiveFilters();
              return {
                savedFilters: {
                  ...state.savedFilters,
                  [name]: {
                    name,
                    filters: currentFilters,
                    createdAt: new Date(),
                  },
                },
              };
            },
            false,
            'filters/saveCurrentFilters'
          ),
        
        loadSavedFilters: (name: string) =>
          set(
            (state) => {
              const saved = state.savedFilters[name];
              if (!saved) return state;
              
              return {
                ...state,
                ...saved.filters,
              };
            },
            false,
            'filters/loadSavedFilters'
          ),
        
        deleteSavedFilters: (name: string) =>
          set(
            (state) => {
              const { [name]: deleted, ...rest } = state.savedFilters;
              return { savedFilters: rest };
            },
            false,
            'filters/deleteSavedFilters'
          ),
        
        // Modo avanzado
        toggleAdvancedMode: () =>
          set(
            (state) => ({ isAdvancedMode: !state.isAdvancedMode }),
            false,
            'filters/toggleAdvancedMode'
          ),
        
        setAdvancedMode: (enabled: boolean) =>
          set(
            { isAdvancedMode: enabled },
            false,
            'filters/setAdvancedMode'
          ),
        
        // Utilidades
        getActiveFilters: () => {
          const state = get();
          const activeFilters: Partial<FilterState> = {};
          
          // Solo incluir filtros que tienen valores
          if (state.searchTerm) activeFilters.searchTerm = state.searchTerm;
          if (state.calendarIds.length > 0) activeFilters.calendarIds = state.calendarIds;
          if (state.dateRange.start || state.dateRange.end) activeFilters.dateRange = state.dateRange;
          if (state.hasHangoutLink !== null) activeFilters.hasHangoutLink = state.hasHangoutLink;
          if (state.eventStatus.length > 0) activeFilters.eventStatus = state.eventStatus;
          if (state.transparency.length > 0) activeFilters.transparency = state.transparency;
          if (Object.keys(state.attendeeFilter).length > 0) activeFilters.attendeeFilter = state.attendeeFilter;
          if (state.isRecurring !== null) activeFilters.isRecurring = state.isRecurring;
          if (state.hasAttachments !== null) activeFilters.hasAttachments = state.hasAttachments;
          if (state.hasDescription !== null) activeFilters.hasDescription = state.hasDescription;
          if (state.hasLocation !== null) activeFilters.hasLocation = state.hasLocation;
          if (Object.keys(state.customFilters).length > 0) activeFilters.customFilters = state.customFilters;
          
          return activeFilters;
        },
        
        hasActiveFilters: () => {
          const activeFilters = get().getActiveFilters();
          return Object.keys(activeFilters).length > 0;
        },
        
        recalculateActiveCount: () =>
          set(
            (state) => {
              const activeFilters = state.getActiveFilters();
              return { activeFilterCount: Object.keys(activeFilters).length };
            },
            false,
            'filters/recalculateActiveCount'
          ),
        
        // Reset
        reset: () =>
          set(
            {
              ...initialState,
              savedFilters: get().savedFilters, // Mantener filtros guardados
            },
            false,
            'filters/reset'
          ),
      }),
      {
        name: 'filters-store',
        // Persistir todo excepto el contador (se recalcula)
        partialize: (state) => ({
          searchTerm: state.searchTerm,
          calendarIds: state.calendarIds,
          dateRange: state.dateRange,
          hasHangoutLink: state.hasHangoutLink,
          eventStatus: state.eventStatus,
          transparency: state.transparency,
          attendeeFilter: state.attendeeFilter,
          isRecurring: state.isRecurring,
          hasAttachments: state.hasAttachments,
          hasDescription: state.hasDescription,
          hasLocation: state.hasLocation,
          customFilters: state.customFilters,
          savedFilters: state.savedFilters,
          isAdvancedMode: state.isAdvancedMode,
        }),
      }
    ),
    {
      name: 'filters-store',
    }
  )
);

// Hook effect para recalcular activeFilterCount cuando cambien los filtros
if (typeof window !== 'undefined') {
  useFiltersStore.subscribe((state, prevState) => {
    // Solo recalcular si los filtros cambiaron
    const currentFilters = JSON.stringify(state.getActiveFilters());
    const prevFilters = JSON.stringify(prevState.getActiveFilters());
    
    if (currentFilters !== prevFilters) {
      state.recalculateActiveCount();
    }
  });
}

// Selectores optimizados
export const useSearchTerm = () => useFiltersStore((state) => state.searchTerm);
export const useSelectedCalendarIds = () => useFiltersStore((state) => state.calendarIds);
export const useDateRange = () => useFiltersStore((state) => state.dateRange);
export const useActiveFilters = () => useFiltersStore((state) => state.getActiveFilters());
export const useHasActiveFilters = () => useFiltersStore((state) => state.hasActiveFilters());
export const useActiveFilterCount = () => useFiltersStore((state) => state.activeFilterCount);
export const useIsAdvancedMode = () => useFiltersStore((state) => state.isAdvancedMode);
export const useSavedFilters = () => useFiltersStore((state) => state.savedFilters);