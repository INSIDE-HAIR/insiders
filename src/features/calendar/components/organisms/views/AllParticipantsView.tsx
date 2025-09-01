/**
 * AllParticipantsView - Organism Component
 * 
 * Vista completa de participantes IDÉNTICA al original AllParticipantsView.tsx
 * + Estado de loading con skeleton
 * Usa ParticipantCard molecular ya migrado
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GoogleCalendarEvent, ParticipantKPI } from "@/src/features/calendar/types";
import { ParticipantCard } from "../../molecules/cards/ParticipantCard";
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

// Atoms
import { SearchInput } from "../../atoms/inputs/SearchInput";

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

  // Extract all unique attendees from events - copiado exacto líneas 44-70
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

  // Filter and sort attendees - copiado exacto líneas 73-120
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

  // Load KPIs for all attendees when component mounts - copiado exacto líneas 123-142
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
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Todos los Participantes</h2>
            <Badge variant="secondary" className="ml-2">
              {allAttendees.length} {allAttendees.length === 1 ? 'participante' : 'participantes'}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nombre o email..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('name')}
            >
              Nombre {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant={sortBy === 'events' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('events')}
            >
              Eventos {sortBy === 'events' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant={sortBy === 'acceptance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('acceptance')}
            >
              Aceptación {sortBy === 'acceptance' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant={sortBy === 'response' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('response')}
            >
              Respuesta {sortBy === 'response' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8 text-primary" />
            <span className="ml-3 text-muted-foreground">Cargando KPIs...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive mb-2">Error al cargar KPIs</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        ) : filteredAndSortedAttendees.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <div className="text-muted-foreground">
              {searchTerm ? 'No se encontraron participantes' : 'No hay participantes para mostrar'}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedAttendees.map((attendee, index) => {
                const kpi = kpis[attendee.email] || {
                  email: attendee.email,
                  displayName: attendee.displayName,
                  totalEvents: attendee.count,
                  acceptedEvents: 0,
                  declinedEvents: 0,
                  needsActionEvents: 0,
                  completedEvents: 0,
                  upcomingEvents: 0,
                  totalDurationMinutes: 0,
                  acceptedDurationMinutes: 0,
                  declinedDurationMinutes: 0,
                  needsActionDurationMinutes: 0,
                  completedDurationMinutes: 0,
                  upcomingDurationMinutes: 0,
                  participationRate: 0,
                  responseRate: 0,
                } as ParticipantKPI;

                return (
                  <motion.div
                    key={attendee.email}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <ParticipantCard
                      kpi={kpi}
                      isLoading={isLoading}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

AllParticipantsView.displayName = "AllParticipantsView";