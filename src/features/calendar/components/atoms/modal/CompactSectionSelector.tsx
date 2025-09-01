/**
 * COMPACTSECTIONSELECTOR - Selector compacto para navegación de secciones de calendario
 * Diseño limpio: [⬅️] [Combobox con búsqueda] [➡️]
 *
 * Características:
 * ✅ Flechas sin texto (icon-only)
 * ✅ Combobox central con búsqueda integrada
 * ✅ Layout compacto y limpio
 * ✅ Keyboard shortcuts mantenidos
 * ✅ Responsive design
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import { Combobox, ComboboxOption } from "@/src/components/ui/combobox";
import { cn } from "@/src/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  searchable?: boolean;
  keywords?: string[]; // Para búsqueda avanzada
}

interface CompactSectionSelectorProps {
  sections: Section[];
  currentSectionId: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
  disabled?: boolean;
  /** Placeholder personalizado para el combobox */
  placeholder?: string;
  /** Placeholder para la búsqueda */
  searchPlaceholder?: string;
}

export const CompactSectionSelector: React.FC<CompactSectionSelectorProps> = ({
  sections,
  currentSectionId,
  onSectionChange,
  className,
  disabled = false,
  placeholder = "Seleccionar sección...",
  searchPlaceholder = "Buscar sección...",
}) => {
  // Get current section info
  const currentIndex = sections.findIndex((s) => s.id === currentSectionId);
  const totalSections = sections.length;

  // Convert sections to ComboboxOptions with number prefix
  const comboboxOptions: ComboboxOption[] = useMemo(() => {
    return sections.map((section, index) => ({
      value: section.id,
      label: `${index + 1}. ${section.title}`, // Número al inicio
    }));
  }, [sections]);

  // Navigation functions
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const previousSection = sections[currentIndex - 1];
      if (previousSection) {
        onSectionChange(previousSection.id);
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < totalSections - 1) {
      const nextSection = sections[currentIndex + 1];
      if (nextSection) {
        onSectionChange(nextSection.id);
      }
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo si no estamos en un input
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.getAttribute("contenteditable") === "true";

      if (isInputFocused) return;

      // Alt + Arrow keys para navegación
      if (e.altKey) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goToPrevious();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          goToNext();
        }
      }

      // Number keys para acceso directo (1-9)
      if (
        e.key >= "1" &&
        e.key <= "9" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        const index = parseInt(e.key) - 1;
        if (index < sections.length && sections[index]) {
          e.preventDefault();
          onSectionChange(sections[index].id);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sections, currentIndex, onSectionChange, disabled]);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalSections - 1;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Previous Button - Solo icono */}
      <Button
        variant='ghost'
        size='sm'
        onClick={goToPrevious}
        disabled={disabled || !canGoPrevious}
        className='h-9 w-9 p-0 text-primary hover:bg-primary hover:text-background'
        title={`Sección anterior (Alt+←) - ${canGoPrevious ? `Ir a ${sections[currentIndex - 1]?.title}` : "No disponible"}`}
      >
        <ChevronLeftIcon className='h-4 w-4' />
      </Button>

      {/* Central Combobox con búsqueda */}
      <div className='flex-1 min-w-0'>
        <Combobox
          options={comboboxOptions}
          value={currentSectionId}
          onChange={onSectionChange}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          emptyMessage='No se encontraron secciones'
          disabled={disabled}
          buttonClass={cn(
            "w-full justify-between min-w-0",
            // Override del combobox para tema claro
            "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground",
            // Focus states
            "focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          popoverClass='bg-popover text-popover-foreground border-border w-[20rem] md:w-xs'
        />
      </div>

      {/* Next Button - Solo icono */}
      <Button
        variant='ghost'
        size='sm'
        onClick={goToNext}
        disabled={disabled || !canGoNext}
        className='h-9 w-9 p-0 text-primary hover:bg-primary hover:text-background'
        title={`Siguiente sección (Alt+→) - ${canGoNext ? `Ir a ${sections[currentIndex + 1]?.title}` : "No disponible"}`}
      >
        <ChevronRightIcon className='h-4 w-4' />
      </Button>
    </div>
  );
};