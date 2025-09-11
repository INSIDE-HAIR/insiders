import { auth } from "@/src/config/auth/auth";
import { redirect } from "next/navigation";
import { Icons } from "@/src/components/shared/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { BarChart3 } from "lucide-react";
import TailwindGrid from "@/src/components/shared/grid/TailwindGrid";

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${lang}/auth/login`);
  }

  // Check if user has admin role
  if (session.user.role !== "ADMIN") {
    redirect(`/${lang}/unauthorized`);
  }

  const isSpanish = lang === "es";

  return (
    <>
      <DocHeader
        title={
          isSpanish ? "Dashboard Administrativo" : "Administrative Dashboard"
        }
        description={
          isSpanish
            ? "Panel de control principal para administradores del sistema"
            : "Main control panel for system administrators"
        }
        icon={BarChart3}
      />

      <DocContent>
        <TailwindGrid fullSize>
          <main className='col-start-1 max-w-full w-full col-end-full md:col-start-1 lg:col-start-1 lg:col-end-13  order-2 md:order-1 z-30  col-span-full'>
            {/* User Role Badge */}
            <div className='flex justify-end'>
              <Badge variant='outline' className='text-primary'>
                <Icons.Shield className='w-3 h-3 mr-1' />
                {session.user.role}
              </Badge>
            </div>

            {/* Welcome Card */}
            <Card className='bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-primary'>
                  <Icons.Target className='w-5 h-5' />
                  {isSpanish
                    ? "Panel de Control Principal"
                    : "Main Control Panel"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  {isSpanish
                    ? "Bienvenido al centro de control administrativo. Aquí tienes acceso a todas las herramientas de gestión."
                    : "Welcome to the administrative control center. Here you have access to all management tools."}
                </p>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card className='hover:shadow-md transition-shadow'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    {isSpanish ? "Sistema Activo" : "System Active"}
                  </CardTitle>
                  <Icons.CheckCircle className='h-4 w-4 text-green-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-green-600'>100%</div>
                  <p className='text-xs text-muted-foreground'>
                    {isSpanish ? "Tiempo de actividad" : "Uptime"}
                  </p>
                </CardContent>
              </Card>

              <Card className='hover:shadow-md transition-shadow'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    {isSpanish ? "Usuarios Online" : "Users Online"}
                  </CardTitle>
                  <Icons.Users className='h-4 w-4 text-blue-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-blue-600'>48</div>
                  <p className='text-xs text-muted-foreground'>
                    {isSpanish ? "Conectados ahora" : "Connected now"}
                  </p>
                </CardContent>
              </Card>

              <Card className='hover:shadow-md transition-shadow'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    {isSpanish ? "Tareas Pendientes" : "Pending Tasks"}
                  </CardTitle>
                  <Icons.AlertCircle className='h-4 w-4 text-orange-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-orange-600'>12</div>
                  <p className='text-xs text-muted-foreground'>
                    {isSpanish ? "Requieren atención" : "Need attention"}
                  </p>
                </CardContent>
              </Card>

              <Card className='hover:shadow-md transition-shadow'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    {isSpanish ? "Rendimiento" : "Performance"}
                  </CardTitle>
                  <Icons.Rocket className='h-4 w-4 text-primary' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-primary'>
                    {isSpanish ? "Excelente" : "Excellent"}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {isSpanish ? "Métricas del día" : "Today's metrics"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Icons.BarChart3 className='w-5 h-5 text-chart-1' />
                    {isSpanish ? "Actividad Reciente" : "Recent Activity"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <Icons.User className='w-4 h-4 text-primary' />
                        <span className='text-sm'>
                          {isSpanish
                            ? "Nuevo usuario registrado"
                            : "New user registered"}
                        </span>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {isSpanish ? "Hace 5 min" : "5 min ago"}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <Icons.Package className='w-4 h-4 text-primary' />
                        <span className='text-sm'>
                          {isSpanish
                            ? "Producto actualizado"
                            : "Product updated"}
                        </span>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {isSpanish ? "Hace 12 min" : "12 min ago"}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <Icons.Database className='w-4 h-4 text-primary' />
                        <span className='text-sm'>
                          {isSpanish ? "Backup completado" : "Backup completed"}
                        </span>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {isSpanish ? "Hace 1 hora" : "1 hour ago"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Icons.Zap className='w-5 h-5 text-chart-2' />
                    {isSpanish ? "Acciones Rápidas" : "Quick Actions"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 gap-3'>
                    <Button
                      variant='outline'
                      className='h-auto p-4 flex-col items-start'
                    >
                      <div className='flex items-center gap-2 mb-1'>
                        <Icons.Users className='w-4 h-4' />
                        <span className='font-medium'>
                          {isSpanish ? "Usuarios" : "Users"}
                        </span>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {isSpanish ? "Gestionar" : "Manage"}
                      </span>
                    </Button>

                    <Button
                      variant='outline'
                      className='h-auto p-4 flex-col items-start'
                    >
                      <div className='flex items-center gap-2 mb-1'>
                        <Icons.Package className='w-4 h-4' />
                        <span className='font-medium'>
                          {isSpanish ? "Productos" : "Products"}
                        </span>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {isSpanish ? "Ver todos" : "View all"}
                      </span>
                    </Button>

                    <Button
                      variant='outline'
                      className='h-auto p-4 flex-col items-start'
                    >
                      <div className='flex items-center gap-2 mb-1'>
                        <Icons.BarChart3 className='w-4 h-4' />
                        <span className='font-medium'>
                          {isSpanish ? "Reportes" : "Reports"}
                        </span>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {isSpanish ? "Generar" : "Generate"}
                      </span>
                    </Button>

                    <Button
                      variant='outline'
                      className='h-auto p-4 flex-col items-start'
                    >
                      <div className='flex items-center gap-2 mb-1'>
                        <Icons.Settings className='w-4 h-4' />
                        <span className='font-medium'>
                          {isSpanish ? "Configurar" : "Settings"}
                        </span>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {isSpanish ? "Sistema" : "System"}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icons.User className='w-5 h-5 text-chart-3' />
                  {isSpanish ? "Información del Usuario" : "User Information"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='flex items-center gap-2'>
                    <Icons.Mail className='w-4 h-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>
                        {isSpanish ? "Usuario" : "User"}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Icons.Shield className='w-4 h-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>
                        {isSpanish ? "Rol" : "Role"}
                      </p>
                      <Badge variant='secondary'>{session.user.role}</Badge>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Icons.Users className='w-4 h-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>
                        {isSpanish ? "Equipos" : "Teams"}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {session.user.teams?.join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </TailwindGrid>
      </DocContent>
    </>
  );
}
