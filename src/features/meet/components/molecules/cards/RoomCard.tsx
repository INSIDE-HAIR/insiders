/**
 * ROOMCARD - Componente molécula para mostrar información de una sala
 * Combina átomos para crear una tarjeta completa de sala con analytics progresivas
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import {
  VideoCameraIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  TrashIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

// Importar componentes atómicos existentes
import { AccessTypeBadge } from "../../atoms/badges/AccessTypeBadge";
import { JoinMeetingButton } from "../../atoms/buttons/JoinMeetingButton";
import { AnalyticsSkeleton } from "../../atoms/skeletons/AnalyticsSkeleton";

interface RoomAnalytics {
  permanentMembers: {
    total: number;
    cohosts: number;
    regularMembers: number;
  };
  participants: {
    invited: number;
    uninvited: number;
    unique: number;
  };
  sessions: {
    total: number;
    totalDurationSeconds: number;
    averageDurationSeconds: number;
    averageParticipantsPerSession: number;
  };
  recentActivity?: {
    lastMeetingDate: string | null;
    lastParticipantCount: number;
    daysSinceLastMeeting: number | null;
  };
}

interface RoomCardProps {
  /** Datos de la sala */
  room: {
    name: string;
    meetingUri?: string;
    meetingCode?: string;
    _metadata?: {
      displayName?: string;
    };
    config?: {
      accessType?: string;
    };
    activeConference?: {
      conferenceRecord?: any;
    };
    members?: any[];
    _analytics?: RoomAnalytics;
    _analyticsLoading?: boolean;
  };
  /** Si la sala está seleccionada */
  isSelected: boolean;
  /** Función para toggle de selección */
  onToggleSelection: (spaceId: string) => void;
  /** Función para ver detalles */
  onViewRoom: (spaceId: string, room: any) => void;
  /** Función para duplicar sala */
  onDuplicateRoom: (spaceId: string, room: any) => void;
  /** Función para eliminar sala */
  onDeleteRoom: (spaceId: string, displayName: string) => void;
}

// Función auxiliar para formatear duración en HH:MM:SS
const formatDuration = (totalSeconds: number): string => {
  // Redondear los segundos totales para evitar decimales
  const roundedSeconds = Math.floor(totalSeconds);
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const seconds = Math.floor(roundedSeconds % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Función auxiliar para formatear días desde la última reunión
const formatDaysAgo = (days: number | null): string => {
  if (days === null) return "Nunca";
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.round(days / 7)} semanas`;
  return `Hace ${Math.round(days / 30)} meses`;
};

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isSelected,
  onToggleSelection,
  onViewRoom,
  onDuplicateRoom,
  onDeleteRoom,
}) => {
  const spaceId = room.name?.split("/").pop() || "";
  const displayName =
    room._metadata?.displayName || room.name || "Sala sin nombre";
  const analytics = room._analytics;
  const isLoadingAnalytics = room._analyticsLoading;

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-primary" : ""} bg-card`}
    >
      <CardContent className='p-4 space-y-3'>
        {/* Header with checkbox, name and status badge */}
        <div className='flex items-start justify-between'>
          <div className='flex items-start gap-2 flex-1 min-w-0'>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(spaceId)}
              className='mt-0.5'
            />
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <VideoCameraIcon className='h-4 w-4 text-muted-foreground flex-shrink-0' />
              <h3 className='font-medium text-sm truncate' title={displayName}>
                {displayName}
              </h3>
            </div>
          </div>
          <div className='flex-shrink-0'>
            <AccessTypeBadge
              type={
                room.config?.accessType as "TRUSTED" | "OPEN" | "RESTRICTED"
              }
            />
          </div>
        </div>

        {/* Meeting code */}
        {room.meetingCode && (
          <div className='text-xs text-muted-foreground'>
            Código: {room.meetingCode}
          </div>
        )}

        {/* Analytics - Carga progresiva con 3 estados */}
        <div className='space-y-2'>


          {/* Analytics area - progresiva */}
          {analytics && analytics.sessions && analytics.permanentMembers ? (
            /* Estado 3: Analytics completas cargadas */
            <div className='space-y-2 border-l-2 border-primary pl-2 animate-in fade-in duration-300'>
              {/* Sessions & Duration */}
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <ChartBarIcon className='h-3 w-3 text-primary' />
                <span>
                  {analytics.sessions?.total || 0} sesiones •{" "}
                  {formatDuration(
                    analytics.sessions?.totalDurationSeconds || 0
                  )}{" "}
                  total
                </span>
              </div>

              {/* Participants breakdown */}
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <UserGroupIcon className='h-3 w-3 text-primary' />
                <span>
                  {analytics.permanentMembers?.cohosts || 0} co-hosts •{" "}
                  {analytics.permanentMembers?.regularMembers || 0}{" "}
                  participantes
                </span>
              </div>

              {/* Average participants per session */}
              {(analytics.sessions?.total || 0) > 0 && (
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <UsersIcon className='h-3 w-3 text-primary' />
                  <span>
                    {analytics.sessions?.averageParticipantsPerSession || 0}{" "}
                    participantes promedio
                  </span>
                </div>
              )}

              {/* Recent activity */}
              {analytics.recentActivity?.lastMeetingDate && (
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <CalendarIcon className='h-3 w-3 text-primary' />
                  <span>
                    Última:{" "}
                    {formatDaysAgo(
                      analytics.recentActivity.daysSinceLastMeeting
                    )}{" "}
                    ({analytics.recentActivity.lastParticipantCount || 0}{" "}
                    participantes)
                  </span>
                </div>
              )}
            </div>
          ) : isLoadingAnalytics ? (
            /* Estado 2: Cargando analytics */
            <div className='space-y-2 border-l-2 border-primary pl-2'>
              <div className='flex items-center gap-1.5 text-xs text-primary'>
                <div className='animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full'></div>
                <span>Cargando métricas...</span>
              </div>
              <AnalyticsSkeleton />
            </div>
          ) : (
            /* Estado 1: Sin analytics (pendiente de cargar) */
            <div className='space-y-2 border-l-2 border-gray-300 pl-2'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <ClockIcon className='h-3 w-3' />
                <span>Métricas pendientes...</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons - reorganizados: Fila 1: Unirse + Gestionar, Fila 2: Duplicar + Eliminar */}
        <div className='space-y-2 pt-2'>
          {/* Primera fila: Unirse + Gestionar */}
          <div className='flex gap-2'>
            <JoinMeetingButton
              meetingUri={room.meetingUri}
              size='sm'
              className='flex-1 h-8 text-xs'
            />
            <Button
              variant='outline'
              size='sm'
              className='flex-1 h-8 text-xs'
              onClick={() => onViewRoom(spaceId, room)}
            >
              <Cog6ToothIcon className='h-3 w-3 mr-1' />
              Gestionar
            </Button>
          </div>

          {/* Segunda fila: Duplicar + Eliminar */}
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              size='sm'
              className='flex-1 h-8 text-xs'
              onClick={() => onDuplicateRoom(spaceId, room)}
            >
              <DocumentDuplicateIcon className='h-3 w-3 mr-1' />
              {/* TODO: Implementar funcionalidad de duplicar */}
              Duplicar
            </Button>
            <Button
              variant='destructive'
              size='sm'
              className='flex-1 h-8 text-xs'
              onClick={() => onDeleteRoom(spaceId, displayName)}
            >
              <TrashIcon className='h-3 w-3 mr-1' />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
