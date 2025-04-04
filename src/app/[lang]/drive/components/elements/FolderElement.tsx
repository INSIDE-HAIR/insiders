import React, { useEffect, useContext } from "react";
import {
  FolderItem,
  HierarchyItem,
  isFolderItem,
  isFileItem,
} from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { FileElement } from "./FileElement";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { toast } from "@ui/use-toast";
import { ExpansionContext } from "../views/ViewSelector";

interface FolderElementProps {
  folder: FolderItem;
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
  defaultExpanded?: boolean;
  isNested?: boolean;
}

export function FolderElement({
  folder,
  className,
  onItemClick,
  defaultExpanded = false,
  isNested = false,
}: FolderElementProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const { expandAll, collapseAll } = useContext(ExpansionContext);

  // Responder a cambios en el contexto de expansión
  useEffect(() => {
    if (expandAll) {
      setIsExpanded(true);
    } else if (collapseAll) {
      setIsExpanded(false);
    }
  }, [expandAll, collapseAll]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onItemClick?.(folder);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Copiar ID al portapapeles
  const copyIdToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(folder.id);
    toast({
      title: "ID copiado",
      description: `${folder.id} copiado al portapapeles`,
      duration: 2000,
    });
  };

  // Abrir el enlace en una nueva pestaña
  const openInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/drive/${folder.id}`, "_blank");
  };

  return (
    <div
      className={cn(
        "folder-element rounded-md border border-gray-200 transition-all duration-200",
        { "border-l-[3px]": !isNested },
        className
      )}
    >
      <div className="group/folder py-1.5 px-3">
        <div className="flex flex-col gap-0.5 group-hover/folder:bg-blue-50/80 rounded-md transition-all duration-200">
          {/* Encabezado con nombre e iconos y botones de acción */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleToggle}
            >
              <span className="text-xs font-bold w-4 text-gray-500 group-hover/folder:text-blue-600 transition-colors">
                {isExpanded ? "▼" : "►"}
              </span>
              <span className="font-medium text-sm text-gray-700 group-hover/folder:text-blue-700 transition-colors">
                {folder.displayName}
              </span>
            </div>

            {/* Botones de acción - visibles solo en hover */}
            <div className="flex gap-1.5 opacity-0 group-hover/folder:opacity-100 transition-all duration-200 -mr-1">
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

          {/* Badges para prefijos y sufijos */}
          {(folder.prefixes.length > 0 || folder.suffixes.length > 0) && (
            <div className="flex flex-wrap gap-1 ml-6">
              {folder.prefixes.map((prefix) => (
                <Badge
                  key={`prefix-${prefix}`}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] py-0 px-1.5 h-4 rounded-md font-medium"
                >
                  {prefix}
                </Badge>
              ))}
              {folder.suffixes.map((suffix) => (
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
        </div>
      </div>

      {isExpanded && (
        <div className="folder-content pt-0.5 pb-1 pl-8 border-l border-gray-200">
          {folder.children.length > 0 ? (
            <div className="space-y-0.5">
              {folder.children.map((child) => (
                <div key={child.id} className="child-element">
                  {isFolderItem(child) ? (
                    <FolderElement
                      folder={child}
                      onItemClick={onItemClick}
                      isNested={true}
                    />
                  ) : isFileItem(child) ? (
                    <FileElement
                      file={child}
                      onItemClick={onItemClick}
                      isNested={true}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 italic ml-1">
              Carpeta vacía
            </div>
          )}
        </div>
      )}
    </div>
  );
}
