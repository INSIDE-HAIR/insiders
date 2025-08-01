"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { Icons } from "@/src/components/shared/icons";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface ConsultantSession {
  consultantEmail: string;
  consultantName: string;
  totalSessions: number;
  totalHours: number;
  acceptedSessions: number;
  sessions: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    duration: number; // in minutes
    status: 'accepted' | 'declined' | 'tentative' | 'needsAction';
    attendees: number;
  }[];
}

interface ConsultantWorkloadWidgetProps {
  className?: string;
}

interface WorkloadSummary {
  totalConsultants: number;
  totalSessions: number;
  totalHours: number;
  avgHoursPerConsultant: number;
  totalPendingSessions: number;
  totalDeclinedSessions: number;
  totalTentativeSessions: number;
}

export const ConsultantWorkloadWidget: React.FC<ConsultantWorkloadWidgetProps> = ({ 
  className = "" 
}) => {
  // State for date range (default: next 30 days)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    futureDate.setHours(23, 59, 59, 999);
    return futureDate.toISOString().split('T')[0];
  });

  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<Array<{ 
    id: string; 
    summary: string; 
    colorId?: string; 
    backgroundColor?: string; 
    foregroundColor?: string; 
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workloadSummary, setWorkloadSummary] = useState<WorkloadSummary | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');

  // Load workload data using optimized endpoint
  const loadWorkloadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate,
        endDate
      });

      if (selectedConsultant) {
        params.append('consultantFilter', selectedConsultant);
      }

      const response = await fetch(`/api/admin/consultant-workload?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error loading workload data');
      }

      const data = await response.json();
      
      if (data.success) {
        // Convert the processed data back to our expected format
        const processedEvents = data.data.consultants.flatMap((consultant: any) => 
          consultant.sessions.map((session: any) => ({
            id: session.id,
            summary: session.title,
            start: { dateTime: session.start },
            end: { dateTime: session.end },
            attendees: Array(session.attendees).fill(null).map((_, i) => ({
              email: i === 0 ? consultant.consultantEmail : `attendee${i}@example.com`,
              displayName: i === 0 ? consultant.consultantName : `Attendee ${i}`,
              responseStatus: session.status
            })),
            organizer: {
              email: consultant.consultantEmail,
              displayName: consultant.consultantName
            },
            calendarId: session.calendarId,
            hangoutLink: session.hangoutLink,
            htmlLink: session.htmlLink
          }))
        );

        setEvents(processedEvents);
        setWorkloadSummary(data.data.summary);
        
        // Also load calendar list for color information
        try {
          const calendarsResponse = await fetch('/api/calendar/calendars');
          if (calendarsResponse.ok) {
            const calendarsData = await calendarsResponse.json();
            setCalendars(calendarsData.calendars || []);
          }
        } catch (calendarError) {
          console.warn('Error loading calendar colors:', calendarError);
        }
      } else {
        throw new Error(data.error || 'Error loading workload data');
      }
    } catch (error: any) {
      setError(error.message || 'Error loading workload data');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedConsultant]);

  // Load data on component mount and when date range or consultant filter changes
  useEffect(() => {
    loadWorkloadData();
  }, [startDate, endDate, selectedConsultant, loadWorkloadData]);

  // Calculate consultant workload data
  const consultantWorkload = useMemo(() => {
    const consultantMap = new Map<string, ConsultantSession>();

    events.forEach(event => {
      if (!event.attendees || !event.start?.dateTime || !event.end?.dateTime) return;

      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

      // Find consultants (organizer and attendees with specific domains or roles)
      const potentialConsultants = [
        ...(event.organizer ? [event.organizer] : []),
        ...(event.attendees || [])
      ].filter(person => 
        person.email && 
        (person.email.includes('consultor') || 
         person.email.includes('consultant') ||
         person.email.includes('@insiders') ||
         (person as any).responseStatus === 'accepted' ||
         person.email === event.organizer?.email)
      );

      potentialConsultants.forEach(consultant => {
        if (!consultant.email) return;

        const email = consultant.email;
        const name = consultant.displayName || consultant.email.split('@')[0];
        const status = (consultant as any).responseStatus || 'needsAction';

        if (!consultantMap.has(email)) {
          consultantMap.set(email, {
            consultantEmail: email,
            consultantName: name,
            totalSessions: 0,
            totalHours: 0,
            acceptedSessions: 0,
            sessions: []
          });
        }

        const consultantData = consultantMap.get(email)!;
        consultantData.totalSessions++;
        
        if (status === 'accepted') {
          consultantData.acceptedSessions++;
          consultantData.totalHours += duration / 60; // convert to hours
        }

        consultantData.sessions.push({
          id: event.id!,
          title: event.summary || 'Sin título',
          start: startTime,
          end: endTime,
          duration,
          status: status as any,
          attendees: (event.attendees || []).length
        });
      });
    });

    // Convert map to array and sort by total hours
    return Array.from(consultantMap.values()).sort((a, b) => b.totalHours - a.totalHours);
  }, [events]);

  // Use summary from API if available, otherwise calculate from local data
  const summary = useMemo(() => {
    if (workloadSummary) {
      return workloadSummary;
    }

    // Fallback calculation from local data
    const totalConsultants = consultantWorkload.length;
    const totalSessions = consultantWorkload.reduce((sum, c) => sum + c.acceptedSessions, 0);
    const totalHours = consultantWorkload.reduce((sum, c) => sum + c.totalHours, 0);
    const avgHoursPerConsultant = totalConsultants > 0 ? totalHours / totalConsultants : 0;

    return {
      totalConsultants,
      totalSessions,
      totalHours: Math.round(totalHours * 10) / 10,
      avgHoursPerConsultant: Math.round(avgHoursPerConsultant * 10) / 10,
      totalPendingSessions: 0,
      totalDeclinedSessions: 0,
      totalTentativeSessions: 0
    };
  }, [consultantWorkload, workloadSummary]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'tentative': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Export workload data to CSV
  const exportToCSV = () => {
    const csvHeaders = [
      'Consultor',
      'Email',
      'Sesiones Totales',
      'Sesiones Aceptadas',
      'Horas Totales',
      'Sesiones Pendientes',
      'Sesiones Rechazadas',
      'Sesiones Tentativas'
    ];

    const csvData = consultantWorkload.map(consultant => [
      consultant.consultantName,
      consultant.consultantEmail,
      consultant.totalSessions,
      consultant.acceptedSessions,
      consultant.totalHours.toFixed(2),
      consultant.sessions.filter(s => s.status === 'needsAction').length,
      consultant.sessions.filter(s => s.status === 'declined').length,
      consultant.sessions.filter(s => s.status === 'tentative').length
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `carga-horaria-consultores-${startDate}-${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Get list of unique consultants for filter
  const availableConsultants = useMemo(() => {
    const consultants = new Map();
    consultantWorkload.forEach(c => {
      consultants.set(c.consultantEmail, c.consultantName);
    });
    return Array.from(consultants.entries()).map(([email, name]) => ({ email, name }));
  }, [consultantWorkload]);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Carga Horaria por Consultor
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadWorkloadData}
            disabled={isLoading}
          >
            <Icons.RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-4 mt-4">
          {/* Date Range Selector */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Consultant Filter and Export */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Consultor
              </label>
              <select
                value={selectedConsultant}
                onChange={(e) => setSelectedConsultant(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Todos los consultores</option>
                {availableConsultants.map(consultant => (
                  <option key={consultant.email} value={consultant.email}>
                    {consultant.name} ({consultant.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={isLoading || consultantWorkload.length === 0}
                className="whitespace-nowrap"
              >
                📊 Exportar CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{summary.totalConsultants}</div>
            <div className="text-sm text-blue-700">Consultores Activos</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{summary.totalSessions}</div>
            <div className="text-sm text-green-700">Sesiones Aceptadas</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">{formatHours(summary.totalHours)}</div>
            <div className="text-sm text-purple-700">Horas Confirmadas</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">{formatHours(summary.avgHoursPerConsultant)}</div>
            <div className="text-sm text-orange-700">Promedio por Consultor</div>
          </div>
        </div>

        {/* Additional Stats Row */}
        {(summary.totalPendingSessions > 0 || summary.totalDeclinedSessions > 0 || summary.totalTentativeSessions > 0) && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-yellow-900">{summary.totalPendingSessions}</div>
              <div className="text-sm text-yellow-700">Sesiones Pendientes</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-amber-900">{summary.totalTentativeSessions}</div>
              <div className="text-sm text-amber-700">Sesiones Tentativas</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-red-900">{summary.totalDeclinedSessions}</div>
              <div className="text-sm text-red-700">Sesiones Rechazadas</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2">
              <Icons.RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-600">Cargando datos...</span>
            </div>
          </div>
        ) : consultantWorkload.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron sesiones de consultoría en el rango de fechas seleccionado
          </div>
        ) : (
          <div className="space-y-4">
            {consultantWorkload.map((consultant) => (
              <div key={consultant.consultantEmail} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {consultant.consultantName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {consultant.consultantEmail}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatHours(consultant.totalHours)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {consultant.acceptedSessions} sesiones aceptadas
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Sesiones Programadas ({consultant.totalSessions})
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {consultant.sessions
                      .sort((a, b) => a.start.getTime() - b.start.getTime())
                      .map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {session.title}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {session.start.toLocaleDateString('es-ES')}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {session.start.toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {session.end.toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <span>
                              {Math.round(session.duration)} min
                            </span>
                            <span>
                              👥 {session.attendees}
                            </span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status === 'accepted' ? 'Aceptada' :
                           session.status === 'declined' ? 'Rechazada' :
                           session.status === 'tentative' ? 'Tentativa' : 'Sin respuesta'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultantWorkloadWidget;