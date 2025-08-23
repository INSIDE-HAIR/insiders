import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { StatsOverview, StatsOverviewData } from "../../molecules/overview/StatsOverview";
import { ParticipantRankingCard, ParticipantRankingData } from "../../molecules/cards/ParticipantRankingCard";
import { cn } from "@/src/lib/utils";

export interface StatisticsSectionDemoData {
  general: StatsOverviewData;
  ranking: ParticipantRankingData[];
}

export interface StatisticsSectionDemoProps {
  data: StatisticsSectionDemoData;
  className?: string;
}

/**
 * Sección Statistics completa usando componentes atómicos
 * Replica exactamente la funcionalidad del ResponsiveModalDemo
 * 
 * @example
 * <StatisticsSectionDemo 
 *   data={modalDummyData.statistics} 
 * />
 */
export const StatisticsSectionDemo: React.FC<StatisticsSectionDemoProps> = ({
  data,
  className
}) => {
  
  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Estadísticas generales usando StatsOverview */}
      <StatsOverview data={data.general} />
      
      {/* Ranking de Participantes */}
      <details className="group border border-border rounded-lg" open>
        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-primary" />
            <span className="font-medium">Ranking de Participantes</span>
            <Badge variant="outline">{data.ranking.length} participantes</Badge>
          </div>
          <svg className="h-4 w-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </summary>
        
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {data.ranking.map((participant, index) => (
              <ParticipantRankingCard
                key={index}
                participant={participant}
              />
            ))}
          </div>
        </div>
      </details>
      
    </div>
  );
};