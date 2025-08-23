import React from "react";
import { cn } from "@/src/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "highlight";
  className?: string;
}

/**
 * Tarjeta estadística atómica para métricas generales
 * Optimizada para estadísticas principales con números grandes
 * 
 * @example
 * <StatCard label="Participantes únicos" value={15} size="lg" variant="primary" />
 * <StatCard label="Total reuniones" value={12} />
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  size = "md",
  variant = "default",
  className
}) => {
  
  const sizeClasses = {
    sm: {
      container: "p-2",
      value: "text-lg font-bold",
      label: "text-xs text-muted-foreground"
    },
    md: {
      container: "p-3", 
      value: "text-xl font-bold text-primary",
      label: "text-sm text-muted-foreground"
    },
    lg: {
      container: "p-4",
      value: "text-2xl font-bold text-primary",
      label: "text-base text-muted-foreground"
    }
  };

  const variantClasses = {
    default: "bg-background",
    primary: "bg-primary/5 border-primary/20",
    highlight: "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30"
  };

  return (
    <div className={cn(
      "rounded border text-center",
      sizeClasses[size].container,
      variantClasses[variant],
      className
    )}>
      <div className={sizeClasses[size].value}>
        {value}
      </div>
      <div className={sizeClasses[size].label}>
        {label}
      </div>
    </div>
  );
};