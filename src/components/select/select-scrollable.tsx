import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export function SelectScrollable({
  allOptions,
}: {
  allOptions: Record<string, string[]>;
}) {
  return (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Seleccione un servicio" />
      </SelectTrigger>
      <SelectContent>
        {allOptions &&
          Object.entries(allOptions).map(([category, options]) => (
            <SelectGroup key={category}>
              <SelectLabel>{category}</SelectLabel>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
      </SelectContent>
    </Select>
  );
}
