import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

interface GroupColumnSelectorProps<TData> {
  table: Table<TData>;
}

export function GroupColumnSelector<TData>({
  table,
}: GroupColumnSelectorProps<TData>) {
  const getFormattedHeader = (header: string | undefined) => {
    if (!header || typeof header !== "string") return "";
    const parts = header.split(" - ");
    return parts.length > 1 ? parts.slice(1).join(" - ") : header;
  };

  const handleToggleCategoryVisibility = (
    category: string,
    isVisible: boolean
  ) => {
    table.getAllColumns().forEach((column) => {
      const meta = column.columnDef.meta as { category?: string } | undefined;
      if (meta?.category === category) {
        column.toggleVisibility(isVisible);
      }
    });
  };

  const categories = React.useMemo(() => {
    const cats: Record<string, Record<string, any[]>> = {};
    table.getAllColumns().forEach((column) => {
      const meta = column.columnDef.meta as
        | { category?: string; subCategory?: string }
        | undefined;
      if (meta?.category && meta?.subCategory) {
        if (!cats[meta.category]) cats[meta.category] = {};
        if (!cats[meta.category][meta.subCategory])
          cats[meta.category][meta.subCategory] = [];
        cats[meta.category][meta.subCategory].push(column);
      }
    });
    return cats;
  }, [table]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] max-h-[400px] overflow-y-auto"
      >
        <DropdownMenuCheckboxItem
          checked={table
            .getAllColumns()
            .every((column) => column.getIsVisible())}
          onCheckedChange={(value) => table.toggleAllColumnsVisible(!!value)}
        >
          Mostrar todo
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {Object.entries(categories).map(([category, subCategories]) => (
          <DropdownMenuSub key={category}>
            <DropdownMenuSubTrigger>
              <DropdownMenuCheckboxItem
                checked={table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      (column.columnDef.meta as any)?.category === category
                  )
                  .every((column) => column.getIsVisible())}
                onCheckedChange={(value) =>
                  handleToggleCategoryVisibility(category, !!value)
                }
              >
                {category}
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-[400px] overflow-y-auto">
              {Object.entries(subCategories).map(([subCategory, columns]) => (
                <React.Fragment key={subCategory}>
                  <DropdownMenuLabel>{subCategory}</DropdownMenuLabel>
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {getFormattedHeader(column.columnDef.header as string)}
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
