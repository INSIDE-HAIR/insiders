import { DocHeader } from "@/src/components/marketing-salon/docs/doc-header";
import { DocContent } from "@/src/components/marketing-salon/docs/doc-content";

export default function FileStructurePage() {
  return (
    <div>
      <DocHeader
        title='Estructura de Archivos'
        description='Organización de archivos y carpetas del proyecto'
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-8 mb-4'>
          Estructura de archivos clave
        </h2>

        <p className='mb-4'>
          La plataforma sigue una estructura organizada por funcionalidad, lo
          que facilita la localización y mantenimiento del código.
        </p>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`├── app/
│   ├── marketing-salon/
│   │   └── [id]/
│   │       └── page.tsx         # Página principal con ID de sidebar
│   └── docs/
│       └── marketing-salon/
│           └── page.tsx         # Esta página de documentación
├── components/
│   ├── content/
│   │   ├── content-renderer.tsx      # Renderizador principal de contenido
│   │   ├── recursive-content-renderer.tsx  # Renderizador recursivo
│   │   └── content-grid.tsx          # Cuadrícula para mostrar elementos
│   ├── navigation/
│   │   ├── sidebar/
│   │   │   ├── app-sidebar.tsx       # Barra lateral principal
│   │   │   └── sidebar-toggle.tsx    # Botón para mostrar/ocultar sidebar
│   │   ├── tab-navigation.tsx        # Navegación por pestañas
│   │   └── section-navigation.tsx    # Navegación por secciones
│   ├── renderers/
│   │   ├── vimeo-renderer.tsx        # Renderizador de videos Vimeo
│   │   ├── google-slides-renderer.tsx # Renderizador de Google Slides
│   │   ├── google-form-renderer.tsx  # Renderizador de formularios Google
│   │   ├── modal-renderer.tsx        # Renderizador de modales
│   │   ├── button-renderer.tsx       # Renderizador de botones
│   │   ├── pdf-renderer.tsx          # Renderizador de PDFs
│   │   ├── image-renderer.tsx        # Renderizador de imágenes
│   │   ├── direct-image-renderer.tsx # Renderizador de imágenes directas
│   │   └── generic-renderer.tsx      # Renderizador genérico
│   ├── selectors/
│   │   └── component-selector.tsx    # Selector central de componentes
│   ├── cards/
│   │   └── custom-card.tsx           # Tarjeta personalizada
│   ├── layout/
│   │   ├── content-layout.tsx        # Layout principal de contenido
│   │   └── content-header.tsx        # Encabezado del contenido
│   └── ui/
│       └── image-components/         # Componentes de imágenes
├── contexts/
│   └── content-context.tsx      # Contexto para gestión de estado
├── types/
│   └── content-types.ts         # Definiciones de tipos
└── utils/
    ├── file-decoder.ts          # Decodificador de nombres de archivo
    ├── component-type-utils.tsx # Utilidades para tipos de componentes
    └── description-parser.ts    # Procesador del campo description`}
        </pre>

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

        <div className='bg-blue-50 border-l-4 border-blue-500 p-4 my-6'>
          <p className='text-blue-800'>
            <strong>Consejo:</strong> Al añadir nuevos archivos, sigue las
            convenciones de nomenclatura existentes y colócalos en la carpeta
            adecuada según su funcionalidad.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
