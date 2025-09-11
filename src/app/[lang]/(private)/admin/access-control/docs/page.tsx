import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { 
  Shield, 
  Users, 
  Key, 
  Database, 
  Zap, 
  Lock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Code,
  Settings
} from "lucide-react";
import Link from "next/link";

export default function AuthDocsPage() {
  return (
    <div>
      <DocHeader
        title="Documentación de Autenticación"
        description="Guía completa para implementar autenticación segura con NextAuth.js v5"
        icon={Shield}
      />

      <DocContent>
        {/* Introducción */}
        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Sistema de Autenticación Moderno:</strong> Nuestra aplicación utiliza NextAuth.js v5 con soporte completo para múltiples proveedores, 
            roles dinámicos, y control de acceso granular. Todo está integrado con Prisma y MongoDB para máxima flexibilidad.
          </AlertDescription>
        </Alert>

        {/* Features principales */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Características Principales
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Múltiples Proveedores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">Google</Badge>
                  <Badge variant="secondary">GitHub</Badge>
                  <Badge variant="secondary">Credentials</Badge>
                  <Badge variant="secondary">Resend</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  OAuth2 y autenticación por email con verificación
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Sistema de Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="default">ADMIN</Badge>
                  <Badge variant="secondary">EMPLOYEE</Badge>
                  <Badge variant="secondary">CLIENT</Badge>
                  <Badge variant="outline">PROVIDER</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Control granular con middleware de rutas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Persistencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">MongoDB</Badge>
                  <Badge variant="secondary">Prisma</Badge>
                  <Badge variant="secondary">JWT</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sesiones híbridas con base de datos y tokens
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Inicio Rápido
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Para Desarrolladores
                </CardTitle>
                <CardDescription>
                  Aprende los fundamentos de nuestro sistema de autenticación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Arquitectura y flujos de auth</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Configuración de proveedores</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Implementar roles y permisos</span>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/admin/auth/docs/fundamentals">
                    Empezar con Fundamentos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración Avanzada
                </CardTitle>
                <CardDescription>
                  Personaliza y extiende el sistema según tus necesidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Variables de entorno</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Callbacks personalizados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Middleware y seguridad</span>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admin/auth/docs/configuration">
                    Ver Configuración
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Arquitectura Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            Arquitectura del Sistema
          </h2>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Flujo de Autenticación</CardTitle>
                <CardDescription>
                  Cómo funciona la autenticación desde el login hasta la sesión activa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg border border-border">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">Inicio de Sesión</h4>
                      <p className="text-xs text-muted-foreground">Usuario selecciona proveedor (Google, GitHub, Credentials)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg border border-border">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">Verificación</h4>
                      <p className="text-xs text-muted-foreground">NextAuth valida credenciales y ejecuta callbacks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg border border-border">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">Creación de Sesión</h4>
                      <p className="text-xs text-muted-foreground">Se crea la sesión con roles y se persiste en base de datos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg border border-border">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">Control de Acceso</h4>
                      <p className="text-xs text-muted-foreground">Middleware verifica permisos en cada request</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enlaces rápidos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Proveedores</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Configura Google, GitHub, Credentials y más
              </p>
              <Button variant="ghost" size="sm" asChild className="w-full justify-start p-0 h-auto">
                <Link href="/admin/auth/docs/providers">
                  Ver proveedores <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Roles</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Sistema de roles y control de acceso
              </p>
              <Button variant="ghost" size="sm" asChild className="w-full justify-start p-0 h-auto">
                <Link href="/admin/auth/docs/roles">
                  Ver roles <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Seguridad</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Mejores prácticas y configuración segura
              </p>
              <Button variant="ghost" size="sm" asChild className="w-full justify-start p-0 h-auto">
                <Link href="/admin/auth/docs/security">
                  Ver seguridad <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Troubleshooting</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Solución de problemas y debugging
              </p>
              <Button variant="ghost" size="sm" asChild className="w-full justify-start p-0 h-auto">
                <Link href="/admin/auth/docs/troubleshooting">
                  Ver guía <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DocContent>
    </div>
  );
}