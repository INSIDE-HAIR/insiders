/**
 * RecentActivity Component
 * Displays recent video conferencing activity
 */
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Calendar, AlertCircle } from "lucide-react";
import { useVideoSpaces } from "../hooks/useVideoSpaces";
import { VideoProvider } from "../types/video-conferencing";
import Link from "next/link";

export default function RecentActivity() {
  const {
    data: videoSpacesResponse,
    isLoading,
    error,
  } = useVideoSpaces({
    limit: 5, // Get recent 5 spaces
  });

  const getProviderBadge = (provider: VideoProvider) => {
    switch (provider) {
      case "GOOGLE_MEET":
        return <Badge variant='secondary'>Google Meet</Badge>;
      case "ZOOM":
        return <Badge variant='secondary'>Zoom</Badge>;
      case "VIMEO":
        return <Badge variant='secondary'>Vimeo</Badge>;
      default:
        return <Badge variant='secondary'>{provider}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-blue-500";
      case "SCHEDULED":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActivityDescription = (space: any) => {
    const timeDiff =
      Date.now() - new Date(space.updatedAt || space.createdAt).getTime();
    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    const timeText =
      hoursAgo < 1 ? "Hace menos de 1 hora" : `Hace ${hoursAgo} horas`;

    switch (space.status) {
      case "ACTIVE":
        return {
          title: `Espacio "${space.title}" está activo`,
          description: `${space._count?.meetingRecords || 0} reuniones registradas • ${timeText}`,
        };
      case "COMPLETED":
        return {
          title: `Espacio "${space.title}" completado`,
          description: `${space._count?.meetingRecords || 0} reuniones totales • ${timeText}`,
        };
      case "SCHEDULED":
        return {
          title: `Nuevo espacio creado: "${space.title}"`,
          description: `Configurado para ${space.maxParticipants || "ilimitados"} participantes • ${timeText}`,
        };
      default:
        return {
          title: `Espacio "${space.title}" actualizado`,
          description: `Estado: ${space.status} • ${timeText}`,
        };
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-4'>
            <AlertCircle className='h-6 w-6 text-destructive mr-2' />
            <span className='text-sm text-muted-foreground'>
              Error al cargar actividad reciente
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calendar className='h-5 w-5' />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isLoading ? (
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-3 p-3 border rounded-lg'
              >
                <Skeleton className='h-2 w-2 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
                <Skeleton className='h-6 w-20' />
              </div>
            ))}
          </div>
        ) : (
          <div className='space-y-3'>
            {videoSpacesResponse?.videoSpaces?.slice(0, 3).map((space) => {
              const activity = getActivityDescription(space);
              return (
                <div
                  key={space.id}
                  className='flex items-center gap-3 p-3 border rounded-lg'
                >
                  <div
                    className={`h-2 w-2 ${getStatusColor(space.status)} rounded-full`}
                  ></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{activity.title}</p>
                    <p className='text-xs text-muted-foreground'>
                      {activity.description}
                    </p>
                  </div>
                  {getProviderBadge(space.provider)}
                </div>
              );
            })}

            {(!videoSpacesResponse?.videoSpaces ||
              videoSpacesResponse.videoSpaces.length === 0) && (
              <div className='text-center py-4'>
                <p className='text-sm text-muted-foreground'>
                  No hay actividad reciente
                </p>
              </div>
            )}
          </div>
        )}

        <div className='pt-2'>
          <Button variant='outline' size='sm' className='w-full' asChild>
            <Link href='/admin/video-conferencing/spaces'>
              Ver Toda la Actividad
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
