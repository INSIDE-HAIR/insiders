import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { FolderTree, Lightbulb } from "lucide-react";

export default function FileStructurePage() {
  return (
    <div>
      <DocHeader
        title='Estructura de Archivos'
        description='Organización de archivos y carpetas del proyecto'
        icon={FolderTree}
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-8 mb-4'>
          Estructura de archivos clave
        </h2>

        <p className='mb-4'>
          La plataforma sigue una estructura organizada por funcionalidad, lo
          que facilita la localización y mantenimiento del código.
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto leading-relaxed'>
            <code className='text-slate-400'>├── </code><code className='text-green-400'>app/</code><br/>
            <code className='text-slate-400'>│   ├── </code><code className='text-blue-300'>marketing-salon/</code><br/>
            <code className='text-slate-400'>│   │   └── </code><code className='text-yellow-300'>[id]/</code><br/>
            <code className='text-slate-400'>│   │       └── </code><code className='text-orange-300'>page.tsx</code>         <code className='text-slate-500'># Página principal con ID de sidebar</code><br/>
            <code className='text-slate-400'>│   └── </code><code className='text-blue-300'>docs/</code><br/>
            <code className='text-slate-400'>│       └── </code><code className='text-blue-300'>marketing-salon/</code><br/>
            <code className='text-slate-400'>│           └── </code><code className='text-orange-300'>page.tsx</code>         <code className='text-slate-500'># Esta página de documentación</code><br/>
            <code className='text-slate-400'>├── </code><code className='text-green-400'>components/</code><br/>
            <code className='text-slate-400'>│   ├── </code><code className='text-purple-300'>content/</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>content-renderer.tsx</code>      <code className='text-slate-500'># Renderizador principal de contenido</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>recursive-content-renderer.tsx</code>  <code className='text-slate-500'># Renderizador recursivo</code><br/>
            <code className='text-slate-400'>│   │   └── </code><code className='text-orange-300'>content-grid.tsx</code>          <code className='text-slate-500'># Cuadrícula para mostrar elementos</code><br/>
            <code className='text-slate-400'>│   ├── </code><code className='text-purple-300'>navigation/</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-cyan-300'>sidebar/</code><br/>
            <code className='text-slate-400'>│   │   │   ├── </code><code className='text-orange-300'>app-sidebar.tsx</code>       <code className='text-slate-500'># Barra lateral principal</code><br/>
            <code className='text-slate-400'>│   │   │   └── </code><code className='text-orange-300'>sidebar-toggle.tsx</code>    <code className='text-slate-500'># Botón para mostrar/ocultar sidebar</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>tab-navigation.tsx</code>        <code className='text-slate-500'># Navegación por pestañas</code><br/>
            <code className='text-slate-400'>│   │   └── </code><code className='text-orange-300'>section-navigation.tsx</code>    <code className='text-slate-500'># Navegación por secciones</code><br/>
            <code className='text-slate-400'>│   ├── </code><code className='text-purple-300'>renderers/</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>vimeo-renderer.tsx</code>        <code className='text-slate-500'># Renderizador de videos Vimeo</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>google-slides-renderer.tsx</code> <code className='text-slate-500'># Renderizador de Google Slides</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>google-form-renderer.tsx</code>  <code className='text-slate-500'># Renderizador de formularios Google</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>modal-renderer.tsx</code>        <code className='text-slate-500'># Renderizador de modales</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>button-renderer.tsx</code>       <code className='text-slate-500'># Renderizador de botones</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>pdf-renderer.tsx</code>          <code className='text-slate-500'># Renderizador de PDFs</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>image-renderer.tsx</code>        <code className='text-slate-500'># Renderizador de imágenes</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>direct-image-renderer.tsx</code> <code className='text-slate-500'># Renderizador de imágenes directas</code><br/>
            <code className='text-slate-400'>│   │   └── </code><code className='text-orange-300'>generic-renderer.tsx</code>      <code className='text-slate-500'># Renderizador genérico</code><br/>
            <code className='text-slate-400'>│   ├── </code><code className='text-purple-300'>selectors/</code><br/>
            <code className='text-slate-400'>│   │   └── </code><code className='text-orange-300'>component-selector.tsx</code>    <code className='text-slate-500'># Selector central de componentes</code><br/>
            <code className='text-slate-400'>│   ├── </code><code className='text-purple-300'>cards/</code><br/>
            <code className='text-slate-400'>│   │   └── </code><code className='text-orange-300'>custom-card.tsx</code>           <code className='text-slate-500'># Tarjeta personalizada</code><br/>
            <code className='text-slate-400'>│   ├── </code><code className='text-purple-300'>layout/</code><br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-orange-300'>content-layout.tsx</code>        <code className='text-slate-500'># Layout principal de contenido</code><br/>
            <code className='text-slate-400'>│   │   └── </code><code className='text-orange-300'>content-header.tsx</code>        <code className='text-slate-500'># Encabezado del contenido</code><br/>
            <code className='text-slate-400'>│   └── </code><code className='text-purple-300'>ui/</code><br/>
            <code className='text-slate-400'>│       └── </code><code className='text-cyan-300'>image-components/</code>         <code className='text-slate-500'># Componentes de imágenes</code><br/>
            <code className='text-slate-400'>├── </code><code className='text-green-400'>contexts/</code><br/>
            <code className='text-slate-400'>│   └── </code><code className='text-orange-300'>content-context.tsx</code>      <code className='text-slate-500'># Contexto para gestión de estado</code><br/>
            <code className='text-slate-400'>├── </code><code className='text-green-400'>types/</code><br/>
            <code className='text-slate-400'>│   └── </code><code className='text-pink-300'>content-types.ts</code>         <code className='text-slate-500'># Definiciones de tipos</code><br/>
            <code className='text-slate-400'>└── </code><code className='text-green-400'>utils/</code><br/>
            <code className='text-slate-400'>    ├── </code><code className='text-pink-300'>file-decoder.ts</code>          <code className='text-slate-500'># Decodificador de nombres de archivo</code><br/>
            <code className='text-slate-400'>    ├── </code><code className='text-orange-300'>component-type-utils.tsx</code> <code className='text-slate-500'># Utilidades para tipos de componentes</code><br/>
            <code className='text-slate-400'>    └── </code><code className='text-pink-300'>description-parser.ts</code>    <code className='text-slate-500'># Procesador del campo description</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Organización por funcionalidad
        </h3>

        <p className='mb-4'>
          La estructura del proyecto está organizada por funcionalidad, lo que
          facilita la localización y mantenimiento del código:
        </p>

        <ul className='list-disc pl-5 space-y-2 mb-6'>
          <li>
            <strong>app/</strong>: Páginas de la aplicación (Next.js App Router)
            <ul className='list-disc pl-5 mt-2'>
              <li>
                <strong>marketing-salon/</strong>: Páginas principales de la
                aplicación
              </li>
              <li>
                <strong>docs/</strong>: Páginas de documentación
              </li>
            </ul>
          </li>
          <li>
            <strong>components/</strong>: Componentes de React organizados por
            funcionalidad
            <ul className='list-disc pl-5 mt-2'>
              <li>
                <strong>content/</strong>: Componentes para renderizar contenido
              </li>
              <li>
                <strong>navigation/</strong>: Componentes de navegación
                (sidebar, tabs, sections)
              </li>
              <li>
                <strong>renderers/</strong>: Componentes específicos para
                renderizar diferentes tipos de contenido
              </li>
              <li>
                <strong>selectors/</strong>: Componentes para seleccionar el
                renderizador adecuado
              </li>
              <li>
                <strong>cards/</strong>: Componentes de tarjetas para mostrar
                contenido
              </li>
              <li>
                <strong>layout/</strong>: Componentes de layout (estructura
                general)
              </li>
              <li>
                <strong>ui/</strong>: Componentes de UI reutilizables
              </li>
            </ul>
          </li>
          <li>
            <strong>contexts/</strong>: Contextos de React para gestión de
            estado
          </li>
          <li>
            <strong>types/</strong>: Definiciones de tipos TypeScript
          </li>
          <li>
            <strong>utils/</strong>: Funciones de utilidad
          </li>
        </ul>

        <h3 className='text-xl font-semibold mt-6 mb-3'>Archivos clave</h3>

        <h4 className='text-lg font-medium mt-4 mb-2'>Contexto y estado</h4>

        <ul className='list-disc pl-5 space-y-2 mb-4'>
          <li>
            <strong>contexts/content-context.tsx</strong>: Contexto principal
            que proporciona acceso a los datos de contenido y funciones de
            navegación.
          </li>
          <li>
            <strong>types/content-types.ts</strong>: Definiciones de tipos para
            los elementos de contenido.
          </li>
        </ul>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Componentes principales
        </h4>

        <ul className='list-disc pl-5 space-y-2 mb-4'>
          <li>
            <strong>components/layout/content-layout.tsx</strong>: Layout
            principal de la aplicación.
          </li>
          <li>
            <strong>components/content/content-renderer.tsx</strong>: Inicia el
            proceso de renderizado.
          </li>
          <li>
            <strong>components/content/recursive-content-renderer.tsx</strong>:
            Maneja la renderización recursiva.
          </li>
          <li>
            <strong>components/selectors/component-selector.tsx</strong>:
            Selecciona el componente adecuado.
          </li>
        </ul>

        <h4 className='text-lg font-medium mt-4 mb-2'>Navegación</h4>

        <ul className='list-disc pl-5 space-y-2 mb-4'>
          <li>
            <strong>components/navigation/sidebar/app-sidebar.tsx</strong>:
            Barra lateral principal.
          </li>
          <li>
            <strong>components/navigation/tab-navigation.tsx</strong>:
            Navegación por pestañas.
          </li>
          <li>
            <strong>components/navigation/section-navigation.tsx</strong>:
            Navegación por secciones.
          </li>
        </ul>

        <h4 className='text-lg font-medium mt-4 mb-2'>Utilidades</h4>

        <ul className='list-disc pl-5 space-y-2 mb-4'>
          <li>
            <strong>utils/file-decoder.ts</strong>: Decodifica nombres de
            archivo para extraer metadatos.
          </li>
          <li>
            <strong>utils/description-parser.ts</strong>: Procesa el campo
            description para extraer propiedades.
          </li>
          <li>
            <strong>utils/component-type-utils.tsx</strong>: Determina el tipo
            de componente a renderizar.
          </li>
        </ul>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Convenciones de nomenclatura
        </h3>

        <ul className='list-disc pl-5 space-y-2 mb-6'>
          <li>
            <strong>Archivos de componentes</strong>: Utilizan kebab-case (ej:{" "}
            <code>content-renderer.tsx</code>)
          </li>
          <li>
            <strong>Nombres de componentes</strong>: Utilizan PascalCase (ej:{" "}
            <code>ContentRenderer</code>)
          </li>
          <li>
            <strong>Archivos de utilidades</strong>: Utilizan kebab-case (ej:{" "}
            <code>file-decoder.ts</code>)
          </li>
          <li>
            <strong>Funciones de utilidad</strong>: Utilizan camelCase (ej:{" "}
            <code>extractFormUrl</code>)
          </li>
          <li>
            <strong>Tipos</strong>: Utilizan PascalCase (ej:{" "}
            <code>HierarchyItem</code>)
          </li>
        </ul>

        <div className='bg-primary/5 border-l-4 border-primary p-4 my-6 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Al añadir nuevos archivos, sigue las
            convenciones de nomenclatura existentes y colócalos en la carpeta
            adecuada según su funcionalidad.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
