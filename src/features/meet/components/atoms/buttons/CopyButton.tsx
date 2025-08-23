import React from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export interface CopyButtonProps {
  value: string;
  variant?: "copy" | "external";
  size?: "sm" | "default";
  className?: string;
  onCopy?: (value: string) => void;
  onExternal?: (value: string) => void;
}

/**
 * Botón atómico para copiar texto o abrir enlaces externos
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <CopyButton value="spaces/demo-room-abc123xyz" variant="copy" />
 * <CopyButton value="https://meet.google.com/abc-def-ghi" variant="external" />
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  variant = "copy", 
  size = "sm",
  className,
  onCopy,
  onExternal
}) => {
  
  const handleClick = () => {
    if (variant === "copy") {
      navigator.clipboard.writeText(value);
      onCopy?.(value);
    } else if (variant === "external") {
      window.open(value, '_blank');
      onExternal?.(value);
    }
  };

  // Iconos SVG exactos del ResponsiveModalDemo
  const CopyIcon = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  const ExternalIcon = () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={cn(className)}
      aria-label={variant === "copy" ? `Copiar ${value}` : `Abrir ${value}`}
    >
      {variant === "copy" ? <CopyIcon /> : <ExternalIcon />}
    </Button>
  );
};