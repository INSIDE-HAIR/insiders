"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

// Componentes de documentación
const ModeloSection = () => (
  <Card>
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
  <Card>
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
            <strong>GET /api/admin/drive-routes</strong> - Listar todas las
            rutas
          </li>
          <li>
            <strong>POST /api/admin/drive-routes</strong> - Crear una nueva ruta
          </li>
          <li>
            <strong>GET /api/admin/drive-routes/:id</strong> - Obtener una ruta
            específica
          </li>
          <li>
            <strong>PUT /api/admin/drive-routes/:id</strong> - Actualizar una
            ruta
          </li>
          <li>
            <strong>DELETE /api/admin/drive-routes/:id</strong> - Eliminar una
            ruta
          </li>
        </ul>

        <h4 className='text-lg font-semibold'>Sincronización</h4>
        <ul className='list-disc pl-6 space-y-1 mb-4'>
          <li>
            <strong>POST /api/admin/drive-routes/:id/fetch</strong> -
            Sincronizar una ruta con Drive
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
          {`// POST /api/admin/drive-routes
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
  <Card>
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
  <Card>
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
  <Card>
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

// Categorías para el sidebar
const devCategories = [
  {
    id: "datos",
    title: "Datos y Modelos",
    icon: <Database className='h-4 w-4' />,
    items: [
      {
        id: "modelo",
        title: "Modelo de datos",
        icon: <Database className='h-4 w-4' />,
      },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    icon: <Server className='h-4 w-4' />,
    items: [
      {
        id: "api",
        title: "API",
        icon: <Code className='h-4 w-4' />,
      },
      {
        id: "flujo",
        title: "Flujo de datos",
        icon: <GitBranch className='h-4 w-4' />,
      },
    ],
  },
  {
    id: "avanzado",
    title: "Funciones Avanzadas",
    icon: <FileText className='h-4 w-4' />,
    items: [
      {
        id: "extension",
        title: "Extensión",
        icon: <FileText className='h-4 w-4' />,
      },
      {
        id: "sincronizacion",
        title: "Sincronización",
        icon: <RefreshCw className='h-4 w-4' />,
      },
    ],
  },
];

// Componente principal
export default function DevDocsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("modelo");

  // Determinar qué acordeón debe estar abierto basado en la sección activa
  const getExpandedValue = () => {
    for (const category of devCategories) {
      if (category.items.some((item) => item.id === activeSection)) {
        return [category.id];
      }
    }
    return [];
  };

  // Función para renderizar la sección activa
  const renderActiveSection = () => {
    switch (activeSection) {
      case "modelo":
        return <ModeloSection />;
      case "api":
        return <ApiSection />;
      case "flujo":
        return <FlujoSection />;
      case "extension":
        return <ExtensionSection />;
      case "sincronizacion":
        return <SincronizacionSection />;
      default:
        return <ModeloSection />;
    }
  };

  return (
    <div className='container py-10'>
      <div className='flex items-center space-x-4 mb-8'>
        <Button
          variant='ghost'
          onClick={() => router.push("/admin/drive-routes/docs")}
        >
          <ArrowLeft className='mr-2 h-4 w-4' /> Volver
        </Button>
        <h1 className='text-3xl font-bold'>
          Documentación para Desarrolladores
        </h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* Sidebar */}
        <div className='md:col-span-1 md:sticky md:top-4 md:self-start'>
          <Card className='sticky top-4'>
            <CardHeader>
              <CardTitle>Navegación</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion
                type='multiple'
                defaultValue={getExpandedValue()}
                className='w-full'
              >
                {devCategories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className='text-sm hover:no-underline'>
                      <div className='flex items-center w-full'>
                        {category.icon}
                        <span className='ml-2'>{category.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='flex flex-col space-y-1 pl-1'>
                        {category.items.map((item) => (
                          <Button
                            key={item.id}
                            variant={
                              activeSection === item.id ? "secondary" : "ghost"
                            }
                            className={cn(
                              "w-full justify-start text-sm",
                              activeSection === item.id && "bg-muted"
                            )}
                            onClick={() => setActiveSection(item.id)}
                          >
                            {item.icon}
                            <span className='ml-2'>{item.title}</span>
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className='md:col-span-3'>{renderActiveSection()}</div>
      </div>
    </div>
  );
}
