"use client";

import { useRouter } from "next/navigation";
import {
  Database,
  Code,
  GitBranch,
  FileText,
  RefreshCw,
  Server,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

// Componentes de documentación importados pero ahora mostrados directamente
const ModeloSection = () => (
  <Card className='mb-8'>
    <CardHeader>
      <CardTitle id='modelo'>Modelo de datos</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <section>
        <h3 className='text-xl font-bold mb-2'>DriveRoute</h3>
        <p className='mb-2'>
          El modelo principal para almacenar rutas y su configuración:
        </p>
        <pre className='bg-slate-100 p-4 rounded overflow-x-auto'>
          {`model DriveRoute {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  slug             String   @unique 
  folderIds        String[] 
  title            String?  
  subtitle         String?  
  description      String?  
  hierarchyData    Json     
  lastUpdated      DateTime @default(now()) 
  lastSyncAttempt  DateTime? 
  nextSyncDue      DateTime 
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  isActive         Boolean  @default(true)
  createdById      String?
  viewCount        Int      @default(0)
  customSettings   Json?    
}`}
        </pre>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-2'>DriveRouteLog</h3>
        <p className='mb-2'>Modelo para registrar operaciones sobre rutas:</p>
        <pre className='bg-slate-100 p-4 rounded overflow-x-auto'>
          {`model DriveRouteLog {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  routeId        String   @db.ObjectId
  operation      String   
  timestamp      DateTime @default(now())
  success        Boolean
  errorMessage   String?
  hierarchySize  Int?     
  processingTime Int?     
  
  @@index([routeId])
}`}
        </pre>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-2'>Campos principales</h3>
        <ul className='list-disc pl-6 space-y-1'>
          <li>
            <strong>slug</strong>: Identificador único en URL
          </li>
          <li>
            <strong>folderIds</strong>: Array de IDs de carpetas de Google Drive
          </li>
          <li>
            <strong>hierarchyData</strong>: JSON con la estructura jerárquica de
            Drive
          </li>
          <li>
            <strong>lastUpdated</strong>: Última vez que se actualizó el
            contenido
          </li>
          <li>
            <strong>nextSyncDue</strong>: Cuándo debe realizarse la próxima
            sincronización
          </li>
          <li>
            <strong>customSettings</strong>: Configuraciones adicionales
            (extensible)
          </li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

const ApiSection = () => (
  <Card className='mb-8'>
    <CardHeader>
      <CardTitle id='api'>API</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <section>
        <h3 className='text-xl font-bold mb-2'>Endpoints</h3>
        <p className='mb-4'>
          A continuación, se detallan los endpoints disponibles para interactuar
          con las rutas de Drive:
        </p>

        <h4 className='text-lg font-semibold'>Operaciones CRUD</h4>
        <ul className='list-disc pl-6 space-y-1 mb-4'>
          <li>
            <strong>GET /api/drive/management</strong> - Listar todas las rutas
          </li>
          <li>
            <strong>POST /api/drive/management</strong> - Crear una nueva ruta
          </li>
          <li>
            <strong>GET /api/drive/management/:id</strong> - Obtener una ruta
            específica
          </li>
          <li>
            <strong>PUT /api/drive/management/:id</strong> - Actualizar una ruta
          </li>
          <li>
            <strong>DELETE /api/drive/management/:id</strong> - Eliminar una
            ruta
          </li>
        </ul>

        <h4 className='text-lg font-semibold'>Sincronización</h4>
        <ul className='list-disc pl-6 space-y-1 mb-4'>
          <li>
            <strong>POST /api/drive/management/:id/fetch</strong> - Sincronizar
            una ruta con Drive
          </li>
          <li>
            <strong>POST /api/cron/sync-drive</strong> - Endpoint para tarea
            CRON (automática)
          </li>
        </ul>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-2'>Ejemplos de uso</h3>
        <h4 className='text-lg font-semibold'>Creación de una ruta</h4>
        <pre className='bg-slate-100 p-4 rounded overflow-x-auto'>
          {`// POST /api/drive/management
{
  "slug": "mi-ruta",
  "folderIds": ["1ABCd123XYZ_exampleFolderId"],
  "title": "Mi Ruta de Drive",
  "subtitle": "Contenido compartido", 
  "description": "Descripción de la ruta"
}`}
        </pre>
      </section>
    </CardContent>
  </Card>
);

const FlujoSection = () => (
  <Card className='mb-8'>
    <CardHeader>
      <CardTitle id='flujo'>Flujo de datos</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <section>
        <h3 className='text-xl font-bold mb-2'>Proceso de sincronización</h3>
        <p className='mb-4'>
          El flujo de datos entre Google Drive y la aplicación sigue estos
          pasos:
        </p>
        <ol className='list-decimal pl-6 space-y-2'>
          <li>
            <strong>Inicio de sincronización</strong>: Puede ser manual (botón
            en UI) o automática (cron job cada 24h)
          </li>
          <li>
            <strong>Obtención de datos</strong>: Se consulta la API de Google
            Drive para obtener la estructura de carpetas
          </li>
          <li>
            <strong>Procesamiento</strong>: Se analiza la estructura y se genera
            un JSON jerárquico
          </li>
          <li>
            <strong>Almacenamiento</strong>: Se guarda el JSON en el campo
            hierarchyData de la ruta
          </li>
          <li>
            <strong>Registro</strong>: Se crea un log de la operación en
            DriveRouteLog
          </li>
        </ol>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-2'>Estructura de datos</h3>
        <p className='mb-4'>
          El JSON almacenado en hierarchyData tiene esta estructura:
        </p>
        <pre className='bg-slate-100 p-4 rounded overflow-x-auto'>
          {`{
  "id": "folder_id",
  "name": "Nombre de la carpeta",
  "type": "folder",
  "children": [
    {
      "id": "file_id",
      "name": "Nombre del archivo",
      "type": "file",
      "mimeType": "application/pdf",
      "webViewLink": "https://drive.google.com/...",
      "thumbnailLink": "https://drive.google.com/..."
    },
    {
      "id": "subfolder_id",
      "name": "Subcarpeta",
      "type": "folder",
      "children": [...]
    }
  ]
}`}
        </pre>
      </section>
    </CardContent>
  </Card>
);

const ExtensionSection = () => (
  <Card className='mb-8'>
    <CardHeader>
      <CardTitle id='extension'>Extensión</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <section>
        <h3 className='text-xl font-bold mb-2'>Personalización</h3>
        <p className='mb-4'>
          El sistema está diseñado para ser extensible. Puedes personalizar el
          comportamiento mediante:
        </p>
        <ul className='list-disc pl-6 space-y-2'>
          <li>
            <strong>customSettings</strong>: Campo JSON para configuraciones
            específicas de cada ruta
          </li>
          <li>
            <strong>Servicios modulares</strong>: DriveSyncService, FileAnalyzer
            y HierarchyService pueden ser extendidos
          </li>
          <li>
            <strong>Componentes de UI</strong>: Los componentes de visualización
            pueden ser personalizados por ruta
          </li>
        </ul>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-2'>Ejemplo de extensión</h3>
        <p className='mb-4'>
          Para añadir un nuevo tipo de archivo o comportamiento personalizado:
        </p>
        <pre className='bg-slate-100 p-4 rounded overflow-x-auto'>
          {`// 1. Extender el FileAnalyzer
class CustomFileAnalyzer extends FileAnalyzer {
  analyzeFile(file) {
    // Lógica personalizada
    return {
      ...super.analyzeFile(file),
      customProperty: "valor"
    };
  }
}

// 2. Usar en la sincronización
const analyzer = new CustomFileAnalyzer();
const hierarchy = await hierarchyService.buildHierarchy(folderId, { analyzer });`}
        </pre>
      </section>
    </CardContent>
  </Card>
);

const SincronizacionSection = () => (
  <Card className='mb-8'>
    <CardHeader>
      <CardTitle id='sincronizacion'>Sincronización</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <section>
        <h3 className='text-xl font-bold mb-2'>Mecanismos</h3>
        <p className='mb-4'>
          La sincronización puede realizarse de dos formas:
        </p>
        <ul className='list-disc pl-6 space-y-2'>
          <li>
            <strong>Manual</strong>: A través del botón &quot;Sincronizar&quot;
            en la interfaz de administración
          </li>
          <li>
            <strong>Automática</strong>: Mediante un cron job que se ejecuta
            cada 24 horas
          </li>
        </ul>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-2'>Implementación del cron</h3>
        <p className='mb-4'>
          El cron job está implementado en el endpoint /api/cron/sync-drive:
        </p>
        <pre className='bg-slate-100 p-4 rounded overflow-x-auto'>
          {`// Ejemplo de implementación
export async function GET() {
  const syncService = new DriveSyncService();
  
  // Obtener rutas que necesitan sincronización
  const routes = await prisma.driveRoute.findMany({
    where: {
      nextSyncDue: {
        lte: new Date()
      },
      isActive: true
    }
  });
  
  // Sincronizar cada ruta
  for (const route of routes) {
    await syncService.syncRoute(route.id);
  }
  
  return NextResponse.json({ success: true, synced: routes.length });
}`}
        </pre>
      </section>

      <section>
        <h3 className='text-xl font-bold mb-2'>Logs y monitoreo</h3>
        <p className='mb-4'>
          Cada operación de sincronización genera un registro en DriveRouteLog:
        </p>
        <ul className='list-disc pl-6 space-y-1'>
          <li>
            <strong>operation</strong>: Tipo de operación (&quot;create&quot;,
            &quot;update&quot;, &quot;refresh&quot;)
          </li>
          <li>
            <strong>success</strong>: Indica si la operación fue exitosa
          </li>
          <li>
            <strong>errorMessage</strong>: Mensaje de error si la operación
            falló
          </li>
          <li>
            <strong>hierarchySize</strong>: Tamaño del JSON en bytes
          </li>
          <li>
            <strong>processingTime</strong>: Tiempo de procesamiento en ms
          </li>
        </ul>
      </section>
    </CardContent>
  </Card>
);

// Componente principal
export default function DevDocsPage() {
  return (
    <div className='container py-10'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>
          Documentación Técnica para Desarrolladores
        </h1>
        <p className='text-muted-foreground mt-2'>
          Referencia técnica completa sobre el sistema de rutas de Drive
        </p>
      </div>

      <div>
        <ModeloSection />
        <ApiSection />
        <FlujoSection />
        <ExtensionSection />
        <SincronizacionSection />
      </div>
    </div>
  );
}
