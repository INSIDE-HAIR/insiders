"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ParticipantKPI } from "@/src/features/calendar/types/participant-kpis";
import { formatMinutesToHHMM } from "@/src/lib/utils/time";
import {
  XMarkIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Percent } from "lucide-react";

interface ParticipantKPICardProps {
  kpi: ParticipantKPI;
  isLoading?: boolean;
  onRemove?: (email: string) => void;
}

export const ParticipantKPICard: React.FC<ParticipantKPICardProps> = ({
  kpi,
  isLoading = false,
  onRemove,
}) => {
  // Get initials from displayName or email
  const getInitials = () => {
    if (kpi.displayName) {
      return kpi.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return kpi.email.slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    return kpi.displayName || kpi.email.split("@")[0];
  };

  if (isLoading) {
    return (
      <Card className='relative min-w-[280px]'>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-10 w-10 rounded-full' />
              <div>
                <Skeleton className='h-4 w-24 mb-1' />
                <Skeleton className='h-3 w-32' />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-20 w-full mb-3' />
          <Skeleton className='h-16 w-full' />
        </CardContent>
      </Card>
    );
  }

  // Calculate response distribution percentages
  const responseDistribution = {
    accepted:
      kpi.totalEvents > 0 ? (kpi.acceptedEvents / kpi.totalEvents) * 100 : 0,
    declined:
      kpi.totalEvents > 0 ? (kpi.declinedEvents / kpi.totalEvents) * 100 : 0,
    tentative:
      kpi.totalEvents > 0 ? (kpi.tentativeEvents / kpi.totalEvents) * 100 : 0,
    needsAction:
      kpi.totalEvents > 0 ? (kpi.needsActionEvents / kpi.totalEvents) * 100 : 0,
  };

  return (
    <Card className='relative hover:bg-muted/10 transition-colors border-2 min-w-[280px]'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center'>
              <UserCircleIcon className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h3 className='font-bold text-sm text-foreground'>
                {getDisplayName()}
              </h3>
              <p className='text-xs text-muted-foreground/80 font-mono bg-muted/30 px-1 rounded'>
                {kpi.email}
              </p>
            </div>
          </div>
          {onRemove && (
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              onClick={() => onRemove(kpi.email)}
            >
              <XMarkIcon className='h-4 w-4' />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Total de sesiones */}
        <div className='flex items-center justify-between bg-muted/20 p-2 rounded-md'>
          <div className='flex items-center gap-2'>
            <CalendarIcon className='h-4 w-4 text-foreground/80' />
            <span className='text-sm font-semibold text-foreground'>
              Total Sesiones
            </span>
          </div>
          <div className='rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/20 bg-primary/10 text-primary border-primary/30 text-xs flex items-center gap-1'>
            {kpi.totalEvents}
          </div>
        </div>

        {/* Total de duración */}
        <div className='flex items-center justify-between bg-muted/20 p-2 rounded-md'>
          <div className='flex items-center gap-2'>
            <ClockIcon className='h-4 w-4 text-foreground/80' />
            <span className='text-sm font-semibold text-foreground'>
              Total Duración
            </span>
          </div>
          <div className='rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/20 bg-primary/10 text-primary border-primary/30 text-xs flex items-center gap-1'>
            {formatMinutesToHHMM(kpi.totalDurationMinutes || 0)}
          </div>
        </div>

        {/* Estado de respuestas */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-foreground/90 font-medium'>
              Estado de Respuestas
            </span>
          </div>

          <div className='flex flex-wrap gap-2'>
            <div className='rounded-lg border px-3 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-emerald-500/20 bg-emerald-500/10 text-white border-emerald-500/30 text-xs'>
              <div className='flex items-center gap-2 mb-1'>
                <CheckCircleIcon className='h-3 w-3 text-emerald-600' />
                <span>
                  Aceptadas: {kpi.acceptedEvents} (
                  {Math.round(responseDistribution.accepted)}%)
                </span>
              </div>
              <div className='text-white text-xs pl-5 flex items-center gap-1'>
                <ClockIcon className='h-3 w-3 text-emerald-600' />
                {formatMinutesToHHMM(kpi.acceptedDurationMinutes || 0)}
              </div>
            </div>

            <div className='rounded-lg border px-3 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-destructive/20 bg-destructive/10 text-white border-destructive/30 text-xs'>
              <div className='flex items-center gap-2 mb-1'>
                <XCircleIcon className='h-3 w-3 text-destructive' />
                <span>
                  Rechazadas: {kpi.declinedEvents} (
                  {Math.round(responseDistribution.declined)}%)
                </span>
              </div>
              <div className='text-white text-xs pl-5 flex items-center gap-1'>
                <ClockIcon className='h-3 w-3 text-destructive' />
                {formatMinutesToHHMM(kpi.declinedDurationMinutes || 0)}
              </div>
            </div>

            <div className='rounded-lg border px-3 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-amber-500/20 bg-amber-500/10 text-white border-amber-500/30 text-xs'>
              <div className='flex items-center gap-2 mb-1'>
                <ClockIcon className='h-3 w-3 text-amber-600' />
                <span>
                  Tentativas: {kpi.tentativeEvents} (
                  {Math.round(responseDistribution.tentative)}%)
                </span>
              </div>
              <div className='text-white text-xs pl-5 flex items-center gap-1'>
                <ClockIcon className='h-3 w-3 text-amber-600' />
                {formatMinutesToHHMM(kpi.tentativeDurationMinutes || 0)}
              </div>
            </div>

            <div className='rounded-lg border px-3 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-gray-500/20 bg-gray-500/10 text-white border-gray-500/30 text-xs'>
              <div className='flex items-center gap-2 mb-1'>
                <ClockIcon className='h-3 w-3 text-gray-600' />
                <span>
                  Sin respuesta: {kpi.needsActionEvents} (
                  {Math.round(responseDistribution.needsAction)}%)
                </span>
              </div>
              <div className='text-white text-xs pl-5 flex items-center gap-1'>
                <ClockIcon className='h-3 w-3 text-gray-600' />
                {formatMinutesToHHMM(kpi.needsActionDurationMinutes || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Estado de sesiones con porcentaje */}
        {(() => {
          const sessionCompletionRate =
            kpi.totalEvents > 0
              ? Math.round((kpi.completedEvents / kpi.totalEvents) * 100)
              : 0;
          const sessionPendingRate =
            kpi.totalEvents > 0
              ? Math.round((kpi.upcomingEvents / kpi.totalEvents) * 100)
              : 0;
          const isHighCompletion = sessionCompletionRate > 75;
          const isMediumCompletion =
            sessionCompletionRate >= 25 && sessionCompletionRate <= 75;
          const isLowCompletion = sessionCompletionRate < 25;

          const containerClasses = isLowCompletion
            ? "space-y-2 bg-destructive/5 p-3 rounded-md border border-destructive/20"
            : isMediumCompletion
              ? "space-y-2 bg-yellow-500/5 p-3 rounded-md border border-yellow-500/20"
              : "space-y-2 bg-emerald-500/5 p-3 rounded-md border border-emerald-500/20";

          const iconClasses = isLowCompletion
            ? "h-5 w-5 text-destructive"
            : isMediumCompletion
              ? "h-5 w-5 text-yellow-600"
              : "h-5 w-5 text-emerald-600";

          const badgeClasses = isLowCompletion
            ? "rounded-full border px-3 py-1 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-destructive/20 bg-destructive/10 text-destructive border-destructive/30 text-sm flex items-center gap-1"
            : isMediumCompletion
              ? "rounded-full border px-3 py-1 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-yellow-500/20 bg-yellow-500/10 text-yellow-700 border-yellow-500/30 text-sm flex items-center gap-1"
              : "rounded-full border px-3 py-1 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-emerald-500/20 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-sm flex items-center gap-1";

          return (
            <div className={containerClasses}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Percent className={iconClasses} />
                  <span className='text-sm font-semibold text-foreground'>
                    Estado de Sesiones
                  </span>
                </div>
                <div className={badgeClasses}>
                  <span className='text-white'>{sessionCompletionRate}%</span>
                </div>
              </div>

              <div className='flex flex-wrap gap-2 mt-3'>
                <div className='rounded-lg border px-3 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-emerald-500/20 bg-emerald-500/10 text-white border-emerald-500/30 text-xs'>
                  <div className='flex items-center gap-2 mb-1'>
                    <CheckCircleIcon className='h-3 w-3 text-emerald-600' />
                    <span>
                      Realizadas: {kpi.completedEvents} ({sessionCompletionRate}
                      %)
                    </span>
                  </div>
                  <div className='text-white text-xs flex items-center gap-1'>
                    <ClockIcon className='h-3 w-3 text-emerald-600' />
                    {formatMinutesToHHMM(kpi.completedDurationMinutes || 0)}
                  </div>
                </div>

                <div className='rounded-lg border px-3 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-yellow-500/20 bg-yellow-500/10 text-white border-yellow-500/30 text-xs'>
                  <div className='flex items-center gap-2 mb-1'>
                    <ClockIcon className='h-3 w-3 text-yellow-600' />
                    <span>
                      Pendientes: {kpi.upcomingEvents} ({sessionPendingRate}%)
                    </span>
                  </div>
                  <div className='text-white text-xs flex items-center gap-1'>
                    <ClockIcon className='h-3 w-3 text-yellow-600' />
                    {formatMinutesToHHMM(kpi.upcomingDurationMinutes || 0)}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};
