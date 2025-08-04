"use client";
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
        "folder-element rounded-md border border-border bg-card text-card-foreground transition-all duration-200 hover:shadow-sm",
        { "border-l-[3px] border-l-primary": !isNested },
        className
      )}
    >
      <div className='group/folder py-2 px-3'>
        <div className='flex flex-col gap-1 group-hover/folder:bg-accent/50 rounded-md transition-all duration-200 px-2 py-1'>
          {/* Encabezado con nombre e iconos y botones de acción */}
          <div className='flex items-center justify-between'>
            <div
              className='flex items-center gap-2 cursor-pointer'
              onClick={handleToggle}
            >
              <span className='text-sm font-bold w-4 text-muted-foreground group-hover/folder:text-primary transition-colors'>
                {isExpanded ? "▼" : "►"}
              </span>
              <span className='font-semibold text-sm text-foreground group-hover/folder:text-primary transition-colors'>
                {folder.displayName}
              </span>
            </div>

            {/* Botones de acción - visibles solo en hover */}
            <div className='flex gap-1.5 opacity-70 group-hover/folder:opacity-100 transition-all duration-200 -mr-1'>
              <Button
                size='sm'
                variant='ghost'
                className='text-xs h-7 px-2 font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200'
                onClick={copyIdToClipboard}
              >
                Copiar ID
              </Button>
              <Button
                size='sm'
                variant='ghost'
                className='text-xs h-7 px-2 font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200'
                onClick={openInNewTab}
              >
                Ver archivo
              </Button>
            </div>
          </div>

          {/* Badges para prefijos y sufijos */}
          {(folder.prefixes.length > 0 || folder.suffixes.length > 0) && (
            <div className='flex flex-wrap gap-1.5 ml-6 mt-1'>
              {folder.prefixes.map((prefix) => (
                <Badge
                  key={`prefix-${prefix}`}
                  variant='outline'
                  className='bg-primary/10 text-primary border-primary/20 text-xs py-0.5 px-2 h-5 rounded-md font-semibold shadow-sm hover:bg-primary/20 transition-colors'
                >
                  {prefix}
                </Badge>
              ))}
              {folder.suffixes.map((suffix) => (
                <Badge
                  key={`suffix-${suffix}`}
                  variant='outline'
                  className='bg-secondary/10 text-secondary-foreground border-secondary/20 text-xs py-0.5 px-2 h-5 rounded-md font-semibold shadow-sm hover:bg-secondary/20 transition-colors'
                >
                  {suffix}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className='folder-content pt-1 pb-2 pl-8 border-l border-border/60'>
          {folder.children.length > 0 ? (
            <div className='space-y-0.5'>
              {folder.children.map((child) => (
                <div key={child.id} className='child-element'>
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
            <div className='text-xs text-muted-foreground italic ml-1 py-1'>
              Carpeta vacía
            </div>
          )}
        </div>
      )}
    </div>
  );
}
