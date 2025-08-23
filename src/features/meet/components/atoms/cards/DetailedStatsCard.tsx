import React from "react";
import { cn } from "@/src/lib/utils";

export interface DetailedStats {
  longestSession: string;
  shortestSession: string;
  avgPerSession: string;
  totalTime: string;
}

export interface DetailedStatsCardProps {
  stats: DetailedStats;
  className?: string;
}

/**
 * Tarjeta atómica para mostrar estadísticas detalladas
 * Presenta métricas en formato de lista clara
 * 
 * @example
 * <DetailedStatsCard stats={detailedStats} />
 */
export const DetailedStatsCard: React.FC<DetailedStatsCardProps> = ({
  stats,
  className
}) => {
  
  return (
    <div className={cn("grid grid-cols-1 gap-1 text-xs", className)}>
      <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
        <span className="text-muted-foreground">Sesión más larga:</span>
        <span className="font-medium">{stats.longestSession}</span>
      </div>
      <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
        <span className="text-muted-foreground">Sesión más corta:</span>
        <span className="font-medium">{stats.shortestSession}</span>
      </div>
      <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
        <span className="text-muted-foreground">Promedio por sesión:</span>
        <span className="font-medium">{stats.avgPerSession}</span>
      </div>
      <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
        <span className="text-muted-foreground">Total acumulado:</span>
        <span className="font-medium">{stats.totalTime}</span>
      </div>
    </div>
  );
};