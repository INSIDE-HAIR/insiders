"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Eye,
  Plus,
  ChevronUp,
  Info,
  Loader2,
  AlertOctagon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import {
  decodeFileName,
  decodeFileNameAsync,
  type DecodedFile,
} from "@/src/features/drive/utils/marketing-salon/file-decoder";
import {
  getTransformedUrl,
  getPreviewUrl,
  getDownloadUrl,
  getDownloadUrlWithDecodedName,
  mimeTypeIncludes,
} from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { downloadFileWithCustomName } from "@/src/features/drive/utils/marketing-salon/file-download-helper";

interface CustomCardProps {
  item: HierarchyItem;
}

/**
 * CustomCard
 *
 * Componente que muestra una tarjeta personalizada para un elemento de contenido.
 * Incluye vista previa, información decodificada, botón de descarga y detalles adicionales.
 *
 * @param {HierarchyItem} item - Elemento de contenido a mostrar en la tarjeta
 * @returns Tarjeta personalizada con información y controles
 */
export function CustomCard({ item }: CustomCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [decodedInfo, setDecodedInfo] = useState<DecodedFile | null>(null);
  const [isDecodingInfo, setIsDecodingInfo] = useState(true);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Cargar la información decodificada de manera asíncrona
  useEffect(() => {
    const loadDecodedInfo = async () => {
      try {
        setIsDecodingInfo(true);
        // Intentar obtener la información de la base de datos
        const info = await decodeFileNameAsync(item.name);
        setDecodedInfo(info);
      } catch (error) {
        console.error("Error al decodificar nombre de archivo:", error);
        // En caso de error, usar la versión sincrónica como fallback
        setDecodedInfo(decodeFileName(item.name));
      } finally {
        setIsDecodingInfo(false);
      }
    };

    loadDecodedInfo();
  }, [item.name]);

  // Determine content type for display
  const getContentType = () => {
    if (mimeTypeIncludes(item, "text")) return "Texto";
    if (mimeTypeIncludes(item, "image")) return "Imagen";
    if (mimeTypeIncludes(item, "pdf")) return "PDF";
    return "Archivo";
  };

  const contentType = getContentType();
  const transformedUrl = getTransformedUrl(item);
  const hasPreview = !!getPreviewUrl(item);
  const hasEmbed = !!transformedUrl?.embed;

  // Determinar qué mostrar en la cabecera y el tipo
  const displayTitle = decodedInfo
    ? `${decodedInfo.lang}-${decodedInfo.version}`
    : item.displayName;
  const displayType = decodedInfo ? decodedInfo.category : contentType;

  /**
   * Simula un error de descarga para pruebas (solo para administradores)
   */
  const simulateDownloadError = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Crear evento de error de descarga
    const event = new CustomEvent("report-download-error", {
      detail: {
        filename: item.displayName,
        url: getDownloadUrl(item) || "URL-simulada-para-pruebas",
      },
    });

    // Disparar el evento
    document.dispatchEvent(event);

    console.log("Simulando error de descarga para:", item.displayName);
  };

  return (
    <div className='flex flex-col w-52 bg-black text-white'>
      {/* Filename at top - now showing language and version if decoded */}
      <div className='p-2 text-xs text-zinc-400 truncate text-center'>
        {isDecodingInfo ? (
          <div className='flex items-center justify-center'>
            <Loader2 className='h-3 w-3 animate-spin mr-1' />
            <span>Cargando...</span>
          </div>
        ) : (
          displayTitle
        )}
      </div>

      {/* Content type in bold - now showing category if decoded */}
      <div className='text-center font-bold mb-2'>{displayType}</div>

      {/* Content area - always use preview URL for thumbnails */}
      <div className='px-2 grow'>
        {hasPreview ? (
          <div
            className='relative cursor-pointer'
            onClick={() => setIsOpen(true)}
          >
            <Image
              src={getPreviewUrl(item) || "/placeholder.svg"}
              alt={item.displayName}
              className='w-full object-cover rounded-sm'
              width={300}
              height={200}
              unoptimized={true}
            />
            <button className='absolute top-1 right-1 bg-white rounded-full p-1'>
              <Eye className='h-4 w-4 text-black' />
            </button>
          </div>
        ) : (
          <div className='bg-zinc-800 p-4 rounded-sm text-zinc-400 flex items-center justify-center min-h-[100px]'>
            {displayType}
          </div>
        )}
      </div>

      {/* Download button and Info button */}
      <div className='p-2 mt-2 flex gap-2 flex-wrap'>
        <Button
          className='flex-1 bg-primary hover:bg-[#bfef33] text-zinc-900 rounded-none flex items-center justify-center'
          onClick={() => {
            const downloadUrl = getDownloadUrl(item);
            if (downloadUrl && decodedInfo) {
              downloadFileWithCustomName(downloadUrl, decodedInfo.fullName);
            } else if (downloadUrl) {
              downloadFileWithCustomName(downloadUrl, item.name);
            }
          }}
          disabled={isDecodingInfo}
        >
          {isDecodingInfo ? (
            <Loader2 className='h-4 w-4 animate-spin mr-2' />
          ) : (
            <Download className='h-4 w-4 mr-2' />
          )}
          Descargar
        </Button>

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

        {/* Botón para simular error de descarga (solo para administradores) */}
        {isAdmin && (
          <Button
            className='w-full bg-rose-700 hover:bg-rose-600 text-white rounded-none flex items-center justify-center mt-2'
            onClick={simulateDownloadError}
            title='Simular error de descarga (solo para administradores)'
          >
            <AlertOctagon className='h-4 w-4 mr-2' />
            Simular Error
          </Button>
        )}
      </div>

      {/* File details section */}
      {showDetails && decodedInfo && isAdmin && (
        <div className='p-2 bg-zinc-800 text-xs text-zinc-300 border-t border-zinc-700'>
          <div className='flex items-center mb-1'>
            <Info className='h-3 w-3 mr-1 text-[#CEFF66]' />
            <span className='font-semibold'>Detalles del archivo:</span>
          </div>
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
        </div>
      )}

      {/* Modal - show both preview and embed images */}
      {hasEmbed && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            className='bg-zinc-900 text-zinc-50 border-zinc-700 p-0 flex flex-col'
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              width: "auto",
              height: "auto",
              overflow: "hidden",
            }}
          >
            <DialogHeader className='p-2'>
              <DialogTitle className='text-center'>{displayTitle}</DialogTitle>
            </DialogHeader>

            <div className='flex-1 flex items-center justify-center overflow-hidden'>
              <Image
                src={getPreviewUrl(item) || "/placeholder.svg"}
                alt={item.displayName}
                className='max-w-full max-h-full object-contain'
                width={800}
                height={600}
                unoptimized={true}
              />
            </div>

            <DialogFooter className='justify-center p-2'>
              <Button
                variant='destructive'
                onClick={() => setIsOpen(false)}
                className='bg-red-900 hover:bg-red-800 rounded-none'
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
