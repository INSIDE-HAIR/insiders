import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { ActionButton } from "../../atoms/buttons/ActionButton";
import { cn } from "@/src/lib/utils";

export interface SmartNoteData {
  title: string;
  preview: string;
  hasLink: boolean;
  pointCount: number;
}

export interface SmartNoteCardProps {
  note: SmartNoteData;
  onViewComplete?: () => void;
  onExport?: () => void;
  className?: string;
}

/**
 * Tarjeta molecular para notas inteligentes con contenido y acciones
 * Combina ActionButton para ver completa y exportar
 * 
 * @example
 * <SmartNoteCard 
 *   note={smartNoteData}
 *   onViewComplete={() => alert('Opening notes...')}
 *   onExport={() => alert('Exporting...')}
 * />
 */
export const SmartNoteCard: React.FC<SmartNoteCardProps> = ({
  note,
  onViewComplete,
  onExport,
  className
}) => {
  
  return (
    <div className={cn("p-3 bg-muted/50 border rounded-lg", className)}>
      
      {/* Header con título y contador de puntos */}
      <div className="text-sm font-medium mb-2 flex items-center justify-between">
        <span>{note.title}</span>
        <Badge variant="outline" className="text-xs">
          {note.pointCount} puntos
        </Badge>
      </div>
      
      {/* Preview del contenido */}
      <div className="text-xs text-muted-foreground mb-2 whitespace-pre-line border-l-2 border-primary/20 pl-2">
        {note.preview}
      </div>
      
      {/* Acciones de notas inteligentes */}
      {note.hasLink && (
        <div className="flex gap-1">
          <ActionButton
            action="viewComplete"
            onClick={() => onViewComplete?.()}
            size="sm"
          />
          <ActionButton
            action="export"
            onClick={() => onExport?.()}
            size="sm"
          />
        </div>
      )}
    </div>
  );
};