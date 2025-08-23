import React from "react";
import { cn } from "@/src/lib/utils";
import { FieldLabel } from "../../atoms/text/FieldLabel";
import { CodeDisplay } from "../../atoms/display/CodeDisplay";
import { CopyButton } from "../../atoms/buttons/CopyButton";

export interface FieldGroupProps {
  label: string;
  value: string;
  variant?: "code" | "input";
  showCopy?: boolean;
  showExternal?: boolean;
  className?: string;
  onCopy?: (value: string) => void;
  onExternal?: (value: string) => void;
}

/**
 * Componente molecular que agrupa label + display + botones de acción
 * Replica exactamente la estructura del ResponsiveModalDemo
 * 
 * @example
 * <FieldGroup 
 *   label="ID de la Sala" 
 *   value="spaces/demo-room-abc123xyz" 
 *   variant="code" 
 *   showCopy 
 * />
 * <FieldGroup 
 *   label="Enlace de Reunión" 
 *   value="https://meet.google.com/abc-def-ghi" 
 *   variant="input" 
 *   showCopy 
 *   showExternal 
 * />
 */
export const FieldGroup: React.FC<FieldGroupProps> = ({
  label,
  value,
  variant = "code",
  showCopy = true,
  showExternal = false,
  className,
  onCopy,
  onExternal
}) => {
  
  return (
    <div className={cn(className)}>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2 mt-1">
        <CodeDisplay 
          value={value} 
          variant={variant}
        />
        {showCopy && (
          <CopyButton
            value={value}
            variant="copy"
            onCopy={onCopy}
          />
        )}
        {showExternal && (
          <CopyButton
            value={value}
            variant="external"
            onExternal={onExternal}
          />
        )}
      </div>
    </div>
  );
};