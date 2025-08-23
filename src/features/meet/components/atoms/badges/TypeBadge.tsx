import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { 
  ShieldCheckIcon,
  UserIcon,
  PhoneIcon,
  UserCircleIcon 
} from "@heroicons/react/24/outline";

export type UserType = 
  | "authenticated"   // Usuario autenticado (signed in)
  | "anonymous"      // Usuario anónimo
  | "phone"          // Usuario por teléfono
  | "host"           // Anfitrión principal  
  | "cohost"         // Co-anfitrión
  | "participant"    // Participante regular
  | "moderator"      // Moderador
  | "viewer"         // Espectador
  | "guest";         // Invitado

export interface TypeBadgeProps {
  type: UserType;
  showIcon?: boolean;
  variant?: "solid" | "soft";
  className?: string;
  customLabel?: string; // Para personalizar el texto
}

/**
 * Badge especializado para mostrar tipos de usuario/participante
 * Sigue el design system con iconos de líneas y colores sólidos oscuros
 * 
 * @example
 * <TypeBadge type="authenticated" showIcon />
 * <TypeBadge type="cohost" />
 * <TypeBadge type="phone" customLabel="Teléfono (+1234)" />
 * <TypeBadge type="anonymous" variant="soft" />
 */
export const TypeBadge: React.FC<TypeBadgeProps> = ({ 
  type,
  showIcon = false,
  variant = "solid",
  className,
  customLabel
}) => {
  // Configuración por tipo de usuario
  const typeConfig = {
    authenticated: {
      label: "Autenticado",
      icon: <ShieldCheckIcon className="h-3 w-3" />,
      solid: "bg-green-900 text-green-100 hover:bg-green-800",
      soft: "bg-green-100 text-green-800 hover:bg-green-200"
    },
    anonymous: {
      label: "Anónimo", 
      icon: <UserCircleIcon className="h-3 w-3" />,
      solid: "bg-gray-900 text-gray-100 hover:bg-gray-800",
      soft: "bg-gray-100 text-gray-800 hover:bg-gray-200"
    },
    phone: {
      label: "Teléfono",
      icon: <PhoneIcon className="h-3 w-3" />,
      solid: "bg-purple-900 text-purple-100 hover:bg-purple-800",
      soft: "bg-purple-100 text-purple-800 hover:bg-purple-200"
    },
    host: {
      label: "Anfitrión",
      icon: <ShieldCheckIcon className="h-3 w-3" />,
      solid: "bg-amber-900 text-amber-100 hover:bg-amber-800",
      soft: "bg-amber-100 text-amber-800 hover:bg-amber-200"
    },
    cohost: {
      label: "Co-anfitrión",
      icon: <ShieldCheckIcon className="h-3 w-3" />,
      solid: "bg-blue-900 text-blue-100 hover:bg-blue-800",
      soft: "bg-blue-100 text-blue-800 hover:bg-blue-200"
    },
    participant: {
      label: "Participante",
      icon: <UserIcon className="h-3 w-3" />,
      solid: "bg-gray-900 text-gray-100 hover:bg-gray-800",
      soft: "bg-gray-100 text-gray-800 hover:bg-gray-200"
    },
    moderator: {
      label: "Moderador",
      icon: <ShieldCheckIcon className="h-3 w-3" />,
      solid: "bg-red-900 text-red-100 hover:bg-red-800",
      soft: "bg-red-100 text-red-800 hover:bg-red-200"
    },
    viewer: {
      label: "Espectador",
      icon: <UserIcon className="h-3 w-3" />,
      solid: "bg-yellow-900 text-yellow-100 hover:bg-yellow-800",
      soft: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    },
    guest: {
      label: "Invitado",
      icon: <UserCircleIcon className="h-3 w-3" />,
      solid: "bg-indigo-900 text-indigo-100 hover:bg-indigo-800",
      soft: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
    }
  };

  const config = typeConfig[type];
  const colorClass = variant === "solid" ? config.solid : config.soft;
  const displayLabel = customLabel || config.label;

  return (
    <Badge className={cn(colorClass, "text-xs font-medium", className)}>
      <div className="flex items-center gap-1">
        {showIcon && (
          <span className="flex-shrink-0">
            {config.icon}
          </span>
        )}
        <span>{displayLabel}</span>
      </div>
    </Badge>
  );
};