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
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  ArrowRightIcon,
  PlusIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Solicitudes | Notificaciones",
  description: "Sistema de gestión de solicitudes internas de la empresa",
};

interface RequestsPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function RequestsPage({ params }: RequestsPageProps) {
  const { lang } = await params;
  const isSpanish = lang === "es";

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            {isSpanish
              ? "Sistema de Solicitudes Internas"
              : "Internal Request System"}
          </h1>
          <p className='text-muted-foreground mt-1'>
            {isSpanish
              ? "Gestión centralizada de solicitudes departamentales y recursos empresariales"
              : "Centralized management of departmental requests and business resources"}
          </p>
        </div>
        <Button className='gap-2'>
          <PlusIcon className='h-4 w-4' />
          {isSpanish ? "Nueva Solicitud" : "New Request"}
        </Button>
      </div>

      {/* PRD Alert */}
      <Alert className='border-blue-500 bg-blue-50'>
        <DocumentTextIcon className='h-4 w-4 text-blue-600' />
        <AlertDescription className='text-blue-800'>
          <strong>
            {isSpanish ? "Sistema en Desarrollo:" : "System Under Development:"}
          </strong>{" "}
          {isSpanish
            ? "Este módulo permitirá la gestión completa de solicitudes internas: vacaciones, recursos, formación, presupuestos, y más. Integración con workflow de aprobación multinivel."
            : "This module will enable complete internal request management: vacations, resources, training, budgets, and more. Integration with multi-level approval workflow."}
        </AlertDescription>
      </Alert>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card className='bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-colors cursor-pointer'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {isSpanish ? "Solicitudes Pendientes" : "Pending Requests"}
            </CardTitle>
            <ClockIcon className='h-4 w-4 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>24</div>
            <p className='text-xs text-muted-foreground'>
              {isSpanish ? "Esperando aprobación" : "Awaiting approval"}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors cursor-pointer'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {isSpanish ? "Aprobadas este mes" : "Approved this month"}
            </CardTitle>
            <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-600'>156</div>
            <p className='text-xs text-muted-foreground'>
              {isSpanish ? "+12% vs mes anterior" : "+12% vs last month"}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-destructive/5 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 transition-colors cursor-pointer'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {isSpanish ? "Rechazadas" : "Rejected"}
            </CardTitle>
            <XCircleIcon className='h-4 w-4 text-destructive' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-destructive'>8</div>
            <p className='text-xs text-muted-foreground'>
              {isSpanish ? "Este mes" : "This month"}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors cursor-pointer'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {isSpanish ? "Tiempo promedio" : "Average time"}
            </CardTitle>
            <CalendarIcon className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>2.5d</div>
            <p className='text-xs text-muted-foreground'>
              {isSpanish ? "De respuesta" : "Response time"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Request Categories */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isSpanish ? "Categorías de Solicitudes" : "Request Categories"}
          </CardTitle>
          <CardDescription>
            {isSpanish
              ? "Tipos de solicitudes que se podrán gestionar en este sistema"
              : "Types of requests that can be managed in this system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors cursor-pointer'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-blue-500/10 rounded-lg border border-blue-500/20'>
                  <BriefcaseIcon className='h-5 w-5 text-blue-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-medium text-blue-700'>
                    {isSpanish ? "Vacaciones y Permisos" : "Vacations & Leaves"}
                  </h3>
                  <p className='text-sm text-blue-600/70 mt-1'>
                    {isSpanish
                      ? "Solicitudes de días libres, vacaciones, permisos especiales"
                      : "Time off requests, vacations, special permits"}
                  </p>
                  <Badge className='mt-2 bg-blue-500/10 text-blue-700 border-blue-500/30 hover:bg-blue-500/20'>
                    HR
                  </Badge>
                </div>
              </div>
            </div>

            <div className='p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors cursor-pointer'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20'>
                  <CurrencyDollarIcon className='h-5 w-5 text-emerald-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-medium text-emerald-700'>
                    {isSpanish ? "Presupuestos" : "Budgets"}
                  </h3>
                  <p className='text-sm text-emerald-600/70 mt-1'>
                    {isSpanish
                      ? "Aprobación de gastos, compras, inversiones"
                      : "Expense approvals, purchases, investments"}
                  </p>
                  <Badge className='mt-2 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20'>
                    Finance
                  </Badge>
                </div>
              </div>
            </div>

            <div className='p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 hover:bg-purple-500/10 transition-colors cursor-pointer'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-purple-500/10 rounded-lg border border-purple-500/20'>
                  <AcademicCapIcon className='h-5 w-5 text-purple-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-medium text-purple-700'>
                    {isSpanish ? "Formación" : "Training"}
                  </h3>
                  <p className='text-sm text-purple-600/70 mt-1'>
                    {isSpanish
                      ? "Cursos, certificaciones, conferencias"
                      : "Courses, certifications, conferences"}
                  </p>
                  <Badge className='mt-2 bg-purple-500/10 text-purple-700 border-purple-500/30 hover:bg-purple-500/20'>
                    L&D
                  </Badge>
                </div>
              </div>
            </div>

            <div className='p-4 rounded-lg bg-orange-500/5 border border-orange-500/20 hover:bg-orange-500/10 transition-colors cursor-pointer'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-orange-500/10 rounded-lg border border-orange-500/20'>
                  <WrenchScrewdriverIcon className='h-5 w-5 text-orange-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-medium text-orange-700'>
                    {isSpanish ? "Recursos IT" : "IT Resources"}
                  </h3>
                  <p className='text-sm text-orange-600/70 mt-1'>
                    {isSpanish
                      ? "Software, hardware, accesos, licencias"
                      : "Software, hardware, access, licenses"}
                  </p>
                  <Badge className='mt-2 bg-orange-500/10 text-orange-700 border-orange-500/30 hover:bg-orange-500/20'>
                    IT
                  </Badge>
                </div>
              </div>
            </div>

            <div className='p-4 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-red-500/10 rounded-lg border border-red-500/20'>
                  <DocumentTextIcon className='h-5 w-5 text-red-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-medium text-red-700'>
                    {isSpanish ? "Documentación" : "Documentation"}
                  </h3>
                  <p className='text-sm text-red-600/70 mt-1'>
                    {isSpanish
                      ? "Certificados, documentos oficiales, contratos"
                      : "Certificates, official documents, contracts"}
                  </p>
                  <Badge className='mt-2 bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/20'>
                    Legal
                  </Badge>
                </div>
              </div>
            </div>

            <div className='p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20 hover:bg-indigo-500/10 transition-colors cursor-pointer'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20'>
                  <InboxIcon className='h-5 w-5 text-indigo-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-medium text-indigo-700'>
                    {isSpanish ? "Otros" : "Other"}
                  </h3>
                  <p className='text-sm text-indigo-600/70 mt-1'>
                    {isSpanish
                      ? "Solicitudes generales y personalizadas"
                      : "General and custom requests"}
                  </p>
                  <Badge className='mt-2 bg-indigo-500/10 text-indigo-700 border-indigo-500/30 hover:bg-indigo-500/20'>
                    General
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{isSpanish ? "Flujo de Trabajo" : "Workflow"}</CardTitle>
          <CardDescription>
            {isSpanish
              ? "Proceso de aprobación multinivel según tipo de solicitud"
              : "Multi-level approval process based on request type"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between gap-4 overflow-x-auto pb-4'>
            <div className='flex flex-col items-center gap-2 min-w-[120px]'>
              <div className='p-3 bg-blue-100 rounded-full'>
                <UserIcon className='h-6 w-6 text-blue-600' />
              </div>
              <span className='text-sm font-medium'>
                {isSpanish ? "Empleado" : "Employee"}
              </span>
              <span className='text-xs text-muted-foreground'>
                {isSpanish ? "Crea solicitud" : "Creates request"}
              </span>
            </div>

            <ArrowRightIcon className='h-5 w-5 text-gray-400 flex-shrink-0' />

            <div className='flex flex-col items-center gap-2 min-w-[120px]'>
              <div className='p-3 bg-orange-100 rounded-full'>
                <UserIcon className='h-6 w-6 text-orange-600' />
              </div>
              <span className='text-sm font-medium'>
                {isSpanish ? "Manager" : "Manager"}
              </span>
              <span className='text-xs text-muted-foreground'>
                {isSpanish ? "Primera aprobación" : "First approval"}
              </span>
            </div>

            <ArrowRightIcon className='h-5 w-5 text-gray-400 flex-shrink-0' />

            <div className='flex flex-col items-center gap-2 min-w-[120px]'>
              <div className='p-3 bg-purple-100 rounded-full'>
                <UserIcon className='h-6 w-6 text-purple-600' />
              </div>
              <span className='text-sm font-medium'>
                {isSpanish ? "Departamento" : "Department"}
              </span>
              <span className='text-xs text-muted-foreground'>
                {isSpanish ? "Validación técnica" : "Technical validation"}
              </span>
            </div>

            <ArrowRightIcon className='h-5 w-5 text-gray-400 flex-shrink-0' />

            <div className='flex flex-col items-center gap-2 min-w-[120px]'>
              <div className='p-3 bg-green-100 rounded-full'>
                <CheckCircleIcon className='h-6 w-6 text-green-600' />
              </div>
              <span className='text-sm font-medium'>
                {isSpanish ? "Aprobado" : "Approved"}
              </span>
              <span className='text-xs text-muted-foreground'>
                {isSpanish ? "Solicitud procesada" : "Request processed"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Coming Soon */}
      <Card className='bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-primary'>
            <WrenchScrewdriverIcon className='h-5 w-5 text-primary' />
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
                      ? "Formularios dinámicos por tipo"
                      : "Dynamic forms by type"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Notificaciones automáticas"
                      : "Automatic notifications"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish ? "Calendario de ausencias" : "Absence calendar"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Reportes y analytics"
                      : "Reports and analytics"}
                  </span>
                </div>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish ? "Integración con email" : "Email integration"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "API para integraciones"
                      : "API for integrations"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Plantillas reutilizables"
                      : "Reusable templates"}
                  </span>
                </div>
              </div>
              <div className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-700'>
                    {isSpanish
                      ? "Delegación de aprobaciones"
                      : "Approval delegation"}
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
