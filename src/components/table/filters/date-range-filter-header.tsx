import React, { useState, useEffect } from "react";
import { Column } from "@tanstack/react-table";
import { XIcon, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

interface DateRangeFilterHeaderProps {
  column: Column<any, any>;
  title: string;
  onAddFilter: (id: string, value: { from?: number; to?: number }) => void;
}

const DateRangeFilterHeader: React.FC<DateRangeFilterHeaderProps> = ({
  column,
  title,
  onAddFilter,
}) => {
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

  const [filterValues, setFilterValues] = useState<{
    from?: number;
    to?: number;
  }>({ from: undefined, to: undefined });

  useEffect(() => {
    const columnFilterValue = column.getFilterValue() as
      | { from?: number; to?: number }
      | undefined;
    if (columnFilterValue) {
      setFilterValues(columnFilterValue);
    }
  }, [column]);

  const handleFromSelect = (date: Date | undefined) => {
    const fromTimestamp = date ? date.getTime() : undefined;
    onAddFilter(column.id, { from: fromTimestamp, to: filterValues.to });
    setFilterValues((prev) => ({ ...prev, from: fromTimestamp }));
    setFrom(date);
  };

  const handleToSelect = (date: Date | undefined) => {
    const toTimestamp = date ? date.getTime() : undefined;
    onAddFilter(column.id, { from: filterValues.from, to: toTimestamp });
    setFilterValues((prev) => ({ ...prev, to: toTimestamp }));
    setTo(date);
  };

  const removeFilter = (type: "from" | "to") => {
    if (type === "from") {
      onAddFilter(column.id, { from: undefined, to: filterValues.to });
      setFilterValues((prev) => ({ ...prev, from: undefined }));
      setFrom(undefined);
    } else if (type === "to") {
      onAddFilter(column.id, { from: filterValues.from, to: undefined });
      setFilterValues((prev) => ({ ...prev, to: undefined }));
      setTo(undefined);
    }
  };

  return (
    <div className="flex flex-col">
      <label>{title}</label>
      <div className="flex gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`mt-1 ${!from ? "text-muted-foreground" : ""}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {from ? from.toLocaleDateString() : <span>Desde</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={from}
              onSelect={handleFromSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`mt-1 ${!to ? "text-muted-foreground" : ""}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {to ? to.toLocaleDateString() : <span>Hasta</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={to}
              onSelect={handleToSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col" >
        {filterValues.from && (
          <Badge className="flex items-center justify-between bg-slate-200 hover:bg-slate-300 my-1">
            <span className="text-slate-500">
              Desde: {new Date(filterValues.from).toLocaleDateString()}
            </span>
            <button
              onClick={() => removeFilter("from")}
              aria-label="Remove filter"
              className="ml-2"
            >
              <XIcon className="h-4 w-4 text-red-600" />
            </button>
          </Badge>
        )}

        {filterValues.to && (
          <Badge className="flex items-center justify-between bg-slate-200 hover:bg-slate-300 mb-1">
            <span className="text-slate-500">
              Hasta: {new Date(filterValues.to).toLocaleDateString()}
            </span>
            <button
              onClick={() => removeFilter("to")}
              aria-label="Remove filter"
              className="ml-2"
            >
              <XIcon className="h-4 w-4 text-red-600" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilterHeader;
