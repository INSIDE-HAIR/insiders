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
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import {
  Video,
  Users,
  BarChart3,
  Settings,
  Calendar,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  TrendingUp,
  Activity,
  Globe,
  Database,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Google Meet - Dashboard",
  description: "Panel principal para la gestión de Google Meet API v2 y salas de videoconferencia",
  keywords: ["Google Meet", "Dashboard", "Videoconferencias", "Gestión"],
};

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

// Mock data for the dashboard
const dashboardData = {
  stats: {
    activeRooms: 15,
    todayMeetings: 23,
    totalParticipants: 147,
    ongoingMeetings: 3,
  },
  recentActivity: [
    { type: "room_created", title: "Nueva sala: Team Standup", time: "hace 15 min" },
    { type: "meeting_started", title: "Reunión iniciada: Product Review", time: "hace 32 min" },
    { type: "recording_ready", title: "Grabación disponible: All Hands", time: "hace 1h" },
  ],
  quickActions: [
    { title: "Crear Sala", description: "Nueva sala de Meet", icon: Video, href: "/admin/meet/rooms" },
    { title: "Ver Analytics", description: "Métricas y estadísticas", icon: BarChart3, href: "/admin/meet/analytics" },
    { title: "Configuración", description: "Ajustes del sistema", icon: Settings, href: "/admin/meet/settings" },
  ]
};

export default async function MeetDashboardPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div>
      <DocHeader
        title="Google Meet - Dashboard"
        description="Panel principal para la gestión completa de Google Meet API v2, salas y espacios de videoconferencia"
        icon={Video}
      />

      <DocContent>
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Zap className="h-4 w-4 text-primary" />
          <AlertTitle>Google Meet API v2 Integrado</AlertTitle>
          <AlertDescription className="text-foreground">
            Sistema completamente funcional con Google Meet Spaces API, gestión avanzada de salas 
            y análisis en tiempo real de videoconferencias.
          </AlertDescription>
        </Alert>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salas Activas</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{dashboardData.stats.activeRooms}</div>
              <p className="text-xs text-muted-foreground">
                +2 desde ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reuniones Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{dashboardData.stats.todayMeetings}</div>
              <p className="text-xs text-muted-foreground">
                +12% vs ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{dashboardData.stats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                En las últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Curso</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{dashboardData.stats.ongoingMeetings}</div>
              <p className="text-xs text-muted-foreground">
                Reuniones activas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Acceso directo a las funciones principales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  asChild
                  className="w-full justify-start h-auto p-4"
                >
                  <Link href={action.href}>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground">{action.description}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </div>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimos eventos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg border border-border/50">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {activity.type === "room_created" && <Video className="h-4 w-4 text-primary" />}
                    {activity.type === "meeting_started" && <Play className="h-4 w-4 text-primary" />}
                    {activity.type === "recording_ready" && <Database className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-4">
                Ver Todo el Historial
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Monitoreo de la integración con Google Meet API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Google Meet API</span>
                </div>
                <Badge variant="default" className="text-xs">Operativo</Badge>
                <p className="text-xs text-muted-foreground">Última verificación: hace 2 min</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Spaces Management</span>
                </div>
                <Badge variant="default" className="text-xs">Operativo</Badge>
                <p className="text-xs text-muted-foreground">15 espacios activos</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Calendar Integration</span>
                </div>
                <Badge variant="default" className="text-xs">Operativo</Badge>
                <p className="text-xs text-muted-foreground">Sincronización activa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Gestión de Salas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Creación, configuración y gestión completa de espacios de Google Meet.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Espacios permanentes</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Configuración de permisos</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Gestión de participantes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Analytics Avanzados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Métricas detalladas de uso, participación y calidad de reuniones.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Estadísticas en tiempo real</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Reportes automatizados</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Insights inteligentes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Integración Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Conexión perfecta con Google Calendar y Drive para máxima productividad.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Google Calendar</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Google Drive</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Grabaciones automáticas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DocContent>
    </div>
  );
}