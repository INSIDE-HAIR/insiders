"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import {
  Video,
  Monitor,
  BarChart3,
  Plug,
  Settings,
  Users,
  Calendar,
  Play,
  Pause,
  Plus,
  Eye,
  TrendingUp,
  Shield,
} from "lucide-react";
import Link from "next/link";
import VideoConferencingStats from "@/src/features/video-conferencing/components/VideoConferencingStats";
import RecentActivity from "@/src/features/video-conferencing/components/RecentActivity";
import SystemStatus from "@/src/features/video-conferencing/components/SystemStatus";

export default function VideoConferencingClient() {
  const { data: session } = useSession();

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
                No tienes permisos para acceder al módulo de videoconferencias.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Video className='h-8 w-8 text-primary' />
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Video Conferencing Platform
            </h1>
            <p className='text-muted-foreground'>
              Gestiona espacios de video, analíticas y integraciones con
              proveedores
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <VideoConferencingStats />

      {/* Main Navigation Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Video Spaces */}
        <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
          <Link href='/admin/video-conferencing/spaces'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Monitor className='h-5 w-5 text-blue-500' />
                Espacios de Video
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Gestiona y crea espacios de videoconferencia para Google Meet,
                Zoom y Vimeo.
              </p>
              <div className='flex gap-2'>
                <Badge variant='outline' className='text-xs'>
                  Google Meet
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  Zoom
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  Vimeo
                </Badge>
              </div>
              <div className='flex items-center gap-2 pt-2'>
                <Button size='sm' className='flex-1'>
                  <Plus className='h-4 w-4 mr-1' />
                  Crear Espacio
                </Button>
                <Button size='sm' variant='outline'>
                  <Eye className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Meeting Analytics */}
        <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
          <Link href='/admin/video-conferencing/analytics'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <BarChart3 className='h-5 w-5 text-green-500' />
                Analíticas de Reuniones
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Visualiza métricas detalladas, participación y estadísticas de
                rendimiento.
              </p>
              <div className='flex gap-2'>
                <Badge variant='secondary' className='text-xs'>
                  Participación
                </Badge>
                <Badge variant='secondary' className='text-xs'>
                  Duración
                </Badge>
                <Badge variant='secondary' className='text-xs'>
                  Engagement
                </Badge>
              </div>
              <div className='flex items-center gap-2 pt-2'>
                <Button size='sm' className='flex-1'>
                  <BarChart3 className='h-4 w-4 mr-1' />
                  Ver Reportes
                </Button>
                <Button size='sm' variant='outline'>
                  <TrendingUp className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Provider Integrations */}
        <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
          <Link href='/admin/video-conferencing/integrations'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Plug className='h-5 w-5 text-purple-500' />
                Integraciones
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Configura y gestiona las conexiones con proveedores de
                videoconferencia.
              </p>
              <div className='flex gap-2'>
                <Badge variant='default' className='text-xs'>
                  OAuth 2.0
                </Badge>
                <Badge variant='default' className='text-xs'>
                  API Keys
                </Badge>
                <Badge variant='default' className='text-xs'>
                  Webhooks
                </Badge>
              </div>
              <div className='flex items-center gap-2 pt-2'>
                <Button size='sm' className='flex-1'>
                  <Plug className='h-4 w-4 mr-1' />
                  Configurar
                </Button>
                <Button size='sm' variant='outline'>
                  <Settings className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Video Settings */}
        <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
          <Link href='/admin/video-conferencing/settings'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Settings className='h-5 w-5 text-orange-500' />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Ajusta configuraciones generales, permisos y políticas del
                sistema.
              </p>
              <div className='flex gap-2'>
                <Badge variant='outline' className='text-xs'>
                  Permisos
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  Políticas
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  Límites
                </Badge>
              </div>
              <div className='flex items-center gap-2 pt-2'>
                <Button size='sm' className='flex-1'>
                  <Settings className='h-4 w-4 mr-1' />
                  Configurar
                </Button>
                <Button size='sm' variant='outline'>
                  <Shield className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      <Separator />

      {/* Recent Activity */}
      <RecentActivity />

      {/* System Status */}
      <SystemStatus />
    </div>
  );
}
