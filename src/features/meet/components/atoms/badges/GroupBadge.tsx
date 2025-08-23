import React from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useColorStyles } from "../../../utils/colorUtils";

export interface GroupBadgeProps {
  name: string;
  path?: string;
  color: string;
  removable?: boolean;
  onRemove?: (name: string) => void;
  onClick?: (name: string) => void;
  className?: string;
}

/**
 * Badge atómico para grupos con nombre y path
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <GroupBadge 
 *   name="Equipo Marketing" 
 *   path="/empresas/acme/equipos/marketing"
 *   color="bg-blue-900 text-blue-100 hover:bg-blue-800"
 *   removable
 *   onRemove={(name) => console.log('Desasignar:', name)}
 * />
 * 
 * <GroupBadge 
 *   name="Ventas" 
 *   path="/empresas/acme/equipos/ventas"
 *   color="bg-red-900 text-red-100 hover:bg-red-800"
 *   onClick={(name) => console.log('Asignar grupo:', name)}
 * />
 */
export const GroupBadge: React.FC<GroupBadgeProps> = ({
  name,
  path,
  color,
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

  // Para grupos asignados (con padding y rounded-lg)
  if (removable) {
    return (
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border",
          className
        )}
        style={{
          backgroundColor: colorStyles.backgroundColor,
          color: colorStyles.color,
          borderColor: colorStyles.borderColor,
        }}
      >
        <div>
          <p className="font-medium">{name}</p>
          {path && (
            <p className="text-xs opacity-70">{path}</p>
          )}
        </div>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-4 w-4 p-0 cursor-pointer hover:opacity-70"
          style={{ color: colorStyles.color }}
          onClick={handleRemove}
          aria-label={`Desasignar grupo ${name}`}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
    );
  }

  // Para grupos disponibles (con padding p-2 y icono +)
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-2 rounded border cursor-pointer hover:opacity-80",
        className
      )}
      style={{
        backgroundColor: colorStyles.backgroundColor,
        color: colorStyles.color,
        borderColor: colorStyles.borderColor,
      }}
      onClick={isClickable ? handleClick : undefined}
    >
      <div>
        <span className="text-sm font-medium">{name}</span>
        {path && (
          <p className="text-xs opacity-70">{path}</p>
        )}
      </div>
      
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
  );
};