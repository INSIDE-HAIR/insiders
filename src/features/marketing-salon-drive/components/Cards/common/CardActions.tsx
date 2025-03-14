"use client";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { DriveFile } from "../../../types/drive";

interface CardActionsProps {
  file: DriveFile;
  fileInfo: any;
  downloadUrl: string;
  downloadName: string;
}

export function CardActions({
  file,
  fileInfo,
  downloadUrl,
  downloadName,
}: CardActionsProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* Barra inferior con botones */}
      <div className='p-2 flex justify-between items-center'>
        {/* Botón de descarga */}
        <a
          href={downloadUrl}
          download={downloadName}
          className='bg-[#B9F264] text-black px-4 py-2 font-medium text-sm rounded-none hover:bg-[#a7e052] transition-colors'
          target='_blank'
          rel='noopener noreferrer'
        >
          Descargar
        </a>

        {/* Botón de información detallada (solo si tenemos información para mostrar) */}
        {fileInfo && (
          <Button
            className='bg-transparent hover:bg-transparent flex items-center justify-center px-2'
            aria-label='Ver información detallada'
            onClick={() => setShowDetails(!showDetails)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='text-[#B9F264]'
            >
              <line x1='12' y1='5' x2='12' y2='19'></line>
              <line x1='5' y1='12' x2='19' y2='12'></line>
            </svg>
          </Button>
        )}
      </div>

      {/* Accordion de detalles (solo visible si showDetails es true y tenemos fileInfo) */}
      {showDetails && fileInfo && (
        <div className='p-4 bg-zinc-800 border-t border-zinc-700'>
          <h3 className='font-bold text-sm border-b border-zinc-600 pb-2 mb-2'>
            Detalles del contenido
          </h3>

          <div className='text-sm space-y-1 text-zinc-300'>
            <p>
              <span className='font-semibold'>Cliente:</span>{" "}
              {fileInfo.clientName}
            </p>
            <p>
              <span className='font-semibold'>Campaña:</span>{" "}
              {fileInfo.campaignName}
            </p>
            <p>
              <span className='font-semibold'>Fecha:</span> 20{fileInfo.year}/
              {fileInfo.month}
            </p>
            <p>
              <span className='font-semibold'>Tipo:</span> {fileInfo.fileType}
            </p>
            <p>
              <span className='font-semibold'>Código:</span> {fileInfo.fileCode}
            </p>
            <p>
              <span className='font-semibold'>Idioma:</span> {fileInfo.language}
            </p>
            {fileInfo.family && (
              <p>
                <span className='font-semibold'>Familia:</span>{" "}
                {fileInfo.family}
              </p>
            )}
            {fileInfo.version && (
              <p>
                <span className='font-semibold'>Versión:</span>{" "}
                {fileInfo.version}
              </p>
            )}
            <p className='text-xs text-zinc-400 pt-2'>
              Nombre original: {file.name}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
