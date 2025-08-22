import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { InfoTooltipIcon } from "../icons/InfoTooltipIcon";
import { cn } from "@/src/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface LabeledSelectProps {
  id?: string;
  label: string;
  tooltip?: string | React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
}

/**
 * Select con label y tooltip opcional
 * Usado para selecciones en formularios
 */
export const LabeledSelect: React.FC<LabeledSelectProps> = ({
  id,
  label,
  tooltip,
  value,
  onValueChange,
  options,
  placeholder = "Seleccionar...",
  disabled = false,
  className,
  selectClassName,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        {tooltip && <InfoTooltipIcon content={tooltip} />}
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className={selectClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.icon && (
                <span className="mr-2 inline-flex">{option.icon}</span>
              )}
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};