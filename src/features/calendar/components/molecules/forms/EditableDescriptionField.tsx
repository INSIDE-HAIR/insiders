/**
 * EditableDescriptionField - Molecular Component
 * 
 * Campo editable de descripción usando Textarea de shadcn
 * Compatible con sistema legacy y mantiene estética IDÉNTICA
 */

"use client";

import React, { useState } from "react";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { CheckIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

// Legacy compatibility interface (from original usage in columns.tsx)
interface LegacyEditableDescriptionProps {
  description: string;
  eventId: string;
  calendarId: string;
  onUpdate: (eventId: string, calendarId: string, description: string) => Promise<void>;
}

// Modern interface
interface ModernEditableDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  emptyText?: string;
}

// Union type for backward compatibility
type EditableDescriptionFieldProps = LegacyEditableDescriptionProps | ModernEditableDescriptionProps;

// Type guard to check if props are legacy
function isLegacyProps(props: EditableDescriptionFieldProps): props is LegacyEditableDescriptionProps {
  return 'description' in props && 'eventId' in props;
}

export const EditableDescriptionField: React.FC<EditableDescriptionFieldProps> = (props) => {
  if (isLegacyProps(props)) {
    return <LegacyEditableDescriptionField {...props} />;
  } else {
    return <ModernEditableDescriptionField {...props} />;
  }
};

// Legacy implementation for backward compatibility
const LegacyEditableDescriptionField: React.FC<LegacyEditableDescriptionProps> = ({
  description,
  eventId,
  calendarId,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempValue, setTempValue] = useState(description);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempValue(description);
    setIsEditing(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onUpdate(eventId, calendarId, tempValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating description:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempValue(description);
    setIsEditing(false);
  };

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (isEditing) {
    return (
      <div 
        className="space-y-2"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          placeholder="Escribir descripción del evento..."
          rows={4}
          maxLength={1000}
          className="resize-none"
        />
        <div className="flex items-center gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-8"
          >
            <CheckIcon className="h-4 w-4 mr-1" />
            Guardar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-8"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleEdit}
      className="text-left hover:bg-muted/50 p-2 rounded transition-colors w-full"
      title="Editar descripción"
    >
      <div className="flex items-start gap-2">
        <PencilIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {description ? (
            <div 
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <span className="text-sm text-muted-foreground italic">
              Sin descripción
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Modern implementation for new usage
const ModernEditableDescriptionField: React.FC<ModernEditableDescriptionProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  className,
  disabled = false,
  placeholder = "Escribir descripción...",
  maxLength = 1000,
  rows = 3,
  emptyText = "Sin descripción",
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

  if (isEditing) {
    return (
      <div 
        className={cn("space-y-2", className)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className="resize-none"
        />
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs text-muted-foreground">
            {tempValue.length}/{maxLength}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={disabled}
            className="h-8"
          >
            <CheckIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={disabled}
            className="h-8"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleEditMode}
      disabled={disabled}
      className={cn(
        "text-left hover:bg-muted/50 p-2 rounded transition-colors w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      title="Editar descripción"
    >
      <div className="flex items-start gap-2">
        <PencilIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {value ? (
            <p className="text-sm line-clamp-3">{value}</p>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              {emptyText}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Loading skeleton
export const EditableDescriptionFieldSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <Skeleton className="h-20 w-full" />
  </div>
);

EditableDescriptionField.displayName = "EditableDescriptionField";