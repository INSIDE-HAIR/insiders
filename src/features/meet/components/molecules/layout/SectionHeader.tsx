import React from "react";
import { cn } from "@/src/lib/utils";
import {
  InformationCircleIcon,
  TagIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export type SectionHeaderIcon = 
  | "information"
  | "tag"
  | "users"
  | "cog"
  | "chart"
  | "calendar"
  | "video"
  | "document";

export interface SectionHeaderProps {
  icon: SectionHeaderIcon;
  title: string;
  className?: string;
}

/**
 * Componente molecular para headers de sección
 * Replica exactamente la estructura del ResponsiveModalDemo
 * 
 * @example
 * <SectionHeader icon="information" title="Información General" />
 * <SectionHeader icon="tag" title="Tags y Referencias" />
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  className
}) => {
  
  const getIcon = () => {
    const iconClass = "h-5 w-5 text-primary";
    
    switch (icon) {
      case "information":
        return <InformationCircleIcon className={iconClass} />;
      case "tag":
        return <TagIcon className={iconClass} />;
      case "users":
        return <UsersIcon className={iconClass} />;
      case "cog":
        return <Cog6ToothIcon className={iconClass} />;
      case "chart":
        return <ChartBarIcon className={iconClass} />;
      case "calendar":
        return <CalendarDaysIcon className={iconClass} />;
      case "video":
        return <VideoCameraIcon className={iconClass} />;
      case "document":
        return <DocumentTextIcon className={iconClass} />;
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  return (
    <div className={cn("flex items-center gap-2 mb-4", className)}>
      {getIcon()}
      <h3 className="font-medium text-base">{title}</h3>
    </div>
  );
};