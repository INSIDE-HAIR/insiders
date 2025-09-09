"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Layers, Lightbulb, Folder, FileText } from "lucide-react";

export default function NavigationComponentsPage() {
  return (
    <div>
      <DocHeader
        title='Componentes de Navegación'
        description='Componentes para estructurar y organizar el contenido'
        icon={Layers}
      />

      <DocContent>
        <div className='space-y-8'>
          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Sidebar
            </h2>
            <p className='mb-4'>
              Las carpetas con prefijo <code>sidebar</code> aparecen en la barra
              lateral izquierda. El orden se determina por el número de prefijo.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Ejemplo:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-green-400'>{`01_sidebar_Documentos`}</code>
                <br/>
                <code className='text-green-400'>02_sidebar_Videos</code>
                <br/>
                <code className='text-green-400'>03_sidebar_Recursos</code>
              </pre>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Tabs (Pestañas)
            </h2>
            <p className='mb-4'>
              Las carpetas con prefijo <code>tab</code> dentro de una carpeta{" "}
              <code>tabs</code> se muestran como pestañas. El contenido de la
              pestaña seleccionada se muestra debajo.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Estructura:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-green-400'>{`tabs/`}</code>
                <br/>
                <code className='text-slate-400'>  ├── </code><code className='text-blue-300'>01_tab_Información</code>
                <br/>
                <code className='text-slate-400'>  ├── </code><code className='text-blue-300'>02_tab_Recursos</code>
                <br/>
                <code className='text-slate-400'>  └── </code><code className='text-blue-300'>03_tab_Contacto</code>
              </pre>
            </div>

            {/* Ejemplo visual de tabs */}
            <div className='border border-slate-600 rounded-md overflow-hidden bg-slate-800/50 mb-6'>
              <div className='bg-slate-700 px-4 py-2 font-medium border-b border-slate-600 text-slate-200'>
                Ejemplo Visual de Tabs
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
          </section>

          <section>
            <h2 className='text-2xl font-bold mb-4'>
              Sections (Secciones)
            </h2>
            <p className='mb-4'>
              Las carpetas con prefijo <code>section</code> se muestran como
              secciones con título. Pueden estar dentro de pestañas o
              directamente en una carpeta sidebar.
            </p>
            <div className='bg-slate-800 border border-slate-600 rounded-md p-4 mb-4'>
              <h4 className='font-medium mb-2 text-slate-200'>Ejemplo:</h4>
              <pre className='text-sm bg-slate-900 p-3 border border-slate-700 rounded overflow-x-auto'>
                <code className='text-green-400'>{`01_section_Introducción`}</code>
                <br/>
                <code className='text-green-400'>02_section_Desarrollo</code>
                <br/>
                <code className='text-green-400'>03_section_Conclusión</code>
              </pre>
            </div>

            {/* Ejemplo visual de secciones */}
            <div className='border border-slate-600 rounded-md overflow-hidden bg-slate-800/50'>
              <div className='bg-slate-700 px-4 py-2 font-medium border-b border-slate-600 text-slate-200'>
                Ejemplo Visual de Secciones
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
          </section>
        </div>

        <div className='bg-primary/5 border-l-4 border-primary p-4 my-8 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Los componentes de navegación
            son la base para organizar tu contenido. Usa sidebars para categorías principales,
            tabs para agrupar contenido relacionado, y secciones para subdividir información.
          </p>
        </div>
      </DocContent>
    </div>
  );
}