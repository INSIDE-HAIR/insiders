/**
 * MODALNAVIGATIONDEMO - Componente para testing de la navegación del modal
 * Demo completo del sistema de navegación SOLID implementado
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { 
  Cog6ToothIcon,
  UsersIcon,
  TagIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

import { SectionSelector } from "./SectionSelector";
import { NavigationButton } from "./NavigationButton";
import { SectionIndicator } from "./SectionIndicator";
import { useModalNavigation } from "../../../hooks/useModalNavigation";

// Secciones de demo
const demoSections = [
  {
    id: "general",
    title: "General",
    icon: InformationCircleIcon,
    description: "Información básica y configuración de la sala",
    keywords: ["información", "nombre", "código", "básico"],
  },
  {
    id: "organization", 
    title: "Organización",
    icon: TagIcon,
    description: "Tags y grupos para organizar la sala",
    keywords: ["tags", "grupos", "organización", "categorías"],
  },
  {
    id: "members",
    title: "Miembros", 
    icon: UsersIcon,
    description: "Gestión de participantes y roles",
    keywords: ["miembros", "participantes", "usuarios", "roles", "cohosts"],
  },
  {
    id: "settings",
    title: "Configuración",
    icon: Cog6ToothIcon,
    description: "Configuraciones avanzadas de la sala",
    keywords: ["configuración", "avanzado", "moderación", "grabación", "restricciones"],
  },
  {
    id: "activity", 
    title: "Actividad",
    icon: ChartBarIcon,
    description: "Analytics y reportes de actividad",
    keywords: ["actividad", "analytics", "reportes", "métricas", "estadísticas"],
  },
];

export const ModalNavigationDemo: React.FC = () => {
  const navigation = useModalNavigation({
    sections: demoSections,
    initialSectionId: "general",
    enableHistory: true,
    persistState: true,
    storageKey: "demo-navigation",
    onSectionChange: (sectionId: string, previousSectionId?: string) => {
      console.log(`🧭 Navegación: ${previousSectionId} → ${sectionId}`);
    },
  });

  const {
    currentSectionId,
    currentSection,
    currentIndex,
    totalSections,
    searchQuery,
    setSearchQuery,
    filteredSections,
    goToSection,
    goToPrevious,
    goToNext,
    canGoPrevious,
    canGoNext,
    navigationHistory,
    goBack,
    clearHistory,
    resetNavigation,
  } = navigation;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧭 Demo: Sistema de Navegación SOLID
            <Badge variant="secondary">Sprint 1 Foundation</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* SectionSelector Principal */}
          <div>
            <h3 className="text-lg font-semibold mb-3">SectionSelector Component</h3>
            <SectionSelector
              sections={demoSections}
              currentSectionId={currentSectionId}
              onSectionChange={goToSection}
              searchEnabled={true}
              navigationEnabled={true}
              responsive={true}
              showIndicator={true}
            />
          </div>

          {/* Indicadores de Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* SectionIndicator Variants */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Indicadores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Badge:</p>
                  <SectionIndicator
                    currentIndex={currentIndex}
                    totalSections={totalSections}
                    variant="badge"
                    showPercentage={true}
                  />
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Progress:</p>
                  <SectionIndicator
                    currentIndex={currentIndex}
                    totalSections={totalSections}
                    variant="progress"
                    showPercentage={true}
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Dots:</p>
                  <SectionIndicator
                    currentIndex={currentIndex}
                    totalSections={totalSections}
                    variant="dots"
                  />
                </div>
              </CardContent>
            </Card>

            {/* NavigationButton Tests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Navegación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <NavigationButton
                    direction="previous"
                    onClick={goToPrevious}
                    disabled={!canGoPrevious}
                    variant="outline"
                    currentIndex={currentIndex}
                    totalItems={totalSections}
                  />
                  <NavigationButton
                    direction="next"
                    onClick={goToNext}
                    disabled={!canGoNext}
                    variant="outline"
                    currentIndex={currentIndex}
                    totalItems={totalSections}
                  />
                </div>

                <div className="flex gap-2">
                  <NavigationButton
                    direction="previous"
                    onClick={goToPrevious}
                    disabled={!canGoPrevious}
                    iconOnly={true}
                    variant="ghost"
                  />
                  <NavigationButton
                    direction="next" 
                    onClick={goToNext}
                    disabled={!canGoNext}
                    iconOnly={true}
                    variant="ghost"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Estado y Debug */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Estado Actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1">
                  <p><strong>Sección:</strong> {currentSection?.title}</p>
                  <p><strong>Índice:</strong> {currentIndex + 1}/{totalSections}</p>
                  <p><strong>ID:</strong> {currentSectionId}</p>
                  <p><strong>Búsqueda:</strong> "{searchQuery || "sin filtro"}"</p>
                  <p><strong>Filtradas:</strong> {filteredSections.length}</p>
                  <p><strong>Historial:</strong> {navigationHistory.length} entradas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido de la Sección Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentSection?.icon && (
                  <currentSection.icon className="h-5 w-5" />
                )}
                {currentSection?.title}
                <Badge variant="outline" className="text-xs">
                  {currentIndex + 1}/{totalSections}
                </Badge>
              </CardTitle>
              {currentSection?.description && (
                <p className="text-sm text-muted-foreground">
                  {currentSection.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-muted-foreground">
                  💡 Aquí iría el contenido de la sección "{currentSection?.title}"
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  🎹 Prueba: Alt+←/→ para navegar, números 1-5 para acceso directo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Controles de Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Controles de Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => goToSection("general")}
                >
                  Ir a General
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => goToSection("members")}
                >
                  Ir a Miembros
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => goToSection("activity")}
                >
                  Ir a Actividad
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={goBack}
                  disabled={navigationHistory.length === 0}
                >
                  ← Atrás ({navigationHistory.length})
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={clearHistory}
                >
                  Limpiar Historial
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={resetNavigation}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
};