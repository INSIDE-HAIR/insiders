/**
 * ParticipantKPIGrid - Organism Component
 *
 * Grid de KPIs de participantes usando Card y Alert de shadcn
 * Migrado desde el componente original manteniendo estética IDÉNTICA
 */

"use client";

import React, { useEffect, useMemo } from "react";
import { ParticipantKPICard } from "../../molecules/cards/ParticipantKPICard";
import {
  GoogleCalendarEvent,
  ParticipantKPI,
} from "@/src/features/calendar/types";
import {
  useParticipantKPIStore,
  useParticipantKPILoading,
  useParticipantKPIError,
} from "@/src/stores/participantKPIStore";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { formatMinutesToHHMM } from "@/src/lib/utils/time";
import { cn } from "@/src/lib/utils";

interface ParticipantKPIGridProps {
  selectedAttendees: string[];
  events: GoogleCalendarEvent[];
  onRemoveAttendee: (email: string) => void;
  calendarIds?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  className?: string;
  showSummary?: boolean;
  maxDisplay?: number;
}

export const ParticipantKPIGrid: React.FC<ParticipantKPIGridProps> = ({
  selectedAttendees,
  events,
  onRemoveAttendee,
  calendarIds,
  dateRange,
  className,
  showSummary = true,
  maxDisplay = 8,
}) => {
  const { kpis, fetchKPIs, removeKPI } = useParticipantKPIStore();
  const isLoading = useParticipantKPILoading();
  const error = useParticipantKPIError();

  // Fetch KPIs when selected attendees change
  useEffect(() => {
    console.log("🔄 [KPI DEBUG] useEffect ejecutado", {
      selectedAttendeesLength: selectedAttendees.length,
      dateRange,
      calendarIds,
    });

    if (selectedAttendees.length === 0) {
      // Clear KPIs when no attendees selected
      Object.keys(kpis).forEach((email) => removeKPI(email));
      return;
    }

    // Create a cache key to avoid duplicate requests
    const cacheKey = JSON.stringify({
      emails: selectedAttendees.sort(),
      start: dateRange?.start,
      end: dateRange?.end,
      calendars: calendarIds?.sort(),
    });

    // Check if we already have this exact request
    const lastRequest = (fetchKPIs as any).lastCacheKey;
    if (lastRequest === cacheKey) {
      console.log("🔄 [KPI DEBUG] Request identical to previous one, skipping");
      return;
    }

    // Debounced fetch to avoid too many requests
    const timer = setTimeout(() => {
      console.log("📡 [KPI DEBUG] Llamando fetchKPIs");
      (fetchKPIs as any).lastCacheKey = cacheKey;
      fetchKPIs(selectedAttendees, {
        startDate: dateRange?.start,
        endDate: dateRange?.end,
        calendarIds,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedAttendees, dateRange?.start, dateRange?.end, calendarIds]);

  // Get KPIs for selected attendees
  const selectedKPIs = useMemo(() => {
    return selectedAttendees
      .map((email) => kpis[email])
      .filter((kpi): kpi is ParticipantKPI => Boolean(kpi));
  }, [selectedAttendees, kpis]);

  // Calculate unique session-based KPIs
  const uniqueSessionKPIs = useMemo(() => {
    console.log("🧮 [KPI DEBUG] Calculando uniqueSessionKPIs", {
      selectedKPIsLength: selectedKPIs.length,
      eventsLength: events.length,
      selectedAttendeesLength: selectedAttendees.length,
    });

    if (selectedKPIs.length === 0 || events.length === 0) {
      return {
        totalUniqueSessions: 0,
        avgAcceptanceRate: 0,
        avgResponseRate: 0,
        completedUniqueSessions: 0,
        totalDurationMinutes: 0,
      };
    }

    // Create a map of unique events based on event ID
    const uniqueEventsMap = new Map<string, GoogleCalendarEvent>();
    events.forEach((event) => {
      if (event.id && !uniqueEventsMap.has(event.id)) {
        uniqueEventsMap.set(event.id, event);
      }
    });

    const uniqueEvents = Array.from(uniqueEventsMap.values());
    const totalUniqueSessions = uniqueEvents.length;

    // Filter events that have selected attendees
    const relevantEvents = uniqueEvents.filter((event) =>
      event.attendees?.some((attendee) =>
        selectedAttendees.includes(attendee.email)
      )
    );

    if (relevantEvents.length === 0) {
      return {
        totalUniqueSessions: 0,
        avgAcceptanceRate: 0,
        avgResponseRate: 0,
        completedUniqueSessions: 0,
        totalDurationMinutes: 0,
      };
    }

    // Helper function to calculate event duration in minutes
    const calculateEventDuration = (event: GoogleCalendarEvent): number => {
      try {
        let startTime: Date;
        let endTime: Date;

        // Get start time
        if (event.start?.dateTime) {
          startTime = new Date(event.start.dateTime);
        } else if (event.start?.date) {
          startTime = new Date(event.start.date);
          startTime.setHours(0, 0, 0, 0);
        } else {
          return 0;
        }

        // Get end time
        if (event.end?.dateTime) {
          endTime = new Date(event.end.dateTime);
        } else if (event.end?.date) {
          endTime = new Date(event.end.date);
          endTime.setHours(23, 59, 59, 999);
        } else {
          // Default to 1 hour if no end time
          endTime = new Date(startTime);
          endTime.setHours(startTime.getHours() + 1);
        }

        const durationMs = endTime.getTime() - startTime.getTime();
        return Math.max(0, Math.round(durationMs / (1000 * 60)));
      } catch (error) {
        return 0;
      }
    };

    // Calculate acceptance and response rates per session
    let totalAcceptanceRate = 0;
    let totalResponseRate = 0;
    let completedUniqueSessions = 0;
    let totalDurationMinutes = 0;

    relevantEvents.forEach((event) => {
      const selectedAttendeesInEvent =
        event.attendees?.filter((attendee) =>
          selectedAttendees.includes(attendee.email)
        ) || [];

      if (selectedAttendeesInEvent.length > 0) {
        const acceptedCount = selectedAttendeesInEvent.filter(
          (a) => a.responseStatus === "accepted"
        ).length;
        const respondedCount = selectedAttendeesInEvent.filter(
          (a) => a.responseStatus !== "needsAction"
        ).length;

        const sessionAcceptanceRate =
          (acceptedCount / selectedAttendeesInEvent.length) * 100;
        const sessionResponseRate =
          (respondedCount / selectedAttendeesInEvent.length) * 100;

        totalAcceptanceRate += sessionAcceptanceRate;
        totalResponseRate += sessionResponseRate;

        // Check if session is completed (past event)
        const eventTime = event.start.dateTime || event.start.date;
        if (eventTime && new Date(eventTime) < new Date()) {
          completedUniqueSessions++;
        }
      }

      // Calculate duration for this event and add to total
      totalDurationMinutes += calculateEventDuration(event);
    });

    const result = {
      totalUniqueSessions: relevantEvents.length,
      avgAcceptanceRate: Math.round(
        totalAcceptanceRate / relevantEvents.length
      ),
      avgResponseRate: Math.round(totalResponseRate / relevantEvents.length),
      completedUniqueSessions,
      totalDurationMinutes,
    };

    console.log("✅ [KPI DEBUG] uniqueSessionKPIs calculado:", result);
    return result;
  }, [selectedKPIs, events, selectedAttendees]);

  // Handle remove attendee
  const handleRemoveAttendee = (email: string) => {
    removeKPI(email);
    onRemoveAttendee(email);
  };

  // Handle retry
  const handleRetry = () => {
    fetchKPIs(selectedAttendees, {
      startDate: dateRange?.start,
      endDate: dateRange?.end,
      calendarIds,
    });
  };

  // If no attendees selected, show empty state
  if (selectedAttendees.length === 0) {
    return (
      <div className={cn("mb-6", className)}>
        <Alert className='bg-muted/50'>
          <InformationCircleIcon className='h-4 w-4' />
          <AlertTitle>Sin participantes seleccionados</AlertTitle>
          <AlertDescription>
            Selecciona uno o más participantes del filtro para ver sus KPIs de
            asistencia y participación.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If error, show error state
  if (error && !isLoading) {
    return (
      <div className={cn("mb-6", className)}>
        <Alert variant='destructive'>
          <ExclamationTriangleIcon className='h-4 w-4' />
          <AlertTitle>Error al cargar KPIs</AlertTitle>
          <AlertDescription className='space-y-2'>
            <p>{error}</p>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRetry}
              className='mt-2'
            >
              <ArrowPathIcon className='h-4 w-4 mr-2' />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("mb-6 space-y-4", className)}>
      {/* Header */}
      <div className='flex items-center justify-between bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30'>
            <UserGroupIcon className='h-5 w-5 text-primary' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-foreground'>
              KPIs de Participantes
            </h3>
            <Badge className='bg-primary/10 text-primary border border-primary/20 font-semibold'>
              {selectedAttendees.length} seleccionado
              {selectedAttendees.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {isLoading && (
          <div className='flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20'>
            <ArrowPathIcon className='h-4 w-4 animate-spin text-primary' />
            <span className='font-medium'>Cargando KPIs...</span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 [&>*]:min-w-[300px]'>
        <AnimatePresence mode='popLayout'>
          {isLoading && selectedAttendees.length > 0
            ? // Show skeletons while loading
              selectedAttendees.slice(0, maxDisplay).map((email) => (
                <motion.div
                  key={`skeleton-${email}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ParticipantKPICard
                    kpi={{
                      email,
                      totalEvents: 0,
                      acceptedEvents: 0,
                      declinedEvents: 0,
                      tentativeEvents: 0,
                      needsActionEvents: 0,
                      completedEvents: 0,
                      upcomingEvents: 0,
                      totalDurationMinutes: 0,
                      acceptedDurationMinutes: 0,
                      declinedDurationMinutes: 0,
                      tentativeDurationMinutes: 0,
                      needsActionDurationMinutes: 0,
                      completedDurationMinutes: 0,
                      upcomingDurationMinutes: 0,
                      participationRate: 0,
                      responseRate: 0,
                    }}
                    isLoading={true}
                  />
                </motion.div>
              ))
            : // Show actual KPI cards
              selectedKPIs.map((kpi) => (
                <motion.div
                  key={kpi.email}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <ParticipantKPICard
                    kpi={kpi}
                    onRemove={handleRemoveAttendee}
                  />
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      {/* Show more button if there are many attendees */}
      {selectedAttendees.length > maxDisplay && !isLoading && (
        <div className='text-center mt-4'>
          <Alert className='bg-muted/50 inline-flex items-center justify-center'>
            <AlertDescription>
              Mostrando {Math.min(maxDisplay, selectedKPIs.length)} de{" "}
              {selectedAttendees.length} participantes. Para ver todos,
              considera reducir la selección.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Summary stats - Based on unique sessions */}
      {showSummary && selectedKPIs.length > 1 && !isLoading && (
        <div className='mt-6'>
          <div className='flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20 mb-4'>
            <div className='flex items-center gap-3'>
              <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30'>
                <ChartBarIcon className='h-5 w-5 text-primary' />
              </div>
              <div>
                <h4 className='text-lg font-bold text-foreground'>
                  Resumen General
                </h4>
                <p className='text-xs text-muted-foreground/80'>
                  KPIs basados en sesiones únicas
                </p>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
            {/* Total Unique Sessions Card */}
            <div className='bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <CalendarIcon className='h-4 w-4 text-primary' />
                  <span className='text-xs font-semibold text-foreground/90'>
                    Sesiones Únicas
                  </span>
                </div>
              </div>
              <div className='rounded-full border px-3 py-1 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/20 bg-primary/10 text-primary border-primary/30 text-lg flex items-center justify-center'>
                {uniqueSessionKPIs.totalUniqueSessions}
              </div>
            </div>

            {/* Average Acceptance Rate Card */}
            <div className='bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-xs font-semibold text-foreground/90'>
                    Prom. Aceptación
                  </span>
                </div>
              </div>
              <div className='rounded-full border px-3 py-1 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/20 bg-primary/10 text-primary border-primary/30 text-lg flex items-center justify-center'>
                {uniqueSessionKPIs.avgAcceptanceRate}%
              </div>
            </div>

            {/* Average Response Rate Card */}
            <div className='bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <ChartBarIcon className='h-4 w-4 text-primary' />
                  <span className='text-xs font-semibold text-foreground/90'>
                    Prom. Respuesta
                  </span>
                </div>
              </div>
              <div className='rounded-full border px-3 py-1 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/20 bg-primary/10 text-primary border-primary/30 text-lg flex items-center justify-center'>
                {uniqueSessionKPIs.avgResponseRate}%
              </div>
            </div>

            {/* Completed Unique Sessions Card */}
            <div className='bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-xs font-semibold text-foreground/90'>
                    Sesiones Completadas
                  </span>
                </div>
              </div>
              <div className='rounded-full border px-3 py-1 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/20 bg-primary/10 text-primary border-primary/30 text-lg flex items-center justify-center'>
                {uniqueSessionKPIs.completedUniqueSessions}
              </div>
            </div>

            {/* Total Duration Card */}
            <div className='bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <ClockIcon className='h-4 w-4 text-primary' />
                  <span className='text-xs font-semibold text-foreground/90'>
                    Duración Total
                  </span>
                </div>
              </div>
              <div className='rounded-full border px-3 py-1 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/20 bg-primary/10 text-primary border-primary/30 text-lg flex items-center justify-center'>
                {formatMinutesToHHMM(uniqueSessionKPIs.totalDurationMinutes)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Loading skeleton
export const ParticipantKPIGridSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn("mb-6 space-y-4 animate-pulse", className)}>
    {/* Header Skeleton */}
    <div className='flex items-center justify-between bg-muted/30 p-4 rounded-lg border'>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-8 w-8 rounded-full' />
        <div>
          <Skeleton className='h-5 w-32 mb-1' />
          <Skeleton className='h-4 w-24' />
        </div>
      </div>
      <Skeleton className='h-6 w-32' />
    </div>

    {/* Cards Grid Skeleton */}
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 [&>*]:min-w-[300px]'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='bg-muted/30 p-4 rounded-lg border'>
          <div className='flex items-center gap-3 mb-4'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <div>
              <Skeleton className='h-4 w-24 mb-1' />
              <Skeleton className='h-3 w-32' />
            </div>
          </div>
          <div className='space-y-3'>
            <Skeleton className='h-8 w-full' />
            <Skeleton className='h-8 w-full' />
            <Skeleton className='h-12 w-full' />
          </div>
        </div>
      ))}
    </div>
  </div>
);

ParticipantKPIGrid.displayName = "ParticipantKPIGrid";
