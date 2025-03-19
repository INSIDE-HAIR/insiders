import React from "react";
import { FileItem } from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileCheck,
  Image as ImageIcon,
} from "lucide-react";

interface GoogleWorkspacePreviewProps {
  file: FileItem;
  className?: string;
}

export function GoogleWorkspacePreview({
  file,
  className,
}: GoogleWorkspacePreviewProps) {
  const getFileIcon = () => {
    const iconSize = 48;

    if (file.mimeType?.includes("document")) {
      return <FileText size={iconSize} className="text-blue-500" />;
    }

    if (file.mimeType?.includes("spreadsheet")) {
      return <FileSpreadsheet size={iconSize} className="text-green-500" />;
    }

    if (file.mimeType?.includes("presentation")) {
      return <Presentation size={iconSize} className="text-orange-500" />;
    }

    if (file.mimeType?.includes("form")) {
      return <FileCheck size={iconSize} className="text-purple-500" />;
    }

    if (file.mimeType?.includes("drawing")) {
      return <ImageIcon size={iconSize} className="text-pink-500" />;
    }

    return <FileText size={iconSize} className="text-gray-400" />;
  };

  const getFileType = () => {
    if (file.mimeType?.includes("document")) return "Documento";
    if (file.mimeType?.includes("spreadsheet")) return "Hoja de cálculo";
    if (file.mimeType?.includes("presentation")) return "Presentación";
    if (file.mimeType?.includes("form")) return "Formulario";
    if (file.mimeType?.includes("drawing")) return "Dibujo";
    return "Documento de Google Workspace";
  };

  return (
    <div className={cn("google-workspace-preview", className)}>
      <div className="preview-container flex flex-col items-center justify-center p-4 bg-gray-50 rounded-md">
        <div className="icon-container mb-2">{getFileIcon()}</div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{getFileType()}</p>
          <p className="text-xs text-gray-500">{file.displayName}</p>
        </div>
      </div>

      {file.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {file.description}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <span>Última modificación: {file.modifiedTime}</span>
      </div>
    </div>
  );
}
