import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { RefreshCw, GitBranch, Lightbulb } from "lucide-react";

export default function SynchronizationPage() {
  return (
    <div>
      <DocHeader
        title='Sincronización'
        description='Sistema de sincronización automática con Google Drive'
        icon={GitBranch}
      />

      <DocContent>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Tipos de sincronización</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div className='border border-indigo-500/20 rounded-lg p-6 bg-indigo-500/5'>
              <h4 className='text-lg font-semibold mb-3 text-primary'>
Sincronización Automática
              </h4>
              <ul className='list-disc pl-6 space-y-2 text-sm text-slate-300'>
                <li>Ejecutada por cron job cada 24 horas</li>
                <li>Procesa todas las rutas activas</li>
                <li>Respeta límites de rate limiting</li>
                <li>Maneja errores automáticamente</li>
              </ul>
            </div>

            <div className='border border-emerald-500/20 rounded-lg p-6 bg-emerald-500/5'>
              <h4 className='text-lg font-semibold mb-3 text-primary'>
Sincronización Manual
              </h4>
              <ul className='list-disc pl-6 space-y-2 text-sm text-slate-300'>
                <li>Iniciada por usuario desde la UI</li>
                <li>Procesa una ruta específica</li>
                <li>Respuesta inmediata</li>
                <li>Útil para desarrollo y testing</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Configuración del Cron Job</h3>
          <p className='mb-4'>
            El sistema utiliza Vercel Cron Jobs para la sincronización
            automática:
          </p>

          <div className='border-l-4 border-primary pl-4 mb-6 bg-primary/5 p-4 rounded-r-lg'>
            <h4 className='text-lg font-semibold mb-2 text-primary'>vercel.json</h4>
            <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600'>
              {`{
  "crons": [
    {
      "path": "/api/cron/sync-drive",
      "schedule": "0 2 * * *"
    }
  ]
}`}
            </pre>
            <p className='text-sm text-slate-400 mt-2'>
              Ejecuta todos los días a las 2:00 AM UTC
            </p>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>
            Implementación del endpoint de sincronización
          </h3>
          <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-6'>
            {`// app/api/cron/sync-drive/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DriveSyncService } from '@/src/lib/services/drive-sync-service';

export async function GET(request: NextRequest) {
  try {
    // Verificar que la petición viene de Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener todas las rutas activas que necesitan sincronización
    const routesToSync = await DriveSyncService.getRoutesNeedingSync();
    
    const results = [];
    for (const route of routesToSync) {
      try {
        const result = await DriveSyncService.syncRoute(route.id);
        results.push({ routeId: route.id, success: true, result });
      } catch (error) {
        results.push({ 
          routeId: route.id, 
          success: false, 
          error: error.message 
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: \`Processed \${routesToSync.length} routes\`,
      results
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    );
  }
}`}
          </pre>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Servicio de sincronización</h3>
          <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-6'>
            {`// lib/services/drive-sync-service.ts
import { google } from 'googleapis';
import { prisma } from '@/src/lib/prisma';

export class DriveSyncService {
  static async getRoutesNeedingSync() {
    return await prisma.driveRoute.findMany({
      where: {
        isActive: true,
        nextSyncDue: {
          lte: new Date()
        }
      }
    });
  }

  static async syncRoute(routeId: string) {
    const startTime = Date.now();
    
    try {
      // 1. Obtener la ruta
      const route = await prisma.driveRoute.findUnique({
        where: { id: routeId }
      });

      if (!route) {
        throw new Error('Route not found');
      }

      // 2. Obtener datos de Google Drive
      const driveData = await this.fetchDriveData(route.folderIds);
      
      // 3. Procesar y construir jerarquía
      const hierarchyData = await this.buildHierarchy(driveData);
      
      // 4. Actualizar en base de datos
      await prisma.driveRoute.update({
        where: { id: routeId },
        data: {
          hierarchyData,
          lastUpdated: new Date(),
          lastSyncAttempt: new Date(),
          nextSyncDue: this.calculateNextSyncDue()
        }
      });

      // 5. Registrar log exitoso
      const processingTime = Date.now() - startTime;
      await this.logSyncOperation(routeId, true, null, hierarchyData, processingTime);

      return {
        success: true,
        hierarchySize: JSON.stringify(hierarchyData).length,
        processingTime
      };

    } catch (error) {
      // Registrar log de error
      const processingTime = Date.now() - startTime;
      await this.logSyncOperation(routeId, false, error.message, null, processingTime);
      throw error;
    }
  }

  private static async fetchDriveData(folderIds: string[]) {
    const drive = google.drive({ version: 'v3', auth: this.getAuth() });
    
    const allFiles = [];
    for (const folderId of folderIds) {
      const files = await this.fetchFolderContents(drive, folderId);
      allFiles.push(...files);
    }
    
    return allFiles;
  }

  private static calculateNextSyncDue(): Date {
    const nextSync = new Date();
    nextSync.setHours(nextSync.getHours() + 24);
    return nextSync;
  }

  private static async logSyncOperation(
    routeId: string, 
    success: boolean, 
    errorMessage: string | null,
    hierarchyData: any,
    processingTime: number
  ) {
    await prisma.driveRouteLog.create({
      data: {
        routeId,
        operation: 'sync',
        success,
        errorMessage,
        hierarchySize: hierarchyData ? JSON.stringify(hierarchyData).length : null,
        processingTime
      }
    });
  }
}`}
          </pre>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Manejo de Rate Limiting</h3>
          <p className='mb-4'>
            Google Drive API tiene límites de velocidad que debemos respetar:
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-lg font-semibold mb-3'>
Límites de Google Drive API
              </h4>
              <ul className='list-disc pl-6 space-y-2 text-sm'>
                <li>
                  <strong>1,000</strong> requests por 100 segundos por usuario
                </li>
                <li>
                  <strong>10,000</strong> requests por 100 segundos por proyecto
                </li>
                <li>
                  <strong>100</strong> requests por segundo por usuario
                </li>
              </ul>
            </div>

            <div>
              <h4 className='text-lg font-semibold mb-3'>
Estrategias implementadas
              </h4>
              <ul className='list-disc pl-6 space-y-2 text-sm'>
                <li>Exponential backoff en errores 429</li>
                <li>Batch requests para operaciones múltiples</li>
                <li>Caché de metadatos frecuentes</li>
                <li>Procesamiento en lotes pequeños</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Monitoreo y alertas</h3>
          <p className='mb-4'>
            El sistema incluye monitoreo para detectar problemas:
          </p>

          <div className='space-y-4'>
            <div className='border border-primary/20 rounded-lg p-4 bg-primary/5'>
              <h5 className='font-semibold text-primary mb-2'>
Alertas automáticas
              </h5>
              <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                <li>Fallos consecutivos de sincronización</li>
                <li>Tiempo de procesamiento excesivo</li>
                <li>Errores de autenticación con Google</li>
                <li>Rutas con datos corruptos</li>
              </ul>
            </div>

            <div className='border border-primary/20 rounded-lg p-4 bg-primary/5'>
              <h5 className='font-semibold text-primary mb-2'>
Métricas de rendimiento
              </h5>
              <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                <li>Tiempo promedio de sincronización</li>
                <li>Tasa de éxito de sincronizaciones</li>
                <li>Tamaño promedio de jerarquías</li>
                <li>Uso de API quota</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>
            Configuración de variables de entorno
          </h3>
          <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-6'>
            {`# .env.local
CRON_SECRET=your_cron_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Configuración de sincronización
SYNC_BATCH_SIZE=50
SYNC_DELAY_MS=1000
MAX_RETRIES=3`}
          </pre>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Troubleshooting común</h3>
          <div className='space-y-4'>
            <div className='border-l-4 border-red-500 pl-4 bg-red-500/5 p-4 rounded-r-lg'>
              <h5 className='font-semibold text-red-400 mb-2'>
                Error 401: Token expirado
              </h5>
              <p className='text-sm text-red-300 mb-2'>
                El refresh token de Google ha expirado o es inválido.
              </p>
              <p className='text-sm text-slate-300'>
                <strong>Solución:</strong> Regenerar el refresh token desde
                Google Cloud Console.
              </p>
            </div>

            <div className='border-l-4 border-orange-500 pl-4 bg-orange-500/5 p-4 rounded-r-lg'>
              <h5 className='font-semibold text-orange-400 mb-2'>
                Error 429: Rate limit exceeded
              </h5>
              <p className='text-sm text-orange-300 mb-2'>
                Se han excedido los límites de la API de Google Drive.
              </p>
              <p className='text-sm text-slate-300'>
                <strong>Solución:</strong> El sistema implementa backoff
                automático, pero puedes ajustar SYNC_DELAY_MS para reducir la
                frecuencia.
              </p>
            </div>

            <div className='border-l-4 border-blue-500 pl-4 bg-blue-500/5 p-4 rounded-r-lg'>
              <h5 className='font-semibold text-blue-400 mb-2'>
                Sincronización lenta
              </h5>
              <p className='text-sm text-blue-300 mb-2'>
                El procesamiento toma más tiempo del esperado.
              </p>
              <p className='text-sm text-slate-300'>
                <strong>Solución:</strong> Verificar el tamaño de las carpetas y
                considerar dividir rutas grandes en múltiples rutas más
                pequeñas.
              </p>
            </div>
          </div>
        </section>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Monitorea
            regularmente los logs de sincronización para detectar patrones de
            errores y optimizar el rendimiento del sistema.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
