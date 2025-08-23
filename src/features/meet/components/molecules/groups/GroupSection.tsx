import React from "react";
import { cn } from "@/src/lib/utils";
import { FieldLabel } from "../../atoms/text/FieldLabel";
import { GroupBadge } from "../../atoms/badges/GroupBadge";
import { ScrollableList } from "../../atoms/layout/ScrollableList";

export interface Group {
  name: string;
  path: string;
  color: string;
}

export interface GroupSectionProps {
  label: string;
  groups: Group[];
  variant: "assigned" | "available";
  onGroupRemove?: (groupName: string) => void;
  onGroupAdd?: (groupName: string) => void;
  className?: string;
}

/**
 * Molecule para secciones de grupos (asignados o disponibles)
 * Replica exactamente la estructura del ResponsiveModalDemo
 * 
 * @example
 * <GroupSection 
 *   label="Grupos Asignados"
 *   groups={assignedGroups}
 *   variant="assigned"
 *   onGroupRemove={(name) => console.log('Desasignar:', name)}
 * />
 * 
 * <GroupSection 
 *   label="Grupos Disponibles"
 *   groups={availableGroups}
 *   variant="available"
 *   onGroupAdd={(name) => console.log('Asignar grupo:', name)}
 * />
 */
export const GroupSection: React.FC<GroupSectionProps> = ({
  label,
  groups,
  variant,
  onGroupRemove,
  onGroupAdd,
  className
}) => {
  
  const handleGroupAction = (groupName: string) => {
    if (variant === "assigned") {
      onGroupRemove?.(groupName);
    } else {
      onGroupAdd?.(groupName);
    }
  };

  const renderAssignedGroups = () => (
    <div className="space-y-2">
      {groups.map((group, index) => (
        <GroupBadge
          key={index}
          name={group.name}
          path={group.path}
          color={group.color}
          removable={true}
          onRemove={handleGroupAction}
        />
      ))}
    </div>
  );

  const renderAvailableGroups = () => (
    <ScrollableList>
      {groups.map((group, index) => (
        <GroupBadge
          key={index}
          name={group.name}
          path={group.path}
          color={group.color}
          removable={false}
          onClick={handleGroupAction}
        />
      ))}
    </ScrollableList>
  );

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel>{label}</FieldLabel>
      
      {variant === "assigned" ? renderAssignedGroups() : renderAvailableGroups()}
    </div>
  );
};