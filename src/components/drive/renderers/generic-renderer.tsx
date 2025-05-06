"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  File,
  Eye,
  Plus,
  ChevronUp,
  Info,
  Presentation,
  Copy,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { isFileItem } from "@/src/features/drive/types/hierarchy";
import {
  decodeFileName,
  decodeFileNameAsync,
  type DecodedFile,
} from "@/src/features/drive/utils/marketing-salon/file-decoder";
import { CodeService } from "@/src/features/drive/utils/marketing-salon/file-decoder-service";
import { extractCopyText } from "@/src/features/drive/utils/marketing-salon/description-parser";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
// Actualizar la importación de ImageBlurUp
import { ImageBlurUp } from "@/src/components/drive/ui/image-components/image-blur-up";
import { GoogleSlidesRenderer } from "@/src/components/drive/renderers/google-slides-renderer";
import { scrollbarStyles } from "./direct-image-renderer";
import {
  getDownloadUrl,
  getPreviewUrl,
  getEmbedUrl,
  getPreviewItems,
  hasMultiplePreviews,
  getDownloadUrlWithDecodedName,
} from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";
import Image from "next/image";
import { downloadFileWithCustomName } from "@/src/features/drive/utils/marketing-salon/file-download-helper";
import { ReportErrorModal } from "@/src/components/drive/report-error-modal";

interface GenericRendererProps {
  item: HierarchyItem;
  contentType: string;
}

/**
 * GenericRenderer
 *
 * Componente versátil para renderizar cualquier tipo de contenido no especializado.
 * Proporciona una interfaz consistente para visualizar archivos de diferentes tipos.
 *
 * Características:
 * - Visualización en formato de tarjeta con vista previa
 * - Modal para visualización ampliada
 * - Soporte para copiar texto asociado al portapapeles
 * - Visualización de metadatos decodificados del nombre del archivo
 * - Estados de carga con feedback visual
 * - Adaptación según el tipo de contenido
 * - Carrusel para múltiples imágenes de previsualización
 *
 * @param {HierarchyItem} item - Elemento de contenido a renderizar
 * @param {string} contentType - Tipo de contenido para mostrar en la interfaz
 * @returns Tarjeta con vista previa y controles adaptados al tipo de contenido
 */
export function GenericRenderer({ item, contentType }: GenericRendererProps) {
  // Estados para controlar la interacción y feedback visual
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isCardImageLoading, setIsCardImageLoading] = useState(true);
  const [isModalImageLoading, setIsModalImageLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [currentCardPreviewIndex, setCurrentCardPreviewIndex] = useState(0);
  const [currentModalPreviewIndex, setCurrentModalPreviewIndex] = useState(0);
  const [decodedInfo, setDecodedInfo] = useState<DecodedFile | null>(null);
  const [isDecodingInfo, setIsDecodingInfo] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const copyTextRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Extraer el texto a copiar desde el campo description
  const copyText = extractCopyText(item);

  // Verificar si hay múltiples imágenes de previsualización
  const multiplePreviewsAvailable = hasMultiplePreviews(item);
  const previewItems = getPreviewItems(item);

  // Obtener la imagen de previsualización actual para la tarjeta
  const currentCardPreview =
    previewItems && previewItems.length > 0
      ? previewItems[currentCardPreviewIndex]
      : null;

  // Obtener la imagen de previsualización actual para el modal
  const currentModalPreview =
    previewItems && previewItems.length > 0
      ? previewItems[currentModalPreviewIndex]
      : null;

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
        // Pasar el mimeType si está disponible
        const info = await decodeFileNameAsync(
          item.name,
          isFileItem(item) ? item.mimeType : undefined
        );

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
  }, [item.name, item.mimeType]);

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

  /**
   * Navega a la siguiente imagen de previsualización en la tarjeta
   */
  const nextCardPreview = () => {
    if (previewItems && previewItems.length > 0) {
      setIsCardImageLoading(true);
      setCurrentCardPreviewIndex((prev) => (prev + 1) % previewItems.length);
    }
  };

  /**
   * Navega a la imagen de previsualización anterior en la tarjeta
   */
  const prevCardPreview = () => {
    if (previewItems && previewItems.length > 0) {
      setIsCardImageLoading(true);
      setCurrentCardPreviewIndex(
        (prev) => (prev - 1 + previewItems.length) % previewItems.length
      );
    }
  };

  /**
   * Navega a la siguiente imagen de previsualización en el modal
   */
  const nextModalPreview = () => {
    if (previewItems && previewItems.length > 0) {
      setIsModalImageLoading(true);
      setCurrentModalPreviewIndex((prev) => (prev + 1) % previewItems.length);
    }
  };

  /**
   * Navega a la imagen de previsualización anterior en el modal
   */
  const prevModalPreview = () => {
    if (previewItems && previewItems.length > 0) {
      setIsModalImageLoading(true);
      setCurrentModalPreviewIndex(
        (prev) => (prev - 1 + previewItems.length) % previewItems.length
      );
    }
  };

  // Dimensiones fijas para el modal
  const modalWidth = 800;
  const modalHeight = 600;

  // Verificar disponibilidad de recursos
  const hasPreview =
    (currentCardPreview && getPreviewUrl(currentCardPreview)) ||
    getPreviewUrl(item);
  const hasEmbed =
    (currentModalPreview && getEmbedUrl(currentModalPreview)) ||
    getEmbedUrl(item);

  // Determinar qué mostrar en la cabecera y el tipo
  const displayTitle = decodedInfo
    ? `${decodedInfo.lang}-${decodedInfo.version}`
    : item.displayName;
  const displayType = decodedInfo ? decodedInfo.category : contentType;

  /**
   * Maneja la carga de la imagen en el modal
   * Añade un pequeño retraso para garantizar una transición suave
   */
  const handleImageLoad = () => {
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      setIsModalImageLoading(false);
    }, 300);
  };

  /**
   * Maneja la carga de la imagen en la tarjeta
   */
  const handleCardImageLoad = () => {
    setIsCardImageLoading(false);
  };

  // Preload image when modal is opened
  useEffect(() => {
    if (isOpen && hasEmbed) {
      setIsModalImageLoading(true);
      const img = new window.Image();
      img.onload = handleImageLoad;
      img.onerror = () => setIsModalImageLoading(false);
      img.crossOrigin = "anonymous"; // Evitar problemas CORS

      // Usar la URL de la imagen de previsualización actual si está disponible
      const imageUrl =
        (currentModalPreview && getEmbedUrl(currentModalPreview)) ||
        getEmbedUrl(item);
      if (imageUrl) {
        img.src = imageUrl;
      }
    }
  }, [
    isOpen,
    hasEmbed,
    currentModalPreview,
    currentModalPreviewIndex,
    item,
    getEmbedUrl,
  ]);

  // Sincronizar índices de previsualización al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentModalPreviewIndex(currentCardPreviewIndex);
    }
  }, [isOpen, currentCardPreviewIndex]);

  /**
   * Determina el icono a mostrar según el tipo de contenido
   * @returns Componente de icono apropiado para el tipo de contenido
   */
  const getFileIcon = () => {
    if (contentType === "Presentación") {
      return <Presentation className="h-12 w-12 text-zinc-500" />;
    } else if (contentType === "PDF") {
      return <FileText className="h-12 w-12 text-zinc-500" />;
    } else {
      return <File className="h-12 w-12 text-zinc-500" />;
    }
  };

  // Obtener la URL de previsualización actual para la tarjeta
  const cardPreviewUrl =
    (currentCardPreview && getPreviewUrl(currentCardPreview)) ||
    getPreviewUrl(item) ||
    "";

  // Obtener la URL de previsualización actual para el modal
  const modalPreviewUrl =
    (currentModalPreview && getPreviewUrl(currentModalPreview)) ||
    getPreviewUrl(item) ||
    "";

  return (
    <div className="flex flex-col w-52 bg-black text-white relative">
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      {/* Botón de reporte de error absoluto relativo a toda la tarjeta */}
      <div
        className="absolute right-2 top-2 z-20 rounded-full p-1 cursor-pointer bg-black bg-opacity-30 hover:bg-opacity-50"
        onClick={(e) => {
          e.stopPropagation();
          setIsReportModalOpen(true);
        }}
      >
        <AlertTriangle className="h-4 w-4 text-red-600 hover:text-red-500" />
      </div>

      {/* Filename at top - now showing language and version if decoded */}
      <div className="p-2 text-xs text-zinc-400 truncate text-center">
        {isDecodingInfo ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            <span>Cargando...</span>
          </div>
        ) : (
          displayTitle
        )}
      </div>

      {/* Content type in bold - now showing category if decoded */}
      <div className="text-center font-bold mb-2">{displayType}</div>

      {/* Content area - always use preview URL for thumbnails */}
      <div className="px-2 flex-grow">
        {hasPreview ? (
          <div
            className="relative cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            {isCardImageLoading && (
              <div className="absolute inset-0 overflow-hidden rounded-sm">
                {/* Skeleton para la tarjeta */}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 text-zinc-400 animate-spin border-2 border-zinc-400 border-t-transparent rounded-full" />
                </div>
              </div>
            )}
            <Image
              src={cardPreviewUrl || "/placeholder.svg"}
              alt={item.displayName}
              className="w-full object-cover rounded-sm"
              onLoadingComplete={handleCardImageLoad}
              onError={() => setIsCardImageLoading(false)}
              width={300}
              height={200}
              unoptimized={true}
            />
            <button className="absolute top-1 right-1 bg-white rounded-full p-1">
              <Eye className="h-4 w-4 text-black" />
            </button>

            {/* Controles de navegación del carrusel para la tarjeta */}
            {multiplePreviewsAvailable && (
              <>
                <button
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevCardPreview();
                  }}
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </button>
                <button
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextCardPreview();
                  }}
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>

                {/* Indicadores de posición */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                  {previewItems?.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full ${
                        index === currentCardPreviewIndex
                          ? "bg-inside"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-zinc-800 p-4 rounded-sm text-zinc-400 flex items-center justify-center min-h-[100px]">
            {getFileIcon()}
          </div>
        )}
      </div>

      {/* Download button y Info button - Siempre mostrar descarga */}
      <div className="p-2 mt-2 flex gap-2 flex-wrap">
        {getDownloadUrl(item) && (
          <div className="flex w-full">
            <Button
              className="flex-1 bg-inside hover:bg-[#bfef33] text-zinc-900 rounded-none flex items-center justify-center"
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
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Descargar
            </Button>

            {decodedInfo && isAdmin && (
              <Button
                className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-none w-12 flex items-center justify-center"
                onClick={() => setShowDetails(!showDetails)}
                title="Ver detalles del archivo"
              >
                {showDetails ? (
                  <ChevronUp className="h-24 w-24" />
                ) : (
                  <Plus className="h-24 w-24" />
                )}
              </Button>
            )}
          </div>
        )}

        {copyText && (
          <Button
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white rounded-none flex items-center justify-center"
            onClick={handleCopyText}
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Texto
              </>
            )}
          </Button>
        )}

        {/* Textarea oculto para facilitar la copia de texto */}
        {copyText && (
          <textarea
            ref={copyTextRef}
            defaultValue={copyText}
            className="hidden"
            readOnly
          />
        )}
      </div>

      {/* Mostrar el texto a copiar con scrollbar personalizado */}
      {copyText && (
        <div
          className="p-2 bg-zinc-900 border border-zinc-700 rounded-md mt-2 max-h-40 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#CEFF66 #3f3f46",
            // @ts-ignore - Estas propiedades son seguras ya que se usan en el CSS de arriba
            "--scrollbar-width": "8px",
            // @ts-ignore
            "--scrollbar-height": "8px",
            // @ts-ignore
            "--scrollbar-track-color": "#3f3f46",
            // @ts-ignore
            "--scrollbar-thumb-color": "#CEFF66",
          }}
        >
          <p className="text-zinc-300 text-xs whitespace-pre-wrap">
            {copyText}
          </p>
        </div>
      )}

      {/* Sección de detalles del archivo (expandible) */}
      {showDetails && (
        <div className="p-2 bg-zinc-800 text-xs text-zinc-300 border-t border-zinc-700 mt-2">
          <div className="flex items-center mb-1">
            <Info className="h-3 w-3 mr-1 text-[#CEFF66]" />
            <span className="font-semibold">Detalles del archivo:</span>
          </div>

          {isDecodingInfo ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Cargando datos desde la base de datos...</span>
            </div>
          ) : decodedInfo ? (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
              <span className="text-zinc-400">Cliente:</span>
              <span className="capitalize">{decodedInfo.client}</span>

              <span className="text-zinc-400">Campaña:</span>
              <span className="capitalize">{decodedInfo.campaign}</span>

              <span className="text-zinc-400">Año:</span>
              <span>{decodedInfo.year}</span>

              <span className="text-zinc-400">Mes:</span>
              <span>{decodedInfo.month}</span>

              <span className="text-zinc-400">Categoría:</span>
              <span>{decodedInfo.category}</span>

              <span className="text-zinc-400">Idioma:</span>
              <span>{decodedInfo.lang}</span>

              <span className="text-zinc-400">Versión:</span>
              <span>{decodedInfo.version}</span>
            </div>
          ) : (
            <div className="text-center p-2">
              No se pudo decodificar la información del archivo
            </div>
          )}
        </div>
      )}

      {/* Modal para visualización ampliada */}
      {hasEmbed && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            className="bg-zinc-900 text-zinc-50 border-zinc-700 p-0 flex flex-col"
            style={{
              width: `${modalWidth}px`,
              maxWidth: "90vw",
              height: "auto",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            <DialogHeader className="p-2">
              <DialogTitle className="text-center">{displayTitle}</DialogTitle>
            </DialogHeader>

            <div
              className="flex-1 flex items-center justify-center overflow-auto p-4 relative"
              style={{ minHeight: "70vh", maxHeight: "calc(90vh - 100px)" }}
            >
              {contentType === "Presentación" ? (
                <GoogleSlidesRenderer item={item} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative w-full max-w-[600px] h-[400px] flex items-center justify-center">
                    <ImageBlurUp
                      src={modalPreviewUrl || "/placeholder.svg"}
                      alt={item.displayName}
                      isLoading={isModalImageLoading}
                      onLoad={handleImageLoad}
                      onError={() => setIsModalImageLoading(false)}
                    />

                    {/* Controles de navegación del carrusel para el modal */}
                    {multiplePreviewsAvailable && !isModalImageLoading && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 z-10"
                          onClick={prevModalPreview}
                        >
                          <ChevronLeft className="h-6 w-6 text-white" />
                        </button>
                        <button
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 z-10"
                          onClick={nextModalPreview}
                        >
                          <ChevronRight className="h-6 w-6 text-white" />
                        </button>

                        {/* Indicadores de posición en el modal */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 z-10 pb-1">
                          {previewItems?.map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 w-2 rounded-full ${
                                index === currentModalPreviewIndex
                                  ? "bg-inside"
                                  : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="justify-center p-2">
              <Button
                variant="destructive"
                onClick={() => setIsOpen(false)}
                className="bg-red-900 hover:bg-red-800 rounded-none"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de reporte de error */}
      <ReportErrorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        fileName={item.displayName}
        fileId={isFileItem(item) ? item.id : undefined}
        isFileReport={true}
      />
    </div>
  );
}
