import React from "react";
import { SessionHistoryItem } from "../../atoms/list/SessionHistoryItem";
import { cn } from "@/src/lib/utils";

export interface SessionHistoryListProps {
  sessions: string[];
  className?: string;
}

/**
 * Lista molecular de sesiones recientes usando SessionHistoryItem
 * Renderiza una lista consistente de items de historial
 * 
 * @example
 * <SessionHistoryList sessions={["15/01 - 90min", "14/01 - 75min"]} />
 */
export const SessionHistoryList: React.FC<SessionHistoryListProps> = ({
  sessions,
  className
}) => {
  
  return (
    <div className={cn("space-y-1", className)}>
      {sessions.map((session, index) => (
        <SessionHistoryItem 
          key={index}
          session={session}
        />
      ))}
    </div>
  );
};