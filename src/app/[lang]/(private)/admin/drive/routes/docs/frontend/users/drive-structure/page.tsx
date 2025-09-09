import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { MermaidDiagram } from "@/src/components/drive/docs/mermaid-diagram";
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

        <MermaidDiagram
          chart={`
flowchart TD
    ROOT["🗂️ Google Drive Root"] --> CLIENT["📁 01_client_INSIDERS"]
    
    CLIENT --> SIDEBAR1["📁 01_sidebar_Plan de Marketing"]
    CLIENT --> SIDEBAR2["📁 02_sidebar_Guia"]
    CLIENT --> SIDEBAR3["📁 03_sidebar_Listas de Control"]
    
    SIDEBAR1 --> FORM["📝 01_googleForm_PLAN MKT GRUPAL Marzo 2025"]
    SIDEBAR1 --> TABS["📁 02_tabs"]
    SIDEBAR1 --> SLIDES["📊 03_googleSlide_PLAN DE MKT-MARZO 2025"]
    
    TABS --> TAB1["📁 01_tab_Contexto"]
    TABS --> TAB2["📁 02_tab_Acción Principal"]
    
    TAB1 --> VIMEO1["🎥 01_vimeo_contexto.txt"]
    TAB2 --> VIMEO2["🎥 01_vimeo_1053382395.txt"]
    
    SIDEBAR3 --> SECTION1["📁 01_section_Manager"]
    
    SECTION1 --> PREVIEW["🖼️ A-A-2503-1111-01-00-01-P1.jpg"]
    SECTION1 --> PDF["📄 A-A-2503-1111-01-00-01.pdf"]
    
    %% Styling classes
    classDef clientClass fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff
    classDef sidebarClass fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    classDef tabClass fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    classDef sectionClass fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    classDef fileClass fill:#ef4444,stroke:#dc2626,stroke-width:1px,color:#fff
    classDef rootClass fill:#6b7280,stroke:#4b5563,stroke-width:2px,color:#fff
    
    class ROOT rootClass
    class CLIENT clientClass
    class SIDEBAR1,SIDEBAR2,SIDEBAR3 sidebarClass
    class TABS,TAB1,TAB2 tabClass
    class SECTION1 sectionClass
    class FORM,SLIDES,VIMEO1,VIMEO2,PREVIEW,PDF fileClass
          `}
          className="mb-8"
        />

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
