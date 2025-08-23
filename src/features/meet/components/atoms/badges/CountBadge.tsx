import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export type CountType = 
  | "assigned"     // Para elementos asignados (tags, grupos)
  | "available"    // Para elementos disponibles
  | "participants" // Para contadores de participantes
  | "sessions"     // Para contadores de sesiones
  | "total"        // Para totales generales
  | "active"       // Para elementos activos
  | "completed"    // Para elementos completados
  | "pending";     // Para elementos pendientes

export interface CountBadgeProps {
  count: number | string;
  type: CountType;
  variant?: "outline" | "solid";
  maxCount?: number; // Para mostrar "99+" cuando se supera
  showZero?: boolean; // Si mostrar cuando count = 0
  className?: string;
  label?: string; // Texto adicional (ej: "participantes")
}

/**
 * Badge especializado para mostrar contadores y cantidades
 * Sigue el design system con variantes consistentes
 * 
 * @example
 * <CountBadge count={3} type="assigned" label="asignados" />
 * <CountBadge count={15} type="participants" />
 * <CountBadge count={0} type="sessions" showZero />
 * <CountBadge count={150} type="total" maxCount={99} />
 */
export const CountBadge: React.FC<CountBadgeProps> = ({ 
  count, 
  type,
  variant = "outline",
  maxCount = 999,
  showZero = false,
  className,
  label
}) => {
  // No mostrar si count es 0 y showZero es false
  const numericCount = typeof count === 'number' ? count : parseInt(count.toString()) || 0;
  if (numericCount === 0 && !showZero) {
    return null;
  }

  // Formatear el conteo
  const formatCount = (num: number): string => {
    if (num > maxCount) {
      return `${maxCount}+`;
    }
    return num.toString();
  };

  const displayCount = typeof count === 'number' ? formatCount(count) : count.toString();

  // Configuración de variantes por tipo
  const typeStyles = {
    assigned: variant === "solid" ? "bg-blue-900 text-blue-100 hover:bg-blue-800" : "border-blue-200 text-blue-700 bg-blue-50",
    available: variant === "solid" ? "bg-green-900 text-green-100 hover:bg-green-800" : "border-green-200 text-green-700 bg-green-50", 
    participants: variant === "solid" ? "bg-purple-900 text-purple-100 hover:bg-purple-800" : "border-purple-200 text-purple-700 bg-purple-50",
    sessions: variant === "solid" ? "bg-indigo-900 text-indigo-100 hover:bg-indigo-800" : "border-indigo-200 text-indigo-700 bg-indigo-50",
    total: variant === "solid" ? "bg-gray-900 text-gray-100 hover:bg-gray-800" : "border-gray-200 text-gray-700 bg-gray-50",
    active: variant === "solid" ? "bg-green-900 text-green-100 hover:bg-green-800" : "border-green-200 text-green-700 bg-green-50",
    completed: variant === "solid" ? "bg-blue-900 text-blue-100 hover:bg-blue-800" : "border-blue-200 text-blue-700 bg-blue-50",
    pending: variant === "solid" ? "bg-orange-900 text-orange-100 hover:bg-orange-800" : "border-orange-200 text-orange-700 bg-orange-50"
  };

  // Determinar la variante de shadcn/ui
  const badgeVariant = variant === "outline" ? "outline" : "default";

  // Construir el texto del badge
  const badgeText = label ? `${displayCount} ${label}` : displayCount;

  return (
    <Badge 
      variant={badgeVariant}
      className={cn(
        variant === "solid" ? typeStyles[type] : typeStyles[type],
        "text-xs font-medium",
        className
      )}
    >
      {badgeText}
    </Badge>
  );
};