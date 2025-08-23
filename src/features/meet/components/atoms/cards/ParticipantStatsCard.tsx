import React from "react";
import { cn } from "@/src/lib/utils";
import { 
  ClockIcon, 
  CalendarDaysIcon, 
  UserIcon, 
  EnvelopeIcon 
} from "@heroicons/react/24/outline";

export interface ParticipantStatsData {
  totalSessions: string;
  avgPerSession: string;
  totalTime: string;
  lastAccess: string;
  email: string;
  uniqueDays: number;
}

export interface ParticipantStatsCardProps {
  data: ParticipantStatsData;
  className?: string;
}

/**
 * Tarjeta atómica para mostrar estadísticas de participación
 * Sin emojis, usando iconos Heroicons en color primary
 * 
 * @example
 * <ParticipantStatsCard data={statsData} />
 */
export const ParticipantStatsCard: React.FC<ParticipantStatsCardProps> = ({
  data,
  className
}) => {
  
  return (
    <div className={cn(
      "space-y-2 p-3 bg-muted/20 rounded-lg border",
      className
    )}>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <UserIcon className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">{data.totalSessions}</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">Promedio: {data.avgPerSession}/sesión</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">Total: {data.totalTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarDaysIcon className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">Días únicos: {data.uniqueDays}</span>
        </div>
      </div>
      
      {/* Información de contacto */}
      <div className="pt-1 border-t border-border/50">
        {data.email && (
          <div className="flex items-center gap-1 text-xs">
            <EnvelopeIcon className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">{data.email}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs mt-1">
          <CalendarDaysIcon className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">Último acceso: {data.lastAccess}</span>
        </div>
      </div>
      
    </div>
  );
};