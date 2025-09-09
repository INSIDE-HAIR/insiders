import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Database, Lightbulb } from "lucide-react";

export default function DataModelPage() {
  return (
    <div>
      <DocHeader
        title='Modelo de Datos'
        description='Esquemas de Prisma y estructura de la base de datos'
        icon={Database}
      />

      <DocContent>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>DriveRoute</h3>
          <p className='mb-4'>
            El modelo principal para almacenar rutas y su configuración:
          </p>
          <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-6'>
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

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>DriveRouteLog</h3>
          <p className='mb-4'>Modelo para registrar operaciones sobre rutas:</p>
          <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-6'>
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

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Campos principales</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-lg font-semibold mb-3'>DriveRoute</h4>
              <ul className='list-disc pl-6 space-y-2'>
                <li>
                  <strong>slug</strong>: Identificador único en URL
                </li>
                <li>
                  <strong>folderIds</strong>: Array de IDs de carpetas de Google
                  Drive
                </li>
                <li>
                  <strong>hierarchyData</strong>: JSON con la estructura
                  jerárquica de Drive
                </li>
                <li>
                  <strong>lastUpdated</strong>: Última vez que se actualizó el
                  contenido
                </li>
                <li>
                  <strong>nextSyncDue</strong>: Cuándo debe realizarse la
                  próxima sincronización
                </li>
                <li>
                  <strong>customSettings</strong>: Configuraciones adicionales
                  (extensible)
                </li>
              </ul>
            </div>

            <div>
              <h4 className='text-lg font-semibold mb-3'>DriveRouteLog</h4>
              <ul className='list-disc pl-6 space-y-2'>
                <li>
                  <strong>routeId</strong>: Referencia al DriveRoute
                </li>
                <li>
                  <strong>operation</strong>: Tipo de operación realizada
                </li>
                <li>
                  <strong>success</strong>: Indica si la operación fue exitosa
                </li>
                <li>
                  <strong>errorMessage</strong>: Mensaje de error si falló
                </li>
                <li>
                  <strong>hierarchySize</strong>: Tamaño del JSON en bytes
                </li>
                <li>
                  <strong>processingTime</strong>: Tiempo de procesamiento en ms
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>
            Estructura del JSON hierarchyData
          </h3>
          <p className='mb-4'>
            El campo <code>hierarchyData</code> almacena la estructura completa
            de Google Drive en formato JSON:
          </p>
          <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-6'>
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
      "thumbnailLink": "https://drive.google.com/...",
      "size": 1024,
      "modifiedTime": "2024-01-01T00:00:00Z"
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

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Índices de base de datos</h3>
          <p className='mb-4'>
            Para optimizar las consultas, se han definido los siguientes
            índices:
          </p>
          <ul className='list-disc pl-6 space-y-2 mb-4'>
            <li>
              <strong>DriveRoute.slug</strong>: Índice único para búsquedas
              rápidas por slug
            </li>
            <li>
              <strong>DriveRoute.isActive</strong>: Para filtrar rutas activas
            </li>
            <li>
              <strong>DriveRoute.nextSyncDue</strong>: Para el sistema de
              sincronización
            </li>
            <li>
              <strong>DriveRouteLog.routeId</strong>: Para consultar logs por
              ruta
            </li>
            <li>
              <strong>DriveRouteLog.timestamp</strong>: Para consultas
              cronológicas
            </li>
          </ul>
        </section>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Al extender
            el modelo de datos, considera el impacto en la sincronización y
            asegúrate de añadir los índices necesarios para mantener el
            rendimiento.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
