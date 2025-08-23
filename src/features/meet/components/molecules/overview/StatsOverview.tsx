import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { StatCard } from "../../atoms/cards/StatCard";
import { cn } from "@/src/lib/utils";

export interface StatsOverviewData {
  uniqueParticipants: number;
  totalRecords: number;
  analyzedMeetings: number;
}

export interface StatsOverviewProps {
  data: StatsOverviewData;
  className?: string;
}

/**
 * Molecular overview de estadísticas generales
 * Combina 3 StatCard en un grid con header
 * 
 * @example
 * <StatsOverview data={statisticsData.general} />
 */
export const StatsOverview: React.FC<StatsOverviewProps> = ({
  data,
  className
}) => {
  
  return (
    <div className={cn("bg-muted/50 rounded p-4", className)}>
      <h4 className="font-medium text-base mb-3 flex items-center gap-2">
        <ChartBarIcon className="h-5 w-5 text-primary" />
        Estadísticas Generales
      </h4>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <StatCard
          label="Participantes únicos"
          value={data.uniqueParticipants}
          size="md"
          variant="primary"
        />
        <StatCard
          label="Total registros"
          value={data.totalRecords}
          size="md"
          variant="primary"
        />
        <StatCard
          label="Reuniones analizadas"
          value={data.analyzedMeetings}
          size="md"
          variant="primary"
        />
      </div>
    </div>
  );
};