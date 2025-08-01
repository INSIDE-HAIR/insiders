/**
 * Calendar Dashboard
 * 
 * Página principal del módulo de Calendar que proporciona:
 * - Resumen de calendarios disponibles
 * - Estadísticas de eventos
 * - Accesos rápidos a funcionalidades principales
 * - Estado de conexión con Google Calendar
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  CalendarIcon, 
  PlusIcon, 
  ClockIcon,
  DocumentArrowUpIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Spinner } from "@/src/components/ui/spinner";
import { DEFAULT_CALENDAR_ID } from "@/src/features/calendar/constants/calendar.constants";
import FunctionalWorkloadWidget from "./components/FunctionalWorkloadWidget";

interface CalendarStats {
  totalCalendars: number;
  upcomingEvents: number;
  todayEvents: number;
  authStatus: 'connected' | 'error' | 'loading';
  primaryCalendar?: {
    id: string;
    summary: string;
    email?: string;
  };
  accountInfo?: {
    email: string;
    name?: string;
  };
}

interface EnvHealthStatus {
  status: 'healthy' | 'unhealthy';
  severity: 'success' | 'warning' | 'error';
  message: string;
  canConnectToAPI: boolean;
  variables: Array<{
    name: string;
    displayName: string;
    value: string | null;
    isSet: boolean;
    isValid: boolean;
    required: boolean;
    error?: string;
    description: string;
  }>;
  recommendations: string[];
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const CalendarDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<CalendarStats>({
    totalCalendars: 0,
    upcomingEvents: 0,
    todayEvents: 0,
    authStatus: 'loading',
    primaryCalendar: undefined,
    accountInfo: undefined
  });
  const [envHealth, setEnvHealth] = useState<EnvHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación y permisos
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Cargar estadísticas del dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadDashboardStats();
    }
  }, [status, session, loadDashboardStats]);

  const loadDashboardStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar estado de variables de entorno
      const envHealthResponse = await fetch('/api/calendar/env/health');
      if (envHealthResponse.ok) {
        const envHealthData = await envHealthResponse.json();
        setEnvHealth(envHealthData);
      }

      // Verificar estado de autenticación de Calendar
      const authResponse = await fetch('/api/calendar/auth/token');
      const authData = await authResponse.json();
      
      let authStatus: CalendarStats['authStatus'] = 'error';
      if (authData.authenticated) {
        authStatus = 'connected';
      }

      // Si la autenticación es exitosa, cargar más estadísticas
      let totalCalendars = 0;
      let upcomingEvents = 0;
      let todayEvents = 0;

      if (authStatus === 'connected') {
        try {
          // Obtener calendarios
          const calendarsResponse = await fetch('/api/calendar/calendars');
          if (calendarsResponse.ok) {
            const calendarsData = await calendarsResponse.json();
            totalCalendars = calendarsData.total || 0;
            
            // Identificar calendario primario
            const primaryCal = calendarsData.calendars?.find((cal: any) => cal.primary) || 
                              calendarsData.calendars?.[0];
            
            if (primaryCal) {
              stats.primaryCalendar = {
                id: primaryCal.id,
                summary: primaryCal.summary,
                email: primaryCal.id === 'primary' ? primaryCal.summary : primaryCal.id
              };
            }
          }

          // Obtener eventos próximos (próximos 7 días)
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          
          const eventsResponse = await fetch(
            `/api/calendar/events?timeMin=${new Date().toISOString()}&timeMax=${weekFromNow.toISOString()}&maxResults=100`
          );
          
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            upcomingEvents = eventsData.items?.length || 0;
            
            // Contar eventos de hoy
            const today = new Date().toISOString().split('T')[0];
            todayEvents = eventsData.items?.filter((event: any) => {
              const eventDate = event.start?.date || event.start?.dateTime?.split('T')[0];
              return eventDate === today;
            }).length || 0;
          }
        } catch (statsError) {
          console.warn('Error loading additional stats:', statsError);
        }
      }

      setStats(prev => ({
        ...prev,
        totalCalendars,
        upcomingEvents,
        todayEvents,
        authStatus
      }));

    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      setError(error.message || 'Error loading dashboard data');
      setStats(prev => ({ ...prev, authStatus: 'error' }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const quickActions: QuickAction[] = [
    {
      title: "Crear Evento",
      description: "Crear un nuevo evento de calendario",
      href: "/admin/calendar/events/create",
      icon: PlusIcon,
      color: "blue"
    },
    {
      title: "Ver Eventos",
      description: "Gestionar eventos existentes",
      href: "/admin/calendar/events",
      icon: CalendarIcon,
      color: "green"
    },
    {
      title: "Importar JSON",
      description: "Importar eventos desde archivo JSON",
      href: "/admin/calendar/import/json",
      icon: DocumentArrowUpIcon,
      color: "purple"
    },
    {
      title: "Importar CSV",
      description: "Importar eventos desde archivo CSV",
      href: "/admin/calendar/import/csv",
      icon: DocumentArrowUpIcon,
      color: "orange"
    }
  ];

  const getColorClasses = (color: QuickAction['color']) => {
    const colors = {
      blue: "bg-blue-500 hover:bg-blue-600",
      green: "bg-green-500 hover:bg-green-600", 
      purple: "bg-purple-500 hover:bg-purple-600",
      orange: "bg-orange-500 hover:bg-orange-600"
    };
    return colors[color];
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Calendar Dashboard
        </h1>
        <p className="text-gray-600">
          Gestiona eventos de Google Calendar de forma centralizada
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}



      {/* Stats Cards */}
      {stats.authStatus === 'connected' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Calendarios Disponibles
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalendars}</div>
              <p className="text-xs text-muted-foreground">
                Calendarios con acceso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eventos Próximos
              </CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Próximos 7 días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eventos Hoy
              </CardTitle>
              <Badge variant={stats.todayEvents > 0 ? "default" : "secondary"}>
                {stats.todayEvents > 0 ? "Activo" : "Libre"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayEvents}</div>
              <p className="text-xs text-muted-foreground">
                Eventos programados hoy
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(action.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(action.color)}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Consultant Workload Widget - Only show if connected */}
      {stats.authStatus === 'connected' && (
        <div className="mb-8">
          <FunctionalWorkloadWidget />
        </div>
      )}

      {/* Connection Status Accordion */}
      <div className="mb-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="connection-status">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                {stats.authStatus === 'connected' && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                {stats.authStatus === 'error' && <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />}
                {stats.authStatus === 'loading' && <Cog6ToothIcon className="h-4 w-4 text-gray-500 animate-spin" />}
                Estado de Conexión - {stats.authStatus === 'connected' ? 'Conectado' : stats.authStatus === 'error' ? 'Error' : 'Verificando...'}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {stats.authStatus === 'connected' && (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700">✅ Conectado a Google Calendar</p>
                      <p className="text-xs text-gray-600">La integración está funcionando correctamente</p>
                    </div>
                  )}
                  
                  {stats.authStatus === 'error' && (
                    <>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-700">❌ Error de Conexión</p>
                        <p className="text-xs text-gray-600">Revisa la configuración de Google Calendar API</p>
                      </div>
                      <Button 
                        onClick={loadDashboardStats}
                        variant="outline"
                        size="sm"
                      >
                        Reintentar
                      </Button>
                    </>
                  )}

                  {stats.authStatus === 'loading' && (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">🔄 Verificando conexión...</p>
                      <p className="text-xs text-gray-600">Conectando con Google Calendar</p>
                    </div>
                  )}
                </div>

                {/* Account Information */}
                {stats.authStatus === 'connected' && stats.primaryCalendar && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Cuenta:</span>
                        <p className="font-mono text-blue-600 truncate">{stats.primaryCalendar.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Calendarios:</span>
                        <p className="font-medium">{stats.totalCalendars}</p>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-blue-50 rounded text-xs">
                      <p className="text-blue-800">
                        <strong>📅 Eventos se crean en:</strong> {DEFAULT_CALENDAR_ID}
                      </p>
                    </div>
                    
                    {stats.primaryCalendar.email !== DEFAULT_CALENDAR_ID && (
                      <div className="p-2 bg-amber-50 rounded text-xs">
                        <p className="text-amber-800">
                          <strong>⚠️</strong> Autenticado con {stats.primaryCalendar.email}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Quick Link to Health */}
      <div className="text-center">
        <a 
          href="/admin/calendar/health" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Cog6ToothIcon className="h-4 w-4" />
          <span className="font-medium">Ver Diagnóstico Completo y Documentación</span>
        </a>
      </div>
    </div>
  );
};

export default CalendarDashboard;