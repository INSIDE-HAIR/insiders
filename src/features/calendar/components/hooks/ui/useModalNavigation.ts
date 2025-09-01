/**
 * USEMODALNAVIGATION - Hook para control de navegación entre secciones de calendario
 * Adaptado del módulo de Meet para Calendar
 * 
 * Características:
 * ✅ Estado centralizado de navegación
 * ✅ Búsqueda inteligente con filtrado
 * ✅ Keyboard shortcuts (Alt+←/→, números 1-9)
 * ✅ Historial de navegación 
 * ✅ Validación y callback hooks
 * ✅ Persistencia de estado
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import { useState, useCallback, useMemo, useEffect } from "react";

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  searchable?: boolean;
  keywords?: string[];
  validation?: () => boolean | Promise<boolean>;
}

interface NavigationHistory {
  sectionId: string;
  timestamp: Date;
}

interface UseModalNavigationProps {
  /** Lista de secciones disponibles */
  sections: Section[];
  /** Sección inicial por defecto */
  initialSectionId?: string;
  /** Callback cuando cambia la sección */
  onSectionChange?: (sectionId: string, previousSectionId?: string) => void;
  /** Callback antes de cambiar sección (para validación) */
  onBeforeSectionChange?: (fromSectionId: string, toSectionId: string) => boolean | Promise<boolean>;
  /** Habilitar historial de navegación */
  enableHistory?: boolean;
  /** Persistir estado en localStorage */
  persistState?: boolean;
  /** Clave para localStorage */
  storageKey?: string;
}

interface UseModalNavigationReturn {
  // Estado actual
  currentSectionId: string;
  currentSection: Section | undefined;
  currentIndex: number;
  totalSections: number;
  
  // Búsqueda
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredSections: Section[];
  isSearching: boolean;
  
  // Navegación
  goToSection: (sectionId: string) => Promise<boolean>;
  goToPrevious: () => Promise<boolean>;
  goToNext: () => Promise<boolean>;
  goToIndex: (index: number) => Promise<boolean>;
  
  // Estado de navegación
  canGoPrevious: boolean;
  canGoNext: boolean;
  isFirstSection: boolean;
  isLastSection: boolean;
  
  // Historial
  navigationHistory: NavigationHistory[];
  goBack: () => Promise<boolean>;
  clearHistory: () => void;
  
  // Utilidades
  getSectionById: (id: string) => Section | undefined;
  getSectionIndex: (id: string) => number;
  resetNavigation: () => void;
}

export const useModalNavigation = ({
  sections,
  initialSectionId,
  onSectionChange,
  onBeforeSectionChange,
  enableHistory = true,
  persistState = false,
  storageKey = 'calendar-modal-navigation-state',
}: UseModalNavigationProps): UseModalNavigationReturn => {
  // Estado principal
  const [currentSectionId, setCurrentSectionId] = useState<string>(() => {
    if (persistState && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.currentSectionId || initialSectionId || sections[0]?.id || '';
        } catch {
          // Ignore parsing errors
        }
      }
    }
    return initialSectionId || sections[0]?.id || '';
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);

  // Sección y posición actual
  const currentSection = useMemo(
    () => sections.find(s => s.id === currentSectionId),
    [sections, currentSectionId]
  );

  const currentIndex = useMemo(
    () => sections.findIndex(s => s.id === currentSectionId),
    [sections, currentSectionId]
  );

  // Secciones filtradas por búsqueda
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    
    const query = searchQuery.toLowerCase();
    return sections.filter(section => {
      // Título
      if (section.title.toLowerCase().includes(query)) return true;
      
      // Descripción
      if (section.description?.toLowerCase().includes(query)) return true;
      
      // Keywords
      if (section.keywords?.some(keyword => 
        keyword.toLowerCase().includes(query)
      )) return true;
      
      return false;
    });
  }, [sections, searchQuery]);

  // Estados derivados
  const totalSections = sections.length;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalSections - 1;
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === totalSections - 1;
  const isSearching = searchQuery.trim().length > 0;

  // Persistir estado
  useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      const stateToSave = {
        currentSectionId,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [currentSectionId, persistState, storageKey]);

  // Función principal de cambio de sección
  const goToSection = useCallback(async (sectionId: string): Promise<boolean> => {
    // Validar que la sección existe
    const targetSection = sections.find(s => s.id === sectionId);
    if (!targetSection) {
      console.warn(`Section with id "${sectionId}" not found`);
      return false;
    }

    // Si es la misma sección, no hacer nada
    if (sectionId === currentSectionId) return true;

    // Callback de validación antes del cambio
    if (onBeforeSectionChange) {
      try {
        const canChange = await onBeforeSectionChange(currentSectionId, sectionId);
        if (!canChange) return false;
      } catch (error) {
        console.error('Error in onBeforeSectionChange:', error);
        return false;
      }
    }

    // Validación específica de la sección actual
    if (currentSection?.validation) {
      try {
        const isValid = await currentSection.validation();
        if (!isValid) return false;
      } catch (error) {
        console.error('Error in section validation:', error);
        return false;
      }
    }

    const previousSectionId = currentSectionId;
    
    // Actualizar historial
    if (enableHistory) {
      setNavigationHistory(prev => [
        ...prev,
        { sectionId: currentSectionId, timestamp: new Date() }
      ]);
    }

    // Cambiar sección
    setCurrentSectionId(sectionId);

    // Callback de cambio
    if (onSectionChange) {
      onSectionChange(sectionId, previousSectionId);
    }

    return true;
  }, [
    sections,
    currentSectionId,
    currentSection,
    onBeforeSectionChange,
    onSectionChange,
    enableHistory,
  ]);

  // Navegación direccional
  const goToPrevious = useCallback(async (): Promise<boolean> => {
    if (!canGoPrevious) return false;
    const previousSectionId = sections[currentIndex - 1]?.id;
    return previousSectionId ? goToSection(previousSectionId) : false;
  }, [canGoPrevious, sections, currentIndex, goToSection]);

  const goToNext = useCallback(async (): Promise<boolean> => {
    if (!canGoNext) return false;
    const nextSectionId = sections[currentIndex + 1]?.id;
    return nextSectionId ? goToSection(nextSectionId) : false;
  }, [canGoNext, sections, currentIndex, goToSection]);

  const goToIndex = useCallback(async (index: number): Promise<boolean> => {
    if (index < 0 || index >= totalSections) return false;
    const targetSectionId = sections[index]?.id;
    return targetSectionId ? goToSection(targetSectionId) : false;
  }, [totalSections, sections, goToSection]);

  // Navegación hacia atrás en el historial
  const goBack = useCallback(async (): Promise<boolean> => {
    if (navigationHistory.length === 0) return false;
    
    const lastEntry = navigationHistory[navigationHistory.length - 1];
    if (!lastEntry) return false;

    // Remover la entrada del historial
    setNavigationHistory(prev => prev.slice(0, -1));

    return goToSection(lastEntry.sectionId);
  }, [navigationHistory, goToSection]);

  // Utilidades
  const getSectionById = useCallback((id: string) => 
    sections.find(s => s.id === id), [sections]
  );

  const getSectionIndex = useCallback((id: string) => 
    sections.findIndex(s => s.id === id), [sections]
  );

  const clearHistory = useCallback(() => {
    setNavigationHistory([]);
  }, []);

  const resetNavigation = useCallback(() => {
    const firstSectionId = initialSectionId || sections[0]?.id;
    if (firstSectionId) {
      setCurrentSectionId(firstSectionId);
      setSearchQuery("");
      clearHistory();
    }
  }, [initialSectionId, sections, clearHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo si no estamos en un input
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' 
        || activeElement?.tagName === 'TEXTAREA'
        || activeElement?.getAttribute('contenteditable') === 'true';

      if (isInputFocused) return;

      // Alt + Arrow keys para navegación
      if (e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToNext();
        }
      }
      
      // Number keys para acceso directo (1-9)
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const index = parseInt(e.key) - 1;
        if (index < sections.length) {
          e.preventDefault();
          goToIndex(index);
        }
      }

      // Escape para limpiar búsqueda
      if (e.key === 'Escape' && searchQuery) {
        e.preventDefault();
        setSearchQuery("");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sections, searchQuery, goToPrevious, goToNext, goToIndex]);

  return {
    // Estado actual
    currentSectionId,
    currentSection,
    currentIndex,
    totalSections,
    
    // Búsqueda
    searchQuery,
    setSearchQuery,
    filteredSections,
    isSearching,
    
    // Navegación
    goToSection,
    goToPrevious,
    goToNext,
    goToIndex,
    
    // Estado de navegación
    canGoPrevious,
    canGoNext,
    isFirstSection,
    isLastSection,
    
    // Historial
    navigationHistory,
    goBack,
    clearHistory,
    
    // Utilidades
    getSectionById,
    getSectionIndex,
    resetNavigation,
  };
};