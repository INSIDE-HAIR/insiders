import React from "react";

interface FilterBadgesProps {
  filters: {
    id: string;
    value: string | string[] | { from?: number; to?: number };
  }[];
  onRemove: (
    id: string,
    value?: string | { from?: number; to?: number }
  ) => void;
}

const FilterBadges: React.FC<FilterBadgesProps> = ({ filters, onRemove }) => {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const value = filter.value;
        if (typeof value === "string" || Array.isArray(value)) {
          return (
            <div key={filter.id} className="badge">
              {filter.id}: {Array.isArray(value) ? value.join(", ") : value}
              <button onClick={() => onRemove(filter.id)}>X</button>
            </div>
          );
        } else if (value && typeof value === "object") {
          return (
            <>
              {value.from && (
                <div key={`${filter.id}-from`} className="badge">
                  {filter.id} Desde: {formatDate(value.from)}
                  <button
                    onClick={() => onRemove(filter.id, { from: value.from })}
                  >
                    X
                  </button>
                </div>
              )}
              {value.to && (
                <div key={`${filter.id}-to`} className="badge">
                  {filter.id} Hasta: {formatDate(value.to)}
                  <button onClick={() => onRemove(filter.id, { to: value.to })}>
                    X
                  </button>
                </div>
              )}
            </>
          );
        }
        return null;
      })}
    </div>
  );
};

export default FilterBadges;
