/**
 * Calendar Stores - Estado Global
 * 
 * Stores Zustand para gestión de estado global del módulo Calendar
 * Implementan patrones de estado persistente y optimizado
 */

// Calendar Management
export * from './useCalendarStore';
export {
  useCalendars,
  useSelectedCalendars,
  useCalendarLoading,
  useCalendarError,
  useCalendarById,
  useSelectedCalendarsData,
} from './useCalendarStore';

// Events Management
export * from './useEventsStore';
export {
  useAllEvents,
  useFilteredEvents,
  useSelectedEvents,
  useEventsLoading,
  useEventsError,
  useEventsMetrics,
  useEventById,
  useEventsByCalendar,
} from './useEventsStore';

// Filters Management
export * from './useFiltersStore';
export {
  useSearchTerm,
  useSelectedCalendarIds,
  useDateRange,
  useActiveFilters,
  useHasActiveFilters,
  useActiveFilterCount,
  useIsAdvancedMode,
  useSavedFilters,
} from './useFiltersStore';

// UI Management
export * from './useUIStore';
export {
  useModals,
  useModalState,
  useGlobalLoading,
  useLoadingOperations,
  useNotifications,
  useUIPreferences,
  useTablePreferences,
  useTheme,
  useIsMobile,
  useIsTablet,
  useCommandPalette,
} from './useUIStore';