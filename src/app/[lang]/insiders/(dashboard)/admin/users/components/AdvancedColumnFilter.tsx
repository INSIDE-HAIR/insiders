import React, { useState, useEffect } from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { FilterIcon, Plus, X } from "lucide-react";
import { DatePicker } from "./DatePicker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface AdvancedColumnFilterProps<TData> {
  column: Column<TData, unknown>;
  onApplyFilter: (columnId: string, filterValues: any[]) => void;
  onRemoveFilter: (columnId: string, filterValue: any) => void;
  appliedFilters: any[];
}

export function AdvancedColumnFilter<TData>({
  column,
  onApplyFilter,
  onRemoveFilter,
  appliedFilters,
}: AdvancedColumnFilterProps<TData>) {
  const [filterValues, setFilterValues] = useState<string[]>([""]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filterType = (column.columnDef.meta as any)?.filterType || "text";

  useEffect(() => {
    if (filterType === "text") {
      setFilterValues(appliedFilters.length > 0 ? appliedFilters : [""]);
    } else if (filterType === "date" && appliedFilters.length > 0) {
      setDateRange(appliedFilters[0]);
    }
  }, [appliedFilters, filterType]);

  const handleApplyFilter = () => {
    if (filterType === "date") {
      if (dateRange?.from || dateRange?.to) {
        onApplyFilter(column.id, [dateRange]);
      }
    } else {
      const nonEmptyFilters = filterValues.filter(
        (value) => value.trim() !== ""
      );
      if (nonEmptyFilters.length > 0) {
        onApplyFilter(column.id, nonEmptyFilters);
        setFilterValues([""]);
      }
    }
  };

  const handleRemoveAppliedFilter = (filter: any) => {
    onRemoveFilter(column.id, filter);
  };

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    if (newDateRange?.from || newDateRange?.to) {
      onApplyFilter(column.id, [newDateRange]);
    }
  };

  const formatDateFilter = (filter: DateRange) => {
    if (filter.from && filter.to) {
      return `${format(new Date(filter.from), "dd/MM/yyyy")} - ${format(
        new Date(filter.to),
        "dd/MM/yyyy"
      )}`;
    } else if (filter.from) {
      return `From ${format(new Date(filter.from), "dd/MM/yyyy")}`;
    } else if (filter.to) {
      return `Until ${format(new Date(filter.to), "dd/MM/yyyy")}`;
    }
    return "";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <FilterIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filter {column.id}</h4>
            {filterType === "text" && (
              <>
                {filterValues.map((value, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter filter value"
                      value={value}
                      onChange={(e) => {
                        const newFilterValues = [...filterValues];
                        newFilterValues[index] = e.target.value;
                        setFilterValues(newFilterValues);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleApplyFilter();
                        }
                      }}
                    />
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newFilterValues = filterValues.filter(
                            (_, i) => i !== index
                          );
                          setFilterValues(newFilterValues);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilterValues([...filterValues, ""])}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add filter
                </Button>
              </>
            )}
            {filterType === "date" && (
              <DatePicker
                onDateChange={handleDateChange}
                dateRange={dateRange}
              />
            )}
          </div>
          {filterType === "text" && (
            <Button onClick={handleApplyFilter}>Apply Filters</Button>
          )}
          {appliedFilters.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Applied Filters:</h5>
              {appliedFilters.map((filter, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  className="m-1"
                  onClick={() => handleRemoveAppliedFilter(filter)}
                >
                  {filterType === "date"
                    ? formatDateFilter(filter)
                    : filter.toString()}
                  <X className="h-4 w-4 ml-2" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
