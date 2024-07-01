import React, { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Column } from "@tanstack/react-table";
import { XIcon } from "lucide-react";

type TextFilterHeaderProps<T> = {
  column: Column<T>;
  title: string;
};

function TextFilterHeader<T>({ column, title }: TextFilterHeaderProps<T>) {
  const [inputValue, setInputValue] = useState<string>("");
  const [filterValues, setFilterValues] = useState<string[]>(
    (column.getFilterValue() as string[]) ?? []
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      const newFilterValues = [...filterValues, inputValue.trim()];
      setFilterValues(newFilterValues);
      column.setFilterValue(newFilterValues);
      setInputValue("");
    }
  };

  const removeFilter = (valueToRemove: string) => {
    const newFilterValues = filterValues.filter(
      (value) => value !== valueToRemove
    );
    setFilterValues(newFilterValues);
    column.setFilterValue(
      newFilterValues.length > 0 ? newFilterValues : undefined
    );
  };

  return (
    <div className="flex flex-col">
      {title}
      <div className="mt-1">
        <Input
          placeholder={`Filtrar ${title.toLowerCase()}...`}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          className="mt-1"
        />
        <div className="mt-1 space-y-1">
          {filterValues.map((value) => (
            <div
              key={value}
              className="flex items-center justify-between bg-gray-200 rounded px-2 py-1"
            >
              <span>{value}</span>
              <button
                onClick={() => removeFilter(value)}
                aria-label="Remove filter"
              >
                <XIcon className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TextFilterHeader;
