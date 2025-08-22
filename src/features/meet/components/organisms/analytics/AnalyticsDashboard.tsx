import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Progress } from "@/src/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  UsersIcon,
  VideoCameraIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  useRoomActivity,
  type ActivityData,
  type ConferenceRecord,
  type ParticipantSession,
} from "../../../hooks/useRoomActivity";
import { cn } from "@/src/lib/utils";

export interface AnalyticsDashboardProps {
  roomId?: string;
  timeframe?: "7d" | "30d" | "90d" | "1y";
  onTimeframeChange?: (timeframe: string) => void;
  className?: string;
}

/**
 * Dashboard completo de analytics para una sala de Meet
 * Incluye métricas, gráficos y comparaciones históricas
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  roomId,
  timeframe = "30d",
  onTimeframeChange,
  className,
}) => {
  const {
    stats,
    activityData,
    isLoading,
    error,
    formatDuration,
    exportData,
    hasActivity,
  } = useRoomActivity(roomId);

  // Type assertion for activityData
  const data = activityData as ActivityData | undefined;

  const [selectedMetric, setSelectedMetric] = React.useState<
    "conferences" | "participants" | "duration"
  >("conferences");

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='animate-pulse'>
                  <div className='h-4 bg-muted rounded w-3/4 mb-2'></div>
                  <div className='h-8 bg-muted rounded w-1/2'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !hasActivity) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className='py-12 text-center'>
            <ChartBarIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              {error ? "Error al cargar analytics" : "Sin datos suficientes"}
            </h3>
            <p className='text-muted-foreground'>
              {error
                ? "No se pudieron cargar las métricas de la sala"
                : "Necesitas al menos una conferencia para ver analytics"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getMetricTrend = (current: number, previous: number) => {
    if (previous === 0) return { trend: "neutral", change: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      change: Math.abs(change),
    };
  };

  // Simulated historical data for trends (would come from API in real implementation)
  const historicalStats = {
    conferences: {
      current: stats.totalConferences,
      previous: Math.max(0, stats.totalConferences - 2),
    },
    participants: {
      current: stats.totalParticipants,
      previous: Math.max(0, stats.totalParticipants - 3),
    },
    duration: {
      current: stats.averageDuration,
      previous: stats.averageDuration * 0.9,
    },
    recordings: {
      current: stats.totalRecordings,
      previous: Math.max(0, stats.totalRecordings - 1),
    },
  };

  const metrics = [
    {
      key: "conferences",
      title: "Conferencias",
      value: stats.totalConferences,
      icon: VideoCameraIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: getMetricTrend(
        historicalStats.conferences.current,
        historicalStats.conferences.previous
      ),
    },
    {
      key: "participants",
      title: "Participantes Únicos",
      value: stats.totalParticipants,
      icon: UsersIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: getMetricTrend(
        historicalStats.participants.current,
        historicalStats.participants.previous
      ),
    },
    {
      key: "duration",
      title: "Duración Promedio",
      value: formatDuration(Math.round(stats.averageDuration)),
      icon: ClockIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: getMetricTrend(
        historicalStats.duration.current,
        historicalStats.duration.previous
      ),
      isTime: true,
    },
    {
      key: "recordings",
      title: "Grabaciones",
      value: stats.totalRecordings,
      icon: PlayCircleIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: getMetricTrend(
        historicalStats.recordings.current,
        historicalStats.recordings.previous
      ),
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with controls */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Analytics de Sala
          </h2>
          <p className='text-muted-foreground'>
            Métricas y estadísticas de actividad
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7d'>Últimos 7 días</SelectItem>
              <SelectItem value='30d'>Últimos 30 días</SelectItem>
              <SelectItem value='90d'>Últimos 90 días</SelectItem>
              <SelectItem value='1y'>Último año</SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' size='sm' onClick={() => exportData("csv")}>
            <ArrowDownTrayIcon className='h-4 w-4 mr-2' />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key metrics cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon =
            metric.trend.trend === "up"
              ? ArrowTrendingUpIcon
              : metric.trend.trend === "down"
                ? ArrowTrendingDownIcon
                : null;

          return (
            <Card
              key={metric.key}
              className='hover:shadow-md transition-shadow cursor-pointer'
              onClick={() =>
                !metric.isTime && setSelectedMetric(metric.key as any)
              }
            >
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                    <Icon className={cn("h-5 w-5", metric.color)} />
                  </div>

                  {TrendIcon && (
                    <div className='flex items-center gap-1 text-sm'>
                      <TrendIcon
                        className={cn(
                          "h-3 w-3",
                          metric.trend.trend === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      />
                      <span
                        className={cn(
                          metric.trend.trend === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        {metric.trend.change.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className='mt-4'>
                  <div className='text-2xl font-bold'>
                    {metric.isTime ? metric.value : metric.value}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {metric.title}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity timeline */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent conferences */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CalendarDaysIcon className='h-5 w-5' />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.conferenceRecords && data.conferenceRecords.length > 0 ? (
              <div className='space-y-4'>
                {data.conferenceRecords
                  .slice(0, 5)
                  .map((conference: ConferenceRecord, index: number) => (
                    <div
                      key={conference.name || index}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={
                              conference.endTime ? "secondary" : "default"
                            }
                          >
                            {conference.endTime ? "Finalizada" : "En curso"}
                          </Badge>
                          <span className='text-sm text-muted-foreground'>
                            {new Date(conference.startTime).toLocaleDateString(
                              "es-ES"
                            )}
                          </span>
                        </div>
                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                          <span>
                            {conference.participantCount || 0} participantes
                          </span>
                          {conference.duration && (
                            <span>{formatDuration(conference.duration)}</span>
                          )}
                        </div>
                      </div>

                      {!conference.endTime && (
                        <div className='h-2 w-2 bg-green-500 rounded-full animate-pulse'></div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className='text-center text-muted-foreground py-8'>
                Sin conferencias recientes
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top participants */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UsersIcon className='h-5 w-5' />
              Participantes Más Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.participantsSessions &&
            data.participantsSessions.length > 0 ? (
              <div className='space-y-4'>
                {data.participantsSessions
                  .sort(
                    (a: ParticipantSession, b: ParticipantSession) =>
                      (b.durationSeconds || 0) - (a.durationSeconds || 0)
                  )
                  .slice(0, 5)
                  .map((session: ParticipantSession, index: number) => (
                    <div
                      key={session.user?.email || index}
                      className='flex items-center justify-between'
                    >
                      <div className='space-y-1'>
                        <p className='font-medium text-sm'>
                          {session.user?.displayName ||
                            session.user?.email ||
                            "Usuario Anónimo"}
                        </p>
                        {session.user?.email && session.user.displayName && (
                          <p className='text-xs text-muted-foreground'>
                            {session.user.email}
                          </p>
                        )}
                      </div>

                      <div className='text-right'>
                        <p className='font-semibold text-primary'>
                          {formatDuration(session.durationSeconds || 0)}
                        </p>
                        <div className='w-24 bg-muted rounded-full h-2 mt-1'>
                          <div
                            className='bg-primary h-2 rounded-full transition-all duration-300'
                            style={{
                              width: `${Math.min(((session.durationSeconds || 0) / Math.max(...data.participantsSessions.map((s: ParticipantSession) => s.durationSeconds || 0))) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className='text-center text-muted-foreground py-8'>
                Sin datos de participantes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage patterns */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ChartBarIcon className='h-5 w-5' />
            Patrones de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Average session duration */}
            <div className='space-y-2'>
              <h4 className='font-medium'>Duración Promedio por Sesión</h4>
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span>Cortas (&lt; 15min)</span>
                  <span>30%</span>
                </div>
                <Progress value={30} className='h-2' />

                <div className='flex justify-between text-sm'>
                  <span>Medianas (15-45min)</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className='h-2' />

                <div className='flex justify-between text-sm'>
                  <span>Largas (&gt; 45min)</span>
                  <span>25%</span>
                </div>
                <Progress value={25} className='h-2' />
              </div>
            </div>

            {/* Peak hours */}
            <div className='space-y-2'>
              <h4 className='font-medium'>Horas Pico</h4>
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span>9:00 - 12:00</span>
                  <span>35%</span>
                </div>
                <Progress value={35} className='h-2' />

                <div className='flex justify-between text-sm'>
                  <span>14:00 - 17:00</span>
                  <span>50%</span>
                </div>
                <Progress value={50} className='h-2' />

                <div className='flex justify-between text-sm'>
                  <span>Otras horas</span>
                  <span>15%</span>
                </div>
                <Progress value={15} className='h-2' />
              </div>
            </div>

            {/* Recording usage */}
            <div className='space-y-2'>
              <h4 className='font-medium'>Uso de Funciones</h4>
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='flex items-center gap-1'>
                    <PlayCircleIcon className='h-3 w-3' />
                    Grabaciones
                  </span>
                  <span>
                    {(
                      (stats.totalRecordings /
                        Math.max(stats.totalConferences, 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (stats.totalRecordings /
                      Math.max(stats.totalConferences, 1)) *
                    100
                  }
                  className='h-2'
                />

                <div className='flex justify-between text-sm'>
                  <span className='flex items-center gap-1'>
                    <DocumentTextIcon className='h-3 w-3' />
                    Transcripciones
                  </span>
                  <span>
                    {(
                      (stats.totalTranscripts /
                        Math.max(stats.totalConferences, 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (stats.totalTranscripts /
                      Math.max(stats.totalConferences, 1)) *
                    100
                  }
                  className='h-2'
                />

                <div className='flex justify-between text-sm'>
                  <span className='flex items-center gap-1'>
                    <DocumentTextIcon className='h-3 w-3' />
                    Smart Notes
                  </span>
                  <span>
                    {(
                      (stats.totalSmartNotes /
                        Math.max(stats.totalConferences, 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (stats.totalSmartNotes /
                      Math.max(stats.totalConferences, 1)) *
                    100
                  }
                  className='h-2'
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary insights */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <h4 className='font-medium text-green-600'>Fortalezas</h4>
              <ul className='text-sm space-y-1 text-muted-foreground'>
                <li>• Alta participación en reuniones recientes</li>
                <li>• Uso efectivo de grabaciones para documentación</li>
                <li>• Buena retención de participantes por sesión</li>
              </ul>
            </div>

            <div className='space-y-2'>
              <h4 className='font-medium text-orange-600'>Oportunidades</h4>
              <ul className='text-sm space-y-1 text-muted-foreground'>
                <li>• Considerar activar transcripciones automáticas</li>
                <li>• Optimizar horarios para máxima participación</li>
                <li>• Explorar funciones de Smart Notes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
