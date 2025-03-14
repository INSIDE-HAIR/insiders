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

interface PDFCardProps {
  file: DriveFile;
}

export function PDFCard({ file }: PDFCardProps) {
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
        // URL de thumbnail (buena para PDFs)
        if (file.transformedUrl.alternativeUrls.thumbnail) {
          urls.push(file.transformedUrl.alternativeUrls.thumbnail);
        }
        // URL directa
        if (file.transformedUrl.alternativeUrls.direct) {
          urls.push(file.transformedUrl.alternativeUrls.direct);
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
        defaultTitle='PDF'
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
                  className='h-16 w-16 text-red-500'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h3v-1h-2v-1h2v-1h-3V10h3V9h-3V7.5h3c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1V10c-.55 0-1-.45-1-1z' />
                </svg>
                <span className='mt-2 text-sm text-red-500'>PDF</span>
              </div>
            </div>
          )}
        </CardPreview>

        {hasTransformedUrls && (
          <PreviewModal
            file={file}
            isOpen={isOpen}
            title={getModalTitle("pdf")}
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
