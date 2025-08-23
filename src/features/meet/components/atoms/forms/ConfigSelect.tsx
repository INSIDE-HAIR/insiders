import React from "react";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

export interface ConfigSelectOption {
  value: string;
  label: string;
}

export interface ConfigSelectProps {
  id?: string;
  label: string;
  tooltip: string;
  options: ConfigSelectOption[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/**
 * Select atómico para configuraciones con tooltip
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <ConfigSelect 
 *   label="Restricción de Chat"
 *   tooltip="Control de Chat: Determina quién puede enviar mensajes en el chat durante la reunión."
 *   options={[
 *     { value: "NO_RESTRICTION", label: "Sin restricción" },
 *     { value: "MODERATOR_ONLY", label: "Solo moderadores" },
 *     { value: "DISABLED", label: "Chat deshabilitado" }
 *   ]}
 *   defaultValue="NO_RESTRICTION"
 * />
 */
export const ConfigSelect: React.FC<ConfigSelectProps> = ({
  id,
  label,
  tooltip,
  options,
  defaultValue,
  value,
  onValueChange,
  className
}) => {
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Label con tooltip - exacto del ResponsiveModalDemo */}
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: tooltip }} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Select - estructura exacta */}
      <Select 
        defaultValue={defaultValue} 
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};