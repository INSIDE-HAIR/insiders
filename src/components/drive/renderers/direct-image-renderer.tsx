"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Copy,
  Check,
  Info,
  ChevronUp,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import {
  decodeFileName,
  decodeFileNameAsync,
  type DecodedFile,
} from "@/src/features/drive/utils/marketing-salon/file-decoder";
import { CodeService } from "@/src/features/drive/utils/marketing-salon/file-decoder-service";
import { extractCopyText } from "@/src/features/drive/utils/marketing-salon/description-parser";
import { hasDownloadSuffix } from "@/src/features/drive/utils/marketing-salon/content-type-utils";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getPreviewUrl,
  getDownloadUrl,
  getDownloadUrlWithDecodedName,
  getTransformedUrl,
} from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";
import Image from "next/image";
import { downloadFileWithCustomName } from "@/src/features/drive/utils/marketing-salon/file-download-helper";
import { useDownloadState } from "@/src/hooks/useDownloadState";

/**
 * DirectImageRenderer
 *
 * Componente especializado para renderizar imágenes directamente en la interfaz.
 * Optimizado para mostrar imágenes con controles adicionales como descarga y copia de texto.
 *
 * Características:
 * - Visualización optimizada de imágenes a tamaño completo
 * - Estado de carga con feedback visual
 * - Soporte para copiar texto asociado al portapapeles
 * - Visualización de metadatos decodificados del nombre del archivo
 * - Estilos personalizados para scrollbars
 * - Estado de descarga en tiempo real
 *
 * @param {HierarchyItem} item - Elemento de contenido que contiene la información de la imagen
 * @returns Imagen renderizada con controles adicionales
 */
export const scrollbarStyles = `
div[style*="--scrollbar-width"]::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-height);
}
div[style*="--scrollbar-width"]::-webkit-scrollbar-track {
  background: var(--scrollbar-track-color);
  border-radius: 4px;
}
div[style*="--scrollbar-width"]::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb-color);
  border-radius: 4px;
}
`;

interface DirectImageRendererProps {
  item: HierarchyItem;
}

export function DirectImageRenderer({ item }: DirectImageRendererProps) {
  // Estados para controlar la interacción y feedback visual
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [decodedInfo, setDecodedInfo] = useState<DecodedFile | null>(null);
  const [isDecodingInfo, setIsDecodingInfo] = useState(true);
  const copyTextRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Hook para estado de descarga
  const { getDownloadStatus, isUrlDownloading } = useDownloadState();

  // Verificar disponibilidad de recursos
  const hasPreview = !!getPreviewUrl(item);
  const canDownload = hasDownloadSuffix(item);
  const downloadUrl = getDownloadUrl(item);

  // Obtener estado de descarga
  const downloadStatus = downloadUrl ? getDownloadStatus(downloadUrl) : "idle";
  const isDownloading = downloadUrl ? isUrlDownloading(downloadUrl) : false;

  // Extraer el texto a copiar desde el campo description
  const copyText = extractCopyText(item);

  // Cargar la información decodificada de manera asíncrona
  useEffect(() => {
    let isMounted = true;

    const loadDecodedInfo = async () => {
      if (!item.name) {
        setIsDecodingInfo(false);
        return;
      }

      try {
        setIsDecodingInfo(true);
        console.log(`Intentando decodificar archivo: ${item.name}`);

        // Forzar una limpieza completa de la caché para asegurar datos frescos de la BD
        CodeService.clearCache();

        // Usar exclusivamente la versión asíncrona para obtener de la BD
        const info = await decodeFileNameAsync(item.name);

        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          console.log("Info decodificada:", info);
          setDecodedInfo(info);
          setIsDecodingInfo(false);
        }
      } catch (error) {
        console.error("Error al decodificar nombre de archivo:", error);

        if (isMounted) {
          setIsDecodingInfo(false);
        }
      }
    };

    loadDecodedInfo();

    // Cleanup function para prevenir memory leaks
    return () => {
      isMounted = false;
    };
  }, [item.name]);

  /**
   * Maneja la copia de texto al portapapeles
   * Proporciona feedback visual temporal cuando se completa la copia
   */
  const handleCopyText = () => {
    if (copyTextRef.current && copyText) {
      navigator.clipboard.writeText(copyText).then(
        () => {
          // Feedback visual de éxito
          setIsCopied(true);
          // Restablecer después de 2 segundos
          setTimeout(() => setIsCopied(false), 2000);
        },
        (err) => {
          console.error("Error al copiar texto:", err);
        }
      );
    }
  };

  // Mostrar mensaje si no hay vista previa disponible
  if (!hasPreview) {
    return (
      <div className='text-center text-gray-500'>Imagen no disponible</div>
    );
  }

  return (
    <div className='w-full flex flex-col items-center my-4'>
      {/* Aplicar estilos personalizados para scrollbars */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      {/* Contenedor de la imagen con estado de carga */}
      <div className='relative max-w-full overflow-hidden'>
        {isLoading && (
          <div className='relative w-[280px] h-[400px] bg-zinc-800 rounded-sm overflow-hidden mx-auto'>
            {/* Gradiente animado para efecto de skeleton */}
            <div className='absolute inset-0 bg-linear-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse' />

            {/* Spinner centrado */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='h-10 w-10 text-zinc-400 animate-spin border-2 border-zinc-400 border-t-transparent rounded-full' />
            </div>
          </div>
        )}

        {/* Imagen principal */}
        <Image
          src={getPreviewUrl(item) || "/placeholder.svg"}
          alt={item.displayName}
          className={`max-w-full h-auto object-contain mx-auto ${
            isLoading ? "hidden" : "block"
          }`}
          style={{ maxHeight: "80vh" }}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          fill={false}
          width={800}
          height={600}
          unoptimized={true}
        />

        {/* Botón de descarga flotante (solo si tiene el sufijo correspondiente) */}
        {!isLoading && canDownload && downloadUrl && (
          <button
            onClick={() => {
              if (downloadUrl && decodedInfo) {
                downloadFileWithCustomName(downloadUrl, decodedInfo.fullName);
              } else if (downloadUrl) {
                downloadFileWithCustomName(downloadUrl, item.name);
              }
            }}
            className={`absolute bottom-2 right-2 p-2 rounded-full transition-all duration-200 ${
              downloadStatus === "downloading"
                ? "bg-orange-500 text-white animate-pulse"
                : downloadStatus === "success"
                ? "bg-green-500 text-white"
                : downloadStatus === "error"
                ? "bg-red-500 text-white"
                : "bg-black bg-opacity-70 text-white hover:bg-opacity-90"
            }`}
            title={
              downloadStatus === "downloading"
                ? "Descargando..."
                : downloadStatus === "success"
                ? "¡Descarga completada!"
                : downloadStatus === "error"
                ? "Error en descarga"
                : "Descargar archivo"
            }
            disabled={isDecodingInfo || isDownloading}
          >
            {isDecodingInfo ? (
              <Loader2 className='h-5 w-5 animate-spin' />
            ) : downloadStatus === "downloading" ? (
              <Loader2 className='h-5 w-5 animate-spin' />
            ) : downloadStatus === "success" ? (
              <CheckCircle className='h-5 w-5' />
            ) : downloadStatus === "error" ? (
              <XCircle className='h-5 w-5' />
            ) : (
              <Download className='h-5 w-5' />
            )}
          </button>
        )}
      </div>

      {/* Botones de acción */}
      <div className='w-full max-w-md flex flex-wrap gap-2 mt-4 justify-center'>
        {/* Botón de descarga y detalles */}
        {downloadUrl && (
          <div className='flex'>
            <Button
              className={`rounded-none flex items-center justify-center px-4 py-2 transition-all duration-200 ${
                downloadStatus === "downloading"
                  ? "bg-orange-500 hover:bg-orange-600 text-white animate-pulse"
                  : downloadStatus === "success"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : downloadStatus === "error"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-inside hover:bg-[#bfef33] text-zinc-900"
              }`}
              onClick={() => {
                if (downloadUrl && decodedInfo) {
                  downloadFileWithCustomName(downloadUrl, decodedInfo.fullName);
                } else if (downloadUrl) {
                  downloadFileWithCustomName(downloadUrl, item.name);
                }
              }}
              disabled={isDecodingInfo || isDownloading}
            >
              {isDecodingInfo ? (
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
              ) : downloadStatus === "downloading" ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Descargando...
                </>
              ) : downloadStatus === "success" ? (
                <>
                  <CheckCircle className='h-4 w-4 mr-2' />
                  ¡Completado!
                </>
              ) : downloadStatus === "error" ? (
                <>
                  <XCircle className='h-4 w-4 mr-2' />
                  Error
                </>
              ) : (
                <>
                  <Download className='h-4 w-4 mr-2' />
                  Descargar
                </>
              )}
            </Button>

            {/* Botón de detalles (solo para administradores) */}
            {decodedInfo && isAdmin && (
              <Button
                className='bg-zinc-700 hover:bg-zinc-600 text-white rounded-none w-12 flex items-center justify-center'
                onClick={() => setShowDetails(!showDetails)}
                title='Ver detalles del archivo'
              >
                {showDetails ? (
                  <ChevronUp className='h-24 w-24' />
                ) : (
                  <Plus className='h-24 w-24' />
                )}
              </Button>
            )}
          </div>
        )}

        {/* Botón de copiar texto */}
        {copyText && (
          <Button
            className='bg-zinc-700 hover:bg-zinc-600 text-white rounded-none flex items-center justify-center px-4 py-2'
            onClick={handleCopyText}
          >
            {isCopied ? (
              <>
                <Check className='h-24 w-24 mr-2' />
                Copiado
              </>
            ) : (
              <>
                <Copy className='h-24 w-24 mr-2' />
                Copiar Texto
              </>
            )}
          </Button>
        )}
      </div>

      {/* Área de visualización del texto a copiar */}
      {copyText && (
        <div
          className='w-full max-w-md mt-4 bg-zinc-900 border border-zinc-700 rounded-md p-3 max-h-60 overflow-y-auto'
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#CEFF66 #3f3f46",
            // Estas propiedades son seguras ya que se usan en el CSS de arriba, no para estilos directos
            // @ts-ignore
            "--scrollbar-width": "8px",
            // @ts-ignore
            "--scrollbar-height": "8px",
            // @ts-ignore
            "--scrollbar-track-color": "#3f3f46",
            // @ts-ignore
            "--scrollbar-thumb-color": "#CEFF66",
          }}
        >
          <p className='text-zinc-300 text-sm whitespace-pre-wrap'>
            {copyText}
          </p>
        </div>
      )}

      {/* Textarea oculto para facilitar la copia de texto */}
      {copyText && (
        <textarea
          ref={copyTextRef}
          defaultValue={copyText}
          className='hidden'
          readOnly
        />
      )}

      {/* Sección de detalles del archivo (expandible) */}
      {showDetails && (
        <div className='w-full max-w-md p-2 mt-2 bg-zinc-800 text-xs text-zinc-300 border border-zinc-700 rounded-md'>
          <div className='flex items-center mb-1'>
            <Info className='h-3 w-3 mr-1 text-[#CEFF66]' />
            <span className='font-semibold'>Detalles del archivo:</span>
          </div>

          {isDecodingInfo ? (
            <div className='flex items-center justify-center p-4'>
              <Loader2 className='h-5 w-5 animate-spin mr-2' />
              <span>Cargando datos desde la base de datos...</span>
            </div>
          ) : decodedInfo ? (
            <div className='grid grid-cols-2 gap-x-2 gap-y-1 mt-2'>
              <span className='text-zinc-400'>Cliente:</span>
              <span className='capitalize'>{decodedInfo.client}</span>

              <span className='text-zinc-400'>Campaña:</span>
              <span className='capitalize'>{decodedInfo.campaign}</span>

              <span className='text-zinc-400'>Año:</span>
              <span>{decodedInfo.year}</span>

              <span className='text-zinc-400'>Mes:</span>
              <span>{decodedInfo.month}</span>

              <span className='text-zinc-400'>Categoría:</span>
              <span>{decodedInfo.category}</span>

              <span className='text-zinc-400'>Idioma:</span>
              <span>{decodedInfo.lang}</span>

              <span className='text-zinc-400'>Versión:</span>
              <span>{decodedInfo.version}</span>
            </div>
          ) : (
            <div className='text-center p-2'>
              No se pudo decodificar la información del archivo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
