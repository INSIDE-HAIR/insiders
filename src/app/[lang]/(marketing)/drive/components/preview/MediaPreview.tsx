import React from "react";
import { FileItem } from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { Image as ImageIcon, Video, Music } from "lucide-react";
import Image from "next/image";

interface MediaPreviewProps {
  file: FileItem;
  className?: string;
}

export function MediaPreview({ file, className }: MediaPreviewProps) {
  const isImage = file.mimeType?.startsWith("image/");
  const isVideo = file.mimeType?.startsWith("video/");
  const isAudio = file.mimeType?.startsWith("audio/");

  const getPreviewContent = () => {
    if (file.thumbnailLink) {
      if (isImage) {
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

      if (isVideo) {
        return (
          <div className="preview-video-container aspect-video relative rounded-md overflow-hidden">
            <video
              src={file.thumbnailLink}
              controls
              className="w-full h-full"
            />
          </div>
        );
      }

      if (isAudio) {
        return (
          <div className="preview-audio-container p-4 bg-gray-100 rounded-md">
            <audio src={file.thumbnailLink} controls className="w-full" />
          </div>
        );
      }
    }

    // Si no hay vista previa, mostrar un icono según el tipo de medio
    return (
      <div className="preview-icon-container flex items-center justify-center aspect-video bg-gray-100 rounded-md">
        {isImage ? (
          <ImageIcon size={48} className="text-gray-400" />
        ) : isVideo ? (
          <Video size={48} className="text-gray-400" />
        ) : isAudio ? (
          <Music size={48} className="text-gray-400" />
        ) : null}
      </div>
    );
  };

  return (
    <div className={cn("media-preview", className)}>
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
