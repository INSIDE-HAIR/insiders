export const dynamic = "force-dynamic";

import { auth } from "@/src/config/auth/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
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
  Globe
} from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  const fallbackImage = "https://lh3.googleusercontent.com/d/1C2OO4r3kGDhvEp-yw-cS9vRiSiVBZpae";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-muted-foreground">
              Gestiona tu información personal y configuraciones de cuenta
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={session.user.image || fallbackImage}
                    alt={session.user.name || "Usuario"}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="text-lg">
                    <img 
                      src={fallbackImage} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">
                    {session.user.name || "Usuario"}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {session.user.email}
                  </div>
                  <Badge variant={session.user.role === "ADMIN" ? "default" : "secondary"}>
                    {session.user.role || "Usuario"}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">ID de Usuario</p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {session.user.id}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Cuenta</p>
                  <Badge variant={session.user.isOAuth ? "default" : "secondary"} className="w-fit">
                    {session.user.isOAuth ? "OAuth" : "Email/Contraseña"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Autenticación de Dos Factores</p>
                <Badge
                  variant={session.user.isTwoFactorEnabled ? "default" : "destructive"}
                  className="w-fit"
                >
                  {session.user.isTwoFactorEnabled ? "Activada" : "Desactivada"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Estado de Verificación</p>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Verificado</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Último Acceso</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Hoy, {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Sesiones Activas</p>
                <p className="text-2xl font-bold">1</p>
                <p className="text-xs text-muted-foreground">Esta sesión</p>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                Ver Historial
              </Button>
            </CardContent>
          </Card>

          {/* Groups & Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Grupos y Recursos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Grupos</p>
                <div className="flex flex-wrap gap-1">
                  {session.user.groups && session.user.groups.length > 0 ? (
                    session.user.groups.map((group, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {group}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin grupos asignados</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Recursos</p>
                <div className="flex flex-wrap gap-1">
                  {session.user.resources && session.user.resources.length > 0 ? (
                    session.user.resources.map((resource, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {resource}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin recursos asignados</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Preferencias de Email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacidad
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Globe className="h-4 w-4 mr-2" />
                Idioma y Región
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
