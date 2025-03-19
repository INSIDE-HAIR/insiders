import React from "react";
import { FileItem } from "@drive/types/hierarchy";
import { FilePreview } from "../preview/FilePreview";
import { MediaPreview } from "../preview/MediaPreview";
import { GoogleWorkspacePreview } from "../preview/GoogleWorkspacePreview";
import { cn } from "@/src/lib/utils";

interface FileElementProps {
  file: FileItem;
  className?: string;
  onItemClick?: (item: FileItem) => void;
}

export function FileElement({
  file,
  className,
  onItemClick,
}: FileElementProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onItemClick?.(file);
  };

  // Determinar el tipo de archivo
  const isMedia =
    file.mimeType?.startsWith("image/") ||
    file.mimeType?.startsWith("video/") ||
    file.mimeType?.startsWith("audio/");

  const isGoogleWorkspace = file.mimeType?.includes("google-apps");

  return (
    <div
      className={cn(
        "file-element p-4 rounded-lg border hover:border-blue-500 transition-colors",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
        <span className="font-medium">{file.displayName}</span>
      </div>

      {isMedia && <MediaPreview file={file} />}

      {isGoogleWorkspace && <GoogleWorkspacePreview file={file} />}

      {!isMedia && !isGoogleWorkspace && <FilePreview file={file} />}
    </div>
  );
}

function getFileIcon(mimeType?: string): string {
  if (!mimeType) return "📄";

  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📑";
  if (mimeType.includes("spreadsheet")) return "📊";
  if (mimeType.includes("document")) return "📝";
  if (mimeType.includes("presentation")) return "📽️";
  if (mimeType.includes("form")) return "📋";
  if (mimeType.includes("drawing")) return "🎨";
  if (mimeType.includes("script")) return "📜";
  if (mimeType.includes("archive")) return "📦";
  if (mimeType.includes("font")) return "📝";
  if (mimeType.includes("text")) return "📄";

  return "📄";
}
