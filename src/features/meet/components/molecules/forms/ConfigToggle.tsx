import React, { useState } from "react";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Spinner } from "../../atoms/loading/Spinner";

export type ConfigToggleVariant = "default" | "feature" | "security" | "ai";

export interface ConfigToggleProps {
  id: string;
  label: string;
  description?: string;
  tooltip?: string;
  checked: boolean;
  onChange: (checked: boolean) => Promise<void> | void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ConfigToggleVariant;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  showIcon?: boolean;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  optimistic?: boolean; // Nueva prop para UX optimista
}

/**
 * Toggle molecular con tooltip, descripción y variants para diferentes tipos de configuración
 * Optimizado para settings de aplicaciones con contexto visual claro
 * 
 * @example
 * <ConfigToggle 
 *   id="moderation"
 *   label="Activar Moderación"
 *   description="El organizador controla permisos de los participantes"
 *   tooltip="Permite al anfitrión controlar quién puede chatear, presentar y reaccionar"
 *   checked={moderationEnabled}
 *   onChange={setModerationEnabled}
 *   variant="security"
 * />
 * 
 * <ConfigToggle 
 *   id="auto-recording"
 *   label="Grabación Automática"
 *   description="Las reuniones se grabarán automáticamente al iniciar"
 *   checked={autoRecording}
 *   onChange={setAutoRecording}
 *   variant="ai"
 *   badge={{ text: "PREMIUM", variant: "secondary" }}
 * />
 */
export const ConfigToggle: React.FC<ConfigToggleProps> = ({
  id,
  label,
  description,
  tooltip,
  checked,
  onChange,
  disabled = false,
  loading = false,
  variant = "default",
  badge,
  showIcon = true,
  className,
  labelClassName,
  descriptionClassName,
  optimistic = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticChecked, setOptimisticChecked] = useState(checked);
  
  // Actualizar estado optimista cuando cambia el prop checked
  React.useEffect(() => {
    setOptimisticChecked(checked);
  }, [checked]);
  
  const handleChange = async (newChecked: boolean) => {
    if (disabled || isLoading || loading) return;
    
    // UX optimista: cambiar inmediatamente la UI
    if (optimistic) {
      setOptimisticChecked(newChecked);
    }
    
    setIsLoading(true);
    
    try {
      await onChange(newChecked);
      // Si no es optimista, actualizar aquí
      if (!optimistic) {
        setOptimisticChecked(newChecked);
      }
    } catch (error) {
      // En caso de error, revertir el estado optimista
      if (optimistic) {
        setOptimisticChecked(checked);
      }
      console.error('Error updating config toggle:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isCurrentlyLoading = isLoading || loading;
  const displayChecked = optimistic ? optimisticChecked : checked;
  
  // Configuración de variantes por tipo
  const variantConfig = {
    default: {
      labelColor: "text-foreground",
      descriptionColor: "text-muted-foreground",
      iconColor: "text-primary"
    },
    feature: {
      labelColor: "text-foreground",
      descriptionColor: "text-muted-foreground", 
      iconColor: "text-blue-600"
    },
    security: {
      labelColor: "text-foreground",
      descriptionColor: "text-muted-foreground",
      iconColor: "text-amber-600"
    },
    ai: {
      labelColor: "text-foreground",
      descriptionColor: "text-muted-foreground",
      iconColor: "text-purple-600"
    }
  };

  const config = variantConfig[variant];

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-0.5 flex-1 mr-4">
        {/* Label con tooltip e icono */}
        <div className="flex items-center gap-2">
          <Label 
            htmlFor={id}
            className={cn(
              "font-medium cursor-pointer",
              config.labelColor,
              disabled && "opacity-50 cursor-not-allowed",
              labelClassName
            )}
          >
            {label}
          </Label>
          
          {/* Badge opcional */}
          {badge && (
            <Badge 
              variant={badge.variant || "secondary"} 
              className="text-xs"
            >
              {badge.text}
            </Badge>
          )}
          
          {/* Tooltip con información adicional */}
          {tooltip && showIcon && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InformationCircleIcon 
                    className={cn(
                      "h-4 w-4 cursor-help z-100",
                      config.iconColor,
                      disabled && "opacity-50"
                    )} 
                  />
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-sm z-[60]" 
                  side="left"
                  align="center"
                  avoidCollisions={true}
                  collisionPadding={16}
                  sideOffset={8}
                  forceMount={undefined}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{tooltip}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* Descripción */}
        {description && (
          <p className={cn(
            "text-sm",
            config.descriptionColor,
            disabled && "opacity-50",
            descriptionClassName
          )}>
            {description}
          </p>
        )}
      </div>
      
      {/* Switch con Loading */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isCurrentlyLoading && (
          <Spinner 
            size="sm" 
            className={cn(
              "text-primary",
              variant === "security" && "text-amber-600",
              variant === "ai" && "text-purple-600",
              variant === "feature" && "text-blue-600"
            )} 
          />
        )}
        <Switch
          id={id}
          checked={displayChecked}
          onCheckedChange={handleChange}
          disabled={disabled || isCurrentlyLoading}
          className={cn(
            "flex-shrink-0 transition-opacity",
            disabled && "opacity-50",
            isCurrentlyLoading && "opacity-75"
          )}
          aria-describedby={description ? `${id}-description` : undefined}
        />
      </div>
      
      {/* Hidden description for screen readers */}
      {description && (
        <div id={`${id}-description`} className="sr-only">
          {description}
        </div>
      )}
    </div>
  );
};