import { Metadata } from "next";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Video,
  Activity,
  Calendar,
  Download,
  Eye,
  UserCheck,
  Timer,
  Mic,
  Monitor,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Google Meet - Analytics",
  description: "Panel de análisis y métricas para salas de Google Meet",
  keywords: ["Google Meet", "Analytics", "Métricas", "Estadísticas"],
};

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

// Mock data for demonstration
const analyticsData = {
  overview: {
    totalRooms: 127,
    totalMeetings: 1843,
    totalParticipants: 5672,
    totalHours: 3891,
    trends: {
      rooms: 12.5,
      meetings: -3.2,
      participants: 18.7,
      hours: 24.1,
    }
  },
  usage: {
    today: 45,
    thisWeek: 312,
    thisMonth: 1247,
    avgDuration: 42,
    peakHour: "14:00-15:00",
    mostActiveDay: "Martes"
  },
  features: {
    recording: 89,
    transcription: 76,
    smartNotes: 43,
    screenSharing: 95,
  }
};

export default async function MeetAnalyticsPage({ params }: PageProps) {
  const resolvedParams = await params;

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-3 w-3 text-primary" />;
    if (value < 0) return <ArrowDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-primary";
    if (value < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div>
      <DocHeader
        title="Google Meet - Analytics"
        description="Panel completo de análisis y métricas para el uso de Google Meet y gestión de salas"
        icon={BarChart3}
      />

      <DocContent>
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Métricas en Tiempo Real:</strong> Datos actualizados cada 15 minutos. 
            Última actualización: {new Date().toLocaleString('es-ES')}.
          </AlertDescription>
        </Alert>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Salas</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalRooms}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(analyticsData.overview.trends.rooms)}
                <span className={`ml-1 ${getTrendColor(analyticsData.overview.trends.rooms)}`}>
                  {Math.abs(analyticsData.overview.trends.rooms)}% vs mes anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reuniones</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalMeetings.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(analyticsData.overview.trends.meetings)}
                <span className={`ml-1 ${getTrendColor(analyticsData.overview.trends.meetings)}`}>
                  {Math.abs(analyticsData.overview.trends.meetings)}% vs mes anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalParticipants.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(analyticsData.overview.trends.participants)}
                <span className={`ml-1 ${getTrendColor(analyticsData.overview.trends.participants)}`}>
                  {Math.abs(analyticsData.overview.trends.participants)}% vs mes anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalHours.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(analyticsData.overview.trends.hours)}
                <span className={`ml-1 ${getTrendColor(analyticsData.overview.trends.hours)}`}>
                  {Math.abs(analyticsData.overview.trends.hours)}% vs mes anterior
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usage">Uso</TabsTrigger>
            <TabsTrigger value="features">Características</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>
                    Métricas de uso en diferentes períodos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hoy</span>
                      <Badge variant="default">{analyticsData.usage.today} reuniones</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Esta semana</span>
                      <Badge variant="secondary">{analyticsData.usage.thisWeek} reuniones</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Este mes</span>
                      <Badge variant="outline">{analyticsData.usage.thisMonth.toLocaleString()} reuniones</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Duración promedio</span>
                      <span className="text-sm font-medium">{analyticsData.usage.avgDuration} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hora pico</span>
                      <span className="text-sm font-medium">{analyticsData.usage.peakHour}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Día más activo</span>
                      <span className="text-sm font-medium">{analyticsData.usage.mostActiveDay}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Participación
                  </CardTitle>
                  <CardDescription>
                    Estadísticas de asistencia y participación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Promedio de asistentes</span>
                      <Badge variant="default">12.3 personas</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tasa de asistencia</span>
                      <Badge variant="secondary">87%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reuniones sin host</span>
                      <Badge variant="destructive">3.2%</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Top Hosts</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">maria@company.com</span>
                        <span>45 reuniones</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">carlos@company.com</span>
                        <span>38 reuniones</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ana@company.com</span>
                        <span>32 reuniones</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Uso de Características
                  </CardTitle>
                  <CardDescription>
                    Adopción de las funcionalidades de Meet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Grabación</span>
                        <span className="text-sm font-medium">{analyticsData.features.recording}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${analyticsData.features.recording}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Transcripción</span>
                        <span className="text-sm font-medium">{analyticsData.features.transcription}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${analyticsData.features.transcription}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Notas Inteligentes</span>
                        <span className="text-sm font-medium">{analyticsData.features.smartNotes}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${analyticsData.features.smartNotes}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Compartir Pantalla</span>
                        <span className="text-sm font-medium">{analyticsData.features.screenSharing}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${analyticsData.features.screenSharing}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    Dispositivos y Calidad
                  </CardTitle>
                  <CardDescription>
                    Distribución de dispositivos y calidad de conexión
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Dispositivos</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Desktop</span>
                        <Badge variant="default">68%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mobile</span>
                        <Badge variant="secondary">22%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tablet</span>
                        <Badge variant="outline">10%</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Calidad de Audio/Video</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">HD (720p+)</span>
                        <Badge variant="default">85%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Audio claro</span>
                        <Badge variant="secondary">92%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sin problemas</span>
                        <Badge variant="outline">78%</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    Métricas de Rendimiento
                  </CardTitle>
                  <CardDescription>
                    Latencia y calidad de las conexiones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Latencia promedio</span>
                      <Badge variant="default">45ms</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tiempo de conexión</span>
                      <Badge variant="secondary">2.3s</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pérdida de paquetes</span>
                      <Badge variant="outline">0.2%</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Problemas Reportados</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Audio cortado</span>
                        <Badge variant="destructive" className="text-xs">12</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Video pixelado</span>
                        <Badge variant="destructive" className="text-xs">8</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desconexiones</span>
                        <Badge variant="destructive" className="text-xs">5</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Distribución Geográfica
                  </CardTitle>
                  <CardDescription>
                    Ubicaciones de los participantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">España</span>
                      <Badge variant="default">45%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">México</span>
                      <Badge variant="secondary">28%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Argentina</span>
                      <Badge variant="outline">15%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Colombia</span>
                      <Badge variant="outline">12%</Badge>
                    </div>
                  </div>

                  <Separator />

                  <Alert className="border-primary/20 bg-primary/5">
                    <Globe className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs">
                      Mejor rendimiento observado en horario 10:00-16:00 CET.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Reportes Disponibles
                  </CardTitle>
                  <CardDescription>
                    Exporta datos para análisis detallado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Reporte de Uso Mensual (CSV)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Estadísticas de Participación (PDF)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Análisis de Calidad (Excel)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Log de Eventos (JSON)
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Reportes Programados</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>• Reporte semanal los lunes</div>
                      <div>• Resumen mensual el día 1</div>
                      <div>• Alertas de calidad en tiempo real</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Insights y Recomendaciones
                  </CardTitle>
                  <CardDescription>
                    Sugerencias basadas en el análisis de datos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Alert className="border-primary/20 bg-primary/5">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-xs">
                        <strong>Oportunidad:</strong> 23% más de uso los martes. 
                        Considera programar eventos importantes ese día.
                      </AlertDescription>
                    </Alert>

                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                      <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-xs">
                        <strong>Atención:</strong> 15% de reuniones duran menos de 5 minutos. 
                        Revisa la configuración de salas.
                      </AlertDescription>
                    </Alert>

                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                      <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-xs">
                        <strong>Éxito:</strong> 87% de tasa de asistencia, 
                        superior al promedio de la industria (72%).
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Button size="sm" className="w-full">
                    Ver Análisis Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DocContent>
    </div>
  );
}