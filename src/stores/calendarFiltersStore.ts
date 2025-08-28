import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CalendarFiltersState {
  activeCalendars: string[];
  timeRange: "upcoming" | "today" | "week" | "month" | "all" | "custom";
  search: string;
  viewMode: "table" | "list" | "json";
  visibleColumns: string[];
  attendeesFilter: string[];
  customStartDate?: Date;
  customEndDate?: Date;

  // Actions
  setActiveCalendars: (calendars: string[]) => void;
  toggleCalendar: (calendarId: string) => void;
  setTimeRange: (
    range: "upcoming" | "today" | "week" | "month" | "all" | "custom"
  ) => void;
  setCustomDateRange: (startDate?: Date, endDate?: Date) => void;
  setSearch: (search: string) => void;
  setViewMode: (mode: "table" | "list" | "json") => void;
  initializeCalendars: (allCalendars: string[]) => void;
  setColumnVisibility: (columnId: string, visible: boolean) => void;
  setAttendeesFilter: (attendees: string[]) => void;
  resetFilters: () => void;
}

export const useCalendarFiltersStore = create<CalendarFiltersState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeCalendars: [],
      timeRange: "all",
      search: "",
      viewMode: "table",
      customStartDate: undefined,
      customEndDate: undefined,
      visibleColumns: [
        "summary",
        "start",
        "end",
        "status",
        "calendar",
        "location",
        "attendees",
        "description",
        "created",
        "updated",
        "creator",
        "organizer",
        "visibility",
        "transparency",
        "sequence",
        "recurringEventId",
        "recurrence",
        "originalStartTime",
        "iCalUID",
        "htmlLink",
        "hangoutLink",
        "conferenceData",
        "meetingId",
        "meetingCode",
        "meetingPhone",
        "meetingNotes",
        "anyoneCanAddSelf",
        "guestsCanInviteOthers",
        "guestsCanModify",
        "guestsCanSeeOtherGuests",
        "privateCopy",
        "locked",
        "source",
        "colorId",
        "eventType",
      ], // All available columns by default
      attendeesFilter: [],

      // Actions
      setActiveCalendars: (calendars) => set({ activeCalendars: calendars }),

      toggleCalendar: (calendarId) =>
        set((state) => ({
          activeCalendars: state.activeCalendars.includes(calendarId)
            ? state.activeCalendars.filter((id) => id !== calendarId)
            : [...state.activeCalendars, calendarId],
        })),

      setTimeRange: (range) => set({ timeRange: range }),

      setCustomDateRange: (startDate, endDate) => 
        set({ 
          customStartDate: startDate instanceof Date ? startDate : startDate ? new Date(startDate) : undefined, 
          customEndDate: endDate instanceof Date ? endDate : endDate ? new Date(endDate) : undefined 
        }),

      setSearch: (search) => set({ search }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setColumnVisibility: (columnId, visible) => {
        set((state) => ({
          visibleColumns: visible
            ? [...state.visibleColumns, columnId]
            : state.visibleColumns.filter((id) => id !== columnId),
        }));
      },

      setAttendeesFilter: (attendees) => set({ attendeesFilter: attendees }),

      initializeCalendars: (allCalendars) => {
        const currentActive = get().activeCalendars;
        // Si no hay calendarios activos guardados, activar todos por defecto
        if (currentActive.length === 0) {
          set({ activeCalendars: allCalendars });
        } else {
          // Mantener solo los calendarios que aún existen
          const validCalendars = currentActive.filter((id) =>
            allCalendars.includes(id)
          );
          // Si todos los calendarios guardados ya no existen, activar todos
          if (validCalendars.length === 0) {
            set({ activeCalendars: allCalendars });
          } else {
            set({ activeCalendars: validCalendars });
          }
        }
      },

      resetFilters: () => {
        // Limpiar localStorage para forzar valores por defecto
        localStorage.removeItem("calendar-filters-storage");
        set({
          activeCalendars: [],
          timeRange: "all",
          search: "",
          viewMode: "table",
          customStartDate: undefined,
          customEndDate: undefined,
          visibleColumns: [
            "summary",
            "start",
            "end",
            "status",
            "calendar",
            "location",
            "attendees",
            "description",
            "created",
            "updated",
            "creator",
            "organizer",
            "visibility",
            "transparency",
            "sequence",
            "recurringEventId",
            "recurrence",
            "originalStartTime",
            "iCalUID",
            "htmlLink",
            "hangoutLink",
            "conferenceData",
            "meetingId",
            "meetingCode",
            "meetingPhone",
            "meetingNotes",
            "anyoneCanAddSelf",
            "guestsCanInviteOthers",
            "guestsCanModify",
            "guestsCanSeeOtherGuests",
            "privateCopy",
            "locked",
            "source",
            "colorId",
            "eventType",
          ],
          attendeesFilter: [],
        });
      },
    }),
    {
      name: "calendar-filters-storage",
      partialize: (state) => ({
        activeCalendars: state.activeCalendars,
        timeRange: state.timeRange,
        viewMode: state.viewMode,
        visibleColumns: state.visibleColumns,
        attendeesFilter: state.attendeesFilter,
        customStartDate: state.customStartDate,
        customEndDate: state.customEndDate,
        // No persistir search para que siempre inicie vacío
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert string dates back to Date objects after hydration
          try {
            if (state.customStartDate && typeof state.customStartDate === 'string') {
              const startDate = new Date(state.customStartDate);
              state.customStartDate = isNaN(startDate.getTime()) ? undefined : startDate;
            }
            if (state.customEndDate && typeof state.customEndDate === 'string') {
              const endDate = new Date(state.customEndDate);
              state.customEndDate = isNaN(endDate.getTime()) ? undefined : endDate;
            }
            // Validate existing Date objects
            if (state.customStartDate instanceof Date && isNaN(state.customStartDate.getTime())) {
              state.customStartDate = undefined;
            }
            if (state.customEndDate instanceof Date && isNaN(state.customEndDate.getTime())) {
              state.customEndDate = undefined;
            }
          } catch (error) {
            // If there's any error with date parsing, clear the custom dates
            console.warn('Error parsing custom dates from localStorage:', error);
            state.customStartDate = undefined;
            state.customEndDate = undefined;
          }
        }
      },
    }
  )
);
