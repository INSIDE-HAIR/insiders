// src/components/GroupColumnSelector.tsx
import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/src/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { VisibilityState } from "@tanstack/react-table";

interface GroupColumnSelectorProps {
  columnConfig: {
    accessorKey: string;
    header: string;
    category: string;
    subCategory: string;
  }[];
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  columnVisibility: VisibilityState;
}

export function GroupColumnSelector({
  columnConfig,
  setColumnVisibility,
  columnVisibility,
}: GroupColumnSelectorProps) {
  const categories = Array.from(
    new Set(columnConfig.map((col) => col.category))
  );

  const handleCategoryChange = (category: string, isVisible: boolean) => {
    setColumnVisibility((prev) => {
      const newState = { ...prev };
      columnConfig
        .filter((col) => col.category === category)
        .forEach((col) => {
          newState[col.accessorKey] = isVisible;
        });
      return newState;
    });
  };

  const handleSubCategoryChange = (
    category: string,
    subCategory: string,
    isVisible: boolean
  ) => {
    setColumnVisibility((prev) => {
      const newState = { ...prev };
      columnConfig
        .filter(
          (col) => col.category === category && col.subCategory === subCategory
        )
        .forEach((col) => {
          newState[col.accessorKey] = isVisible;
        });
      return newState;
    });
  };

  const handleColumnChange = (accessorKey: string, isVisible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [accessorKey]: isVisible,
    }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[400px] overflow-y-auto">
        {categories.map((category) => (
          <DropdownMenuSub key={category}>
            <DropdownMenuSubTrigger>
              <DropdownMenuCheckboxItem
                checked={columnConfig
                  .filter((col) => col.category === category)
                  .every((col) => columnVisibility[col.accessorKey])}
                onCheckedChange={(value) =>
                  handleCategoryChange(category, !!value)
                }
              >
                {category}
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {Array.from(
                new Set(
                  columnConfig
                    .filter((col) => col.category === category)
                    .map((col) => col.subCategory)
                )
              ).map((subCategory) => (
                <React.Fragment key={subCategory}>
                  <DropdownMenuLabel>{subCategory}</DropdownMenuLabel>
                  {columnConfig
                    .filter(
                      (col) =>
                        col.category === category &&
                        col.subCategory === subCategory
                    )
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.accessorKey}
                        checked={columnVisibility[col.accessorKey] || false}
                        onCheckedChange={(value) =>
                          handleColumnChange(col.accessorKey, !!value)
                        }
                      >
                        {col.header}
                      </DropdownMenuCheckboxItem>
                    ))}
                  <DropdownMenuSeparator />
                </React.Fragment>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
