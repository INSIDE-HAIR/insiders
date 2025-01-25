import { useRef, useState } from "react";
import type { PutBlobResult } from "@vercel/blob";

interface FileUploadProps {
  onUploadComplete?: (
    file: PutBlobResult & {
      title?: string;
      description?: string;
      altText?: string;
      tags?: string[];
      folderId?: string;
    }
  ) => void;
  folderId?: string;
}

export default function FileUpload({
  onUploadComplete,
  folderId,
}: FileUploadProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    altText: "",
    tags: [] as string[],
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!inputFileRef.current?.files?.length) {
      setError("Por favor selecciona un archivo");
      return;
    }

    const file = inputFileRef.current.files[0];
    const formData = new FormData();
    formData.append("file", file);

    // Agregar metadatos
    Object.entries(metadata).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else if (value) {
        formData.append(key, value);
      }
    });

    if (folderId) {
      formData.append("folderId", folderId);
    }

    try {
      setIsUploading(true);
      const response = await fetch(`/api/media/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir el archivo");
      }

      const result = await response.json();

      if (onUploadComplete) {
        onUploadComplete({
          ...result,
          ...metadata,
          folderId,
        });
      }

      // Limpiar el formulario
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
      setMetadata({
        title: "",
        description: "",
        altText: "",
        tags: [],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir el archivo"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Archivo
        </label>
        <input
          type='file'
          ref={inputFileRef}
          className='mt-1 block w-full'
          disabled={isUploading}
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Título
        </label>
        <input
          type='text'
          value={metadata.title}
          onChange={(e) =>
            setMetadata((prev) => ({ ...prev, title: e.target.value }))
          }
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
          disabled={isUploading}
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Descripción
        </label>
        <textarea
          value={metadata.description}
          onChange={(e) =>
            setMetadata((prev) => ({ ...prev, description: e.target.value }))
          }
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
          disabled={isUploading}
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Texto alternativo
        </label>
        <input
          type='text'
          value={metadata.altText}
          onChange={(e) =>
            setMetadata((prev) => ({ ...prev, altText: e.target.value }))
          }
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
          disabled={isUploading}
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Etiquetas (separadas por comas)
        </label>
        <input
          type='text'
          value={metadata.tags.join(", ")}
          onChange={(e) =>
            setMetadata((prev) => ({
              ...prev,
              tags: e.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            }))
          }
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
          disabled={isUploading}
        />
      </div>

      {error && <div className='text-red-600 text-sm'>{error}</div>}

      <button
        type='submit'
        disabled={isUploading}
        className='inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50'
      >
        {isUploading ? "Subiendo..." : "Subir archivo"}
      </button>
    </form>
  );
}
