"use client";

import React, { useState } from "react";
import { SelectorOption, cleanFolderName } from "../utils/folderUtils";

interface SelectorProps {
  label: string;
  options: SelectorOption[];
  value: string | null;
  onChange: (option: SelectorOption) => void;
  disabled?: boolean;
  loading?: boolean;
}

// Componente de selección de carpetas
const Selector: React.FC<SelectorProps> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: SelectorOption) => {
    onChange(option);
    setIsOpen(false);
  };

  // Encuentra el nombre correspondiente al ID seleccionado
  const selectedOption = value ? options.find((opt) => opt.id === value) : null;
  // Aplicar limpieza al nombre que se muestra en el selector
  const displayName = selectedOption
    ? cleanFolderName(selectedOption.name)
    : label;

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`bg-black text-white px-4 py-2 rounded flex items-center justify-between w-[200px] ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span>{loading ? "Cargando..." : displayName}</span>
        {loading ? (
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 shadow-lg z-10 rounded max-h-60 overflow-y-auto">
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.id}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  option.id === value ? "bg-lime-100" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {option.id === value && (
                  <span className="inline-block mr-2 text-lime-500">✓</span>
                )}
                {cleanFolderName(option.name)}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">
              No hay opciones disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Selector;
