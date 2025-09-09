"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Copy, Square, Folder, EyeOff, PlusCircle, Settings } from "lucide-react";

export default function AdditionalComponentsPage() {
  return (
    <div>
      <DocHeader
        title='Componentes Adicionales'
        description='Funcionalidades especiales y elementos de soporte'
        icon={PlusCircle}
      />

      <DocContent>
        <div className='space-y-8'>
          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Archivos con Texto Copiable
            </h2>
            <p className='mb-4'>
              Cualquier archivo que incluya la propiedad <code>copy</code> en su
              campo description mostrará un botón para copiar el texto al
              portapapeles y una vista previa del contenido.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Ejemplo de description:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-green-400'>{`Código de ejemplo para implementar`}</code>
                <br/>
                <code><span className='text-blue-400'>copy:</span> <span className='text-orange-400'>true</span></code>
                <br/>
                <code><span className='text-blue-400'>copyText:</span> <span className='text-yellow-300'>console.log</span><span className='text-slate-300'>(</span><span className='text-green-300'>'Hola mundo'</span><span className='text-slate-300'>);</span></code>
              </pre>
            </div>
            <div className='bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg'>
              <p className='text-primary font-medium flex items-start gap-2'>
                <Copy className='h-4 w-4 flex-shrink-0 mt-0.5' />
                <span><strong>Resultado:</strong> Aparecerá un botón "Copiar" junto al contenido que permitirá copiarlo al portapapeles con un solo click.</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Modales
            </h2>
            <p className='mb-4'>
              Carpetas con prefijo <code>modal</code>. Al hacer clic en el botón
              del modal, se muestra una ventana emergente con el contenido de la
              carpeta.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Estructura:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-green-400'>{`01_modal_Información detallada/`}</code>
                <br/>
                <code className='text-slate-400'>  ├── </code><code className='text-blue-300'>descripción.txt</code>
                <br/>
                <code className='text-slate-400'>  ├── </code><code className='text-blue-300'>imagen.jpg</code>
                <br/>
                <code className='text-slate-400'>  └── </code><code className='text-blue-300'>documento.pdf</code>
              </pre>
            </div>
            <div className='bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg'>
              <p className='text-primary font-medium flex items-start gap-2'>
                <Square className='h-4 w-4 flex-shrink-0 mt-0.5' />
                <span><strong>Resultado:</strong> Se mostrará un botón que al hacer click abrirá una ventana modal con todo el contenido de la carpeta.</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Archivos PDF e Imágenes
            </h2>
            <p className='mb-4'>
              Se muestran como tarjetas con vista previa y opción de descarga.
              Se agrupan automáticamente por tipo.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Tipos soportados:</h4>
              <ul className='text-sm space-y-1'>
                <li className='text-slate-300'>• <strong className='text-green-400'>PDF:</strong> <span className='text-blue-300'>.pdf</span></li>
                <li className='text-slate-300'>• <strong className='text-green-400'>Imágenes:</strong> <span className='text-blue-300'>.jpg, .jpeg, .png, .gif, .svg</span></li>
                <li className='text-slate-300'>• <strong className='text-green-400'>Documentos:</strong> <span className='text-blue-300'>.doc, .docx</span></li>
                <li className='text-slate-300'>• <strong className='text-green-400'>Hojas de cálculo:</strong> <span className='text-blue-300'>.xls, .xlsx</span></li>
              </ul>
            </div>
            <div className='bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg'>
              <p className='text-primary font-medium flex items-start gap-2'>
                <Folder className='h-4 w-4 flex-shrink-0 mt-0.5' />
                <span><strong>Resultado:</strong> Cada archivo se mostrará como una tarjeta con miniatura, nombre y botones para ver/descargar.</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Elementos Inactivos
            </h2>
            <p className='mb-4'>
              Cualquier elemento con el sufijo <code>_inactive</code> no se
              mostrará en la interfaz, pero se mantendrá en la estructura para
              uso futuro.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Ejemplos:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-green-400'>{`01_sidebar_Documentos_inactive/`}</code>
                <br/>
                <code className='text-blue-300'>02_video_Tutorial_inactive.txt</code>
                <br/>
                <code className='text-blue-300'>03_button_Enlace antiguo_inactive.txt</code>
              </pre>
            </div>
            <div className='bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg'>
              <p className='text-primary font-medium flex items-start gap-2'>
                <EyeOff className='h-4 w-4 flex-shrink-0 mt-0.5' />
                <span><strong>Resultado:</strong> Estos elementos no aparecerán en la interfaz pero se mantendrán en Drive para poder reactivarlos más tarde.</span>
              </p>
            </div>
          </section>
        </div>

        <div className='bg-primary/5 border-l-4 border-primary p-4 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Settings className='h-4 w-4' />
            <strong>Flexibilidad:</strong> Los componentes adicionales
            ofrecen funcionalidades avanzadas para casos específicos. Usa modales para contenido 
            detallado, texto copiable para código o snippets, y elementos inactivos para mantener 
            contenido sin mostrarlo temporalmente.
          </p>
        </div>
      </DocContent>
    </div>
  );
}