/**
 * useUIStore - Zustand Store
 * 
 * Store para gestión de estado UI global
 * Centraliza modales, loading states, notificaciones y preferencias de usuario
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GoogleCalendarEvent } from '@/src/features/calendar/types';

export type ModalType = 
  | 'eventDetail'
  | 'bulkAddParticipants'
  | 'bulkDateTime'
  | 'bulkGenerateDescriptions'
  | 'bulkMoveCalendar'
  | 'columnVisibility'
  | 'allParticipants'
  | 'eventForm';

export interface ModalState {
  isOpen: boolean;
  data?: any;
  context?: Record<string, any>;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

export interface UIPreferences {
  // Tabla
  tablePageSize: number;
  tableCompactMode: boolean;
  showTableBorders: boolean;
  
  // Columnas
  columnWidths: Record<string, number>;
  columnOrder: string[];
  
  // Tema y visualización
  theme: 'light' | 'dark' | 'auto';
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Comportamiento
  autoRefresh: boolean;
  refreshInterval: number;
  confirmBulkActions: boolean;
  showTooltips: boolean;
  
  // Layout
  sidebarCollapsed: boolean;
  filtersExpanded: boolean;
  kpiExpanded: boolean;
}

interface UIState {
  // Modales
  modals: Record<ModalType, ModalState>;
  
  // Loading states globales
  globalLoading: boolean;
  loadingOperations: Set<string>;
  loadingText?: string;
  
  // Notificaciones
  notifications: NotificationState[];
  
  // Preferencias de usuario
  preferences: UIPreferences;
  
  // Estado de interacciones
  isDragging: boolean;
  dragData?: any;
  hoveredEvent?: string;
  focusedEvent?: string;
  
  // Responsive
  isMobile: boolean;
  isTablet: boolean;
  
  // Comandos y atajos
  commandPaletteOpen: boolean;
  lastKeyCommand?: string;
  
  // Actions - Modales
  openModal: (type: ModalType, data?: any, context?: Record<string, any>) => void;
  closeModal: (type: ModalType) => void;
  toggleModal: (type: ModalType, data?: any, context?: Record<string, any>) => void;
  updateModalData: (type: ModalType, data: any) => void;
  updateModalContext: (type: ModalType, context: Record<string, any>) => void;
  closeAllModals: () => void;
  
  // Actions - Loading
  setGlobalLoading: (loading: boolean, text?: string) => void;
  addLoadingOperation: (operationId: string) => void;
  removeLoadingOperation: (operationId: string) => void;
  clearAllLoading: () => void;
  
  // Actions - Notificaciones
  addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Actions - Preferencias
  updatePreferences: (updates: Partial<UIPreferences>) => void;
  resetPreferences: () => void;
  setTablePageSize: (size: number) => void;
  setTableCompactMode: (compact: boolean) => void;
  setColumnWidth: (columnId: string, width: number) => void;
  setColumnOrder: (order: string[]) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setFiltersExpanded: (expanded: boolean) => void;
  setKpiExpanded: (expanded: boolean) => void;
  
  // Actions - Interacciones
  setDragging: (isDragging: boolean, data?: any) => void;
  setHoveredEvent: (eventId?: string) => void;
  setFocusedEvent: (eventId?: string) => void;
  
  // Actions - Responsive
  setDeviceType: (isMobile: boolean, isTablet: boolean) => void;
  
  // Actions - Comandos
  toggleCommandPalette: () => void;
  setLastKeyCommand: (command: string) => void;
  
  // Utilities
  isModalOpen: (type: ModalType) => boolean;
  getModalData: (type: ModalType) => any;
  getModalContext: (type: ModalType) => Record<string, any>;
  hasLoadingOperations: () => boolean;
  getNotificationCount: () => number;
  
  // Reset
  reset: () => void;
}

const defaultPreferences: UIPreferences = {
  // Tabla
  tablePageSize: 50,
  tableCompactMode: false,
  showTableBorders: true,
  
  // Columnas
  columnWidths: {},
  columnOrder: [],
  
  // Tema
  theme: 'auto',
  reducedMotion: false,
  highContrast: false,
  
  // Comportamiento
  autoRefresh: true,
  refreshInterval: 30000,
  confirmBulkActions: true,
  showTooltips: true,
  
  // Layout
  sidebarCollapsed: false,
  filtersExpanded: false,
  kpiExpanded: true,
};

const initialModalStates: Record<ModalType, ModalState> = {
  eventDetail: { isOpen: false },
  bulkAddParticipants: { isOpen: false },
  bulkDateTime: { isOpen: false },
  bulkGenerateDescriptions: { isOpen: false },
  bulkMoveCalendar: { isOpen: false },
  columnVisibility: { isOpen: false },
  allParticipants: { isOpen: false },
  eventForm: { isOpen: false },
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        modals: initialModalStates,
        globalLoading: false,
        loadingOperations: new Set(),
        notifications: [],
        preferences: defaultPreferences,
        isDragging: false,
        isMobile: false,
        isTablet: false,
        commandPaletteOpen: false,
        
        // Modales
        openModal: (type: ModalType, data?: any, context?: Record<string, any>) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                [type]: {
                  isOpen: true,
                  data,
                  context: context || {},
                },
              },
            }),
            false,
            `ui/openModal/${type}`
          ),
        
        closeModal: (type: ModalType) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                [type]: {
                  isOpen: false,
                  data: undefined,
                  context: {},
                },
              },
            }),
            false,
            `ui/closeModal/${type}`
          ),
        
        toggleModal: (type: ModalType, data?: any, context?: Record<string, any>) => {
          const state = get();
          const modal = state.modals[type];
          
          if (modal.isOpen) {
            state.closeModal(type);
          } else {
            state.openModal(type, data, context);
          }
        },
        
        updateModalData: (type: ModalType, data: any) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                [type]: {
                  ...state.modals[type],
                  data: { ...state.modals[type].data, ...data },
                },
              },
            }),
            false,
            `ui/updateModalData/${type}`
          ),
        
        updateModalContext: (type: ModalType, context: Record<string, any>) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                [type]: {
                  ...state.modals[type],
                  context: { ...state.modals[type].context, ...context },
                },
              },
            }),
            false,
            `ui/updateModalContext/${type}`
          ),
        
        closeAllModals: () =>
          set(
            { modals: initialModalStates },
            false,
            'ui/closeAllModals'
          ),
        
        // Loading
        setGlobalLoading: (loading: boolean, text?: string) =>
          set(
            { globalLoading: loading, loadingText: text },
            false,
            'ui/setGlobalLoading'
          ),
        
        addLoadingOperation: (operationId: string) =>
          set(
            (state) => ({
              loadingOperations: new Set([...state.loadingOperations, operationId]),
            }),
            false,
            'ui/addLoadingOperation'
          ),
        
        removeLoadingOperation: (operationId: string) =>
          set(
            (state) => {
              const newOperations = new Set(state.loadingOperations);
              newOperations.delete(operationId);
              return { loadingOperations: newOperations };
            },
            false,
            'ui/removeLoadingOperation'
          ),
        
        clearAllLoading: () =>
          set(
            { 
              globalLoading: false, 
              loadingOperations: new Set(), 
              loadingText: undefined 
            },
            false,
            'ui/clearAllLoading'
          ),
        
        // Notificaciones
        addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp'>) =>
          set(
            (state) => ({
              notifications: [
                ...state.notifications,
                {
                  ...notification,
                  id: `notification-${Date.now()}-${Math.random()}`,
                  timestamp: new Date(),
                },
              ],
            }),
            false,
            'ui/addNotification'
          ),
        
        removeNotification: (id: string) =>
          set(
            (state) => ({
              notifications: state.notifications.filter(n => n.id !== id),
            }),
            false,
            'ui/removeNotification'
          ),
        
        clearAllNotifications: () =>
          set(
            { notifications: [] },
            false,
            'ui/clearAllNotifications'
          ),
        
        // Preferencias
        updatePreferences: (updates: Partial<UIPreferences>) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, ...updates },
            }),
            false,
            'ui/updatePreferences'
          ),
        
        resetPreferences: () =>
          set(
            { preferences: defaultPreferences },
            false,
            'ui/resetPreferences'
          ),
        
        setTablePageSize: (size: number) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, tablePageSize: size },
            }),
            false,
            'ui/setTablePageSize'
          ),
        
        setTableCompactMode: (compact: boolean) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, tableCompactMode: compact },
            }),
            false,
            'ui/setTableCompactMode'
          ),
        
        setColumnWidth: (columnId: string, width: number) =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                columnWidths: {
                  ...state.preferences.columnWidths,
                  [columnId]: width,
                },
              },
            }),
            false,
            'ui/setColumnWidth'
          ),
        
        setColumnOrder: (order: string[]) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, columnOrder: order },
            }),
            false,
            'ui/setColumnOrder'
          ),
        
        setTheme: (theme: 'light' | 'dark' | 'auto') =>
          set(
            (state) => ({
              preferences: { ...state.preferences, theme },
            }),
            false,
            'ui/setTheme'
          ),
        
        setSidebarCollapsed: (collapsed: boolean) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, sidebarCollapsed: collapsed },
            }),
            false,
            'ui/setSidebarCollapsed'
          ),
        
        setFiltersExpanded: (expanded: boolean) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, filtersExpanded: expanded },
            }),
            false,
            'ui/setFiltersExpanded'
          ),
        
        setKpiExpanded: (expanded: boolean) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, kpiExpanded: expanded },
            }),
            false,
            'ui/setKpiExpanded'
          ),
        
        // Interacciones
        setDragging: (isDragging: boolean, data?: any) =>
          set(
            { isDragging, dragData: isDragging ? data : undefined },
            false,
            'ui/setDragging'
          ),
        
        setHoveredEvent: (eventId?: string) =>
          set(
            { hoveredEvent: eventId },
            false,
            'ui/setHoveredEvent'
          ),
        
        setFocusedEvent: (eventId?: string) =>
          set(
            { focusedEvent: eventId },
            false,
            'ui/setFocusedEvent'
          ),
        
        // Responsive
        setDeviceType: (isMobile: boolean, isTablet: boolean) =>
          set(
            { isMobile, isTablet },
            false,
            'ui/setDeviceType'
          ),
        
        // Comandos
        toggleCommandPalette: () =>
          set(
            (state) => ({ commandPaletteOpen: !state.commandPaletteOpen }),
            false,
            'ui/toggleCommandPalette'
          ),
        
        setLastKeyCommand: (command: string) =>
          set(
            { lastKeyCommand: command },
            false,
            'ui/setLastKeyCommand'
          ),
        
        // Utilidades
        isModalOpen: (type: ModalType) => {
          const state = get();
          return state.modals[type]?.isOpen || false;
        },
        
        getModalData: (type: ModalType) => {
          const state = get();
          return state.modals[type]?.data;
        },
        
        getModalContext: (type: ModalType) => {
          const state = get();
          return state.modals[type]?.context || {};
        },
        
        hasLoadingOperations: () => {
          const state = get();
          return state.loadingOperations.size > 0;
        },
        
        getNotificationCount: () => {
          const state = get();
          return state.notifications.length;
        },
        
        // Reset
        reset: () =>
          set(
            {
              modals: initialModalStates,
              globalLoading: false,
              loadingOperations: new Set(),
              notifications: [],
              preferences: defaultPreferences,
              isDragging: false,
              dragData: undefined,
              hoveredEvent: undefined,
              focusedEvent: undefined,
              commandPaletteOpen: false,
              lastKeyCommand: undefined,
            },
            false,
            'ui/reset'
          ),
      }),
      {
        name: 'ui-store',
        // Solo persistir preferencias de usuario
        partialize: (state) => ({
          preferences: state.preferences,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);

// Selectores optimizados
export const useModals = () => useUIStore((state) => state.modals);
export const useModalState = (type: ModalType) => useUIStore((state) => state.modals[type]);
export const useGlobalLoading = () => useUIStore((state) => state.globalLoading);
export const useLoadingOperations = () => useUIStore((state) => state.loadingOperations);
export const useNotifications = () => useUIStore((state) => state.notifications);
export const useUIPreferences = () => useUIStore((state) => state.preferences);
export const useTablePreferences = () => useUIStore((state) => ({
  pageSize: state.preferences.tablePageSize,
  compactMode: state.preferences.tableCompactMode,
  showBorders: state.preferences.showTableBorders,
}));
export const useTheme = () => useUIStore((state) => state.preferences.theme);
export const useIsMobile = () => useUIStore((state) => state.isMobile);
export const useIsTablet = () => useUIStore((state) => state.isTablet);
export const useCommandPalette = () => useUIStore((state) => state.commandPaletteOpen);