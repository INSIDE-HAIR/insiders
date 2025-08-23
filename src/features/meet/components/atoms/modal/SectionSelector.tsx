/**
 * SECTIONSELECTOR - Selector inteligente de secciones para modal
 * Reemplaza tabs estáticas con navegación dinámica y búsqueda
 * 
 * Características:
 * ✅ Búsqueda inteligente por nombre y contenido
 * ✅ Responsive design (desktop: pills, mobile: dropdown)
 * ✅ Navegación con flechas ⬅️➡️
 * ✅ Keyboard shortcuts (1-5, Alt+←/→)
 * ✅ Escalabilidad infinita
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  searchable?: boolean;
  keywords?: string[]; // Para búsqueda avanzada
}

interface SectionSelectorProps {
  sections: Section[];
  currentSectionId: string;
  onSectionChange: (sectionId: string) => void;
  searchEnabled?: boolean;
  navigationEnabled?: boolean;
  responsive?: boolean;
  className?: string;
  showIndicator?: boolean;
}

export const SectionSelector: React.FC<SectionSelectorProps> = ({
  sections,
  currentSectionId,
  onSectionChange,
  searchEnabled = true,
  navigationEnabled = true,
  responsive = true,
  className,
  showIndicator = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Get current section info
  const currentSection = sections.find(s => s.id === currentSectionId);
  const currentIndex = sections.findIndex(s => s.id === currentSectionId);
  const totalSections = sections.length;

  // Filtered sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    
    const query = searchQuery.toLowerCase();
    return sections.filter(section => {
      // Search by title
      if (section.title.toLowerCase().includes(query)) return true;
      
      // Search by description
      if (section.description?.toLowerCase().includes(query)) return true;
      
      // Search by keywords
      if (section.keywords?.some(keyword => 
        keyword.toLowerCase().includes(query)
      )) return true;
      
      return false;
    });
  }, [sections, searchQuery]);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Arrow keys for navigation
      if (e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToNext();
        }
      }
      
      // Number keys for direct access (1-9)
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const index = parseInt(e.key) - 1;
        if (index < sections.length && sections[index]) {
          e.preventDefault();
          onSectionChange(sections[index].id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sections, currentIndex, onSectionChange]);

  // Responsive detection (simple approach)
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile/Tablet View
  if (responsive && isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Search Bar */}
        {searchEnabled && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          {/* Navigation Buttons */}
          {navigationEnabled && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                disabled={currentIndex === totalSections - 1}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Section Indicator */}
          {showIndicator && (
            <Badge variant="secondary" className="text-xs">
              {currentIndex + 1}/{totalSections}
            </Badge>
          )}
        </div>

        {/* Mobile Select */}
        <Select value={currentSectionId} onValueChange={onSectionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar sección">
              <div className="flex items-center gap-2">
                {currentSection?.icon && (
                  <currentSection.icon className="h-4 w-4" />
                )}
                {currentSection?.title}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {filteredSections.map((section, index) => (
              <SelectItem key={section.id} value={section.id}>
                <div className="flex items-center gap-2">
                  <section.icon className="h-4 w-4" />
                  <span>{section.title}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {index + 1}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Desktop View - Pills Layout
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      {searchEnabled && (
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            {currentSection?.title || 'Sección'}
          </h3>
          {showIndicator && (
            <Badge variant="secondary" className="text-xs">
              {currentIndex + 1} de {totalSections}
            </Badge>
          )}
        </div>

        {/* Navigation Buttons */}
        {navigationEnabled && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              title="Sección anterior (Alt+←)"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Anterior
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex === totalSections - 1}
              title="Siguiente sección (Alt+→)"
            >
              Siguiente
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {filteredSections.map((section, index) => {
          const isActive = section.id === currentSectionId;
          const IconComponent = section.icon;
          
          return (
            <Button
              key={section.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "flex items-center gap-2 relative",
                isActive && "shadow-md"
              )}
              title={`${section.title} (${index + 1})`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{section.title}</span>
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className="text-xs ml-1"
              >
                {index + 1}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Current Section Description */}
      {currentSection?.description && (
        <p className="text-sm text-muted-foreground">
          {currentSection.description}
        </p>
      )}
    </div>
  );
};