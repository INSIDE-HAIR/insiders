import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { CodeSquare, Lightbulb } from "lucide-react";

export default function TypingHelpersDocsPage() {
  return (
    <div>
      <DocHeader
        title='Helpers de Tipado'
        description='Funciones auxiliares para manejar tipado seguro'
        icon={CodeSquare}
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-8 mb-4 flex items-center gap-3 text-white'>
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
          <div className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-slate-300'>
              hasPrefix(item, prefix)
            </h4>
            <p className='text-sm text-slate-400 mt-1'>
              Verifica si un item tiene un prefijo específico, convirtiendo el
              tipo enumerado a string.
            </p>
            <div className='bg-slate-900 border border-slate-700 rounded p-3 mt-2 overflow-auto text-sm'>
              <code className='text-purple-300'>const</code>{" "}
              <code className='text-blue-300'>hasButtonPrefix</code>{" "}
              <code className='text-slate-400'>=</code>{" "}
              <code className='text-yellow-300'>hasPrefix</code>
              <code className='text-slate-400'>(</code>
              <code className='text-blue-300'>item</code>
              <code className='text-slate-400'>,</code>{" "}
              <code className='text-green-300'>"button"</code>
              <code className='text-slate-400'>);</code>
              <br />
              <code className='text-slate-500'>
                // Reemplaza: item.prefixes.includes("button")
              </code>
            </div>
          </div>

          <div className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-slate-300'>
              hasSuffix(item, suffix)
            </h4>
            <p className='text-sm text-slate-400 mt-1'>
              Verifica si un item tiene un sufijo específico, convirtiendo el
              tipo enumerado a string.
            </p>
            <div className='bg-slate-900 border border-slate-700 rounded p-3 mt-2 overflow-auto text-sm'>
              <code className='text-purple-300'>const</code>{" "}
              <code className='text-blue-300'>hasDownloadSuffix</code>{" "}
              <code className='text-slate-400'>=</code>{" "}
              <code className='text-yellow-300'>hasSuffix</code>
              <code className='text-slate-400'>(</code>
              <code className='text-blue-300'>item</code>
              <code className='text-slate-400'>,</code>{" "}
              <code className='text-green-300'>"download"</code>
              <code className='text-slate-400'>);</code>
              <br />
              <code className='text-slate-500'>
                // Reemplaza: item.suffixes.includes("download")
              </code>
            </div>
          </div>

          <div className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-slate-300'>
              getPreviewUrl(item)
            </h4>
            <p className='text-sm text-slate-400 mt-1'>
              Obtiene la URL de vista previa de forma segura.
            </p>
            <div className='bg-slate-900 border border-slate-700 rounded p-3 mt-2 overflow-auto text-sm'>
              <code className='text-purple-300'>const</code>{" "}
              <code className='text-blue-300'>previewUrl</code>{" "}
              <code className='text-slate-400'>=</code>{" "}
              <code className='text-yellow-300'>getPreviewUrl</code>
              <code className='text-slate-400'>(</code>
              <code className='text-blue-300'>item</code>
              <code className='text-slate-400'>);</code>
              <br />
              <code className='text-slate-500'>
                // Reemplaza: item.transformedUrl?.preview
              </code>
            </div>
          </div>

          <div className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-slate-300'>
              getDownloadUrl(item)
            </h4>
            <p className='text-sm text-slate-400 mt-1'>
              Obtiene la URL de descarga de forma segura.
            </p>
            <div className='bg-slate-900 border border-slate-700 rounded p-3 mt-2 overflow-auto text-sm'>
              <code className='text-purple-300'>const</code>{" "}
              <code className='text-blue-300'>downloadUrl</code>{" "}
              <code className='text-slate-400'>=</code>{" "}
              <code className='text-yellow-300'>getDownloadUrl</code>
              <code className='text-slate-400'>(</code>
              <code className='text-blue-300'>item</code>
              <code className='text-slate-400'>);</code>
              <br />
              <code className='text-slate-500'>
                // Reemplaza: item.transformedUrl?.download
              </code>
            </div>
          </div>

          <div className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-slate-300'>
              getEmbedUrl(item)
            </h4>
            <p className='text-sm text-slate-400 mt-1'>
              Obtiene la URL de embed de forma segura.
            </p>
            <div className='bg-slate-900 border border-slate-700 rounded p-3 mt-2 overflow-auto text-sm'>
              <code className='text-purple-300'>const</code>{" "}
              <code className='text-blue-300'>embedUrl</code>{" "}
              <code className='text-slate-400'>=</code>{" "}
              <code className='text-yellow-300'>getEmbedUrl</code>
              <code className='text-slate-400'>(</code>
              <code className='text-blue-300'>item</code>
              <code className='text-slate-400'>);</code>
              <br />
              <code className='text-slate-500'>
                // Reemplaza: item.transformedUrl?.embed
              </code>
            </div>
          </div>

          <div className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-slate-300'>
              getFormUrl(item)
            </h4>
            <p className='text-sm text-slate-400 mt-1'>
              Obtiene la URL de formulario de forma segura.
            </p>
            <div className='bg-slate-900 border border-slate-700 rounded p-3 mt-2 overflow-auto text-sm'>
              <code className='text-purple-300'>const</code>{" "}
              <code className='text-blue-300'>formUrl</code>{" "}
              <code className='text-slate-400'>=</code>{" "}
              <code className='text-yellow-300'>getFormUrl</code>
              <code className='text-slate-400'>(</code>
              <code className='text-blue-300'>item</code>
              <code className='text-slate-400'>);</code>
              <br />
              <code className='text-slate-500'>// Reemplaza: item.formUrl</code>
            </div>
          </div>

          <div className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-slate-300'>
              getPreviewItems(item)
            </h4>
            <p className='text-sm text-slate-400 mt-1'>
              Obtiene los elementos de vista previa de forma segura.
            </p>
            <div className='bg-slate-900 border border-slate-700 rounded p-3 mt-2 overflow-auto text-sm'>
              <code className='text-purple-300'>const</code>{" "}
              <code className='text-blue-300'>previewItems</code>{" "}
              <code className='text-slate-400'>=</code>{" "}
              <code className='text-yellow-300'>getPreviewItems</code>
              <code className='text-slate-400'>(</code>
              <code className='text-blue-300'>item</code>
              <code className='text-slate-400'>);</code>
              <br />
              <code className='text-slate-500'>
                // Reemplaza: item.previewItems
              </code>
            </div>
          </div>

          <div className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-slate-300'>
              hasMultiplePreviews(item)
            </h4>
            <p className='text-sm text-slate-400 mt-1'>
              Verifica si un elemento tiene múltiples vistas previas.
            </p>
            <div className='bg-slate-900 border border-slate-700 rounded p-3 mt-2 overflow-auto text-sm'>
              <code className='text-purple-300'>const</code>{" "}
              <code className='text-blue-300'>hasMultiple</code>{" "}
              <code className='text-slate-400'>=</code>{" "}
              <code className='text-yellow-300'>hasMultiplePreviews</code>
              <code className='text-slate-400'>(</code>
              <code className='text-blue-300'>item</code>
              <code className='text-slate-400'>);</code>
              <br />
              <code className='text-slate-500'>
                // Reemplaza: item.previewItems && item.previewItems.length{" "}
                {">"} 1
              </code>
            </div>
          </div>

          <div className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-slate-300'>
              mimeTypeIncludes(item, text)
            </h4>
            <p className='text-sm text-slate-400 mt-1'>
              Verifica de forma segura si el mimeType incluye un texto
              específico.
            </p>
            <div className='bg-slate-900 border border-slate-700 rounded p-3 mt-2 overflow-auto text-sm'>
              <code className='text-purple-300'>const</code>{" "}
              <code className='text-blue-300'>isPdf</code>{" "}
              <code className='text-slate-400'>=</code>{" "}
              <code className='text-yellow-300'>mimeTypeIncludes</code>
              <code className='text-slate-400'>(</code>
              <code className='text-blue-300'>item</code>
              <code className='text-slate-400'>,</code>{" "}
              <code className='text-green-300'>"pdf"</code>
              <code className='text-slate-400'>);</code>
              <br />
              <code className='text-slate-500'>
                // Reemplaza: item.mimeType && item.mimeType.includes("pdf")
              </code>
            </div>
          </div>
        </div>

        <h3 className='text-xl font-semibold mt-8 mb-3'>
          Cómo Usar los Helpers
        </h3>

        <p className='mb-4'>
          Para usar estas funciones, importa las que necesites desde el archivo
          de helpers:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-yellow-300'>hasPrefix</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-yellow-300'>getPreviewUrl</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-yellow-300'>mimeTypeIncludes</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>
              "@/src/features/drive/utils/marketing-salon/hierarchy-helpers"
            </code>
            <code className='text-slate-400'>;</code>
          </pre>
        </div>

        <p className='mb-4'>
          Luego, utiliza las funciones en lugar de acceder directamente a las
          propiedades:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // Antes (propenso a errores de tipo)
            </code>
            <br />
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>prefixes</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>includes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>"button"</code>
            <code className='text-slate-400'>))</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>previewUrl</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>transformedUrl</code>
            <code className='text-slate-400'>?.</code>
            <code className='text-blue-300'>preview</code>
            <code className='text-slate-400'>;</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>mimeType</code>
            <code className='text-slate-400'>?.</code>
            <code className='text-yellow-300'>includes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>"pdf"</code>
            <code className='text-slate-400'>))</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>// hacer algo con PDFs</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <br />
            <code className='text-slate-500'>// Después (seguro de tipos)</code>
            <br />
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-yellow-300'>hasPrefix</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-green-300'>"button"</code>
            <code className='text-slate-400'>))</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>previewUrl</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-yellow-300'>getPreviewUrl</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>);</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-yellow-300'>mimeTypeIncludes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-green-300'>"pdf"</code>
            <code className='text-slate-400'>))</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>// hacer algo con PDFs</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

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

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // Verificar si currentCardPreview existe antes de obtener su URL
            </code>
            <br />
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>cardPreviewUrl</code>{" "}
            <code className='text-slate-400'>=</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>currentCardPreview</code>{" "}
            <code className='text-slate-400'>&&</code>{" "}
            <code className='text-yellow-300'>getPreviewUrl</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>currentCardPreview</code>
            <code className='text-slate-400'>))</code>{" "}
            <code className='text-slate-400'>||</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-yellow-300'>getPreviewUrl</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>||</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-green-300'>""</code>
            <code className='text-slate-400'>;</code>
          </pre>
        </div>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Propiedades CSS personalizadas
        </h4>
        <p className='mb-4'>
          Para usar propiedades CSS personalizadas (variables CSS) sin errores
          de tipo, usa comentarios <code>@ts-ignore</code>:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>div</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>style</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>scrollbarWidth</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"thin"</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // @ts-ignore - Estas propiedades son seguras ya que se usan en el
              CSS
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-green-300'>"--scrollbar-width"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"8px"</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>// @ts-ignore</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-green-300'>"--scrollbar-height"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"8px"</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'>{">"}</code>
          </pre>
        </div>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Siempre
            utiliza estos helpers en lugar de acceder directamente a las
            propiedades. Esto garantiza una mejor seguridad de tipos y reduce
            los errores de TypeScript.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
