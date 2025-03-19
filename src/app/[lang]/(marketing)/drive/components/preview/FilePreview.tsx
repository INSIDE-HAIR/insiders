import React from "react";
import { FileItem } from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { FileText, FileCode, FileArchive, FileSpreadsheet } from "lucide-react";
import Image from "next/image";

interface FilePreviewProps {
  file: FileItem;
  className?: string;
}

export function FilePreview({ file, className }: FilePreviewProps) {
  const getPreviewContent = () => {
    // Si el archivo tiene una vista previa, mostrarla
    if (file.thumbnailLink) {
      return (
        <div className="preview-image-container aspect-video relative rounded-md overflow-hidden">
          <Image
            src={file.thumbnailLink}
            alt={file.displayName}
            className="object-cover w-full h-full"
            width={100}
            height={100}
          />
        </div>
      );
    }

    // Si no hay vista previa, mostrar un icono según el tipo de archivo
    return (
      <div className="preview-icon-container flex items-center justify-center aspect-video bg-gray-100 rounded-md">
        {getFileIcon()}
      </div>
    );
  };

  const getFileIcon = () => {
    const iconSize = 48;

    if (file.mimeType?.includes("text")) {
      return <FileText size={iconSize} className="text-gray-400" />;
    }

    if (file.mimeType?.includes("code")) {
      return <FileCode size={iconSize} className="text-gray-400" />;
    }

    if (file.mimeType?.includes("archive")) {
      return <FileArchive size={iconSize} className="text-gray-400" />;
    }

    if (file.mimeType?.includes("spreadsheet")) {
      return <FileSpreadsheet size={iconSize} className="text-gray-400" />;
    }

    return <FileText size={iconSize} className="text-gray-400" />;
  };

  return (
    <div className={cn("file-preview", className)}>
      {getPreviewContent()}

      {file.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {file.description}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <span>{file.size}</span>
        <span>•</span>
        <span>{file.modifiedTime}</span>
      </div>
    </div>
  );
}
