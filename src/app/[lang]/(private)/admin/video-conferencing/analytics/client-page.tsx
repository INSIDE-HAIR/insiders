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
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  Download,
  Eye,
  MessageSquare,
  Video,
  Shield,
} from "lucide-react";

export default function VideoAnalyticsClient() {
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
                No tienes permisos para acceder a las analíticas de video.
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
          <BarChart3 className='h-8 w-8 text-primary' />
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Analíticas de Reuniones
            </h1>
            <p className='text-muted-foreground'>
              Métricas detalladas de participación y rendimiento
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Video className='h-4 w-4 text-blue-500' />
              <div className='text-2xl font-bold'>156</div>
            </div>
            <p className='text-xs text-muted-foreground'>Reuniones Totales</p>
            <div className='flex items-center gap-1 mt-1'>
              <TrendingUp className='h-3 w-3 text-green-500' />
              <span className='text-xs text-green-500'>+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-green-500' />
              <div className='text-2xl font-bold'>2,847</div>
            </div>
            <p className='text-xs text-muted-foreground'>
              Participantes Únicos
            </p>
            <div className='flex items-center gap-1 mt-1'>
              <TrendingUp className='h-3 w-3 text-green-500' />
              <span className='text-xs text-green-500'>+8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-purple-500' />
              <div className='text-2xl font-bold'>342h</div>
            </div>
            <p className='text-xs text-muted-foreground'>Tiempo Total</p>
            <div className='flex items-center gap-1 mt-1'>
              <TrendingUp className='h-3 w-3 text-green-500' />
              <span className='text-xs text-green-500'>+15%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4 text-orange-500' />
              <div className='text-2xl font-bold'>87%</div>
            </div>
            <p className='text-xs text-muted-foreground'>Engagement Promedio</p>
            <div className='flex items-center gap-1 mt-1'>
              <TrendingUp className='h-3 w-3 text-green-500' />
              <span className='text-xs text-green-500'>+3%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Participation Trends */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Tendencias de Participación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg'>
              <div className='text-center'>
                <BarChart3 className='h-12 w-12 text-muted-foreground mx-auto mb-2' />
                <p className='text-sm text-muted-foreground'>
                  Gráfico de tendencias
                </p>
                <p className='text-xs text-muted-foreground'>
                  Datos de los últimos 30 días
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Video className='h-5 w-5' />
              Distribución por Proveedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 bg-blue-500 rounded-full'></div>
                  <span className='text-sm'>Google Meet</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>65%</span>
                  <Badge variant='secondary'>102 reuniones</Badge>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 bg-purple-500 rounded-full'></div>
                  <span className='text-sm'>Zoom</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>28%</span>
                  <Badge variant='secondary'>44 reuniones</Badge>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 bg-green-500 rounded-full'></div>
                  <span className='text-sm'>Vimeo</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>7%</span>
                  <Badge variant='secondary'>10 reuniones</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Métricas de Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Tiempo promedio en reunión</span>
                <span className='font-medium'>2h 15m</span>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full'
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Participación en chat</span>
                <span className='font-medium'>68%</span>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-green-500 h-2 rounded-full'
                  style={{ width: "68%" }}
                ></div>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Cámaras activadas</span>
                <span className='font-medium'>82%</span>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-purple-500 h-2 rounded-full'
                  style={{ width: "82%" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Reuniones Destacadas
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between p-2 border rounded'>
              <div>
                <p className='text-sm font-medium'>Master IBM - Sesión 5</p>
                <p className='text-xs text-muted-foreground'>
                  95 participantes
                </p>
              </div>
              <Badge className='bg-green-500'>98% engagement</Badge>
            </div>

            <div className='flex items-center justify-between p-2 border rounded'>
              <div>
                <p className='text-sm font-medium'>Consultoría Estratégica</p>
                <p className='text-xs text-muted-foreground'>
                  42 participantes
                </p>
              </div>
              <Badge className='bg-blue-500'>94% engagement</Badge>
            </div>

            <div className='flex items-center justify-between p-2 border rounded'>
              <div>
                <p className='text-sm font-medium'>Workshop Creatividad</p>
                <p className='text-xs text-muted-foreground'>
                  28 participantes
                </p>
              </div>
              <Badge className='bg-purple-500'>91% engagement</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='h-2 w-2 bg-green-500 rounded-full mt-2'></div>
              <div>
                <p className='text-sm'>Reunión completada</p>
                <p className='text-xs text-muted-foreground'>
                  Master IBM - 2h 30m
                </p>
                <p className='text-xs text-muted-foreground'>Hace 1 hora</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='h-2 w-2 bg-blue-500 rounded-full mt-2'></div>
              <div>
                <p className='text-sm'>Transcripción generada</p>
                <p className='text-xs text-muted-foreground'>
                  Consultoría Estratégica
                </p>
                <p className='text-xs text-muted-foreground'>Hace 3 horas</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='h-2 w-2 bg-orange-500 rounded-full mt-2'></div>
              <div>
                <p className='text-sm'>Grabación procesada</p>
                <p className='text-xs text-muted-foreground'>
                  Workshop Creatividad
                </p>
                <p className='text-xs text-muted-foreground'>Hace 5 horas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            Exportar Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <Button variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Exportar CSV
            </Button>
            <Button variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Exportar Excel
            </Button>
            <Button variant='outline'>
              <Eye className='h-4 w-4 mr-2' />
              Generar Reporte PDF
            </Button>
            <Button variant='outline'>
              <Calendar className='h-4 w-4 mr-2' />
              Programar Reporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
