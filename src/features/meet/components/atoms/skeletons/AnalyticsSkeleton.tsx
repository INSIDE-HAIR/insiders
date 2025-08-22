/**
 * ANALYTICSSKELETON - Skeleton para carga de analytics
 * Muestra placeholders mientras cargan las métricas
 */

import React from "react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ChartBarIcon, UserGroupIcon, UsersIcon, CalendarIcon } from "@heroicons/react/24/outline";

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className='space-y-2'>
      {/* Sessions & Duration skeleton */}
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <ChartBarIcon className='h-3 w-3' />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Participants breakdown skeleton */}
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <UserGroupIcon className='h-3 w-3' />
        <Skeleton className="h-3 w-28" />
      </div>

      {/* Average participants skeleton */}
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <UsersIcon className='h-3 w-3' />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Recent activity skeleton */}
      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <CalendarIcon className='h-3 w-3' />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  );
};