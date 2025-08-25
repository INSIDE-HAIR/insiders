"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Icons } from "@/src/components/shared/icons";
import { cn } from "@/src/lib/utils";
import { BulkActionTooltip } from "./BulkActionTooltip";

interface BulkActionsBarProps {
  selectedCount: number;
  eventsWithoutMeet: number;
  onBulkAddParticipants: () => void;
  onBulkGenerateMeetLinks: () => void;
  onBulkGenerateDescriptions: () => void;
  onBulkMoveCalendar: () => void;
  onExportSelected: () => void;
  onDeselectAll: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  eventsWithoutMeet,
  onBulkAddParticipants,
  onBulkGenerateMeetLinks,
  onBulkGenerateDescriptions,
  onBulkMoveCalendar,
  onExportSelected,
  onDeselectAll,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className='sticky top-0 z-10 bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        {/* Info Section */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Badge
              variant='default'
              className='bg-primary text-primary-foreground'
            >
              <Icons.Check className='h-3 w-3 mr-1' />
              {selectedCount} seleccionado{selectedCount !== 1 ? "s" : ""}
            </Badge>
            {eventsWithoutMeet > 0 && (
              <Badge variant='secondary' className='bg-primary/10 text-primary'>
                <Icons.Video className='h-3 w-3 mr-1' />
                {eventsWithoutMeet} sin Meet
              </Badge>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className='flex flex-wrap items-center gap-2'>
          {/* Add Participants */}
          <BulkActionTooltip
            action='add-participants'
            count={selectedCount}
            onClick={onBulkAddParticipants}
          >
            <Button
              variant='default'
              size='sm'
              onClick={onBulkAddParticipants}
              className='bg-primary hover:bg-primary/90 text-primary-foreground font-semibold'
            >
              <Icons.Users className='mr-2 h-4 w-4' />
              Agregar Participantes
            </Button>
          </BulkActionTooltip>

          {/* Generate Meet Links */}
          {eventsWithoutMeet > 0 && (
            <BulkActionTooltip
              action='generate-meet'
              count={eventsWithoutMeet}
              onClick={onBulkGenerateMeetLinks}
            >
              <Button
                variant='default'
                size='sm'
                onClick={onBulkGenerateMeetLinks}
                className='bg-primary hover:bg-primary/90 text-primary-foreground font-semibold'
              >
                <Icons.Video className='mr-2 h-4 w-4' />
                Generar Meet ({eventsWithoutMeet})
              </Button>
            </BulkActionTooltip>
          )}

          {/* Generate Descriptions */}
          <BulkActionTooltip
            action='generate-descriptions'
            count={selectedCount}
            onClick={onBulkGenerateDescriptions}
          >
            <Button
              variant='default'
              size='sm'
              onClick={onBulkGenerateDescriptions}
              className='bg-primary hover:bg-primary/90 text-primary-foreground font-semibold'
            >
              <Icons.FileText className='mr-2 h-4 w-4' />
              Generar Descripciones
            </Button>
          </BulkActionTooltip>

          {/* Move to Calendar */}
          <BulkActionTooltip
            action='move-calendar'
            count={selectedCount}
            onClick={onBulkMoveCalendar}
          >
            <Button
              variant='default'
              size='sm'
              onClick={onBulkMoveCalendar}
              className='bg-primary hover:bg-primary/90 text-primary-foreground font-semibold'
            >
              <Icons.Calendar className='mr-2 h-4 w-4' />
              Mover Calendario
            </Button>
          </BulkActionTooltip>

          {/* Export Selected */}
          <BulkActionTooltip
            action='export'
            count={selectedCount}
            onClick={onExportSelected}
          >
            <Button
              variant='outline'
              size='sm'
              onClick={onExportSelected}
              className='border border-primary/30 hover:border-primary bg-background hover:bg-primary/5'
            >
              <Icons.Download className='mr-2 h-4 w-4' />
              Exportar
            </Button>
          </BulkActionTooltip>

          {/* Deselect All */}
          <Button
            variant='ghost'
            size='sm'
            onClick={onDeselectAll}
            className='text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200'
          >
            <Icons.X className='mr-2 h-4 w-4' />
            Deseleccionar
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className='mt-3 pt-3 border-t border-primary/20'>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span>Acciones disponibles para eventos seleccionados</span>
          <span className='font-medium text-primary'>
            {selectedCount} evento{selectedCount !== 1 ? "s" : ""} listo
            {selectedCount !== 1 ? "s" : ""} para procesar
          </span>
        </div>
      </div>
    </div>
  );
};
