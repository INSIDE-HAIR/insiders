"use client";

import React, { useState, useEffect } from "react";
import { X, Check, ChevronsUpDown, Search } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/src/lib/utils";

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  data?: any;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxDisplayItems?: number;
  className?: string;
  badgeClassName?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Seleccionar items...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  maxDisplayItems = 3,
  className,
  badgeClassName,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) => {
    const matchesSearch = option.label
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const displayLimit = Math.min(maxDisplayItems, selected.length);
  const overflow = selected.length - displayLimit;

  const selectedItems = selected
    .slice(0, displayLimit)
    .map((value) => options.find((option) => option.value === value))
    .filter(Boolean) as Option[];

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "relative w-full justify-between hover:bg-background/80 focus:ring-0",
              selected.length > 0 ? "h-auto min-h-10 py-2" : "h-10"
            )}
          >
            <div className="flex flex-wrap gap-1 mr-8">
              {selectedItems.length > 0 ? (
                <>
                  {selectedItems.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className={cn("mr-1 mb-1 h-fit", badgeClassName)}
                    >
                      {option.label}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(option.value);
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                  {overflow > 0 && (
                    <Badge variant="secondary" className="ml-1 mb-1">
                      +{overflow} más
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 absolute right-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[200px] p-0" align="start">
          <Command className="max-h-[300px] overflow-auto">
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9"
              startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
            <CommandList>
              {filteredOptions.length === 0 && (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              )}
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        "flex items-center gap-2",
                        option.disabled && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
