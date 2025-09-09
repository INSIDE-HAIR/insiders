"use client";

import { useRouter } from "next/navigation";
import { Users, Code, Database, Workflow, Server } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";

export default function BackendDocsPage() {
  const router = useRouter();

  return (
    <div>
      <DocHeader
        title='Documentación Backend'
        description='Documentación técnica y guías para la configuración y desarrollo del servidor'
        icon={Server}
      />
      
      <DocContent>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader className='bg-primary/5 border-b border-primary/20'>
            <CardTitle className='flex items-center text-primary'>
              <Users className='mr-2 h-5 w-5' /> Guía para Usuarios
            </CardTitle>
            <CardDescription className='text-slate-300'>
              Administración y configuración del backend
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p className='text-white'>Esta guía explica cómo:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1 text-white'>
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
          <CardHeader className='bg-primary/5 border-b border-primary/20'>
            <CardTitle className='flex items-center text-primary'>
              <Code className='mr-2 h-5 w-5' /> Documentación Técnica
            </CardTitle>
            <CardDescription className='text-slate-300'>Para desarrolladores backend</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p className='text-white'>Referencias técnicas detalladas:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1 text-white'>
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
          <CardHeader className='bg-primary/5 border-b border-primary/20'>
            <CardTitle className='flex items-center text-primary'>
              <Database className='mr-2 h-5 w-5' /> Modelo de Datos
            </CardTitle>
            <CardDescription className='text-slate-300'>Estructura y relaciones</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p className='text-white'>Documentación del modelo que incluye:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1 text-white'>
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
          <CardHeader className='bg-primary/5 border-b border-primary/20'>
            <CardTitle className='flex items-center text-primary'>
              <Workflow className='mr-2 h-5 w-5' /> Flujos de Trabajo
            </CardTitle>
            <CardDescription className='text-slate-300'>Procesos y automatizaciones</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p className='text-white'>Documentación de flujos que incluye:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1 text-white'>
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
      </DocContent>
    </div>
  );
}
