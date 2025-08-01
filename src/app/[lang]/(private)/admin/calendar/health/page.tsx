/**
 * Calendar Health & Documentation Page
 * 
 * Página dedicada a:
 * - Diagnóstico de variables de entorno
 * - Estado de autenticación detallado
 * - Documentación completa de configuración
 * - Troubleshooting y solución de problemas
 */

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Spinner } from "@/src/components/ui/spinner";
import { DEFAULT_CALENDAR_ID } from "@/src/features/calendar/constants/calendar.constants";

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
  timestamp: string;
}

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

const CalendarHealthPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [envHealth, setEnvHealth] = useState<EnvHealthStatus | null>(null);
  const [authHealth, setAuthHealth] = useState<any>(null);
  const [calendarStats, setCalendarStats] = useState<CalendarStats | null>(null);
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

  // Cargar datos de salud
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadHealthData();
    }
  }, [status, session]);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar estado de variables de entorno
      const envResponse = await fetch('/api/calendar/env/health');
      if (envResponse.ok) {
        const envData = await envResponse.json();
        setEnvHealth(envData);
      }

      // Cargar estado de autenticación
      const authResponse = await fetch('/api/calendar/auth/token');
      const authData = await authResponse.json();
      setAuthHealth(authData);

      // Si auth es exitosa, cargar estadísticas de calendario
      if (authData.authenticated) {
        try {
          const calendarsResponse = await fetch('/api/calendar/calendars');
          if (calendarsResponse.ok) {
            const calendarsData = await calendarsResponse.json();
            setCalendarStats({
              totalCalendars: calendarsData.total || 0,
              upcomingEvents: 0,
              todayEvents: 0,
              authStatus: 'connected',
              primaryCalendar: calendarsData.calendars?.find((cal: any) => cal.primary) || calendarsData.calendars?.[0]
            });
          }
        } catch (statsError) {
          console.warn('Error loading calendar stats:', statsError);
        }
      }

    } catch (error: any) {
      console.error('Error loading health data:', error);
      setError(error.message || 'Error loading health data');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Calendar Health & Documentation
        </h1>
        <p className="text-gray-600">
          Diagnóstico completo, configuración y troubleshooting del módulo Google Calendar
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

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Environment Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variables de Entorno</CardTitle>
            <Cog6ToothIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {envHealth ? `${envHealth.variables.filter(v => v.isValid).length}/${envHealth.variables.length}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Variables configuradas
            </p>
            {envHealth && (
              <Badge 
                variant={envHealth.severity === 'success' ? 'default' : 'destructive'}
                className="mt-2"
              >
                {envHealth.severity === 'success' ? 'Saludable' : 'Problemas'}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autenticación</CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {authHealth?.authenticated ? 'Conectado' : 'Error'}
            </div>
            <p className="text-xs text-muted-foreground">
              Estado de Google Calendar API
            </p>
            <Badge 
              variant={authHealth?.authenticated ? 'default' : 'destructive'}
              className="mt-2"
            >
              {authHealth?.authenticated ? 'Activo' : 'Fallo'}
            </Badge>
          </CardContent>
        </Card>

        {/* Calendar Access */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calendarios</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calendarStats?.totalCalendars || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Calendarios disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables Status */}
      {envHealth && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog6ToothIcon className="h-5 w-5" />
                Diagnóstico de Variables de Entorno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Status */}
                <div className="flex items-center gap-3">
                  {envHealth.severity === 'success' && (
                    <>
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700">✅ Configuración Completa</p>
                        <p className="text-sm text-gray-600">{envHealth.message}</p>
                      </div>
                    </>
                  )}
                  
                  {envHealth.severity === 'warning' && (
                    <>
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                      <div>
                        <p className="font-medium text-yellow-700">⚠️ Configuración Incompleta</p>
                        <p className="text-sm text-gray-600">{envHealth.message}</p>
                      </div>
                    </>
                  )}
                  
                  {envHealth.severity === 'error' && (
                    <>
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                      <div>
                        <p className="font-medium text-red-700">❌ Error de Configuración</p>
                        <p className="text-sm text-gray-600">{envHealth.message}</p>
                      </div>
                      <Button 
                        onClick={loadHealthData}
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                      >
                        Verificar de Nuevo
                      </Button>
                    </>
                  )}
                </div>

                {/* Variables Detail */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">🔧 Estado Detallado de Variables</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {envHealth.variables.map((variable) => (
                      <div 
                        key={variable.name}
                        className={`p-3 rounded-lg border ${
                          variable.isValid 
                            ? 'border-green-200 bg-green-50' 
                            : variable.required 
                              ? 'border-red-200 bg-red-50' 
                              : 'border-yellow-200 bg-yellow-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            variable.isValid 
                              ? 'bg-green-100 text-green-800' 
                              : variable.required 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {variable.isValid ? '✅' : variable.required ? '❌' : '⚠️'}
                          </span>
                          <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {variable.name}
                          </code>
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            variable.required 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {variable.required ? 'OBLIGATORIO' : 'OPCIONAL'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-1">
                          <strong>{variable.displayName}:</strong> {variable.description}
                        </p>
                        
                        {variable.isSet ? (
                          <p className="text-xs font-mono text-gray-700">
                            <strong>Valor:</strong> {variable.value}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            <strong>Estado:</strong> NO CONFIGURADA
                          </p>
                        )}
                        
                        {variable.error && (
                          <p className="text-xs text-red-600 mt-1">
                            <strong>Error:</strong> {variable.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {envHealth.recommendations.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">💡 Recomendaciones</h4>
                    <div className="space-y-2">
                      {envHealth.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span className="text-gray-700">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Typo Detection Alert */}
                {envHealth.recommendations.some(r => r.includes('TYPO DETECTADO')) && (
                  <div className="border-t pt-4">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                        <h4 className="font-medium text-amber-800">🔤 Error de Tipeo Detectado</h4>
                      </div>
                      <p className="text-sm text-amber-700 mb-2">
                        Se detectó <code className="bg-amber-100 px-1 py-0.5 rounded">OOGLE_CALENDAR_CLIENT_ID</code> en tu archivo .env.local
                      </p>
                      <p className="text-sm text-amber-700">
                        <strong>Solución:</strong> Cambiar por <code className="bg-green-100 px-1 py-0.5 rounded">GOOGLE_CALENDAR_CLIENT_ID</code> (agregar la G inicial)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Information */}
      {authHealth?.authenticated && calendarStats && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Información de Cuenta Activa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Cuenta Google:</span>
                    <p className="font-mono text-blue-600">{calendarStats.primaryCalendar?.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Calendario Principal:</span>
                    <p className="font-medium">{calendarStats.primaryCalendar?.summary}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Calendar ID:</span>
                    <p className="font-mono text-xs text-gray-700">{calendarStats.primaryCalendar?.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Calendarios Disponibles:</span>
                    <p className="font-medium">{calendarStats.totalCalendars} calendario(s)</p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Los eventos se crearán en:</strong> {DEFAULT_CALENDAR_ID}
                    <span className="block text-xs mt-1">
                      Configurado como calendario por defecto (GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID en .env.local)
                    </span>
                  </p>
                </div>
                
                {calendarStats.primaryCalendar?.email !== DEFAULT_CALENDAR_ID && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ Nota:</strong> Estás autenticado con {calendarStats.primaryCalendar?.email} pero los eventos se crearán en {DEFAULT_CALENDAR_ID}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documentation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5" />
            Documentación y Configuración Detallada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Variables de Entorno */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                🔐 Variables de Entorno Requeridas
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono text-xs">
                      GOOGLE_CALENDAR_CLIENT_ID
                    </code>
                    <span className="text-red-500 text-xs">OBLIGATORIO</span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    <strong>Dónde obtenerla:</strong> Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → Copiar &quot;Client ID&quot;
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono text-xs">
                      GOOGLE_CALENDAR_CLIENT_SECRET
                    </code>
                    <span className="text-red-500 text-xs">OBLIGATORIO</span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    <strong>Dónde obtenerla:</strong> Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → Copiar &quot;Client secret&quot;
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono text-xs">
                      GOOGLE_CALENDAR_REFRESH_TOKEN
                    </code>
                    <span className="text-red-500 text-xs">OBLIGATORIO</span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    <strong>Dónde obtenerla:</strong> OAuth2 Playground (developers.google.com/oauthplayground) → Authorize &quot;Calendar API v3&quot; → Exchange code for tokens → Copiar &quot;refresh_token&quot;
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="bg-green-100 px-2 py-1 rounded text-green-800 font-mono text-xs">
                      GOOGLE_CALENDAR_REDIRECT_URI
                    </code>
                    <span className="text-gray-500 text-xs">REQUERIDA</span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    <strong>Valor por defecto:</strong> http://localhost:3000/api/calendar/auth/callback
                  </p>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                    <strong>⚠️ IMPORTANTE:</strong> El REFRESH_TOKEN determina QUÉ CUENTA DE GOOGLE se usa. 
                    Úsalo con la cuenta donde quieres crear los eventos (ej: sistemas@insidesalons.com)
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                🚨 Solución de Problemas Detallada
              </h4>
              <div className="space-y-2 text-xs">
                {/* Error 401: invalid_client */}
                <div className="p-3 border-l-4 border-red-400 bg-red-50">
                  <strong className="text-red-800">❌ Error &quot;401: invalid_client&quot;</strong>
                  <div className="mt-2 space-y-1 text-red-700">
                    <p className="font-semibold">Verificar en Google Cloud Console:</p>
                    <ol className="list-decimal list-inside ml-2 space-y-1">
                      <li>APIs & Services → Credentials → Verificar Client ID</li>
                      <li>En el OAuth2 Client, agregar estas URIs EXACTAS:
                        <code className="block bg-red-100 p-1 mt-1 text-xs">
                          https://developers.google.com/oauthplayground<br/>
                          http://localhost:3000/api/calendar/auth/callback
                        </code>
                      </li>
                      <li>Calendar API debe estar HABILITADA</li>
                      <li>ESPERAR 5-10 min después de cambios</li>
                    </ol>
                    <p className="mt-2 font-semibold">En OAuth2 Playground:</p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Usar modo incógnito</li>
                      <li>Verificar NO hay espacios en credenciales</li>
                      <li>✅ Marcar &quot;Use your own OAuth credentials&quot;</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-2 border-l-4 border-yellow-400 bg-yellow-50">
                  <strong className="text-yellow-800">⚠️ &quot;Invalid grant&quot;</strong>
                  <p className="text-yellow-700">Refresh token generado con otras credenciales. Generar nuevo con credenciales actuales</p>
                </div>
                
                <div className="p-2 border-l-4 border-blue-400 bg-blue-50">
                  <strong className="text-blue-800">ℹ️ &quot;Eventos en cuenta incorrecta&quot;</strong>
                  <p className="text-blue-700">Cambiar GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID en .env.local</p>
                </div>
              </div>
            </div>

            {/* Enlaces útiles */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">🔗 Enlaces Rápidos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <a 
                  href="https://console.cloud.google.com" 
                  target="_blank"
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cog6ToothIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Google Cloud Console</h3>
                      <p className="text-sm text-gray-600">Gestionar credenciales OAuth2</p>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="https://developers.google.com/oauthplayground" 
                  target="_blank"
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">OAuth2 Playground</h3>
                      <p className="text-sm text-gray-600">Generar refresh tokens</p>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="https://developers.google.com/calendar/api/v3/reference" 
                  target="_blank"
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Calendar API Reference</h3>
                      <p className="text-sm text-gray-600">Documentación oficial de Google</p>
                    </div>
                  </div>
                </a>
              </div>
              
              <div className="space-y-1 text-xs pt-2 border-t">
                <p>
                  <strong>Documentación Markdown:</strong>{" "}
                  <a href="/CALENDAR_ENV_DOCUMENTATION.md" target="_blank" className="text-blue-600 hover:underline">
                    CALENDAR_ENV_DOCUMENTATION.md
                  </a>
                </p>
                <p>
                  <strong>Guía Visual OAuth2:</strong>{" "}
                  <a href="/OAUTH2_PLAYGROUND_VISUAL_GUIDE.md" target="_blank" className="text-blue-600 hover:underline">
                    OAUTH2_PLAYGROUND_VISUAL_GUIDE.md
                  </a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarHealthPage;