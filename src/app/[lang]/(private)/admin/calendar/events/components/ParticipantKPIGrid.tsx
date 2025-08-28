"use client";

import React, { useEffect, useMemo } from "react";
import { ParticipantKPICard } from "./ParticipantKPICard";
import { GoogleCalendarEvent, ParticipantKPI } from "@/src/features/calendar/types";
import { 
  useParticipantKPIStore, 
  useParticipantKPILoading,
  useParticipantKPIError 
} from "@/src/stores/participantKPIStore";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { 
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface ParticipantKPIGridProps {
  selectedAttendees: string[];
  events: GoogleCalendarEvent[];
  onRemoveAttendee: (email: string) => void;
  calendarIds?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export const ParticipantKPIGrid: React.FC<ParticipantKPIGridProps> = ({
  selectedAttendees,
  events,
  onRemoveAttendee,
  calendarIds,
  dateRange,
}) => {
  const { kpis, fetchKPIs, removeKPI } = useParticipantKPIStore();
  const isLoading = useParticipantKPILoading();
  const error = useParticipantKPIError();

  // Fetch KPIs when selected attendees change
  useEffect(() => {
    if (selectedAttendees.length === 0) {
      // Clear KPIs when no attendees selected
      Object.keys(kpis).forEach(email => removeKPI(email));
      return;
    }

    // Debounced fetch to avoid too many requests
    const timer = setTimeout(() => {
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
      .map(email => kpis[email])
      .filter((kpi): kpi is ParticipantKPI => Boolean(kpi));
  }, [selectedAttendees, kpis]);

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
      <div className="mb-6">
        <Alert className="bg-muted/50">
          <InformationCircleIcon className="h-4 w-4" />
          <AlertTitle>Sin participantes seleccionados</AlertTitle>
          <AlertDescription>
            Selecciona uno o más participantes del filtro para ver sus KPIs de asistencia y participación.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If error, show error state
  if (error && !isLoading) {
    return (
      <div className="mb-6">
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error al cargar KPIs</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="mt-2"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <UserGroupIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">KPIs de Participantes</h3>
            <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold">
              {selectedAttendees.length} seleccionado{selectedAttendees.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <ArrowPathIcon className="h-4 w-4 animate-spin text-primary" />
            <span className="font-medium">Cargando KPIs...</span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {isLoading && selectedAttendees.length > 0 ? (
            // Show skeletons while loading
            selectedAttendees.slice(0, 8).map((email) => (
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
                    needsActionEvents: 0,
                    completedEvents: 0,
                    upcomingEvents: 0,
                    participationRate: 0,
                    responseRate: 0,
                  }}
                  isLoading={true}
                />
              </motion.div>
            ))
          ) : (
            // Show actual KPI cards
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
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Show more button if there are many attendees */}
      {selectedAttendees.length > 8 && !isLoading && (
        <div className="text-center mt-4">
          <Alert className="bg-muted/50 inline-flex items-center justify-center">
            <AlertDescription>
              Mostrando {Math.min(8, selectedKPIs.length)} de {selectedAttendees.length} participantes.
              Para ver todos, considera reducir la selección.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Summary stats */}
      {selectedKPIs.length > 1 && !isLoading && (
        <div className="mt-6 p-5 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <h4 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-primary" />
            Resumen General
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-md border border-border/50 text-center">
              <span className="text-xs text-muted-foreground/80 font-medium block">Total Eventos</span>
              <p className="text-2xl font-bold text-primary mt-1">
                {selectedKPIs.reduce((sum, kpi) => sum + kpi.totalEvents, 0)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-md border border-border/50 text-center">
              <span className="text-xs text-muted-foreground/80 font-medium block">Promedio Participación</span>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {Math.round(
                  selectedKPIs.reduce((sum, kpi) => sum + kpi.participationRate, 0) / 
                  selectedKPIs.length
                )}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-md border border-border/50 text-center">
              <span className="text-xs text-muted-foreground/80 font-medium block">Promedio Respuesta</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {Math.round(
                  selectedKPIs.reduce((sum, kpi) => sum + kpi.responseRate, 0) / 
                  selectedKPIs.length
                )}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-md border border-border/50 text-center">
              <span className="text-xs text-muted-foreground/80 font-medium block">Eventos Completados</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {selectedKPIs.reduce((sum, kpi) => sum + kpi.completedEvents, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};