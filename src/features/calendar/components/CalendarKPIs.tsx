"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Users as UsersIcon,
  TrendingUp as TrendingUpIcon,
  RefreshCw as RefreshCwIcon,
  Activity as ActivityIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertCircle as AlertCircleIcon,
  Video as VideoIcon,
  MapPin as MapPinIcon,
} from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useToast } from "@/src/hooks/use-toast";
import { CalendarKPIData } from '../services/CalendarKPIService';

interface CalendarKPIsProps {
  className?: string;
}

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant = "default",
  trend 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-6 w-6 text-primary bg-primary/20 p-0.5 rounded" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            <TrendingUpIcon 
              className={`h-3 w-3 mr-1 ${
                trend.direction === 'down' ? 'rotate-180' : ''
              }`} 
            />
            {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type DateRangeFilter = 'week' | 'month' | 'quarter' | '30days';

export const CalendarKPIs: React.FC<CalendarKPIsProps> = ({ className }) => {
  const [kpis, setKpis] = useState<CalendarKPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeCompanyCalendars, setIncludeCompanyCalendars] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30days');
  const { toast } = useToast();

  const getDateRangeFromFilter = (filter: DateRangeFilter) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (filter) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(endDate.getMonth() / 3) * 3;
        startDate = new Date(endDate.getFullYear(), quarterStart, 1);
        break;
      case '30days':
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return { startDate, endDate };
  };

  const loadKPIs = async () => {
    try {
      setError(null);
      const url = new URL('/api/calendar/kpis', window.location.origin);
      url.searchParams.set('includeCompany', includeCompanyCalendars.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load KPIs');
      }

      const data = await response.json();
      
      if (data.hasData) {
        setKpis(data.kpis);
        setLastUpdated(new Date(data.kpis.lastUpdatedAt));
      } else {
        setKpis(null);
        setLastUpdated(null);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error loading KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateKPIs = async () => {
    try {
      setUpdating(true);
      setError(null);

      // Get date range based on selected filter
      const { startDate, endDate } = getDateRangeFromFilter(dateRange);

      const url = new URL('/api/calendar/kpis', window.location.origin);
      url.searchParams.set('periodStart', startDate.toISOString());
      url.searchParams.set('periodEnd', endDate.toISOString());
      url.searchParams.set('includeCompany', includeCompanyCalendars.toString());

      const response = await fetch(url.toString(), { method: 'POST' });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update KPIs');
      }

      const data = await response.json();
      
      setKpis(data.kpis);
      setLastUpdated(new Date(data.kpis.lastUpdatedAt));

      const periodLabel = dateRange === 'week' ? 'esta semana' :
                         dateRange === 'month' ? 'este mes' :
                         dateRange === 'quarter' ? 'este trimestre' : 'últimos 30 días';

      toast({
        title: "KPIs actualizados",
        description: `Procesados ${data.processingInfo.eventsProcessed} eventos de ${periodLabel} en ${data.processingInfo.processingTimeMs}ms`,
      });

    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar KPIs",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadKPIs();
  }, []);

  useEffect(() => {
    if (kpis) {
      loadKPIs();
    }
  }, [includeCompanyCalendars]);

  useEffect(() => {
    if (kpis) {
      updateKPIs();
    }
  }, [dateRange]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">KPIs de Calendario</h2>
            <p className="text-muted-foreground">Métricas clave de eventos</p>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !kpis) {
    return (
      <div className={className}>
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircleIcon className="h-5 w-5" />
              <span>Error cargando KPIs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadKPIs} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className={className}>
        <Card className="border-warning bg-warning/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-warning">
              <AlertCircleIcon className="h-5 w-5" />
              <span>No hay KPIs disponibles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warning mb-4">
              No se encontraron métricas. Generar KPIs por primera vez.
            </p>
            <Button onClick={updateKPIs} disabled={updating}>
              {updating ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Generar KPIs
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">KPIs de Calendario</h2>
          <p className="text-muted-foreground">
            Métricas de eventos • Período: {new Date(kpis.periodStart).toLocaleDateString()} - {new Date(kpis.periodEnd).toLocaleDateString()}
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Última actualización: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={(value: DateRangeFilter) => setDateRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="include-company"
              checked={includeCompanyCalendars}
              onCheckedChange={setIncludeCompanyCalendars}
            />
            <Label htmlFor="include-company" className="text-sm">
              Incluir calendarios @insidesalons.com
            </Label>
          </div>
          <Button onClick={updateKPIs} disabled={updating}>
            {updating ? (
              <>
                <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-warning bg-warning/10 mb-6">
          <CardContent className="p-4">
            <p className="text-warning text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Eventos"
          value={kpis.totalEvents}
          description={`${kpis.upcomingEvents} próximos, ${kpis.completedEvents} completados`}
          icon={CalendarIcon}
        />
        
        <KPICard
          title="Participantes Únicos"
          value={kpis.totalUniqueAttendees}
          description={`Promedio: ${kpis.averageAttendeesPerEvent} por evento`}
          icon={UsersIcon}
        />
        
        <KPICard
          title="Horas Totales"
          value={`${kpis.totalEventHours}h`}
          description={`Duración promedio: ${formatDuration(kpis.averageEventDuration)}`}
          icon={ClockIcon}
        />
        
        <KPICard
          title="Tasa de Respuesta"
          value={`${kpis.responseRateStats.responseRate}%`}
          description={`${kpis.responseRateStats.responded} de ${kpis.responseRateStats.totalInvited} invitados`}
          icon={TrendingUpIcon}
          variant={kpis.responseRateStats.responseRate > 75 ? "success" : 
                  kpis.responseRateStats.responseRate > 50 ? "warning" : "destructive"}
        />
      </div>

      {/* Global Attendees Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            Resumen Global de Invitados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{kpis.responseRateStats.totalInvited}</div>
              <div className="text-sm text-muted-foreground">Total Invitados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{kpis.totalUniqueAttendees}</div>
              <div className="text-sm text-muted-foreground">Invitados Únicos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{kpis.averageAttendeesPerEvent}</div>
              <div className="text-sm text-muted-foreground">Promedio por Evento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(kpis.calendarBreakdown).reduce((sum, cal) => sum + cal.totalAttendees, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total por Calendarios</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Attendee Analytics */}
      {kpis.attendeeAnalytics && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Most Engaged Attendees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-primary" />
                Invitados Más Activos
              </CardTitle>
              <CardDescription>
                Top invitados por participación y tasa de aceptación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.attendeeAnalytics.mostEngagedAttendees.slice(0, 5).map((attendee, index) => (
                <div key={attendee.email} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{attendee.email.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground">@{attendee.email.split('@')[1]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{attendee.eventsCount} eventos</div>
                    <div className="text-xs text-success">{attendee.acceptanceRate}% aceptación</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendee Frequency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              Distribución de Frecuencia
            </CardTitle>
            <CardDescription>
              Clasificación de invitados por frecuencia de participación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Únicos (1 evento)</span>
                </div>
                <Badge variant="destructive">{kpis.attendeeAnalytics.attendeeFrequency.single}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Ocasionales (2-3)</span>
                </div>
                <Badge variant="warning">{kpis.attendeeAnalytics.attendeeFrequency.occasional}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Regulares (4-5)</span>
                </div>
                <Badge variant="default">{kpis.attendeeAnalytics.attendeeFrequency.regular}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Frecuentes (6+)</span>
                </div>
                <Badge variant="success">{kpis.attendeeAnalytics.attendeeFrequency.frequent}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Domain Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Dominio</CardTitle>
            <CardDescription>
              Invitados agrupados por dominio de email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kpis.attendeeAnalytics?.domainBreakdown && Object.entries(kpis.attendeeAnalytics.domainBreakdown)
                .sort(([,a], [,b]) => b.uniqueAttendees - a.uniqueAttendees)
                .slice(0, 8)
                .map(([domain, data]) => (
                  <div key={domain} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm font-medium truncate">@{domain}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {data.uniqueAttendees} únicos
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {data.count} total
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Events with Most Attendees */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos con Más Invitados</CardTitle>
            <CardDescription>
              Top eventos por número de participantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.attendeeAnalytics?.invitationStats?.eventsWithMostAttendees?.map((event, index) => (
                <div key={event.eventId} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs mt-0.5">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.attendeeCount} invitados</p>
                  </div>
                  <Badge variant="default" className="ml-2">
                    {event.attendeeCount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </>
      )}

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estado de Respuestas</CardTitle>
            <ActivityIcon className="h-6 w-6 text-primary bg-primary/20 p-0.5 rounded" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-success" />
                <span className="text-sm">Aceptados</span>
              </div>
              <Badge variant="success">{kpis.eventStatusStats.accepted}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircleIcon className="h-4 w-4 text-destructive" />
                <span className="text-sm">Declinados</span>
              </div>
              <Badge variant="destructive">{kpis.eventStatusStats.declined}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="h-4 w-4 text-warning" />
                <span className="text-sm">Pendientes</span>
              </div>
              <Badge variant="warning">{kpis.eventStatusStats.needsAction}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tipos de Reunión</CardTitle>
            <VideoIcon className="h-6 w-6 text-primary bg-primary/20 p-0.5 rounded" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VideoIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Con Meet</span>
              </div>
              <Badge variant="default">{kpis.meetingTypeStats.withMeetLink}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm">Presencial</span>
              </div>
              <Badge variant="secondary">{kpis.meetingTypeStats.inPerson}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Sin Meet</span>
              </div>
              <Badge variant="outline">{kpis.meetingTypeStats.withoutMeetLink}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Distribución Semanal</CardTitle>
            <CalendarIcon className="h-6 w-6 text-primary bg-primary/20 p-0.5 rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(kpis.dailyEventStats)
                .sort(([a], [b]) => {
                  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  return days.indexOf(a) - days.indexOf(b);
                })
                .map(([day, count]) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="capitalize">
                      {day === 'monday' ? 'Lun' :
                       day === 'tuesday' ? 'Mar' :
                       day === 'wednesday' ? 'Mié' :
                       day === 'thursday' ? 'Jue' :
                       day === 'friday' ? 'Vie' :
                       day === 'saturday' ? 'Sáb' : 'Dom'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Breakdown */}
      {Object.keys(kpis.calendarBreakdown).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Calendario</CardTitle>
            <CardDescription>
              Eventos e invitados organizados por calendario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(kpis.calendarBreakdown)
                .sort(([,a], [,b]) => b.eventCount - a.eventCount)
                .map(([calendarId, data]) => (
                  <div key={calendarId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium truncate text-sm">{data.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{calendarId}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <Badge variant="default" className="w-full">
                            {data.eventCount}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Eventos</p>
                        </div>
                        <div>
                          <Badge variant="secondary" className="w-full">
                            {data.totalAttendees}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Invitados</p>
                        </div>
                      </div>
                      
                      <div className="text-center pt-2 border-t">
                        <div className="text-sm font-medium text-blue-600">
                          {data.averageAttendeesPerEvent}
                        </div>
                        <p className="text-xs text-muted-foreground">Promedio/evento</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};