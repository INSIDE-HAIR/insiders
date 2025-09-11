"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Code,
  ExternalLink,
  Server,
  Layout,
  Home,
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
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";

export default function DocsPage() {
  const router = useRouter();

  return (
    <div>
      <DocHeader
        title='Documentación de Rutas de Drive'
        description='Bienvenido a la documentación de Rutas de Drive. Aquí encontrarás información detallada sobre cómo utilizar y extender esta funcionalidad'
        icon={Home}
      />

      <DocContent>
        <div className='mx-auto'>
          {/* Video de formación sobre la funcionalidad */}
          <div className='mb-10'>
            <h2 className='text-2xl font-bold mb-4 text-foreground'>
              Video de formación
            </h2>
            <p className='text-muted-foreground mb-4'>
              A continuación se muestra una sesión de formación que explica
              todas las funcionalidades y procesos relacionados con esta
              característica.
            </p>
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src='https://player.vimeo.com/video/1074594289?h=3bdcf40429&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
                frameBorder='0'
                allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media'
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                title='Formación subida archivos a plataforma CREATIVOS - PRODUCTO'
              ></iframe>
            </div>
            <Script
              src='https://player.vimeo.com/api/player.js'
              strategy='afterInteractive'
            />
          </div>

          <Tabs defaultValue='all' className='mb-8'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='all'>Todas las guías</TabsTrigger>
              <TabsTrigger value='frontend'>Frontend</TabsTrigger>
              <TabsTrigger value='backend'>Backend</TabsTrigger>
            </TabsList>

            <TabsContent value='all'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                <Card className='hover:shadow-md transition-shadow'>
                  <CardHeader className='bg-primary/5 border-b border-primary/20'>
                    <CardTitle className='flex items-center text-primary'>
                      <Layout className='mr-2 h-5 w-5' /> Frontend
                    </CardTitle>
                    <CardDescription className='text-muted-foreground'>
                      Documentación para la interfaz de usuario
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='pt-6'>
                    <p className='text-foreground'>Secciones disponibles:</p>
                    <ul className='list-disc pl-6 mt-2 space-y-1 text-foreground'>
                      <li>Guía para usuarios</li>
                      <li>Documentación para desarrolladores</li>
                    </ul>
                  </CardContent>
                  <CardFooter className='flex justify-end'>
                    <Button
                      onClick={() =>
                        router.push("/admin/drive/routes/docs/frontend")
                      }
                    >
                      Ver documentación Frontend
                    </Button>
                  </CardFooter>
                </Card>

                <Card className='hover:shadow-md transition-shadow'>
                  <CardHeader className='bg-primary/5 border-b border-primary/20'>
                    <CardTitle className='flex items-center text-primary'>
                      <Server className='mr-2 h-5 w-5' /> Backend
                    </CardTitle>
                    <CardDescription className='text-muted-foreground'>
                      Documentación para el servidor y la API
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='pt-6'>
                    <p className='text-foreground'>Secciones disponibles:</p>
                    <ul className='list-disc pl-6 mt-2 space-y-1 text-foreground'>
                      <li>Guía para usuarios</li>
                      <li>Documentación para desarrolladores</li>
                    </ul>
                  </CardContent>
                  <CardFooter className='flex justify-end'>
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

            <TabsContent value='frontend'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                <Card className='hover:shadow-md transition-shadow'>
                  <CardHeader className='bg-primary/5 border-b border-primary/20'>
                    <CardTitle className='flex items-center text-primary'>
                      <Users className='mr-2 h-5 w-5' /> Guía para Usuarios
                    </CardTitle>
                    <CardDescription className='text-muted-foreground'>
                      Frontend - Cómo usar la interfaz
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='pt-6'>
                    <p className='text-foreground'>Aprende a:</p>
                    <ul className='list-disc pl-6 mt-2 space-y-1 text-foreground'>
                      <li>Navegar por la interfaz</li>
                      <li>Crear y gestionar rutas en la UI</li>
                      <li>Configurar opciones visuales</li>
                    </ul>
                  </CardContent>
                  <CardFooter className='flex justify-end'>
                    <Button
                      onClick={() =>
                        router.push("/admin/drive/routes/docs/frontend/users")
                      }
                    >
                      Ver Guía de Usuario Frontend
                    </Button>
                  </CardFooter>
                </Card>

                <Card className='hover:shadow-md transition-shadow'>
                  <CardHeader className='bg-primary/5 border-b border-primary/20'>
                    <CardTitle className='flex items-center text-primary'>
                      <Code className='mr-2 h-5 w-5' /> Documentación Técnica
                    </CardTitle>
                    <CardDescription className='text-muted-foreground'>
                      Frontend - Para desarrolladores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='pt-6'>
                    <p className='text-foreground'>Información sobre:</p>
                    <ul className='list-disc pl-6 mt-2 space-y-1 text-foreground'>
                      <li>Estructura de componentes React</li>
                      <li>Gestión de estados y rutas</li>
                      <li>Personalización de la UI</li>
                    </ul>
                  </CardContent>
                  <CardFooter className='flex justify-end'>
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

            <TabsContent value='backend'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                <Card className='hover:shadow-md transition-shadow'>
                  <CardHeader className='bg-primary/5 border-b border-primary/20'>
                    <CardTitle className='flex items-center text-primary'>
                      <Users className='mr-2 h-5 w-5' /> Guía para Usuarios
                    </CardTitle>
                    <CardDescription className='text-muted-foreground'>
                      Backend - Administración y configuración
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='pt-6'>
                    <p className='text-foreground'>Aprende a:</p>
                    <ul className='list-disc pl-6 mt-2 space-y-1 text-foreground'>
                      <li>Configurar credenciales de Google Drive</li>
                      <li>Gestionar permisos y límites</li>
                      <li>Monitorear el uso y errores</li>
                    </ul>
                  </CardContent>
                  <CardFooter className='flex justify-end'>
                    <Button
                      onClick={() =>
                        router.push("/admin/drive/routes/docs/backend/users")
                      }
                    >
                      Ver Guía de Usuario Backend
                    </Button>
                  </CardFooter>
                </Card>

                <Card className='hover:shadow-md transition-shadow'>
                  <CardHeader className='bg-primary/5 border-b border-primary/20'>
                    <CardTitle className='flex items-center text-primary'>
                      <Code className='mr-2 h-5 w-5' /> Documentación Técnica
                    </CardTitle>
                    <CardDescription className='text-muted-foreground'>
                      Backend - Para desarrolladores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='pt-6'>
                    <p className='text-foreground'>Información sobre:</p>
                    <ul className='list-disc pl-6 mt-2 space-y-1 text-foreground'>
                      <li>Modelo de datos y APIs</li>
                      <li>Integración con Google Drive</li>
                      <li>Manejo de errores y caché</li>
                    </ul>
                  </CardContent>
                  <CardFooter className='flex justify-end'>
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

          <Separator className='my-10' />

          <div className='rounded-lg border p-6 bg-primary/5 border-primary/20'>
            <h2 className='text-2xl font-bold mb-4 text-foreground'>
              Recursos adicionales
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <a
                href='https://developers.google.com/drive/api/quickstart/nodejs'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center p-4 border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors'
              >
                <div className='mr-4 bg-primary/20 p-3 rounded-full'>
                  <ExternalLink className='h-5 w-5 text-primary' />
                </div>
                <div>
                  <h3 className='font-semibold text-foreground'>
                    Google Drive API
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Documentación oficial de Google Drive API
                  </p>
                </div>
              </a>

              <a
                href='https://www.prisma.io/docs/concepts/components/prisma-client/crud'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center p-4 border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors'
              >
                <div className='mr-4 bg-primary/20 p-3 rounded-full'>
                  <ExternalLink className='h-5 w-5 text-primary' />
                </div>
                <div>
                  <h3 className='font-semibold text-foreground'>Prisma CRUD</h3>
                  <p className='text-sm text-muted-foreground'>
                    Trabajar con el modelo en bases de datos
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </DocContent>
    </div>
  );
}
