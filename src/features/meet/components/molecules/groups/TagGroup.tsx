import React from "react";
import { cn } from "@/src/lib/utils";
import { FieldLabel } from "../../atoms/text/FieldLabel";
import { TagBadge } from "../../atoms/badges/TagBadge";
import { ScrollableList } from "../../atoms/layout/ScrollableList";

export interface Tag {
  name: string;
  color: string;
  slug?: string;
  path?: string;
}

export interface TagGroupProps {
  label: string;
  tags: Tag[];
  variant: "assigned" | "available";
  onTagRemove?: (tagName: string) => void;
  onTagAdd?: (tagName: string) => void;
  className?: string;
}

/**
 * Molecule para grupos de tags (asignados o disponibles)
 * Replica exactamente la estructura del ResponsiveModalDemo
 * 
 * @example
 * <TagGroup 
 *   label="Tags Asignados"
 *   tags={assignedTags}
 *   variant="assigned"
 *   onTagRemove={(name) => console.log('Remover:', name)}
 * />
 * 
 * <TagGroup 
 *   label="Tags Disponibles"
 *   tags={availableTags}
 *   variant="available"
 *   onTagAdd={(name) => console.log('Agregar:', name)}
 * />
 */
export const TagGroup: React.FC<TagGroupProps> = ({
  label,
  tags,
  variant,
  onTagRemove,
  onTagAdd,
  className
}) => {
  
  const handleTagAction = (tagName: string) => {
    if (variant === "assigned") {
      onTagRemove?.(tagName);
    } else {
      onTagAdd?.(tagName);
    }
  };

  const renderAssignedTags = () => (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <TagBadge
          key={tag.slug || index}
          name={tag.name}
          color={tag.color}
          removable={true}
          onRemove={handleTagAction}
        />
      ))}
    </div>
  );

  const renderAvailableTags = () => (
    <ScrollableList>
      {tags.map((tag, index) => (
        <TagBadge
          key={tag.slug || index}
          name={tag.name}
          color={tag.color}
          removable={false}
          onClick={handleTagAction}
          className="cursor-pointer hover:cursor-pointer"
        />
      ))}
    </ScrollableList>
  );

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel>{label}</FieldLabel>
      
      {variant === "assigned" ? renderAssignedTags() : renderAvailableTags()}
    </div>
  );
};