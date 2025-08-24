import React from "react";
import { cn } from "@/src/lib/utils";
import { CountBadge, type CountType } from "../../atoms/badges/CountBadge";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export type AccordionVariant = "default" | "card" | "minimal";
export type AccordionIconComponent = React.ComponentType<{ className?: string }>;

export interface AccordionWithBadgeProps {
  // Core content
  title: string;
  children: React.ReactNode;
  
  // Icon & badge
  icon?: AccordionIconComponent;
  badgeCount?: number;
  badgeLabel?: string;
  badgeVariant?: "outline" | "solid";
  badgeType?: CountType;
  
  // Behavior
  defaultOpen?: boolean;
  variant?: AccordionVariant;
  disabled?: boolean;
  
  // Event handlers
  onToggle?: (isOpen: boolean) => void;
  
  // Styling
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
}

/**
 * Accordion estandarizado con badge - extraído del pattern repetido en ResponsiveModalDemo
 * Consolida 12+ accordions manuales en un componente reutilizable
 * 
 * @example
 * // Accordion básico con badge
 * <AccordionWithBadge 
 *   title="Participantes"
 *   icon={UsersIcon}
 *   badgeCount={24}
 *   badgeLabel="personas"
 * >
 *   <div>Lista de participantes...</div>
 * </AccordionWithBadge>
 * 
 * // Accordion de configuración
 * <AccordionWithBadge 
 *   title="Configuración de Seguridad"
 *   icon={ShieldCheckIcon}
 *   badgeCount={5}
 *   badgeLabel="opciones"
 *   variant="card"
 *   defaultOpen
 * >
 *   <ConfigToggle ... />
 *   <ConfigToggle ... />
 * </AccordionWithBadge>
 * 
 * // Accordion minimal para listas
 * <AccordionWithBadge 
 *   title="Sesiones Recientes"
 *   badgeCount={12}
 *   variant="minimal"
 * >
 *   <SessionCard ... />
 *   <SessionCard ... />
 * </AccordionWithBadge>
 */
export const AccordionWithBadge: React.FC<AccordionWithBadgeProps> = ({
  title,
  children,
  icon: Icon,
  badgeCount,
  badgeLabel = "items",
  badgeVariant = "outline",
  badgeType = "total",
  defaultOpen = false,
  variant = "default",
  disabled = false,
  onToggle,
  className,
  titleClassName,
  contentClassName,
  headerClassName
}) => {
  
  // Variant-specific styling
  const variantStyles = {
    default: {
      container: "border border-border rounded-lg bg-card",
      header: "p-4 hover:bg-muted/50",
      content: "px-4 pb-4",
      spacing: "space-y-3"
    },
    card: {
      container: "border border-border rounded-lg bg-card shadow-sm",
      header: "p-4 hover:bg-muted/30",
      content: "px-4 pb-4",
      spacing: "space-y-4"
    },
    minimal: {
      container: "border-b border-border last:border-b-0",
      header: "py-3 hover:bg-muted/20",
      content: "pb-3",
      spacing: "space-y-2"
    }
  };
  
  const styles = variantStyles[variant];
  
  const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    
    const details = e.currentTarget.closest('details') as HTMLDetailsElement;
    // Toggle will happen naturally, we just need to report it
    requestAnimationFrame(() => {
      onToggle?.(details.open);
    });
  };

  return (
    <details 
      className={cn(
        "group",
        styles.container,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      open={defaultOpen}
    >
      <summary 
        className={cn(
          "flex items-center justify-between cursor-pointer transition-colors",
          styles.header,
          disabled && "cursor-not-allowed",
          headerClassName
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Icon */}
          {Icon && (
            <Icon className="h-5 w-5 text-primary flex-shrink-0" />
          )}
          
          {/* Title */}
          <span className={cn(
            "font-medium text-foreground truncate",
            titleClassName
          )}>
            {title}
          </span>
          
          {/* Badge */}
          {badgeCount !== undefined && badgeCount >= 0 && (
            <CountBadge 
              count={badgeCount}
              label={badgeLabel}
              variant={badgeVariant}
              type={badgeType}
            />
          )}
        </div>
        
        {/* Chevron indicator */}
        <ChevronRightIcon className={cn(
          "h-4 w-4 transition-transform text-muted-foreground flex-shrink-0",
          "group-open:rotate-90",
          disabled && "opacity-50"
        )} />
      </summary>
      
      {/* Content */}
      <div className={cn(
        styles.content,
        styles.spacing,
        contentClassName
      )}>
        {children}
      </div>
    </details>
  );
};