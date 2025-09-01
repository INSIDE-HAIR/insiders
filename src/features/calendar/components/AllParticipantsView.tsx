"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GoogleCalendarEvent, ParticipantKPI } from "@/src/features/calendar/types";
import { ParticipantKPICard } from "./ParticipantKPICard";
import { useParticipantKPIStore } from "@/src/stores/participantKPIStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Spinner } from "@/src/components/ui/spinner";

interface AllParticipantsViewProps {
  events: GoogleCalendarEvent[];
  calendars: Array<{
    id: string;
    summary: string;
    colorId?: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
  activeCalendars: string[];
  timeRange: string;
}

export const AllParticipantsView: React.FC<AllParticipantsViewProps> = ({
  events,
  calendars,
  activeCalendars,
  timeRange,
}) => {
  const { kpis, fetchKPIs, isLoading, error } = useParticipantKPIStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'events' | 'acceptance' | 'response'>('events');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Extract all unique attendees from events
  const allAttendees = useMemo(() => {
    const attendeeMap = new Map<string, { email: string; displayName?: string; count: number }>();
    
    events.forEach(event => {
      if (event.attendees) {
        event.attendees.forEach(attendee => {
          if (attendee.email) {
            const existing = attendeeMap.get(attendee.email);
            if (existing) {
              existing.count++;
              if (!existing.displayName && attendee.displayName) {
                existing.displayName = attendee.displayName;
              }
            } else {
              attendeeMap.set(attendee.email, {
                email: attendee.email,
                displayName: attendee.displayName,
                count: 1
              });
            }
          }
        });
      }
    });

    return Array.from(attendeeMap.values());
  }, [events]);

  // Filter and sort attendees
  const filteredAndSortedAttendees = useMemo(() => {
    let filtered = allAttendees;
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = allAttendees.filter(attendee => 
        attendee.email.toLowerCase().includes(search) ||
        (attendee.displayName && attendee.displayName.toLowerCase().includes(search))
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let valueA: number | string, valueB: number | string;
      
      switch (sortBy) {
        case 'name':
          valueA = a.displayName || a.email;
          valueB = b.displayName || b.email;
          break;
        case 'events':
          valueA = a.count;
          valueB = b.count;
          break;
        case 'acceptance':
          valueA = kpis[a.email]?.participationRate || 0;
          valueB = kpis[b.email]?.participationRate || 0;
          break;
        case 'response':
          valueA = kpis[a.email]?.responseRate || 0;
          valueB = kpis[b.email]?.responseRate || 0;
          break;
        default:
          return 0;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortOrder === 'asc' 
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
  }, [allAttendees, searchTerm, sortBy, sortOrder, kpis]);

  // Load KPIs for all attendees when component mounts
  useEffect(() => {
    if (allAttendees.length > 0) {
      const emails = allAttendees.map(a => a.email);
      fetchKPIs(emails, {
        startDate: timeRange === 'upcoming' || timeRange === 'week' || timeRange === 'month' 
          ? new Date().toISOString()
          : timeRange === 'all' 
          ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        endDate: timeRange === 'week'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : timeRange === 'month'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : timeRange === 'today'
          ? new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
          : undefined,
        calendarIds: activeCalendars,
      });
    }
  }, [allAttendees, timeRange, activeCalendars, fetchKPIs]);

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-primary" />
            Análisis de Participantes
          </h2>
          <p className="text-muted-foreground mt-1">
            KPIs y métricas de todos los invitados en los eventos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {allAttendees.length} participantes
          </Badge>
          <Badge variant="outline">
            {events.length} eventos
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar participantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          {[
            { key: 'events', label: 'Eventos' },
            { key: 'name', label: 'Nombre' },
            { key: 'acceptance', label: 'Aceptación' },
            { key: 'response', label: 'Respuesta' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={sortBy === key ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSort(key as typeof sortBy)}
              className="text-xs"
            >
              {label}
              {sortBy === key && (
                <span className="ml-1">
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Spinner size="lg" />
            <span className="text-muted-foreground">Cargando KPIs de participantes...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          <p className="font-medium">Error al cargar KPIs</p>
          <p className="text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchKPIs(allAttendees.map(a => a.email))}
            className="mt-2"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Participants Grid */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedAttendees.map((attendee) => {
                const kpi = kpis[attendee.email];
                if (!kpi) return null;

                return (
                  <motion.div
                    key={attendee.email}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <ParticipantKPICard kpi={kpi} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary Stats */}
          {filteredAndSortedAttendees.length > 1 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <h4 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-primary" />
                Resumen General ({filteredAndSortedAttendees.length} participantes)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-md border border-border/50 text-center">
                  <span className="text-xs text-muted-foreground/80 font-medium block">Total Eventos</span>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {Object.values(kpis).reduce((sum, kpi) => sum + kpi.totalEvents, 0)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-md border border-border/50 text-center">
                  <span className="text-xs text-muted-foreground/80 font-medium block">Promedio Aceptación</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {Math.round(
                      Object.values(kpis).reduce((sum, kpi) => sum + kpi.participationRate, 0) / 
                      Object.values(kpis).length
                    )}%
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-md border border-border/50 text-center">
                  <span className="text-xs text-muted-foreground/80 font-medium block">Promedio Respuesta</span>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {Math.round(
                      Object.values(kpis).reduce((sum, kpi) => sum + kpi.responseRate, 0) / 
                      Object.values(kpis).length
                    )}%
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-md border border-border/50 text-center">
                  <span className="text-xs text-muted-foreground/80 font-medium block">Eventos Completados</span>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {Object.values(kpis).reduce((sum, kpi) => sum + kpi.completedEvents, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedAttendees.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No se encontraron participantes
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? `No hay participantes que coincidan con "${searchTerm}"`
                  : "No hay participantes en los eventos seleccionados"
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};