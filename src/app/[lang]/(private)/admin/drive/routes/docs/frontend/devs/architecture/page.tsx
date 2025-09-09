"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { GitBranch, Lightbulb, ArrowDown, Globe, Shield, Zap, Server, Database, Settings, Users, Layout, Eye } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div>
      <DocHeader
        title='Arquitectura del Sistema'
        description='Visión general de la arquitectura y flujo de datos'
        icon={GitBranch}
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

        <h3 className='text-xl font-semibold mt-6 mb-6 text-white'>
          Diagrama de flujo de datos
        </h3>

        <div className='bg-slate-900 border border-slate-600 rounded-lg p-8 overflow-hidden mb-8'>
          <div className='flex flex-col items-center space-y-8 max-w-5xl mx-auto'>
            
            {/* ContentProvider Layer */}
            <div className='w-full max-w-3xl'>
              <div className='bg-primary/30 rounded-xl p-8 text-white border border-primary/60'>
                <div className='flex items-center gap-4 mb-5'>
                  <Database className='h-8 w-8 text-primary' />
                  <h4 className='text-2xl font-bold text-white'>ContentProvider (Context)</h4>
                </div>
                <div className='text-base text-slate-200'>
                  Contexto global que provee datos y funciones de navegación
                </div>
              </div>
            </div>
            
            {/* Arrow Down */}
            <div className='flex justify-center'>
              <ArrowDown className='h-8 w-8 text-slate-400' />
            </div>
            
            {/* ContentLayout Layer */}
            <div className='w-full max-w-3xl'>
              <div className='bg-primary/30 rounded-xl p-8 text-white border border-primary/60'>
                <div className='flex items-center gap-4 mb-5'>
                  <Layout className='h-8 w-8 text-primary' />
                  <h4 className='text-2xl font-bold text-white'>ContentLayout</h4>
                </div>
                <div className='text-base text-slate-200'>
                  Estructura principal del layout de la aplicación
                </div>
              </div>
            </div>
            
            {/* Arrow Down */}
            <div className='flex justify-center'>
              <ArrowDown className='h-8 w-8 text-slate-400' />
            </div>
            
            {/* Navigation Layer */}
            <div className='w-full max-w-4xl'>
              <div className='bg-primary/30 rounded-xl p-8 text-white border border-primary/60'>
                <div className='flex items-center gap-4 mb-6'>
                  <Users className='h-8 w-8 text-primary' />
                  <h4 className='text-2xl font-bold text-white'>Navigation Components</h4>
                </div>
                <div className='text-base text-slate-200 mb-6'>
                  Componentes de navegación y selección de contenido
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='bg-primary/50 rounded-lg p-4 text-center'>
                    <Shield className='h-6 w-6 mx-auto mb-3 text-primary' />
                    <div className='text-sm font-semibold text-white leading-tight'>AppSidebar</div>
                  </div>
                  <div className='bg-primary/50 rounded-lg p-4 text-center'>
                    <Zap className='h-6 w-6 mx-auto mb-3 text-primary' />
                    <div className='text-sm font-semibold text-white leading-tight'>TabNavigation</div>
                  </div>
                  <div className='bg-primary/50 rounded-lg p-4 text-center'>
                    <Settings className='h-6 w-6 mx-auto mb-3 text-primary' />
                    <div className='text-sm font-semibold text-white leading-tight'>SectionNavigation</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Arrow Down */}
            <div className='flex justify-center'>
              <ArrowDown className='h-8 w-8 text-slate-400' />
            </div>
            
            {/* Renderer Layer */}
            <div className='w-full max-w-3xl'>
              <div className='bg-primary/30 rounded-xl p-8 text-white border border-primary/60'>
                <div className='flex items-center gap-4 mb-6'>
                  <Eye className='h-8 w-8 text-primary' />
                  <h4 className='text-2xl font-bold text-white'>Content Renderers</h4>
                </div>
                <div className='text-base text-slate-200 mb-5'>
                  Sistema de renderizado recursivo y selección de componentes
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-primary/50 rounded-lg px-4 py-3 text-sm text-center text-white font-semibold'>ContentRenderer</div>
                  <div className='bg-primary/50 rounded-lg px-4 py-3 text-sm text-center text-white font-semibold'>ComponentSelector</div>
                </div>
              </div>
            </div>
          </div>
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

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-purple-300'>interface</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>id</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>// ID único del elemento</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>name</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>
              // Nombre original del archivo/carpeta
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>originalName</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>
              // Nombre original sin modificaciones
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>displayName</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>
              // Nombre para mostrar en la interfaz
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>description</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>
              // Campo para propiedades personalizadas en formato JSON
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>driveType</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"folder"</code>{" "}
            <code className='text-slate-400'>|</code>{" "}
            <code className='text-green-300'>"file"</code>{" "}
            <code className='text-slate-500'>
              // Tipo de elemento en Google Drive
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>depth</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>number</code>{" "}
            <code className='text-slate-500'>
              // Nivel de profundidad en la jerarquía
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>prefixes</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>string</code>
            <code className='text-slate-400'>[]</code>{" "}
            <code className='text-slate-500'>
              // Array de prefijos extraídos del nombre
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>suffixes</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>string</code>
            <code className='text-slate-400'>[]</code>{" "}
            <code className='text-slate-500'>
              // Array de sufijos extraídos del nombre
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>order</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>number</code>{" "}
            <code className='text-slate-500'>// Orden de visualización</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>mimeType</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>// Tipo MIME del archivo</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>size</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-orange-300'>number</code>{" "}
            <code className='text-slate-500'>
              // Tamaño del archivo en bytes
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>modifiedTime</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>
              // Fecha de última modificación
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>children</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>
            <code className='text-slate-400'>[]</code>{" "}
            <code className='text-slate-500'>
              // Elementos hijos (para carpetas)
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>transformedUrl</code>
            <code className='text-slate-400'>?: {"{"}</code>{" "}
            <code className='text-slate-500'>
              // URLs transformadas para diferentes usos
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>download</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-orange-300'>string</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>preview</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-orange-300'>string</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>embed</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-orange-300'>string</code>
            <br />
            <code className='text-slate-400'> {"}"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>isActive</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-orange-300'>boolean</code>{" "}
            <code className='text-slate-500'>
              // Indica si el elemento está activo
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>formUrl</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>
              // URL específica para formularios
            </code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

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

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // En utils/component-type-utils.tsx
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
              // Verificar prefijos para el nuevo tipo de componente
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
              // Verificar sufijos si es necesario
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>suffixes</code>
            <code className='text-slate-400'>.</code>
            <code className='text-yellow-300'>includes</code>
            <code className='text-slate-400'>(</code>
            <code className='text-green-300'>"mi-sufijo"</code>
            <code className='text-slate-400'>))</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Lógica específica para elementos con este sufijo
            </code>
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
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Sistema de Previsualizaciones
        </h3>

        <p className='mb-4'>
          La plataforma implementa un sistema de previsualizaciones que permite
          asociar imágenes de portada o vistas previas a los archivos
          principales. Este sistema se basa en las siguientes propiedades de la
          interfaz <code>HierarchyItem</code>:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-purple-300'>interface</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>// ... otras propiedades ...</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Propiedades relacionadas con previsualizaciones
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>previewItems</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>
            <code className='text-slate-400'>[]</code>{" "}
            <code className='text-slate-500'>
              // Array de elementos que sirven como previsualizaciones
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>isPreviewOf</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>
              // ID del elemento principal del que este es una previsualización
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>previewPattern</code>
            <code className='text-slate-400'>?:</code>{" "}
            <code className='text-orange-300'>string</code>{" "}
            <code className='text-slate-500'>
              // Patrón utilizado para identificar archivos de previsualización
            </code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

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

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>// Archivo principal</code>
            <br />
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>"id"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"file-123"</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>"name"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>
              "01_image_Documento_Principal"
            </code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>"displayName"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"Documento Principal"</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>"previewItems"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-slate-400'>[</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-blue-300'>"id"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"preview-1"</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-blue-300'>"name"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>
              "01_image_Documento_Principal-P1"
            </code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-slate-500'>...</code>{" "}
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-blue-300'>"id"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"preview-2"</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-blue-300'>"name"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>
              "01_image_Documento_Principal-P2"
            </code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-slate-500'>...</code>{" "}
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>]</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>"previewPattern"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"-P"</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <br />
            <code className='text-slate-500'>
              // Archivo de previsualización
            </code>
            <br />
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>"id"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"preview-1"</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>"name"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>
              "01_image_Documento_Principal-P1"
            </code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>"displayName"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"Documento Principal P1"</code>
            <code className='text-slate-400'>,</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-blue-300'>"isPreviewOf"</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-300'>"file-123"</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
          </pre>
        </div>

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

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-slate-500'>
              // En components/renderers/generic-renderer.tsx
            </code>
            <br />
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-yellow-300'>GenericRenderer</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-slate-400'>({"{"}</code>{" "}
            <code className='text-blue-300'>item</code>{" "}
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-slate-400'>{"{"}</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>:</code>{" "}
            <code className='text-green-400'>HierarchyItem</code>{" "}
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>{"=>"}</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Estados para controlar el carrusel
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-slate-400'>[</code>
            <code className='text-blue-300'>currentCardPreviewIndex</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-blue-300'>setCurrentCardPreviewIndex</code>
            <code className='text-slate-400'>]</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-yellow-300'>useState</code>
            <code className='text-slate-400'>(</code>
            <code className='text-orange-300'>0</code>
            <code className='text-slate-400'>);</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-slate-400'>[</code>
            <code className='text-blue-300'>currentModalPreviewIndex</code>
            <code className='text-slate-400'>,</code>{" "}
            <code className='text-blue-300'>setCurrentModalPreviewIndex</code>
            <code className='text-slate-400'>]</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-yellow-300'>useState</code>
            <code className='text-slate-400'>(</code>
            <code className='text-orange-300'>0</code>
            <code className='text-slate-400'>);</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Verificar si hay múltiples imágenes de previsualización
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>hasMultiplePreviews</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>previewItems</code>{" "}
            <code className='text-slate-400'>&&</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>previewItems</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>length</code>{" "}
            <code className='text-slate-400'>{">"}</code>{" "}
            <code className='text-orange-300'>1</code>
            <code className='text-slate-400'>;</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Obtener la imagen de previsualización actual
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-blue-300'>currentCardPreview</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>previewItems</code>{" "}
            <code className='text-slate-400'>&&</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>previewItems</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>length</code>{" "}
            <code className='text-slate-400'>{">"}</code>{" "}
            <code className='text-orange-300'>0</code>
            <br />
            <code className='text-slate-400'> ?</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>previewItems</code>
            <code className='text-slate-400'>[</code>
            <code className='text-blue-300'>currentCardPreviewIndex</code>
            <code className='text-slate-400'>]</code>
            <br />
            <code className='text-slate-400'> :</code>{" "}
            <code className='text-orange-300'>null</code>
            <code className='text-slate-400'>;</code>
            <br />
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              // Funciones de navegación del carrusel
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>const</code>{" "}
            <code className='text-yellow-300'>nextPreview</code>{" "}
            <code className='text-slate-400'>=</code>{" "}
            <code className='text-slate-400'>()</code>{" "}
            <code className='text-slate-400'>{"=>"}</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-purple-300'>if</code>{" "}
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>previewItems</code>{" "}
            <code className='text-slate-400'>&&</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>previewItems</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>length</code>{" "}
            <code className='text-slate-400'>{">"}</code>{" "}
            <code className='text-orange-300'>0</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>{"{"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-yellow-300'>setCurrentCardPreviewIndex</code>
            <code className='text-slate-400'>((</code>
            <code className='text-blue-300'>prev</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>{"=>"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>(</code>
            <code className='text-blue-300'>prev</code>{" "}
            <code className='text-slate-400'>+</code>{" "}
            <code className='text-orange-300'>1</code>
            <code className='text-slate-400'>)</code>{" "}
            <code className='text-slate-400'>%</code>{" "}
            <code className='text-blue-300'>item</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>previewItems</code>
            <code className='text-slate-400'>!</code>
            <code className='text-slate-400'>.</code>
            <code className='text-blue-300'>length</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>);</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"}"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>;</code>
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
            <code className='text-green-300'>"generic-item"</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-500'>
              {/* Vista de tarjeta con carrusel */}
            </code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>div</code>{" "}
            <code className='text-blue-300'>className</code>
            <code className='text-slate-400'>=</code>
            <code className='text-green-300'>"card"</code>
            <code className='text-slate-400'>{">"}</code>
            <br />
            <code className='text-slate-400'> </code>
            <code className='text-slate-400'>{"<"}</code>
            <code className='text-red-300'>img</code>{" "}
            <code className='text-blue-300'>src</code>
            <code className='text-slate-400'>=</code>
            <code className='text-slate-400'>{"{"}</code>
            <code className='text-blue-300'>currentCardPreview</code>
            <code className='text-slate-400'>?.</code>
            <code className='text-blue-300'>transformedUrl</code>
            <code className='text-slate-400'>?.</code>
            <code className='text-blue-300'>preview</code>{" "}
            <code className='text-slate-400'>||</code>{" "}
            <code className='text-green-300'>''</code>
            <code className='text-slate-400'>{"}"}</code>{" "}
            <code className='text-slate-400'>{"/>"}</code>
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
            <code className='text-slate-400'>);</code>
            <br />
            <code className='text-slate-400'>{"}"}</code>
            <code className='text-slate-400'>;</code>
          </pre>
        </div>

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

        <div className='bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Al extender la
            plataforma, es importante mantener este flujo de datos y renderizado
            para garantizar la coherencia del sistema.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
