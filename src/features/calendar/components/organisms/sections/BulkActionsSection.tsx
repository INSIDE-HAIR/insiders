/**
 * BulkActionsSection - Organism Component
 * 
 * Section IDÉNTICO estéticamente al original BulkActionsBar.tsx
 * + Estado de loading con skeleton
 * Copiado exacto de: BulkActionsBar.tsx líneas completas
 * Usando molecules/atoms para composición
 */

"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Icons } from "@/src/components/shared/icons";
import { cn } from "@/src/lib/utils";
import { ActionTooltip } from "../../atoms/tooltips/ActionTooltip";
import { SkeletonBox } from "../../atoms/loading/SkeletonBox";

interface BulkActionsSectionProps {
  selectedCount: number;
  eventsWithoutMeet?: number;
  onBulkAddParticipants?: () => void;
  onBulkGenerateMeetLinks?: () => void;
  onBulkGenerateDescriptions?: () => void;
  onBulkMoveCalendar?: () => void;
  onBulkUpdateDateTime?: () => void;
  onExportSelected?: () => void;
  onDeselectAll?: () => void;
  isLoading?: boolean;
}

export const BulkActionsSection: React.FC<BulkActionsSectionProps> = ({
  selectedCount,
  eventsWithoutMeet = 0,
  onBulkAddParticipants,
  onBulkGenerateMeetLinks,
  onBulkGenerateDescriptions,
  onBulkMoveCalendar,
  onBulkUpdateDateTime,
  onExportSelected,
  onDeselectAll,
  isLoading = false,
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className='sticky top-0 z-10 bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4 animate-pulse'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <SkeletonBox width={120} height={24} rounded="sm" />
              <SkeletonBox width={100} height={20} rounded="sm" />
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <SkeletonBox width={160} height={32} rounded="md" />
            <SkeletonBox width={140} height={32} rounded="md" />
            <SkeletonBox width={120} height={32} rounded="md" />
          </div>
        </div>
      </div>
    );
  }

  if (selectedCount === 0) return null;

  return (
    <div className='sticky top-0 z-10 bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        {/* Info Section - copiado exacto líneas 38-55 */}
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

        {/* Actions Section - usando ActionTooltip atom */}
        <div className='flex flex-wrap items-center gap-2'>
          {/* Add Participants */}
          {onBulkAddParticipants && (
            <ActionTooltip
              title="Agregar Participantes"
              description="Añade participantes a múltiples eventos de una vez. Los participantes existentes se mantienen."
              count={selectedCount}
              icon={Icons.Users}
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
            </ActionTooltip>
          )}

          {/* Generate Meet Links */}
          {eventsWithoutMeet > 0 && onBulkGenerateMeetLinks && (
            <ActionTooltip
              title="Generar Enlaces de Meet"
              description="Crea enlaces de Google Meet para eventos que no los tienen. Solo se procesan eventos sin Meet."
              count={eventsWithoutMeet}
              icon={Icons.Video}
            >
              <Button
                variant='default'
                size='sm'
                onClick={onBulkGenerateMeetLinks}
                className='bg-blue-600 hover:bg-blue-700 text-white font-semibold'
              >
                <Icons.Video className='mr-2 h-4 w-4' />
                Generar Meet
              </Button>
            </ActionTooltip>
          )}

          {/* Generate Descriptions */}
          {onBulkGenerateDescriptions && (
            <ActionTooltip
              title="Generar Descripciones"
              description="Crea descripciones automáticas usando plantillas personalizables para todos los eventos seleccionados."
              count={selectedCount}
              icon={Icons.FileText}
            >
              <Button
                variant='default'
                size='sm'
                onClick={onBulkGenerateDescriptions}
                className='bg-purple-600 hover:bg-purple-700 text-white font-semibold'
              >
                <Icons.FileText className='mr-2 h-4 w-4' />
                Generar Descripciones
              </Button>
            </ActionTooltip>
          )}

          {/* Move Calendar */}
          {onBulkMoveCalendar && (
            <ActionTooltip
              title="Mover a Otro Calendario"
              description="Mueve los eventos seleccionados a un calendario diferente manteniendo toda su información."
              count={selectedCount}
              icon={Icons.Calendar}
            >
              <Button
                variant='default'
                size='sm'
                onClick={onBulkMoveCalendar}
                className='bg-orange-600 hover:bg-orange-700 text-white font-semibold'
              >
                <Icons.Calendar className='mr-2 h-4 w-4' />
                Mover Calendario
              </Button>
            </ActionTooltip>
          )}

          {/* Update DateTime */}
          {onBulkUpdateDateTime && (
            <ActionTooltip
              title="Actualizar Fechas/Horas"
              description="Modifica masivamente las fechas y horas de los eventos: mover, reprogramar o ajustar duración."
              count={selectedCount}
              icon={Icons.Clock}
            >
              <Button
                variant='default'
                size='sm'
                onClick={onBulkUpdateDateTime}
                className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold'
              >
                <Icons.Clock className='mr-2 h-4 w-4' />
                Actualizar Fechas
              </Button>
            </ActionTooltip>
          )}

          {/* Export */}
          {onExportSelected && (
            <ActionTooltip
              title="Exportar Seleccionados"
              description="Descarga los eventos seleccionados en formato CSV con toda la información disponible."
              count={selectedCount}
              icon={Icons.Download}
            >
              <Button
                variant='outline'
                size='sm'
                onClick={onExportSelected}
                className='border-2 border-primary/30 hover:border-primary/50 bg-white/80 hover:bg-white font-semibold'
              >
                <Icons.Download className='mr-2 h-4 w-4' />
                Exportar CSV
              </Button>
            </ActionTooltip>
          )}

          {/* Deselect All */}
          {onDeselectAll && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onDeselectAll}
              className='text-muted-foreground hover:text-foreground'
            >
              <Icons.X className='mr-2 h-3 w-3' />
              Deseleccionar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

BulkActionsSection.displayName = "BulkActionsSection";