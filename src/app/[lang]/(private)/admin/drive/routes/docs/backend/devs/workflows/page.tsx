import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { GitBranch, Workflow, Lightbulb } from "lucide-react";

export default function WorkflowsPage() {
  return (
    <div>
      <DocHeader
        title='Flujos de Trabajo'
        description='Procesos de sincronización y manejo de datos'
        icon={Workflow}
      />

      <DocContent>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Proceso de sincronización</h3>
          <p className='mb-6'>
            El flujo de datos entre Google Drive y la aplicación sigue estos
            pasos:
          </p>

          <div className='space-y-4 mb-8'>
            <div className='flex items-start gap-4 p-4 border border-primary/20 rounded-lg bg-primary/5'>
              <div className='bg-slate-800 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm'>
                1
              </div>
              <div>
                <h4 className='font-semibold text-primary'>
                  Inicio de sincronización
                </h4>
                <p className='text-slate-300'>
                  Puede ser manual (botón en UI) o automática (cron job cada
                  24h)
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 p-4 border border-primary/20 rounded-lg bg-primary/5'>
              <div className='bg-slate-800 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm'>
                2
              </div>
              <div>
                <h4 className='font-semibold text-primary'>
                  Obtención de datos
                </h4>
                <p className='text-slate-300'>
                  Se consulta la API de Google Drive para obtener la estructura
                  de carpetas
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 p-4 border border-primary/20 rounded-lg bg-primary/5'>
              <div className='bg-slate-800 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm'>
                3
              </div>
              <div>
                <h4 className='font-semibold text-primary'>Procesamiento</h4>
                <p className='text-slate-300'>
                  Se analiza la estructura y se genera un JSON jerárquico
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 p-4 border border-primary/20 rounded-lg bg-primary/5'>
              <div className='bg-slate-800 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm'>
                4
              </div>
              <div>
                <h4 className='font-semibold text-primary'>
                  Almacenamiento
                </h4>
                <p className='text-slate-300'>
                  Se guarda el JSON en el campo hierarchyData de la ruta
                </p>
              </div>
            </div>

            <div className='flex items-start gap-4 p-4 border border-primary/20 rounded-lg bg-primary/5'>
              <div className='bg-slate-800 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm'>
                5
              </div>
              <div>
                <h4 className='font-semibold text-primary'>Registro</h4>
                <p className='text-slate-300'>
                  Se crea un log de la operación en DriveRouteLog
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Estructura de datos</h3>
          <p className='mb-4'>
            El JSON almacenado en hierarchyData tiene esta estructura:
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
      "modifiedTime": "2024-01-01T00:00:00Z",
      "prefixes": ["order", "section"],
      "suffixes": [],
      "displayName": "Nombre del archivo",
      "order": 1
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
          <h3 className='text-xl font-bold mb-4'>
            Flujo de procesamiento de archivos
          </h3>
          <p className='mb-4'>
            Cada archivo pasa por un proceso de análisis y transformación:
          </p>

          <div className='border border-primary/20 rounded-md p-4 mb-6 bg-primary/5'>
            <pre className='text-sm overflow-x-auto text-slate-300'>
              {`Archivo de Google Drive
  ↓
FileAnalyzer.analyzeFile()
  ↓
Extracción de prefijos y sufijos
  ↓
Determinación del tipo de componente
  ↓
Generación de URLs transformadas
  ↓
Construcción del HierarchyItem
  ↓
Integración en la jerarquía`}
            </pre>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Manejo de errores</h3>
          <p className='mb-4'>
            El sistema implementa un manejo robusto de errores:
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-lg font-semibold mb-3 text-red-700'>
                Errores de Google Drive API
              </h4>
              <ul className='list-disc pl-6 space-y-2 text-sm'>
                <li>Rate limiting (429)</li>
                <li>Permisos insuficientes (403)</li>
                <li>Archivos no encontrados (404)</li>
                <li>Token expirado (401)</li>
              </ul>
            </div>

            <div>
              <h4 className='text-lg font-semibold mb-3 text-orange-700'>
                Errores de procesamiento
              </h4>
              <ul className='list-disc pl-6 space-y-2 text-sm'>
                <li>JSON malformado</li>
                <li>Estructura circular</li>
                <li>Archivos corruptos</li>
                <li>Memoria insuficiente</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>
            Optimizaciones de rendimiento
          </h3>
          <p className='mb-4'>
            Para manejar grandes volúmenes de datos, el sistema implementa:
          </p>

          <ul className='list-disc pl-6 space-y-2 mb-6'>
            <li>
              <strong>Paginación</strong>: Procesamiento en lotes de archivos
            </li>
            <li>
              <strong>Caché</strong>: Almacenamiento temporal de metadatos
            </li>
            <li>
              <strong>Compresión</strong>: JSON comprimido para reducir tamaño
            </li>
            <li>
              <strong>Índices</strong>: Base de datos optimizada para consultas
            </li>
            <li>
              <strong>Lazy loading</strong>: Carga bajo demanda de contenido
            </li>
          </ul>
        </section>

        <section className='mb-10'>
          <h3 className='text-xl font-bold mb-4'>Monitoreo y métricas</h3>
          <p className='mb-4'>
            Cada operación se registra con las siguientes métricas:
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 border border-primary/20 rounded-lg bg-primary/5'>
              <h5 className='font-semibold mb-2 text-primary'>Tiempo de procesamiento</h5>
              <p className='text-sm text-slate-300'>
                Duración total de la sincronización
              </p>
            </div>

            <div className='p-4 border border-primary/20 rounded-lg bg-primary/5'>
              <h5 className='font-semibold mb-2 text-primary'>Tamaño de jerarquía</h5>
              <p className='text-sm text-slate-300'>Bytes del JSON generado</p>
            </div>

            <div className='p-4 border border-primary/20 rounded-lg bg-primary/5'>
              <h5 className='font-semibold mb-2 text-primary'>Elementos procesados</h5>
              <p className='text-sm text-slate-300'>
                Cantidad de archivos y carpetas
              </p>
            </div>
          </div>
        </section>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Al
            modificar los flujos de trabajo, asegúrate de mantener la
            compatibilidad con el sistema de logging para no perder visibilidad
            sobre las operaciones.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
