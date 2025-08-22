/**
 * DASHBOARDTEMPLATE - Template para el dashboard principal de Meet
 * Muestra overview general, estadísticas y accesos rápidos
 * Orquesta componentes de analytics, actividad y gestión
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  VideoCameraIcon,
  PlusIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

// Importar componentes
import { AnalyticsDashboard } from "../organisms/analytics/AnalyticsDashboard";
import { ActivityFeed } from "../organisms/activity/ActivityFeed";

// Importar stores
import { useRoomStore, useSettingsStore, useNotificationStore } from "../../stores";

// Types
export interface DashboardTemplateProps {
  onCreateRoom?: () => void;
  onViewAllRooms?: () => void;
  onManageSettings?: () => void;
  className?: string;
}

/**
 * Template principal del dashboard de Meet
 * Proporciona vista general del sistema con métricas y accesos rápidos
 */
export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  onCreateRoom,
  onViewAllRooms,
  onManageSettings,
  className,
}) => {
  const { rooms } = useRoomStore();
  const { preferences } = useSettingsStore();
  const { showInfo } = useNotificationStore();

  // Convert rooms record to array and calculate stats
  const roomsArray = Object.values(rooms);
  const activeRooms = roomsArray.filter(room => !!room.activeConference?.conferenceRecord);
  const recentRooms = roomsArray
    .filter(room => room._metadata?.createdAt)
    .sort((a, b) => {
      const dateA = new Date(a._metadata!.createdAt!).getTime();
      const dateB = new Date(b._metadata!.createdAt!).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const stats = {
    totalRooms: roomsArray.length,
    activeRooms: activeRooms.length,
    trustedRooms: roomsArray.filter(room => room.config?.accessType === "TRUSTED").length,
    openRooms: roomsArray.filter(room => room.config?.accessType === "OPEN").length,
    restrictedRooms: roomsArray.filter(room => room.config?.accessType === "RESTRICTED").length,
    // Simulated growth (would come from real analytics)
    growth: {
      totalRoomsChange: 12,
      activeRoomsChange: 5,
      usageChange: 23,
    }
  };

  const quickActions = [
    {
      title: "Nueva Sala",
      description: "Crear sala de reuniones",
      icon: PlusIcon,
      color: "bg-blue-500",
      onClick: onCreateRoom,
    },
    {
      title: "Ver Todas las Salas",
      description: `Gestionar ${stats.totalRooms} salas`,
      icon: VideoCameraIcon,
      color: "bg-green-500",
      onClick: onViewAllRooms,
    },
    {
      title: "Configuración",
      description: "Ajustes generales",
      icon: Cog6ToothIcon,
      color: "bg-purple-500",
      onClick: onManageSettings,
    },
    {
      title: "Analytics",
      description: "Ver métricas detalladas",
      icon: ChartBarIcon,
      color: "bg-orange-500",
      onClick: () => showInfo("Analytics", "Revisa las métricas detalladas en la pestaña Analytics"),
    },
  ];

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Meet</h1>
          <p className="text-muted-foreground">
            Bienvenido al panel de control de Google Meet
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Última actualización: {new Date().toLocaleTimeString("es-ES")}
          </p>
          <Badge variant="outline" className="mt-1">
            {preferences.language === "es" ? "Español" : "English"}
          </Badge>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Salas</p>
                <p className="text-3xl font-bold">{stats.totalRooms}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats.growth.totalRoomsChange}%</span>
                  <span className="text-sm text-muted-foreground ml-1">este mes</span>
                </div>
              </div>
              <VideoCameraIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Salas Activas</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeRooms}</p>
                <div className="flex items-center mt-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-muted-foreground">En vivo ahora</span>
                </div>
              </div>
              <div className="relative">
                <ClockIcon className="h-8 w-8 text-green-500" />
                {stats.activeRooms > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uso del Sistema</p>
                <p className="text-3xl font-bold text-purple-600">78%</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats.growth.usageChange}%</span>
                  <span className="text-sm text-muted-foreground ml-1">vs mes anterior</span>
                </div>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Configuración</p>
                <p className="text-lg font-semibold">{preferences.defaultAccessType}</p>
                <div className="flex items-center mt-2 space-x-2">
                  {preferences.defaultRecording && <Badge variant="outline" className="text-xs">Grab.</Badge>}
                  {preferences.defaultTranscription && <Badge variant="outline" className="text-xs">Trans.</Badge>}
                  {preferences.defaultModeration && <Badge variant="outline" className="text-xs">Mod.</Badge>}
                </div>
              </div>
              <Cog6ToothIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted"
                  onClick={action.onClick}
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-muted-foreground ml-auto" />
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            Actividad
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <VideoCameraIcon className="h-4 w-4" />
            Salas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5" />
                  Distribución por Tipo de Acceso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Organizacional (TRUSTED)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{stats.trustedRooms}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({Math.round((stats.trustedRooms / Math.max(stats.totalRooms, 1)) * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Libre (OPEN)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{stats.openRooms}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({Math.round((stats.openRooms / Math.max(stats.totalRooms, 1)) * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Solo Invitados (RESTRICTED)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{stats.restrictedRooms}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({Math.round((stats.restrictedRooms / Math.max(stats.totalRooms, 1)) * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Rooms */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-5 w-5" />
                    Salas Recientes
                  </CardTitle>
                  {onViewAllRooms && (
                    <Button variant="ghost" size="sm" onClick={onViewAllRooms}>
                      Ver todas
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {recentRooms.length > 0 ? (
                  <div className="space-y-3">
                    {recentRooms.map((room, index) => (
                      <div key={room.name || index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                        <div className="flex items-center gap-3">
                          <VideoCameraIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {room._metadata?.displayName || room.name || 'Sala sin nombre'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {room._metadata?.createdAt 
                                ? new Date(room._metadata.createdAt).toLocaleDateString("es-ES")
                                : 'Fecha desconocida'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {room.activeConference?.conferenceRecord && (
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {room.config?.accessType || 'UNKNOWN'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay salas recientes
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed
            roomId={undefined} // Show global activity
            realTime={true}
            showFilters={true}
            limit={30}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard
            roomId={undefined} // Show global analytics
            timeframe="30d"
          />
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardContent className="py-12 text-center">
              <VideoCameraIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vista de Salas</h3>
              <p className="text-muted-foreground mb-4">
                Para ver y gestionar todas las salas, usa el botón Ver Todas las Salas
              </p>
              {onViewAllRooms && (
                <Button onClick={onViewAllRooms}>
                  <VideoCameraIcon className="h-4 w-4 mr-2" />
                  Ver Todas las Salas
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};