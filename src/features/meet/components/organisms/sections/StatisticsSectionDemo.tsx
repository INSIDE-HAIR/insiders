import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { RefreshCw, AlertCircle } from "lucide-react";
import { StatsOverview, StatsOverviewData } from "../../molecules/overview/StatsOverview";
import { ParticipantRankingCard, ParticipantRankingData } from "../../molecules/cards/ParticipantRankingCard";
import { useStatisticsData } from "../../../hooks/useStatisticsData";
import { adaptStatisticsData } from "../../../utils/statisticsDataAdapter";
import { cn } from "@/src/lib/utils";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";

export interface StatisticsSectionDemoProps {
  spaceId: string | null;
  className?: string;
}

/**
 * Sección Statistics completa usando componentes atómicos con datos reales
 * Integra con la API de Meet para mostrar estadísticas reales
 * 
 * @example
 * <StatisticsSectionDemo spaceId="abc123" />
 */
export const StatisticsSectionDemo: React.FC<StatisticsSectionDemoProps> = ({
  spaceId,
  className
}) => {
  console.log('📊 StatisticsSectionDemo: Component rendered with spaceId:', spaceId);
  const { data, loading, error, refetch } = useStatisticsData(spaceId);

  console.log('📊 StatisticsSectionDemo: Hook state:', { 
    hasData: !!data, 
    loading, 
    error,
    totalSessions: data?.sessions?.total || 0,
    uniqueParticipants: data?.participants?.unique || 0
  });

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Loading skeleton for stats overview */}
        <div className="bg-muted/50 rounded p-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-background rounded p-3 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Loading skeleton for ranking */}
        <div className="border border-border rounded-lg">
          <div className="p-4">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="px-4 pb-4 space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium mb-1">Error al cargar las estadísticas</p>
              <p className="text-xs text-muted-foreground mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">No hay estadísticas disponibles</p>
              <p className="text-xs text-muted-foreground">
                Las estadísticas aparecerán cuando haya actividad en este espacio.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Adapt API data to component format
  const adaptedData = adaptStatisticsData(data);

  // Success state with data
  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Estadísticas generales usando StatsOverview */}
      <StatsOverview data={adaptedData.general} />
      
      {/* Ranking de Participantes */}
      <details className="group border border-border rounded-lg" open>
        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-primary" />
            <span className="font-medium">Ranking de Participantes</span>
            <Badge variant="outline">{adaptedData.ranking.length} participantes</Badge>
          </div>
          <svg className="h-4 w-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </summary>
        
        <div className="px-4 pb-4">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {adaptedData.ranking.map((participant, index) => (
              <ParticipantRankingCard
                key={index}
                participant={participant}
              />
            ))}
          </div>
        </div>
      </details>

      {/* Footer info */}
      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
        <span>Actualizado: {new Date(data.calculatedAt).toLocaleString('es-ES')}</span>
        <span>{data.sessions.total} sesiones analizadas</span>
      </div>
      
    </div>
  );
};