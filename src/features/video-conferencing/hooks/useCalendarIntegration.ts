/**
 * Custom hooks for calendar integration functionality
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CalendarProvider {
  id: string;
  name: string;
  type: "google" | "outlook" | "apple" | "generic";
  isConnected: boolean;
  lastSync?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  attendees: string[];
  isAddedToCalendar: boolean;
  calendarProvider?: string;
  reminderMinutes?: number[];
}

export interface CalendarIntegrationSettings {
  defaultReminders: number[]; // minutes before event
  autoSync: boolean;
  preferredProvider: string;
  timeZone: string;
}

// API functions (these would be implemented in your API layer)
const calendarApi = {
  getProviders: async (): Promise<CalendarProvider[]> => {
    const response = await fetch("/api/calendar/providers");
    if (!response.ok) throw new Error("Failed to fetch calendar providers");
    return response.json();
  },

  connectProvider: async (
    providerId: string,
    authCode: string
  ): Promise<CalendarProvider> => {
    const response = await fetch("/api/calendar/providers/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, authCode }),
    });
    if (!response.ok) throw new Error("Failed to connect calendar provider");
    return response.json();
  },

  disconnectProvider: async (providerId: string): Promise<void> => {
    const response = await fetch(
      `/api/calendar/providers/${providerId}/disconnect`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to disconnect calendar provider");
  },

  createEvent: async (
    event: Omit<CalendarEvent, "id" | "isAddedToCalendar">
  ): Promise<CalendarEvent> => {
    const response = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error("Failed to create calendar event");
    return response.json();
  },

  updateEvent: async (
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> => {
    const response = await fetch(`/api/calendar/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update calendar event");
    return response.json();
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    const response = await fetch(`/api/calendar/events/${eventId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete calendar event");
  },

  getSettings: async (): Promise<CalendarIntegrationSettings> => {
    const response = await fetch("/api/calendar/settings");
    if (!response.ok) throw new Error("Failed to fetch calendar settings");
    return response.json();
  },

  updateSettings: async (
    settings: Partial<CalendarIntegrationSettings>
  ): Promise<CalendarIntegrationSettings> => {
    const response = await fetch("/api/calendar/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error("Failed to update calendar settings");
    return response.json();
  },

  exportEvents: async (
    eventIds: string[],
    format: "ics" | "csv"
  ): Promise<Blob> => {
    const response = await fetch("/api/calendar/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventIds, format }),
    });
    if (!response.ok) throw new Error("Failed to export calendar events");
    return response.blob();
  },
};

/**
 * Hook for managing calendar providers
 */
export function useCalendarProviders() {
  const {
    data: providers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["calendar-providers"],
    queryFn: calendarApi.getProviders,
  });

  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: ({
      providerId,
      authCode,
    }: {
      providerId: string;
      authCode: string;
    }) => calendarApi.connectProvider(providerId, authCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-providers"] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: calendarApi.disconnectProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-providers"] });
    },
  });

  const connectProvider = useCallback(
    (providerId: string, authCode: string) => {
      return connectMutation.mutateAsync({ providerId, authCode });
    },
    [connectMutation]
  );

  const disconnectProvider = useCallback(
    (providerId: string) => {
      return disconnectMutation.mutateAsync(providerId);
    },
    [disconnectMutation]
  );

  const connectedProviders = providers.filter((p) => p.isConnected);
  const availableProviders = providers.filter((p) => !p.isConnected);

  return {
    providers,
    connectedProviders,
    availableProviders,
    isLoading,
    error,
    refetch,
    connectProvider,
    disconnectProvider,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    connectionError: connectMutation.error,
    disconnectionError: disconnectMutation.error,
  };
}

/**
 * Hook for managing calendar events
 */
export function useCalendarEvents() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: calendarApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      eventId,
      updates,
    }: {
      eventId: string;
      updates: Partial<CalendarEvent>;
    }) => calendarApi.updateEvent(eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: calendarApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  const createEvent = useCallback(
    (event: Omit<CalendarEvent, "id" | "isAddedToCalendar">) => {
      return createMutation.mutateAsync(event);
    },
    [createMutation]
  );

  const updateEvent = useCallback(
    (eventId: string, updates: Partial<CalendarEvent>) => {
      return updateMutation.mutateAsync({ eventId, updates });
    },
    [updateMutation]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      return deleteMutation.mutateAsync(eventId);
    },
    [deleteMutation]
  );

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}

/**
 * Hook for calendar integration settings
 */
export function useCalendarSettings() {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["calendar-settings"],
    queryFn: calendarApi.getSettings,
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: calendarApi.updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(["calendar-settings"], updatedSettings);
    },
  });

  const updateSettings = useCallback(
    (updates: Partial<CalendarIntegrationSettings>) => {
      return updateMutation.mutateAsync(updates);
    },
    [updateMutation]
  );

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}

/**
 * Hook for copying calendar data to clipboard
 */
export function useCalendarClipboard() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = useCallback(
    async (text: string, fieldName: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
        return true;
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        return false;
      }
    },
    []
  );

  const copyEventDetails = useCallback(
    async (event: CalendarEvent) => {
      const details = [
        `Title: ${event.title}`,
        `Date: ${event.startTime.toLocaleDateString()}`,
        `Time: ${event.startTime.toLocaleTimeString()} - ${event.endTime.toLocaleTimeString()}`,
        `Location: ${event.location}`,
        event.description && `Description: ${event.description}`,
        event.attendees.length > 0 &&
          `Attendees: ${event.attendees.join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n");

      return copyToClipboard(details, "event-details");
    },
    [copyToClipboard]
  );

  return {
    copiedField,
    copyToClipboard,
    copyEventDetails,
  };
}

/**
 * Hook for exporting calendar events
 */
export function useCalendarExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportEvents = useCallback(
    async (eventIds: string[], format: "ics" | "csv") => {
      setIsExporting(true);
      setExportError(null);

      try {
        const blob = await calendarApi.exportEvents(eventIds, format);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `calendar-events.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        setExportError(
          error instanceof Error ? error.message : "Export failed"
        );
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    exportEvents,
    isExporting,
    exportError,
  };
}

/**
 * Hook for generating calendar URLs
 */
export function useCalendarUrls() {
  const generateGoogleCalendarUrl = useCallback((event: CalendarEvent) => {
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${formatDateForGoogle(event.startTime)}/${formatDateForGoogle(event.endTime)}`,
      details: event.description,
      location: event.location,
      add: event.attendees.join(","),
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, []);

  const generateOutlookUrl = useCallback((event: CalendarEvent) => {
    const params = new URLSearchParams({
      subject: event.title,
      startdt: event.startTime.toISOString(),
      enddt: event.endTime.toISOString(),
      body: event.description,
      location: event.location,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }, []);

  const generateICSContent = useCallback((event: CalendarEvent) => {
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const escapeICSText = (text: string) => {
      return text
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Video Conferencing Platform//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@videoconferencing.platform`,
      `DTSTART:${formatICSDate(event.startTime)}`,
      `DTEND:${formatICSDate(event.endTime)}`,
      `SUMMARY:${escapeICSText(event.title)}`,
      `DESCRIPTION:${escapeICSText(event.description)}`,
      `LOCATION:${escapeICSText(event.location)}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    return icsContent.join("\r\n");
  }, []);

  const downloadICSFile = useCallback(
    (event: CalendarEvent) => {
      const icsContent = generateICSContent(event);
      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    [generateICSContent]
  );

  return {
    generateGoogleCalendarUrl,
    generateOutlookUrl,
    generateICSContent,
    downloadICSFile,
  };
}

/**
 * Hook for tracking calendar event status
 */
export function useCalendarTracking() {
  const [trackedEvents, setTrackedEvents] = useState<Set<string>>(new Set());

  // Load tracked events from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("calendar-tracked-events");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTrackedEvents(new Set(parsed));
      } catch (error) {
        console.error(
          "Failed to parse tracked events from localStorage:",
          error
        );
      }
    }
  }, []);

  // Save tracked events to localStorage when changed
  useEffect(() => {
    localStorage.setItem(
      "calendar-tracked-events",
      JSON.stringify(Array.from(trackedEvents))
    );
  }, [trackedEvents]);

  const trackEvent = useCallback((eventId: string) => {
    setTrackedEvents((prev) => new Set([...prev, eventId]));
  }, []);

  const untrackEvent = useCallback((eventId: string) => {
    setTrackedEvents((prev) => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  }, []);

  const isTracked = useCallback(
    (eventId: string) => {
      return trackedEvents.has(eventId);
    },
    [trackedEvents]
  );

  const toggleTracking = useCallback(
    (eventId: string) => {
      if (trackedEvents.has(eventId)) {
        untrackEvent(eventId);
      } else {
        trackEvent(eventId);
      }
    },
    [trackedEvents, trackEvent, untrackEvent]
  );

  return {
    trackedEvents: Array.from(trackedEvents),
    trackEvent,
    untrackEvent,
    isTracked,
    toggleTracking,
  };
}
