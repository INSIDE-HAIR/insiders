"use client";

import React from "react";
import { EnhancedDropZone, UploadFileItem } from "./EnhancedDropZone";

interface EnhancedFileUploadManagerProps {
  folderId: string;
  folderName: string;
  className?: string;
  onUploadComplete?: (files: UploadFileItem[]) => void;
}

export function EnhancedFileUploadManager({
  folderId,
  folderName,
  className,
  onUploadComplete,
}: EnhancedFileUploadManagerProps) {
  const handleUploadComplete = (files: UploadFileItem[]) => {
    // Callback para cuando se completen las cargas
    if (onUploadComplete) {
      onUploadComplete(files);
    }

    // Aquí podrías añadir lógica adicional como:
    // - Notificaciones toast
    // - Refrescar el contenido de la carpeta
    // - Analytics/logging
    console.log(
      `Successfully uploaded ${files.length} files to folder ${folderName}`
    );
  };

  return (
    <EnhancedDropZone
      folderId={folderId}
      folderName={folderName}
      className={className}
      onUploadComplete={handleUploadComplete}
    />
  );
}
