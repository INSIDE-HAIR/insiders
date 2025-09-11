export const dynamic = "force-dynamic";

import { auth } from "@/src/config/auth/auth";
import { redirect } from "next/navigation";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import {
  Mail,
  User,
  Shield,
  Settings,
  Activity,
  Clock,
  UserCheck,
  Globe,
} from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  const fallbackImage =
    "https://lh3.googleusercontent.com/d/1C2OO4r3kGDhvEp-yw-cS9vRiSiVBZpae";

  return (
    <div>
      <DocHeader
        title='Mi Perfil'
        description='Gestiona tu información personal y configuraciones de cuenta'
        icon={User}
        maxWidth
      />

      <section
        id='para-quien'
        className='py-20 md:py-28 bg-background text-foreground'
      >
        <div className='container mx-auto px-6 text-center  '>
          {/* Profile Card */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex items-center gap-6'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage
                    src={session.user.image || fallbackImage}
                    alt={session.user.name || "Usuario"}
                    referrerPolicy='no-referrer'
                  />
                  <AvatarFallback className='text-lg'>
                    <img
                      src={fallbackImage}
                      alt='Avatar'
                      className='w-full h-full object-cover'
                    />
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold'>
                    {session.user.name || "Usuario"}
                  </h3>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <Mail className='h-4 w-4' />
                    {session.user.email}
                  </div>
                  <Badge
                    variant={
                      session.user.role === "ADMIN" ? "default" : "secondary"
                    }
                  >
                    {session.user.role === "ADMIN"
                      ? "Administrador"
                      : session.user.role === "EMPLOYEE"
                        ? "Empleado"
                        : session.user.role === "CLIENT"
                          ? "Cliente"
                          : "Usuario"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    ID de Usuario
                  </p>
                  <p className='font-mono text-sm bg-muted px-2 py-1 rounded'>
                    {session.user.id}
                  </p>
                </div>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Tipo de Cuenta
                  </p>
                  <Badge
                    variant={session.user.isOAuth ? "default" : "secondary"}
                    className='w-fit'
                  >
                    {session.user.isOAuth ? "OAuth" : "Email/Contraseña"}
                  </Badge>
                </div>
                {session.user.email && (
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Dominio
                    </p>
                    <p className='font-mono text-sm bg-muted px-2 py-1 rounded'>
                      {session.user.email.split("@")[1]}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>
                  Autenticación de Dos Factores
                </p>
                <Badge
                  variant={
                    session.user.isTwoFactorEnabled ? "default" : "destructive"
                  }
                  className='w-fit'
                >
                  {session.user.isTwoFactorEnabled ? "Activada" : "Desactivada"}
                </Badge>
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium'>Estado de Verificación</p>
                <div className='flex items-center gap-2'>
                  <UserCheck className='h-4 w-4 text-green-500' />
                  <span className='text-sm text-green-600'>
                    {session.user.emailVerified
                      ? "Email Verificado"
                      : "Verificado por OAuth"}
                  </span>
                </div>
              </div>

              <Button variant='outline' size='sm' className='w-full'>
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Sesión Iniciada</p>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  <span>
                    {session.expires
                      ? `Expira: ${new Date(session.expires).toLocaleString("es-ES")}`
                      : `Activa desde: ${new Date().toLocaleString("es-ES")}`}
                  </span>
                </div>
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium'>Información de Sesión</p>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>
                    Token: {session.user.id ? "Válido" : "No disponible"}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Permisos:{" "}
                    {session.user.role === "ADMIN"
                      ? "Completos"
                      : session.user.role === "EMPLOYEE"
                        ? "Limitados"
                        : "Básicos"}
                  </p>
                </div>
              </div>

              <Button variant='outline' size='sm' className='w-full'>
                Ver Historial
              </Button>
            </CardContent>
          </Card>

          {/* Groups & Resources */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Globe className='h-5 w-5' />
                Grupos y Recursos
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Grupos</p>
                <div className='flex flex-wrap gap-1'>
                  {session.user.groups && session.user.groups.length > 0 ? (
                    session.user.groups.map((group, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='text-xs'
                      >
                        {group}
                      </Badge>
                    ))
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      Sin grupos asignados
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium'>Recursos</p>
                <div className='flex flex-wrap gap-1'>
                  {session.user.resources &&
                  session.user.resources.length > 0 ? (
                    session.user.resources.map((resource, index) => (
                      <Badge key={index} variant='outline' className='text-xs'>
                        {resource}
                      </Badge>
                    ))
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      Sin recursos asignados
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <User className='h-4 w-4 mr-2' />
                Editar Perfil
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <Mail className='h-4 w-4 mr-2' />
                Preferencias de Email
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <Shield className='h-4 w-4 mr-2' />
                Privacidad
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start'
              >
                <Globe className='h-4 w-4 mr-2' />
                Idioma y Región
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
