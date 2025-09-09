import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Puzzle, PlusCircle, Lightbulb } from "lucide-react";

export default function ExtensionsPage() {
  return (
    <div>
      <DocHeader
        title='Extensiones'
        description='Cómo extender el sistema con nuevas funcionalidades'
        icon={PlusCircle}
      />

      <DocContent>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>
            Añadir nuevos tipos de archivo
          </h3>
          <p className='mb-4'>
            Para añadir soporte para un nuevo tipo de archivo, sigue estos
            pasos:
          </p>

          <div className='space-y-6'>
            <div className='border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-lg'>
              <h4 className='text-lg font-semibold mb-2 text-primary'>
                1. Actualizar FileAnalyzer
              </h4>
              <p className='mb-2'>
                Añade la lógica de detección en{" "}
                <code>lib/services/file-analyzer.ts</code>:
              </p>
              <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-4'>
                {`// En FileAnalyzer.ts
export class FileAnalyzer {
  static analyzeFile(file: DriveFile): HierarchyItem {
    // ... código existente ...
    
    // Añadir nuevo tipo
    if (file.mimeType === 'application/custom-type') {
      return {
        ...baseItem,
        type: 'custom-type',
        customProperties: this.parseCustomType(file)
      };
    }
    
    // ... resto del código ...
  }
  
  private static parseCustomType(file: DriveFile) {
    // Lógica específica para el nuevo tipo
    return {
      customProperty: 'value'
    };
  }
}`}
              </pre>
            </div>

            <div className='border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-lg'>
              <h4 className='text-lg font-semibold mb-2 text-primary'>
                2. Actualizar tipos TypeScript
              </h4>
              <p className='mb-2'>
                Extiende las interfaces en <code>types/drive.d.ts</code>:
              </p>
              <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-4'>
                {`// En types/drive.d.ts
export interface HierarchyItem {
  // ... propiedades existentes ...
  
  // Añadir nuevas propiedades
  customProperties?: CustomTypeProperties;
}

export interface CustomTypeProperties {
  customProperty: string;
  additionalData?: any;
}`}
              </pre>
            </div>

            <div className='border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-lg'>
              <h4 className='text-lg font-semibold mb-2 text-primary'>
                3. Crear procesador específico
              </h4>
              <p className='mb-2'>
                Crea un procesador específico en <code>lib/processors/</code>:
              </p>
              <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-4'>
                {`// lib/processors/custom-type-processor.ts
export class CustomTypeProcessor {
  static process(item: HierarchyItem): ProcessedItem {
    // Lógica específica de procesamiento
    return {
      ...item,
      processedData: this.transformData(item.customProperties)
    };
  }
  
  private static transformData(properties: CustomTypeProperties) {
    // Transformación específica
    return {
      transformed: true,
      data: properties
    };
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Añadir nuevos endpoints</h3>
          <p className='mb-4'>
            Para crear nuevos endpoints API, sigue esta estructura:
          </p>

          <div className='space-y-6'>
            <div className='border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-lg'>
              <h4 className='text-lg font-semibold mb-2 text-primary'>
                1. Crear el archivo de ruta
              </h4>
              <p className='mb-2'>
                En <code>app/api/drive/custom-endpoint/route.ts</code>:
              </p>
              <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-4'>
                {`// app/api/drive/custom-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth } from '@/src/middleware/withApiKeyAuth';

async function handler(request: NextRequest) {
  try {
    if (request.method === 'GET') {
      // Lógica para GET
      const data = await getCustomData();
      return NextResponse.json({ success: true, data });
    }
    
    if (request.method === 'POST') {
      // Lógica para POST
      const body = await request.json();
      const result = await createCustomResource(body);
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }
    
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withApiKeyAuth(handler);
export const POST = withApiKeyAuth(handler);`}
              </pre>
            </div>

            <div className='border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-lg'>
              <h4 className='text-lg font-semibold mb-2 text-primary'>
                2. Crear el servicio
              </h4>
              <p className='mb-2'>
                En <code>lib/services/custom-service.ts</code>:
              </p>
              <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-4'>
                {`// lib/services/custom-service.ts
import { prisma } from '@/src/lib/prisma';

export class CustomService {
  static async getCustomData() {
    try {
      const data = await prisma.driveRoute.findMany({
        where: { customField: 'value' }
      });
      return data;
    } catch (error) {
      throw new Error('Error fetching custom data');
    }
  }
  
  static async createCustomResource(data: any) {
    try {
      const result = await prisma.driveRoute.create({
        data: {
          ...data,
          customField: 'processed'
        }
      });
      return result;
    } catch (error) {
      throw new Error('Error creating custom resource');
    }
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Middleware personalizado</h3>
          <p className='mb-4'>Para añadir middleware personalizado:</p>

          <div className='border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-lg'>
            <h4 className='text-lg font-semibold mb-2 text-primary'>Crear middleware</h4>
            <p className='mb-2'>
              En <code>middleware/custom-middleware.ts</code>:
            </p>
            <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-4'>
              {`// middleware/custom-middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function withCustomMiddleware(handler: Function) {
  return async (request: NextRequest) => {
    try {
      // Lógica del middleware
      const customHeader = request.headers.get('x-custom-header');
      
      if (!customHeader) {
        return NextResponse.json(
          { error: 'Custom header required' },
          { status: 400 }
        );
      }
      
      // Añadir datos al request
      (request as any).customData = {
        header: customHeader,
        timestamp: new Date()
      };
      
      return await handler(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Middleware error' },
        { status: 500 }
      );
    }
  };
}`}
            </pre>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>
            Extender el modelo de datos
          </h3>
          <p className='mb-4'>Para añadir nuevos campos al modelo:</p>

          <div className='space-y-4'>
            <div className='border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-lg'>
              <h4 className='text-lg font-semibold mb-2 text-primary'>
                1. Actualizar schema de Prisma
              </h4>
              <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-4'>
                {`// En prisma/schema/services.prisma
model DriveRoute {
  // ... campos existentes ...
  
  // Nuevos campos
  customField     String?
  additionalData  Json?
  newFeature      Boolean  @default(false)
  
  // Índices para nuevos campos
  @@index([customField])
}`}
              </pre>
            </div>

            <div className='border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-lg'>
              <h4 className='text-lg font-semibold mb-2 text-primary'>
                2. Ejecutar migración
              </h4>
              <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-4'>
                {`# Generar y aplicar migración
npx prisma generate
npx prisma db push`}
              </pre>
            </div>

            <div className='border-l-4 border-primary pl-4 bg-primary/5 p-4 rounded-r-lg'>
              <h4 className='text-lg font-semibold mb-2 text-primary'>
                3. Actualizar tipos TypeScript
              </h4>
              <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-4'>
                {`// Los tipos se generan automáticamente con Prisma
// Pero puedes extender con tipos personalizados
export interface ExtendedDriveRoute extends DriveRoute {
  computedField?: string;
  virtualProperty?: any;
}`}
              </pre>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Mejores prácticas</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-lg font-semibold mb-3 text-green-700'>
                ✅ Hacer
              </h4>
              <ul className='list-disc pl-6 space-y-2 text-sm'>
                <li>Mantener compatibilidad hacia atrás</li>
                <li>Añadir tests para nuevas funcionalidades</li>
                <li>Documentar cambios en la API</li>
                <li>Usar TypeScript para type safety</li>
                <li>Implementar manejo de errores robusto</li>
                <li>Añadir logging para debugging</li>
              </ul>
            </div>

            <div>
              <h4 className='text-lg font-semibold mb-3 text-red-700'>
                ❌ Evitar
              </h4>
              <ul className='list-disc pl-6 space-y-2 text-sm'>
                <li>Modificar directamente archivos core</li>
                <li>Romper la API existente</li>
                <li>Añadir dependencias innecesarias</li>
                <li>Ignorar el manejo de errores</li>
                <li>Crear endpoints sin autenticación</li>
                <li>Hardcodear valores de configuración</li>
              </ul>
            </div>
          </div>
        </section>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Antes de
            implementar una extensión, revisa el código existente para entender
            los patrones y convenciones utilizadas. Esto garantizará
            consistencia y facilitará el mantenimiento.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
