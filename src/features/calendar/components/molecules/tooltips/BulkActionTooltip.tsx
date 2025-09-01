/**
 * BulkActionTooltip - Molecular Component
 * 
 * Tooltip informativo para acciones masivas usando Tooltip de shadcn
 * Migrado desde el componente original manteniendo estética IDÉNTICA
 */

"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Skeleton } from "@/src/components/ui/skeleton";
import { 
  UsersIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  TrashIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

interface BulkActionTooltipProps {
  action: "add-participants" | "generate-meet" | "generate-descriptions" | "move-calendar" | "update-datetime" | "delete";
  count: number;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

const actionInfo = {
  "add-participants": {
    title: "Agregar Participantes",
    description: "Añade participantes a múltiples eventos de una vez. Los participantes existentes se mantienen.",
    icon: UsersIcon,
    color: "bg-emerald-600 hover:bg-emerald-700",
  },
  "generate-meet": {
    title: "Generar Enlaces de Meet", 
    description: "Crea enlaces de Google Meet para eventos que no los tienen. Solo se procesan eventos sin Meet.",
    icon: VideoCameraIcon,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  "generate-descriptions": {
    title: "Generar Descripciones",
    description: "Crea descripciones automáticas usando plantillas personalizables para todos los eventos seleccionados.",
    icon: DocumentTextIcon,
    color: "bg-purple-600 hover:bg-purple-700",
  },
  "move-calendar": {
    title: "Mover a Otro Calendario",
    description: "Mueve los eventos seleccionados a un calendario diferente manteniendo toda su información.",
    icon: CalendarIcon,
    color: "bg-orange-600 hover:bg-orange-700",
  },
  "update-datetime": {
    title: "Actualizar Fechas/Horas",
    description: "Modifica masivamente las fechas y horas de los eventos: mover, reprogramar o ajustar duración.",
    icon: ClockIcon,
    color: "bg-indigo-600 hover:bg-indigo-700",
  },
  delete: {
    title: "Eliminar Eventos",
    description: "Elimina permanentemente los eventos seleccionados. Esta acción no se puede deshacer.",
    icon: TrashIcon,
    color: "bg-red-600 hover:bg-red-700",
  },
};

export const BulkActionTooltip: React.FC<BulkActionTooltipProps> = ({
  action,
  count,
  onClick,
  disabled = false,
  children,
  className,
  side = "top",
}) => {
  const info = actionInfo[action];
  const Icon = info.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={className}>{children}</div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-semibold">{info.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{info.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <InformationCircleIcon className="h-3 w-3" />
              <span>
                {count} evento{count !== 1 ? "s" : ""} será{count !== 1 ? "n" : ""} procesado{count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Loading skeleton
export const BulkActionTooltipSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <Skeleton className="h-8 w-32" />
  </div>
);

BulkActionTooltip.displayName = "BulkActionTooltip";