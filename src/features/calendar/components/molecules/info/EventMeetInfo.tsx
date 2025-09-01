/**
 * EventMeetInfo - Molecular Component
 * 
 * Info de reunión de Meet usando Card + Badge de shadcn
 * Migrado desde el componente original manteniendo estética IDÉNTICA
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Separator } from "@/src/components/ui/separator";
import { 
  VideoCameraIcon, 
  LinkIcon, 
  DocumentDuplicateIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { toast } from "@/src/components/ui/use-toast";
import { cn } from "@/src/lib/utils";

interface EventMeetInfoProps {
  eventId: string;
  calendarId: string;
  className?: string;
  autoLoad?: boolean;
  showActions?: boolean;
}

interface MeetInfo {
  meetId?: string;
  joinUrl?: string;
  dialIn?: {
    phoneNumber: string;
    pinCode: string;
  };
  status: 'active' | 'inactive' | 'pending';
  participantCount?: number;
  recordingEnabled?: boolean;
  streamingEnabled?: boolean;
}

export const EventMeetInfo: React.FC<EventMeetInfoProps> = ({
  eventId,
  calendarId,
  className,
  autoLoad = true,
  showActions = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [meetInfo, setMeetInfo] = useState<MeetInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar información de Meet automáticamente
  useEffect(() => {
    if (autoLoad) {
      fetchMeetInfo();
    }
  }, [eventId, calendarId, autoLoad]);

  // Cargar información de Meet
  const fetchMeetInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/meet-info?calendarId=${calendarId}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al obtener información de Meet");
      }
      
      setMeetInfo(data);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Error al cargar información de Meet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Copiar Meet ID al portapapeles
  const copyMeetId = async () => {
    if (!meetInfo?.meetId) return;
    
    try {
      await navigator.clipboard.writeText(meetInfo.meetId);
      toast({
        title: "Copiado",
        description: "Meet ID copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el Meet ID",
        variant: "destructive",
      });
    }
  };

  // Copiar URL de reunión
  const copyJoinUrl = async () => {
    if (!meetInfo?.joinUrl) return;
    
    try {
      await navigator.clipboard.writeText(meetInfo.joinUrl);
      toast({
        title: "Copiado",
        description: "URL de reunión copiada al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la URL",
        variant: "destructive",
      });
    }
  };

  // Abrir reunión
  const openMeeting = () => {
    if (meetInfo?.joinUrl) {
      window.open(meetInfo.joinUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Generar nuevo Meet link
  const generateMeetLink = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `/api/calendar/events/${eventId}/generate-meet`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ calendarId }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al generar Meet link");
      }
      
      setMeetInfo(data);
      toast({
        title: "Éxito",
        description: "Meet link generado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactivo</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  // Loading skeleton
  if (loading && !meetInfo) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && !meetInfo) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
          {showActions && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMeetInfo}
              className="mt-3"
              disabled={loading}
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // No Meet info
  if (!meetInfo) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <VideoCameraIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No hay información de Meet disponible</p>
            {showActions && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateMeetLink}
                className="mt-3"
                disabled={loading}
              >
                <VideoCameraIcon className="mr-2 h-4 w-4" />
                Generar Meet Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <VideoCameraIcon className="h-5 w-5" />
            Google Meet
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(meetInfo.status)}
            {meetInfo.participantCount !== undefined && (
              <Badge variant="outline" className="text-xs">
                {meetInfo.participantCount} participantes
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meet ID */}
        {meetInfo.meetId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Meet ID</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyMeetId}
                className="h-auto p-1"
              >
                <DocumentDuplicateIcon className="h-3 w-3" />
              </Button>
            </div>
            <div className="bg-muted p-2 rounded text-sm font-mono">
              {meetInfo.meetId}
            </div>
          </div>
        )}

        {/* Join URL */}
        {meetInfo.joinUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">URL de Reunión</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyJoinUrl}
                className="h-auto p-1"
              >
                <DocumentDuplicateIcon className="h-3 w-3" />
              </Button>
            </div>
            <div className="bg-muted p-2 rounded text-sm break-all">
              <a 
                href={meetInfo.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {meetInfo.joinUrl}
              </a>
            </div>
          </div>
        )}

        {/* Dial-in info */}
        {meetInfo.dialIn && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Marcación telefónica</span>
            <div className="bg-muted p-2 rounded text-sm">
              <div>📞 {meetInfo.dialIn.phoneNumber}</div>
              <div>🔢 PIN: {meetInfo.dialIn.pinCode}</div>
            </div>
          </div>
        )}

        {/* Features */}
        {(meetInfo.recordingEnabled || meetInfo.streamingEnabled) && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-sm font-medium">Características</span>
              <div className="flex gap-2">
                {meetInfo.recordingEnabled && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircleIcon className="mr-1 h-3 w-3" />
                    Grabación habilitada
                  </Badge>
                )}
                {meetInfo.streamingEnabled && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircleIcon className="mr-1 h-3 w-3" />
                    Streaming habilitado
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        {showActions && (
          <>
            <Separator />
            <div className="flex gap-2">
              {meetInfo.joinUrl && (
                <Button
                  onClick={openMeeting}
                  size="sm"
                  className="flex-1"
                >
                  <VideoCameraIcon className="mr-2 h-4 w-4" />
                  Unirse
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMeetInfo}
                disabled={loading}
              >
                <ArrowPathIcon className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Loading skeleton
export const EventMeetInfoSkeleton: React.FC = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 flex-1" />
        <Skeleton className="h-8 w-8" />
      </div>
    </CardContent>
  </Card>
);

EventMeetInfo.displayName = "EventMeetInfo";