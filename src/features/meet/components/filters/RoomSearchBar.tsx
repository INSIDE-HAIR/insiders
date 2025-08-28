"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/src/components/ui/input';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '@/src/hooks/use-debounce';

interface RoomSearchBarProps {
  onSearchChange: (search: string) => void;
  placeholder?: string;
  className?: string;
}

export const RoomSearchBar: React.FC<RoomSearchBarProps> = ({
  onSearchChange,
  placeholder = "Buscar por nombre de sala...",
  className = ''
}) => {
  const [searchValue, setSearchValue] = useState('');
  const debouncedValue = useDebounce(searchValue, 300);

  useEffect(() => {
    onSearchChange(debouncedValue);
  }, [debouncedValue, onSearchChange]);

  const handleClear = useCallback(() => {
    setSearchValue('');
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {searchValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};