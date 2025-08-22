import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

export interface InfoTooltipIconProps {
  content: string | React.ReactNode;
  className?: string;
  iconClassName?: string;
  contentClassName?: string;
}

/**
 * Icono de información con tooltip al hacer hover
 * Usado para proporcionar contexto adicional en configuraciones
 */
export const InfoTooltipIcon: React.FC<InfoTooltipIconProps> = ({
  content,
  className,
  iconClassName,
  contentClassName,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          <InformationCircleIcon 
            className={cn(
              "h-4 w-4 text-primary cursor-help",
              iconClassName
            )} 
          />
        </TooltipTrigger>
        <TooltipContent className={cn("max-w-sm", contentClassName)}>
          {typeof content === "string" ? (
            <p className="text-sm">{content}</p>
          ) : (
            content
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};