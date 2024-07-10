// ColumnFilter.tsx
import React, { useState, useEffect } from "react";
import { Column } from "@tanstack/react-table";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { XIcon } from "lucide-react";

interface ColumnFilterProps<T> {
  column: Column<T, unknown>;
  title: React.ReactNode;
  onRemoveFilter: (columnId: string, value: string) => void;
}

export function ColumnFilter<T>({
  column,
  title,
  onRemoveFilter,
}: ColumnFilterProps<T>) {
  const [inputValue, setInputValue] = useState("");
  const [filterValues, setFilterValues] = useState<string[]>([]);

  useEffect(() => {
    // Actualizar filterValues cuando cambie el valor del filtro de la columna
    const columnFilterValue = column.getFilterValue();
    setFilterValues(Array.isArray(columnFilterValue) ? columnFilterValue : []);
  }, [column]);

  const addFilter = (value: string) => {
    if (value.trim() !== "" && !filterValues.includes(value.trim())) {
      const newFilterValues = [...filterValues, value.trim()];
      setFilterValues(newFilterValues);
      column.setFilterValue(newFilterValues);
    }
    setInputValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addFilter(inputValue);
    }
  };

  const getTitleString = (): string => {
    if (typeof title === "string") {
      return title.toLowerCase();
    }
    if (React.isValidElement(title)) {
      return "filtrar";
    }
    return String(title).toLowerCase();
  };

  return (
    <div className="space-y-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Filtrar ${getTitleString()}...`}
      />
      <div className="flex flex-wrap gap-1">
        {filterValues.map((value, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {value}
            <button
              onClick={() => onRemoveFilter(column.id, value)}
              className="ml-1"
            >
              <XIcon size={12} />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
