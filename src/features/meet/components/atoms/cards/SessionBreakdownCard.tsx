import React from "react";
import { cn } from "@/src/lib/utils";

export interface SessionDetail {
  formattedStartTime: string;
  durationFormatted: string;
  dayOfWeek: string;
}

export interface SessionBreakdownCardProps {
  sessions: SessionDetail[];
  className?: string;
}

/**
 * Tarjeta atómica para mostrar desglose de sesiones
 * Lista simple sin emojis ni bullet points
 * 
 * @example
 * <SessionBreakdownCard sessions={sessionData} />
 */
export const SessionBreakdownCard: React.FC<SessionBreakdownCardProps> = ({
  sessions,
  className
}) => {
  
  return (
    <div className={cn("space-y-1", className)}>
      {sessions.map((session, index) => (
        <div key={index} className="text-xs text-muted-foreground p-2 bg-background rounded">
          {index + 1}. {session.formattedStartTime} ({session.durationFormatted}) - {session.dayOfWeek}
        </div>
      ))}
    </div>
  );
};