/**
 * JOINMEETINGBUTTON - Botón reutilizable para unirse a reuniones
 * Componente atómico con diseño consistente
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React from "react";
import { Button } from "@/src/components/ui/button";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

interface JoinMeetingButtonProps {
  /** URL de la reunión de Google Meet */
  meetingUri?: string;
  /** Texto personalizado del botón */
  children?: React.ReactNode;
  /** Tamaño del botón */
  size?: "sm" | "default" | "lg";
  /** Variante del botón */
  variant?: "default" | "secondary" | "outline";
  /** Clases CSS adicionales */
  className?: string;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
  /** Función onClick personalizada (opcional) */
  onClick?: () => void;
}

export const JoinMeetingButton: React.FC<JoinMeetingButtonProps> = ({
  meetingUri,
  children = "Unirse",
  size = "default",
  variant = "default",
  className,
  disabled = false,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (meetingUri) {
      window.open(meetingUri, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || !meetingUri}
      size={size}
      variant={variant}
      className={cn(
        // Diseño verde como en el modal para consistencia
        variant === "default" && "bg-primary hover:bg-primary/90 ",
        className
      )}
    >
      <VideoCameraIcon className='h-4 w-4 mr-2' />
      {children}
    </Button>
  );
};
