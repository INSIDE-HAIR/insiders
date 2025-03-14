"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { DriveFile } from "../../../types/drive";
import { useFileInfo } from "../../../hooks/useFileInfo";
import { CardContainer } from "../common/CardContainer";
import { CardHeader } from "../common/CardHeader";
import { CardPreview } from "../common/CardPreview";
import { CardActions } from "../common/CardActions";
import { PreviewModal } from "../common/PreviewModal";
import { Dialog } from "@/src/components/ui/dialog";

interface ImageCardProps {
  file: DriveFile;
}

export function ImageCard({ file }: ImageCardProps) {
  const { fileInfo, getCardCode, getFormattedName, getModalTitle } =
    useFileInfo(file.name);
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Verificar si tenemos URLs transformadas
  const hasTransformedUrls = file.transformedUrl !== undefined;

  // Estado para controlar las URL de fallback
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  // Array de posibles URLs para la imagen en orden de preferencia
  const getImageUrls = (): string[] => {
    if (!hasTransformedUrls) return [];

    const urls = [file.transformedUrl!.imgEmbed];

    // Si tenemos URLs alternativas, agregarlas al array
    if (file.transformedUrl!.alternativeUrls) {
      urls.push(
        file.transformedUrl!.alternativeUrls.direct,
        file.transformedUrl!.alternativeUrls.thumbnail,
        file.transformedUrl!.alternativeUrls.proxy
      );
    }

    // Si tenemos un thumbnail directo de la API de Drive, agregarlo
    if (file.thumbnailLink) {
      urls.push(file.thumbnailLink);
    }

    return urls.filter(Boolean); // Filtrar valores null/undefined/vacíos
  };

  const imageUrls = getImageUrls();

  // Función de fallback para intentar la siguiente URL cuando la imagen no carga
  const handleImageError = () => {
    console.error(
      `Error loading image for file: ${file.id} with URL index ${currentUrlIndex}`
    );

    // Intentar con la siguiente URL si hay más disponibles
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      // Si ya probamos todas las URLs, marcar como error
      setImageError(true);
    }
  };

  // Función para manejar cuando la imagen se carga correctamente
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // URL segura para incrustar imágenes
  const getSecureImageUrl = () => {
    // Si hay URLs disponibles y el índice actual es válido
    if (imageUrls.length > 0 && currentUrlIndex < imageUrls.length) {
      return imageUrls[currentUrlIndex];
    }

    // Si tenemos un thumbnail directo como último recurso
    if (file.thumbnailLink) {
      return file.thumbnailLink;
    }

    // Fallback a una URL genérica
    return "";
  };

  // Determinar si podemos mostrar una vista previa
  const canShowPreview = hasTransformedUrls && !imageError;

  return (
    <CardContainer>
      <CardHeader
        fileInfo={fileInfo}
        cardCode={getCardCode()}
        defaultTitle='Imagen'
      />

      <Dialog>
        <CardPreview onOpenModal={() => setIsOpen(true)}>
          <div
            className='relative w-full bg-zinc-600'
            style={{ height: "200px", maxHeight: "300px" }}
          >
            {imageError ? (
              // Mostrar mensaje de error si no se pudo cargar la imagen
              <div className='flex flex-col items-center justify-center h-full p-2 text-center'>
                <div className='text-white/80 text-sm mb-1'>
                  No se pudo cargar la imagen
                </div>
                <div className='text-xs text-white/60'>{file.name}</div>
              </div>
            ) : (
              // Intentar cargar la imagen
              <>
                {!imageLoaded && (
                  // Indicador de carga mientras la imagen se está cargando
                  <div className='absolute inset-0 flex items-center justify-center bg-zinc-700/50 z-10'>
                    <div className='animate-pulse flex flex-col items-center'>
                      <div className='h-8 w-8 rounded-full border-2 border-t-transparent border-white/40 animate-spin mb-2'></div>
                      <div className='text-white/80 text-xs'>Cargando...</div>
                    </div>
                  </div>
                )}
                <Image
                  src={getSecureImageUrl()}
                  alt={file.name}
                  fill
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  className='object-contain py-2'
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  unoptimized={true}
                  ref={imageRef}
                />
              </>
            )}
          </div>
        </CardPreview>

        {hasTransformedUrls && (
          <PreviewModal
            file={file}
            isOpen={isOpen}
            title={getModalTitle("image")}
            previewUrl={file.transformedUrl!.preview}
            onClose={() => setIsOpen(false)}
          />
        )}
      </Dialog>

      <CardActions
        file={file}
        fileInfo={fileInfo}
        downloadUrl={hasTransformedUrls ? file.transformedUrl!.download : "#"}
        downloadName={getFormattedName()}
      />
    </CardContainer>
  );
}
