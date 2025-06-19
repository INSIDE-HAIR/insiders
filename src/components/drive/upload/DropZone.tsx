"use client";

import React, { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface DropZoneProps {
  folderId: string;
  folderName: string;
  onFilesSelected: (files: File[], folderId: string) => void;
  className?: string;
  disabled?: boolean;
}

interface DragState {
  isDragOver: boolean;
  isDragActive: boolean;
}

export function DropZone({
  folderId,
  folderName,
  onFilesSelected,
  className,
  disabled = false,
}: DropZoneProps) {
  const { data: session } = useSession();
  const [dragState, setDragState] = useState<DragState>({
    isDragOver: false,
    isDragActive: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragState({
        isDragOver: true,
        isDragActive: true,
      });
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setDragState({
        isDragOver: false,
        isDragActive: false,
      });
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setDragState({
        isDragOver: false,
        isDragActive: false,
      });
      dragCounter.current = 0;

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files, folderId);
      }
    },
    [disabled, folderId, onFilesSelected]
  );

  const handleFileSelect = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFilesSelected(files, folderId);
      }
      // Reset input value para permitir subir el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [folderId, onFilesSelected]
  );

  // Solo mostrar para administradores
  const isAdmin = session?.user?.role === "ADMIN";
  if (!isAdmin) return null;

  return (
    <div
      className={cn(
        "relative group transition-all duration-200 ease-in-out",
        "border-2 border-dashed rounded-lg",
        "hover:border-primary/70 hover:bg-primary/5",
        dragState.isDragActive
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-primary/30",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className='flex flex-col items-center justify-center py-8 px-4 text-center'>
        {/* Icono central */}
        <div
          className={cn(
            "w-12 h-12 rounded-full border-2 border-primary/40 flex items-center justify-center mb-3",
            "transition-all duration-200 group-hover:border-primary group-hover:bg-primary/10",
            dragState.isDragActive && "border-primary bg-primary/20 scale-110"
          )}
        >
          {dragState.isDragActive ? (
            <Upload className='w-6 h-6 text-primary' />
          ) : (
            <Plus className='w-6 h-6 text-primary/70 group-hover:text-primary' />
          )}
        </div>

        {/* Texto principal */}
        <div className='space-y-1'>
          <p className='text-sm font-medium text-gray-700'>
            {dragState.isDragActive
              ? "Suelta los archivos aquí"
              : "Subir archivos a Drive"}
          </p>
          <p className='text-xs text-gray-500'>
            Destino: <span className='font-medium'>{folderName}</span>
          </p>
          <p className='text-xs text-gray-400'>
            Arrastra archivos aquí o{" "}
            <button
              type='button'
              onClick={handleFileSelect}
              disabled={disabled}
              className='text-primary hover:text-primary/80 underline font-medium'
            >
              selecciona archivos
            </button>
          </p>
        </div>

        {/* Indicador visual para drag active */}
        {dragState.isDragActive && (
          <div className='absolute inset-0 border-2 border-primary rounded-lg bg-primary/5 flex items-center justify-center'>
            <div className='bg-white rounded-lg px-4 py-2 shadow-lg border'>
              <p className='text-primary font-medium text-sm'>
                📁 Soltar en &quot;{folderName}&quot;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input file oculto */}
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
