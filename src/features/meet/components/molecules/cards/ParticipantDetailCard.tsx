import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { UserAvatar } from "../../atoms/display/UserAvatar";
import { ParticipantTypeIcon } from "../../atoms/icons/ParticipantTypeIcon";
import { ProgressBar } from "../../atoms/progress/ProgressBar";
import { MetricCard } from "../../atoms/cards/MetricCard";
import { cn } from "@/src/lib/utils";

export interface ParticipantDetail {
  name: string;
  type: "signed_in" | "anonymous" | "phone";
  joinTime: string;
  leaveTime: string;
  duration: number;
  participation: number;
  totalSessions: number;
  isTopParticipant: boolean;
}

export interface ParticipantDetailCardProps {
  participant: ParticipantDetail;
  className?: string;
}

/**
 * Tarjeta molecular detallada de participante con métricas completas
 * Combina UserAvatar, ParticipantTypeIcon, ProgressBar y MetricCard
 * 
 * @example
 * <ParticipantDetailCard participant={participantData} />
 */
export const ParticipantDetailCard: React.FC<ParticipantDetailCardProps> = ({
  participant,
  className
}) => {
  
  return (
    <div className={cn(
      "p-3 border rounded-lg",
      participant.isTopParticipant ? "bg-primary/5 border-primary/20" : "bg-background",
      className
    )}>
      
      {/* Header con avatar y info principal */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <UserAvatar name={participant.name} size="sm" />
          
          <div>
            <div className="font-medium text-sm flex items-center gap-1">
              {participant.name}
              {participant.isTopParticipant && (
                <Badge className="text-xs bg-yellow-900 text-yellow-100 hover:bg-yellow-800">
                  Top
                </Badge>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="flex items-center gap-1">
                <ParticipantTypeIcon type={participant.type} />
                {participant.type === "signed_in" ? "Autenticado" 
                 : participant.type === "anonymous" ? "Anónimo" 
                 : "Teléfono"}
              </span>
              <span>• {participant.totalSessions} sesiones total</span>
            </div>
          </div>
        </div>
        
        <Badge variant="outline" className="text-xs">
          {participant.duration} min
        </Badge>
      </div>
      
      {/* Métricas de participación usando MetricCard */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
        <MetricCard 
          label="Participación"
          value={`${participant.participation}%`}
          size="sm"
          variant="default"
        />
        <MetricCard 
          label="Entrada"
          value={participant.joinTime}
          size="sm"
          variant="muted"
        />
        <MetricCard 
          label="Salida"
          value={participant.leaveTime}
          size="sm"
          variant="muted"
        />
      </div>
      
      {/* Timeline visual con ProgressBar */}
      <ProgressBar 
        percentage={participant.participation}
        showLabel
        size="sm"
      />
    </div>
  );
};