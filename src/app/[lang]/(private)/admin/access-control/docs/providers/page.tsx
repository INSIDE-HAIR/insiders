import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { 
  Users, 
  Github,
  Mail,
  Key,
  Shield,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Code,
  Copy
} from "lucide-react";
import Link from "next/link";

export default function ProvidersPage() {
  return (
    <div>
      <DocHeader
        title="Proveedores de Autenticación"
        description="Configuración y uso de los diferentes proveedores OAuth y credenciales"
        icon={Users}
      />

      <DocContent>
        {/* Introducción */}
        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <Users className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Múltiples Proveedores:</strong> Nuestra aplicación soporta Google OAuth, GitHub OAuth, 
            autenticación por credenciales (email/password) y Resend para verificación por email.
          </AlertDescription>
        </Alert>

        {/* Proveedores Disponibles */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Proveedores Disponibles
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Google OAuth */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">G</div>
                    Google OAuth
                  </CardTitle>
                  <Badge variant="default">Activo</Badge>
                </div>
                <CardDescription>
                  Autenticación con cuentas de Google usando OAuth 2.0
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Características:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Login rápido con Google
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Acceso a perfil y avatar
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Verificación automática de email
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Integración con Google Drive
                    </li>
                  </ul>
                </div>
                <div className="p-3 bg-accent/30 rounded border border-border">
                  <p className="text-xs font-mono">GOOGLE_CLIENT_ID</p>
                  <p className="text-xs font-mono">GOOGLE_CLIENT_SECRET</p>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/admin/auth/docs/providers/google">
                    Ver configuración <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* GitHub OAuth */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Github className="w-8 h-8" />
                    GitHub OAuth
                  </CardTitle>
                  <Badge variant="default">Activo</Badge>
                </div>
                <CardDescription>
                  Autenticación con cuentas de GitHub para desarrolladores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Características:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Perfect para desarrolladores
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Acceso a repos públicos (opcional)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Perfil técnico detallado
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Verificación automática
                    </li>
                  </ul>
                </div>
                <div className="p-3 bg-accent/30 rounded border border-border">
                  <p className="text-xs font-mono">GITHUB_CLIENT_ID</p>
                  <p className="text-xs font-mono">GITHUB_CLIENT_SECRET</p>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/admin/auth/docs/providers/github">
                    Ver configuración <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Credentials */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-8 h-8 text-primary" />
                    Credentials
                  </CardTitle>
                  <Badge variant="default">Activo</Badge>
                </div>
                <CardDescription>
                  Autenticación tradicional con email y contraseña
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Características:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Email y contraseña
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Hash bcrypt seguro
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Validación server-side
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Control total de datos
                    </li>
                  </ul>
                </div>
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Nota:</strong> Requiere verificación manual de email
                  </AlertDescription>
                </Alert>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/admin/auth/docs/providers/credentials">
                    Ver configuración <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Resend Email */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-8 h-8 text-primary" />
                    Resend Email
                  </CardTitle>
                  <Badge variant="default">Activo</Badge>
                </div>
                <CardDescription>
                  Autenticación sin contraseña usando enlaces mágicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Características:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Enlaces mágicos seguros
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Sin contraseñas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      Verificación automática
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      UX simplificada
                    </li>
                  </ul>
                </div>
                <div className="p-3 bg-accent/30 rounded border border-border">
                  <p className="text-xs font-mono">RESEND_API_KEY</p>
                  <p className="text-xs font-mono">EMAIL_FROM</p>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/admin/auth/docs/providers/resend">
                    Ver configuración <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Configuración General */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            Configuración en auth.ts
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Archivo de Configuración Principal</CardTitle>
              <CardDescription>
                src/config/auth/auth.ts - Configuración central de NextAuth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-accent/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-mono text-sm">auth.ts</h4>
                    <Button size="sm" variant="ghost">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
{`import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import Resend from "next-auth/providers/resend"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      // Configuración personalizada
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM!,
    }),
  ],
  // Callbacks, pages, etc...
})`}
                  </pre>
                </div>

                <Alert className="border-primary/20 bg-primary/5">
                  <Shield className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-foreground">
                    <strong>Importante:</strong> Cada proveedor requiere variables de entorno específicas 
                    y configuración en las respectivas plataformas (Google Console, GitHub Apps, etc.)
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparación de Proveedores */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Comparación de Proveedores</h2>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium">Proveedor</th>
                      <th className="text-left p-4 font-medium">Velocidad</th>
                      <th className="text-left p-4 font-medium">Seguridad</th>
                      <th className="text-left p-4 font-medium">UX</th>
                      <th className="text-left p-4 font-medium">Configuración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          Google OAuth
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">Muy Rápida</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">Muy Alta</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">Excelente</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">Media</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Github className="w-4 h-4" />
                          GitHub OAuth
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">Muy Rápida</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">Muy Alta</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">Excelente</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">Media</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-primary" />
                          Credentials
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">Media</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">Alta</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">Buena</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">Compleja</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          Resend Email
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">Media</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">Alta</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">Muy Buena</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">Fácil</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enlaces rápidos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/admin/auth/docs/providers/google">
              <div className="text-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">G</div>
                <div className="font-medium">Google</div>
                <div className="text-xs text-muted-foreground">OAuth Setup</div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/admin/auth/docs/providers/github">
              <div className="text-center">
                <Github className="h-8 w-8 mx-auto mb-2" />
                <div className="font-medium">GitHub</div>
                <div className="text-xs text-muted-foreground">OAuth Setup</div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/admin/auth/docs/providers/credentials">
              <div className="text-center">
                <Key className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Credentials</div>
                <div className="text-xs text-muted-foreground">Email/Password</div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-auto p-4">
            <Link href="/admin/auth/docs/providers/resend">
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Resend</div>
                <div className="text-xs text-muted-foreground">Magic Links</div>
              </div>
            </Link>
          </Button>
        </div>
      </DocContent>
    </div>
  );
}