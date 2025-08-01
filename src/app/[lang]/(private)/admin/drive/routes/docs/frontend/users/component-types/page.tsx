"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";

export default function ComponentTypesPage() {
  return (
    <div>
      <DocHeader
        title='Tipos de Componentes'
        description='Componentes disponibles y cómo utilizarlos'
      />

      <DocContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
          <div>
            <h2 className='text-2xl font-bold mb-4'>
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
            <h2 className='text-2xl font-bold mb-4'>
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

        <h2 className='text-2xl font-bold mt-8 mb-4'>
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

        <h2 className='text-2xl font-bold mt-8 mb-4'>Ejemplos visuales</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <div className='border border-zinc-200 rounded-md overflow-hidden'>
            <div className='bg-zinc-100 px-4 py-2 font-medium border-b border-zinc-200'>
              Ejemplo de Tabs
            </div>
            <div className='p-4'>
              <Image
                src='/placeholder.svg?height=200&width=400'
                alt='Ejemplo de pestañas'
                className='w-full rounded-md border border-zinc-200'
                width={400}
                height={200}
              />
              <p className='mt-2 text-sm text-zinc-600'>
                Las pestañas permiten organizar contenido relacionado en una
                misma vista.
              </p>
            </div>
          </div>

          <div className='border border-zinc-200 rounded-md overflow-hidden'>
            <div className='bg-zinc-100 px-4 py-2 font-medium border-b border-zinc-200'>
              Ejemplo de Secciones
            </div>
            <div className='p-4'>
              <Image
                src='/placeholder.svg?height=200&width=400'
                alt='Ejemplo de secciones'
                className='w-full rounded-md border border-zinc-200'
                width={400}
                height={200}
              />
              <p className='mt-2 text-sm text-zinc-600'>
                Las secciones agrupan contenido bajo un título descriptivo.
              </p>
            </div>
          </div>
        </div>

        <div className='bg-blue-50 border-l-4 border-blue-500 p-4 my-6'>
          <p className='text-blue-800'>
            <strong>Consejo:</strong> Combina diferentes tipos de componentes
            para crear una experiencia de usuario rica y organizada. Por
            ejemplo, usa pestañas para categorías principales y secciones dentro
            de cada pestaña para subcategorías.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
