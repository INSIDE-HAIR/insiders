import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";

export default function DescriptionParserPage() {
  return (
    <div>
      <DocHeader
        title='Campo Description'
        description='Procesamiento del campo Description para propiedades personalizadas'
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

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`// Extraer cualquier propiedad del campo description
export function extractPropertyFromDescription(
item: HierarchyItem, 
propertyName: string
): string | null {
if (!item.description) return null;

try {
  // Múltiples estrategias de parseo
  // 1. Intentar parsear como JSON completo
  try {
    const jsonObj = JSON.parse(item.description)
    if (jsonObj && jsonObj[propertyName]) {
      return jsonObj[propertyName]
    }
  } catch (e) {
    // Si falla, continuamos con otros métodos
  }

  // 2. Usar expresiones regulares para buscar patrones
  // Buscar patrones como &quot;propertyName&quot;:&quot;value&quot; o &quot;propertyName&quot;:&quot;value&quot;
  const regex = new RegExp(\`["']\${propertyName}["']\\s*:\\s*["']([^"']*)["']\`, "i")
  const match = item.description.match(regex)

  if (match && match[1]) {
    return match[1]
  }

  // 3. Intentar parsear como fragmento de JSON
  const wrappedJson = \`{\${item.description.replace(/^"|"$/g, "")}}\`
  try {
    const parsedObj = JSON.parse(wrappedJson)
    if (parsedObj && parsedObj[propertyName]) {
      return parsedObj[propertyName]
    }
  } catch (e) {
    // Si falla, continuamos con otros métodos
  }

  return null
} catch (error) {
  console.error(\`Error parsing description for \${propertyName}\`, error);
  return null;
}
}`}
        </pre>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Funciones específicas para propiedades comunes
        </h3>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`// Extraer URL de formulario
export function extractFormUrl(item: HierarchyItem): string | null {
  return extractPropertyFromDescription(item, "formUrl");
}

// Extraer texto para copiar
export function extractCopyText(item: HierarchyItem): string | null {
  return extractPropertyFromDescription(item, "copy");
}`}
        </pre>

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

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`// En un componente
import { extractFormUrl } from "@/utils/description-parser"

export function GoogleFormRenderer({ item }: { item: HierarchyItem }) {
  // Extraer la URL del formulario
  const formUrl = extractFormUrl(item)
  
  // Usar la URL para renderizar el componente
  return (
    <Button asChild>
      <a href={formUrl} target="_blank" rel="noopener noreferrer">
        Abrir formulario
      </a>
    </Button>
  )
}`}
        </pre>

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
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mt-2'>
              {`/**
* Extrae mi propiedad personalizada desde el campo description
* 
* @param {HierarchyItem} item - El elemento de contenido
* @returns {string|null} El valor de mi propiedad o null si no existe
*/
export function extractMiPropiedad(item: HierarchyItem): string | null {
  return extractPropertyFromDescription(item, "miPropiedad");
}`}
            </pre>
          </li>
          <li>
            Utiliza la nueva función en tus componentes:
            <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mt-2'>
              {`import { extractMiPropiedad } from "@/utils/description-parser"

export function MiComponente({ item }: { item: HierarchyItem }) {
  const miPropiedad = extractMiPropiedad(item)
  
  // Usar la propiedad para renderizar el componente
  return (
    <div>
      {miPropiedad && <p>{miPropiedad}</p>}
    </div>
  )
}`}
            </pre>
          </li>
        </ol>

        <div className='bg-amber-50 border-l-4 border-amber-500 p-4 my-6'>
          <p className='text-amber-800'>
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
