import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Code, Server, Lightbulb } from "lucide-react";

export default function ApiPage() {
  return (
    <div>
      <DocHeader
        title='API'
        description='Endpoints disponibles y ejemplos de uso'
        icon={Server}
      />

      <DocContent>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Endpoints</h3>
          <p className='mb-6'>
            A continuación, se detallan los endpoints disponibles para
            interactuar con las rutas de Drive:
          </p>

          <h4 className='text-lg font-semibold mb-4'>Operaciones CRUD</h4>
          <div className='space-y-4 mb-8'>
            <div className='border border-slate-600 rounded-lg p-4 bg-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='bg-green-500 text-white px-2 py-1 rounded text-sm font-mono'>
                  GET
                </span>
                <code className='text-lg text-green-400'>/api/drive/management</code>
              </div>
              <p className='text-slate-300'>Listar todas las rutas</p>
            </div>

            <div className='border border-slate-600 rounded-lg p-4 bg-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='bg-blue-500 text-white px-2 py-1 rounded text-sm font-mono'>
                  POST
                </span>
                <code className='text-lg text-green-400'>/api/drive/management</code>
              </div>
              <p className='text-slate-300'>Crear una nueva ruta</p>
            </div>

            <div className='border border-slate-600 rounded-lg p-4 bg-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='bg-green-500 text-white px-2 py-1 rounded text-sm font-mono'>
                  GET
                </span>
                <code className='text-lg text-green-400'>/api/drive/management/<span className='text-orange-400'>:id</span></code>
              </div>
              <p className='text-slate-300'>Obtener una ruta específica</p>
            </div>

            <div className='border border-slate-600 rounded-lg p-4 bg-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='bg-orange-500 text-white px-2 py-1 rounded text-sm font-mono'>
                  PUT
                </span>
                <code className='text-lg text-green-400'>/api/drive/management/<span className='text-orange-400'>:id</span></code>
              </div>
              <p className='text-slate-300'>Actualizar una ruta</p>
            </div>

            <div className='border border-slate-600 rounded-lg p-4 bg-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='bg-red-500 text-white px-2 py-1 rounded text-sm font-mono'>
                  DELETE
                </span>
                <code className='text-lg text-green-400'>/api/drive/management/<span className='text-orange-400'>:id</span></code>
              </div>
              <p className='text-slate-300'>Eliminar una ruta</p>
            </div>
          </div>

          <h4 className='text-lg font-semibold mb-4'>Sincronización</h4>
          <div className='space-y-4 mb-8'>
            <div className='border border-slate-600 rounded-lg p-4 bg-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='bg-blue-500 text-white px-2 py-1 rounded text-sm font-mono'>
                  POST
                </span>
                <code className='text-lg text-green-400'>/api/drive/management/<span className='text-orange-400'>:id</span>/fetch</code>
              </div>
              <p className='text-slate-300'>Sincronizar una ruta con Drive</p>
            </div>

            <div className='border border-slate-600 rounded-lg p-4 bg-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='bg-blue-500 text-white px-2 py-1 rounded text-sm font-mono'>
                  POST
                </span>
                <code className='text-lg text-green-400'>/api/cron/sync-drive</code>
              </div>
              <p className='text-slate-300'>
                Endpoint para tarea CRON (automática)
              </p>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Ejemplos de uso</h3>

          <h4 className='text-lg font-semibold mb-4'>Creación de una ruta</h4>
          <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-6'>
            {`// POST /api/drive/management
{
  "slug": "mi-ruta",
  "folderIds": ["1ABCd123XYZ_exampleFolderId"],
  "title": "Mi Ruta de Drive",
  "subtitle": "Contenido compartido", 
  "description": "Descripción de la ruta"
}`}
          </pre>

          <h4 className='text-lg font-semibold mb-4'>Respuesta exitosa</h4>
          <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-6'>
            {`{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "slug": "mi-ruta",
    "folderIds": ["1ABCd123XYZ_exampleFolderId"],
    "title": "Mi Ruta de Drive",
    "subtitle": "Contenido compartido",
    "description": "Descripción de la ruta",
    "hierarchyData": {},
    "lastUpdated": "2024-01-01T00:00:00Z",
    "nextSyncDue": "2024-01-02T00:00:00Z",
    "isActive": true,
    "viewCount": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}`}
          </pre>

          <h4 className='text-lg font-semibold mb-4'>Sincronización manual</h4>
          <pre className='bg-slate-800 text-green-400 p-4 rounded overflow-x-auto border border-slate-600 mb-6'>
            {`// POST /api/drive/management/64f1a2b3c4d5e6f7g8h9i0j1/fetch

// Respuesta
{
  "success": true,
  "message": "Sincronización completada",
  "data": {
    "hierarchySize": 15420,
    "processingTime": 2340,
    "itemsProcessed": 127,
    "lastSyncAttempt": "2024-01-01T12:00:00Z"
  }
}`}
          </pre>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Códigos de respuesta</h3>
          <div className='space-y-3'>
            <div className='flex items-center gap-4'>
              <span className='bg-green-500 text-white px-3 py-1 rounded font-mono'>
                200
              </span>
              <span>Operación exitosa</span>
            </div>
            <div className='flex items-center gap-4'>
              <span className='bg-blue-500 text-white px-3 py-1 rounded font-mono'>
                201
              </span>
              <span>Recurso creado exitosamente</span>
            </div>
            <div className='flex items-center gap-4'>
              <span className='bg-orange-500 text-white px-3 py-1 rounded font-mono'>
                400
              </span>
              <span>Error en la solicitud (datos inválidos)</span>
            </div>
            <div className='flex items-center gap-4'>
              <span className='bg-red-500 text-white px-3 py-1 rounded font-mono'>
                404
              </span>
              <span>Recurso no encontrado</span>
            </div>
            <div className='flex items-center gap-4'>
              <span className='bg-red-600 text-white px-3 py-1 rounded font-mono'>
                500
              </span>
              <span>Error interno del servidor</span>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Autenticación</h3>
          <p className='mb-4'>
            Todos los endpoints requieren autenticación. El sistema utiliza:
          </p>
          <ul className='list-disc pl-6 space-y-2 mb-4'>
            <li>
              <strong>API Keys</strong>: Para acceso programático
            </li>
            <li>
              <strong>Session Tokens</strong>: Para acceso desde la interfaz web
            </li>
            <li>
              <strong>Google OAuth</strong>: Para acceso a Google Drive API
            </li>
          </ul>
        </section>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Utiliza
            herramientas como Postman o curl para probar los endpoints durante
            el desarrollo. Asegúrate de incluir las cabeceras de autenticación
            apropiadas.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
