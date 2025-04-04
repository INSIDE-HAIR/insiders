import React, { useState, createContext, useContext } from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import { AccordionView } from "./views/AccordionView";
import { JsonView } from "./views/JsonView";
import { cn } from "@/src/lib/utils";
import { Button } from "@ui/button";

// Crear contexto para expansión global
export const ExpansionContext = createContext({
  expandAll: false,
  collapseAll: false,
  toggleExpandAll: () => {},
  toggleCollapseAll: () => {},
  resetExpansion: () => {},
});

interface TabsViewProps {
  hierarchy: HierarchyItem[];
  className?: string;
  onItemClick?: (item: HierarchyItem) => void;
}

export function TabsView({ hierarchy, className, onItemClick }: TabsViewProps) {
  const [activeTab, setActiveTab] = useState<"folders" | "json">("folders");
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

  return (
    <ExpansionContext.Provider value={expansionContextValue}>
      <div className={cn("tab-container space-y-2", className)}>
        {/* Tabs */}
        <div className="border-b border-gray-300">
          <div className="flex justify-between items-center">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("folders")}
                className={cn(
                  "tab-button whitespace-nowrap py-2 px-3 border-b-2 font-medium text-xs transition-colors relative",
                  activeTab === "folders"
                    ? "border-blue-600 text-blue-700 bg-blue-100 hover:bg-blue-200"
                    : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                )}
                aria-selected={activeTab === "folders"}
                role="tab"
              >
                Folders
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={cn(
                  "tab-button whitespace-nowrap py-2 px-3 border-b-2 font-medium text-xs transition-colors relative",
                  activeTab === "json"
                    ? "border-blue-600 text-blue-700 bg-blue-100 hover:bg-blue-200"
                    : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                )}
                aria-selected={activeTab === "json"}
                role="tab"
              >
                JSON View
              </button>
            </nav>

            {/* Botones de expansión */}
            {activeTab !== "json" && (
              <div className="flex space-x-2 mb-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-5 px-3 font-medium bg-gray-200 hover:bg-blue-200 transition-colors"
                  onClick={toggleExpandAll}
                >
                  Mostrar todos
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-5 px-3 font-medium bg-gray-200 hover:bg-blue-200 transition-colors"
                  onClick={toggleCollapseAll}
                >
                  Contraer todos
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-2 tab-content">
          {activeTab === "folders" && (
            <div className="folder-tab-content">
              <AccordionView hierarchy={folders} onItemClick={onItemClick} />
            </div>
          )}
          {activeTab === "json" && (
            <div className="json-tab-content">
              <JsonView hierarchy={hierarchy} />
            </div>
          )}
        </div>
      </div>
    </ExpansionContext.Provider>
  );
}
