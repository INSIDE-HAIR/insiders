"use client";

import { useRouter } from "next/navigation";
import { Users, Code, Database, Workflow } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export default function BackendDocsPage() {
  const router = useRouter();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold mb-2'>Documentación Backend</h1>
        <p className='text-lg text-muted-foreground'>
          Documentación técnica y guías para la configuración y desarrollo del
          servidor.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader className='bg-blue-50 dark:bg-blue-900/20'>
            <CardTitle className='flex items-center'>
              <Users className='mr-2 h-5 w-5' /> Guía para Usuarios
            </CardTitle>
            <CardDescription>
              Administración y configuración del backend
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p>Esta guía explica cómo:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Configurar credenciales de API</li>
              <li>Administrar permisos de acceso</li>
              <li>Monitorear uso y rendimiento</li>
              <li>Resolver problemas comunes</li>
            </ul>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button
              onClick={() =>
                router.push("/admin/drive/routes/docs/backend/users")
              }
            >
              Ver Guía de Administración
            </Button>
          </CardFooter>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader className='bg-slate-50 dark:bg-slate-900/20'>
            <CardTitle className='flex items-center'>
              <Code className='mr-2 h-5 w-5' /> Documentación Técnica
            </CardTitle>
            <CardDescription>Para desarrolladores backend</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p>Referencias técnicas detalladas:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Arquitectura de la API</li>
              <li>Modelos de datos y esquemas</li>
              <li>Integración con Google Drive API</li>
              <li>Manejo de errores y rendimiento</li>
            </ul>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button
              onClick={() =>
                router.push("/admin/drive/routes/docs/backend/devs")
              }
            >
              Ver Documentación Técnica
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader className='bg-green-50 dark:bg-green-900/20'>
            <CardTitle className='flex items-center'>
              <Database className='mr-2 h-5 w-5' /> Modelo de Datos
            </CardTitle>
            <CardDescription>Estructura y relaciones</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p>Documentación del modelo que incluye:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Entidades y relaciones</li>
              <li>Campos y tipos de datos</li>
              <li>Restricciones y validaciones</li>
              <li>Ejemplos de consultas</li>
            </ul>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button
              onClick={() =>
                router.push("/admin/drive/routes/docs/backend/devs#data-model")
              }
            >
              Ver Modelo de Datos
            </Button>
          </CardFooter>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader className='bg-purple-50 dark:bg-purple-900/20'>
            <CardTitle className='flex items-center'>
              <Workflow className='mr-2 h-5 w-5' /> Flujos de Trabajo
            </CardTitle>
            <CardDescription>Procesos y automatizaciones</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p>Documentación de flujos que incluye:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Sincronización de datos</li>
              <li>Manejo de eventos</li>
              <li>Trabajos programados</li>
              <li>Notificaciones</li>
            </ul>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button
              onClick={() =>
                router.push("/admin/drive/routes/docs/backend/devs#workflows")
              }
            >
              Ver Flujos de Trabajo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
