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
  Settings,
  Shield,
  Users,
  Video,
  Mic,
  Globe,
  Database,
  Key,
  Bell,
  Activity,
  Lock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Google Meet - Configuración",
  description: "Configuración avanzada para Google Meet API y gestión de salas",
  keywords: ["Google Meet", "Configuración", "API", "Videoconferencias"],
};

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function MeetSettingsPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div>
      <DocHeader
        title="Google Meet - Configuración"
        description="Configuración avanzada para la integración de Google Meet API y gestión de salas de videoconferencia"
        icon={Settings}
      />

      <DocContent>
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Configuración del Sistema:</strong> Ajusta los parámetros de la integración con Google Meet API v2 
            para optimizar la gestión de salas y espacios de videoconferencia.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="rooms">Room Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    API Credentials
                  </CardTitle>
                  <CardDescription>
                    Configuración de credenciales para Google Meet API v2
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Google Cloud Project ID</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        insiders-marketing-salon
                      </Badge>
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meet API Status</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Enabled</Badge>
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">OAuth 2.0 Client</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Configured</Badge>
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Required Scopes</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-xs font-mono">https://www.googleapis.com/auth/meetings.space.created</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-xs font-mono">https://www.googleapis.com/auth/meetings.space.readonly</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-xs font-mono">https://www.googleapis.com/auth/calendar.events</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Test API Connection
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Rate Limiting
                  </CardTitle>
                  <CardDescription>
                    Límites de velocidad y cuotas para la API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Requests per minute</span>
                      <Badge variant="outline">100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Daily quota</span>
                      <Badge variant="outline">10,000</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Concurrent spaces</span>
                      <Badge variant="outline">50</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Current Usage</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Today</span>
                        <span className="text-sm">1,247 / 10,000</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    View Usage Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Default Room Settings
                  </CardTitle>
                  <CardDescription>
                    Configuración predeterminada para nuevas salas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Access Type</span>
                      <Badge variant="default">TRUSTED</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recording</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Transcription</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Smart Notes</span>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Entry Points</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-xs">Phone numbers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-xs">SIP addresses</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Update Defaults
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Member Management
                  </CardTitle>
                  <CardDescription>
                    Configuración de miembros y permisos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-add organizers</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Default viewer role</span>
                      <Badge variant="secondary">VIEWER</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Moderation</span>
                      <Badge variant="outline">Manual</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Chat & Reactions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Chat messages</span>
                        <Badge variant="secondary">HOSTS_AND_COHOSTS</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Reactions</span>
                        <Badge variant="secondary">HOSTS_AND_COHOSTS</Badge>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Configure Permissions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Policies
                  </CardTitle>
                  <CardDescription>
                    Políticas de seguridad y acceso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Waiting room</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meeting lock</span>
                      <Badge variant="secondary">Auto after 10 min</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Screen sharing</span>
                      <Badge variant="secondary">Hosts only</Badge>
                    </div>
                  </div>

                  <Separator />

                  <Alert className="border-primary/20 bg-primary/5">
                    <Lock className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs">
                      Las políticas de seguridad se aplican automáticamente a todas las nuevas salas.
                    </AlertDescription>
                  </Alert>

                  <Button variant="outline" size="sm" className="w-full">
                    Review Security Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Audit & Monitoring
                  </CardTitle>
                  <CardDescription>
                    Seguimiento y auditoría de actividad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Activity logging</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Attendance tracking</span>
                      <Badge variant="secondary">Detailed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Export logs</span>
                      <Badge variant="outline">Weekly</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Activity</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>• 15 rooms created today</div>
                      <div>• 847 participants joined</div>
                      <div>• 23 recordings generated</div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    View Full Audit Log
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>
                    Canales de notificación configurados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email notifications</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Slack integration</span>
                      <Badge variant="outline">Not configured</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Webhook endpoints</span>
                      <Badge variant="secondary">2 active</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Event Types</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-xs">Room created</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-xs">Meeting started/ended</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-xs">Recording available</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Configure Channels
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Integration Status
                  </CardTitle>
                  <CardDescription>
                    Estado de integraciones externas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Google Calendar</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Google Drive</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Zoom (optional)</span>
                      <Badge variant="outline">Not connected</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Vimeo (optional)</span>
                      <Badge variant="outline">Not connected</Badge>
                    </div>
                  </div>

                  <Separator />

                  <Alert className="border-primary/20 bg-primary/5">
                    <Zap className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs">
                      Todas las integraciones principales están funcionando correctamente.
                    </AlertDescription>
                  </Alert>

                  <Button variant="outline" size="sm" className="w-full">
                    Test All Integrations
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