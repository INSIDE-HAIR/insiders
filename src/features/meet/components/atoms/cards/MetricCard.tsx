import React from "react";
import { cn } from "@/src/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "muted";
  className?: string;
}

/**
 * Tarjeta métrica atómica para mostrar datos numéricos
 * Sizes: sm (compacta), md (normal), lg (destacada)
 * 
 * @example
 * <MetricCard label="Total reuniones" value={12} />
 * <MetricCard label="Promedio sesión" value="63min" size="sm" />
 * <MetricCard label="% Participación" value="85%" variant="primary" />
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  size = "md",
  variant = "default",
  className
}) => {
  
  const sizeClasses = {
    sm: {
      container: "p-1",
      value: "text-xs font-medium",
      label: "text-xs text-muted-foreground"
    },
    md: {
      container: "p-2", 
      value: "text-sm font-medium",
      label: "text-xs text-muted-foreground"
    },
    lg: {
      container: "p-3",
      value: "text-xl font-bold text-primary", 
      label: "text-sm text-muted-foreground"
    }
  };

  const variantClasses = {
    default: "bg-background",
    primary: "bg-primary/5 border-primary/20",
    muted: "bg-muted/50"
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