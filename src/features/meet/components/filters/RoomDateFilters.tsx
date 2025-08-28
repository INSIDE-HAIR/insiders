"use client";

import React from 'react';
import { DateFilter, DateFilterLabels } from '../../types/room-dates.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface RoomDateFiltersProps {
  onFilterChange: (filter: DateFilter) => void;
  currentFilter: DateFilter;
  className?: string;
}

export const RoomDateFilters: React.FC<RoomDateFiltersProps> = ({
  onFilterChange,
  currentFilter,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CalendarIcon className="h-5 w-5 text-gray-500" />
      <Select
        value={currentFilter}
        onValueChange={(value) => onFilterChange(value as DateFilter)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por fecha" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DateFilterLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};