"use client";

import { useRouter } from "next/navigation";
import { Users, Code, Layout } from "lucide-react";
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

export default function FrontendDocsPage() {
  const router = useRouter();

  return (
    <div>
      <DocHeader
        title='Documentación Frontend'
        description='Todo lo que necesitas saber sobre la interfaz de usuario de Rutas de Drive'
        icon={Layout}
      />
      
      <DocContent>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader className='bg-primary/5 border-b border-primary/20'>
            <CardTitle className='flex items-center text-primary'>
              <Users className='mr-2 h-5 w-5' /> Guía para Usuarios
            </CardTitle>
            <CardDescription className='text-slate-300'>
              Aprende a usar la interfaz de Rutas de Drive
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p className='text-white'>Esta guía te enseñará:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1 text-white'>
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
          <CardHeader className='bg-primary/5 border-b border-primary/20'>
            <CardTitle className='flex items-center text-primary'>
              <Code className='mr-2 h-5 w-5' /> Documentación Técnica
            </CardTitle>
            <CardDescription className='text-slate-300'>Para desarrolladores frontend</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <p className='text-white'>Referencias técnicas sobre:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1 text-white'>
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
      </DocContent>
    </div>
  );
}
