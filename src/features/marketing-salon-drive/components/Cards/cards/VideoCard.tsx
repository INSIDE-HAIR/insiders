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

interface VideoCardProps {
  file: DriveFile;
}

export function VideoCard({ file }: VideoCardProps) {
  const { fileInfo, getCardCode, getFormattedName, getModalTitle } =
    useFileInfo(file.name);
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  // Verificar si tenemos URLs transformadas
  const hasTransformedUrls = file.transformedUrl !== undefined;

  // Obtener un array de posibles URLs para la imagen
  const getImageUrls = () => {
    const urls: string[] = [];

    // Si tenemos URLs transformadas, añadirlas al array
    if (hasTransformedUrls) {
      // Añadir la URL principal de la imagen
      if (file.transformedUrl?.imgEmbed) {
        urls.push(file.transformedUrl.imgEmbed);
      }

      // Añadir URLs alternativas si están disponibles
      if (file.transformedUrl?.alternativeUrls) {
        // URL específica para videos
        if (file.transformedUrl.alternativeUrls.video) {
          urls.push(file.transformedUrl.alternativeUrls.video);
        }
        // URL de Google Photos
        if (file.transformedUrl.alternativeUrls.photos) {
          urls.push(file.transformedUrl.alternativeUrls.photos);
        }
        // URL directa
        if (file.transformedUrl.alternativeUrls.direct) {
          urls.push(file.transformedUrl.alternativeUrls.direct);
        }
        // URL de thumbnail
        if (file.transformedUrl.alternativeUrls.thumbnail) {
          urls.push(file.transformedUrl.alternativeUrls.thumbnail);
        }
        // URL de proxy
        if (file.transformedUrl.alternativeUrls.proxy) {
          urls.push(file.transformedUrl.alternativeUrls.proxy);
        }
      }
    }

    // Añadir el thumbnail directo como última opción
    if (file.thumbnailLink) {
      urls.push(file.thumbnailLink);
    }

    return urls;
  };

  // URL segura para incrustar imágenes
  const getSecureImageUrl = () => {
    const urls = getImageUrls();

    // Si tenemos URLs y el índice actual es válido, devolver la URL correspondiente
    if (urls.length > 0 && currentUrlIndex < urls.length) {
      return urls[currentUrlIndex];
    }

    // Fallback a una URL genérica basada en la extensión
    return "";
  };

  // Función de fallback para mostrar contenido cuando la imagen no carga
  const handleImageError = () => {
    console.error(
      `Error loading image for file: ${file.id}, URL index: ${currentUrlIndex}`
    );

    // Intentar con la siguiente URL si está disponible
    const urls = getImageUrls();
    if (currentUrlIndex < urls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      // Si ya probamos todas las URLs, mostrar el error
      setImageError(true);
    }
  };

  // Función para manejar cuando la imagen se carga correctamente
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Determinar si podemos mostrar una vista previa de imagen
  const canShowPreview = hasTransformedUrls && !imageError;

  return (
    <CardContainer>
      <CardHeader
        fileInfo={fileInfo}
        cardCode={getCardCode()}
        defaultTitle='Video'
      />

      <Dialog>
        <CardPreview onOpenModal={() => setIsOpen(true)}>
          {canShowPreview ? (
            <div
              className='relative w-full bg-zinc-600'
              style={{ height: "200px", maxHeight: "300px" }}
            >
              {imageError ? (
                <div className='absolute inset-0 flex flex-col items-center justify-center text-white bg-zinc-700 p-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-10 w-10 text-red-500 mb-2'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <p className='text-center text-sm'>
                    No se pudo cargar la vista previa
                  </p>
                  <p className='text-center text-xs mt-1 text-gray-400'>
                    {file.name}
                  </p>
                </div>
              ) : !imageLoaded ? (
                <div className='absolute inset-0 flex flex-col items-center justify-center text-white bg-zinc-700'>
                  <div className='animate-pulse flex space-x-2 mb-2'>
                    <div className='h-3 w-3 bg-blue-400 rounded-full'></div>
                    <div className='h-3 w-3 bg-blue-400 rounded-full'></div>
                    <div className='h-3 w-3 bg-blue-400 rounded-full'></div>
                  </div>
                  <p className='text-sm'>Cargando...</p>
                </div>
              ) : null}
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
                style={{ opacity: imageLoaded ? 1 : 0 }}
              />
            </div>
          ) : (
            <div className='relative w-full h-48 bg-zinc-600 py2 flex items-center justify-center text-black'>
              <div className='text-4xl text-zinc-600 py2 font-bold flex flex-col items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-16 w-16 text-blue-500'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M15.562,4.12l-9.346,4.674A1.007,1.007,0,0,0,5.5,9.683v4.634a1.007,1.007,0,0,0,.716.889l9.346,4.675a1,1,0,0,0,1.438-.89V5.01A1,1,0,0,0,15.562,4.12Z' />
                </svg>
                <span className='mt-2 text-sm text-blue-500'>VIDEO</span>
              </div>
            </div>
          )}
        </CardPreview>

        {hasTransformedUrls && (
          <PreviewModal
            file={file}
            isOpen={isOpen}
            title={getModalTitle("video")}
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
