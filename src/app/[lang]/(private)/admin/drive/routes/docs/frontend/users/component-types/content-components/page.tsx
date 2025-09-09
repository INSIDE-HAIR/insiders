"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { CheckCircle, Play, FileImage, FileText, Zap } from "lucide-react";

export default function ContentComponentsPage() {
  return (
    <div>
      <DocHeader
        title='Componentes de Contenido'
        description='Componentes para mostrar diferentes tipos de contenido multimedia'
        icon={FileText}
      />

      <DocContent>
        <div className='space-y-8'>
          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Buttons (Botones)
            </h2>
            <p className='mb-4'>
              Archivos de texto con prefijo <code>button</code>. El contenido
              del archivo debe ser una URL.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Ejemplo de nombre:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-blue-300'>{`01_button_Enlace de formulario.txt`}</code>
              </pre>
              <h4 className='font-medium mb-2 mt-4 text-slate-200'>Contenido del archivo:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-green-300'>{`https://forms.google.com/d/1ABC123XYZ/viewform`}</code>
              </pre>
            </div>
            <div className='bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg'>
              <p className='text-primary font-medium flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 flex-shrink-0' />
                <span><strong>Resultado:</strong> Se mostrará un botón clickeable que redirige al enlace especificado.</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Vimeo Videos
            </h2>
            <p className='mb-4'>
              Archivos de texto con prefijo <code>vimeo</code> o que incluyan
              "vimeo" en el nombre. El ID de Vimeo se extrae del nombre o del contenido del archivo.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Opciones de nomenclatura:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-blue-300'>{`01_vimeo_1053382395.txt`}</code>
                <br/>
                <code className='text-blue-300'>02_video_vimeo_Tutorial básico.txt</code>
                <br/>
                <code className='text-blue-300'>03_Presentación_vimeo_1053382395.txt</code>
              </pre>
              <h4 className='font-medium mb-2 mt-4 text-slate-200'>Contenido del archivo (opcional):</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-yellow-300'>{`1053382395`}</code>
              </pre>
            </div>
            <div className='bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg'>
              <p className='text-primary font-medium flex items-center gap-2'>
                <Play className='h-4 w-4 flex-shrink-0' />
                <span><strong>Resultado:</strong> Se mostrará un reproductor de Vimeo embebido con el video especificado.</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Google Slides
            </h2>
            <p className='mb-4'>
              Presentaciones de Google con prefijo <code>googleSlide</code> o
              archivos con tipo MIME de presentación de Google.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Ejemplo:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-blue-300'>{`03_googleSlide_PLAN DE MKT-MARZO 2025`}</code>
              </pre>
            </div>
            <div className='bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg'>
              <p className='text-primary font-medium flex items-center gap-2'>
                <FileImage className='h-4 w-4 flex-shrink-0' />
                <span><strong>Resultado:</strong> Se mostrará un visor embebido de Google Slides con la presentación.</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Google Forms
            </h2>
            <p className='mb-4'>
              Formularios de Google con prefijo <code>googleForm</code> o con la
              propiedad <code>formUrl</code> en el campo description.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Ejemplo:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-blue-300'>{`01_googleForm_PLAN MKT GRUPAL Marzo 2025`}</code>
              </pre>
              <h4 className='font-medium mb-2 mt-4 text-slate-200'>O usando description:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-slate-300'>Formulario de inscripción</code>
                <br/>
                <code><span className='text-blue-400'>formUrl:</span> <span className='text-green-300'>https://forms.google.com/d/1ABC123/viewform</span></code>
              </pre>
            </div>
            <div className='bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg'>
              <p className='text-primary font-medium flex items-center gap-2'>
                <FileText className='h-4 w-4 flex-shrink-0' />
                <span><strong>Resultado:</strong> Se mostrará un formulario de Google embebido o un enlace directo.</span>
              </p>
            </div>
          </section>
        </div>

        <div className='bg-primary/5 border-l-4 border-primary p-4 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Zap className='h-4 w-4' />
            <strong>Importante:</strong> Los componentes de contenido
            permiten integrar diferentes tipos de media de forma nativa. Asegúrate de que los enlaces
            y IDs sean válidos para que el contenido se muestre correctamente.
          </p>
        </div>
      </DocContent>
    </div>
  );
}