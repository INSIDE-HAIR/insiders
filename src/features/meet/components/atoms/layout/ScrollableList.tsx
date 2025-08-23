import React from "react";
import { cn } from "@/src/lib/utils";

export interface ScrollableListProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

/**
 * Contenedor atómico scrollable con styling exacto del ResponsiveModalDemo
 * 
 * @example
 * <ScrollableList maxHeight="max-h-32">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </ScrollableList>
 */
export const ScrollableList: React.FC<ScrollableListProps> = ({
  children,
  maxHeight = "max-h-32",
  className
}) => {
  
  return (
    <div className={cn(
      maxHeight,
      "overflow-y-auto space-y-1 border rounded-md p-2",
      className
    )}>
      {children}
    </div>
  );
};