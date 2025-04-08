import { DocHeader } from "@/src/components/marketing-salon/docs/doc-header"
import { DocContent } from "@/src/components/marketing-salon/docs/doc-content"

export default function NamingConventionsPage() {
  return (
    <div>
      <DocHeader title="Prefijos y Sufijos" description="Sistema de nomenclatura para archivos y carpetas" />

      <DocContent>
        <h2 className="text-2xl font-bold mt-8 mb-4">Sistema de nomenclatura</h2>

        <p className="mb-4">
          Los nombres de archivos y carpetas utilizan prefijos y sufijos para determinar su tipo y comportamiento en la
          plataforma.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Prefijos principales</h3>

        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            <code>XX_order_</code>: Número de orden (01, 02, etc.) para determinar la posición
          </li>
          <li>
            <code>XX_client_</code>: Identifica una carpeta de cliente
          </li>
          <li>
            <code>XX_sidebar_</code>: Identifica una sección en la barra lateral
          </li>
          <li>
            <code>XX_tab_</code>: Identifica una pestaña
          </li>
          <li>
            <code>XX_section_</code>: Identifica una sección dentro de una pestaña o sidebar
          </li>
          <li>
            <code>XX_button_</code>: Identifica un botón (archivo de texto con URL)
          </li>
          <li>
            <code>XX_vimeo_</code>: Identifica un video de Vimeo (archivo de texto con ID)
          </li>
          <li>
            <code>XX_googleSlide_</code>: Identifica una presentación de Google Slides
          </li>
          <li>
            <code>XX_googleForm_</code>: Identifica un formulario de Google
          </li>
          <li>
            <code>XX_modal_</code>: Identifica un modal
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Sufijos</h3>

        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            <code>_inactive</code>: Indica que un elemento está inactivo (ej:{" "}
            <code>02_tab_Acción Principal_inactive</code>)
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Nomenclatura de archivos de contenido</h3>

        <p className="mb-2">Los archivos de contenido (PDFs, imágenes, etc.) utilizan un formato específico:</p>

        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded text-sm overflow-x-auto mb-6">
          {`A-A-2503-0080-01-00-01.pdf

Donde:
- A-A: Códigos de cliente y campaña
- 2503: Año y mes
- 0080: Código de tipo de archivo (ej: 0080 = Cartel 80x120cm)
- 01: Código de idioma (01 = ES, 02 = CA, etc.)
- 00: Versión
- 01: Número de archivo`}
        </pre>

        <h3 className="text-xl font-semibold mt-6 mb-3">Códigos de tipo de archivo</h3>

        <p className="mb-2">Algunos de los códigos más comunes para tipos de archivo:</p>

        <table className="min-w-full border-collapse border border-zinc-300 mb-6">
          <thead>
            <tr className="bg-zinc-100">
              <th className="border border-zinc-300 px-4 py-2 text-left">Código</th>
              <th className="border border-zinc-300 px-4 py-2 text-left">Tipo de archivo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-zinc-300 px-4 py-2">
                <code>0080</code>
              </td>
              <td className="border border-zinc-300 px-4 py-2">Cartel 80x120cm</td>
            </tr>
            <tr>
              <td className="border border-zinc-300 px-4 py-2">
                <code>0050</code>
              </td>
              <td className="border border-zinc-300 px-4 py-2">Cartel 50x70cm</td>
            </tr>
            <tr>
              <td className="border border-zinc-300 px-4 py-2">
                <code>0004</code>
              </td>
              <td className="border border-zinc-300 px-4 py-2">Cartel A4 21x29,7cm</td>
            </tr>
            <tr>
              <td className="border border-zinc-300 px-4 py-2">
                <code>0005</code>
              </td>
              <td className="border border-zinc-300 px-4 py-2">Cartel A5 14,8x21cm</td>
            </tr>
            <tr>
              <td className="border border-zinc-300 px-4 py-2">
                <code>0048</code>
              </td>
              <td className="border border-zinc-300 px-4 py-2">Díptico/Tríptico</td>
            </tr>
            <tr>
              <td className="border border-zinc-300 px-4 py-2">
                <code>0192</code>
              </td>
              <td className="border border-zinc-300 px-4 py-2">Post</td>
            </tr>
            <tr>
              <td className="border border-zinc-300 px-4 py-2">
                <code>0129</code>
              </td>
              <td className="border border-zinc-300 px-4 py-2">Story</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
          <p className="text-amber-800">
            <strong>Importante:</strong> Seguir estas convenciones de nomenclatura es esencial para que la plataforma
            pueda interpretar correctamente el contenido y mostrarlo de forma adecuada.
          </p>
        </div>
      </DocContent>
    </div>
  )
}

