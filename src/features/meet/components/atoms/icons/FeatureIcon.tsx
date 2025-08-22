import React from "react";
import {
  VideoCameraIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  FolderIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

export type FeatureType = 
  | "recording"
  | "transcription"
  | "smartNotes"
  | "analytics"
  | "members"
  | "settings"
  | "groups"
  | "tags";

export interface FeatureIconProps {
  feature: FeatureType;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Icono para diferentes características de Meet
 */
export const FeatureIcon: React.FC<FeatureIconProps> = ({
  feature,
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const icons: Record<FeatureType, React.ComponentType<{ className?: string }>> = {
    recording: VideoCameraIcon,
    transcription: MicrophoneIcon,
    smartNotes: DocumentTextIcon,
    analytics: ChartBarIcon,
    members: UsersIcon,
    settings: Cog6ToothIcon,
    groups: FolderIcon,
    tags: TagIcon,
  };

  const Icon = icons[feature];

  return (
    <Icon
      className={cn(
        sizeClasses[size],
        "text-muted-foreground",
        className
      )}
    />
  );
};