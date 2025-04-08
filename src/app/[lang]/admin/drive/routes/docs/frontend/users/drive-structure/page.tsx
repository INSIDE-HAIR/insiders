import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";

export default function DriveStructurePage() {
  return (
    <div>
      <DocHeader
        title='Estructura de Google Drive'
        description='Cómo organizar carpetas y archivos en Google Drive'
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

        <pre className='bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6'>
          {`01_client_INSIDERS/
├── 01_sidebar_Plan de Marketing/
│   ├── 01_googleForm_PLAN MKT GRUPAL Marzo 2025
│   ├── 02_tabs/
│   │   ├── 01_tab_Contexto/
│   │   │   └── 01_vimeo_contexto.txt
│   │   └── 02_tab_Acción Principal/
│   │       └── 01_vimeo_1053382395.txt
│   └── 03_googleSlide_PLAN DE MKT-MARZO 2025
├── 02_sidebar_Guia/
└── 03_sidebar_Listas de Control/
    └── 01_section_Manager/
        ├── A-A-2503-1111-01-00-01-P1.jpg
        └── A-A-2503-1111-01-00-01.pdf`}
        </pre>

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

        <div className='bg-blue-50 border-l-4 border-blue-500 p-4 my-6'>
          <p className='text-blue-800'>
            <strong>Consejo:</strong> Planifica la estructura antes de empezar a
            crear carpetas. Una buena organización desde el principio facilitará
            la gestión del contenido a largo plazo.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
