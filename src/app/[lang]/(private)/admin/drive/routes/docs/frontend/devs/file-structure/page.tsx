import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { MermaidDiagram } from "@/src/components/drive/docs/mermaid-diagram";
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

        <MermaidDiagram
          chart={`
flowchart TD
    ROOT[Proyecto Frontend] --> APP[app/]
    ROOT --> COMPONENTS[components/]
    ROOT --> CONTEXTS[contexts/]
    ROOT --> TYPES[types/]
    ROOT --> UTILS[utils/]
    
    APP --> MARKETING[marketing-salon/]
    APP --> DOCS[docs/]
    
    MARKETING --> PAGE_ID["[id]/page.tsx"]
    DOCS --> DOC_MARKETING[marketing-salon/page.tsx]
    
    COMPONENTS --> CONTENT[content/]
    COMPONENTS --> NAVIGATION[navigation/]
    COMPONENTS --> RENDERERS[renderers/]
    COMPONENTS --> SELECTORS[selectors/]
    COMPONENTS --> CARDS[cards/]
    COMPONENTS --> LAYOUT[layout/]
    COMPONENTS --> UI[ui/]
    
    CONTENT --> CONTENT_RENDERER[content-renderer.tsx]
    CONTENT --> RECURSIVE_RENDERER[recursive-content-renderer.tsx]
    CONTENT --> CONTENT_GRID[content-grid.tsx]
    
    NAVIGATION --> SIDEBAR[sidebar/]
    NAVIGATION --> TAB_NAV[tab-navigation.tsx]
    NAVIGATION --> SECTION_NAV[section-navigation.tsx]
    
    SIDEBAR --> APP_SIDEBAR[app-sidebar.tsx]
    SIDEBAR --> SIDEBAR_TOGGLE[sidebar-toggle.tsx]
    
    RENDERERS --> VIMEO_R[vimeo-renderer.tsx]
    RENDERERS --> SLIDES_R[google-slides-renderer.tsx]
    RENDERERS --> FORM_R[google-form-renderer.tsx]
    RENDERERS --> MODAL_R[modal-renderer.tsx]
    RENDERERS --> BUTTON_R[button-renderer.tsx]
    RENDERERS --> PDF_R[pdf-renderer.tsx]
    RENDERERS --> IMAGE_R[image-renderer.tsx]
    RENDERERS --> DIRECT_IMAGE_R[direct-image-renderer.tsx]
    RENDERERS --> GENERIC_R[generic-renderer.tsx]
    
    SELECTORS --> COMPONENT_SELECTOR[component-selector.tsx]
    
    CARDS --> CUSTOM_CARD[custom-card.tsx]
    
    LAYOUT --> CONTENT_LAYOUT[content-layout.tsx]
    LAYOUT --> CONTENT_HEADER[content-header.tsx]
    
    UI --> IMAGE_COMPONENTS[image-components/]
    
    CONTEXTS --> CONTENT_CONTEXT[content-context.tsx]
    
    TYPES --> CONTENT_TYPES[content-types.ts]
    
    UTILS --> FILE_DECODER[file-decoder.ts]
    UTILS --> COMPONENT_TYPE_UTILS[component-type-utils.tsx]
    UTILS --> DESCRIPTION_PARSER[description-parser.ts]
    
    classDef appClass fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef componentClass fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    classDef subComponentClass fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    classDef fileClass fill:#f59e0b,stroke:#d97706,stroke-width:1px,color:#fff
    classDef utilClass fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff
    
    class ROOT,APP,MARKETING,DOCS appClass
    class COMPONENTS,CONTENT,NAVIGATION,RENDERERS,SELECTORS,CARDS,LAYOUT,UI componentClass
    class SIDEBAR,IMAGE_COMPONENTS subComponentClass
    class PAGE_ID,DOC_MARKETING,CONTENT_RENDERER,RECURSIVE_RENDERER,CONTENT_GRID,TAB_NAV,SECTION_NAV,APP_SIDEBAR,SIDEBAR_TOGGLE,VIMEO_R,SLIDES_R,FORM_R,MODAL_R,BUTTON_R,PDF_R,IMAGE_R,DIRECT_IMAGE_R,GENERIC_R,COMPONENT_SELECTOR,CUSTOM_CARD,CONTENT_LAYOUT,CONTENT_HEADER,CONTENT_CONTEXT,CONTENT_TYPES fileClass
    class CONTEXTS,TYPES,UTILS,FILE_DECODER,COMPONENT_TYPE_UTILS,DESCRIPTION_PARSER utilClass
          `}
          className="mb-8"
        />

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
