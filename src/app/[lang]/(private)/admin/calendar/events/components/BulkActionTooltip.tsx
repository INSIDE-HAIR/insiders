"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/components/shared/icons";

interface BulkActionTooltipProps {
  action:
    | "add-participants"
    | "generate-meet"
    | "generate-descriptions"
    | "move-calendar"
    | "update-datetime"
    | "export";
  count: number;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const actionInfo = {
  "add-participants": {
    title: "Agregar Participantes",
    description:
      "Añade participantes a múltiples eventos de una vez. Los participantes existentes se mantienen.",
    icon: Icons.Users,
    color: "bg-emerald-600 hover:bg-emerald-700",
  },
  "generate-meet": {
    title: "Generar Enlaces de Meet",
    description:
      "Crea enlaces de Google Meet para eventos que no los tienen. Solo se procesan eventos sin Meet.",
    icon: Icons.Video,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  "generate-descriptions": {
    title: "Generar Descripciones",
    description:
      "Crea descripciones automáticas usando plantillas personalizables para todos los eventos seleccionados.",
    icon: Icons.FileText,
    color: "bg-purple-600 hover:bg-purple-700",
  },
  "move-calendar": {
    title: "Mover a Otro Calendario",
    description:
      "Mueve los eventos seleccionados a un calendario diferente manteniendo toda su información.",
    icon: Icons.Calendar,
    color: "bg-orange-600 hover:bg-orange-700",
  },
  "update-datetime": {
    title: "Actualizar Fechas/Horas",
    description:
      "Modifica masivamente las fechas y horas de los eventos: mover, reprogramar o ajustar duración.",
    icon: Icons.Clock,
    color: "bg-indigo-600 hover:bg-indigo-700",
  },
  export: {
    title: "Exportar Seleccionados",
    description:
      "Descarga los eventos seleccionados en formato CSV con toda la información disponible.",
    icon: Icons.Download,
    color:
      "border-2 border-primary/30 hover:border-primary/50 bg-white/80 hover:bg-white",
  },
};

export const BulkActionTooltip: React.FC<BulkActionTooltipProps> = ({
  action,
  count,
  onClick,
  disabled = false,
  children,
}) => {
  const info = actionInfo[action];
  const Icon = info.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{children}</div>
        </TooltipTrigger>
        <TooltipContent side='top' className='max-w-sm'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Icon className='h-4 w-4' />
              <span className='font-semibold'>{info.title}</span>
            </div>
            <p className='text-sm text-muted-foreground'>{info.description}</p>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Icons.Info className='h-3 w-3' />
              <span>
                {count} evento{count !== 1 ? "s" : ""} será
                {count !== 1 ? "n" : ""} procesado{count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
