"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Cpu, Lightbulb } from "lucide-react";

export default function TechnologiesPage() {
  return (
    <div>
      <DocHeader
        title='Tecnologías Principales'
        description='Stack tecnológico del backend'
        icon={Cpu}
      />

      <DocContent>

        <div className='space-y-6'>
          <div className='flex items-center gap-3 p-4 border border-blue-500/20 rounded-lg bg-blue-500/5'>
            <div className='w-3 h-3 bg-blue-500 rounded-full' />
            <div>
              <strong className='text-lg'>Next.js API Routes</strong>
              <p className='text-muted-foreground'>Endpoints REST modernos con TypeScript nativo</p>
            </div>
          </div>

          <div className='flex items-center gap-3 p-4 border border-green-500/20 rounded-lg bg-green-500/5'>
            <div className='w-3 h-3 bg-green-500 rounded-full' />
            <div>
              <strong className='text-lg'>Prisma ORM</strong>
              <p className='text-muted-foreground'>Object-Relational Mapping tipado con generación automática de cliente</p>
            </div>
          </div>

          <div className='flex items-center gap-3 p-4 border border-purple-500/20 rounded-lg bg-purple-500/5'>
            <div className='w-3 h-3 bg-purple-500 rounded-full' />
            <div>
              <strong className='text-lg'>TypeScript</strong>
              <p className='text-muted-foreground'>Desarrollo tipado y seguro con validaciones en tiempo de compilación</p>
            </div>
          </div>

          <div className='flex items-center gap-3 p-4 border border-orange-500/20 rounded-lg bg-orange-500/5'>
            <div className='w-3 h-3 bg-orange-500 rounded-full' />
            <div>
              <strong className='text-lg'>Google Drive API</strong>
              <p className='text-muted-foreground'>Integración nativa con OAuth2 y manejo completo de archivos</p>
            </div>
          </div>

          <div className='flex items-center gap-3 p-4 border border-red-500/20 rounded-lg bg-red-500/5'>
            <div className='w-3 h-3 bg-red-500 rounded-full' />
            <div>
              <strong className='text-lg'>MongoDB</strong>
              <p className='text-muted-foreground'>Base de datos NoSQL con esquemas flexibles para JSON</p>
            </div>
          </div>
        </div>

        <section className='mt-10'>
          <h3 className='text-xl font-bold mb-4'>Ventajas del Stack</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-lg font-semibold mb-3'>Performance</h4>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
                <li>API Routes optimizadas con Edge Runtime</li>
                <li>Prisma con connection pooling</li>
                <li>MongoDB con índices optimizados</li>
              </ul>
            </div>
            <div>
              <h4 className='text-lg font-semibold mb-3'>Developer Experience</h4>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
                <li>TypeScript end-to-end</li>
                <li>Auto-generación de tipos</li>
                <li>Hot reload en desarrollo</li>
              </ul>
            </div>
          </div>
        </section>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Este stack está diseñado para maximizar la productividad del desarrollador mientras mantiene un alto rendimiento en producción.
          </p>
        </div>
      </DocContent>
    </div>
  );
}