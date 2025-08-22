import React from "react";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { InfoTooltipIcon } from "../icons/InfoTooltipIcon";
import { cn } from "@/src/lib/utils";

export interface LabeledSwitchProps {
  id: string;
  label: string;
  description?: string;
  tooltip?: string | React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Switch con label, descripción opcional y tooltip
 * Usado para configuraciones booleanas en formularios
 */
export const LabeledSwitch: React.FC<LabeledSwitchProps> = ({
  id,
  label,
  description,
  tooltip,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Label htmlFor={id}>{label}</Label>
          {tooltip && <InfoTooltipIcon content={tooltip} />}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
};