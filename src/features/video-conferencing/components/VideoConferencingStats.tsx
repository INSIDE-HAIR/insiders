/**
 * VideoConferencingStats Component
 * Displays real-time statistics for video conferencing platform
 */
"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Monitor,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useVideoSpaces } from "../hooks/useVideoSpaces";
import {
  useMeetingAnalytics,
  useParticipantAnalytics,
} from "../hooks/useAnalytics";

export default function VideoConferencingStats() {
  // Fetch video spaces for active count
  const {
    data: videoSpacesResponse,
    isLoading: spacesLoading,
    error: spacesError,
  } = useVideoSpaces({
    limit: 100, // Get more to calculate accurate stats
  });

  // Fetch analytics for meeting and participant data
  const {
    data: meetingAnalytics,
    isLoading: meetingLoading,
    error: meetingError,
  } = useMeetingAnalytics({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
  });

  const {
    data: participantAnalytics,
    isLoading: participantLoading,
    error: participantError,
  } = useParticipantAnalytics({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
  });

  const isLoading = spacesLoading || meetingLoading || participantLoading;
  const hasError = spacesError || meetingError || participantError;

  // Calculate stats from data
  const videoSpaces = videoSpacesResponse?.videoSpaces || [];
  const activeSpaces = videoSpaces.filter(
    (space) => space.status === "ACTIVE"
  ).length;
  const totalParticipants = participantAnalytics?.totalParticipants || 0;
  const totalMeetings = meetingAnalytics?.totalMeetings || 0;

  // Calculate attendance rate (example calculation)
  const attendanceRate =
    meetingAnalytics?.averageParticipants && meetingAnalytics?.totalMeetings
      ? Math.round(
          (meetingAnalytics.averageParticipants /
            (meetingAnalytics.totalMeetings * 10)) *
            100
        ) // Assuming max 10 expected per meeting
      : 0;

  if (hasError) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-center py-4'>
            <AlertCircle className='h-6 w-6 text-destructive mr-2' />
            <span className='text-sm text-muted-foreground'>
              Error al cargar estadísticas
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      {/* Active Spaces */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-2'>
            <Monitor className='h-4 w-4 text-blue-500' />
            {isLoading ? (
              <Skeleton className='h-8 w-12' />
            ) : (
              <div className='text-2xl font-bold'>{activeSpaces}</div>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>Espacios Activos</p>
        </CardContent>
      </Card>

      {/* Total Participants */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4 text-green-500' />
            {isLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <div className='text-2xl font-bold'>{totalParticipants}</div>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>Participantes Totales</p>
        </CardContent>
      </Card>

      {/* Meetings This Month */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-purple-500' />
            {isLoading ? (
              <Skeleton className='h-8 w-12' />
            ) : (
              <div className='text-2xl font-bold'>{totalMeetings}</div>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>Reuniones Este Mes</p>
        </CardContent>
      </Card>

      {/* Attendance Rate */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4 text-orange-500' />
            {isLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <div className='text-2xl font-bold'>{attendanceRate}%</div>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>Tasa de Asistencia</p>
        </CardContent>
      </Card>
    </div>
  );
}
