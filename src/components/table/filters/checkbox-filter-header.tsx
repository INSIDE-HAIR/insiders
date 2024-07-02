import React, { useEffect, useState } from "react";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Column } from "@tanstack/react-table";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/buttons/chadcn-button";

type CheckboxFilterHeaderProps<T> = {
  column: Column<T>;
  title: string;
  data: T[];
  accessorKey: keyof T;
  options?: string[]; // Opciones opcionales del JSON
};

function CheckboxFilterHeader<T>({
  column,
  title,
  data,
  accessorKey,
  options,
}: CheckboxFilterHeaderProps<T>) {
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    (column.getFilterValue() as string[]) ?? []
  );

  useEffect(() => {
    const values = options
      ? options
      : Array.from(new Set(data.map((item) => String(item[accessorKey]))));
    setUniqueValues(values);
  }, [data, accessorKey, options]);

  const toggleValue = (value: string) => {
    setSelectedValues((prev) => {
      const newValues = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      column.setFilterValue(newValues.length > 0 ? newValues : undefined);
      return newValues;
    });
  };

  const handleCheckedChange = (value: string) => {
    toggleValue(value);
  };

  return (
    <div className="flex flex-col">
      {title}
      <div className="mt-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {title} <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={5}
            alignOffset={-5}
            onCloseAutoFocus={(e) => e.preventDefault()} // Prevents closing on item select
          >
            {uniqueValues.map((value) => (
              <div
                key={value}
                className="flex items-center px-2 py-1 space-x-2 capitalize"
              >
                <Checkbox
                  checked={selectedValues.includes(value)}
                  onCheckedChange={() => handleCheckedChange(value)}
                  aria-label={`Filter by ${value}`}
                  className="data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-600 hover:bg-slate-200 border-slate-400"
                />
                <label className="text-slate-600 text-sm">{value}</label>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default CheckboxFilterHeader;
