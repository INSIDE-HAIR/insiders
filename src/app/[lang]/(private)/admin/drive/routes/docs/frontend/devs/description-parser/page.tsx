import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { FileCode, AlertTriangle } from "lucide-react";

export default function DescriptionParserPage() {
  return (
    <div>
      <DocHeader
        title='Campo Description'
        description='Procesamiento del campo Description para propiedades personalizadas'
        icon={FileCode}
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-8 mb-4'>
          Procesamiento del campo Description
        </h2>

        <p className='mb-4'>
          El sistema utiliza el campo <code>description</code> para almacenar
          propiedades personalizadas en formato JSON. Estas propiedades se
          extraen y procesan mediante utilidades específicas.
        </p>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Utilidades para procesar Description
        </h3>

        <p className='mb-2'>
          El archivo <code>utils/description-parser.ts</code> contiene las
          funciones para extraer propiedades:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto leading-relaxed'>
            <code className='text-slate-500'>
              // Extraer cualquier propiedad del campo description
            </code>
            <br />
            <code className='text-purple-300'>export</code>{" "}
            <code className='text-purple-300'>function</code>{" "}
            <code className='text-yellow-300'>
              extractPropertyFromDescription
            </code>
            <code className='text-slate-400'>(</code>
            <br />
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>
            <code className='text-slate-400'>,</code> <br />
            <code className='text-blue-300'>propertyName</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>string</code>
            <br />
            <code className='text-slate-400'>):</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-400'>|</code>{" "}
            <code className='text-orange-300'>null</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(!</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>description</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-orange-300'>null</code>
            <code className='text-slate-400'>;</code>
            <br />
            <br />
            <code className='text-purple-300'>try</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Múltiples estrategias de parseo
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // 1. Intentar parsear como JSON completo
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>try</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>jsonObj</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-green-400'>JSON</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>parse</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>description</code>
            <code className='text-slate-400'>)</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>jsonObj</code>{" "}
            <code className='text-slate-400'>&&</code>{" "}
            <code className='text-blue-300'>jsonObj</code>
            <code className='text-slate-400'>[</code>
            <code className='text-blue-300'>propertyName</code>
            <code className='text-slate-400'>]) {"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-blue-300'>jsonObj</code>
            <code className='text-slate-400'>[</code>
            <code className='text-blue-300'>propertyName</code>
            <code className='text-slate-400'>]</code>
            <br />
            <code className='text-slate-400'> {"}"}</code>
            <br />
            <code className='text-slate-400'> {"}"}</code>{" "}
            <code className='text-purple-300'>catch</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>e</code>
            <code className='text-slate-400'>) {"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Si falla, continuamos con otros métodos
            </code>
            <br />
            <code className='text-slate-400'> {"}"}</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // 2. Usar expresiones regulares para buscar patrones
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Buscar patrones como "propertyName":"value" o
              "propertyName":"value"
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>regex</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-purple-300'>new</code>{" "}
            <code className='text-green-400'>RegExp</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>
              `[&quot;']$&#123;propertyName&#125;[&quot;']\\s*:\\s*[&quot;']([^&quot;']*)[&quot;']`
            </code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-green-300'>&quot;i&quot;</code>
            <code className='text-slate-400'>)</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>match</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>description</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>match</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>regex</code>
            <code className='text-slate-400'>)</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>match</code>{" "}
            <code className='text-slate-400'>&&</code>{" "}
            <code className='text-blue-300'>match</code>
            <code className='text-slate-400'>[</code>
            <code className='text-cyan-300'>1</code>
            <code className='text-slate-400'>]) {"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-blue-300'>match</code>
            <code className='text-slate-400'>[</code>
            <code className='text-cyan-300'>1</code>
            <code className='text-slate-400'>]</code>
            <br />
            <code className='text-slate-400'> {"}"}</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // 3. Intentar parsear como fragmento de JSON
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>wrappedJson</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-green-300'>
              `&#123;$&#123;item.description.replace(/^&quot;|&quot;$/g,
              &quot;&quot;)&#125;&#125;`
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>try</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>parsedObj</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-green-400'>JSON</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>parse</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>wrappedJson</code>
            <code className='text-slate-400'>)</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>parsedObj</code>{" "}
            <code className='text-slate-400'>&&</code>{" "}
            <code className='text-blue-300'>parsedObj</code>
            <code className='text-slate-400'>[</code>
            <code className='text-blue-300'>propertyName</code>
            <code className='text-slate-400'>]) {"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-blue-300'>parsedObj</code>
            <code className='text-slate-400'>[</code>
            <code className='text-blue-300'>propertyName</code>
            <code className='text-slate-400'>]</code>
            <br />
            <code className='text-slate-400'> {"}"}</code>
            <br />
            <code className='text-slate-400'> {"}"}</code>{" "}
            <code className='text-purple-300'>catch</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>e</code>
            <code className='text-slate-400'>) {"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Si falla, continuamos con otros métodos
            </code>
            <br />
            <code className='text-slate-400'> {"}"}</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-orange-300'>null</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>catch</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>error</code>
            <code className='text-slate-400'>) {"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>console</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>error</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>
              `Error parsing description for $&#123;propertyName&#125;`
            </code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-blue-300'>error</code>
            <code className='text-slate-400'>);</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-orange-300'>null</code>
            <code className='text-slate-400'>;</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Funciones específicas para propiedades comunes
        </h3>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto leading-relaxed'>
            <code className='text-slate-500'>// Extraer URL de formulario</code>
            <br />
            <code className='text-purple-300'>export</code>{" "}
            <code className='text-purple-300'>function</code>{" "}
            <code className='text-yellow-300'>extractFormUrl</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>
            <code className='text-slate-400'>):</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-400'>|</code>{" "}
            <code className='text-orange-300'>null</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-yellow-300'>
              extractPropertyFromDescription
            </code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-green-300'>"formUrl"</code>
            <code className='text-slate-400'>);</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <br />
            <code className='text-slate-500'>// Extraer texto para copiar</code>
            <br />
            <code className='text-purple-300'>export</code>{" "}
            <code className='text-purple-300'>function</code>{" "}
            <code className='text-yellow-300'>extractCopyText</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>
            <code className='text-slate-400'>):</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-400'>|</code>{" "}
            <code className='text-orange-300'>null</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-yellow-300'>
              extractPropertyFromDescription
            </code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-green-300'>"copy"</code>
            <code className='text-slate-400'>);</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Estrategias de parseo
        </h3>

        <p className='mb-4'>
          La función <code>extractPropertyFromDescription</code> utiliza
          múltiples estrategias para extraer propiedades:
        </p>

        <ol className='list-decimal pl-5 space-y-2 mb-6'>
          <li>
            <strong>Parseo JSON completo</strong>: Intenta parsear el campo
            description como un objeto JSON completo.
          </li>
          <li>
            <strong>Expresiones regulares</strong>: Busca patrones específicos
            como <code>&quot;propertyName&quot;:&quot;value&quot;</code>.
          </li>
          <li>
            <strong>Parseo de fragmento JSON</strong>: Intenta envolver el
            contenido en llaves y parsearlo como JSON.
          </li>
        </ol>

        <h3 className='text-xl font-semibold mt-6 mb-3'>Uso en componentes</h3>

        <p className='mb-4'>
          Estas funciones se utilizan en los componentes para extraer
          propiedades específicas:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto leading-relaxed'>
            <code className='text-slate-500'>// En un componente</code>
            <br />
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-yellow-300'>extractFormUrl</code>{" "}
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>"@/utils/description-parser"</code>
            <br />
            <br />
            <code className='text-purple-300'>export</code>{" "}
            <code className='text-purple-300'>function</code>{" "}
            <code className='text-yellow-300'>GoogleFormRenderer</code>
            <code className='text-slate-400'>({"{"}</code>{" "}
            <code className='text-blue-300'>item</code>{" "}
            <code className='text-slate-400'>
              {"}"}: {"{"}
            </code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>{" "}
            <code className='text-slate-400'>{"})"}</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Extraer la URL del formulario
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>formUrl</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-yellow-300'>extractFormUrl</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>)</code>
            <br />
            <code className='text-slate-400'> </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Usar la URL para renderizar el componente
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-slate-400'>(</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>&lt;</code>
            <code className='text-green-400'>Button</code>{" "}
            <code className='text-blue-300'>asChild</code>
            <code className='text-slate-400'>&gt;</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>&lt;</code>
            <code className='text-green-400'>a</code>{" "}
            <code className='text-blue-300'>href</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>formUrl</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-blue-300'>target</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>"_blank"</code>{" "}
            <code className='text-blue-300'>rel</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>"noopener noreferrer"</code>
            <code className='text-slate-400'>&gt;</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-300'>Abrir formulario</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>&lt;/</code>
            <code className='text-green-400'>a</code>
            <code className='text-slate-400'>&gt;</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>&lt;/</code>
            <code className='text-green-400'>Button</code>
            <code className='text-slate-400'>&gt;</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>)</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Añadir nuevas propiedades
        </h3>

        <p className='mb-4'>
          Para añadir soporte para una nueva propiedad personalizada:
        </p>

        <ol className='list-decimal pl-5 space-y-2 mb-6'>
          <li>
            Añade una nueva función de utilidad en{" "}
            <code>utils/description-parser.ts</code>:
            <div className='bg-slate-800 border border-slate-600 rounded-lg p-4 mt-2'>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto leading-relaxed'>
                <code className='text-slate-500'>/**</code>
                <br />
                <code className='text-slate-500'>
                  * Extrae mi propiedad personalizada desde el campo description
                </code>
                <br />
                <code className='text-slate-500'>* </code>
                <br />
                <code className='text-slate-500'>
                  * @param {"{"}
                  <code className='text-green-400'>HierarchyItem</code>
                  {"}"} item - El elemento de contenido
                </code>
                <br />
                <code className='text-slate-500'>
                  * @returns {"{"}
                  <code className='text-orange-300'>string</code>|
                  <code className='text-orange-300'>null</code>
                  {"}"} El valor de mi propiedad o null si no existe
                </code>
                <br />
                <code className='text-slate-500'>*/</code>
                <br />
                <code className='text-purple-300'>export</code>{" "}
                <code className='text-purple-300'>function</code>{" "}
                <code className='text-yellow-300'>extractMiPropiedad</code>
                <code className='text-slate-400'>(</code>
                <code className='text-blue-300'>item</code>
                <code className='text-slate-400'>:</code>{" "}
                <code className='text-green-400'>HierarchyItem</code>
                <code className='text-slate-400'>):</code>{" "}
                <code className='text-orange-300'>string</code>{" "}
                <code className='text-slate-400'>|</code>{" "}
                <code className='text-orange-300'>null</code>{" "}
                <code className='text-slate-400'>{"{"}</code>
                <br />
                <code className='text-slate-400'> </code>
                <code className='text-purple-300'>return</code>{" "}
                <code className='text-yellow-300'>
                  extractPropertyFromDescription
                </code>
                <code className='text-slate-400'>(</code>
                <code className='text-blue-300'>item</code>
                <code className='text-slate-400'>,</code>{" "}
                <code className='text-green-300'>"miPropiedad"</code>
                <code className='text-slate-400'>);</code>
                <br />
                <code className='text-slate-400'>{"}"}</code>
              </pre>
            </div>
          </li>
          <li>
            Utiliza la nueva función en tus componentes:
            <div className='bg-slate-800 border border-slate-600 rounded-lg p-4 mt-2'>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto leading-relaxed'>
                <code className='text-purple-300'>import</code>{" "}
                <code className='text-slate-400'>{"{"}</code>{" "}
                <code className='text-yellow-300'>extractMiPropiedad</code>{" "}
                <code className='text-slate-400'>{"}"}</code>{" "}
                <code className='text-purple-300'>from</code>{" "}
                <code className='text-green-300'>
                  "@/utils/description-parser"
                </code>
                <br />
                <br />
                <code className='text-purple-300'>export</code>{" "}
                <code className='text-purple-300'>function</code>{" "}
                <code className='text-yellow-300'>MiComponente</code>
                <code className='text-slate-400'>({"{"}</code>{" "}
                <code className='text-blue-300'>item</code>{" "}
                <code className='text-slate-400'>
                  {"}"}: {"{"}
                </code>{" "}
                <code className='text-blue-300'>item</code>
                <code className='text-slate-400'>:</code>{" "}
                <code className='text-green-400'>HierarchyItem</code>{" "}
                <code className='text-slate-400'>{"})"}</code>{" "}
                <code className='text-slate-400'>{"{"}</code>
                <br />
                <code className='text-slate-400'> </code>
                <code className='text-purple-300'>const</code>{" "}
                <code className='text-blue-300'>miPropiedad</code>{" "}
                <code className='text-slate-400'>=</code>{" "}
                <code className='text-yellow-300'>extractMiPropiedad</code>
                <code className='text-slate-400'>(</code>
                <code className='text-blue-300'>item</code>
                <code className='text-slate-400'>)</code>
                <br />
                <code className='text-slate-400'> </code>
                <br />
                <code className='text-slate-400'> </code>
                <code className='text-slate-500'>
                  // Usar la propiedad para renderizar el componente
                </code>
                <br />
                <code className='text-slate-400'> </code>
                <code className='text-purple-300'>return</code>{" "}
                <code className='text-slate-400'>(</code>
                <br />
                <code className='text-slate-400'> </code>
                <code className='text-slate-400'>&lt;</code>
                <code className='text-green-400'>div</code>
                <code className='text-slate-400'>&gt;</code>
                <br />
                <code className='text-slate-400'> </code>
                <code className='text-slate-400'>{"{"}</code>
                <code className='text-blue-300'>miPropiedad</code>{" "}
                <code className='text-slate-400'>&&</code>{" "}
                <code className='text-slate-400'>&lt;</code>
                <code className='text-green-400'>p</code>
                <code className='text-slate-400'>&gt;{"{"}</code>
                <code className='text-blue-300'>miPropiedad</code>
                <code className='text-slate-400'>{"}"}&lt;/</code>
                <code className='text-green-400'>p</code>
                <code className='text-slate-400'>&gt;{"}"}</code>
                <br />
                <code className='text-slate-400'> </code>
                <code className='text-slate-400'>&lt;/</code>
                <code className='text-green-400'>div</code>
                <code className='text-slate-400'>&gt;</code>
                <br />
                <code className='text-slate-400'> </code>
                <code className='text-slate-400'>)</code>
                <br />
                <code className='text-slate-400'>{"}"}</code>
              </pre>
            </div>
          </li>
        </ol>

        <div className='bg-primary/5 border-l-4 border-primary p-4 my-6 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <AlertTriangle className='h-4 w-4' />
            <strong>Importante:</strong> El campo description debe seguir un
            formato específico para que las propiedades puedan ser extraídas
            correctamente. Asegúrate de documentar el formato esperado para los
            usuarios.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
