import React from "react";
import { FileItem } from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { Prefix } from "@drive/types/prefix";
import { Suffix } from "@drive/types/suffix";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { toast } from "@ui/use-toast";

interface FileElementProps {
  file: FileItem;
  className?: string;
  onItemClick?: (item: FileItem) => void;
  isNested?: boolean;
}

export function FileElement({
  file,
  className,
  onItemClick,
  isNested = false,
}: FileElementProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onItemClick?.(file);
  };

  // Copiar ID al portapapeles
  const copyIdToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.id);
    toast({
      title: "ID copiado",
      description: `${file.id} copiado al portapapeles`,
      duration: 2000,
    });
  };

  // Abrir el enlace en una nueva pestaña
  const openInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/drive/${file.id}`, "_blank");
  };

  return (
    <div
      className={cn(
        "group/file rounded-md border border-gray-200 transition-all duration-200 py-1 px-2",
        { "border-l-[3px]": !isNested },
        "group-hover/file:bg-blue-50/80 group-hover/file:border-blue-300 group-hover/file:shadow-sm",
        { "group-hover/file:border-l-blue-500": !isNested },
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-700 group-hover/file:text-blue-700 transition-colors">
            {file.displayName}
          </span>
          {file.mimeType && (
            <span className="text-xs text-gray-400 group-hover/file:text-blue-400 transition-colors">
              ({file.mimeType.split("/").pop()})
            </span>
          )}
        </div>

        {/* Botones de acción - visibles solo en hover */}
        <div className="flex gap-1 opacity-0 group-hover/file:opacity-100 transition-all duration-200">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-6 px-2 font-medium hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
            onClick={copyIdToClipboard}
          >
            Copiar ID
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-6 px-2 font-medium hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
            onClick={openInNewTab}
          >
            Ver archivo
          </Button>
        </div>
      </div>

      {/* Badges y metadatos en una línea */}
      <div className="flex items-center justify-between mt-0.5">
        {/* Badges para prefijos y sufijos */}
        {(file.prefixes.length > 0 || file.suffixes.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {file.prefixes.map((prefix) => (
              <Badge
                key={`prefix-${prefix}`}
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] py-0 px-1.5 h-4 rounded-md font-medium"
              >
                {prefix}
              </Badge>
            ))}
            {file.suffixes.map((suffix) => (
              <Badge
                key={`suffix-${suffix}`}
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] py-0 px-1.5 h-4 rounded-md font-medium"
              >
                {suffix}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadatos básicos */}
        {(file.size || file.modifiedTime) && (
          <div className="text-[10px] text-gray-400 group-hover/file:text-gray-500 transition-colors ml-2">
            {file.size && <span>{file.size}</span>}
            {file.size && file.modifiedTime && <span> • </span>}
            {file.modifiedTime && <span>{file.modifiedTime}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
