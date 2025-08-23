import React from "react";
import { cn } from "@/src/lib/utils";

export interface CodeDisplayProps {
  value: string;
  className?: string;
  variant?: "code" | "input";
  readOnly?: boolean;
}

/**
 * Componente atómico para mostrar código o valores read-only
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <CodeDisplay value="spaces/demo-room-abc123xyz" variant="code" />
 * <CodeDisplay value="https://meet.google.com/abc-def-ghi" variant="input" />
 */
export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  value,
  className,
  variant = "code",
  readOnly = true
}) => {
  
  if (variant === "input") {
    return (
      <input 
        className={cn(
          "bg-muted px-2 py-1 rounded text-sm flex-1",
          className
        )}
        value={value}
        readOnly={readOnly}
      />
    );
  }
  
  return (
    <code className={cn(
      "bg-muted px-2 py-1 rounded text-sm flex-1",
      className
    )}>
      {value}
    </code>
  );
};