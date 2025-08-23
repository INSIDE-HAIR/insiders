import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { CalendarDaysIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { RankBadge } from "../../atoms/badges/RankBadge";
import { UserAvatar } from "../../atoms/display/UserAvatar";
import { MetricCard, ParticipantStatsCard, SessionBreakdownCard, DetailedStatsCard } from "../../atoms/cards";
import { cn } from "@/src/lib/utils";

export interface ParticipantRankingData {
  rank: number;
  name: string;
  totalMinutes: number;
  totalMinutesFormatted?: string; // HH:MM:SS formato
  totalMeetings: number;
  participation: string;
  avgPerSession: string;
  type: "Autenticado" | "Anónimo" | "Teléfono";
  recentSessions: string[];
  // Nuevos campos estructurados
  statsData?: {
    totalSessions: string;
    avgPerSession: string;
    totalTime: string;
    lastAccess: string;
    email: string;
    uniqueDays: number;
  };
  sessionBreakdown?: {
    sessions: Array<{
      formattedStartTime: string;
      durationFormatted: string;
      dayOfWeek: string;
    }>;
    detailedStats: {
      longestSession: string;
      shortestSession: string;
      avgPerSession: string;
      totalTime: string;
    };
  };
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
              {participant.type} • {participant.totalMinutesFormatted || `${participant.totalMinutes} min`} total
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
        
        {/* Estadísticas de participación (si están disponibles) */}
        {participant.statsData && (
          <ParticipantStatsCard data={participant.statsData} />
        )}
        
        {/* Desglose por sesión (accordion separado) */}
        {participant.sessionBreakdown && participant.sessionBreakdown.sessions.length > 0 && (
          <details className="group border border-border rounded-lg">
            <summary className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Desglose por Sesión</span>
                <Badge variant="outline" className="text-xs">
                  {participant.sessionBreakdown.sessions.length}
                </Badge>
              </div>
              <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </summary>
            
            <div className="px-2 pb-2 pt-2">
              <SessionBreakdownCard 
                sessions={participant.sessionBreakdown.sessions}
              />
            </div>
          </details>
        )}
        
        {/* Estadísticas detalladas (accordion separado) */}
        {participant.sessionBreakdown && (
          <details className="group border border-border rounded-lg">
            <summary className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Estadísticas Detalladas</span>
              </div>
              <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </summary>
            
            <div className="px-2 pb-2 pt-2">
              <DetailedStatsCard 
                stats={participant.sessionBreakdown.detailedStats}
              />
            </div>
          </details>
        )}
        
      </div>
    </details>
  );
};