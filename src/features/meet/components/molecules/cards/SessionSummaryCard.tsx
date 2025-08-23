import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { MetricCard } from "../../atoms/cards/MetricCard";
import { cn } from "@/src/lib/utils";

export interface SessionSummaryData {
  generalInfo: {
    duration: string;
    participants: number;
    status: string;
  };
  analytics: {
    averageAttendance: string;
    averageTime: string;
    topParticipant: string;
  };
}

export interface SessionSummaryCardProps {
  sessionId: string;
  data: SessionSummaryData;
  className?: string;
}

/**
 * Tarjeta molecular de resumen de sesión con métricas
 * Combina MetricCard atoms en un layout estructurado
 * 
 * @example
 * <SessionSummaryCard 
 *   sessionId="session-1"
 *   data={sessionData.summary}
 * />
 */
export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  sessionId,
  data,
  className
}) => {
  
  return (
    <details className="group border border-border rounded-lg" open>
      <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4 text-primary" />
          <span className="font-medium">Resumen de Sesión</span>
          <Badge className="bg-blue-900 text-blue-100 hover:bg-blue-800">
            {sessionId}
          </Badge>
        </div>
        <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </summary>
      
      <div className={cn("px-3 pb-3 space-y-3", className)}>
        <div className="bg-muted/50 rounded p-3">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Información General */}
            <div>
              <div className="text-sm font-medium mb-1">Información General</div>
              <div className="space-y-1 text-xs">
                <div>
                  Duración: <span className="font-medium">{data.generalInfo.duration}</span>
                </div>
                <div>
                  Participantes: <span className="font-medium">{data.generalInfo.participants}</span>
                </div>
                <div>
                  Estado: <span className="font-medium flex items-center gap-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    {data.generalInfo.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div>
              <div className="text-sm font-medium mb-1">Analytics</div>
              <div className="space-y-1 text-xs">
                <div>
                  Asistencia promedio: <span className="font-medium">{data.analytics.averageAttendance}</span>
                </div>
                <div>
                  Tiempo medio: <span className="font-medium">{data.analytics.averageTime}</span>
                </div>
                <div>
                  Top participante: <span className="font-medium">{data.analytics.topParticipant}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
};