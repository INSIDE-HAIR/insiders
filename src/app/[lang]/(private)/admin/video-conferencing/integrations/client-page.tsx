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
  Plug,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Key,
  Link,
  Shield,
  ExternalLink,
} from "lucide-react";

export default function VideoIntegrationsClient() {
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
                No tienes permisos para acceder a las integraciones.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case "error":
        return <XCircle className='h-5 w-5 text-red-500' />;
      case "warning":
        return <AlertTriangle className='h-5 w-5 text-yellow-500' />;
      default:
        return <XCircle className='h-5 w-5 text-gray-500' />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className='bg-green-500'>Conectado</Badge>;
      case "error":
        return <Badge variant='destructive'>Error</Badge>;
      case "warning":
        return <Badge className='bg-yellow-500'>Advertencia</Badge>;
      default:
        return <Badge variant='secondary'>Desconectado</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Plug className='h-8 w-8 text-primary' />
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Integraciones de Proveedores
            </h1>
            <p className='text-muted-foreground'>
              Configura y gestiona las conexiones con proveedores de
              videoconferencia
            </p>
          </div>
        </div>
      </div>

      {/* Integration Status Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <div className='text-2xl font-bold'>2</div>
            </div>
            <p className='text-xs text-muted-foreground'>
              Integraciones Activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4 text-yellow-500' />
              <div className='text-2xl font-bold'>1</div>
            </div>
            <p className='text-xs text-muted-foreground'>Con Advertencias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <RefreshCw className='h-4 w-4 text-blue-500' />
              <div className='text-2xl font-bold'>24h</div>
            </div>
            <p className='text-xs text-muted-foreground'>
              Última Sincronización
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Integrations */}
      <div className='space-y-6'>
        {/* Google Meet Integration */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-3'>
                <div className='h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <div className='h-6 w-6 bg-blue-500 rounded'></div>
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>Google Meet</h3>
                  <p className='text-sm text-muted-foreground'>
                    Google Meet API v2
                  </p>
                </div>
              </CardTitle>
              <div className='flex items-center gap-2'>
                {getStatusIcon("connected")}
                {getStatusBadge("connected")}
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h4 className='text-sm font-medium mb-2'>Configuración</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Client ID:</span>
                    <span className='font-mono'>***...abc123</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Scopes:</span>
                    <span>calendar, meet</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Token válido hasta:
                    </span>
                    <span>15/02/2024</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='text-sm font-medium mb-2'>Estadísticas</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Espacios creados:
                    </span>
                    <span className='font-medium'>102</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Última actividad:
                    </span>
                    <span>Hace 2 horas</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Rate limit:</span>
                    <span className='text-green-600'>Normal</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className='flex gap-2'>
              <Button size='sm' variant='outline'>
                <Settings className='h-4 w-4 mr-2' />
                Configurar
              </Button>
              <Button size='sm' variant='outline'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Renovar Token
              </Button>
              <Button size='sm' variant='outline'>
                <ExternalLink className='h-4 w-4 mr-2' />
                Documentación
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Zoom Integration */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-3'>
                <div className='h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <div className='h-6 w-6 bg-purple-500 rounded'></div>
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>Zoom</h3>
                  <p className='text-sm text-muted-foreground'>Zoom API v2</p>
                </div>
              </CardTitle>
              <div className='flex items-center gap-2'>
                {getStatusIcon("connected")}
                {getStatusBadge("connected")}
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h4 className='text-sm font-medium mb-2'>Configuración</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>API Key:</span>
                    <span className='font-mono'>***...xyz789</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Tipo:</span>
                    <span>Server-to-Server OAuth</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Account ID:</span>
                    <span className='font-mono'>***...def456</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='text-sm font-medium mb-2'>Estadísticas</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Reuniones creadas:
                    </span>
                    <span className='font-medium'>44</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Última actividad:
                    </span>
                    <span>Hace 1 día</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Rate limit:</span>
                    <span className='text-green-600'>Normal</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className='flex gap-2'>
              <Button size='sm' variant='outline'>
                <Settings className='h-4 w-4 mr-2' />
                Configurar
              </Button>
              <Button size='sm' variant='outline'>
                <Key className='h-4 w-4 mr-2' />
                Rotar Claves
              </Button>
              <Button size='sm' variant='outline'>
                <ExternalLink className='h-4 w-4 mr-2' />
                Documentación
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vimeo Integration */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-3'>
                <div className='h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center'>
                  <div className='h-6 w-6 bg-green-500 rounded'></div>
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>Vimeo</h3>
                  <p className='text-sm text-muted-foreground'>Vimeo API v4</p>
                </div>
              </CardTitle>
              <div className='flex items-center gap-2'>
                {getStatusIcon("warning")}
                {getStatusBadge("warning")}
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <AlertTriangle className='h-4 w-4 text-yellow-600' />
                <p className='text-sm text-yellow-800'>
                  El token de acceso expirará en 7 días. Se recomienda renovarlo
                  pronto.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h4 className='text-sm font-medium mb-2'>Configuración</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Access Token:</span>
                    <span className='font-mono'>***...mno012</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Scopes:</span>
                    <span>create, edit, upload</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Token válido hasta:
                    </span>
                    <span className='text-yellow-600'>22/01/2024</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='text-sm font-medium mb-2'>Estadísticas</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Videos creados:
                    </span>
                    <span className='font-medium'>10</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Última actividad:
                    </span>
                    <span>Hace 3 días</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Rate limit:</span>
                    <span className='text-green-600'>Normal</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className='flex gap-2'>
              <Button size='sm' variant='outline'>
                <Settings className='h-4 w-4 mr-2' />
                Configurar
              </Button>
              <Button size='sm' className='bg-yellow-500 hover:bg-yellow-600'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Renovar Token
              </Button>
              <Button size='sm' variant='outline'>
                <ExternalLink className='h-4 w-4 mr-2' />
                Documentación
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Link className='h-5 w-5' />
            Configuración de Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Los webhooks permiten recibir notificaciones automáticas cuando
            ocurren eventos en las plataformas de videoconferencia.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 border rounded-lg'>
              <h4 className='font-medium mb-2'>Google Meet</h4>
              <p className='text-xs text-muted-foreground mb-2'>
                https://api.insidesalons.com/webhooks/google-meet
              </p>
              <Badge className='bg-green-500'>Activo</Badge>
            </div>

            <div className='p-4 border rounded-lg'>
              <h4 className='font-medium mb-2'>Zoom</h4>
              <p className='text-xs text-muted-foreground mb-2'>
                https://api.insidesalons.com/webhooks/zoom
              </p>
              <Badge className='bg-green-500'>Activo</Badge>
            </div>

            <div className='p-4 border rounded-lg'>
              <h4 className='font-medium mb-2'>Vimeo</h4>
              <p className='text-xs text-muted-foreground mb-2'>
                https://api.insidesalons.com/webhooks/vimeo
              </p>
              <Badge variant='secondary'>Inactivo</Badge>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button size='sm' variant='outline'>
              <Settings className='h-4 w-4 mr-2' />
              Configurar Webhooks
            </Button>
            <Button size='sm' variant='outline'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Probar Conexiones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
