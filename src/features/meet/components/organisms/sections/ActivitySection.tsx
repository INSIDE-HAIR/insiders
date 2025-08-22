import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Separator } from "@/src/components/ui/separator";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  ChartBarIcon,
  CalendarDaysIcon,
  UsersIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  PlayCircleIcon,
  StopCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useRoomActivity,
  type ActivityData,
  type ConferenceRecord,
  type Recording,
  type Transcript,
  type ParticipantSession,
} from "../../../hooks/useRoomActivity";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface ActivitySectionProps {
  roomId?: string;
  className?: string;
}

/**
 * Sección de actividad con historial de conferencias, grabaciones y estadísticas
 * Incluye filtros, exportación y visualización de datos de actividad
 */
export const ActivitySection: React.FC<ActivitySectionProps> = ({
  roomId,
  className,
}) => {
  const {
    activityData,
    isLoading,
    error,
    stats,
    filters,
    setDateRange,
    setParticipantFilter,
    setActivityType,
    clearFilters,
    formatDuration,
    formatDate,
    exportData,
    hasActivity,
    hasRecordings,
    hasTranscripts,
    hasFiltersApplied,
  } = useRoomActivity(roomId);

  // Type assertion for activityData
  const data = activityData as ActivityData | undefined;

  const [datePickerOpen, setDatePickerOpen] = React.useState<
    "from" | "to" | null
  >(null);

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Alert variant='destructive'>
          <AlertDescription>
            Error al cargar la actividad de la sala: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Estadísticas Generales */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <ChartBarIcon className='h-6 w-6 mx-auto text-primary mb-2' />
            <p className='text-2xl font-bold'>{stats.totalConferences}</p>
            <p className='text-xs text-muted-foreground'>Conferencias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <PlayCircleIcon className='h-6 w-6 mx-auto text-primary mb-2' />
            <p className='text-2xl font-bold'>{stats.totalRecordings}</p>
            <p className='text-xs text-muted-foreground'>Grabaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <DocumentTextIcon className='h-6 w-6 mx-auto text-primary mb-2' />
            <p className='text-2xl font-bold'>{stats.totalTranscripts}</p>
            <p className='text-xs text-muted-foreground'>Transcripciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <UsersIcon className='h-6 w-6 mx-auto text-primary mb-2' />
            <p className='text-2xl font-bold'>{stats.totalParticipants}</p>
            <p className='text-xs text-muted-foreground'>Participantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <ClockIcon className='h-6 w-6 mx-auto text-primary mb-2' />
            <p className='text-2xl font-bold'>
              {formatDuration(Math.round(stats.averageDuration))}
            </p>
            <p className='text-xs text-muted-foreground'>Duración Prom.</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <FunnelIcon className='h-5 w-5' />
              Filtros
            </CardTitle>
            {hasFiltersApplied && (
              <Button variant='outline' size='sm' onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {/* Rango de fechas */}
            <div className='space-y-2'>
              <Label>Desde</Label>
              <Popover
                open={datePickerOpen === "from"}
                onOpenChange={(open) => setDatePickerOpen(open ? "from" : null)}
              >
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-full justify-start'>
                    <CalendarDaysIcon className='h-4 w-4 mr-2' />
                    {filters.dateRange.from
                      ? format(filters.dateRange.from, "dd MMM yyyy", {
                          locale: es,
                        })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={filters.dateRange.from}
                    onSelect={(date) => {
                      setDateRange(date, filters.dateRange.to);
                      setDatePickerOpen(null);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <Label>Hasta</Label>
              <Popover
                open={datePickerOpen === "to"}
                onOpenChange={(open) => setDatePickerOpen(open ? "to" : null)}
              >
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-full justify-start'>
                    <CalendarDaysIcon className='h-4 w-4 mr-2' />
                    {filters.dateRange.to
                      ? format(filters.dateRange.to, "dd MMM yyyy", {
                          locale: es,
                        })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={filters.dateRange.to}
                    onSelect={(date) => {
                      setDateRange(filters.dateRange.from, date);
                      setDatePickerOpen(null);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro de participante */}
            <div className='space-y-2'>
              <Label htmlFor='participant-filter'>Participante</Label>
              <Input
                id='participant-filter'
                placeholder='Buscar por email o nombre'
                value={filters.participantFilter}
                onChange={(e) => setParticipantFilter(e.target.value)}
              />
            </div>

            {/* Tipo de actividad */}
            <div className='space-y-2'>
              <Label>Tipo de Actividad</Label>
              <Select
                value={filters.activityType}
                onValueChange={setActivityType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todas</SelectItem>
                  <SelectItem value='conferences'>Conferencias</SelectItem>
                  <SelectItem value='recordings'>Grabaciones</SelectItem>
                  <SelectItem value='transcripts'>Transcripciones</SelectItem>
                  <SelectItem value='participants'>Participantes</SelectItem>
                  <SelectItem value='smart-notes'>
                    Notas Inteligentes
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasActivity ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <ChartBarIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Sin actividad</h3>
            <p className='text-muted-foreground'>
              Esta sala aún no tiene conferencias registradas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Lista de Conferencias */}
          {data?.conferenceRecords && data.conferenceRecords.length > 0 && (
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <VideoCameraIcon className='h-5 w-5' />
                    Historial de Conferencias ({data.conferenceRecords.length})
                  </CardTitle>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => exportData("csv")}
                  >
                    <ArrowDownTrayIcon className='h-4 w-4 mr-2' />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {data.conferenceRecords.map(
                    (conference: ConferenceRecord, index: number) => (
                      <div
                        key={conference.name || index}
                        className='border rounded-lg p-4'
                      >
                        <div className='flex items-start justify-between'>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant={
                                  conference.endTime ? "secondary" : "default"
                                }
                              >
                                {conference.endTime ? "Finalizada" : "En curso"}
                              </Badge>
                              <span className='text-sm text-muted-foreground'>
                                {formatDate(conference.startTime)}
                              </span>
                            </div>

                            <div className='flex items-center gap-4 text-sm'>
                              <div className='flex items-center gap-1'>
                                <UsersIcon className='h-4 w-4' />
                                <span>
                                  {conference.participantCount || 0}{" "}
                                  participantes
                                </span>
                              </div>

                              {conference.duration && (
                                <div className='flex items-center gap-1'>
                                  <ClockIcon className='h-4 w-4' />
                                  <span>
                                    {formatDuration(conference.duration)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {!conference.endTime && (
                            <div className='flex items-center gap-2'>
                              <div className='h-2 w-2 bg-green-500 rounded-full animate-pulse'></div>
                              <span className='text-sm text-green-600'>
                                En vivo
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Grabaciones */}
          {hasRecordings && activityData?.recordings && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PlayCircleIcon className='h-5 w-5' />
                  Grabaciones ({activityData.recordings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {activityData.recordings.map((recording, index) => (
                    <div
                      key={recording.name || index}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='space-y-1'>
                        <p className='font-medium text-sm'>
                          Grabación #{index + 1}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {formatDate(recording.startTime)}
                          {recording.endTime &&
                            ` - ${formatDate(recording.endTime)}`}
                        </p>
                      </div>

                      {recording.driveDestination?.exportUri && (
                        <Button variant='outline' size='sm' asChild>
                          <a
                            href={recording.driveDestination.exportUri}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <ArrowDownTrayIcon className='h-4 w-4 mr-2' />
                            Descargar
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Transcripciones */}
          {hasTranscripts && activityData?.transcripts && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DocumentTextIcon className='h-5 w-5' />
                  Transcripciones ({activityData.transcripts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {activityData.transcripts.map((transcript, index) => (
                    <div
                      key={transcript.name || index}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='space-y-1'>
                        <p className='font-medium text-sm'>
                          Transcripción #{index + 1}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {formatDate(transcript.startTime)}
                          {transcript.endTime &&
                            ` - ${formatDate(transcript.endTime)}`}
                        </p>
                      </div>

                      {transcript.driveDestination?.exportUri && (
                        <Button variant='outline' size='sm' asChild>
                          <a
                            href={transcript.driveDestination.exportUri}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <DocumentTextIcon className='h-4 w-4 mr-2' />
                            Ver
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sesiones de Participantes */}
          {activityData?.participantsSessions &&
            activityData.participantsSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <UsersIcon className='h-5 w-5' />
                    Participantes Únicos (
                    {activityData.participantsSessions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {activityData.participantsSessions
                      .sort(
                        (a, b) =>
                          (b.durationSeconds || 0) - (a.durationSeconds || 0)
                      )
                      .map((session, index) => (
                        <div
                          key={`${session.user?.email || "anonymous"}-${index}`}
                          className='flex items-center justify-between p-3 border rounded-lg'
                        >
                          <div className='space-y-1'>
                            <p className='font-medium text-sm'>
                              {session.user?.displayName ||
                                session.user?.email ||
                                "Usuario Anónimo"}
                            </p>
                            {session.user?.email &&
                              session.user.displayName && (
                                <p className='text-xs text-muted-foreground'>
                                  {session.user.email}
                                </p>
                              )}
                            {session.earliestStartTime && (
                              <p className='text-xs text-muted-foreground'>
                                Primera conexión:{" "}
                                {formatDate(session.earliestStartTime)}
                              </p>
                            )}
                          </div>

                          <div className='text-right'>
                            {session.durationSeconds && (
                              <p className='font-semibold text-primary'>
                                {formatDuration(session.durationSeconds)}
                              </p>
                            )}
                            {session.latestEndTime && (
                              <p className='text-xs text-muted-foreground'>
                                Última desconexión:{" "}
                                {formatDate(session.latestEndTime)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Exportar Datos */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ArrowDownTrayIcon className='h-5 w-5' />
                Exportar Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => exportData("csv")}>
                  Exportar CSV
                </Button>
                <Button variant='outline' onClick={() => exportData("json")}>
                  Exportar JSON
                </Button>
                <Button variant='outline' onClick={() => exportData("pdf")}>
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
