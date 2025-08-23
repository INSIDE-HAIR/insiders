import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import {
  TagIcon,
  UsersIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export type AccordionHeaderIcon = "tag" | "users";

export interface AccordionHeaderProps {
  icon: AccordionHeaderIcon;
  title: string;
  count?: number;
  countLabel?: string;
  isOpen?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Header atómico para accordions con icono y badge contador
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <AccordionHeader 
 *   icon="tag" 
 *   title="Tags" 
 *   count={3} 
 *   countLabel="asignados" 
 * />
 * 
 * <AccordionHeader 
 *   icon="users" 
 *   title="Grupos" 
 *   count={2} 
 *   countLabel="asignados" 
 * />
 */
export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  icon,
  title,
  count,
  countLabel = "asignados",
  isOpen = false,
  className,
  children
}) => {
  
  const getIcon = () => {
    const iconClass = "h-5 w-5 text-primary";
    
    switch (icon) {
      case "tag":
        return <TagIcon className={iconClass} />;
      case "users":
        return <UsersIcon className={iconClass} />;
      default:
        return <TagIcon className={iconClass} />;
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50",
      className
    )}>
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="font-semibold">{title}</span>
        {count !== undefined && (
          <Badge variant="outline">
            {count} {countLabel}
          </Badge>
        )}
        {children}
      </div>
      
      <ChevronRightIcon 
        className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-90"
        )} 
      />
    </div>
  );
};