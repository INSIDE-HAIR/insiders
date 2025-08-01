import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";

export default function AddingComponentsPage() {
  return (
    <div>
      <DocHeader
        title="Añadir Componentes"
        description="Guía paso a paso para añadir nuevos tipos de componentes"
      />

      <DocContent>
        <h2 className="text-2xl font-bold mt-8 mb-4">
          Cómo añadir un nuevo tipo de componente
        </h2>

        <p className="mb-4">
          Esta guía te mostrará cómo añadir un nuevo tipo de componente a la
          plataforma. Seguiremos un proceso paso a paso para integrar
          completamente el componente en el sistema.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          Paso 1: Crear el componente renderizador
        </h3>

        <p className="mb-2">
          Crea un nuevo archivo en <code>components/renderers/</code> para tu
          componente:
        </p>

        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6">
          {`// components/renderers/mi-componente-renderer.tsx
"use client"

import { useState, useEffect } from "react"
import type { HierarchyItem } from "@/types/content-types"

interface MiComponenteRendererProps {
  item: HierarchyItem
}

export function MiComponenteRenderer({ item }: MiComponenteRendererProps) {
  // Lógica específica del componente

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Contenido del componente */}
      <div>Mi nuevo componente: {item.displayName}</div>
    </div>
  )
}`}
        </pre>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          Paso 2: Actualizar el ComponentSelector
        </h3>

        <p className="mb-2">
          Actualiza el <code>ComponentSelector</code> para incluir el nuevo
          tipo:
        </p>

        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6">
          {`// En components/selectors/component-selector.tsx

// 1. Importar el nuevo componente
import { MiComponenteRenderer } from "@/src/components/renderers/mi-componente-renderer"

// 2. Actualizar la función determineComponentType en utils/component-type-utils.tsx
export function determineComponentType(item: HierarchyItem): string {
  // Añadir la lógica para detectar tu nuevo tipo
  if (item.prefixes.includes("mi-componente") || 
      item.name.toLowerCase().includes("mi-componente") ||
      extractPropertyFromDescription(item, "miPropiedad")) {
    return "mi-componente"
  }

  // Resto de la lógica existente...
  return "generic"
}

// 3. Añadir el nuevo caso en el switch
switch (componentType) {
  // Casos existentes...
  case "mi-componente":
    return <MiComponenteRenderer item={item} />
  default:
    return <GenericRenderer item={item} contentType={getContentType(item)} />
  }
}`}
        </pre>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          Paso 3: Actualizar RecursiveContentRenderer
        </h3>

        <p className="mb-2">
          Actualiza el <code>RecursiveContentRenderer</code> para manejar el
          nuevo tipo:
        </p>

        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6">
          {`// En components/content/recursive-content-renderer.tsx

// 1. Identificar elementos del nuevo tipo
const miComponenteItems = directItems.filter(function(item) {
  return item.prefixes.includes("mi-componente") ||
  item.name.toLowerCase().includes("mi-componente") ||
  extractPropertyFromDescription(item, "miPropiedad");
});

// 2. Añadir la sección para renderizar estos elementos
{miComponenteItems.length > 0 && (
  <div className="w-full flex flex-col items-center my-6 max-w-4xl mx-auto">
    {miComponenteItems.map((item) => (
      <div key={item.id} className="w-full max-w-4xl mb-8">
        <ComponentSelector item={item} />
      </div>
    ))}
  </div>
)}`}
        </pre>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          Paso 4: Añadir una función de utilidad (opcional)
        </h3>

        <p className="mb-2">
          Si tu componente utiliza propiedades personalizadas del campo
          description, añade una función de utilidad:
        </p>

        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6">
          {`// En utils/description-parser.ts

/**
* Extrae mi propiedad personalizada desde el campo description
* 
* @param {HierarchyItem} item - El elemento de contenido
* @returns {string|null} El valor de mi propiedad o null si no existe
*/
export function extractMiPropiedad(item: HierarchyItem): string | null {
  return extractPropertyFromDescription(item, "miPropiedad");
}`}
        </pre>

        <h3 className="text-xl font-semibold mt-6 mb-3">
          Paso 5: Documentar el nuevo componente
        </h3>

        <p className="mb-4">
          Es importante documentar el nuevo componente para que los usuarios
          sepan cómo utilizarlo:
        </p>

        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            Actualiza la documentación de usuarios para incluir el nuevo tipo de
            componente
          </li>
          <li>
            Documenta el formato esperado para el campo description (si aplica)
          </li>
          <li>Proporciona ejemplos de uso</li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Ejemplo completo</h3>

        <p className="mb-4">
          Veamos un ejemplo completo de cómo añadir un componente para mostrar
          un contador:
        </p>

        <h4 className="text-lg font-medium mt-4 mb-2">
          1. Crear el componente renderizador
        </h4>

        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-4">
          {`// components/renderers/counter-renderer.tsx
"use client"

import { useState } from "react"
import type { HierarchyItem } from "@/types/content-types"
import { Button } from "@/src/components/ui/button"
import { extractInitialCount } from "@/utils/description-parser"

interface CounterRendererProps {
  item: HierarchyItem
}

export function CounterRenderer({ item }: CounterRendererProps) {
  // Obtener el valor inicial del contador desde el campo description
  const initialCount = extractInitialCount(item) ? parseInt(extractInitialCount(item)!) : 0
  const [count, setCount] = useState(initialCount)

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-zinc-100 rounded-md">
      <h3 className="text-lg font-medium text-center mb-4">{item.displayName}</h3>
      
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => setCount(count - 1)}
          className="h-10 w-10 rounded-full p-0"
        >
          -
        </Button>
        
        <span className="text-2xl font-bold">{count}</span>
        
        <Button 
          variant="outline" 
          onClick={() => setCount(count + 1)}
          className="h-10 w-10 rounded-full p-0"
        >
          +
        </Button>
      </div>
    </div>
  )
}`}
        </pre>

        <h4 className="text-lg font-medium mt-4 mb-2">
          2. Añadir la función de utilidad
        </h4>

        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-4">
          {`// En utils/description-parser.ts

/**
* Extrae el valor inicial del contador desde el campo description
* 
* @param {HierarchyItem} item - El elemento de contenido
* @returns {string|null} El valor inicial o null si no existe
*/
export function extractInitialCount(item: HierarchyItem): string | null {
  return extractPropertyFromDescription(item, "initialCount");
}`}
        </pre>

        <h4 className="text-lg font-medium mt-4 mb-2">
          3. Actualizar el determineComponentType
        </h4>

        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-4">
          {`// En utils/component-type-utils.tsx

export function determineComponentType(item: HierarchyItem): string {
  // Añadir la lógica para detectar el contador
  if (item.prefixes.includes("counter") || 
      item.name.toLowerCase().includes("counter") ||
      extractPropertyFromDescription(item, "initialCount")) {
    return "counter"
  }

  // Resto de la lógica existente...
  return "generic"
}`}
        </pre>

        <h4 className="text-lg font-medium mt-4 mb-2">
          4. Actualizar el ComponentSelector
        </h4>

        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-4">
          {`// En components/selectors/component-selector.tsx

// Importar el nuevo componente
import { CounterRenderer } from "@/src/components/renderers/counter-renderer"

// Añadir el nuevo caso en el switch
switch (componentType) {
  // Casos existentes...
  case "counter":
    return <CounterRenderer item={item} />
  default:
    return <GenericRenderer item={item} contentType={getContentType(item)} />
}`}
        </pre>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
          <p className="text-blue-800">
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
