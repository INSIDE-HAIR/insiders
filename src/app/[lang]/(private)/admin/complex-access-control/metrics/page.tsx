"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { 
  BarChart3, TrendingUp, Clock, AlertTriangle, 
  CheckCircle, XCircle, Activity, Users, 
  Download, RefreshCw, Filter, Calendar,
  Shield, Zap, Database
} from 'lucide-react';

interface AccessMetrics {
  performance: {
    avgEvaluationTime: number;
    cacheHitRatio: number;
    totalEvaluations: number;
    slowEvaluations: number;
  };
  usage: {
    allowedAccess: number;
    deniedAccess: number;
    byResource: Array<{
      resourceId: string;
      allowed: number;
      denied: number;
      total: number;
    }>;
  };
  rules: {
    mostUsed: Array<{
      ruleId: string;
      ruleName: string;
      usageCount: number;
      successRate: number;
    }>;
    neverActivated: Array<{
      ruleId: string;
      ruleName: string;
      lastModified: string;
    }>;
  };
  errors: {
    evaluationErrors: number;
    fallbacksToSimple: number;
    configurationErrors: number;
    recentErrors: Array<{
      timestamp: string;
      error: string;
      resourceId: string;
    }>;
  };
  trends: {
    dailyAccess: Array<{
      date: string;
      allowed: number;
      denied: number;
    }>;
    hourlyDistribution: Array<{
      hour: number;
      requests: number;
    }>;
  };
}

export default function AccessMetricsPage() {
  const [metrics, setMetrics] = useState<AccessMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadMetrics();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadMetrics, 30000); // Refetch cada 30 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      // En una implementación real, esto haría una petición a la API
      // const response = await fetch(`/api/admin/complex-access-control/metrics?timeRange=${timeRange}`);
      // const data = await response.json();
      
      // Por ahora, usamos datos simulados
      const simulatedMetrics: AccessMetrics = {
        performance: {
          avgEvaluationTime: 23.5,
          cacheHitRatio: 89.2,
          totalEvaluations: 15420,
          slowEvaluations: 142,
        },
        usage: {
          allowedAccess: 12340,
          deniedAccess: 3080,
          byResource: [
            { resourceId: 'marketing_digital_avanzado', allowed: 4520, denied: 890, total: 5410 },
            { resourceId: '/[lang]/training', allowed: 3210, denied: 1240, total: 4450 },
            { resourceId: '/[lang]/admin/drive', allowed: 2840, denied: 320, total: 3160 },
            { resourceId: 'formacion_ventas_2025', allowed: 1770, denied: 630, total: 2400 },
          ],
        },
        rules: {
          mostUsed: [
            { ruleId: 'rule1', ruleName: 'Edición Enero 2025', usageCount: 4520, successRate: 83.5 },
            { ruleId: 'rule2', ruleName: 'Cliente Premium Activo', usageCount: 3210, successRate: 94.2 },
            { ruleId: 'rule3', ruleName: 'Acceso Administrativo', usageCount: 2840, successRate: 98.1 },
            { ruleId: 'rule4', ruleName: 'Período de Gracia', usageCount: 1770, successRate: 71.8 },
          ],
          neverActivated: [
            { ruleId: 'rule5', ruleName: 'Acceso de Emergencia', lastModified: '2024-12-15' },
            { ruleId: 'rule6', ruleName: 'Promoción Navidad', lastModified: '2024-12-20' },
          ],
        },
        errors: {
          evaluationErrors: 23,
          fallbacksToSimple: 45,
          configurationErrors: 8,
          recentErrors: [
            { timestamp: '2025-01-03T10:30:00Z', error: 'Field path user.invalid_field not found', resourceId: 'test_resource' },
            { timestamp: '2025-01-03T09:15:00Z', error: 'JSON parse error in condition value', resourceId: 'marketing_digital_avanzado' },
            { timestamp: '2025-01-03T08:45:00Z', error: 'Database connection timeout', resourceId: '/[lang]/training' },
          ],
        },
        trends: {
          dailyAccess: [
            { date: '2025-01-01', allowed: 1850, denied: 420 },
            { date: '2025-01-02', allowed: 2140, denied: 380 },
            { date: '2025-01-03', allowed: 2320, denied: 445 },
            { date: '2025-01-04', allowed: 1980, denied: 390 },
            { date: '2025-01-05', allowed: 2450, denied: 510 },
            { date: '2025-01-06', allowed: 2280, denied: 470 },
            { date: '2025-01-07', allowed: 2320, denied: 465 },
          ],
          hourlyDistribution: [
            { hour: 0, requests: 45 }, { hour: 1, requests: 32 }, { hour: 2, requests: 28 },
            { hour: 3, requests: 25 }, { hour: 4, requests: 30 }, { hour: 5, requests: 42 },
            { hour: 6, requests: 85 }, { hour: 7, requests: 142 }, { hour: 8, requests: 298 },
            { hour: 9, requests: 456 }, { hour: 10, requests: 523 }, { hour: 11, requests: 612 },
            { hour: 12, requests: 590 }, { hour: 13, requests: 534 }, { hour: 14, requests: 623 },
            { hour: 15, requests: 678 }, { hour: 16, requests: 645 }, { hour: 17, requests: 567 },
            { hour: 18, requests: 445 }, { hour: 19, requests: 334 }, { hour: 20, requests: 267 },
            { hour: 21, requests: 198 }, { hour: 22, requests: 156 }, { hour: 23, requests: 89 },
          ],
        },
      };
      
      setMetrics(simulatedMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportMetrics = () => {
    if (!metrics) return;
    
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `access-metrics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Cargando métricas de acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Métricas de Control de Acceso
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitorea el rendimiento y uso del sistema de reglas complejas
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Último día</SelectItem>
              <SelectItem value="7d">Última semana</SelectItem>
              <SelectItem value="30d">Último mes</SelectItem>
              <SelectItem value="90d">3 meses</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button onClick={exportMetrics} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="grid gap-6">
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo de Evaluación</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.avgEvaluationTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  promedio de {metrics.performance.totalEvaluations.toLocaleString()} evaluaciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.cacheHitRatio}%</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.performance.slowEvaluations} evaluaciones lentas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accesos Permitidos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.usage.allowedAccess.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((metrics.usage.allowedAccess / (metrics.usage.allowedAccess + metrics.usage.deniedAccess)) * 100).toFixed(1)}% tasa de éxito
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accesos Denegados</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.usage.deniedAccess.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.errors.fallbacksToSimple} fallbacks a sistema simple
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Uso por Recurso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Uso por Recurso
              </CardTitle>
              <CardDescription>
                Estadísticas de acceso por recurso protegido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.usage.byResource.map((resource, index) => {
                  const successRate = (resource.allowed / resource.total) * 100;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{resource.resourceId}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {resource.allowed} permitidos
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            {resource.denied} denegados
                          </span>
                          <span className="text-gray-500">
                            Total: {resource.total}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {successRate.toFixed(1)}%
                        </div>
                        <Badge variant={successRate > 80 ? "default" : successRate > 60 ? "secondary" : "destructive"}>
                          {successRate > 80 ? "Excelente" : successRate > 60 ? "Bueno" : "Mejorable"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reglas Más Utilizadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Reglas Más Utilizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.rules.mostUsed.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <div className="font-medium">{rule.ruleName}</div>
                        <div className="text-sm text-gray-600">
                          {rule.usageCount.toLocaleString()} usos
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {rule.successRate}%
                        </div>
                        <Badge 
                          variant={rule.successRate > 90 ? "default" : rule.successRate > 70 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          éxito
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Errores y Alertas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Errores y Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {metrics.errors.evaluationErrors}
                      </div>
                      <div className="text-xs text-red-600">Errores de evaluación</div>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        {metrics.errors.fallbacksToSimple}
                      </div>
                      <div className="text-xs text-yellow-600">Fallbacks</div>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {metrics.errors.configurationErrors}
                      </div>
                      <div className="text-xs text-orange-600">Config errores</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Errores Recientes:</h5>
                    <div className="space-y-2">
                      {metrics.errors.recentErrors.slice(0, 3).map((error, index) => (
                        <div key={index} className="text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-500">
                          <div className="font-medium">{error.resourceId}</div>
                          <div className="text-red-600">{error.error}</div>
                          <div className="text-gray-500">
                            {new Date(error.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reglas Nunca Activadas */}
          {metrics.rules.neverActivated.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Reglas Sin Usar
                </CardTitle>
                <CardDescription>
                  Reglas que no han sido activadas recientemente - considera revisar o eliminar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metrics.rules.neverActivated.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{rule.ruleName}</div>
                        <div className="text-sm text-gray-500">
                          Modificada: {new Date(rule.lastModified).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="secondary">Sin uso</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tendencias Diarias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tendencias de Acceso (Últimos 7 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.trends.dailyAccess.map((day, index) => {
                  const total = day.allowed + day.denied;
                  const successRate = (day.allowed / total) * 100;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="font-medium">
                        {new Date(day.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          <span className="text-green-600">{day.allowed}</span> / <span className="text-red-600">{day.denied}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {successRate.toFixed(1)}%
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${successRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}