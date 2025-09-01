/**
 * EditableTitleField - Molecular Component
 * 
 * Campo editable de título usando Input de shadcn
 * Compatible con sistema legacy y mantiene estética IDÉNTICA
 */

"use client";

import React, { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { CheckIcon, XMarkIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

// Legacy compatibility interface (from original usage in columns.tsx)
interface LegacyEditableTitleProps {
  title: string;
  eventId: string;
  calendarId: string;
  onUpdate: (eventId: string, calendarId: string, title: string) => Promise<void>;
}

// Modern interface
interface ModernEditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  emptyText?: string;
}

// Union type for backward compatibility
type EditableTitleFieldProps = LegacyEditableTitleProps | ModernEditableTitleProps;

// Type guard to check if props are legacy
function isLegacyProps(props: EditableTitleFieldProps): props is LegacyEditableTitleProps {
  return 'title' in props && 'eventId' in props;
}

export const EditableTitleField: React.FC<EditableTitleFieldProps> = (props) => {
  if (isLegacyProps(props)) {
    return <LegacyEditableTitleField {...props} />;
  } else {
    return <ModernEditableTitleField {...props} />;
  }
};

// Legacy implementation for backward compatibility
const LegacyEditableTitleField: React.FC<LegacyEditableTitleProps> = ({
  title,
  eventId,
  calendarId,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempValue, setTempValue] = useState(title);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempValue(title);
    setIsEditing(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onUpdate(eventId, calendarId, tempValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating title:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave(e as any);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel(e as any);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-8 w-48" />;
  }

  if (isEditing) {
    return (
      <div 
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Título del evento"
          maxLength={255}
          className="flex-1 min-w-[200px] font-medium"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={!tempValue.trim()}
          className="h-8 w-8 p-0"
        >
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
        >
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={handleEdit}
      className="text-left hover:bg-muted/50 p-2 rounded transition-colors"
      title="Editar título"
    >
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium truncate">
          {title || "Sin título"}
        </span>
      </div>
    </button>
  );
};

// Modern implementation for new usage
const ModernEditableTitleField: React.FC<ModernEditableTitleProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  className,
  disabled = false,
  placeholder = "Título del evento",
  maxLength = 255,
  emptyText = "Sin título",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(tempValue);
    onSave?.(tempValue);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempValue(value);
    onCancel?.();
    setIsEditing(false);
  };

  const handleEditMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave(e as any);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel(e as any);
    }
  };

  if (isEditing) {
    return (
      <div 
        className={cn("flex items-center gap-2", className)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className="flex-1 font-medium"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={disabled || !tempValue.trim()}
          className="h-8 w-8 p-0"
        >
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={handleEditMode}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 text-left hover:bg-muted/50 p-2 rounded transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      title="Editar título"
    >
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium truncate">
        {value || emptyText}
      </span>
    </button>
  );
};

// Loading skeleton
export const EditableTitleFieldSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <Skeleton className="h-8 w-48" />
  </div>
);

EditableTitleField.displayName = "EditableTitleField";