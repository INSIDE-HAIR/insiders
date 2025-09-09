import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { FolderTree, Lightbulb } from "lucide-react";

export default function DriveStructurePage() {
  return (
    <div>
      <DocHeader
        title='Estructura de Google Drive'
        description='Cómo organizar carpetas y archivos en Google Drive'
        icon={FolderTree}
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-8 mb-4'>Estructura básica</h2>

        <p className='mb-4'>
          La plataforma utiliza una estructura específica de carpetas y archivos
          en Google Drive para organizar el contenido de marketing.
        </p>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Jerarquía de carpetas
        </h3>

        <ol className='list-decimal pl-5 space-y-2 mb-4'>
          <li>
            <strong>Carpeta Cliente</strong>: Nivel superior con prefijo{" "}
            <code>client</code> (ej: <code>01_client_INSIDERS</code>)
          </li>
          <li>
            <strong>Carpetas Sidebar</strong>: Dentro de la carpeta cliente, con
            prefijo <code>sidebar</code> (ej:{" "}
            <code>01_sidebar_Plan de Marketing</code>)
          </li>
          <li>
            <strong>Carpetas Tabs</strong>: Dentro de las carpetas sidebar,
            crear una carpeta <code>tabs</code> (ej: <code>01_tabs</code>)
          </li>
          <li>
            <strong>Carpetas Tab</strong>: Dentro de la carpeta tabs, con
            prefijo <code>tab</code> (ej: <code>01_tab_Contexto</code>)
          </li>
          <li>
            <strong>Carpetas Section</strong>: Dentro de tabs o sidebar, con
            prefijo <code>section</code> (ej:{" "}
            <code>01_section_Cartel 80x120cm</code>)
          </li>
        </ol>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Ejemplo de estructura completa
        </h3>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-green-400'>01_client_INSIDERS/</code>
            <br/>
            <code className='text-slate-400'>├── </code><code className='text-blue-300'>01_sidebar_Plan de Marketing/</code>
            <br/>
            <code className='text-slate-400'>│   ├── </code><code className='text-purple-300'>01_googleForm_PLAN MKT GRUPAL Marzo 2025</code>
            <br/>
            <code className='text-slate-400'>│   ├── </code><code className='text-yellow-300'>02_tabs/</code>
            <br/>
            <code className='text-slate-400'>│   │   ├── </code><code className='text-blue-300'>01_tab_Contexto/</code>
            <br/>
            <code className='text-slate-400'>│   │   │   └── </code><code className='text-orange-300'>01_vimeo_contexto.txt</code>
            <br/>
            <code className='text-slate-400'>│   │   └── </code><code className='text-blue-300'>02_tab_Acción Principal/</code>
            <br/>
            <code className='text-slate-400'>│   │       └── </code><code className='text-orange-300'>01_vimeo_1053382395.txt</code>
            <br/>
            <code className='text-slate-400'>│   └── </code><code className='text-cyan-300'>03_googleSlide_PLAN DE MKT-MARZO 2025</code>
            <br/>
            <code className='text-slate-400'>├── </code><code className='text-blue-300'>02_sidebar_Guia/</code>
            <br/>
            <code className='text-slate-400'>└── </code><code className='text-blue-300'>03_sidebar_Listas de Control/</code>
            <br/>
            <code className='text-slate-400'>    └── </code><code className='text-green-300'>01_section_Manager/</code>
            <br/>
            <code className='text-slate-400'>        ├── </code><code className='text-pink-300'>A-A-2503-1111-01-00-01-P1.jpg</code>
            <br/>
            <code className='text-slate-400'>        └── </code><code className='text-red-300'>A-A-2503-1111-01-00-01.pdf</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Recomendaciones para la estructura
        </h3>

        <ul className='list-disc pl-5 space-y-2 mb-6'>
          <li>
            Mantén una estructura consistente para facilitar la navegación
          </li>
          <li>
            Utiliza siempre los prefijos adecuados para cada tipo de carpeta
          </li>
          <li>
            Ordena las carpetas con números (01_, 02_, etc.) para controlar el
            orden de visualización
          </li>
          <li>
            Evita nombres de carpetas muy largos para mejorar la legibilidad
          </li>
          <li>
            Agrupa contenido relacionado en la misma carpeta sidebar o tab
          </li>
        </ul>

        <div className='bg-primary/5 border-l-4 border-primary p-4 my-6 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <strong>Consejo:</strong> Planifica la estructura antes de empezar a
            crear carpetas. Una buena organización desde el principio facilitará
            la gestión del contenido a largo plazo.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
