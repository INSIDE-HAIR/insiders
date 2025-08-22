import React from "react";
import { Button } from "@/src/components/ui/button";
import { XMarkIcon, UsersIcon } from "@heroicons/react/24/outline";
import { MemberRoleBadge } from "../../atoms/badges/MemberRoleBadge";
import { cn } from "@/src/lib/utils";

export interface MemberCardProps {
  email: string;
  role: "ROLE_UNSPECIFIED" | "COHOST";
  displayName?: string;
  joinedAt?: string;
  source?: string;
  onRemove?: () => void;
  onRoleChange?: (newRole: "ROLE_UNSPECIFIED" | "COHOST") => void;
  showRemoveButton?: boolean;
  className?: string;
}

/**
 * Tarjeta que muestra información de un miembro
 * Incluye avatar, nombre, email, rol y acciones
 */
export const MemberCard: React.FC<MemberCardProps> = ({
  email,
  role,
  displayName,
  joinedAt,
  source,
  onRemove,
  onRoleChange,
  showRemoveButton = true,
  className,
}) => {
  // Generar iniciales para el avatar
  const getInitials = (email: string, displayName?: string) => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  // Formatear nombre para mostrar
  const getDisplayName = () => {
    if (displayName) return displayName;
    return email.split("@")[0];
  };

  // Formatear fecha de unión
  const getJoinedAtText = () => {
    if (!joinedAt) return null;
    try {
      const date = new Date(joinedAt);
      return `Agregado ${date.toLocaleDateString()}`;
    } catch {
      return null;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar */}
        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-primary">
            {getInitials(email, displayName)}
          </span>
        </div>

        {/* Info del miembro */}
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{getDisplayName()}</div>
          <div className="text-sm text-muted-foreground truncate">{email}</div>
          {getJoinedAtText() && (
            <div className="text-xs text-muted-foreground">{getJoinedAtText()}</div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <MemberRoleBadge role={role} />
        
        {/* TODO: Implementar cambio de rol si se proporciona onRoleChange */}
        {onRoleChange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newRole = role === "COHOST" ? "ROLE_UNSPECIFIED" : "COHOST";
              onRoleChange(newRole);
            }}
            className="text-xs"
          >
            {role === "COHOST" ? "Degradar" : "Promover"}
          </Button>
        )}

        {showRemoveButton && onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <XMarkIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};