import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import {
  BellIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ServerStackIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Notificaciones | INSIDERS",
  description: "Centro de notificaciones: tickets, solicitudes y logs del sistema",
};

interface NotificationsPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { lang } = await params;
  const isSpanish = lang === "es";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BellIcon className="h-8 w-8 text-blue-600" />
            {isSpanish ? "Centro de Notificaciones" : "Notification Center"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSpanish 
              ? "Gestión centralizada de tickets, solicitudes internas y logs del sistema"
              : "Centralized management of tickets, internal requests, and system logs"
            }
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSpanish ? "Tickets Abiertos" : "Open Tickets"}
            </CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              {isSpanish ? "Reportados por clientes" : "Reported by clients"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSpanish ? "Solicitudes Pendientes" : "Pending Requests"}
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              {isSpanish ? "Internas de empresa" : "Internal company"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSpanish ? "Errores Sistema" : "System Errors"}
            </CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              {isSpanish ? "Últimas 24h" : "Last 24h"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSpanish ? "Resueltos Hoy" : "Resolved Today"}
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">31</div>
            <p className="text-xs text-muted-foreground">
              {isSpanish ? "Todos los tipos" : "All types"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tickets Module */}
        <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-red-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <Badge variant="destructive">18 {isSpanish ? "abiertos" : "open"}</Badge>
            </div>
            <CardTitle className="flex items-center gap-2">
              Tickets
              <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
            <CardDescription>
              {isSpanish 
                ? "Errores y problemas reportados por clientes. Anteriormente en Drive/Errors."
                : "Errors and issues reported by clients. Previously in Drive/Errors."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{isSpanish ? "Críticos" : "Critical"}</span>
                <Badge variant="destructive">3</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{isSpanish ? "Altos" : "High"}</span>
                <Badge variant="outline" className="border-orange-500 text-orange-600">8</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{isSpanish ? "Medios" : "Medium"}</span>
                <Badge variant="outline">7</Badge>
              </div>
            </div>
            <Link href={`/${lang}/admin/notifications/tickets`}>
              <Button className="w-full mt-4" variant="outline">
                {isSpanish ? "Gestionar Tickets" : "Manage Tickets"}
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Requests Module */}
        <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-800">24 {isSpanish ? "pendientes" : "pending"}</Badge>
            </div>
            <CardTitle className="flex items-center gap-2">
              {isSpanish ? "Solicitudes" : "Requests"}
              <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
            <CardDescription>
              {isSpanish 
                ? "Solicitudes internas de la empresa: vacaciones, recursos, formación, presupuestos."
                : "Internal company requests: vacations, resources, training, budgets."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{isSpanish ? "Vacaciones" : "Vacations"}</span>
                <Badge>8</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{isSpanish ? "Recursos IT" : "IT Resources"}</span>
                <Badge>6</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{isSpanish ? "Presupuestos" : "Budgets"}</span>
                <Badge>10</Badge>
              </div>
            </div>
            <Link href={`/${lang}/admin/notifications/requests`}>
              <Button className="w-full mt-4" variant="outline">
                {isSpanish ? "Ver Solicitudes" : "View Requests"}
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Logs Module */}
        <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-100 rounded-lg">
                <ServerStackIcon className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">{isSpanish ? "Activo" : "Active"}</Badge>
            </div>
            <CardTitle className="flex items-center gap-2">
              {isSpanish ? "Sistema" : "System"}
              <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
            <CardDescription>
              {isSpanish 
                ? "Logs de la aplicación: errores, accesos, performance, auditoría completa."
                : "Application logs: errors, access, performance, complete auditing."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{isSpanish ? "Errores hoy" : "Errors today"}</span>
                <Badge variant="destructive">12</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{isSpanish ? "Warnings" : "Warnings"}</span>
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">47</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{isSpanish ? "Eventos totales" : "Total events"}</span>
                <Badge>8.4K</Badge>
              </div>
            </div>
            <Link href={`/${lang}/admin/notifications/system`}>
              <Button className="w-full mt-4" variant="outline">
                {isSpanish ? "Ver Logs" : "View Logs"}
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Migration Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BellIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {isSpanish ? "Centro Unificado de Notificaciones" : "Unified Notification Center"}
              </h3>
              <p className="text-muted-foreground mb-3">
                {isSpanish 
                  ? "Hemos reorganizado el sistema para centralizar todas las notificaciones y alertas:"
                  : "We've reorganized the system to centralize all notifications and alerts:"
                }
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ArrowRightIcon className="h-4 w-4 text-blue-600" />
                  <span>
                    <strong>Tickets:</strong> {" "}
                    {isSpanish 
                      ? "Los errores de Drive ahora son tickets de clientes"
                      : "Drive errors are now client tickets"
                    }
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon className="h-4 w-4 text-blue-600" />
                  <span>
                    <strong>{isSpanish ? "Solicitudes" : "Requests"}:</strong> {" "}
                    {isSpanish 
                      ? "Nuevo sistema para gestión interna de la empresa"
                      : "New system for internal company management"
                    }
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightIcon className="h-4 w-4 text-blue-600" />
                  <span>
                    <strong>{isSpanish ? "Sistema" : "System"}:</strong> {" "}
                    {isSpanish 
                      ? "Logs completos de aplicación y monitoreo"
                      : "Complete application logs and monitoring"
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}