"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { MermaidDiagram } from "@/src/components/drive/docs/mermaid-diagram";
import { Layers, Building } from "lucide-react";

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
          <h3 className='text-xl font-bold mb-6 text-white'>Diagrama de Arquitectura Backend</h3>
          
          <MermaidDiagram
            chart={`
flowchart TD
    CLIENT[Client Request] --> API[API Routes - Next.js]
    
    API --> CONTROLLERS[Controllers/Handlers]
    CONTROLLERS --> AUTH{Authentication}
    CONTROLLERS --> VALIDATION{Request Validation}
    
    AUTH --> SERVICES[Services Layer]
    VALIDATION --> SERVICES
    
    SERVICES --> DRIVE_SYNC[DriveSyncService]
    SERVICES --> FILE_ANALYZER[FileAnalyzerService] 
    SERVICES --> HIERARCHY[HierarchyService]
    SERVICES --> AUTH_SERVICE[AuthenticationService]
    
    DRIVE_SYNC --> DATA_LAYER[Data Layer - Prisma ORM]
    FILE_ANALYZER --> DATA_LAYER
    HIERARCHY --> DATA_LAYER
    AUTH_SERVICE --> DATA_LAYER
    
    DATA_LAYER --> REPOSITORIES[Repository Pattern]
    REPOSITORIES --> DRIVE_REPO[DriveRouteRepository]
    REPOSITORIES --> USER_REPO[UserRepository]
    REPOSITORIES --> LOG_REPO[LogRepository]
    
    DRIVE_REPO --> MONGODB[(MongoDB Database)]
    USER_REPO --> MONGODB
    LOG_REPO --> MONGODB
    
    MONGODB --> COLLECTIONS{Database Collections}
    COLLECTIONS --> DRIVE_ROUTES[DriveRoute Collection]
    COLLECTIONS --> USERS[Users Collection]
    COLLECTIONS --> LOGS[Logs Collection]
    
    %% External APIs
    DRIVE_SYNC -.->|Google Drive API| GOOGLE_DRIVE[Google Drive]
    AUTH_SERVICE -.->|OAuth 2.0| GOOGLE_AUTH[Google Auth]
    
    %% Response flow
    DATA_LAYER --> RESPONSE[Response Processing]
    RESPONSE --> CLIENT
    
    classDef apiClass fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff
    classDef controllerClass fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    classDef serviceClass fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    classDef dataClass fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    classDef dbClass fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    classDef externalClass fill:#6b7280,stroke:#4b5563,stroke-width:1px,color:#fff
    
    class CLIENT,API apiClass
    class CONTROLLERS,AUTH,VALIDATION controllerClass
    class SERVICES,DRIVE_SYNC,FILE_ANALYZER,HIERARCHY,AUTH_SERVICE serviceClass
    class DATA_LAYER,REPOSITORIES,DRIVE_REPO,USER_REPO,LOG_REPO dataClass
    class MONGODB,COLLECTIONS,DRIVE_ROUTES,USERS,LOGS dbClass
    class GOOGLE_DRIVE,GOOGLE_AUTH externalClass
            `}
            className="mb-8"
          />
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