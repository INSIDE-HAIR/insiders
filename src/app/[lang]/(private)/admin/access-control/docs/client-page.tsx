"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  Shield,
  BookOpen,
  Code,
  Settings,
  FileText,
  Lock,
  Users,
  Route,
  Database,
  Eye,
  Calendar,
  Video,
} from "lucide-react";

export default function AccessControlDocsClient() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Shield className='h-8 w-8 text-primary' />
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Documentación de Control de Acceso
            </h1>
            <p className='text-muted-foreground'>
              Guía completa para crear páginas con autenticación en nuestra
              aplicación
            </p>
          </div>
        </div>
      </div>

      {/* Introducción */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            Introducción
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p>
            Nuestra aplicación utiliza un sistema de autenticación y
            autorización basado en roles que permite controlar el acceso a
            diferentes rutas y funcionalidades. Este sistema está integrado con
            NextAuth.js y utiliza configuraciones JSON para definir permisos.
          </p>
          <div className='flex gap-2'>
            <Badge variant='outline'>NextAuth.js v5</Badge>
            <Badge variant='outline'>Role-based Access Control</Badge>
            <Badge variant='outline'>JSON Configuration</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Roles del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Roles del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p>El sistema maneja tres roles principales:</p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 border rounded-lg'>
              <Badge variant='outline' className='mb-2'>
                CLIENT
              </Badge>
              <p className='text-sm text-muted-foreground'>
                Usuario estándar con acceso básico de lectura.
              </p>
            </div>
            <div className='p-4 border rounded-lg'>
              <Badge variant='secondary' className='mb-2'>
                EMPLOYEE
              </Badge>
              <p className='text-sm text-muted-foreground'>
                Empleado con permisos de lectura y escritura.
              </p>
            </div>
            <div className='p-4 border rounded-lg'>
              <Badge variant='default' className='mb-2'>
                ADMIN
              </Badge>
              <p className='text-sm text-muted-foreground'>
                Administrador con permisos completos del sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archivos de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Archivos de Configuración Clave
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-4'>
            <div className='p-4 bg-muted rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Route className='h-4 w-4' />
                <code className='text-sm font-mono'>
                  /src/routes/dashboard-routes.ts
                </code>
              </div>
              <p className='text-sm text-muted-foreground mb-2'>
                Define las rutas del dashboard admin y su navegación.
              </p>
              <div className='bg-background p-3 rounded border text-xs'>
                <pre>{`// Ejemplo de configuración de ruta
{
  "id": "groups",
  "label": {
    "en": "Groups",
    "es": "Grupos"
  },
  "href": "/admin/groups",
  "icon": "Users",
  "access": {
    "roles": ["ADMIN"],
    "teams": ["gestion"]
  }
}`}</pre>
              </div>
            </div>

            <div className='p-4 bg-muted rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Lock className='h-4 w-4' />
                <code className='text-sm font-mono'>
                  /src/config/routes-config.json
                </code>
              </div>
              <p className='text-sm text-muted-foreground mb-2'>
                Configuración principal de acceso y permisos de rutas.
              </p>
              <div className='bg-background p-3 rounded border text-xs'>
                <pre>{`// Ejemplo de configuración de acceso
{
  "path": "/admin/groups",
  "label": "Groups Management",
  "access": {
    "type": "admin",
    "requireAuth": true,
    "roles": ["ADMIN"]
  }
}`}</pre>
              </div>
            </div>

            <div className='p-4 bg-muted rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Settings className='h-4 w-4' />
                <code className='text-sm font-mono'>
                  /src/components/custom/dashboard/dashboard.tsx
                </code>
              </div>
              <p className='text-sm text-muted-foreground'>
                Componente principal del dashboard que renderiza la navegación
                basada en permisos.
              </p>
            </div>

            <div className='p-4 bg-muted rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Code className='h-4 w-4' />
                <code className='text-sm font-mono'>
                  /src/hooks/useDashboardRoutes.ts
                </code>
              </div>
              <p className='text-sm text-muted-foreground'>
                Hook que gestiona las rutas disponibles según el rol del
                usuario.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pasos para Crear una Nueva Página Protegida */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Cómo Crear una Nueva Página con Autenticación
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-6'>
            {/* Paso 1 */}
            <div className='border-l-4 border-primary pl-4'>
              <h3 className='font-semibold text-lg mb-2'>
                1. Configurar la Ruta en routes-config.json
              </h3>
              <p className='text-sm text-muted-foreground mb-3'>
                Añade la nueva ruta a la configuración de acceso:
              </p>
              <div className='bg-background p-3 rounded border text-xs'>
                <pre>{`// En /src/config/routes-config.json -> routes.admin
{
  "path": "/admin/mi-nueva-pagina",
  "label": "Mi Nueva Página",
  "access": {
    "type": "admin",
    "requireAuth": true,
    "roles": ["ADMIN"] // o ["ADMIN", "EMPLOYEE"]
  }
}`}</pre>
              </div>
            </div>

            {/* Paso 2 */}
            <div className='border-l-4 border-blue-500 pl-4'>
              <h3 className='font-semibold text-lg mb-2'>
                2. Añadir al Dashboard de Navegación
              </h3>
              <p className='text-sm text-muted-foreground mb-3'>
                Actualiza el archivo de rutas del dashboard:
              </p>
              <div className='bg-background p-3 rounded border text-xs'>
                <pre>{`// En /src/routes/dashboard-routes.ts
// 1. Añadir a la lista de rutas del equipo:
"routes": ["admin", "dashboard", "mi-nueva-pagina", ...]

// 2. Añadir la configuración de la ruta:
{
  "id": "mi-nueva-pagina",
  "label": {
    "en": "My New Page",
    "es": "Mi Nueva Página"
  },
  "href": "/admin/mi-nueva-pagina",
  "icon": "Settings", // Icono de Lucide React
  "type": "direct", // o "accordion" para subrutas
  "access": {
    "roles": ["ADMIN"],
    "teams": ["gestion"]
  }
}`}</pre>
              </div>
            </div>

            {/* Paso 3 */}
            <div className='border-l-4 border-green-500 pl-4'>
              <h3 className='font-semibold text-lg mb-2'>
                3. Crear la Página del Servidor
              </h3>
              <p className='text-sm text-muted-foreground mb-3'>
                Crea el archivo de página principal con validación del servidor:
              </p>
              <div className='bg-background p-3 rounded border text-xs'>
                <pre>{`// /src/app/[lang]/(private)/admin/mi-nueva-pagina/page.tsx
export const dynamic = "force-dynamic";

import { validateAdminAccess } from "@/src/lib/server-access-control";
import MiNuevaPaginaClient from "./client-page";

export default async function MiNuevaPaginaPage() {
  await validateAdminAccess("/admin/mi-nueva-pagina");
  return <MiNuevaPaginaClient />;
}`}</pre>
              </div>
            </div>

            {/* Paso 4 */}
            <div className='border-l-4 border-purple-500 pl-4'>
              <h3 className='font-semibold text-lg mb-2'>
                4. Crear el Componente Cliente
              </h3>
              <p className='text-sm text-muted-foreground mb-3'>
                Crea el componente que contendrá la lógica de la página:
              </p>
              <div className='bg-background p-3 rounded border text-xs'>
                <pre>{`// /src/app/[lang]/(private)/admin/mi-nueva-pagina/client-page.tsx
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function MiNuevaPaginaClient() {
  const { data: session } = useSession();

  // Verificación adicional del rol (opcional)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div>No tienes permisos para acceder a esta página</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mi Nueva Página</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Contenido de la página aquí...</p>
        </CardContent>
      </Card>
    </div>
  );
}`}</pre>
              </div>
            </div>

            {/* Paso 5 */}
            <div className='border-l-4 border-orange-500 pl-4'>
              <h3 className='font-semibold text-lg mb-2'>
                5. (Opcional) Crear API Routes Protegidas
              </h3>
              <p className='text-sm text-muted-foreground mb-3'>
                Si necesitas endpoints de API, créalos con autenticación:
              </p>
              <div className='bg-background p-3 rounded border text-xs'>
                <pre>{`// /src/app/api/admin/mi-nueva-api/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/src/config/auth/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'No autorizado - Se requiere rol ADMIN' },
      { status: 403 }
    );
  }

  // Tu lógica aquí
  return NextResponse.json({ message: "Success" });
}`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comportamiento Actual del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Eye className='h-5 w-5' />
            Comportamiento Actual del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
            <h4 className='font-semibold text-green-800 mb-2'>
              ✅ Rutas Públicas por Defecto
            </h4>
            <p className='text-sm text-green-700'>
              <strong>Cambio importante:</strong> El sistema ahora permite
              acceso público a cualquier ruta que NO esté explícitamente
              definida en la configuración. Esto significa que las rutas
              dinámicas y nuevas páginas son públicas por defecto, a menos que
              se configure lo contrario.
            </p>
          </div>

          <div className='space-y-2'>
            <h4 className='font-semibold'>Tipos de Rutas:</h4>
            <ul className='space-y-1 text-sm'>
              <li>
                • <strong>Rutas Públicas:</strong> Cualquier ruta no definida en
                routes-config.json
              </li>
              <li>
                • <strong>Rutas Privadas:</strong> Requieren autenticación
                (requireAuth: true)
              </li>
              <li>
                • <strong>Rutas Admin:</strong> Requieren rol ADMIN
                específicamente
              </li>
              <li>
                • <strong>Rutas de Equipo:</strong> Restringidas por equipos
                específicos
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Buenas Prácticas */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Database className='h-5 w-5' />
            Buenas Prácticas de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <div className='p-3 border-l-4 border-blue-500 bg-blue-50'>
              <p className='text-sm'>
                <strong>1. Validación del Servidor:</strong> Siempre usa{" "}
                <code>validateAdminAccess()</code> en páginas sensibles.
              </p>
            </div>
            <div className='p-3 border-l-4 border-green-500 bg-green-50'>
              <p className='text-sm'>
                <strong>2. Validación del Cliente:</strong> Añade verificaciones
                adicionales en componentes cliente cuando sea necesario.
              </p>
            </div>
            <div className='p-3 border-l-4 border-yellow-500 bg-yellow-50'>
              <p className='text-sm'>
                <strong>3. APIs Protegidas:</strong> Siempre verifica la sesión
                y el rol en endpoints de API.
              </p>
            </div>
            <div className='p-3 border-l-4 border-red-500 bg-red-50'>
              <p className='text-sm'>
                <strong>4. Datos Sensibles:</strong> No expongas información
                sensible en el cliente sin verificar permisos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debugging */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Code className='h-5 w-5' />
            Debugging y Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p>Para debuggear problemas de acceso:</p>
          <div className='space-y-2'>
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-sm font-mono'>DEBUG_AUTH=true npm run dev</p>
              <p className='text-xs text-muted-foreground mt-1'>
                Habilita logs detallados de autenticación
              </p>
            </div>
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-sm'>Revisar en consola del navegador:</p>
              <ul className='text-xs text-muted-foreground mt-1 ml-4'>
                <li>• Estado de la sesión del usuario</li>
                <li>• Rol y permisos actuales</li>
                <li>• Rutas accesibles según configuración</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar & Meet Integration */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            <Video className='h-4 w-4' />
            Integración de Calendar y Meet
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p>
            La aplicación incluye integración completa con Google Calendar y
            Google Meet para gestión avanzada de eventos y conferencias.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 border rounded-lg'>
              <h4 className='font-semibold mb-2 flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Calendar API
              </h4>
              <ul className='text-sm space-y-1'>
                <li>• Gestión completa de eventos</li>
                <li>• Importación CSV/JSON</li>
                <li>• Permisos de invitados</li>
                <li>• Recurrencias avanzadas</li>
              </ul>
            </div>

            <div className='p-4 border rounded-lg'>
              <h4 className='font-semibold mb-2 flex items-center gap-2'>
                <Video className='h-4 w-4' />
                Meet API v2
              </h4>
              <ul className='text-sm space-y-1'>
                <li>• Espacios de Meet</li>
                <li>• Grabaciones automáticas</li>
                <li>• Transcripciones con IA</li>
                <li>• Analíticas detalladas</li>
              </ul>
            </div>
          </div>

          <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h4 className='font-semibold text-blue-800 mb-2'>
              Rutas de Calendar & Meet
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm'>
              <div>
                <strong>Calendar:</strong>
                <ul className='ml-4 text-blue-700'>
                  <li>• /admin/calendar</li>
                  <li>• /admin/calendar/events</li>
                  <li>• /api/calendar/*</li>
                </ul>
              </div>
              <div>
                <strong>Meet:</strong>
                <ul className='ml-4 text-blue-700'>
                  <li>• /admin/meet</li>
                  <li>• /admin/meet/spaces</li>
                  <li>• /admin/meet/conferences</li>
                  <li>• /api/meet/*</li>
                </ul>
              </div>
            </div>
          </div>

          <div className='p-3 border-l-4 border-green-500 bg-green-50'>
            <p className='text-sm text-green-700'>
              <strong>Permisos:</strong> Las funciones de Calendar y Meet
              requieren rol ADMIN y están disponibles para los equipos
              &quot;gestion&quot; y &quot;creativos&quot;.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
