import React, { useState } from "react";
import { cn } from "@/src/lib/utils";
import { AccordionHeader, AccordionHeaderIcon } from "../../atoms/layout/AccordionHeader";

export interface AccordionSectionProps {
  icon: AccordionHeaderIcon;
  title: string;
  count?: number;
  countLabel?: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Molecule de accordion completa con header y contenido
 * Replica exactamente la funcionalidad del ResponsiveModalDemo
 * 
 * @example
 * <AccordionSection 
 *   icon="tag" 
 *   title="Tags" 
 *   count={3} 
 *   countLabel="asignados"
 *   defaultOpen={false}
 * >
 *   <TagGroup label="Tags Asignados" tags={assignedTags} variant="assigned" />
 *   <TagGroup label="Tags Disponibles" tags={availableTags} variant="available" />
 * </AccordionSection>
 */
export const AccordionSection: React.FC<AccordionSectionProps> = ({
  icon,
  title,
  count,
  countLabel,
  defaultOpen = false,
  className,
  children
}) => {
  
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <details 
      className={cn(
        "group border border-border rounded-lg",
        className
      )}
      open={isOpen}
    >
      <summary 
        className="list-none"
        onClick={(e) => {
          e.preventDefault();
          handleToggle();
        }}
      >
        <AccordionHeader
          icon={icon}
          title={title}
          count={count}
          countLabel={countLabel}
          isOpen={isOpen}
        />
      </summary>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {children}
        </div>
      )}
    </details>
  );
};