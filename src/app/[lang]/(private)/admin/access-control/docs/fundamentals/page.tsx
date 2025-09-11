import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { 
  BookOpen, 
  Shield, 
  Zap, 
  Database,
  ArrowRight,
  CheckCircle,
  Users,
  Key,
  Lock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export default function FundamentalsPage() {
  return (
    <div>
      <DocHeader
        title="Fundamentos de Autenticación"
        description="Conceptos básicos de NextAuth.js v5 y nuestra implementación"
        icon={BookOpen}
      />

      <DocContent>
        {/* ¿Qué es NextAuth.js? */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            ¿Qué es NextAuth.js?
          </h2>
          
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Shield className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <strong>NextAuth.js v5</strong> es una biblioteca completa de autenticación para aplicaciones Next.js 
              que maneja OAuth, autenticación por email, JWT, sesiones y mucho más de forma segura y escalable.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Características Principales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Múltiples Proveedores:</span>
                    <p className="text-sm text-muted-foreground">OAuth (Google, GitHub), Email, Credentials</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Sesiones Flexibles:</span>
                    <p className="text-sm text-muted-foreground">JWT o Database sessions</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Seguridad Integrada:</span>
                    <p className="text-sm text-muted-foreground">CSRF, JWT signing, secure cookies</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">TypeScript:</span>
                    <p className="text-sm text-muted-foreground">Tipado completo y autocompletado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Nuestra Implementación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="default" className="w-fit">NextAuth.js v5</Badge>
                  <p className="text-sm text-muted-foreground">
                    Versión más reciente con soporte para App Router
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit">Prisma + MongoDB</Badge>
                  <p className="text-sm text-muted-foreground">
                    Persistencia de usuarios, cuentas y sesiones
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-fit">JWT Strategy</Badge>
                  <p className="text-sm text-muted-foreground">
                    Tokens seguros con información de roles
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Arquitectura */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Arquitectura del Sistema
          </h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Componentes Principales</CardTitle>
              <CardDescription>
                Cómo interactúan los diferentes componentes de nuestro sistema de auth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Proveedores</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Google OAuth</li>
                    <li>• GitHub OAuth</li>
                    <li>• Credentials</li>
                    <li>• Resend Email</li>
                  </ul>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Sesiones</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• JWT Tokens</li>
                    <li>• Database Storage</li>
                    <li>• Roles & Permissions</li>
                    <li>• Auto-refresh</li>
                  </ul>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Seguridad</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Route Protection</li>
                    <li>• CSRF Protection</li>
                    <li>• Secure Cookies</li>
                    <li>• Rate Limiting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flujos de Auth */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-primary" />
            Flujos de Autenticación
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>OAuth Flow (Google/GitHub)</CardTitle>
                <CardDescription>
                  Flujo de autenticación con proveedores externos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="text-sm font-medium">Usuario hace clic en &quot;Iniciar con Google&quot;</p>
                      <p className="text-xs text-muted-foreground">Se redirige a Google OAuth</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="text-sm font-medium">Google autentica al usuario</p>
                      <p className="text-xs text-muted-foreground">Retorna código de autorización</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="text-sm font-medium">NextAuth intercambia código por token</p>
                      <p className="text-xs text-muted-foreground">Obtiene perfil del usuario</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <div>
                      <p className="text-sm font-medium">Se crea/actualiza usuario en DB</p>
                      <p className="text-xs text-muted-foreground">Sesión activa con roles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credentials Flow</CardTitle>
                <CardDescription>
                  Autenticación con email y contraseña
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="text-sm font-medium">Usuario ingresa email/password</p>
                      <p className="text-xs text-muted-foreground">En formulario de login</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="text-sm font-medium">Validación server-side</p>
                      <p className="text-xs text-muted-foreground">Verificación contra base de datos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="text-sm font-medium">Hash comparison</p>
                      <p className="text-xs text-muted-foreground">Bcrypt password verification</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <div>
                      <p className="text-sm font-medium">JWT creation & session</p>
                      <p className="text-xs text-muted-foreground">Usuario autenticado con roles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enlaces de navegación */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/admin/auth/docs/fundamentals/architecture">
              <div className="text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Arquitectura</div>
                <div className="text-xs text-muted-foreground">Detalles técnicos</div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/admin/auth/docs/fundamentals/auth-flows">
              <div className="text-center">
                <ArrowRight className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Flujos Auth</div>
                <div className="text-xs text-muted-foreground">Diagramas detallados</div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/admin/auth/docs/fundamentals/session-types">
              <div className="text-center">
                <Key className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Sesiones</div>
                <div className="text-xs text-muted-foreground">JWT vs Database</div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/admin/auth/docs/configuration">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Configuración</div>
                <div className="text-xs text-muted-foreground">Setup inicial</div>
              </div>
            </Link>
          </Button>
        </div>
      </DocContent>
    </div>
  );
}