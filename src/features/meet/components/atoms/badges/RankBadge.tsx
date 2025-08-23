import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export interface RankBadgeProps {
  rank: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Badge atómico para mostrar ranking de participantes
 * Automáticamente muestra #1, #2, etc. con tamaños consistentes
 * 
 * @example
 * <RankBadge rank={1} />
 * <RankBadge rank={5} size="sm" />
 */
export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = "md",
  className
}) => {
  
  const sizeClasses = {
    sm: "text-xs min-w-[18px] h-4",
    md: "text-xs min-w-[24px] h-5", 
    lg: "text-sm min-w-[28px] h-6"
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        sizeClasses[size],
        "flex items-center justify-center",
        className
      )}
    >
      #{rank}
    </Badge>
  );
};