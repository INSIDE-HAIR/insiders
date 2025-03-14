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

interface DocumentCardProps {
  file: DriveFile;
}

export function DocumentCard({ file }: DocumentCardProps) {
  const { fileInfo, getCardCode, getFormattedName, getModalTitle } =
    useFileInfo(file.name);
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Verificar si tenemos URLs transformadas
  const hasTransformedUrls = file.transformedUrl !== undefined;

  // URL segura para incrustar imágenes
  const getSecureImageUrl = () => {
    // Si tenemos una URL transformada, usarla
    if (hasTransformedUrls && file.transformedUrl?.imgEmbed) {
      return file.transformedUrl.imgEmbed;
    }
    // Si tenemos un thumbnail directo, intentar usarlo
    if (file.thumbnailLink) {
      return file.thumbnailLink;
    }
    // Fallback a una URL genérica basada en la extensión
    return "";
  };

  // Función de fallback para mostrar contenido cuando la imagen no carga
  const handleImageError = () => {
    console.error(`Error loading image for file: ${file.id}`);
    setImageError(true);
  };

  // Función para manejar cuando la imagen se carga correctamente
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Obtener la extensión del archivo
  const getFileExtension = (fileName: string) => {
    return fileName.split(".").pop()?.toUpperCase() || "";
  };

  const extension = getFileExtension(file.name);

  // Determinar si podemos mostrar una vista previa de imagen
  const canShowPreview = hasTransformedUrls && !imageError;

  return (
    <CardContainer>
      <CardHeader
        fileInfo={fileInfo}
        cardCode={getCardCode()}
        defaultTitle={`Documento ${extension}`}
      />

      <Dialog>
        <CardPreview onOpenModal={() => setIsOpen(true)}>
          {canShowPreview ? (
            <div
              className='relative w-full bg-zinc-600'
              style={{ height: "200px", maxHeight: "300px" }}
            >
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
            </div>
          ) : (
            <div className='relative w-full h-48 bg-zinc-600 py2 flex items-center justify-center text-black'>
              <div className='text-4xl text-zinc-600 py2 font-bold flex flex-col items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-16 w-16 text-blue-700'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 14H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1z' />
                </svg>
                <span className='mt-2 text-sm'>{extension}</span>
              </div>
            </div>
          )}
        </CardPreview>

        {hasTransformedUrls && (
          <PreviewModal
            file={file}
            isOpen={isOpen}
            title={getModalTitle("document")}
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
