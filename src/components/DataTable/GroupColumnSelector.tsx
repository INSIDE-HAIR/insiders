import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { dataBaseTranslation } from "@/db/constants";
import { VisibilityState } from "@tanstack/react-table";

interface GroupColumnSelectorProps {
  activeFields: Record<string, boolean>;
  setActiveFields: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
}

export function GroupColumnSelector({
  activeFields,
  setActiveFields,
  setColumnVisibility,
}: GroupColumnSelectorProps) {
  const handleGroupChange = (groupId: string, value: boolean) => {
    const group = dataBaseTranslation.find((g) => g.id === groupId);
    if (group) {
      const newActiveFields = { ...activeFields };
      const newVisibility: VisibilityState = {};

      group.groups.forEach((subGroup) => {
        subGroup.fields.forEach((field) => {
          newActiveFields[field.holdedFieldName] = value;
          newVisibility[field.holdedFieldName] = value;
        });
      });

      setActiveFields(newActiveFields);
      setColumnVisibility((prev) => ({ ...prev, ...newVisibility }));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {dataBaseTranslation.map((group) => (
          <DropdownMenuCheckboxItem
            key={group.id}
            checked={group.groups.every((subGroup) =>
              subGroup.fields.every(
                (field) => activeFields[field.holdedFieldName]
              )
            )}
            onCheckedChange={(value) => handleGroupChange(group.id, !!value)}
          >
            {group.es}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
