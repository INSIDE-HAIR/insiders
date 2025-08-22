import React from "react";
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
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CogIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { AccessTypeBadge } from "../../atoms/badges/AccessTypeBadge";
import { FeatureIcon } from "../../atoms/icons/FeatureIcon";
import { cn } from "@/src/lib/utils";

export interface OrganizationData {
  _metadata?: {
    organizationId?: string;
    organizationName?: string;
    domain?: string;
    createdBy?: string;
    createdByEmail?: string;
  };
  config?: {
    accessType?: "OPEN" | "TRUSTED" | "RESTRICTED";
    entryPointAccess?: "ALL" | "CREATOR_APP_ONLY";
  };
  membershipSettings?: {
    maxParticipants?: number;
    allowAnonymous?: boolean;
    requireApproval?: boolean;
  };
  integrations?: {
    calendar?: boolean;
    drive?: boolean;
    chat?: boolean;
  };
  analytics?: {
    totalMeetings?: number;
    totalHours?: number;
    avgParticipants?: number;
    lastUsed?: Date;
  };
}

export interface OrganizationSectionProps {
  room: OrganizationData;
  onUpdateOrganizationSettings?: (settings: any) => Promise<void>;
  onViewAnalytics?: () => void;
  onManageIntegrations?: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * Sección de organización con información de la empresa, configuraciones y integraciones
 * Incluye estadísticas de uso y configuraciones organizacionales
 */
export const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  room,
  onUpdateOrganizationSettings,
  onViewAnalytics,
  onManageIntegrations,
  loading = false,
  className,
}) => {
  const orgData = room._metadata;
  const config = room.config;
  const analytics = room.analytics;
  const integrations = room.integrations;

  const formatDate = (date?: Date) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHours = (hours?: number) => {
    if (!hours) return "0h";
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    return `${Math.round(hours)}h`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Información de la Organización */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BuildingOfficeIcon className='h-5 w-5 text-primary' />
            Información de la Organización
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  Organización:
                </span>
                <span className='font-medium'>
                  {orgData?.organizationName || "Sin definir"}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Dominio:</span>
                <code className='text-sm bg-muted px-2 py-1 rounded'>
                  {orgData?.domain || "Sin dominio"}
                </code>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  Creada por:
                </span>
                <div className='text-right'>
                  <p className='font-medium text-sm'>
                    {orgData?.createdBy || "Desconocido"}
                  </p>
                  {orgData?.createdByEmail && (
                    <p className='text-xs text-muted-foreground'>
                      {orgData.createdByEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  Tipo de acceso:
                </span>
                {config?.accessType && (
                  <AccessTypeBadge type={config.accessType} />
                )}
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  Puntos de entrada:
                </span>
                <Badge
                  variant={
                    config?.entryPointAccess === "ALL" ? "default" : "secondary"
                  }
                >
                  {config?.entryPointAccess === "ALL"
                    ? "Todos"
                    : "Solo creador"}
                </Badge>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  ID Organización:
                </span>
                <code className='text-xs bg-muted px-2 py-1 rounded'>
                  {orgData?.organizationId?.substring(0, 12) || "N/A"}...
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuraciones de Membresía */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserGroupIcon className='h-5 w-5 text-primary' />
            Configuraciones de Membresía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <UsersIcon className='h-4 w-4' />
                <span className='text-sm font-medium'>Máx. Participantes</span>
              </div>
              <p className='text-2xl font-bold text-primary'>
                {room.membershipSettings?.maxParticipants || "∞"}
              </p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <EyeIcon className='h-4 w-4' />
                <span className='text-sm font-medium'>Acceso Anónimo</span>
              </div>
              <Badge
                variant={
                  room.membershipSettings?.allowAnonymous
                    ? "default"
                    : "secondary"
                }
              >
                {room.membershipSettings?.allowAnonymous
                  ? "Permitido"
                  : "Restringido"}
              </Badge>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <CogIcon className='h-4 w-4' />
                <span className='text-sm font-medium'>
                  Aprobación Requerida
                </span>
              </div>
              <Badge
                variant={
                  room.membershipSettings?.requireApproval
                    ? "destructive"
                    : "default"
                }
              >
                {room.membershipSettings?.requireApproval ? "Sí" : "No"}
              </Badge>
            </div>
          </div>

          {onUpdateOrganizationSettings && (
            <div className='mt-4 pt-4 border-t'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onUpdateOrganizationSettings({})}
                disabled={loading}
              >
                <CogIcon className='h-4 w-4 mr-2' />
                Configurar Membresía
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integraciones */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <GlobeAltIcon className='h-5 w-5 text-primary' />
              Integraciones
            </CardTitle>
            {onManageIntegrations && (
              <Button
                variant='outline'
                size='sm'
                onClick={onManageIntegrations}
                disabled={loading}
              >
                <CogIcon className='h-4 w-4 mr-2' />
                Administrar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center justify-between p-3 border rounded-lg'>
              <div className='flex items-center gap-2'>
                <CalendarIcon className='h-4 w-4' />
                <span className='text-sm font-medium'>Google Calendar</span>
              </div>
              <Badge variant={integrations?.calendar ? "default" : "secondary"}>
                {integrations?.calendar ? "Activa" : "Inactiva"}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 border rounded-lg'>
              <div className='flex items-center gap-2'>
                <FolderIcon className='h-4 w-4' />
                <span className='text-sm font-medium'>Google Drive</span>
              </div>
              <Badge variant={integrations?.drive ? "default" : "secondary"}>
                {integrations?.drive ? "Activa" : "Inactiva"}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 border rounded-lg'>
              <div className='flex items-center gap-2'>
                <ChatBubbleLeftIcon className='h-4 w-4' />
                <span className='text-sm font-medium'>Chat</span>
              </div>
              <Badge variant={integrations?.chat ? "default" : "secondary"}>
                {integrations?.chat ? "Activa" : "Inactiva"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de Uso */}
      {analytics && (
        <Card>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <ChartBarIcon className='h-5 w-5 text-primary' />
                Estadísticas de Uso
              </CardTitle>
              {onViewAnalytics && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onViewAnalytics}
                  disabled={loading}
                >
                  <ChartBarIcon className='h-4 w-4 mr-2' />
                  Ver Detalles
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Total de Reuniones
                </p>
                <p className='text-2xl font-bold text-primary'>
                  {analytics.totalMeetings || 0}
                </p>
              </div>

              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>Horas Totales</p>
                <p className='text-2xl font-bold text-primary'>
                  {formatHours(analytics.totalHours)}
                </p>
              </div>

              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Promedio de Participantes
                </p>
                <p className='text-2xl font-bold text-primary'>
                  {analytics.avgParticipants || 0}
                </p>
              </div>

              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>Último Uso</p>
                <p className='text-sm font-medium'>
                  {formatDate(analytics.lastUsed)}
                </p>
              </div>
            </div>

            <Separator className='my-4' />

            <div className='flex justify-center'>
              <div className='text-center space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Rendimiento general de la sala
                </p>
                <div className='flex items-center gap-2 justify-center'>
                  <div className='h-2 w-24 bg-muted rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary transition-all duration-300'
                      style={{
                        width: `${Math.min(((analytics.totalMeetings || 0) / 50) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {Math.round(((analytics.totalMeetings || 0) / 50) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
