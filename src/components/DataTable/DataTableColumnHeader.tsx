// src/components/table/DataTableColumnHeader.tsx
import React from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { CaretSortIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import { ColumnFilter } from "./ColumnFilter";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  setColumnVisibility: (columnId: string, visible: boolean) => void;
  onRemoveFilter: (columnId: string, value: string) => void;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  setColumnVisibility,
  onRemoveFilter,
}: DataTableColumnHeaderProps<TData, TValue>) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>{title}</span>
              {column.getIsSorted() === "desc" ? (
                <ArrowDownIcon className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUpIcon className="ml-2 h-4 w-4" />
              ) : (
                <CaretSortIcon className="ml-2 h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Desc
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setColumnVisibility(column.id, false)}
            >
              <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Hide
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {column.getCanFilter() && (
        <div className="mt-2">
          <ColumnFilter
            column={column}
            title={title}
            onRemoveFilter={onRemoveFilter}
          />
        </div>
      )}
    </div>
  );
}
