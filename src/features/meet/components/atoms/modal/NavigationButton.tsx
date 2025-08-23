/**
 * NAVIGATIONBUTTON - Botón de navegación para selector de secciones
 * Componente atómico para navegación ⬅️➡️ con keyboard shortcuts
 * 
 * Características:
 * ✅ Dirección automática (previous/next)
 * ✅ Estados disabled inteligentes
 * ✅ Tooltips con shortcuts de teclado
 * ✅ Iconos direccionales
 * ✅ Variantes visuales
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

type NavigationDirection = "previous" | "next";
type NavigationVariant = "ghost" | "outline" | "default" | "secondary";
type IconType = "chevron" | "arrow";

interface NavigationButtonProps {
  /** Dirección de navegación */
  direction: NavigationDirection;
  /** Función a ejecutar al hacer click */
  onClick: () => void;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
  /** Variante visual del botón */
  variant?: NavigationVariant;
  /** Tamaño del botón */
  size?: "sm" | "default" | "lg";
  /** Mostrar solo icono (compacto) */
  iconOnly?: boolean;
  /** Tipo de icono */
  iconType?: IconType;
  /** Texto personalizado */
  children?: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Información de contexto para tooltip */
  currentIndex?: number;
  totalItems?: number;
  /** Tooltip personalizado */
  tooltip?: string;
  /** Deshabilitar tooltip */
  disableTooltip?: boolean;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  onClick,
  disabled = false,
  variant = "ghost",
  size = "sm",
  iconOnly = false,
  iconType = "chevron",
  children,
  className,
  currentIndex,
  totalItems,
  tooltip,
  disableTooltip = false,
}) => {
  // Icon selection
  const getIcon = () => {
    if (iconType === "arrow") {
      return direction === "previous" 
        ? ArrowLeftIcon 
        : ArrowRightIcon;
    }
    return direction === "previous" 
      ? ChevronLeftIcon 
      : ChevronRightIcon;
  };

  const IconComponent = getIcon();

  // Default text
  const defaultText = direction === "previous" ? "Anterior" : "Siguiente";
  const displayText = children || defaultText;

  // Tooltip generation
  const generateTooltip = () => {
    if (tooltip) return tooltip;
    
    let baseTooltip = direction === "previous" 
      ? "Sección anterior" 
      : "Siguiente sección";
    
    // Add keyboard shortcut
    const shortcut = direction === "previous" ? "Alt+←" : "Alt+→";
    baseTooltip += ` (${shortcut})`;
    
    // Add context if available
    if (typeof currentIndex === "number" && typeof totalItems === "number") {
      if (direction === "previous" && currentIndex > 0) {
        baseTooltip += ` - Ir a ${currentIndex}/${totalItems}`;
      } else if (direction === "next" && currentIndex < totalItems - 1) {
        baseTooltip += ` - Ir a ${currentIndex + 2}/${totalItems}`;
      }
    }
    
    return baseTooltip;
  };

  // Button content
  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "transition-all duration-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {direction === "previous" && (
        <IconComponent className={cn(
          "h-4 w-4",
          !iconOnly && "mr-1"
        )} />
      )}
      
      {!iconOnly && (
        <span className="whitespace-nowrap">
          {displayText}
        </span>
      )}
      
      {direction === "next" && (
        <IconComponent className={cn(
          "h-4 w-4",
          !iconOnly && "ml-1"
        )} />
      )}
    </Button>
  );

  // Wrap with tooltip if enabled
  if (!disableTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">{generateTooltip()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
};