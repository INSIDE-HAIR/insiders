"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Code, ExternalLink } from "lucide-react";
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

export default function DocsPage() {
  const router = useRouter();

  return (
    <div className='container py-10'>
      <div className='flex items-center space-x-4 mb-8'>
        <Button
          variant='ghost'
          onClick={() => router.push("/admin/drive-routes")}
        >
          <ArrowLeft className='mr-2 h-4 w-4' /> Volver
        </Button>
        <h1 className='text-3xl font-bold'>Documentación de Rutas de Drive</h1>
      </div>

      <div className='max-w-4xl mx-auto'>
        <p className='text-lg text-muted-foreground mb-8'>
          Bienvenido a la documentación de Rutas de Drive. Aquí encontrarás
          información detallada sobre cómo utilizar y extender esta
          funcionalidad.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <Card className='hover:shadow-md transition-shadow'>
            <CardHeader className='bg-blue-50 dark:bg-blue-900/20'>
              <CardTitle className='flex items-center'>
                <Users className='mr-2 h-5 w-5' /> Guía para Usuarios
              </CardTitle>
              <CardDescription>
                Aprende a crear y gestionar rutas de Drive
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-6'>
              <p>Descubre cómo:</p>
              <ul className='list-disc pl-6 mt-2 space-y-1'>
                <li>Crear nuevas rutas personalizadas</li>
                <li>Gestionar rutas existentes</li>
                <li>Sincronizar contenido con Google Drive</li>
                <li>Configurar permisos correctamente</li>
              </ul>
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Button
                onClick={() => router.push("/admin/drive-routes/docs/users")}
              >
                Ver Guía de Usuario
              </Button>
            </CardFooter>
          </Card>

          <Card className='hover:shadow-md transition-shadow'>
            <CardHeader className='bg-slate-50 dark:bg-slate-900/20'>
              <CardTitle className='flex items-center'>
                <Code className='mr-2 h-5 w-5' /> Documentación Técnica
              </CardTitle>
              <CardDescription>
                Información para desarrolladores
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-6'>
              <p>Información sobre:</p>
              <ul className='list-disc pl-6 mt-2 space-y-1'>
                <li>Modelo de datos y estructura</li>
                <li>APIs disponibles</li>
                <li>Flujo de datos y sincronización</li>
                <li>Extensión del sistema</li>
              </ul>
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Button
                onClick={() => router.push("/admin/drive-routes/docs/devs")}
              >
                Ver Documentación Técnica
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Separator className='my-10' />

        <div className='rounded-lg border p-6 bg-slate-50 dark:bg-slate-900/20'>
          <h2 className='text-2xl font-bold mb-4'>Recursos adicionales</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <a
              href='https://developers.google.com/drive/api/quickstart/nodejs'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center p-4 border rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors'
            >
              <div className='mr-4 bg-blue-100 p-3 rounded-full'>
                <ExternalLink className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <h3 className='font-semibold'>Google Drive API</h3>
                <p className='text-sm text-muted-foreground'>
                  Documentación oficial de Google Drive API
                </p>
              </div>
            </a>

            <a
              href='https://www.prisma.io/docs/concepts/components/prisma-client/crud'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center p-4 border rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors'
            >
              <div className='mr-4 bg-green-100 p-3 rounded-full'>
                <ExternalLink className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <h3 className='font-semibold'>Prisma CRUD</h3>
                <p className='text-sm text-muted-foreground'>
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
