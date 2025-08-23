import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { RankBadge } from "../../atoms/badges/RankBadge";
import { UserAvatar } from "../../atoms/display/UserAvatar";
import { MetricCard } from "../../atoms/cards/MetricCard";
import { SessionHistoryList } from "./SessionHistoryList";
import { cn } from "@/src/lib/utils";

export interface ParticipantRankingData {
  rank: number;
  name: string;
  totalMinutes: number;
  totalMeetings: number;
  participation: string;
  avgPerSession: string;
  type: "Autenticado" | "Anónimo" | "Teléfono";
  recentSessions: string[];
}

export interface ParticipantRankingCardProps {
  participant: ParticipantRankingData;
  className?: string;
}

/**
 * Tarjeta molecular completa de ranking de participante
 * Combina RankBadge, UserAvatar, MetricCard y SessionHistoryList
 * 
 * @example
 * <ParticipantRankingCard participant={rankingData} />
 */
export const ParticipantRankingCard: React.FC<ParticipantRankingCardProps> = ({
  participant,
  className
}) => {
  
  return (
    <details className={cn("group border border-border rounded-lg", className)}>
      
      {/* Summary con ranking y datos principales */}
      <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
        <div className="flex items-center gap-2">
          <RankBadge rank={participant.rank} />
          
          <UserAvatar name={participant.name} size="sm" />
          
          <div>
            <span className="font-medium text-sm">{participant.name}</span>
            <div className="text-xs text-muted-foreground">
              {participant.type} • {participant.totalMinutes} min total
            </div>
          </div>
        </div>
        
        <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </summary>
      
      {/* Contenido expandible con métricas y historial */}
      <div className="px-3 pb-3 space-y-3">
        
        {/* Métricas principales usando MetricCard */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <MetricCard 
            label="Total reuniones"
            value={participant.totalMeetings}
            size="sm"
            variant="default"
          />
          <MetricCard 
            label="Promedio sesión"
            value={participant.avgPerSession}
            size="sm"
            variant="default"
          />
          <MetricCard 
            label="% Participación"
            value={participant.participation}
            size="sm"
            variant="default"
          />
        </div>
        
        {/* Historial de sesiones recientes */}
        <details className="group border border-border rounded-lg">
          <summary className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Sesiones Recientes</span>
              <Badge variant="outline" className="text-xs">
                {participant.recentSessions.length}
              </Badge>
            </div>
            <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </summary>
          
          <div className="px-2 pb-2">
            <SessionHistoryList sessions={participant.recentSessions} />
          </div>
        </details>
        
      </div>
    </details>
  );
};