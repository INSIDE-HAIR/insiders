"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Layers, Building, ArrowDown, Globe, Server, Database, Zap, Shield, Settings } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div>
      <DocHeader
        title='Arquitectura Backend'
        description='Diseño en capas y patrones arquitectónicos'
        icon={Layers}
      />

      <DocContent>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-6 text-white'>Diagrama de Arquitectura</h3>
          <div className='bg-slate-900 border border-slate-600 rounded-lg p-8 overflow-hidden'>
            <div className='flex flex-col items-center space-y-8 max-w-5xl mx-auto'>
              
              {/* API Routes Layer */}
              <div className='w-full max-w-3xl'>
                <div className='bg-primary/30 rounded-xl p-8 text-white border border-primary/60'>
                  <div className='flex items-center gap-4 mb-5'>
                    <Globe className='h-8 w-8 text-primary' />
                    <h4 className='text-2xl font-bold text-white'>API Routes (Next.js)</h4>
                  </div>
                  <div className='text-base text-slate-200 mb-4'>
                    Capa de entrada HTTP que maneja las peticiones del cliente
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-primary/50 rounded-lg px-4 py-3 text-sm font-mono text-white text-center font-medium'>/api/drive/*</div>
                    <div className='bg-primary/50 rounded-lg px-4 py-3 text-sm font-mono text-white text-center font-medium'>/api/cron/*</div>
                  </div>
                </div>
              </div>
              
              {/* Arrow Down */}
              <div className='flex justify-center'>
                <ArrowDown className='h-8 w-8 text-slate-400' />
              </div>
              
              {/* Controllers Layer */}
              <div className='w-full max-w-3xl'>
                <div className='bg-primary/30 rounded-xl p-8 text-white border border-primary/60'>
                  <div className='flex items-center gap-4 mb-5'>
                    <Shield className='h-8 w-8 text-primary' />
                    <h4 className='text-2xl font-bold text-white'>Controllers/Handlers</h4>
                  </div>
                  <div className='text-base text-slate-200'>
                    Validación de peticiones • Verificación de autenticación • Manejo de errores
                  </div>
                </div>
              </div>
              
              {/* Arrow Down */}
              <div className='flex justify-center'>
                <ArrowDown className='h-8 w-8 text-slate-400' />
              </div>
              
              {/* Services Layer */}
              <div className='w-full max-w-4xl'>
                <div className='bg-primary/30 rounded-xl p-8 text-white border border-primary/60'>
                  <div className='flex items-center gap-4 mb-6'>
                    <Zap className='h-8 w-8 text-primary' />
                    <h4 className='text-2xl font-bold text-white'>Services Layer</h4>
                  </div>
                  <div className='text-base text-slate-200 mb-6'>
                    Lógica de negocio centralizada y servicios reutilizables
                  </div>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='bg-primary/50 rounded-lg p-4 text-center'>
                      <Settings className='h-6 w-6 mx-auto mb-3 text-primary' />
                      <div className='text-sm font-semibold text-white leading-tight'>DriveSync<br/>Service</div>
                    </div>
                    <div className='bg-primary/50 rounded-lg p-4 text-center'>
                      <Settings className='h-6 w-6 mx-auto mb-3 text-primary' />
                      <div className='text-sm font-semibold text-white leading-tight'>FileAnalyzer<br/>Service</div>
                    </div>
                    <div className='bg-primary/50 rounded-lg p-4 text-center'>
                      <Settings className='h-6 w-6 mx-auto mb-3 text-primary' />
                      <div className='text-sm font-semibold text-white leading-tight'>Hierarchy<br/>Service</div>
                    </div>
                    <div className='bg-primary/50 rounded-lg p-4 text-center'>
                      <Settings className='h-6 w-6 mx-auto mb-3 text-primary' />
                      <div className='text-sm font-semibold text-white leading-tight'>Authentication<br/>Service</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Arrow Down */}
              <div className='flex justify-center'>
                <ArrowDown className='h-8 w-8 text-slate-400' />
              </div>
              
              {/* Data Layer */}
              <div className='w-full max-w-3xl'>
                <div className='bg-primary/30 rounded-xl p-8 text-white border border-primary/60'>
                  <div className='flex items-center gap-4 mb-5'>
                    <Server className='h-8 w-8 text-primary' />
                    <h4 className='text-2xl font-bold text-white'>Data Layer (Prisma)</h4>
                  </div>
                  <div className='text-base text-slate-200'>
                    Acceso a datos con ORM • Modelos • Queries • Mutations • Transactions
                  </div>
                </div>
              </div>
              
              {/* Arrow Down */}
              <div className='flex justify-center'>
                <ArrowDown className='h-8 w-8 text-slate-400' />
              </div>
              
              {/* Database Layer */}
              <div className='w-full max-w-3xl'>
                <div className='bg-primary/30 rounded-xl p-8 text-white border border-primary/60'>
                  <div className='flex items-center gap-4 mb-6'>
                    <Database className='h-8 w-8 text-primary' />
                    <h4 className='text-2xl font-bold text-white'>MongoDB Database</h4>
                  </div>
                  <div className='text-base text-slate-200 mb-5'>
                    Base de datos NoSQL con esquemas flexibles para almacenamiento jerárquico
                  </div>
                  <div className='grid grid-cols-3 gap-4'>
                    <div className='bg-primary/50 rounded-lg px-4 py-3 text-sm text-center text-white font-semibold'>DriveRoute</div>
                    <div className='bg-primary/50 rounded-lg px-4 py-3 text-sm text-center text-white font-semibold'>Users</div>
                    <div className='bg-primary/50 rounded-lg px-4 py-3 text-sm text-center text-white font-semibold'>Logs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Capas del Sistema</h3>
          <div className='space-y-6'>
            <div className='border border-primary/20 rounded-lg p-6 bg-primary/5'>
              <h4 className='text-lg font-semibold mb-3 text-primary'>API Routes</h4>
              <p className='mb-3 text-slate-300'>Capa de entrada HTTP que maneja las peticiones</p>
              <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                <li>Validación de entrada con Zod schemas</li>
                <li>Manejo de autenticación y autorización</li>
                <li>Serialización de respuestas</li>
                <li>Manejo de errores HTTP</li>
              </ul>
            </div>

            <div className='border border-primary/20 rounded-lg p-6 bg-primary/5'>
              <h4 className='text-lg font-semibold mb-3 text-primary'>Services Layer</h4>
              <p className='mb-3 text-slate-300'>Lógica de negocio centralizada y reutilizable</p>
              <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                <li><strong>DriveSyncService:</strong> Sincronización con Google Drive</li>
                <li><strong>FileAnalyzerService:</strong> Análisis de metadatos</li>
                <li><strong>HierarchyService:</strong> Procesamiento de jerarquías</li>
                <li><strong>AuthenticationService:</strong> Gestión de tokens</li>
              </ul>
            </div>

            <div className='border border-primary/20 rounded-lg p-6 bg-primary/5'>
              <h4 className='text-lg font-semibold mb-3 text-primary'>Data Layer</h4>
              <p className='mb-3 text-slate-300'>Acceso a datos con Prisma ORM</p>
              <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                <li>Modelos tipados con TypeScript</li>
                <li>Queries optimizadas con índices</li>
                <li>Transacciones para operaciones complejas</li>
                <li>Connection pooling automático</li>
              </ul>
            </div>

            <div className='border border-primary/20 rounded-lg p-6 bg-primary/5'>
              <h4 className='text-lg font-semibold mb-3 text-primary'>Database</h4>
              <p className='mb-3 text-slate-300'>MongoDB como almacén de datos</p>
              <ul className='list-disc pl-6 space-y-1 text-sm text-slate-300'>
                <li>Esquemas flexibles para JSON jerárquico</li>
                <li>Índices compuestos para consultas complejas</li>
                <li>Replicación y sharding nativos</li>
                <li>Aggregation pipeline para análisis</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Patrones Arquitectónicos</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-lg font-semibold mb-3'>Repository Pattern</h4>
              <p className='text-slate-300 text-sm mb-3'>
                Abstracción de la lógica de acceso a datos
              </p>
              <div className='bg-slate-800 p-3 rounded text-xs font-mono text-green-400 border border-slate-600'>
                <code>DriveRouteRepository</code><br/>
                <code>UserRepository</code><br/>
                <code>LogRepository</code>
              </div>
            </div>
            <div>
              <h4 className='text-lg font-semibold mb-3'>Service Pattern</h4>
              <p className='text-slate-300 text-sm mb-3'>
                Encapsulación de lógica de negocio
              </p>
              <div className='bg-slate-800 p-3 rounded text-xs font-mono text-green-400 border border-slate-600'>
                <code>DriveSyncService</code><br/>
                <code>FileAnalyzerService</code><br/>
                <code>HierarchyService</code>
              </div>
            </div>
          </div>
        </section>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Building className='h-4 w-4' />
            <strong>Arquitectura:</strong> Esta estructura en capas facilita el mantenimiento, testing y escalabilidad del sistema.
          </p>
        </div>
      </DocContent>
    </div>
  );
}