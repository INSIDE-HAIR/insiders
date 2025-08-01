import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";

export default function TypingHelpersDocsPage() {
  return (
    <div>
      <DocHeader
        title='Helpers de Tipado'
        description='Funciones auxiliares para manejar tipado seguro'
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-8 mb-4'>
          Helpers de Tipado Seguro
        </h2>

        <p className='mb-4'>
          Para mejorar la seguridad de tipos y facilitar el acceso a propiedades
          opcionales en objetos <code>HierarchyItem</code>, se ha implementado
          un conjunto de funciones auxiliares en el archivo{" "}
          <code>hierarchy-helpers.ts</code>. Estas funciones permiten acceder de
          forma segura a propiedades que pueden no estar definidas en todos los
          objetos, evitando errores de TypeScript.
        </p>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Ubicación del Archivo
        </h3>

        <p className='mb-4'>
          <code>
            src/features/drive/utils/marketing-salon/hierarchy-helpers.ts
          </code>
        </p>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Funciones Disponibles
        </h3>

        <div className='space-y-6'>
          <div className='bg-zinc-50 p-4 rounded-md border border-zinc-200'>
            <h4 className='text-lg font-medium text-zinc-900'>
              hasPrefix(item, prefix)
            </h4>
            <p className='text-sm text-zinc-700 mt-1'>
              Verifica si un item tiene un prefijo específico, convirtiendo el
              tipo enumerado a string.
            </p>
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm'>
              {`const hasButtonPrefix = hasPrefix(item, "button"); 
// Reemplaza: item.prefixes.includes("button")`}
            </pre>
          </div>

          <div className='bg-zinc-50 p-4 rounded-md border border-zinc-200'>
            <h4 className='text-lg font-medium text-zinc-900'>
              hasSuffix(item, suffix)
            </h4>
            <p className='text-sm text-zinc-700 mt-1'>
              Verifica si un item tiene un sufijo específico, convirtiendo el
              tipo enumerado a string.
            </p>
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm'>
              {`const hasDownloadSuffix = hasSuffix(item, "download");
// Reemplaza: item.suffixes.includes("download")`}
            </pre>
          </div>

          <div className='bg-zinc-50 p-4 rounded-md border border-zinc-200'>
            <h4 className='text-lg font-medium text-zinc-900'>
              getPreviewUrl(item)
            </h4>
            <p className='text-sm text-zinc-700 mt-1'>
              Obtiene la URL de vista previa de forma segura.
            </p>
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm'>
              {`const previewUrl = getPreviewUrl(item);
// Reemplaza: item.transformedUrl?.preview`}
            </pre>
          </div>

          <div className='bg-zinc-50 p-4 rounded-md border border-zinc-200'>
            <h4 className='text-lg font-medium text-zinc-900'>
              getDownloadUrl(item)
            </h4>
            <p className='text-sm text-zinc-700 mt-1'>
              Obtiene la URL de descarga de forma segura.
            </p>
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm'>
              {`const downloadUrl = getDownloadUrl(item);
// Reemplaza: item.transformedUrl?.download`}
            </pre>
          </div>

          <div className='bg-zinc-50 p-4 rounded-md border border-zinc-200'>
            <h4 className='text-lg font-medium text-zinc-900'>
              getEmbedUrl(item)
            </h4>
            <p className='text-sm text-zinc-700 mt-1'>
              Obtiene la URL de embed de forma segura.
            </p>
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm'>
              {`const embedUrl = getEmbedUrl(item);
// Reemplaza: item.transformedUrl?.embed`}
            </pre>
          </div>

          <div className='bg-zinc-50 p-4 rounded-md border border-zinc-200'>
            <h4 className='text-lg font-medium text-zinc-900'>
              getFormUrl(item)
            </h4>
            <p className='text-sm text-zinc-700 mt-1'>
              Obtiene la URL de formulario de forma segura.
            </p>
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm'>
              {`const formUrl = getFormUrl(item);
// Reemplaza: item.formUrl`}
            </pre>
          </div>

          <div className='bg-zinc-50 p-4 rounded-md border border-zinc-200'>
            <h4 className='text-lg font-medium text-zinc-900'>
              getPreviewItems(item)
            </h4>
            <p className='text-sm text-zinc-700 mt-1'>
              Obtiene los elementos de vista previa de forma segura.
            </p>
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm'>
              {`const previewItems = getPreviewItems(item);
// Reemplaza: item.previewItems`}
            </pre>
          </div>

          <div className='bg-zinc-50 p-4 rounded-md border border-zinc-200'>
            <h4 className='text-lg font-medium text-zinc-900'>
              hasMultiplePreviews(item)
            </h4>
            <p className='text-sm text-zinc-700 mt-1'>
              Verifica si un elemento tiene múltiples vistas previas.
            </p>
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm'>
              {`const hasMultiple = hasMultiplePreviews(item);
// Reemplaza: item.previewItems && item.previewItems.length > 1`}
            </pre>
          </div>

          <div className='bg-zinc-50 p-4 rounded-md border border-zinc-200'>
            <h4 className='text-lg font-medium text-zinc-900'>
              mimeTypeIncludes(item, text)
            </h4>
            <p className='text-sm text-zinc-700 mt-1'>
              Verifica de forma segura si el mimeType incluye un texto
              específico.
            </p>
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm'>
              {`const isPdf = mimeTypeIncludes(item, "pdf");
// Reemplaza: item.mimeType && item.mimeType.includes("pdf")`}
            </pre>
          </div>
        </div>

        <h3 className='text-xl font-semibold mt-8 mb-3'>
          Cómo Usar los Helpers
        </h3>

        <p className='mb-4'>
          Para usar estas funciones, importa las que necesites desde el archivo
          de helpers:
        </p>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm mb-4'>
          {`import { 
  hasPrefix, 
  getPreviewUrl, 
  mimeTypeIncludes 
} from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";`}
        </pre>

        <p className='mb-4'>
          Luego, utiliza las funciones en lugar de acceder directamente a las
          propiedades:
        </p>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm mb-4'>
          {`// Antes (propenso a errores de tipo)
if (item.prefixes.includes("button")) {
  const previewUrl = item.transformedUrl?.preview;
  if (item.mimeType?.includes("pdf")) {
    // hacer algo con PDFs
  }
}

// Después (seguro de tipos)
if (hasPrefix(item, "button")) {
  const previewUrl = getPreviewUrl(item);
  if (mimeTypeIncludes(item, "pdf")) {
    // hacer algo con PDFs
  }
}`}
        </pre>

        <h3 className='text-xl font-semibold mt-8 mb-3'>
          Casos de Uso Específicos
        </h3>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Verificación de null/nulos anidados
        </h4>
        <p className='mb-4'>
          Para casos donde necesites manejar referencias a objetos que podrían
          ser null, usa verificaciones de null para evitar errores:
        </p>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm mb-4'>
          {`// Verificar si currentCardPreview existe antes de obtener su URL
const cardPreviewUrl =
  (currentCardPreview && getPreviewUrl(currentCardPreview)) ||
  getPreviewUrl(item) ||
  "";`}
        </pre>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Propiedades CSS personalizadas
        </h4>
        <p className='mb-4'>
          Para usar propiedades CSS personalizadas (variables CSS) sin errores
          de tipo, usa comentarios <code>@ts-ignore</code>:
        </p>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded-md mt-2 overflow-auto text-sm mb-4'>
          {`<div
  style={{
    scrollbarWidth: "thin",
    // @ts-ignore - Estas propiedades son seguras ya que se usan en el CSS
    "--scrollbar-width": "8px",
    // @ts-ignore
    "--scrollbar-height": "8px"
  }}
>`}
        </pre>

        <div className='bg-blue-50 border-l-4 border-blue-500 p-4 my-6'>
          <p className='text-blue-800'>
            <strong>Consejo:</strong> Siempre utiliza estos helpers en lugar de
            acceder directamente a las propiedades. Esto garantiza una mejor
            seguridad de tipos y reduce los errores de TypeScript.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
