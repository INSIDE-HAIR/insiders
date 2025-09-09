"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Cog, Settings } from "lucide-react";

export default function ServicesPage() {
  return (
    <div>
      <DocHeader
        title='Servicios Principales'
        description='Servicios core del sistema backend'
        icon={Cog}
      />

      <DocContent>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-6'>DriveSyncService</h3>
          <div className='border border-primary/20 rounded-lg p-6 bg-primary/5'>
            <p className='mb-4 text-slate-300'>
              Servicio principal para la sincronización con Google Drive API
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-3 text-primary'>Métodos principales:</h4>
                <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                  <li><code>syncRoute(routeId)</code></li>
                  <li><code>fetchFolderHierarchy(folderId)</code></li>
                  <li><code>processFiles(files[])</code></li>
                  <li><code>updateMetadata(fileId, data)</code></li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-3 text-primary'>Responsabilidades:</h4>
                <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                  <li>Autenticación OAuth con Google</li>
                  <li>Fetch de jerarquías completas</li>
                  <li>Procesamiento incremental</li>
                  <li>Manejo de rate limits</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-6'>FileAnalyzerService</h3>
          <div className='border border-primary/20 rounded-lg p-6 bg-primary/5'>
            <p className='mb-4 text-slate-300'>
              Análisis inteligente de archivos y extracción de metadatos
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-3 text-primary'>Capacidades:</h4>
                <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                  <li>Detección de tipos de componente</li>
                  <li>Parsing de campos description</li>
                  <li>Extracción de URLs y metadatos</li>
                  <li>Validación de contenido</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-3 text-primary'>Tipos soportados:</h4>
                <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                  <li>Buttons con URLs</li>
                  <li>Videos de Vimeo</li>
                  <li>Google Slides y Forms</li>
                  <li>Archivos con texto copiable</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-6'>HierarchyService</h3>
          <div className='border border-primary/20 rounded-lg p-6 bg-primary/5'>
            <p className='mb-4 text-slate-300'>
              Procesamiento y estructuración de jerarquías de archivos
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-3 text-primary'>Funcionalidades:</h4>
                <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                  <li>Construcción de árboles jerárquicos</li>
                  <li>Ordenamiento por prefijos numéricos</li>
                  <li>Filtrado de elementos inactivos</li>
                  <li>Optimización de estructura JSON</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-3 text-primary'>Algoritmos:</h4>
                <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                  <li>Tree traversal recursivo</li>
                  <li>Sorting por convenciones</li>
                  <li>Lazy loading de nodos</li>
                  <li>Compresión de metadatos</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-6'>AuthenticationService</h3>
          <div className='border border-primary/20 rounded-lg p-6 bg-primary/5'>
            <p className='mb-4 text-slate-300'>
              Gestión de autenticación y autorización
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-3 text-primary'>Providers soportados:</h4>
                <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                  <li>Google OAuth 2.0</li>
                  <li>GitHub OAuth</li>
                  <li>Credentials (email/password)</li>
                  <li>Resend (magic links)</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-3 text-primary'>Funciones:</h4>
                <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                  <li>JWT token management</li>
                  <li>Session persistence</li>
                  <li>Role-based access control</li>
                  <li>API key validation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-6'>Interacción entre Servicios</h3>
          <div className='bg-slate-900 border border-slate-600 rounded-lg p-6'>
            <pre className='text-sm font-mono overflow-x-auto'>
              <code className='text-green-400'>Flujo típico de sincronización:</code><br/><br/>
              <code className='text-yellow-300'>1.</code> <code className='text-purple-400'>AuthenticationService</code> <code className='text-slate-400'>→</code> <code className='text-slate-300'>Valida usuario y permisos</code><br/>
              <code className='text-yellow-300'>2.</code> <code className='text-purple-400'>DriveSyncService</code> <code className='text-slate-400'>→</code> <code className='text-slate-300'>Inicia sincronización con Drive API</code><br/>
              <code className='text-yellow-300'>3.</code> <code className='text-purple-400'>FileAnalyzerService</code> <code className='text-slate-400'>→</code> <code className='text-slate-300'>Procesa cada archivo encontrado</code><br/>
              <code className='text-yellow-300'>4.</code> <code className='text-purple-400'>HierarchyService</code> <code className='text-slate-400'>→</code> <code className='text-slate-300'>Construye estructura final</code><br/>
              <code className='text-yellow-300'>5.</code> <code className='text-purple-400'>DriveSyncService</code> <code className='text-slate-400'>→</code> <code className='text-slate-300'>Almacena resultado en BD</code>
            </pre>
          </div>
        </section>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Settings className='h-4 w-4' />
            <strong>Modularidad:</strong> Los servicios están diseñados para ser independientes y reutilizables, facilitando el testing y mantenimiento.
          </p>
        </div>
      </DocContent>
    </div>
  );
}