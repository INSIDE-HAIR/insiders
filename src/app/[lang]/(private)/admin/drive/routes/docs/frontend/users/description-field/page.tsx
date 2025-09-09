import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { FileText, AlertTriangle } from "lucide-react";

export default function DescriptionFieldPage() {
  return (
    <div>
      <DocHeader
        title='Campo Description'
        description='Propiedades personalizadas para archivos y carpetas'
        icon={FileText}
      />

      <DocContent>
        <h2 className='text-2xl font-bold mt-8 mb-4'>
          Uso del campo Description
        </h2>

        <p className='mb-4'>
          El campo <code>description</code> permite añadir propiedades
          personalizadas a los archivos y carpetas. Estas propiedades se
          utilizan para extender la funcionalidad sin modificar la estructura de
          archivos.
        </p>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Propiedades disponibles
        </h3>

        <ul className='list-disc pl-5 space-y-2 mb-4'>
          <li>
            <code>formUrl</code>: URL específica para formularios de Google
            <div className='bg-slate-900 border border-slate-700 p-3 rounded text-xs mt-1 overflow-x-auto'>
              <code><span className='text-blue-400'>"formUrl"</span><span className='text-slate-300'>:</span><span className='text-green-300'>"https://docs.google.com/forms/d/e/1FAIpQLSdg7a7Ova2NuP67O2NQUf9kpnEHHPnAeqeqF3M2ECaKl4QWYQ/viewform"</span></code>
            </div>
          </li>
          <li>
            <code>copy</code>: Texto para copiar al portapapeles
            <div className='bg-slate-900 border border-slate-700 p-3 rounded text-xs mt-1 overflow-x-auto'>
              <code><span className='text-blue-400'>"copy"</span><span className='text-slate-300'>:</span><span className='text-green-300'>"🌟 Esta primavera descubre LUMINAE 2025 🌟\\nEl secreto mejor guardado de las estrellas✨, ahora en tu salón."</span></code>
            </div>
          </li>
        </ul>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Cómo añadir propiedades
        </h3>

        <p className='mb-2'>
          Para añadir propiedades personalizadas, edita el campo Description en
          Google Drive con el formato:
        </p>

        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-6'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code><span className='text-blue-400'>"propiedad1"</span><span className='text-slate-300'>:</span><span className='text-green-300'>"valor1"</span><span className='text-slate-300'>,</span><span className='text-blue-400'>"propiedad2"</span><span className='text-slate-300'>:</span><span className='text-green-300'>"valor2"</span></code>
          </pre>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Pasos para editar el campo Description
        </h3>

        <ol className='list-decimal pl-5 space-y-2 mb-6'>
          <li>Selecciona el archivo o carpeta en Google Drive</li>
          <li>Haz clic en el icono de información (i) en la barra superior</li>
          <li>
            Busca el campo &quot;Descripción&quot; y haz clic para editarlo
          </li>
          <li>Introduce las propiedades en el formato indicado</li>
          <li>Guarda los cambios</li>
        </ol>

        <h3 className='text-xl font-semibold mt-6 mb-3'>Ejemplos de uso</h3>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Ejemplo 1: Formulario de Google
        </h4>
        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code><span className='text-blue-400'>"formUrl"</span><span className='text-slate-300'>:</span><span className='text-green-300'>"https://docs.google.com/forms/d/e/1FAIpQLSdg7a7Ova2NuP67O2NQUf9kpnEHHPnAeqeqF3M2ECaKl4QWYQ/viewform"</span></code>
          </pre>
        </div>

        <h4 className='text-lg font-medium mt-4 mb-2'>
          Ejemplo 2: Texto para copiar
        </h4>
        <div className='bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4'>
          <pre className='text-sm bg-slate-900 p-4 border border-slate-700 rounded overflow-x-auto'>
            <code><span className='text-blue-400'>"copy"</span><span className='text-slate-300'>:</span><span className='text-green-300'>"🌟 Esta primavera descubre LUMINAE 2025 🌟\\nEl secreto mejor guardado de las estrellas✨, ahora en tu salón.\\n\\nImagina un cabello iluminado, lleno de vida, con un efecto de luz natural que realza tu belleza sin esfuerzo. 💫"</span></code>
          </pre>
        </div>

        <div className='bg-primary/5 border-l-4 border-primary p-4 my-6 rounded-r-lg'>
          <p className='text-primary font-medium flex items-center gap-2'>
            <AlertTriangle className='h-4 w-4' />
            <strong>Importante:</strong> Asegúrate de usar comillas dobles para
            las propiedades y valores, y escapa los caracteres especiales con
            barra invertida (\).
          </p>
        </div>

        <h3 className='text-xl font-semibold mt-6 mb-3'>
          Comportamiento en la plataforma
        </h3>

        <p className='mb-4'>
          Cuando un archivo tiene propiedades en el campo Description, la
          plataforma las interpreta y muestra funcionalidades adicionales:
        </p>

        <ul className='list-disc pl-5 space-y-2 mb-6'>
          <li>
            Con <code>formUrl</code>, se muestra un botón que enlaza al
            formulario de Google
          </li>
          <li>
            Con <code>copy</code>, se muestra un botón para copiar el texto al
            portapapeles y una vista previa del texto
          </li>
        </ul>
      </DocContent>
    </div>
  );
}
