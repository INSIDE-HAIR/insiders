/**
 * Store de Zustand para gestionar KPIs de participantes
 */

import { create } from 'zustand';
import { ParticipantKPI } from '@/src/features/calendar/types/participant-kpis';

interface ParticipantKPIState {
  // Estado
  kpis: Record<string, ParticipantKPI>;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  
  // Actions
  fetchKPIs: (emails: string[], options?: {
    startDate?: string;
    endDate?: string;
    calendarIds?: string[];
  }) => Promise<void>;
  updateKPI: (email: string, kpi: Partial<ParticipantKPI>) => void;
  removeKPI: (email: string) => void;
  clearKPIs: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useParticipantKPIStore = create<ParticipantKPIState>((set, get) => ({
  // Initial state
  kpis: {},
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  // Fetch KPIs from API - Memoizada para evitar recreaciones
  fetchKPIs: async (emails, options = {}) => {
    console.log('🚀 [KPI STORE] fetchKPIs ejecutado', { emails, options });
    
    // Don't fetch if already loading
    if (get().isLoading) {
      console.log('⏸️ [KPI STORE] Ya está cargando, saltando...');
      return;
    }

    // Don't fetch if no emails provided
    if (emails.length === 0) {
      console.log('📭 [KPI STORE] No hay emails, limpiando KPIs');
      set({ kpis: {}, error: null });
      return;
    }

    console.log('📡 [KPI STORE] Iniciando carga de KPIs');
    set({ isLoading: true, error: null });

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('emails', emails.join(','));
      
      if (options.startDate) {
        params.append('startDate', options.startDate);
      }
      if (options.endDate) {
        params.append('endDate', options.endDate);
      }
      if (options.calendarIds && options.calendarIds.length > 0) {
        params.append('calendarIds', options.calendarIds.join(','));
      }

      // Make API request
      const response = await fetch(`/api/calendar/events/participant-kpis?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch KPIs: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.kpis) {
        throw new Error('Invalid response from server');
      }

      set({ 
        kpis: data.kpis,
        isLoading: false,
        error: null,
        lastFetchedAt: new Date()
      });
    } catch (error) {
      console.error('Error fetching participant KPIs:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch KPIs'
      });
    }
  },

  // Update a single KPI
  updateKPI: (email, kpiUpdate) => {
    set(state => {
      const existingKpi = state.kpis[email];
      if (!existingKpi) return state; // Don't update if doesn't exist
      
      return {
        kpis: {
          ...state.kpis,
          [email]: {
            ...existingKpi,
            ...kpiUpdate
          }
        }
      };
    });
  },

  // Remove a KPI
  removeKPI: (email) => {
    set(state => {
      const newKpis = { ...state.kpis };
      delete newKpis[email];
      return { kpis: newKpis };
    });
  },

  // Clear all KPIs
  clearKPIs: () => {
    set({ 
      kpis: {}, 
      error: null,
      lastFetchedAt: null
    });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Set error state
  setError: (error) => {
    set({ error });
  }
}));

// Selector hooks for common use cases
export const useParticipantKPI = (email: string) => {
  return useParticipantKPIStore(state => state.kpis[email]);
};

export const useParticipantKPIs = (emails: string[]) => {
  return useParticipantKPIStore(state => 
    emails.map(email => state.kpis[email]).filter(Boolean)
  );
};

export const useParticipantKPILoading = () => {
  return useParticipantKPIStore(state => state.isLoading);
};

export const useParticipantKPIError = () => {
  return useParticipantKPIStore(state => state.error);
};