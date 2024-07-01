import React, { useEffect, useState } from "react";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Column } from "@tanstack/react-table";

type CheckboxFilterHeaderProps<T> = {
  column: Column<T>;
  title: string;
  data: T[];
  accessorKey: keyof T;
};

function CheckboxFilterHeader<T>({
  column,
  title,
  data,
  accessorKey,
}: CheckboxFilterHeaderProps<T>) {
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    (column.getFilterValue() as string[]) ?? []
  );

  useEffect(() => {
    const values = Array.from(
      new Set(data.map((item) => String(item[accessorKey])))
    );
    setUniqueValues(values);
  }, [data, accessorKey]);

  const toggleValue = (value: string) => {
    setSelectedValues((prev) => {
      const newValues = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      column.setFilterValue(newValues.length > 0 ? newValues : undefined);
      return newValues;
    });
  };

  return (
    <div className="flex flex-col">
      {title}
      <div className="mt-1">
        {uniqueValues.map((value) => (
          <div key={value} className="flex items-center space-x-2">
            <Checkbox
              checked={selectedValues.includes(value)}
              onCheckedChange={() => toggleValue(value)}
              aria-label={`Filter by ${value}`}
            />
            <label>{value}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CheckboxFilterHeader;
