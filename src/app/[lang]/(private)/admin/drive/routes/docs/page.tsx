"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Code,
  ExternalLink,
  Server,
  Layout,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import Script from "next/script";

export default function DocsPage() {
  const router = useRouter();

  return (
    <div className="container py-10">
      <div className="flex items-center space-x-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/drive/routes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-3xl font-bold">Documentación de Rutas de Drive</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <p className="text-lg text-muted-foreground mb-8">
          Bienvenido a la documentación de Rutas de Drive. Aquí encontrarás
          información detallada sobre cómo utilizar y extender esta
          funcionalidad.
        </p>

        {/* Video de formación sobre la funcionalidad */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Video de formación</h2>
          <p className="text-muted-foreground mb-4">
            A continuación se muestra una sesión de formación que explica todas
            las funcionalidades y procesos relacionados con esta característica.
          </p>
          <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
            <iframe
              src="https://player.vimeo.com/video/1074594289?h=3bdcf40429&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              title="Formación subida archivos a plataforma CREATIVOS - PRODUCTO"
            ></iframe>
          </div>
          <Script
            src="https://player.vimeo.com/api/player.js"
            strategy="afterInteractive"
          />
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas las guías</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="bg-indigo-50 dark:bg-indigo-900/20">
                  <CardTitle className="flex items-center">
                    <Layout className="mr-2 h-5 w-5" /> Frontend
                  </CardTitle>
                  <CardDescription>
                    Documentación para la interfaz de usuario
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>Secciones disponibles:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Guía para usuarios</li>
                    <li>Documentación para desarrolladores</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={() =>
                      router.push("/admin/drive/routes/docs/frontend")
                    }
                  >
                    Ver documentación Frontend
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20">
                  <CardTitle className="flex items-center">
                    <Server className="mr-2 h-5 w-5" /> Backend
                  </CardTitle>
                  <CardDescription>
                    Documentación para el servidor y la API
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>Secciones disponibles:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Guía para usuarios</li>
                    <li>Documentación para desarrolladores</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={() =>
                      router.push("/admin/drive/routes/docs/backend")
                    }
                  >
                    Ver documentación Backend
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="frontend">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" /> Guía para Usuarios
                  </CardTitle>
                  <CardDescription>
                    Frontend - Cómo usar la interfaz
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>Aprende a:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Navegar por la interfaz</li>
                    <li>Crear y gestionar rutas en la UI</li>
                    <li>Configurar opciones visuales</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={() =>
                      router.push("/admin/drive/routes/docs/frontend/users")
                    }
                  >
                    Ver Guía de Usuario Frontend
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/20">
                  <CardTitle className="flex items-center">
                    <Code className="mr-2 h-5 w-5" /> Documentación Técnica
                  </CardTitle>
                  <CardDescription>
                    Frontend - Para desarrolladores
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>Información sobre:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Estructura de componentes React</li>
                    <li>Gestión de estados y rutas</li>
                    <li>Personalización de la UI</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={() =>
                      router.push("/admin/drive/routes/docs/frontend/devs")
                    }
                  >
                    Ver Documentación Técnica Frontend
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="backend">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" /> Guía para Usuarios
                  </CardTitle>
                  <CardDescription>
                    Backend - Administración y configuración
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>Aprende a:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Configurar credenciales de Google Drive</li>
                    <li>Gestionar permisos y límites</li>
                    <li>Monitorear el uso y errores</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={() =>
                      router.push("/admin/drive/routes/docs/backend/users")
                    }
                  >
                    Ver Guía de Usuario Backend
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/20">
                  <CardTitle className="flex items-center">
                    <Code className="mr-2 h-5 w-5" /> Documentación Técnica
                  </CardTitle>
                  <CardDescription>
                    Backend - Para desarrolladores
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>Información sobre:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Modelo de datos y APIs</li>
                    <li>Integración con Google Drive</li>
                    <li>Manejo de errores y caché</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={() =>
                      router.push("/admin/drive/routes/docs/backend/devs")
                    }
                  >
                    Ver Documentación Técnica Backend
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-10" />

        <div className="rounded-lg border p-6 bg-slate-50 dark:bg-slate-900/20">
          <h2 className="text-2xl font-bold mb-4">Recursos adicionales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://developers.google.com/drive/api/quickstart/nodejs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <div className="mr-4 bg-blue-100 p-3 rounded-full">
                <ExternalLink className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Google Drive API</h3>
                <p className="text-sm text-muted-foreground">
                  Documentación oficial de Google Drive API
                </p>
              </div>
            </a>

            <a
              href="https://www.prisma.io/docs/concepts/components/prisma-client/crud"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <div className="mr-4 bg-green-100 p-3 rounded-full">
                <ExternalLink className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Prisma CRUD</h3>
                <p className="text-sm text-muted-foreground">
                  Trabajar con el modelo en bases de datos
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
