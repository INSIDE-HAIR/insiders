import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { 
  TrophyIcon,
  StarIcon,
  SparklesIcon,
  FireIcon 
} from "@heroicons/react/24/outline";

export type RankingType = 
  | "number"      // Ranking numérico (#1, #2, #3)
  | "top"         // Badge "Top" para destacados  
  | "new"         // Badge "Nuevo" para recién llegados
  | "featured"    // Badge "Destacado" 
  | "winner"      // Badge "Ganador"
  | "trending"    // Badge "Tendencia"
  | "star"        // Badge con estrella
  | "fire";       // Badge "Hot/Popular"

export interface RankingBadgeProps {
  type: RankingType;
  position?: number; // Para type="number", la posición en el ranking
  showIcon?: boolean;
  animated?: boolean; // Para efectos visuales especiales
  className?: string;
  customLabel?: string;
}

/**
 * Badge especializado para rankings, posiciones y destacados
 * Sigue el design system con efectos especiales para elementos destacados
 * 
 * @example
 * <RankingBadge type="number" position={1} />
 * <RankingBadge type="top" animated showIcon />
 * <RankingBadge type="new" />
 * <RankingBadge type="featured" customLabel="VIP" />
 */
export const RankingBadge: React.FC<RankingBadgeProps> = ({ 
  type,
  position,
  showIcon = false,
  animated = false,
  className,
  customLabel
}) => {
  // Configuración por tipo de ranking
  const rankingConfig = {
    number: {
      getLabel: (pos?: number) => {
        if (!pos) return "#1";
        return `#${pos}`;
      },
      getIcon: (pos?: number) => {
        // Iconos especiales para top 3
        if (pos === 1) return <TrophyIcon className="h-3 w-3" />;
        if (pos === 2) return <StarIcon className="h-3 w-3" />;
        if (pos === 3) return <SparklesIcon className="h-3 w-3" />;
        return <span className="h-3 w-3 text-center text-xs font-bold">{pos}</span>;
      },
      getColor: (pos?: number) => {
        if (pos === 1) return "bg-yellow-900 text-yellow-100 hover:bg-yellow-800"; // Oro
        if (pos === 2) return "bg-gray-600 text-gray-100 hover:bg-gray-700";       // Plata  
        if (pos === 3) return "bg-orange-900 text-orange-100 hover:bg-orange-800"; // Bronce
        return "bg-blue-900 text-blue-100 hover:bg-blue-800";                      // Otros
      }
    },
    top: {
      getLabel: () => "Top",
      getIcon: () => <TrophyIcon className="h-3 w-3" />,
      getColor: () => "bg-yellow-900 text-yellow-100 hover:bg-yellow-800"
    },
    new: {
      getLabel: () => "Nuevo",
      getIcon: () => <SparklesIcon className="h-3 w-3" />,
      getColor: () => "bg-green-900 text-green-100 hover:bg-green-800"
    },
    featured: {
      getLabel: () => "Destacado",
      getIcon: () => <StarIcon className="h-3 w-3" />,
      getColor: () => "bg-purple-900 text-purple-100 hover:bg-purple-800"
    },
    winner: {
      getLabel: () => "Ganador",
      getIcon: () => <TrophyIcon className="h-3 w-3" />,
      getColor: () => "bg-yellow-900 text-yellow-100 hover:bg-yellow-800"
    },
    trending: {
      getLabel: () => "Tendencia", 
      getIcon: () => <FireIcon className="h-3 w-3" />,
      getColor: () => "bg-red-900 text-red-100 hover:bg-red-800"
    },
    star: {
      getLabel: () => "Estrella",
      getIcon: () => <StarIcon className="h-3 w-3" />,
      getColor: () => "bg-indigo-900 text-indigo-100 hover:bg-indigo-800"
    },
    fire: {
      getLabel: () => "Popular",
      getIcon: () => <FireIcon className="h-3 w-3" />,
      getColor: () => "bg-red-900 text-red-100 hover:bg-red-800"
    }
  };

  const config = rankingConfig[type];
  
  // Determinar valores según el tipo
  let label: string;
  let icon: React.ReactNode;
  let colorClass: string;
  
  if (type === "number") {
    label = config.getLabel(position);
    icon = config.getIcon(position);
    colorClass = config.getColor(position);
  } else {
    label = config.getLabel();
    icon = config.getIcon();
    colorClass = config.getColor();
  }

  // Usar label personalizado si se proporciona
  const displayLabel = customLabel || label;

  // Clases de animación
  const animationClass = animated ? "animate-pulse" : "";

  // Determinar el tamaño mínimo para rankings numéricos
  const sizeClass = type === "number" ? "min-w-[24px] h-5" : "";

  return (
    <Badge 
      className={cn(
        colorClass,
        "text-xs font-medium",
        sizeClass,
        animationClass,
        className
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {showIcon && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        <span>{displayLabel}</span>
      </div>
    </Badge>
  );
};