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
        "group/file rounded-md border border-border bg-card text-card-foreground transition-all duration-200 py-2 px-3 hover:shadow-sm",
        { "border-l-[3px] border-l-primary": !isNested },
        "group-hover/file:bg-accent/50 group-hover/file:border-primary/30 group-hover/file:shadow-md",
        { "group-hover/file:border-l-primary": !isNested },
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground group-hover/file:text-primary transition-colors">
            {file.displayName}
          </span>
          {file.mimeType && (
            <span className="text-xs text-muted-foreground group-hover/file:text-primary/70 transition-colors">
              ({file.mimeType.split("/").pop()})
            </span>
          )}
        </div>

        {/* Botones de acción - visibles solo en hover */}
        <div className="flex gap-1.5 opacity-70 group-hover/file:opacity-100 transition-all duration-200">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 px-2 font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            onClick={copyIdToClipboard}
          >
            Copiar ID
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 px-2 font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200"
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
          <div className="flex flex-wrap gap-1.5">
            {file.prefixes.map((prefix) => (
              <Badge
                key={`prefix-${prefix}`}
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-xs py-0.5 px-2 h-5 rounded-md font-semibold shadow-sm hover:bg-primary/20 transition-colors"
              >
                {prefix}
              </Badge>
            ))}
            {file.suffixes.map((suffix) => (
              <Badge
                key={`suffix-${suffix}`}
                variant="outline"
                className="bg-secondary/10 text-secondary-foreground border-secondary/20 text-xs py-0.5 px-2 h-5 rounded-md font-semibold shadow-sm hover:bg-secondary/20 transition-colors"
              >
                {suffix}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadatos básicos */}
        {(file.size || file.modifiedTime) && (
          <div className="text-xs text-muted-foreground group-hover/file:text-muted-foreground/80 transition-colors ml-2">
            {file.size && <span>{file.size}</span>}
            {file.size && file.modifiedTime && <span> • </span>}
            {file.modifiedTime && <span>{file.modifiedTime}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
