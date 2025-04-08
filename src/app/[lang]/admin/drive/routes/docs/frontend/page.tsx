"use client";

import { useRouter } from "next/navigation";
import { Users, Code } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export default function FrontendDocsPage() {
  const router = useRouter();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold mb-2'>Documentación Frontend</h1>
        <p className='text-lg text-muted-foreground'>
          Todo lo que necesitas saber sobre la interfaz de usuario de Rutas de
          Drive.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader className='bg-blue-50 dark:bg-blue-900/20'>
            <CardTitle className='flex items-center'>
              <Users className='mr-2 h-5 w-5' /> Guía para Usuarios
            </CardTitle>
            <CardDescription>
              Aprende a usar la interfaz de Rutas de Drive
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p>Esta guía te enseñará:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Cómo navegar por la interfaz de usuario</li>
              <li>Gestionar rutas y carpetas</li>
              <li>Personalizar la visualización</li>
              <li>Consejos para uso eficiente</li>
            </ul>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button
              onClick={() =>
                router.push("/admin/drive/routes/docs/frontend/users")
              }
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
            <CardDescription>Para desarrolladores frontend</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p>Referencias técnicas sobre:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Arquitectura de componentes React</li>
              <li>Manejo de estado con contextos</li>
              <li>Navegación y ruteo</li>
              <li>Extender la interfaz</li>
            </ul>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button
              onClick={() =>
                router.push("/admin/drive/routes/docs/frontend/devs")
              }
            >
              Ver Documentación Técnica
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
