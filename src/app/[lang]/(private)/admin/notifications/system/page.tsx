import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Progress } from "@/src/components/ui/progress";
import {
  ServerStackIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  CloudIcon,
  CircleStackIcon,
  BugAntIcon,
  ArrowTrendingUpIcon,
  SignalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  CalendarDaysIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Sistema | Notificaciones",
  description: "Logs del sistema y monitoreo de aplicación",
};

interface SystemPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function SystemPage({ params }: SystemPageProps) {
  const { lang } = await params;
  const isSpanish = lang === "es";

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            {isSpanish ? "Logs del Sistema" : "System Logs"}
          </h1>
          <p className='text-muted-foreground mt-1'>
            {isSpanish
              ? "Monitoreo en tiempo real, auditoría de acciones y análisis de rendimiento"
              : "Real-time monitoring, action auditing, and performance analysis"}
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' className='gap-2'>
            <FunnelIcon className='h-4 w-4' />
            {isSpanish ? "Filtros" : "Filters"}
          </Button>
          <Button variant='outline' className='gap-2'>
            <ArrowPathIcon className='h-4 w-4' />
            {isSpanish ? "Actualizar" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* PRD Alert */}
      <Alert className='border-blue-500 bg-blue-50'>
        <ServerStackIcon className='h-4 w-4 text-blue-600' />
        <AlertDescription className='text-blue-800'>
          <strong>
            {isSpanish ? "Sistema en Desarrollo:" : "System Under Development:"}
          </strong>{" "}
          {isSpanish
            ? "Este módulo proporcionará logging completo de la aplicación: errores, accesos, cambios en datos, performance metrics, y auditoría completa. Integración con sistemas de monitoreo externos."
            : "This module will provide complete application logging: errors, access, data changes, performance metrics, and full auditing. Integration with external monitoring systems."}
        </AlertDescription>
      </Alert>

      {/* System Health Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='bg-emerald-500/5 border-emerald-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {isSpanish ? "Estado del Sistema" : "System Status"}
            </CardTitle>
            <SignalIcon className='h-4 w-4 text-emerald-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-600'>
              {isSpanish ? "Operativo" : "Operational"}
            </div>
            <div className='w-full rounded-full overflow-hidden h-3 bg-emerald-500/10 border border-emerald-500/20 mt-2'>
              <div
                className='h-full bg-emerald-500 transition-all duration-300'
                style={{ width: "98%" }}
              />
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              98% uptime {isSpanish ? "este mes" : "this month"}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-destructive/5 border-destructive/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {isSpanish ? "Errores (24h)" : "Errors (24h)"}
            </CardTitle>
            <XCircleIcon className='h-4 w-4 text-destructive' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-destructive'>12</div>
            <p className='text-xs text-muted-foreground'>
              {isSpanish ? "3 críticos, 9 menores" : "3 critical, 9 minor"}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-yellow-500/5 border-yellow-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {isSpanish ? "Warnings" : "Warnings"}
            </CardTitle>
            <ExclamationTriangleIcon className='h-4 w-4 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>47</div>
            <p className='text-xs text-muted-foreground'>
              {isSpanish ? "Últimas 24 horas" : "Last 24 hours"}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-blue-500/5 border-blue-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {isSpanish ? "Eventos Totales" : "Total Events"}
            </CardTitle>
            <ChartBarIcon className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>8.4K</div>
            <p className='text-xs text-muted-foreground'>
              {isSpanish ? "Hoy" : "Today"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Log Categories Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isSpanish ? "Categorías de Logs" : "Log Categories"}
          </CardTitle>
          <CardDescription>
            {isSpanish
              ? "Diferentes tipos de eventos y logs que se registrarán en el sistema"
              : "Different types of events and logs that will be recorded in the system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='application' className='space-y-4'>
            <TabsList className='grid grid-cols-5 w-full'>
              <TabsTrigger value='application'>
                {isSpanish ? "Aplicación" : "Application"}
              </TabsTrigger>
              <TabsTrigger value='security'>
                {isSpanish ? "Seguridad" : "Security"}
              </TabsTrigger>
              <TabsTrigger value='performance'>
                {isSpanish ? "Rendimiento" : "Performance"}
              </TabsTrigger>
              <TabsTrigger value='audit'>
                {isSpanish ? "Auditoría" : "Audit"}
              </TabsTrigger>
              <TabsTrigger value='integration'>
                {isSpanish ? "Integraciones" : "Integrations"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='application' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <BugAntIcon className='h-5 w-5 text-red-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish
                          ? "Errores de Aplicación"
                          : "Application Errors"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "Excepciones, crashes, errores de runtime, stack traces"
                          : "Exceptions, crashes, runtime errors, stack traces"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge variant='destructive'>Critical</Badge>
                        <Badge variant='outline'>Auto-capture</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <DocumentTextIcon className='h-5 w-5 text-blue-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish ? "Logs de Debug" : "Debug Logs"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "Información de debugging, console logs, trazas detalladas"
                          : "Debugging information, console logs, detailed traces"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge>Info</Badge>
                        <Badge variant='outline'>Dev Mode</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='security' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <ShieldCheckIcon className='h-5 w-5 text-green-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish
                          ? "Accesos y Autenticación"
                          : "Access & Authentication"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "Login/logout, intentos fallidos, cambios de permisos"
                          : "Login/logout, failed attempts, permission changes"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge variant='outline'>Auth</Badge>
                        <Badge variant='outline'>RBAC</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <ExclamationTriangleIcon className='h-5 w-5 text-orange-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish ? "Amenazas Detectadas" : "Detected Threats"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "Intentos de SQL injection, XSS, accesos no autorizados"
                          : "SQL injection attempts, XSS, unauthorized access"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge variant='destructive'>Security</Badge>
                        <Badge variant='outline'>Alert</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='performance' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <CpuChipIcon className='h-5 w-5 text-purple-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish ? "Métricas de CPU" : "CPU Metrics"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "Uso de procesador, picos, throttling, procesos pesados"
                          : "Processor usage, spikes, throttling, heavy processes"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge>Performance</Badge>
                        <Badge variant='outline'>Real-time</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <CircleStackIcon className='h-5 w-5 text-indigo-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish ? "Base de Datos" : "Database"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "Queries lentas, conexiones, deadlocks, optimizaciones"
                          : "Slow queries, connections, deadlocks, optimizations"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge>Database</Badge>
                        <Badge variant='outline'>MongoDB</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='audit' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <CalendarDaysIcon className='h-5 w-5 text-blue-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish ? "Cambios en Datos" : "Data Changes"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "CRUD operations, modificaciones, quien/cuando/qué"
                          : "CRUD operations, modifications, who/when/what"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge>Audit</Badge>
                        <Badge variant='outline'>Compliance</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <ArchiveBoxIcon className='h-5 w-5 text-gray-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish
                          ? "Backups y Restauraciones"
                          : "Backups & Restores"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "Backups automáticos, restauraciones, verificaciones"
                          : "Automatic backups, restores, verifications"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge>Backup</Badge>
                        <Badge variant='outline'>Scheduled</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='integration' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <CloudIcon className='h-5 w-5 text-cyan-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish ? "APIs Externas" : "External APIs"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "Google Drive, Calendar, Meet, servicios externos"
                          : "Google Drive, Calendar, Meet, external services"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge>Integration</Badge>
                        <Badge variant='outline'>OAuth</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-4 border rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <ArrowTrendingUpIcon className='h-5 w-5 text-green-500 mt-1' />
                    <div className='flex-1'>
                      <h3 className='font-medium'>
                        {isSpanish ? "Webhooks y Eventos" : "Webhooks & Events"}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {isSpanish
                          ? "Eventos entrantes/salientes, callbacks, notificaciones"
                          : "Incoming/outgoing events, callbacks, notifications"}
                      </p>
                      <div className='flex gap-2 mt-2'>
                        <Badge>Webhook</Badge>
                        <Badge variant='outline'>Real-time</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Log Viewer Preview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>
              {isSpanish
                ? "Visor de Logs en Tiempo Real"
                : "Real-time Log Viewer"}
            </span>
            <div className='flex gap-2'>
              <Button size='sm' variant='outline'>
                <MagnifyingGlassIcon className='h-4 w-4 mr-1' />
                {isSpanish ? "Buscar" : "Search"}
              </Button>
              <Button size='sm' variant='outline'>
                <CommandLineIcon className='h-4 w-4 mr-1' />
                {isSpanish ? "Exportar" : "Export"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs space-y-1 max-h-[400px] overflow-y-auto'>
            <div className='flex gap-2'>
              <span className='text-green-400'>[2024-01-15 10:23:45]</span>
              <span className='text-blue-400'>INFO</span>
              <span>User authentication successful: admin@example.com</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-green-400'>[2024-01-15 10:23:46]</span>
              <span className='text-yellow-400'>WARN</span>
              <span>Slow query detected: /api/calendar/events (2.3s)</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-green-400'>[2024-01-15 10:23:47]</span>
              <span className='text-blue-400'>INFO</span>
              <span>Google Drive sync completed: 127 files processed</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-green-400'>[2024-01-15 10:23:48]</span>
              <span className='text-red-400'>ERROR</span>
              <span>Failed to send email notification: Connection timeout</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-green-400'>[2024-01-15 10:23:49]</span>
              <span className='text-blue-400'>INFO</span>
              <span>Database backup started: mongodb://cluster0</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-green-400'>[2024-01-15 10:23:50]</span>
              <span className='text-purple-400'>DEBUG</span>
              <span>Cache hit ratio: 87% (last 5 minutes)</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-green-400'>[2024-01-15 10:23:51]</span>
              <span className='text-blue-400'>INFO</span>
              <span>New user registration: user@example.com</span>
            </div>
            <div className='flex gap-2'>
              <span className='text-green-400'>[2024-01-15 10:23:52]</span>
              <span className='text-yellow-400'>WARN</span>
              <span>Rate limit approaching: 450/500 requests</span>
            </div>
            <div className='flex gap-2 opacity-50'>
              <span className='text-gray-400'>
                {isSpanish ? "Cargando más logs..." : "Loading more logs..."}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Coming Soon */}
      <Card className='bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-primary'>
            <ArrowTrendingUpIcon className='h-5 w-5 text-primary' />
            {isSpanish
              ? "Funcionalidades Próximamente"
              : "Features Coming Soon"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Filtros avanzados y búsqueda"
                      : "Advanced filters and search"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Alertas configurables"
                      : "Configurable alerts"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Dashboards personalizados"
                      : "Custom dashboards"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Retención configurable"
                      : "Configurable retention"}
                  </span>
                </div>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Integración con Sentry"
                      : "Sentry integration"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish ? "Exportación a CSV/JSON" : "CSV/JSON export"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish ? "API de consulta de logs" : "Log query API"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Machine learning para anomalías"
                      : "ML for anomaly detection"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
