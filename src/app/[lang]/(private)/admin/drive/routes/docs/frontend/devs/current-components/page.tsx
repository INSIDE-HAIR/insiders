import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Layers, Lightbulb } from "lucide-react";

export default function CurrentComponentsPage() {
  return (
    <div>
      <DocHeader
        title='Componentes Actuales'
        description='Referencia de los componentes disponibles en el sistema'
        icon={Layers}
      />

      <DocContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
          <div>
            <h2 className='text-2xl font-bold mb-4'>
              Componentes de Visualización
            </h2>

            <h3 className='text-xl font-semibold mt-6 mb-3'>VimeoRenderer</h3>
            <p className='mb-4'>
              Renderiza videos de Vimeo a partir de un ID. Soporta reproducción
              directa en la plataforma.
              <br />
              <code>components/renderers/vimeo-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>
              GoogleSlidesRenderer
            </h3>
            <p className='mb-4'>
              Muestra presentaciones de Google Slides incrustadas. Permite
              visualizar las diapositivas sin salir de la plataforma.
              <br />
              <code>components/renderers/google-slides-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>
              GoogleFormRenderer
            </h3>
            <p className='mb-4'>
              Proporciona acceso a formularios de Google mediante un botón que
              redirige al usuario. Utiliza la propiedad <code>formUrl</code> del
              campo description.
              <br />
              <code>components/renderers/google-form-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>ModalRenderer</h3>
            <p className='mb-4'>
              Muestra contenido en una ventana modal. Útil para información
              complementaria que no debe interrumpir el flujo principal.
              <br />
              <code>components/renderers/modal-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>ButtonRenderer</h3>
            <p className='mb-4'>
              Renderiza un botón que enlaza a una URL externa.
              <br />
              <code>components/renderers/button-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>PdfRenderer</h3>
            <p className='mb-4'>
              Muestra archivos PDF con vista previa y opción de descarga.
              <br />
              <code>components/renderers/pdf-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>ImageRenderer</h3>
            <p className='mb-4'>
              Muestra imágenes con vista previa y opción de descarga.
              <br />
              <code>components/renderers/image-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>
              DirectImageRenderer
            </h3>
            <p className='mb-4'>
              Muestra imágenes directamente en la interfaz, con opciones
              adicionales como copiar texto.
              <br />
              <code>components/renderers/direct-image-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>GenericRenderer</h3>
            <p className='mb-4'>
              Renderizador genérico para tipos de contenido no específicos.
              <br />
              <code>components/renderers/generic-renderer.tsx</code>
            </p>
          </div>

          <div>
            <h2 className='text-2xl font-bold mb-4'>
              Componentes de Selección y Renderizado
            </h2>

            <h3 className='text-xl font-semibold mt-6 mb-3'>
              ComponentSelector
            </h3>
            <p className='mb-4'>
              Componente central que determina qué tipo de visualizador usar
              basado en el tipo de contenido.
              <br />
              <code>components/selectors/component-selector.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>
              RecursiveContentRenderer
            </h3>
            <p className='mb-4'>
              Maneja la renderización recursiva de contenido anidado. Organiza
              los elementos según su tipo y prioridad.
              <br />
              <code>components/content/recursive-content-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>ContentRenderer</h3>
            <p className='mb-4'>
              Componente principal que inicia el proceso de renderizado del
              contenido.
              <br />
              <code>components/content/content-renderer.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>ContentGrid</h3>
            <p className='mb-4'>
              Muestra elementos en una cuadrícula, adaptándose al tipo de
              contenido.
              <br />
              <code>components/content/content-grid.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>TabNavigation</h3>
            <p className='mb-4'>
              Gestiona la navegación entre pestañas y mantiene el estado de la
              pestaña seleccionada.
              <br />
              <code>components/navigation/tab-navigation.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>
              SectionNavigation
            </h3>
            <p className='mb-4'>
              Organiza y muestra secciones de contenido con títulos
              descriptivos.
              <br />
              <code>components/navigation/section-navigation.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>AppSidebar</h3>
            <p className='mb-4'>
              Implementa la barra lateral principal de navegación con elementos
              seleccionables.
              <br />
              <code>components/navigation/sidebar/app-sidebar.tsx</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>SidebarToggle</h3>
            <p className='mb-4'>
              Botón para mostrar/ocultar la barra lateral en dispositivos
              móviles.
              <br />
              <code>components/navigation/sidebar/sidebar-toggle.tsx</code>
            </p>
          </div>
        </div>

        <h2 className='text-2xl font-bold mt-8 mb-4'>
          Características Especiales
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='text-xl font-semibold mt-4 mb-3'>
              Función de Copia de Texto
            </h3>
            <p className='mb-4'>
              Cualquier componente puede incluir un botón para copiar texto al
              portapapeles utilizando la propiedad <code>copy</code> en el campo
              description. El texto copiable se muestra en un área con scrollbar
              personalizado (fondo oscuro y handler verde).
            </p>

            <h3 className='text-xl font-semibold mt-4 mb-3'>
              Decodificación de nombres de archivo
            </h3>
            <p className='mb-4'>
              El sistema puede decodificar nombres de archivo con formato
              específico para extraer metadatos como cliente, campaña,
              categoría, idioma y versión.
            </p>
          </div>

          <div>
            <h3 className='text-xl font-semibold mt-4 mb-3'>
              Orden de Renderizado
            </h3>
            <p className='mb-4'>
              El sistema respeta un orden específico de renderizado para
              garantizar una experiencia de usuario coherente:
            </p>
            <ol className='list-decimal pl-5 space-y-1 mb-4'>
              <li>Formularios de Google (prioridad máxima)</li>
              <li>Botones</li>
              <li>Modales</li>
              <li>Pestañas (tabs) y su contenido</li>
              <li>Videos de Vimeo</li>
              <li>Presentaciones de Google Slides</li>
              <li>Secciones</li>
              <li>Otros elementos (imágenes, PDFs, etc.)</li>
            </ol>

            <h3 className='text-xl font-semibold mt-4 mb-3'>
              Detección automática de tipo
            </h3>
            <p className='mb-4'>
              El sistema detecta automáticamente el tipo de componente a
              renderizar basándose en prefijos, nombres y propiedades del campo
              description.
            </p>
          </div>
        </div>

        <h2 className='text-2xl font-bold mt-8 mb-4'>
          Extendiendo los componentes existentes
        </h2>

        <p className='mb-4'>
          Para extender o modificar los componentes existentes, sigue estas
          recomendaciones:
        </p>

        <ul className='list-disc pl-5 space-y-2 mb-6'>
          <li>
            Mantén la coherencia con el estilo y estructura de los componentes
            existentes
          </li>
          <li>Utiliza TypeScript para garantizar la seguridad de tipos</li>
          <li>Documenta adecuadamente los cambios y nuevas funcionalidades</li>
          <li>
            Sigue el patrón de renderizado recursivo para componentes anidados
          </li>
          <li>
            Utiliza las utilidades existentes para procesar metadatos y
            propiedades
          </li>
        </ul>

        <div className='bg-primary/5 border-l-4 border-primary p-4 my-6 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Antes de crear un nuevo componente,
            verifica si puedes extender uno existente. Esto ayuda a mantener la
            coherencia del sistema y reduce la duplicación de código.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
