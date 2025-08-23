/**
 * SECTIONINDICATOR - Indicador visual de progreso en navegación
 * Componente atómico para mostrar posición actual y total de secciones
 * 
 * Características:
 * ✅ Múltiples variantes visuales (badge, progress, dots)
 * ✅ Información contextual rica
 * ✅ Responsive design
 * ✅ Animaciones suaves
 * ✅ Colores semánticos
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import { cn } from "@/src/lib/utils";

type IndicatorVariant = "badge" | "progress" | "dots" | "fraction" | "minimal";
type IndicatorSize = "sm" | "default" | "lg";

interface SectionIndicatorProps {
  /** Índice actual (0-based) */
  currentIndex: number;
  /** Total de secciones */
  totalSections: number;
  /** Variante visual del indicador */
  variant?: IndicatorVariant;
  /** Tamaño del indicador */
  size?: IndicatorSize;
  /** Mostrar nombres de secciones */
  showSectionNames?: boolean;
  /** Nombres de las secciones */
  sectionNames?: string[];
  /** Clases CSS adicionales */
  className?: string;
  /** Mostrar porcentaje de progreso */
  showPercentage?: boolean;
  /** Color personalizado */
  color?: "default" | "primary" | "success" | "warning" | "destructive";
}

export const SectionIndicator: React.FC<SectionIndicatorProps> = ({
  currentIndex,
  totalSections,
  variant = "badge",
  size = "default",
  showSectionNames = false,
  sectionNames = [],
  className,
  showPercentage = false,
  color = "default",
}) => {
  // Cálculos
  const currentNumber = currentIndex + 1; // 1-based for display
  const progressPercentage = ((currentIndex + 1) / totalSections) * 100;
  const currentSectionName = sectionNames[currentIndex];

  // Estilos por tamaño
  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm", 
    lg: "text-base",
  };

  // Colores por variante
  const getColorClasses = () => {
    const colorMap = {
      default: "bg-secondary text-secondary-foreground",
      primary: "bg-primary text-primary-foreground", 
      success: "bg-green-500 text-white",
      warning: "bg-yellow-500 text-black",
      destructive: "bg-destructive text-destructive-foreground",
    };
    return colorMap[color];
  };

  // Renderizado por variante
  const renderIndicator = () => {
    switch (variant) {
      case "badge":
        return (
          <Badge 
            variant="secondary"
            className={cn(
              "font-mono transition-all duration-300",
              sizeClasses[size],
              getColorClasses(),
              className
            )}
          >
            <span className="font-semibold">{currentNumber}</span>
            <span className="opacity-75 mx-1">/</span>
            <span className="opacity-90">{totalSections}</span>
            {showPercentage && (
              <span className="ml-2 text-xs opacity-75">
                ({Math.round(progressPercentage)}%)
              </span>
            )}
          </Badge>
        );

      case "progress":
        return (
          <div className={cn("flex flex-col gap-1", className)}>
            <div className="flex justify-between items-center">
              <span className={cn("font-medium", sizeClasses[size])}>
                Progreso
              </span>
              <span className={cn("font-mono", sizeClasses[size])}>
                {currentNumber}/{totalSections}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 transition-all duration-500"
            />
            {showPercentage && (
              <span className="text-xs text-muted-foreground text-center">
                {Math.round(progressPercentage)}% completado
              </span>
            )}
          </div>
        );

      case "dots":
        return (
          <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSections }, (_, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    size === "sm" && "w-2 h-2",
                    size === "default" && "w-3 h-3", 
                    size === "lg" && "w-4 h-4",
                    index === currentIndex 
                      ? "bg-primary scale-125" 
                      : index < currentIndex
                        ? "bg-primary/60"
                        : "bg-muted"
                  )}
                />
              ))}
            </div>
            <span className={cn("font-mono ml-2", sizeClasses[size])}>
              {currentNumber}/{totalSections}
            </span>
          </div>
        );

      case "fraction":
        return (
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-md bg-muted/50",
            className
          )}>
            <div className="flex flex-col items-center">
              <span className={cn(
                "font-bold text-primary",
                size === "sm" && "text-lg",
                size === "default" && "text-xl",
                size === "lg" && "text-2xl"
              )}>
                {currentNumber}
              </span>
              <div className="h-px w-6 bg-muted-foreground/30" />
              <span className={cn(
                "text-muted-foreground font-medium",
                sizeClasses[size]
              )}>
                {totalSections}
              </span>
            </div>
            {showSectionNames && currentSectionName && (
              <div className="flex flex-col">
                <span className={cn("font-medium", sizeClasses[size])}>
                  {currentSectionName}
                </span>
                <span className="text-xs text-muted-foreground">
                  Sección actual
                </span>
              </div>
            )}
          </div>
        );

      case "minimal":
        return (
          <span className={cn(
            "font-mono text-muted-foreground",
            sizeClasses[size],
            className
          )}>
            {currentNumber}/{totalSections}
          </span>
        );

      default:
        return null;
    }
  };

  // Información adicional si se muestran nombres
  const renderSectionInfo = () => {
    if (!showSectionNames || !currentSectionName || variant === "fraction") {
      return null;
    }

    return (
      <div className="flex flex-col items-center gap-1 mt-2">
        <span className={cn("font-medium text-center", sizeClasses[size])}>
          {currentSectionName}
        </span>
        <span className="text-xs text-muted-foreground">
          Sección actual
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {renderIndicator()}
      {renderSectionInfo()}
    </div>
  );
};