import React, { useState, createContext } from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import { cn } from "@/src/lib/utils";
import { LayoutList, Code, LineChart } from "lucide-react";
import { Button } from "@ui/button";
import { AccordionView } from "./AccordionView";
import { JsonView } from "./JsonView";

// Crear contexto para expansión global
export const ExpansionContext = createContext({
  expandAll: false,
  collapseAll: false,
  toggleExpandAll: () => {},
  toggleCollapseAll: () => {},
  resetExpansion: () => {},
});

export type ViewType = "accordion" | "json" | "hierarchy";

interface ViewSelectorProps {
  hierarchy: HierarchyItem[];
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
}

export function ViewSelector({
  hierarchy,
  className,
  onItemClick,
}: ViewSelectorProps) {
  const [currentView, setCurrentView] = useState<ViewType>("accordion");

  // Estados para expansión global
  const [expandAll, setExpandAll] = useState(false);
  const [collapseAll, setCollapseAll] = useState(false);

  // Filtrar sólo folders
  const folders = hierarchy.filter((item) => item.driveType === "folder");

  // Manejadores para expansión
  const toggleExpandAll = () => {
    setExpandAll(true);
    setCollapseAll(false);
    // Reset después de un tiempo para permitir que los componentes respondan
    setTimeout(() => resetExpansion(), 100);
  };

  const toggleCollapseAll = () => {
    setCollapseAll(true);
    setExpandAll(false);
    // Reset después de un tiempo para permitir que los componentes respondan
    setTimeout(() => resetExpansion(), 100);
  };

  const resetExpansion = () => {
    setExpandAll(false);
    setCollapseAll(false);
  };

  // Valor del contexto
  const expansionContextValue = {
    expandAll,
    collapseAll,
    toggleExpandAll,
    toggleCollapseAll,
    resetExpansion,
  };

  const views: { type: ViewType; icon: React.ReactNode; label: string }[] = [
    {
      type: "accordion",
      icon: <LayoutList className="w-4 h-4" />,
      label: "Vista Acordeón",
    },
    { type: "json", icon: <Code className="w-4 h-4" />, label: "Vista JSON" },
  ];

  return (
    <ExpansionContext.Provider value={expansionContextValue}>
      <div className={cn("space-y-4", className)}>
        {/* Selector de vistas y botones de expansión */}
        <div className="border-b border-gray-300">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 mb-2">
              {views.map(({ type, icon, label }) => (
                <Button
                  key={type}
                  variant={currentView === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView(type)}
                  className="flex items-center gap-2"
                >
                  {icon}
                  <span>{label}</span>
                </Button>
              ))}
            </div>

            {/* Botones de expansión */}
            {currentView !== "json" && (
              <div className="flex space-x-2 mb-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-6 px-3 font-medium bg-gray-200 hover:bg-blue-200 transition-colors"
                  onClick={toggleExpandAll}
                >
                  Mostrar todos
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-6 px-3 font-medium bg-gray-200 hover:bg-blue-200 transition-colors"
                  onClick={toggleCollapseAll}
                >
                  Contraer todos
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Vista actual */}
        <div className="view-content mt-4">
          {currentView === "accordion" && (
            <AccordionView hierarchy={folders} onItemClick={onItemClick} />
          )}
          {currentView === "json" && <JsonView hierarchy={hierarchy} />}
        </div>
      </div>
    </ExpansionContext.Provider>
  );
}
