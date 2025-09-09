"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { ArrowLeft, Layers, FileText, PlusCircle, Eye, Puzzle, Lightbulb, Folder } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function ComponentTypesPage() {
  return (
    <div>
      <DocHeader
        title='Tipos de Componentes'
        description='Componentes disponibles y cómo utilizarlos'
        icon={Puzzle}
      />

      <DocContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
          <div>
            <h2 className='text-2xl font-bold mb-4 flex items-center gap-3 text-white'>
              <Layers className='h-6 w-6 text-primary' />
              Componentes de navegación
            </h2>

            <h3 className='text-xl font-semibold mt-6 mb-3'>Sidebar</h3>
            <p className='mb-4'>
              Las carpetas con prefijo <code>sidebar</code> aparecen en la barra
              lateral izquierda. El orden se determina por el número de prefijo.
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>Tabs (Pestañas)</h3>
            <p className='mb-4'>
              Las carpetas con prefijo <code>tab</code> dentro de una carpeta{" "}
              <code>tabs</code> se muestran como pestañas. El contenido de la
              pestaña seleccionada se muestra debajo.
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>
              Sections (Secciones)
            </h3>
            <p className='mb-4'>
              Las carpetas con prefijo <code>section</code> se muestran como
              secciones con título. Pueden estar dentro de pestañas o
              directamente en una carpeta sidebar.
            </p>
          </div>

          <div>
            <h2 className='text-2xl font-bold mb-4 flex items-center gap-3 text-white'>
              <FileText className='h-6 w-6 text-primary' />
              Componentes de contenido
            </h2>

            <h3 className='text-xl font-semibold mt-6 mb-3'>
              Buttons (Botones)
            </h3>
            <p className='mb-4'>
              Archivos de texto con prefijo <code>button</code>. El contenido
              del archivo debe ser una URL. Ejemplo:{" "}
              <code>01_button_Enlace de formulario.txt</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>Vimeo Videos</h3>
            <p className='mb-4'>
              Archivos de texto con prefijo <code>vimeo</code> o que incluyan
              &quot;vimeo&quot; en el nombre. El ID de Vimeo se extrae del
              nombre o del contenido del archivo. Ejemplo:{" "}
              <code>01_vimeo_1053382395.txt</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>Google Slides</h3>
            <p className='mb-4'>
              Presentaciones de Google con prefijo <code>googleSlide</code> o
              archivos con tipo MIME de presentación de Google. Ejemplo:{" "}
              <code>03_googleSlide_PLAN DE MKT-MARZO 2025</code>
            </p>

            <h3 className='text-xl font-semibold mt-6 mb-3'>Google Forms</h3>
            <p className='mb-4'>
              Formularios de Google con prefijo <code>googleForm</code> o con la
              propiedad <code>formUrl</code> en el campo description. Ejemplo:{" "}
              <code>01_googleForm_PLAN MKT GRUPAL Marzo 2025</code>
            </p>
          </div>
        </div>

        <h2 className='text-2xl font-bold mt-8 mb-4 flex items-center gap-3 text-white'>
          <PlusCircle className='h-6 w-6 text-primary' />
          Componentes adicionales
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='text-xl font-semibold mt-4 mb-3'>
              Archivos con texto copiable
            </h3>
            <p className='mb-4'>
              Cualquier archivo que incluya la propiedad <code>copy</code> en su
              campo description mostrará un botón para copiar el texto al
              portapapeles y una vista previa del contenido.
            </p>

            <h3 className='text-xl font-semibold mt-4 mb-3'>Modales</h3>
            <p className='mb-4'>
              Carpetas con prefijo <code>modal</code>. Al hacer clic en el botón
              del modal, se muestra una ventana emergente con el contenido de la
              carpeta.
            </p>
          </div>

          <div>
            <h3 className='text-xl font-semibold mt-4 mb-3'>
              Archivos PDF e imágenes
            </h3>
            <p className='mb-4'>
              Se muestran como tarjetas con vista previa y opción de descarga.
              Se agrupan automáticamente por tipo.
            </p>

            <h3 className='text-xl font-semibold mt-4 mb-3'>
              Elementos inactivos
            </h3>
            <p className='mb-4'>
              Cualquier elemento con el sufijo <code>_inactive</code> no se
              mostrará en la interfaz, pero se mantendrá en la estructura para
              uso futuro.
            </p>
          </div>
        </div>

        <h2 className='text-2xl font-bold mt-8 mb-4 flex items-center gap-3 text-white'>
          <Eye className='h-6 w-6 text-primary' />
          Ejemplos visuales
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <div className='border border-slate-600 rounded-md overflow-hidden bg-slate-800/50'>
            <div className='bg-slate-700 px-4 py-2 font-medium border-b border-slate-600 text-slate-200'>
              Ejemplo de Tabs
            </div>
            <div className='p-6'>
              <div className='w-full bg-slate-800 rounded-md border border-slate-600 flex items-center justify-center p-4'>
                <div className='text-center'>
                  <div className='flex space-x-2 mb-4 justify-center'>
                    <div className='px-4 py-2 bg-emerald-600 text-white rounded-t-md text-sm font-medium'>
                      Información
                    </div>
                    <div className='px-4 py-2 bg-slate-600 text-slate-300 rounded-t-md text-sm'>
                      Recursos
                    </div>
                    <div className='px-4 py-2 bg-slate-600 text-slate-300 rounded-t-md text-sm'>
                      Contacto
                    </div>
                  </div>
                  <div className='w-64 h-16 bg-slate-700 rounded border border-slate-600 mx-auto flex items-center justify-center text-slate-300'>
                    Contenido de Información
                  </div>
                </div>
              </div>
              <p className='mt-2 text-sm text-slate-300 font-medium'>
                Las pestañas permiten organizar contenido relacionado en una
                misma vista.
              </p>
            </div>
          </div>

          <div className='border border-slate-600 rounded-md overflow-hidden bg-slate-800/50'>
            <div className='bg-slate-700 px-4 py-2 font-medium border-b border-slate-600 text-slate-200'>
              Ejemplo de Secciones
            </div>
            <div className='p-6'>
              <div className='w-full bg-slate-800 rounded-md border border-slate-600 flex items-center justify-center p-4'>
                <div className='w-full max-w-sm mx-auto'>
                  <div className='mb-3'>
                    <div className='text-left text-sm font-medium text-slate-300 mb-2 flex items-center gap-2'>
                      <Folder className='h-4 w-4 text-emerald-400' />
                      Videos
                    </div>
                    <div className='w-full h-12 bg-slate-700 rounded border border-slate-600 flex items-center px-3 py-3 gap-2'>
                      <FileText className='h-4 w-4 text-blue-400 flex-shrink-0' />
                      <span className='text-slate-300 text-xs truncate'>01_vimeo_tutorial.txt</span>
                    </div>
                  </div>
                  <div className='mb-3'>
                    <div className='text-left text-sm font-medium text-slate-300 mb-2 flex items-center gap-2'>
                      <Folder className='h-4 w-4 text-emerald-400' />
                      Formularios
                    </div>
                    <div className='w-full h-12 bg-slate-700 rounded border border-slate-600 flex items-center px-3 py-3 gap-2'>
                      <FileText className='h-4 w-4 text-purple-400 flex-shrink-0' />
                      <span className='text-slate-300 text-xs truncate'>02_googleForm.txt</span>
                    </div>
                  </div>
                  <div>
                    <div className='text-left text-sm font-medium text-slate-300 mb-2 flex items-center gap-2'>
                      <Folder className='h-4 w-4 text-emerald-400' />
                      Recursos
                    </div>
                    <div className='w-full h-12 bg-slate-700 rounded border border-slate-600 flex items-center px-3 py-3 gap-2'>
                      <FileText className='h-4 w-4 text-orange-400 flex-shrink-0' />
                      <span className='text-slate-300 text-xs truncate'>03_button_guia.txt</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className='mt-2 text-sm text-slate-300 font-medium'>
                Las secciones agrupan contenido bajo un título descriptivo.
              </p>
            </div>
          </div>
        </div>

        <div className='bg-primary/5 border-l-4 border-primary p-4 my-6 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Combina
            diferentes tipos de componentes para crear una experiencia de
            usuario rica y organizada. Por ejemplo, usa pestañas para categorías
            principales y secciones dentro de cada pestaña para subcategorías.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
