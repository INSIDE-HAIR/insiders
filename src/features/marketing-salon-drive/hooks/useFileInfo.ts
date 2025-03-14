import { useState, useEffect } from "react";
import { analyzeFileName } from "../utils/fileAnalyzer";

export function useFileInfo(fileName: string) {
  const [fileInfo, setFileInfo] = useState<any>(null);

  useEffect(() => {
    const info = analyzeFileName(fileName);
    setFileInfo(info);
  }, [fileName]);

  // Generar código para la tarjeta (ES-XX)
  const getCardCode = () => {
    if (fileInfo?.langCode === "01") {
      return `ES-${fileInfo?.fileCode.substring(0, 2) || "XX"}`;
    } else if (fileInfo?.langCode === "02") {
      return `CA-${fileInfo?.fileCode.substring(0, 2) || "XX"}`;
    }
    return `ES-${Math.floor(Math.random() * 99)
      .toString()
      .padStart(2, "0")}`;
  };

  // Obtener nombre formateado
  const getFormattedName = () => {
    // Si no se pudo analizar el nombre, devolver el nombre original
    if (!fileInfo) {
      return fileName;
    }

    let name = fileName;
    if (name.includes(".")) {
      name = name.substring(0, name.lastIndexOf("."));
    }

    // Eliminar números de orden si existen (ej: "01_Archivo" -> "Archivo")
    name = name.replace(/^\d+[_\s-]+/, "");

    // Capitalizar primera letra de cada palabra
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Obtener título para el modal
  const getModalTitle = (fileType: string) => {
    const code = getCardCode();

    if (fileType === "video") {
      return `Video: ${code}`;
    } else if (fileType === "pdf") {
      return `PDF: ${code}`;
    } else if (fileType === "image") {
      return `${fileInfo?.fileType || "Story"}: ${code}`;
    } else {
      return `${fileInfo?.fileType || "Documento"}: ${code}`;
    }
  };

  return {
    fileInfo,
    getCardCode,
    getFormattedName,
    getModalTitle,
  };
}
