import React from "react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { cn } from "@/src/lib/utils";

export interface EmailInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Input especializado para emails con validación visual
 */
export const EmailInput: React.FC<EmailInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "email@ejemplo.com",
  error,
  disabled = false,
  className,
  inputClassName,
  onKeyPress,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onKeyPress={onKeyPress}
        className={cn(
          error && "border-destructive focus:ring-destructive",
          inputClassName
        )}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};