import React from "react";
import { cn } from "@/src/lib/utils";
import { TypeBadge } from "../../atoms/badges/TypeBadge";
import { ActionButton } from "../../atoms/buttons/ActionButton";

export type UserRole = "participant" | "cohost" | "admin" | "moderator";
export type UserCardVariant = "default" | "compact" | "detailed";
export type UserCardAction = "remove" | "promote" | "demote" | "mute" | "unmute";

export interface UserCardProps {
  // Core user data
  email: string;
  name: string;
  role: UserRole;
  
  // Optional display data
  avatar?: string;
  joinedAt?: string;
  lastActivity?: string;
  status?: "online" | "away" | "offline";
  
  // Behavior & style
  variant?: UserCardVariant;
  actions?: UserCardAction[];
  selectable?: boolean;
  selected?: boolean;
  
  // Event handlers
  onSelect?: (email: string) => void;
  onAction?: (action: UserCardAction, email: string) => void;
  onClick?: (email: string) => void;
  
  // Style customization
  className?: string;
  showEmail?: boolean;
  showJoinedAt?: boolean;
  showLastActivity?: boolean;
}

/**
 * Card universal para usuarios - consolidación de MemberCard + variantes
 * Sigue Atomic Design con átomos reutilizables (TypeBadge, ActionButton)
 * 
 * @example
 * // Variant básico
 * <UserCard 
 *   email="user@example.com"
 *   name="John Doe"
 *   role="participant"
 * />
 * 
 * // Variant compacto con acciones
 * <UserCard 
 *   email="host@example.com"
 *   name="Jane Host"
 *   role="cohost"
 *   variant="compact"
 *   actions={["remove", "demote"]}
 *   onAction={handleAction}
 * />
 * 
 * // Variant detallado con estado
 * <UserCard 
 *   email="admin@example.com"
 *   name="Admin User"
 *   role="admin"
 *   variant="detailed"
 *   status="online"
 *   joinedAt="2025-01-23T10:00:00Z"
 *   showJoinedAt
 *   showLastActivity
 * />
 */
export const UserCard: React.FC<UserCardProps> = ({
  email,
  name,
  role,
  avatar,
  joinedAt,
  lastActivity,
  status = "offline",
  variant = "default",
  actions = [],
  selectable = false,
  selected = false,
  onSelect,
  onAction,
  onClick,
  className,
  showEmail = true,
  showJoinedAt = false,
  showLastActivity = false
}) => {
  
  // Generate avatar initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format timestamps
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short"
      });
    } catch {
      return null;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return "Ahora";
      if (diffMins < 60) return `Hace ${diffMins}m`;
      if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`;
      return formatDate(timestamp);
    } catch {
      return null;
    }
  };

  // Variant-specific styling
  const variantStyles = {
    default: {
      container: "p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors",
      avatar: "h-8 w-8",
      spacing: "gap-3"
    },
    compact: {
      container: "p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors",
      avatar: "h-6 w-6",
      spacing: "gap-2"
    },
    detailed: {
      container: "p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-all",
      avatar: "h-10 w-10",
      spacing: "gap-4"
    }
  };

  const styles = variantStyles[variant];
  
  // Status indicator color
  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500", 
    offline: "bg-gray-400"
  };

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(email);
    } else if (onClick) {
      onClick(email);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between",
        styles.container,
        selectable && "cursor-pointer",
        selected && "ring-2 ring-primary/20 bg-primary/5",
        className
      )}
      onClick={handleCardClick}
    >
      <div className={cn("flex items-center min-w-0 flex-1", styles.spacing)}>
        {/* Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name}
              className={cn(styles.avatar, "rounded-full object-cover")}
            />
          ) : (
            <div className={cn(
              styles.avatar,
              "bg-primary/10 rounded-full flex items-center justify-center"
            )}>
              <span className={cn(
                "font-medium text-primary",
                variant === "compact" ? "text-xs" : "text-sm"
              )}>
                {getInitials(name)}
              </span>
            </div>
          )}
          
          {/* Status indicator */}
          {variant === "detailed" && (
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
              statusColors[status]
            )} />
          )}
        </div>

        {/* User info */}
        <div className="min-w-0 flex-1">
          <div className={cn(
            "font-medium truncate",
            variant === "compact" ? "text-sm" : "text-base"
          )}>
            {name}
          </div>
          
          {showEmail && (
            <div className={cn(
              "text-muted-foreground truncate",
              variant === "compact" ? "text-xs" : "text-sm"
            )}>
              {email}
            </div>
          )}
          
          {/* Additional info for detailed variant */}
          {variant === "detailed" && (
            <div className="mt-1 space-y-0.5">
              {showJoinedAt && joinedAt && (
                <div className="text-xs text-muted-foreground">
                  Agregado: {formatDate(joinedAt)}
                </div>
              )}
              {showLastActivity && lastActivity && (
                <div className="text-xs text-muted-foreground">
                  Última actividad: {formatTime(lastActivity)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={cn("flex items-center flex-shrink-0", styles.spacing)}>
        {/* Role badge */}
        <TypeBadge 
          type={role === "cohost" ? "cohost" : "participant"} 
          variant="solid"
          className={variant === "compact" ? "text-xs" : ""}
        />
        
        {/* Action buttons */}
        {actions.length > 0 && (
          <div className={cn("flex items-center", variant === "compact" ? "gap-1" : "gap-2")}>
            {actions.map((action) => (
              <ActionButton
                key={action}
                action={action === "remove" ? "delete" : action === "promote" ? "edit" : "view"}
                variant={action === "remove" ? "destructive" : "secondary"}
                size={variant === "compact" ? "xs" : "sm"}
                onClick={() => {
                  onAction?.(action, email);
                }}
                tooltip={
                  action === "remove" ? `Eliminar ${name}` :
                  action === "promote" ? `Promover ${name}` :
                  action === "demote" ? `Degradar ${name}` :
                  action === "mute" ? `Silenciar ${name}` :
                  action === "unmute" ? `Activar ${name}` :
                  `Acción: ${action}`
                }
              />
            ))}
          </div>
        )}
        
        {/* Selection checkbox */}
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.(email);
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
          />
        )}
      </div>
    </div>
  );
};