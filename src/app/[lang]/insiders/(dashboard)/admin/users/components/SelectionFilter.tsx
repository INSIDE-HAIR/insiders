import React, { useEffect, useState } from "react";
import { Checkbox } from "@/src/components/ui/checkbox";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Button } from "@/src/components/ui/button";
import { X } from "lucide-react";

interface SelectionFilterProps {
  options: string[];
  selectedOptions: string[];
  onChange: (selectedValues: string[]) => void;
  onApplyFilter: (selectedValues: string[]) => void;
}

export function SelectionFilter({
  options,
  selectedOptions,
  onChange,
  onApplyFilter,
}: SelectionFilterProps) {
  const [internalOptions, setInternalOptions] = useState<string[]>([]);

  useEffect(() => {
    if (internalOptions.length === 0) {
      setInternalOptions(options);
    }
  }, [options, internalOptions]);

  const handleOptionChange = (option: string) => {
    const updatedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onChange(updatedOptions);
    onApplyFilter(updatedOptions);
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={selectedOptions.includes("(Empty)")}
              onCheckedChange={() => handleOptionChange("(Empty)")}
            />
            <span>(Empty)</span>
          </label>
          {internalOptions.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedOptions.includes(option)}
                onCheckedChange={() => handleOptionChange(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </ScrollArea>
      {selectedOptions.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium">Applied Filters:</h5>
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <Button
                key={option}
                variant="secondary"
                size="sm"
                onClick={() => handleOptionChange(option)}
              >
                {option}
                <X className="ml-2 h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
