import React from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { useColorStyles } from "../../../utils/colorUtils";

export interface TagBadgeProps {
  name: string;
  color: string;
  slug?: string; // Para mostrar badge interno como "strategy", "dev", etc.
  removable?: boolean;
  onRemove?: (name: string) => void;
  onClick?: (name: string) => void;
  className?: string;
}

/**
 * Badge atómico para tags con opción removible
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <TagBadge 
 *   name="Marketing" 
 *   color="bg-blue-900 text-blue-100 hover:bg-blue-800"
 *   removable
 *   onRemove={(name) => console.log('Remover:', name)}
 * />
 * 
 * <TagBadge 
 *   name="Estrategia" 
 *   color="bg-red-900 text-red-100 hover:bg-red-800"
 *   onClick={(name) => console.log('Asignar:', name)}
 * />
 */
export const TagBadge: React.FC<TagBadgeProps> = ({
  name,
  color,
  slug,
  removable = false,
  onRemove,
  onClick,
  className
}) => {
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar trigger del onClick principal
    onRemove?.(name);
  };

  const handleClick = () => {
    if (!removable) {
      onClick?.(name);
    }
  };

  // Determinar si es clickeable
  const isClickable = !removable && onClick;

  // Generar estilos dinámicos basados en el color hex
  const colorStyles = useColorStyles(color);

  return (
    <div 
      className={cn(
        "flex items-center rounded text-sm border",
        removable ? "gap-2 px-3 py-1" : "justify-between p-2 cursor-pointer hover:cursor-pointer",
        isClickable && "cursor-pointer hover:opacity-80",
        className
      )}
      style={{
        backgroundColor: colorStyles.backgroundColor,
        color: colorStyles.color,
        borderColor: colorStyles.borderColor,
      }}
      onClick={isClickable ? handleClick : undefined}
    >
      {removable ? (
        <span>{name}</span>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{name}</span>
          {slug && (
            <Badge 
              variant="outline" 
              className="text-xs text-current border-current opacity-60"
              style={{ borderColor: colorStyles.color }}
            >
              {slug}
            </Badge>
          )}
        </div>
      )}
      
      {removable && (
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-4 w-4 p-0 cursor-pointer hover:opacity-70"
          style={{ color: colorStyles.color }}
          onClick={handleRemove}
          aria-label={`Remover tag ${name}`}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      )}
      
      {!removable && onClick && (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )}
    </div>
  );
};