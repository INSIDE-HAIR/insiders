import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CalendarFiltersState {
  activeCalendars: string[];
  timeRange: "upcoming" | "today" | "week" | "month" | "all";
  search: string;
  viewMode: "table" | "list" | "json";
  visibleColumns: string[];
  attendeesFilter: string[];

  // Actions
  setActiveCalendars: (calendars: string[]) => void;
  toggleCalendar: (calendarId: string) => void;
  setTimeRange: (
    range: "upcoming" | "today" | "week" | "month" | "all"
  ) => void;
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
        // No persistir search para que siempre inicie vacío
      }),
    }
  )
);
