"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Pencil, Check, X } from "lucide-react";

// Import CSS files
import "./quill-custom.css";
import { ReactQuillWrapper } from "@/src/components/ui/ReactQuillWrapper";
import { processDescription } from "@/src/lib/description-utils";

interface EditableDescriptionProps {
  description?: string;
  eventId: string;
  calendarId: string;
  onUpdate: (
    eventId: string,
    calendarId: string,
    description: string
  ) => Promise<void>;
}

export const EditableDescription: React.FC<EditableDescriptionProps> = ({
  description = "",
  eventId,
  calendarId,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onUpdate(eventId, calendarId, editedDescription);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating description:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedDescription(description);
    setIsEditing(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className='space-y-2' onClick={(e) => e.stopPropagation()}>
        <div className='[&_.ql-editor_a]:text-primary [&_.ql-editor_a]:underline [&_.ql-editor_a:hover]:text-primary/80 [&_.ql-editor_a]:font-medium [&_.ql-toolbar_.ql-link]:text-primary'>
          <ReactQuillWrapper
            value={editedDescription}
            onChange={setEditedDescription}
            className='bg-background'
            theme='snow'
          />
        </div>
        <div className='flex gap-2'>
          <Button
            size='sm'
            onClick={handleSave}
            disabled={isLoading}
            className='h-7 px-2'
          >
            <Check className='h-3 w-3 mr-1' />
            Guardar
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={handleCancel}
            disabled={isLoading}
            className='h-7 px-2'
          >
            <X className='h-3 w-3 mr-1' />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className='group relative cursor-pointer hover:bg-accent/20 p-2 rounded transition-colors'
      onClick={handleEdit}
    >
      {description ? (
        <div
          className='prose prose-sm max-w-none text-sm event-description'
          dangerouslySetInnerHTML={{ __html: processDescription(description) }}
        />
      ) : (
        <span className='text-muted-foreground text-sm italic'>
          Hacer clic para añadir descripción
        </span>
      )}
      <Button
        size='sm'
        variant='ghost'
        className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0'
        onClick={handleEdit}
      >
        <Pencil className='h-3 w-3' />
      </Button>
    </div>
  );
};
