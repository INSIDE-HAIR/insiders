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
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Separator } from "@/src/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Settings,
  Shield,
  Users,
  Clock,
  Bell,
  Database,
  Save,
  RotateCcw,
} from "lucide-react";

export default function VideoSettingsClient() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState({
    // General Settings
    defaultProvider: "GOOGLE_MEET",
    maxParticipantsDefault: 100,
    defaultMeetingDuration: 120,
    autoRecording: true,
    autoTranscription: false,

    // Permission Settings
    allowEmployeeCreate: true,
    requireApprovalForLarge: true,
    largeThreshold: 50,
    maxSpacesPerUser: 10,

    // Notification Settings
    emailNotifications: true,
    webhookNotifications: true,
    slackIntegration: false,

    // Performance Settings
    cacheEnabled: true,
    cacheTTL: 300,
    rateLimitEnabled: true,
    maxRequestsPerMinute: 60,
  });

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
                No tienes permisos para acceder a la configuración de video.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    // En una implementación real, aquí se guardarían los settings
    console.log("Saving settings:", settings);
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      defaultProvider: "GOOGLE_MEET",
      maxParticipantsDefault: 100,
      defaultMeetingDuration: 120,
      autoRecording: true,
      autoTranscription: false,
      allowEmployeeCreate: true,
      requireApprovalForLarge: true,
      largeThreshold: 50,
      maxSpacesPerUser: 10,
      emailNotifications: true,
      webhookNotifications: true,
      slackIntegration: false,
      cacheEnabled: true,
      cacheTTL: 300,
      rateLimitEnabled: true,
      maxRequestsPerMinute: 60,
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Settings className='h-8 w-8 text-primary' />
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Configuración de Video
            </h1>
            <p className='text-muted-foreground'>
              Ajusta configuraciones generales, permisos y políticas del sistema
            </p>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='defaultProvider'>Proveedor por Defecto</Label>
              <Select
                value={settings.defaultProvider}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultProvider: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='GOOGLE_MEET'>Google Meet</SelectItem>
                  <SelectItem value='ZOOM'>Zoom</SelectItem>
                  <SelectItem value='VIMEO'>Vimeo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='maxParticipants'>
                Máximo Participantes por Defecto
              </Label>
              <Input
                id='maxParticipants'
                type='number'
                value={settings.maxParticipantsDefault}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxParticipantsDefault: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='duration'>Duración por Defecto (minutos)</Label>
              <Input
                id='duration'
                type='number'
                value={settings.defaultMeetingDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultMeetingDuration: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='autoRecording'>Grabación Automática</Label>
                  <p className='text-sm text-muted-foreground'>
                    Activar grabación por defecto
                  </p>
                </div>
                <Switch
                  id='autoRecording'
                  checked={settings.autoRecording}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoRecording: checked })
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='autoTranscription'>
                    Transcripción Automática
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Generar transcripciones automáticamente
                  </p>
                </div>
                <Switch
                  id='autoTranscription'
                  checked={settings.autoTranscription}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoTranscription: checked })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Configuración de Permisos
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='allowEmployeeCreate'>
                    Empleados Pueden Crear
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Permitir a empleados crear espacios
                  </p>
                </div>
                <Switch
                  id='allowEmployeeCreate'
                  checked={settings.allowEmployeeCreate}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowEmployeeCreate: checked })
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='requireApproval'>Requiere Aprobación</Label>
                  <p className='text-sm text-muted-foreground'>
                    Para reuniones grandes
                  </p>
                </div>
                <Switch
                  id='requireApproval'
                  checked={settings.requireApprovalForLarge}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      requireApprovalForLarge: checked,
                    })
                  }
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='largeThreshold'>
                  Umbral para Reunión Grande
                </Label>
                <Input
                  id='largeThreshold'
                  type='number'
                  value={settings.largeThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      largeThreshold: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxSpaces'>Máximo Espacios por Usuario</Label>
                <Input
                  id='maxSpaces'
                  type='number'
                  value={settings.maxSpacesPerUser}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxSpacesPerUser: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className='text-sm font-medium mb-3'>Roles y Permisos</h4>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div>
                  <p className='font-medium'>ADMIN</p>
                  <p className='text-sm text-muted-foreground'>
                    Acceso completo a todas las funciones
                  </p>
                </div>
                <Badge className='bg-green-500'>Todos los permisos</Badge>
              </div>

              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div>
                  <p className='font-medium'>TRAINER</p>
                  <p className='text-sm text-muted-foreground'>
                    Puede crear y gestionar sus propios espacios
                  </p>
                </div>
                <Badge variant='secondary'>Permisos limitados</Badge>
              </div>

              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div>
                  <p className='font-medium'>EMPLOYEE</p>
                  <p className='text-sm text-muted-foreground'>
                    Acceso básico con restricciones
                  </p>
                </div>
                <Badge variant='outline'>Solo lectura</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Configuración de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='emailNotifications'>
                    Notificaciones por Email
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Enviar emails para eventos importantes
                  </p>
                </div>
                <Switch
                  id='emailNotifications'
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='webhookNotifications'>
                    Notificaciones Webhook
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Enviar webhooks a sistemas externos
                  </p>
                </div>
                <Switch
                  id='webhookNotifications'
                  checked={settings.webhookNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, webhookNotifications: checked })
                  }
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='slackIntegration'>
                    Integración con Slack
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Enviar notificaciones a Slack
                  </p>
                </div>
                <Switch
                  id='slackIntegration'
                  checked={settings.slackIntegration}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, slackIntegration: checked })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Database className='h-5 w-5' />
            Configuración de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='cacheEnabled'>Caché Habilitado</Label>
                  <p className='text-sm text-muted-foreground'>
                    Usar caché para mejorar rendimiento
                  </p>
                </div>
                <Switch
                  id='cacheEnabled'
                  checked={settings.cacheEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, cacheEnabled: checked })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='cacheTTL'>TTL del Caché (segundos)</Label>
                <Input
                  id='cacheTTL'
                  type='number'
                  value={settings.cacheTTL}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cacheTTL: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='rateLimitEnabled'>Rate Limiting</Label>
                  <p className='text-sm text-muted-foreground'>
                    Limitar requests por minuto
                  </p>
                </div>
                <Switch
                  id='rateLimitEnabled'
                  checked={settings.rateLimitEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, rateLimitEnabled: checked })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxRequests'>Máximo Requests por Minuto</Label>
                <Input
                  id='maxRequests'
                  type='number'
                  value={settings.maxRequestsPerMinute}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxRequestsPerMinute: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className='flex gap-4'>
        <Button onClick={handleSave} className='flex-1 md:flex-none'>
          <Save className='h-4 w-4 mr-2' />
          Guardar Configuración
        </Button>
        <Button variant='outline' onClick={handleReset}>
          <RotateCcw className='h-4 w-4 mr-2' />
          Restablecer
        </Button>
      </div>
    </div>
  );
}
