/**
 * Calendar Atoms - Types & Interfaces
 * 
 * Centralización de todas las interfaces y types para atoms
 */

// Status types
export type EventStatus = "upcoming" | "ongoing" | "past";

// Action types  
export type ActionVariant = "edit" | "delete" | "view";

// Loading states
export interface LoadingState {
  isLoading?: boolean;
}

// Base atom props
export interface BaseAtomProps extends LoadingState {
  className?: string;
}

// Badge props
export interface StatusBadgeProps extends BaseAtomProps {
  status: EventStatus;
}

// Button props
export interface ActionButtonProps extends BaseAtomProps {
  variant?: ActionVariant;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}

// Toggle props
export interface VisibilityToggleProps extends BaseAtomProps {
  isVisible: boolean;
  onToggle: () => void;
  title?: string;
}

// Tooltip props
export interface ActionTooltipProps extends BaseAtomProps {
  title: string;
  description: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

// Loading props
export interface SkeletonBoxProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export interface SpinnerProps extends BaseAtomProps {
  size?: "sm" | "md" | "lg";
}