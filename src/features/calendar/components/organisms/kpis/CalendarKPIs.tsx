/**
 * CalendarKPIs - Organism Component
 * 
 * Dashboard de KPIs del calendario usando Card y Progress de shadcn
 * Migrado desde el componente original manteniendo estética IDÉNTICA
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Separator } from "@/src/components/ui/separator";
import {
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { toast } from "@/src/components/ui/use-toast";
import { cn } from "@/src/lib/utils";

interface CalendarKPIsProps {
  className?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  calendarIds?: string[];
  refreshTrigger?: number;
  onKPIClick?: (kpiType: string, value: any) => void;
}

interface KPIData {
  totalEvents: number;
  totalDuration: number;
  totalParticipants: number;
  acceptanceRate: number;
  completionRate: number;
  responseRate: number;
  avgDuration: number;
  upcomingEvents: number;
  overdueEvents: number;
  lastUpdated: string;
  trends: {
    events: number;
    duration: number;
    participants: number;
    acceptance: number;
  };
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const CalendarKPIs: React.FC<CalendarKPIsProps> = ({
  className,
  dateRange,
  calendarIds,
  refreshTrigger,
  onKPIClick,
}) => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Cargar datos de KPIs
  const fetchKPIs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (dateRange?.from) {
        params.append('from', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append('to', dateRange.to.toISOString());
      }
      if (calendarIds && calendarIds.length > 0) {
        params.append('calendars', calendarIds.join(','));
      }

      const response = await fetch(`/api/calendar/kpis?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar KPIs del calendario');
      }

      const data = await response.json();
      setKpiData(data);
      setLastRefresh(new Date());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "No se pudieron cargar los KPIs del calendario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar KPIs al montar y cuando cambian las dependencias
  useEffect(() => {
    fetchKPIs();
  }, [dateRange, calendarIds, refreshTrigger]);

  // Renderizar estado de carga
  if (isLoading && !kpiData) {
    return <CalendarKPIsSkeleton className={className} />;
  }

  // Renderizar estado de error
  if (error && !kpiData) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <XCircleIcon className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchKPIs}
            disabled={isLoading}
          >
            <ArrowPathIcon className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!kpiData) {
    return null;
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="h-3 w-3 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowTrendingDownIcon className="h-3 w-3 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-blue-500";
    if (value >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">KPIs del Calendario</h2>
          <p className="text-sm text-muted-foreground">
            Última actualización: {lastRefresh.toLocaleTimeString('es-ES')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchKPIs}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowPathIcon className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {/* Main KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onKPIClick?.('totalEvents', kpiData.totalEvents)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalEvents}</div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(kpiData.trends.events)}
              <span className={getTrendColor(kpiData.trends.events)}>
                {kpiData.trends.events > 0 ? '+' : ''}{kpiData.trends.events}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Duration */}
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onKPIClick?.('totalDuration', kpiData.totalDuration)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(kpiData.totalDuration)}</div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(kpiData.trends.duration)}
              <span className={getTrendColor(kpiData.trends.duration)}>
                {kpiData.trends.duration > 0 ? '+' : ''}{kpiData.trends.duration}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Participants */}
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onKPIClick?.('totalParticipants', kpiData.totalParticipants)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalParticipants}</div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(kpiData.trends.participants)}
              <span className={getTrendColor(kpiData.trends.participants)}>
                {kpiData.trends.participants > 0 ? '+' : ''}{kpiData.trends.participants}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Duration */}
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onKPIClick?.('avgDuration', kpiData.avgDuration)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(kpiData.avgDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Por evento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Acceptance Rate */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Tasa de Aceptación</CardTitle>
              <Badge 
                variant={kpiData.acceptanceRate >= 80 ? "default" : 
                        kpiData.acceptanceRate >= 60 ? "secondary" : "destructive"}
              >
                {kpiData.acceptanceRate}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={kpiData.acceptanceRate} 
              className="h-2"
            />
            <div className="flex items-center gap-1 text-xs mt-2">
              {getTrendIcon(kpiData.trends.acceptance)}
              <span className={getTrendColor(kpiData.trends.acceptance)}>
                {kpiData.trends.acceptance > 0 ? '+' : ''}{kpiData.trends.acceptance}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
              <Badge 
                variant={kpiData.completionRate >= 80 ? "default" : 
                        kpiData.completionRate >= 60 ? "secondary" : "destructive"}
              >
                {kpiData.completionRate}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={kpiData.completionRate} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Eventos completados vs programados
            </p>
          </CardContent>
        </Card>

        {/* Response Rate */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
              <Badge 
                variant={kpiData.responseRate >= 80 ? "default" : 
                        kpiData.responseRate >= 60 ? "secondary" : "destructive"}
              >
                {kpiData.responseRate}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={kpiData.responseRate} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Invitaciones con respuesta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <EyeIcon className="h-4 w-4" />
            Estado de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium">Próximos</p>
                <p className="text-2xl font-bold text-blue-600">{kpiData.upcomingEvents}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <p className="text-sm font-medium">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{kpiData.overdueEvents}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium">Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {kpiData.totalEvents - kpiData.upcomingEvents - kpiData.overdueEvents}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-600">{kpiData.totalEvents}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Loading skeleton
export const CalendarKPIsSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-6 animate-pulse", className)}>
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>

    {/* Main KPIs Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Performance Metrics Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-12" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-2 w-full mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Event Status Summary Skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-3 h-3 rounded-full" />
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

CalendarKPIs.displayName = "CalendarKPIs";