import React from "react";
import { cn } from "@/src/lib/utils";

export interface UserAvatarProps {
  name: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  src?: string; // Para futuros avatars con imagen
}

/**
 * Avatar atómico para usuarios con iniciales o imagen
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <UserAvatar name="Juan Pérez" />
 * <UserAvatar name="María García" size="sm" />
 * <UserAvatar name="Carlos López" size="lg" />
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = "default",
  className,
  src
}) => {
  
  // Extraer iniciales del nombre
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Máximo 2 iniciales
  };

  // Clases de tamaño - exactas del ResponsiveModalDemo
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    default: "h-8 w-8 text-sm", 
    lg: "h-10 w-10 text-base"
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div 
      className={cn(
        "bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium",
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};