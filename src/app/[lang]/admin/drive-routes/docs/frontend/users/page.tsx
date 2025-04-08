"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function FrontendUserGuide() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold mb-2'>Guía de Usuario - Frontend</h1>
        <p className='text-lg text-muted-foreground mb-6'>
          Aprende a utilizar la interfaz de usuario de Rutas de Drive de manera
          efectiva.
        </p>

        <Alert>
          <InfoIcon className='h-4 w-4' />
          <AlertTitle>Documentación en desarrollo</AlertTitle>
          <AlertDescription>
            Esta documentación está siendo actualizada constantemente. Última
            actualización: Abril 2024.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue='getting-started' className='mt-6'>
        <TabsList className='grid w-full md:w-auto grid-cols-1 md:grid-cols-4'>
          <TabsTrigger value='getting-started'>Primeros pasos</TabsTrigger>
          <TabsTrigger value='navigation'>Navegación</TabsTrigger>
          <TabsTrigger value='configuration'>Configuración</TabsTrigger>
          <TabsTrigger value='troubleshooting'>
            Solución de problemas
          </TabsTrigger>
        </TabsList>

        <TabsContent value='getting-started' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Primeros pasos con Rutas de Drive</CardTitle>
              <CardDescription>
                Introducción básica para comenzar a usar la interfaz.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <h3 className='text-lg font-medium'>¿Qué es Rutas de Drive?</h3>
              <p>
                Rutas de Drive es una funcionalidad que te permite conectar
                carpetas de Google Drive con tu sitio web, creando rutas
                personalizadas para acceder a contenido específico.
              </p>

              <h3 className='text-lg font-medium'>Requisitos previos</h3>
              <ul className='list-disc pl-6 space-y-1'>
                <li>Una cuenta de Google con acceso a Google Drive</li>
                <li>Permisos de administrador en la plataforma</li>
                <li>Carpetas organizadas en Google Drive</li>
              </ul>

              <h3 className='text-lg font-medium'>Pasos iniciales</h3>
              <ol className='list-decimal pl-6 space-y-2'>
                <li>
                  <strong>Acceder al panel:</strong> Inicia sesión y navega a la
                  sección "Rutas de Drive" en el panel de administración.
                </li>
                <li>
                  <strong>Autenticación:</strong> Conecta tu cuenta de Google si
                  aún no lo has hecho, siguiendo los pasos de autenticación.
                </li>
                <li>
                  <strong>Explorar la interfaz:</strong> Familiarízate con el
                  panel principal, que muestra tus rutas existentes y opciones
                  para crear nuevas.
                </li>
                <li>
                  <strong>Crear tu primera ruta:</strong> Haz clic en "Nueva
                  ruta" y sigue el asistente para conectar una carpeta de Google
                  Drive con una URL en tu sitio.
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='navigation' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Navegación por la interfaz</CardTitle>
              <CardDescription>
                Cómo moverte por las distintas secciones de Rutas de Drive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground italic'>
                Contenido en desarrollo. Esta sección mostrará cómo navegar por
                las diferentes opciones y visualizaciones de la interfaz de
                Rutas de Drive.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='configuration' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Opciones de configuración</CardTitle>
              <CardDescription>
                Cómo personalizar y configurar tus rutas para diferentes
                necesidades.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground italic'>
                Contenido en desarrollo. Esta sección explicará las diferentes
                opciones de configuración disponibles para tus rutas de Drive.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='troubleshooting' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Solución de problemas comunes</CardTitle>
              <CardDescription>
                Respuestas a problemas frecuentes que puedes encontrar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground italic'>
                Contenido en desarrollo. Esta sección proporcionará respuestas a
                preguntas frecuentes y soluciones a problemas comunes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
