import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Type } from "lucide-react";

export default function NamingConventionsPage() {
  return (
    <div>
      <DocHeader
        title='Prefijos y Sufijos'
        description='Sistema de nomenclatura para archivos y carpetas'
        icon={Type}
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-12 mb-6'>
          Sistema de nomenclatura
        </h2>

        <p className='mb-4'>
          Los nombres de archivos y carpetas utilizan prefijos y sufijos para
          determinar su tipo y comportamiento en la plataforma.
        </p>

        <h3 className='text-xl font-semibold mt-8 mb-4'>
          Prefijos principales
        </h3>

        <ul className='list-disc pl-5 space-y-2 mb-4'>
          <li>
            <code>XX_order_</code>: Número de orden (01, 02, etc.) para
            determinar la posición
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
            <code>XX_section_</code>: Identifica una sección dentro de una
            pestaña o sidebar
          </li>
          <li>
            <code>XX_button_</code>: Identifica un botón (archivo de texto con
            URL)
          </li>
          <li>
            <code>XX_vimeo_</code>: Identifica un video de Vimeo (archivo de
            texto con ID)
          </li>
          <li>
            <code>XX_googleSlide_</code>: Identifica una presentación de Google
            Slides
          </li>
          <li>
            <code>XX_googleForm_</code>: Identifica un formulario de Google
          </li>
          <li>
            <code>XX_modal_</code>: Identifica un modal
          </li>
        </ul>

        <h3 className='text-xl font-semibold mt-8 mb-4'>Sufijos</h3>

        <ul className='list-disc pl-5 space-y-2 mb-4'>
          <li>
            <code>_inactive</code>: Indica que un elemento está inactivo (ej:{" "}
            <code>02_tab_Acción Principal_inactive</code>)
          </li>
        </ul>

        <h3 className='text-xl font-semibold mt-10 mb-4'>
          Nomenclatura de archivos de contenido
        </h3>

        <p className='mb-2'>
          Los archivos de contenido (PDFs, imágenes, etc.) utilizan un formato
          específico:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code className='text-red-300'>A-A-2503-0080-01-00-01.pdf</code>
            <br/><br/>
            <code className='text-green-400'>Donde:</code>
            <br/>
            <code className='text-slate-400'>- </code><code className='text-blue-300'>A-A:</code> <code className='text-slate-300'>Códigos de cliente y campaña</code>
            <br/>
            <code className='text-slate-400'>- </code><code className='text-yellow-300'>2503:</code> <code className='text-slate-300'>Año y mes</code>
            <br/>
            <code className='text-slate-400'>- </code><code className='text-orange-300'>0080:</code> <code className='text-slate-300'>Código de tipo de archivo (ej: 0080 = Cartel 80x120cm)</code>
            <br/>
            <code className='text-slate-400'>- </code><code className='text-purple-300'>01:</code> <code className='text-slate-300'>Código de idioma (01 = ES, 02 = CA, etc.)</code>
            <br/>
            <code className='text-slate-400'>- </code><code className='text-pink-300'>00:</code> <code className='text-slate-300'>Versión</code>
            <br/>
            <code className='text-slate-400'>- </code><code className='text-cyan-300'>01:</code> <code className='text-slate-300'>Número de archivo</code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-10 mb-4'>
          Códigos de tipo de archivo
        </h3>

        <p className='mb-2'>
          Algunos de los códigos más comunes para tipos de archivo:
        </p>

        <table className='min-w-full border-collapse border border-slate-400 mb-8 mt-4 shadow-sm rounded-lg overflow-hidden'>
          <thead>
            <tr className='bg-slate-800 text-white'>
              <th className='border border-slate-600 px-4 py-2 text-left'>
                Código
              </th>
              <th className='border border-slate-600 px-4 py-2 text-left'>
                Tipo de archivo
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0080
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Cartel 80x120cm
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0050
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Cartel 50x70cm
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0004
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Cartel A4 21x29,7cm
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0005
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Cartel A5 14,8x21cm
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0048
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Díptico/Tríptico
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0192
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Post para redes sociales
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0129
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Story para redes sociales
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0001
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Documento general
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0002
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Presentación
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0003
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Hoja de cálculo
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0010
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Imagen JPG/PNG
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0020
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Video MP4/MOV
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0030
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Audio MP3/WAV
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0100
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Formulario interactivo
              </td>
            </tr>
            <tr>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700'>
                <code className='bg-slate-800 px-2 py-1 rounded text-green-400 border border-slate-600 font-semibold'>
                  0200
                </code>
              </td>
              <td className='border border-slate-400 px-4 py-3 bg-slate-700 text-white'>
                Plantilla de diseño
              </td>
            </tr>
          </tbody>
        </table>

        <div className='bg-yellow-500/5 border-l-4 border-yellow-500/50 p-6 my-8 rounded-r-lg'>
          <p className='text-yellow-800 font-medium'>
            <strong className='text-yellow-700'>⚠️ Importante:</strong> Seguir
            estas convenciones de nomenclatura es esencial para que la
            plataforma pueda interpretar correctamente el contenido y mostrarlo
            de forma adecuada.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
