/**
 * BulkActionsBar - Organism Component
 * 
 * Barra de acciones masivas usando Button y Badge de shadcn
 * Migrado desde el componente original manteniendo estética IDÉNTICA
 */

"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Separator } from "@/src/components/ui/separator";
import { 
  CheckIcon,
  XMarkIcon,
  UsersIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { BulkActionTooltip } from "../../molecules/tooltips/BulkActionTooltip";
import { cn } from "@/src/lib/utils";

interface BulkActionsBarProps {
  selectedCount: number;
  eventsWithoutMeet?: number;
  onBulkAddParticipants: () => void;
  onBulkGenerateMeetLinks: () => void;
  onBulkGenerateDescriptions: () => void;
  onBulkMoveCalendar: () => void;
  onBulkUpdateDateTime: () => void;
  onBulkDelete: () => void;
  onDeselectAll: () => void;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  eventsWithoutMeet = 0,
  onBulkAddParticipants,
  onBulkGenerateMeetLinks,
  onBulkGenerateDescriptions,
  onBulkMoveCalendar,
  onBulkUpdateDateTime,
  onBulkDelete,
  onDeselectAll,
  className,
  isLoading = false,
  disabled = false,
}) => {
  // Don't render if no items selected
  if (selectedCount === 0) return null;

  // Loading state
  if (isLoading) {
    return <BulkActionsBarSkeleton className={className} />;
  }

  return (
    <div className={cn(
      "sticky top-0 z-10 bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4",
      className
    )}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Info Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground"
            >
              <CheckIcon className="h-3 w-3 mr-1" />
              {selectedCount} seleccionado{selectedCount !== 1 ? "s" : ""}
            </Badge>
            {eventsWithoutMeet > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <VideoCameraIcon className="h-3 w-3 mr-1" />
                {eventsWithoutMeet} sin Meet
              </Badge>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Participants */}
          <BulkActionTooltip
            action="add-participants"
            count={selectedCount}
            onClick={onBulkAddParticipants}
            disabled={disabled}
          >
            <Button
              variant="default"
              size="sm"
              onClick={onBulkAddParticipants}
              disabled={disabled}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <UsersIcon className="mr-2 h-4 w-4" />
              Agregar Participantes
            </Button>
          </BulkActionTooltip>

          {/* Generate Meet Links */}
          {eventsWithoutMeet > 0 && (
            <BulkActionTooltip
              action="generate-meet"
              count={eventsWithoutMeet}
              onClick={onBulkGenerateMeetLinks}
              disabled={disabled}
            >
              <Button
                variant="default"
                size="sm"
                onClick={onBulkGenerateMeetLinks}
                disabled={disabled}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <VideoCameraIcon className="mr-2 h-4 w-4" />
                Generar Meet ({eventsWithoutMeet})
              </Button>
            </BulkActionTooltip>
          )}

          {/* Generate Descriptions */}
          <BulkActionTooltip
            action="generate-descriptions"
            count={selectedCount}
            onClick={onBulkGenerateDescriptions}
            disabled={disabled}
          >
            <Button
              variant="default"
              size="sm"
              onClick={onBulkGenerateDescriptions}
              disabled={disabled}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <DocumentTextIcon className="mr-2 h-4 w-4" />
              Generar Descripciones
            </Button>
          </BulkActionTooltip>

          {/* Move to Calendar */}
          <BulkActionTooltip
            action="move-calendar"
            count={selectedCount}
            onClick={onBulkMoveCalendar}
            disabled={disabled}
          >
            <Button
              variant="default"
              size="sm"
              onClick={onBulkMoveCalendar}
              disabled={disabled}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Mover Calendario
            </Button>
          </BulkActionTooltip>

          {/* Update Date/Time */}
          <BulkActionTooltip
            action="update-datetime"
            count={selectedCount}
            onClick={onBulkUpdateDateTime}
            disabled={disabled}
          >
            <Button
              variant="default"
              size="sm"
              onClick={onBulkUpdateDateTime}
              disabled={disabled}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <ClockIcon className="mr-2 h-4 w-4" />
              Actualizar Fechas
            </Button>
          </BulkActionTooltip>

          {/* Delete Selected */}
          <BulkActionTooltip
            action="delete"
            count={selectedCount}
            onClick={onBulkDelete}
            disabled={disabled}
          >
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              disabled={disabled}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </BulkActionTooltip>

          {/* Deselect All */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            disabled={disabled}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            <XMarkIcon className="mr-2 h-4 w-4" />
            Deseleccionar
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <Separator className="my-3" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Acciones disponibles para eventos seleccionados</span>
        <span className="font-medium text-primary">
          {selectedCount} evento{selectedCount !== 1 ? "s" : ""} listo
          {selectedCount !== 1 ? "s" : ""} para procesar
        </span>
      </div>
    </div>
  );
};

// Loading skeleton
export const BulkActionsBarSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn(
    "sticky top-0 z-10 bg-muted/30 border rounded-lg p-4 mb-4 animate-pulse",
    className
  )}>
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Info Section Skeleton */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Actions Section Skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-32" />
        ))}
      </div>
    </div>

    <Skeleton className="h-px w-full my-3" />
    
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
);

BulkActionsBar.displayName = "BulkActionsBar";