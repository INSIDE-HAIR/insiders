import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { AccessTypeBadge } from "../../atoms/badges/AccessTypeBadge";
import { RoomStatusBadge } from "../../atoms/badges/RoomStatusBadge";
import {
  VideoCameraIcon,
  UsersIcon,
  ClockIcon,
  EyeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

export interface RoomSummaryCardProps {
  displayName?: string;
  meetingCode?: string;
  roomId?: string;
  accessType: "OPEN" | "TRUSTED" | "RESTRICTED";
  memberCount: number;
  isActive?: boolean;
  hasRecording?: boolean;
  hasTranscription?: boolean;
  hasSmartNotes?: boolean;
  hasModeration?: boolean;
  createdAt?: string;
  lastActivity?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  className?: string;
}

/**
 * Tarjeta de resumen de sala optimizada para grid responsivo
 * Diseño mejorado con mejor distribución visual y UX
 */
export const RoomSummaryCard: React.FC<RoomSummaryCardProps> = ({
  displayName,
  meetingCode,
  roomId,
  accessType,
  memberCount,
  isActive = false,
  hasRecording = false,
  hasTranscription = false,
  hasSmartNotes = false,
  hasModeration = false,
  createdAt,
  lastActivity,
  isSelected = false,
  onSelect,
  onView,
  className,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const enabledFeatures = [
    { enabled: hasRecording, label: "Grabación", color: "bg-red-500" },
    { enabled: hasTranscription, label: "Transcripción", color: "bg-blue-500" },
    { enabled: hasSmartNotes, label: "Notas IA", color: "bg-green-500" },
    { enabled: hasModeration, label: "Moderación", color: "bg-purple-500" },
  ].filter((feature) => feature.enabled);

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={onView}
    >
      {/* Checkbox de selección */}
      {onSelect && (
        <div
          className='absolute top-3 left-3 z-10'
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <div
            className={cn(
              "w-4 h-4 border-2 rounded transition-colors",
              isSelected
                ? "bg-primary border-primary"
                : "border-muted-foreground/30 hover:border-primary"
            )}
          >
            {isSelected && (
              <svg
                className='w-full h-full text-primary-foreground'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            )}
          </div>
        </div>
      )}

      <CardHeader className='pb-3 pt-6'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2 flex-1 min-w-0'>
            <CardTitle className='text-lg font-semibold truncate'>
              {displayName || "Sala sin nombre"}
            </CardTitle>
            <div className='space-y-1'>
              {roomId && (
                <p className='text-xs text-muted-foreground font-mono'>
                  ID: {roomId}
                </p>
              )}
              {meetingCode && (
                <p className='text-xs text-muted-foreground font-mono'>
                  Código: {meetingCode}
                </p>
              )}
            </div>
          </div>

          {/* Badges de estado */}
          <div className='flex flex-col gap-1 ml-2'>
            <RoomStatusBadge isActive={isActive} />
            <AccessTypeBadge type={accessType} />
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Estadísticas básicas */}
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-1'>
            <UsersIcon className='h-4 w-4 text-muted-foreground' />
            <span>
              {memberCount} miembro{memberCount !== 1 ? "s" : ""}
            </span>
          </div>

          {formatDate(createdAt) && (
            <div className='flex items-center gap-1 text-muted-foreground'>
              <ClockIcon className='h-4 w-4' />
              <span className='text-xs'>Creada {formatDate(createdAt)}</span>
            </div>
          )}
        </div>

        {/* Indicadores de funcionalidades */}
        {enabledFeatures.length > 0 && (
          <div className='flex gap-1'>
            {enabledFeatures.map((feature) => (
              <div
                key={feature.label}
                className={cn("w-2 h-2 rounded-full", feature.color)}
                title={feature.label}
              />
            ))}
          </div>
        )}

        {/* Botón de acción */}
        <div className='flex justify-end pt-2'>
          <Button
            size='sm'
            variant='outline'
            className='opacity-0 group-hover:opacity-100 transition-opacity'
            onClick={(e) => {
              e.stopPropagation();
              onView?.();
            }}
          >
            <EyeIcon className='h-4 w-4 mr-1' />
            Ver
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
