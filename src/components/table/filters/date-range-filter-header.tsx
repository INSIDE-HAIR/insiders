import React, { useState } from "react";
import { Column } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { Input } from "@/src/components/ui/input";

interface DateRangeFilterHeaderProps {
  column: Column<any, any>;
  title: string;
}

const DateRangeFilterHeader: React.FC<DateRangeFilterHeaderProps> = ({
  column,
  title,
}) => {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [filterValues, setFilterValues] = useState<{
    from?: string;
    to?: string;
  }>({
    from:
      (column.getFilterValue() as { from?: string; to?: string })?.from ?? "",
    to: (column.getFilterValue() as { from?: string; to?: string })?.to ?? "",
  });

  const handleFromKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && from.trim() !== "") {
      const newFilterValues = { ...filterValues, from: from.trim() };
      setFilterValues(newFilterValues);
      column.setFilterValue(newFilterValues);
    }
  };

  const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && to.trim() !== "") {
      const newFilterValues = { ...filterValues, to: to.trim() };
      setFilterValues(newFilterValues);
      column.setFilterValue(newFilterValues);
    }
  };

  const removeFilter = (key: "from" | "to") => {
    const newFilterValues = { ...filterValues, [key]: undefined };
    setFilterValues(newFilterValues);
    column.setFilterValue(newFilterValues);
  };

  return (
    <div className="flex flex-col">
      <label>{title}</label>
      <Input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        onKeyDown={handleFromKeyDown}
        placeholder="Desde"
        className="mt-1"
      />
      <div className="mt-1 space-y-1">
        {filterValues.from && (
          <div className="flex items-center justify-between bg-gray-200 rounded px-2 py-1">
            <span>
              Desde: {new Date(filterValues.from).toLocaleDateString()}
            </span>
            <button
              onClick={() => removeFilter("from")}
              aria-label="Remove filter"
            >
              <XIcon className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          onKeyDown={handleToKeyDown}
          placeholder="Hasta"
          className="mt-1"
        />
        {filterValues.to && (
          <div className="flex items-center justify-between bg-gray-200 rounded px-2 py-1">
            <span>Hasta: {new Date(filterValues.to).toLocaleDateString()}</span>
            <button
              onClick={() => removeFilter("to")}
              aria-label="Remove filter"
            >
              <XIcon className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilterHeader;
