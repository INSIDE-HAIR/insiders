import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { PlusCircle, Lightbulb } from "lucide-react";

export default function AddingComponentsPage() {
  return (
    <div>
      <DocHeader
        title='Añadir Componentes'
        description='Guía paso a paso para añadir nuevos tipos de componentes'
        icon={PlusCircle}
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-8 mb-4'>
          Cómo añadir un nuevo tipo de componente
        </h2>

        <p className='mb-4'>
          Esta guía te mostrará cómo añadir un nuevo tipo de componente a la
          plataforma. Seguiremos un proceso paso a paso para integrar
          completamente el componente en el sistema.
        </p>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Paso 1: Crear el componente renderizador
        </h3>

        <p className='mb-2'>
          Crea un nuevo archivo en <code>components/renderers/</code> para tu
          componente:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // components/renderers/mi-componente-renderer.tsx
            </code>
            <br />
            <code className='text-green-300'>"use client"</code>
            <br />
            <br />
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-yellow-300'>useState</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-yellow-300'>useEffect</code>{" "}
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>"react"</code>
            <br />
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-purple-300'>type</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>{" "}
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>"@/types/content-types"</code>
            <br />
            <br />
            <code className='text-purple-300'>interface</code>{" "}
            <code className='text-green-400'>MiComponenteRendererProps</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <br />
            <code className='text-purple-300'>export</code>{" "}
            <code className='text-purple-300'>function</code>{" "}
            <code className='text-yellow-300'>MiComponenteRenderer</code>
            <code className='text-slate-400'>({"{"}</code>{" "}
            <code className='text-blue-300'>item</code>{" "}
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>MiComponenteRendererProps</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Lógica específica del componente
            </code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-slate-400'>(</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>div</code>{" "}
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>
              "w-full max-w-4xl mx-auto mb-8"
            </code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              {/* Contenido del componente */}
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>div</code>
            <code className='text-slate-400'>{">"}</code>
            <code className='text-slate-300'>Mi nuevo componente: </code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>displayName</code>
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>div</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>div</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>)</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Paso 2: Actualizar el ComponentSelector
        </h3>

        <p className='mb-2'>
          Actualiza el <code>ComponentSelector</code> para incluir el nuevo
          tipo:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // En components/selectors/component-selector.tsx
            </code>
            <br />
            <br />
            <code className='text-slate-500'>
              // 1. Importar el nuevo componente
            </code>
            <br />
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-yellow-300'>MiComponenteRenderer</code>{" "}
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>
              "@/src/components/renderers/mi-componente-renderer"
            </code>
            <br />
            <br />
            <code className='text-slate-500'>
              // 2. Actualizar la función determineComponentType en
              utils/component-type-utils.tsx
            </code>
            <br />
            <code className='text-purple-300'>export</code>{" "}
            <code className='text-purple-300'>function</code>{" "}
            <code className='text-yellow-300'>determineComponentType</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>
            <code className='text-slate-400'>):</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Añadir la lógica para detectar tu nuevo tipo
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>prefixes</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>includes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>"mi-componente"</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>||</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>name</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>toLowerCase</code>
            <code className='text-slate-400'>()</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>includes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>"mi-componente"</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>||</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-yellow-300'>
              extractPropertyFromDescription
            </code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-green-300'>"miPropiedad"</code>
            <code className='text-slate-400'>))</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-green-300'>"mi-componente"</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Resto de la lógica existente...
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-green-300'>"generic"</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <br />
            <code className='text-slate-500'>
              // 3. Añadir el nuevo caso en el switch
            </code>
            <br />
            <code className='text-purple-300'>switch</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>componentType</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>// Casos existentes...</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>case</code>{" "}
            <code className='text-green-300'>"mi-componente"</code>
            <code className='text-slate-400'>:</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>MiComponenteRenderer</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-slate-400'>{"/>"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>default</code>
            <code className='text-slate-400'>:</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>GenericRenderer</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-blue-300'>contentType</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-yellow-300'>getContentType</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>)</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-slate-400'>{"/>"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Paso 3: Actualizar RecursiveContentRenderer
        </h3>

        <p className='mb-2'>
          Actualiza el <code>RecursiveContentRenderer</code> para manejar el
          nuevo tipo:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // En components/content/recursive-content-renderer.tsx
            </code>
            <br />
            <br />
            <code className='text-slate-500'>
              // 1. Identificar elementos del nuevo tipo
            </code>
            <br />
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>miComponenteItems</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-blue-300'>directItems</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>filter</code>
            <code className='text-slate-400'>(</code>
            <code className='text-purple-300'>function</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>prefixes</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>includes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>"mi-componente"</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>||</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>name</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>toLowerCase</code>
            <code className='text-slate-400'>()</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>includes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>"mi-componente"</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>||</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-yellow-300'>
              extractPropertyFromDescription
            </code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-green-300'>"miPropiedad"</code>
            <code className='text-slate-400'>);</code>
            <br />
            <code className='text-slate-400'>{"}"});</code>
            <br />
            <br />
            <code className='text-slate-500'>
              // 2. Añadir la sección para renderizar estos elementos
            </code>
            <br />
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>miComponenteItems</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>length</code>{" "}
            <code className='text-slate-400'>{">"}</code>{" "}
            <code className='text-orange-300'>0</code>{" "}
            <code className='text-slate-400'>&&</code>{" "}
            <code className='text-slate-400'>(</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>div</code>{" "}
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>
              "w-full flex flex-col items-center my-6 max-w-4xl mx-auto"
            </code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>miComponenteItems</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>map</code>
            <code className='text-slate-400'>((</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>{"=>"}</code>{" "}
            <code className='text-slate-400'>(</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>div</code>{" "}
            <code className='text-blue-300'>key</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>id</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>"w-full max-w-4xl mb-8"</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>ComponentSelector</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-slate-400'>{"/>"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>div</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>))</code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>div</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'>)</code>
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Paso 4: Añadir una función de utilidad (opcional)
        </h3>

        <p className='mb-2'>
          Si tu componente utiliza propiedades personalizadas del campo
          description, añade una función de utilidad:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // En utils/description-parser.ts
            </code>
            <br />
            <br />
            <code className='text-green-300'>/**</code>
            <br />
            <code className='text-green-300'>
              * Extrae mi propiedad personalizada desde el campo description
            </code>
            <br />
            <code className='text-green-300'>* </code>
            <br />
            <code className='text-green-300'>* </code>
            <code className='text-blue-300'>@param</code>{" "}
            <code className='text-green-300'>
              {"{"}HierarchyItem{"}"} item - El elemento de contenido
            </code>
            <br />
            <code className='text-green-300'>* </code>
            <code className='text-blue-300'>@returns</code>{" "}
            <code className='text-green-300'>
              {"{"}string|null{"}"} El valor de mi propiedad o null si no existe
            </code>
            <br />
            <code className='text-green-300'>*/</code>
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

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Paso 5: Documentar el nuevo componente
        </h3>

        <p className='mb-4'>
          Es importante documentar el nuevo componente para que los usuarios
          sepan cómo utilizarlo:
        </p>

        <ol className='list-decimal pl-5 space-y-2 mb-6'>
          <li>
            Actualiza la documentación de usuarios para incluir el nuevo tipo de
            componente
          </li>
          <li>
            Documenta el formato esperado para el campo description (si aplica)
          </li>
          <li>Proporciona ejemplos de uso</li>
        </ol>

        <h3 className='text-xl font-semibold mt-6 mb-3'>Ejemplo completo</h3>

        <p className='mb-4'>
          Veamos un ejemplo completo de cómo añadir un componente para mostrar
          un contador:
        </p>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          1. Crear el componente renderizador
        </h4>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // components/renderers/counter-renderer.tsx
            </code>
            <br />
            <code className='text-green-300'>"use client"</code>
            <br />
            <br />
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-yellow-300'>useState</code>{" "}
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>"react"</code>
            <br />
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-purple-300'>type</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>{" "}
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>"@/types/content-types"</code>
            <br />
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-yellow-300'>Button</code>{" "}
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>"@/src/components/ui/button"</code>
            <br />
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-yellow-300'>extractInitialCount</code>{" "}
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>"@/utils/description-parser"</code>
            <br />
            <br />
            <code className='text-purple-300'>interface</code>{" "}
            <code className='text-green-400'>CounterRendererProps</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <br />
            <code className='text-purple-300'>export</code>{" "}
            <code className='text-purple-300'>function</code>{" "}
            <code className='text-yellow-300'>CounterRenderer</code>
            <code className='text-slate-400'>({"{"}</code>{" "}
            <code className='text-blue-300'>item</code>{" "}
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>CounterRendererProps</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Obtener el valor inicial del contador desde el campo
              description
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>initialCount</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-yellow-300'>extractInitialCount</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>?</code>{" "}
            <code className='text-yellow-300'>parseInt</code>
            <code className='text-slate-400'>(</code>
            <code className='text-yellow-300'>extractInitialCount</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>)!</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>0</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-slate-400'>[</code>
            <code className='text-blue-300'>count</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-blue-300'>setCount</code>
            <code className='text-slate-400'>]</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-yellow-300'>useState</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>initialCount</code>
            <code className='text-slate-400'>)</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-slate-400'>(</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>div</code>{" "}
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>
              "w-full max-w-md mx-auto p-4 bg-slate-800 text-white rounded-md
              border border-slate-600"
            </code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>h3</code>{" "}
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>
              "text-lg font-medium text-center mb-4"
            </code>
            <code className='text-slate-400'>{">"}</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>displayName</code>
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>h3</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>div</code>{" "}
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>
              "flex items-center justify-center gap-4"
            </code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>Button</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>variant</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>"outline"</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>onClick</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-slate-400'>()</code>{" "}
            <code className='text-slate-400'>{"=>"}</code>{" "}
            <code className='text-yellow-300'>setCount</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>count</code>{" "}
            <code className='text-slate-400'>-</code>{" "}
            <code className='text-orange-300'>1</code>
            <code className='text-slate-400'>)</code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>"h-10 w-10 rounded-full p-0"</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-300'>-</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>Button</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>span</code>{" "}
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>"text-2xl font-bold"</code>
            <code className='text-slate-400'>{">"}</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>count</code>
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>span</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>Button</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>variant</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>"outline"</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>onClick</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-slate-400'>()</code>{" "}
            <code className='text-slate-400'>{"=>"}</code>{" "}
            <code className='text-yellow-300'>setCount</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>count</code>{" "}
            <code className='text-slate-400'>+</code>{" "}
            <code className='text-orange-300'>1</code>
            <code className='text-slate-400'>)</code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>"h-10 w-10 rounded-full p-0"</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-300'>+</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>Button</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>div</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"</"}</code>
            <code className='text-red-300'>div</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>)</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          2. Añadir la función de utilidad
        </h4>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // En utils/description-parser.ts
            </code>
            <br />
            <br />
            <code className='text-green-300'>/**</code>
            <br />
            <code className='text-green-300'>
              * Extrae el valor inicial del contador desde el campo description
            </code>
            <br />
            <code className='text-green-300'>* </code>
            <br />
            <code className='text-green-300'>* </code>
            <code className='text-blue-300'>@param</code>{" "}
            <code className='text-green-300'>
              {"{"}HierarchyItem{"}"} item - El elemento de contenido
            </code>
            <br />
            <code className='text-green-300'>* </code>
            <code className='text-blue-300'>@returns</code>{" "}
            <code className='text-green-300'>
              {"{"}string|null{"}"} El valor inicial o null si no existe
            </code>
            <br />
            <code className='text-green-300'>*/</code>
            <br />
            <code className='text-purple-300'>export</code>{" "}
            <code className='text-purple-300'>function</code>{" "}
            <code className='text-yellow-300'>extractInitialCount</code>
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
            <code className='text-green-300'>"initialCount"</code>
            <code className='text-slate-400'>);</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          3. Actualizar el determineComponentType
        </h4>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // En utils/component-type-utils.tsx
            </code>
            <br />
            <br />
            <code className='text-purple-300'>export</code>{" "}
            <code className='text-purple-300'>function</code>{" "}
            <code className='text-yellow-300'>determineComponentType</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>
            <code className='text-slate-400'>):</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Añadir la lógica para detectar el contador
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>prefixes</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>includes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>"counter"</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>||</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>name</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>toLowerCase</code>
            <code className='text-slate-400'>()</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>includes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>"counter"</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>||</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-yellow-300'>
              extractPropertyFromDescription
            </code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-green-300'>"initialCount"</code>
            <code className='text-slate-400'>))</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-green-300'>"counter"</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Resto de la lógica existente...
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-green-300'>"generic"</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          4. Actualizar el ComponentSelector
        </h4>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // En components/selectors/component-selector.tsx
            </code>
            <br />
            <br />
            <code className='text-slate-500'>
              // Importar el nuevo componente
            </code>
            <br />
            <code className='text-purple-300'>import</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-yellow-300'>CounterRenderer</code>{" "}
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-purple-300'>from</code>{" "}
            <code className='text-green-300'>
              "@/src/components/renderers/counter-renderer"
            </code>
            <br />
            <br />
            <code className='text-slate-500'>
              // Añadir el nuevo caso en el switch
            </code>
            <br />
            <code className='text-purple-300'>switch</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>componentType</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>// Casos existentes...</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>case</code>{" "}
            <code className='text-green-300'>"counter"</code>
            <code className='text-slate-400'>:</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>CounterRenderer</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-slate-400'>{"/>"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>default</code>
            <code className='text-slate-400'>:</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>return</code>{" "}
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>GenericRenderer</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-blue-300'>contentType</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-yellow-300'>getContentType</code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>)</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-slate-400'>{"/>"}</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Sigue este patrón para añadir cualquier
            tipo de componente nuevo. La clave está en mantener la coherencia
            con el sistema existente y documentar adecuadamente el nuevo
            componente.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
