import React from "react";
import { cn } from "@/src/lib/utils";

export interface SessionHistoryItemProps {
  session: string;
  className?: string;
}

/**
 * Item atómico para mostrar sesiones recientes en historial
 * Formato consistente para listas de sesiones
 * 
 * @example
 * <SessionHistoryItem session="15/01 - 90min" />
 * <SessionHistoryItem session="14/01 - 75min" />
 */
export const SessionHistoryItem: React.FC<SessionHistoryItemProps> = ({
  session,
  className
}) => {
  
  return (
    <div className={cn(
      "text-xs text-muted-foreground p-1 bg-background rounded",
      className
    )}>
      • {session}
    </div>
  );
};