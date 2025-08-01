"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";

export default function ArchitecturePage() {
  return (
    <div>
      <DocHeader
        title='Arquitectura del Sistema'
        description='Visión general de la arquitectura y flujo de datos'
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-8 mb-4'>Arquitectura general</h2>

        <p className='mb-4'>
          La plataforma utiliza una arquitectura basada en componentes con
          Next.js y React. El flujo de datos y renderizado sigue estos
          principios:
        </p>

        <ol className='list-decimal pl-5 space-y-2 mb-6'>
          <li>
            <strong>Centralización de componentes</strong>: El{" "}
            <code>ComponentSelector</code> es el punto central para seleccionar
            qué componente renderizar basado en el tipo de contenido.
          </li>
          <li>
            <strong>Renderizado recursivo</strong>: El{" "}
            <code>RecursiveContentRenderer</code> maneja la renderización de
            contenido anidado (tabs dentro de tabs, secciones, etc.).
          </li>
          <li>
            <strong>Navegación por estado</strong>: El{" "}
            <code>ContentContext</code> mantiene el estado de navegación
            (sidebar, tab, sección seleccionados).
          </li>
        </ol>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Diagrama de flujo de datos
        </h3>

        <div className='border border-zinc-200 rounded-md p-4 mb-6'>
          <pre className='text-sm overflow-x-auto'>
            {`ContentProvider (Context)
  ↓
ContentLayout
  ↓
  ├── AppSidebar → Selección de elemento de sidebar
  │                 ↓
  └── ContentRenderer → RecursiveContentRenderer
                         ↓
                         ├── TabNavigation → Selección de pestaña
                         │                    ↓
                         ├── SectionNavigation → Selección de sección
                         │                        ↓
                         └── ComponentSelector → Componente específico`}
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Componentes principales
        </h3>

        <ul className='list-disc pl-5 space-y-2 mb-6'>
          <li>
            <strong>ContentProvider</strong>: Contexto que proporciona acceso a
            los datos de contenido y funciones de navegación.
          </li>
          <li>
            <strong>ContentLayout</strong>: Componente principal que estructura
            el layout de la aplicación.
          </li>
          <li>
            <strong>AppSidebar</strong>: Barra lateral que muestra los elementos
            de navegación principal.
          </li>
          <li>
            <strong>ContentRenderer</strong>: Inicia el proceso de renderizado
            del contenido seleccionado.
          </li>
          <li>
            <strong>RecursiveContentRenderer</strong>: Maneja la renderización
            recursiva de contenido anidado.
          </li>
          <li>
            <strong>ComponentSelector</strong>: Determina qué componente
            específico renderizar basado en el tipo de contenido.
          </li>
        </ul>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Flujo de renderizado
        </h3>

        <ol className='list-decimal pl-5 space-y-2 mb-6'>
          <li>
            El usuario selecciona un elemento en la barra lateral (AppSidebar)
          </li>
          <li>ContentContext actualiza el estado de navegación</li>
          <li>ContentRenderer inicia el proceso de renderizado</li>
          <li>
            RecursiveContentRenderer procesa el contenido de forma jerárquica:
            <ol className='list-decimal pl-5 mt-2'>
              <li>Renderiza formularios de Google (prioridad máxima)</li>
              <li>Renderiza botones</li>
              <li>Renderiza modales</li>
              <li>Renderiza pestañas (tabs) y su contenido</li>
              <li>Renderiza videos de Vimeo</li>
              <li>Renderiza presentaciones de Google Slides</li>
              <li>Renderiza secciones</li>
              <li>Renderiza otros elementos (imágenes, PDFs, etc.)</li>
            </ol>
          </li>
          <li>
            ComponentSelector determina el componente específico para cada
            elemento
          </li>
          <li>Se renderiza el componente final con sus propiedades</li>
        </ol>

        <h3 className='text-xl font-semibold mt-6 mb-3'>Gestión de estado</h3>

        <p className='mb-4'>
          El estado de la aplicación se gestiona principalmente a través del
          ContentContext, que proporciona:
        </p>

        <ul className='list-disc pl-5 space-y-2 mb-6'>
          <li>Acceso a los datos de contenido</li>
          <li>Estado de navegación (sidebar, tab, sección seleccionados)</li>
          <li>Funciones para actualizar la navegación</li>
          <li>Funciones para obtener elementos por ID o tipo</li>
        </ul>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Estructura de datos de HierarchyItem
        </h3>

        <p className='mb-4'>
          La interfaz <code>HierarchyItem</code> define la estructura de datos
          que se pasa a través de los componentes:
        </p>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`interface HierarchyItem {
 id: string                  // ID único del elemento
 name: string                // Nombre original del archivo/carpeta
 originalName: string        // Nombre original sin modificaciones
 displayName: string         // Nombre para mostrar en la interfaz
 description?: string        // Campo para propiedades personalizadas en formato JSON
 driveType: "folder" | "file" // Tipo de elemento en Google Drive
 depth: number               // Nivel de profundidad en la jerarquía
 prefixes: string[]          // Array de prefijos extraídos del nombre
 suffixes: string[]          // Array de sufijos extraídos del nombre
 order: number               // Orden de visualización
 mimeType: string            // Tipo MIME del archivo
 size?: number               // Tamaño del archivo en bytes
 modifiedTime: string        // Fecha de última modificación
 children?: HierarchyItem[]    // Elementos hijos (para carpetas)
 transformedUrl?: {          // URLs transformadas para diferentes usos
   download?: string
   preview?: string
   embed?: string
 }
 isActive?: boolean          // Indica si el elemento está activo
 formUrl?: string            // URL específica para formularios
}`}
        </pre>

        <h4 className='text-lg font-medium mt-4 mb-2'>Prefijos y Sufijos</h4>

        <p className='mb-4'>
          Los arrays <code>prefixes</code> y <code>suffixes</code> son
          fundamentales para determinar el tipo de componente a renderizar:
        </p>

        <ul className='list-disc pl-5 space-y-2 mb-6'>
          <li>
            <strong>prefixes</strong>: Contiene los prefijos extraídos del
            nombre del archivo/carpeta. Por ejemplo, para un archivo llamado{" "}
            <code>01_button_Enlace.txt</code>, el array <code>prefixes</code>{" "}
            contendrá <code>[&quot;order&quot;, &quot;button&quot;]</code>.
          </li>
          <li>
            <strong>suffixes</strong>: Contiene los sufijos extraídos del
            nombre. Por ejemplo, para un archivo llamado{" "}
            <code>01_tab_Contenido_inactive</code>, el array{" "}
            <code>suffixes</code> contendrá <code>[&quot;inactive&quot;]</code>.
          </li>
        </ul>

        <p className='mb-4'>
          Al añadir un nuevo tipo de componente, es importante considerar cómo
          se detectará a través de estos arrays. Generalmente, se añade una
          nueva condición en la función <code>determineComponentType</code> que
          verifica si el elemento tiene un prefijo específico.
        </p>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`// En utils/component-type-utils.tsx
export function determineComponentType(item: HierarchyItem): string {
 // Verificar prefijos para el nuevo tipo de componente
 if (item.prefixes.includes("mi-componente")) {
   return "mi-componente"
 }
 
 // Verificar sufijos si es necesario
 if (item.suffixes.includes("mi-sufijo")) {
   // Lógica específica para elementos con este sufijo
 }
 
 // Resto de la lógica existente...
}`}
        </pre>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Sistema de Previsualizaciones
        </h3>

        <p className='mb-4'>
          La plataforma implementa un sistema de previsualizaciones que permite
          asociar imágenes de portada o vistas previas a los archivos
          principales. Este sistema se basa en las siguientes propiedades de la
          interfaz <code>HierarchyItem</code>:
        </p>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`interface HierarchyItem {
  // ... otras propiedades ...
  
  // Propiedades relacionadas con previsualizaciones
  previewItems?: HierarchyItem[]  // Array de elementos que sirven como previsualizaciones
  isPreviewOf?: string          // ID del elemento principal del que este es una previsualización
  previewPattern?: string       // Patrón utilizado para identificar archivos de previsualización
}`}
        </pre>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Funcionamiento del Sistema de Previsualizaciones
        </h4>

        <p className='mb-4'>
          El sistema de previsualizaciones funciona de la siguiente manera:
        </p>

        <ol className='list-decimal pl-5 space-y-2 mb-6'>
          <li>
            <strong>Identificación de archivos de previsualización</strong>: Los
            archivos con sufijos como <code>-P1</code>, <code>-P2</code>, etc.
            son identificados como archivos de previsualización durante el
            procesamiento inicial de los datos.
          </li>
          <li>
            <strong>Asociación con archivos principales</strong>: Cada archivo
            de previsualización se asocia con su archivo principal
            correspondiente mediante la propiedad <code>isPreviewOf</code>, que
            contiene el ID del archivo principal.
          </li>
          <li>
            <strong>Agrupación de previsualizaciones</strong>: Los archivos
            principales almacenan referencias a sus archivos de previsualización
            en el array <code>previewItems</code>.
          </li>
          <li>
            <strong>Patrón de previsualización</strong>: La propiedad{" "}
            <code>previewPattern</code> almacena el patrón utilizado para
            identificar los archivos de previsualización (por ejemplo,{" "}
            <code>-P</code>).
          </li>
        </ol>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Ejemplo de Estructura de Datos
        </h4>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`// Archivo principal
{
  "id": "file-123",
  "name": "01_image_Documento_Principal",
  "displayName": "Documento Principal",
  "previewItems": [
    { "id": "preview-1", "name": "01_image_Documento_Principal-P1", ... },
    { "id": "preview-2", "name": "01_image_Documento_Principal-P2", ... }
  ],
  "previewPattern": "-P"
}

// Archivo de previsualización
{
  "id": "preview-1",
  "name": "01_image_Documento_Principal-P1",
  "displayName": "Documento Principal P1",
  "isPreviewOf": "file-123"
}`}
        </pre>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Sistema de Carrusel para Múltiples Previsualizaciones
        </h4>

        <p className='mb-4'>
          El componente <code>generic-renderer</code> implementa un sistema de
          carrusel para mostrar múltiples imágenes de previsualización:
        </p>

        <ol className='list-decimal pl-5 space-y-2 mb-6'>
          <li>
            <strong>Detección automática</strong>: El componente detecta
            automáticamente si un elemento tiene múltiples imágenes de
            previsualización (<code>previewItems.length {`>`} 1</code>) y
            muestra los controles del carrusel solo cuando es necesario.
          </li>
          <li>
            <strong>Carrusel en vista de tarjeta</strong>: En la vista de
            tarjeta, se muestran botones de navegación izquierda/derecha e
            indicadores de posición para navegar entre las imágenes de
            previsualización.
          </li>
          <li>
            <strong>Carrusel en vista modal</strong>: Al abrir el modal, se
            muestra un carrusel más grande con controles de navegación e
            indicadores de posición para una mejor experiencia de visualización.
          </li>
          <li>
            <strong>Sincronización entre vistas</strong>: Al abrir el modal, se
            sincroniza la imagen de previsualización seleccionada en la tarjeta
            con la mostrada en el modal.
          </li>
          <li>
            <strong>Estados de carga</strong>: Se muestran indicadores de carga
            durante la transición entre imágenes para mejorar la experiencia de
            usuario.
          </li>
        </ol>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Implementación del Carrusel
        </h4>

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`// En components/renderers/generic-renderer.tsx
const GenericRenderer = ({ item }: { item: HierarchyItem }) => {
  // Estados para controlar el carrusel
  const [currentCardPreviewIndex, setCurrentCardPreviewIndex] = useState(0);
  const [currentModalPreviewIndex, setCurrentModalPreviewIndex] = useState(0);
  
  // Verificar si hay múltiples imágenes de previsualización
  const hasMultiplePreviews = item.previewItems && item.previewItems.length > 1;
  
  // Obtener la imagen de previsualización actual
  const currentCardPreview = item.previewItems && item.previewItems.length > 0 
    ? item.previewItems[currentCardPreviewIndex] 
    : null;
    
  // Funciones de navegación del carrusel
  const nextPreview = () => {
    if (item.previewItems && item.previewItems.length > 0) {
      setCurrentCardPreviewIndex((prev) => 
        (prev + 1) % item.previewItems!.length
      );
    }
  };
  
  const prevPreview = () => {
    if (item.previewItems && item.previewItems.length > 0) {
      setCurrentCardPreviewIndex((prev) => 
        (prev - 1 + item.previewItems!.length) % item.previewItems!.length
      );
    }
  };
  
  return (
    <div className="generic-item">
      {/* Vista de tarjeta con carrusel */}
      <div className="card">
        <img src={currentCardPreview?.transformedUrl?.preview || ''} />
        
        {/* Controles del carrusel */}
        {hasMultiplePreviews && (
          <>
            <button onClick={prevPreview}>
              <ChevronLeft />
            </button>
            <button onClick={nextPreview}>
              <ChevronRight />
            </button>
            
            {/* Indicadores de posición */}
            <div className="indicators">
              {item.previewItems?.map((_, index) => (
                <div 
                  key={index} 
                  className={index === currentCardPreviewIndex ? 'active' : ''}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}`}
        </pre>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Consideraciones para Desarrolladores
        </h4>

        <ul className='list-disc pl-5 space-y-2 mb-6'>
          <li>
            <strong>Convención de nomenclatura</strong>: Para que un archivo sea
            reconocido como previsualización, debe seguir el patrón de
            nomenclatura establecido (sufijo <code>-P1</code>, <code>-P2</code>,
            etc.).
          </li>
          <li>
            <strong>Orden de previsualizaciones</strong>: El orden de las
            previsualizaciones en el array <code>previewItems</code> determina
            qué imagen se muestra primero. Generalmente, se ordenan según el
            número en el sufijo (<code>-P1</code> antes que <code>-P2</code>).
          </li>
          <li>
            <strong>Tipos de archivo soportados</strong>: Aunque cualquier tipo
            de archivo puede tener previsualizaciones, es más común y útil para
            archivos como documentos, presentaciones y archivos multimedia.
          </li>
          <li>
            <strong>Rendimiento</strong>: Las imágenes de previsualización se
            cargan bajo demanda para optimizar el rendimiento, especialmente en
            vistas de tarjeta donde solo se muestra la primera imagen.
          </li>
          <li>
            <strong>Interacción del carrusel</strong>: Los controles del
            carrusel utilizan la propagación de eventos para evitar que los
            clics en los botones de navegación abran el modal.
          </li>
          <li>
            <strong>Accesibilidad</strong>: Los controles del carrusel incluyen
            indicadores visuales para mostrar la posición actual, mejorando la
            experiencia de usuario.
          </li>
        </ul>

        <div className='bg-blue-50 border-l-4 border-blue-500 p-4 my-6'>
          <p className='text-blue-800'>
            <strong>Consejo:</strong> Al extender la plataforma, es importante
            mantener este flujo de datos y renderizado para garantizar la
            coherencia del sistema.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
