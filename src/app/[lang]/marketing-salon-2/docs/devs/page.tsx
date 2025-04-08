import { DocHeader } from "@/src/components/marketing-salon/docs/doc-header"
import { DocContent } from "@/src/components/marketing-salon/docs/doc-content"

export default function DevsDocsPage() {
  return (
    <div>
      <DocHeader title="Manual para Desarrolladores" description="Documentación técnica para extender la plataforma" />

      <DocContent>
        <h2 className="text-2xl font-bold mt-8 mb-4">Introducción para Desarrolladores</h2>

        <p className="mb-4">
          Bienvenido a la documentación técnica de Marketing Salón. Esta guía está diseñada para desarrolladores que
          necesitan extender, mantener o modificar la plataforma.
        </p>

        <p className="mb-4">
          Marketing Salón está construido con Next.js y React, utilizando una arquitectura basada en componentes que
          facilita la extensión y personalización del sistema.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Tecnologías principales</h3>

        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>
            <strong>Next.js</strong>: Framework de React para renderizado del lado del servidor
          </li>
          <li>
            <strong>React</strong>: Biblioteca para construir interfaces de usuario
          </li>
          <li>
            <strong>TypeScript</strong>: Superset tipado de JavaScript
          </li>
          <li>
            <strong>Tailwind CSS</strong>: Framework de utilidades CSS para el diseño
          </li>
          <li>
            <strong>shadcn/ui</strong>: Componentes de UI reutilizables
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Principios de arquitectura</h3>

        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            <strong>Centralización de componentes</strong>: El <code>ComponentSelector</code> es el punto central para
            seleccionar qué componente renderizar basado en el tipo de contenido.
          </li>
          <li>
            <strong>Renderizado recursivo</strong>: El <code>RecursiveContentRenderer</code> maneja la renderización de
            contenido anidado (tabs dentro de tabs, secciones, etc.).
          </li>
          <li>
            <strong>Navegación por estado</strong>: El <code>ContentContext</code> mantiene el estado de navegación
            (sidebar, tab, sección seleccionados).
          </li>
          <li>
            <strong>Separación de responsabilidades</strong>: Los componentes están organizados por funcionalidad
            (navegación, renderizado, selección, etc.).
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Cómo usar esta documentación</h3>

        <p className="mb-4">
          Esta documentación técnica está organizada en secciones que cubren diferentes aspectos del desarrollo:
        </p>

        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>
            <strong>Arquitectura del Sistema</strong>: Visión general de la arquitectura y flujo de datos
          </li>
          <li>
            <strong>Campo Description</strong>: Cómo procesar propiedades personalizadas
          </li>
          <li>
            <strong>Añadir Componentes</strong>: Guía paso a paso para añadir nuevos tipos de componentes
          </li>
          <li>
            <strong>Estructura de Archivos</strong>: Organización de archivos y carpetas del proyecto
          </li>
          <li>
            <strong>Componentes Actuales</strong>: Referencia de los componentes disponibles
          </li>
        </ul>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
          <p className="text-amber-800">
            <strong>Nota:</strong> Esta documentación asume conocimientos básicos de React, Next.js y TypeScript.
          </p>
        </div>
      </DocContent>
    </div>
  )
}

