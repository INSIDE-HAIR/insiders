import React from "react";
import { Button } from "@/src/components/ui/button";
import { X } from "lucide-react";
import { format } from "date-fns";

interface Column {
  id: string;
  header: string;
}

interface FilterCollectorProps {
  appliedFilters: { [key: string]: any[] };
  onRemoveFilter: (columnId: string, filterValue: any) => void;
  columns: Column[];
}

export const FilterCollector: React.FC<FilterCollectorProps> = ({
  appliedFilters,
  onRemoveFilter,
  columns,
}) => {
  const formatFilterValue = (value: any): string => {
    if (value instanceof Object && ("from" in value || "to" in value)) {
      const { from, to } = value;
      if (from && to) {
        return `${format(new Date(from), "dd/MM/yyyy")} - ${format(
          new Date(to),
          "dd/MM/yyyy"
        )}`;
      } else if (from) {
        return `Desde ${format(new Date(from), "dd/MM/yyyy")}`;
      } else if (to) {
        return `Hasta ${format(new Date(to), "dd/MM/yyyy")}`;
      }
    }
    return value === "" ? "(Vacío)" : value.toString();
  };

  const getColumnHeader = (columnId: string): string => {
    const column = columns.find((col) => col.id === columnId);
    return column ? column.header : columnId;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(appliedFilters).map(([columnId, filterValues]) => (
        <React.Fragment key={columnId}>
          {filterValues.map((filterValue, index) => (
            <Button
              key={`${columnId}-${index}`}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => onRemoveFilter(columnId, filterValue)}
            >
              {getColumnHeader(columnId)}: {formatFilterValue(filterValue)}
              <X className="h-4 w-4" />
            </Button>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};
