"use client";

import React, { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Upload, X, AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface DropZoneProps {
  folderId: string;
  folderName: string;
  onFilesSelected: (files: File[], folderId: string) => void;
  className?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const WARN_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function DropZone({
  folderId,
  folderName,
  onFilesSelected,
  className,
  disabled = false,
}: DropZoneProps) {
  const { data: session } = useSession();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showFileList, setShowFileList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.name} es demasiado grande (${formatFileSize(
            file.size
          )}). Máximo: 100MB.`
        );
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(`Algunos archivos fueron excluidos:\n\n${errors.join("\n")}`);
    }

    return validFiles;
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        setShowFileList(true);
      }
    },
    [disabled, validateFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = validateFiles(selectedFiles);

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        setShowFileList(true);
      }
    },
    [disabled, validateFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleConfirmUpload = useCallback(() => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles, folderId);
      setSelectedFiles([]);
      setShowFileList(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [selectedFiles, folderId, onFilesSelected]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedFiles([]);
    setShowFileList(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Verificar si el usuario está autorizado
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500'>
        <Upload className='h-12 w-12 mx-auto mb-4' />
        <p>Solo los administradores pueden subir archivos</p>
      </div>
    );
  }

  if (showFileList) {
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const hasLargeFiles = selectedFiles.some(
      (file) => file.size > WARN_FILE_SIZE
    );

    return (
      <div className='border-2 border-blue-300 rounded-lg p-6 bg-blue-50'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-blue-900'>
            Archivos seleccionados ({selectedFiles.length})
          </h3>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCancel}
            className='text-blue-700 hover:text-blue-900'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        {hasLargeFiles && (
          <div className='mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2'>
            <AlertTriangle className='h-5 w-5 text-amber-600 mt-0.5 shrink-0' />
            <div className='text-sm text-amber-800'>
              <p className='font-medium'>Archivos grandes detectados</p>
              <p>
                Los archivos de más de 10MB pueden tardar más tiempo en subirse.
                Asegúrate de tener una conexión estable.
              </p>
            </div>
          </div>
        )}

        <div className='space-y-2 mb-4 max-h-60 overflow-y-auto'>
          {selectedFiles.map((file, index) => {
            const isLarge = file.size > WARN_FILE_SIZE;
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md border",
                  isLarge
                    ? "bg-amber-50 border-amber-200"
                    : "bg-white border-gray-200"
                )}
              >
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {file.name}
                  </p>
                  <div className='flex items-center gap-2 text-xs text-gray-500'>
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.type || "Unknown type"}</span>
                    {isLarge && (
                      <>
                        <span>•</span>
                        <span className='text-amber-600 font-medium'>
                          Archivo grande
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeFile(index)}
                  className='text-gray-500 hover:text-red-600 ml-2'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            );
          })}
        </div>

        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-600'>
            <span className='font-medium'>
              Total: {formatFileSize(totalSize)}
            </span>
            <span className='text-gray-500 ml-2'>destino: {folderName}</span>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmUpload}
              className='bg-blue-600 hover:bg-blue-700'
            >
              <Upload className='h-4 w-4 mr-2' />
              Subir {selectedFiles.length} archivo
              {selectedFiles.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
        isDragOver
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-gray-400",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {isDragOver ? (
        <div className='text-blue-600'>
          <Upload className='h-12 w-12 mx-auto mb-4' />
          <p className='text-lg font-semibold'>Suelta los archivos aquí</p>
          <p className='text-sm text-blue-500'>para subir a: {folderName}</p>
        </div>
      ) : (
        <div className='text-gray-600'>
          <Plus className='h-12 w-12 mx-auto mb-4' />
          <p className='text-lg font-semibold mb-2'>
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className='text-sm text-gray-500 mb-4'>
            Subir a: <span className='font-medium'>{folderName}</span>
          </p>
          <div className='text-xs text-gray-400 space-y-1'>
            <p>Máximo 100MB por archivo</p>
            <p>Formatos: imágenes, videos, audio, documentos PDF/Office</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type='file'
        multiple
        onChange={handleFileChange}
        className='hidden'
        disabled={disabled}
        accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx'
      />
    </div>
  );
}
