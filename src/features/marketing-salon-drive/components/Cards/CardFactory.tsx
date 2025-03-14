"use client";
import { DriveFile } from "../../types/drive";
import { ImageCard } from "./cards/ImageCard";
import { PDFCard } from "./cards/PDFCard";
import { VideoCard } from "./cards/VideoCard";
import { DocumentCard } from "./cards/DocumentCard";
import { DefaultCard } from "./cards/DefaultCard";

interface CardFactoryProps {
  file: DriveFile;
}

export function CardFactory({ file }: CardFactoryProps) {
  // Determinar el tipo de archivo basado en la extensión
  const getFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    // Imágenes
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
      return "image";
    }

    // PDFs
    if (extension === "pdf") {
      return "pdf";
    }

    // Videos
    if (["mp4", "webm", "avi", "mov", "wmv", "mkv"].includes(extension)) {
      return "video";
    }

    // Documentos
    if (
      ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "rtf"].includes(
        extension
      )
    ) {
      return "document";
    }

    // Tipo por defecto
    return "default";
  };

  // Obtener el tipo de archivo
  const fileType = getFileType(file.name);

  // Renderizar el componente adecuado según el tipo de archivo
  switch (fileType) {
    case "image":
      return <ImageCard file={file} />;
    case "pdf":
      return <PDFCard file={file} />;
    case "video":
      return <VideoCard file={file} />;
    case "document":
      return <DocumentCard file={file} />;
    default:
      return <DefaultCard file={file} />;
  }
}
