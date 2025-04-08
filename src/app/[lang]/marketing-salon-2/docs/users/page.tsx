import { DocHeader } from "@/src/components/marketing-salon/docs/doc-header"
import { DocContent } from "@/src/components/marketing-salon/docs/doc-content"

export default function UsersDocsPage() {
  return (
    <div>
      <DocHeader title="Manual para Usuarios" description="Guía completa para el uso de Marketing Salón" />

      <DocContent>
        <h2 className="text-2xl font-bold mt-8 mb-4">Introducción</h2>

        <p className="mb-4">
          Bienvenido al manual de usuario de Marketing Salón. Esta plataforma está diseñada para facilitar la gestión y
          visualización de contenido de marketing para salones de belleza.
        </p>

        <p className="mb-4">
          La plataforma utiliza Google Drive como backend para almacenar y organizar el contenido, lo que permite una
          fácil actualización y gestión de los materiales de marketing.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">¿Qué puedes hacer con Marketing Salón?</h3>

        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>Visualizar materiales de marketing organizados por categorías</li>
          <li>Acceder a presentaciones, formularios, videos y documentos</li>
          <li>Descargar recursos para su uso en el salón</li>
          <li>Navegar fácilmente entre diferentes secciones de contenido</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Cómo usar este manual</h3>

        <p className="mb-4">
          Este manual está organizado en secciones que cubren diferentes aspectos de la plataforma:
        </p>

        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            <strong>Estructura de Google Drive</strong>: Cómo organizar carpetas y archivos
          </li>
          <li>
            <strong>Prefijos y Sufijos</strong>: Sistema de nomenclatura para archivos y carpetas
          </li>
          <li>
            <strong>Campo Description</strong>: Propiedades personalizadas para archivos
          </li>
          <li>
            <strong>Tipos de Componentes</strong>: Componentes disponibles y cómo utilizarlos
          </li>
        </ol>

        <p className="mb-4">
          Navega por las secciones utilizando el menú lateral para encontrar la información específica que necesitas.
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
          <p className="text-amber-800">
            <strong>Nota:</strong> Para cualquier duda o problema que no esté cubierto en este manual, contacta con el
            equipo de soporte.
          </p>
        </div>
      </DocContent>
    </div>
  )
}

