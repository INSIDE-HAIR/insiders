import { HierarchyItem } from "@/src/features/marketing-salon-drive/utils/hierarchyUtils";
import {
  File,
  FileImage,
  FileText,
  FileVideo,
  FileMusic,
  FileArchive,
} from "lucide-react";

interface FileContentProps {
  item: HierarchyItem;
  depth: number;
  onNavigate: () => void;
  marketingCards?: any;
}

/**
 * Componente para mostrar archivos en la jerarquía.
 * Muestra diferentes iconos según el tipo de archivo.
 */
export default function FileContent({
  item,
  depth,
  onNavigate,
  marketingCards,
}: FileContentProps) {
  // Aplicar indentación según la profundidad
  const paddingLeft = `${depth * 1}rem`;

  // Determinar el tipo de archivo basado en la extensión
  const getFileIcon = () => {
    const fileName = item.name.toLowerCase();

    if (fileName.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      return <FileImage size={16} className="text-green-600" />;
    } else if (fileName.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/)) {
      return <FileVideo size={16} className="text-blue-600" />;
    } else if (fileName.match(/\.(mp3|wav|ogg|flac)$/)) {
      return <FileMusic size={16} className="text-purple-600" />;
    } else if (fileName.match(/\.(zip|rar|tar|gz|7z)$/)) {
      return <FileArchive size={16} className="text-amber-600" />;
    } else if (fileName.match(/\.(txt|pdf|doc|docx|xls|xlsx|ppt|pptx)$/)) {
      return <FileText size={16} className="text-blue-500" />;
    } else {
      return <File size={16} className="text-gray-600" />;
    }
  };

  // Extraer información del archivo del marketingCards si está disponible
  const fileInfo = marketingCards?.files?.find(
    (file: any) => file.id === item.id
  );
  const hasPreview = fileInfo?.transformedUrl?.preview;

  return (
    <div
      className="file-content p-2 rounded hover:bg-gray-100 cursor-pointer flex items-center"
      style={{ paddingLeft }}
      onClick={onNavigate}
    >
      <div className="mr-2">{getFileIcon()}</div>
      <div className="flex-1 overflow-hidden">
        <div className="text-sm truncate">{item.name}</div>

        {/* Mostrar información adicional si está disponible */}
        {fileInfo && (
          <div className="text-xs text-gray-500 truncate">
            {fileInfo.mimeType}
          </div>
        )}
      </div>

      {/* Añadir botón de vista previa si está disponible */}
      {hasPreview && (
        <button
          className="ml-2 text-xs text-blue-600 hover:text-blue-800"
          onClick={(e) => {
            e.stopPropagation();
            window.open(fileInfo.transformedUrl.preview, "_blank");
          }}
        >
          Vista previa
        </button>
      )}
    </div>
  );
}
