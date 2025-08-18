"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Users,
  Calendar,
  Clock,
  Settings,
  BarChart3,
  Shield,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  Download,
} from "lucide-react";
import Link from "next/link";
import {
  useVideoSpace,
  useDeleteVideoSpace,
} from "@/src/features/video-conferencing/hooks/useVideoSpaces";
import { useVideoSpaceAnalytics } from "@/src/features/video-conferencing/hooks/useAnalytics";
import {
  VideoProvider,
  VideoSpaceStatus,
} from "@/src/features/video-conferencing/types/video-conferencing";
import { useToast } from "@/src/hooks/use-toast";
import { useRouter } from "next/navigation";

interface VideoSpaceDetailsClientProps {
  spaceId: string;
}

export default function VideoSpaceDetailsClient({
  spaceId,
}: VideoSpaceDetailsClientProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  // Fetch video space details
  const {
    data: videoSpace,
    isLoading,
    error,
    refetch,
  } = useVideoSpace(spaceId);

  // Fetch analytics for this space
  const { data: analytics, isLoading: analyticsLoading } =
    useVideoSpaceAnalytics(spaceId);

  // Delete mutation
  const deleteVideoSpaceMutation = useDeleteVideoSpace();

  // Verificación adicional del rol
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <Shield className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Acceso Restringido</h3>
              <p className='text-muted-foreground'>
                No tienes permisos para ver este espacio de video.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: VideoSpaceStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className='bg-green-500'>Activo</Badge>;
      case "SCHEDULED":
        return <Badge className='bg-blue-500'>Programado</Badge>;
      case "COMPLETED":
        return <Badge variant='secondary'>Completado</Badge>;
      case "CANCELLED":
        return <Badge variant='destructive'>Cancelado</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getProviderBadge = (provider: VideoProvider) => {
    switch (provider) {
      case "GOOGLE_MEET":
        return (
          <Badge variant='outline' className='text-blue-600'>
            Google Meet
          </Badge>
        );
      case "ZOOM":
        return (
          <Badge variant='outline' className='text-purple-600'>
            Zoom
          </Badge>
        );
      case "VIMEO":
        return (
          <Badge variant='outline' className='text-green-600'>
            Vimeo
          </Badge>
        );
      default:
        return <Badge variant='outline'>{provider}</Badge>;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "URL copiada al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la URL",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpace = async () => {
    if (!videoSpace) return;

    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar "${videoSpace.title}"?`
      )
    ) {
      try {
        await deleteVideoSpaceMutation.mutateAsync(videoSpace.id);
        toast({
          title: "Espacio eliminado",
          description: `"${videoSpace.title}" ha sido eliminado correctamente`,
        });
        router.push("/admin/video-conferencing/spaces");
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el espacio",
          variant: "destructive",
        });
      }
    }
  };

  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/admin/video-conferencing/spaces'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Volver
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center py-8'>
              <AlertCircle className='h-8 w-8 text-destructive mr-2' />
              <div className='text-center'>
                <h3 className='text-lg font-semibold mb-2'>
                  Error al cargar espacio
                </h3>
                <p className='text-muted-foreground mb-4'>
                  {error instanceof Error
                    ? error.message
                    : "Ha ocurrido un error inesperado"}
                </p>
                <Button onClick={() => refetch()} variant='outline'>
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !videoSpace) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/admin/video-conferencing/spaces'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Volver
            </Link>
          </Button>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-48' />
          </div>
        </div>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <Skeleton className='h-6 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/admin/video-conferencing/spaces'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Volver
            </Link>
          </Button>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <h1 className='text-3xl font-bold tracking-tight'>
                {videoSpace.title}
              </h1>
              {getStatusBadge(videoSpace.status)}
              {getProviderBadge(videoSpace.provider)}
            </div>
            <p className='text-muted-foreground'>
              {videoSpace.description || "Sin descripción"}
            </p>
          </div>
        </div>

        <div className='flex gap-2'>
          {videoSpace.joinUrl && (
            <Button
              variant='outline'
              onClick={() => window.open(videoSpace.joinUrl, "_blank")}
            >
              <ExternalLink className='h-4 w-4 mr-2' />
              Unirse
            </Button>
          )}
          <Button variant='outline' asChild>
            <Link
              href={`/admin/video-conferencing/spaces/${videoSpace.id}/edit`}
            >
              <Edit className='h-4 w-4 mr-2' />
              Editar
            </Link>
          </Button>
          <Button
            variant='outline'
            onClick={handleDeleteSpace}
            disabled={deleteVideoSpaceMutation.isPending}
          >
            {deleteVideoSpaceMutation.isPending ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Trash2 className='h-4 w-4 mr-2' />
            )}
            Eliminar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-blue-500' />
              <div className='text-2xl font-bold'>
                {videoSpace._count?.meetingRecords || 0}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>Reuniones</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-green-500' />
              <div className='text-2xl font-bold'>
                {analytics?.totalDuration
                  ? Math.round(analytics.totalDuration / 60)
                  : 0}
                m
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>Duración Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-purple-500' />
              <div className='text-2xl font-bold'>
                {analytics?.totalParticipants || 0}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>Participantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4 text-orange-500' />
              <div className='text-2xl font-bold'>
                {analytics?.averageParticipants
                  ? Math.round(analytics.averageParticipants)
                  : 0}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>Promedio/Reunión</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Resumen</TabsTrigger>
          <TabsTrigger value='meetings'>Reuniones</TabsTrigger>
          <TabsTrigger value='analytics'>Analíticas</TabsTrigger>
          <TabsTrigger value='settings'>Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Proveedor
                  </Label>
                  <p className='text-sm'>{videoSpace.provider}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Estado
                  </Label>
                  <p className='text-sm'>{videoSpace.status}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Máximo Participantes
                  </Label>
                  <p className='text-sm'>
                    {videoSpace.maxParticipants || "Ilimitado"}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Creado
                  </Label>
                  <p className='text-sm'>
                    {new Date(videoSpace.createdAt).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>

              {videoSpace.joinUrl && (
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    URL de Acceso
                  </Label>
                  <div className='flex items-center gap-2 mt-1'>
                    <Input
                      value={videoSpace.joinUrl}
                      readOnly
                      className='text-sm'
                    />
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => copyToClipboard(videoSpace.joinUrl!)}
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}

              {videoSpace.alias && (
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    Alias
                  </Label>
                  <p className='text-sm'>{videoSpace.alias}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              {videoSpace.lastActivity ? (
                <p className='text-sm text-muted-foreground'>
                  Última actividad:{" "}
                  {new Date(videoSpace.lastActivity).toLocaleString("es-ES")}
                </p>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  Sin actividad reciente
                </p>
              )}

              {videoSpace.lastError && (
                <div className='mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg'>
                  <p className='text-sm text-destructive'>
                    Último error: {videoSpace.lastError}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='meetings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reuniones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Funcionalidad en desarrollo. Aquí se mostrarán todas las
                reuniones asociadas a este espacio de video.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Analíticas Detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className='space-y-4'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              ) : analytics ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Total de Reuniones
                      </Label>
                      <p className='text-2xl font-bold'>
                        {analytics.totalMeetings}
                      </p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Duración Promedio
                      </Label>
                      <p className='text-2xl font-bold'>
                        {Math.round(analytics.averageDuration / 60)}m
                      </p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Participantes Promedio
                      </Label>
                      <p className='text-2xl font-bold'>
                        {Math.round(analytics.averageParticipants)}
                      </p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Engagement Promedio
                      </Label>
                      <p className='text-2xl font-bold'>
                        {Math.round(analytics.averageEngagement * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No hay datos de analíticas disponibles.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Espacio</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='text-sm font-medium'>
                      Requiere Autenticación
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Los participantes deben autenticarse
                    </p>
                  </div>
                  <Badge
                    variant={videoSpace.requiresAuth ? "default" : "secondary"}
                  >
                    {videoSpace.requiresAuth ? "Sí" : "No"}
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='text-sm font-medium'>Grabación Habilitada</p>
                    <p className='text-xs text-muted-foreground'>
                      Permite grabar las sesiones
                    </p>
                  </div>
                  <Badge
                    variant={
                      videoSpace.recordingEnabled ? "default" : "secondary"
                    }
                  >
                    {videoSpace.recordingEnabled ? "Sí" : "No"}
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='text-sm font-medium'>Chat Habilitado</p>
                    <p className='text-xs text-muted-foreground'>
                      Permite el chat durante las sesiones
                    </p>
                  </div>
                  <Badge
                    variant={videoSpace.chatEnabled ? "default" : "secondary"}
                  >
                    {videoSpace.chatEnabled ? "Sí" : "No"}
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='text-sm font-medium'>Compartir Pantalla</p>
                    <p className='text-xs text-muted-foreground'>
                      Permite compartir pantalla
                    </p>
                  </div>
                  <Badge
                    variant={
                      videoSpace.screenShareEnabled ? "default" : "secondary"
                    }
                  >
                    {videoSpace.screenShareEnabled ? "Sí" : "No"}
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='text-sm font-medium'>Sala de Espera</p>
                    <p className='text-xs text-muted-foreground'>
                      Los participantes esperan aprobación
                    </p>
                  </div>
                  <Badge
                    variant={
                      videoSpace.waitingRoomEnabled ? "default" : "secondary"
                    }
                  >
                    {videoSpace.waitingRoomEnabled ? "Sí" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
