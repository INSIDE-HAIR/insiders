import { ReactNode } from "react";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/utils/hierarchyUtils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TabsContainerProps {
  item: HierarchyItem;
  children: ReactNode;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  accordionMode: boolean;
}

/**
 * Contenedor para múltiples tabs con soporte para modo acordeón.
 * Siempre contiene elementos de tipo tab (singular).
 */
export default function TabsContainer({
  item,
  children,
  depth,
  isExpanded,
  onToggleExpand,
  accordionMode,
}: TabsContainerProps) {
  // Aplicar indentación según la profundidad
  const paddingLeft = `${depth * 1}rem`;

  // Extraer el nombre para mostrar (eliminar prefijos técnicos)
  const displayName = item.name.replace(/^\d+_tabs/, "Tabs");

  return (
    <div className="tabs-container border rounded-lg mb-4 overflow-hidden">
      <div
        className={`tabs-header flex items-center justify-between bg-blue-50 p-3 ${
          accordionMode ? "cursor-pointer" : ""
        }`}
        style={{ paddingLeft }}
        onClick={accordionMode ? onToggleExpand : undefined}
      >
        <h3 className="text-lg font-medium text-blue-900">{displayName}</h3>
        {accordionMode && (
          <button
            className="p-1 rounded hover:bg-blue-100 transition-colors"
            aria-label={isExpanded ? "Colapsar" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        )}
      </div>

      {/* En modo acordeón, mostrar contenido solo si está expandido */}
      {(!accordionMode || isExpanded) && (
        <div className="tabs-content p-3">
          <div className="flex flex-col space-y-2">{children}</div>
        </div>
      )}
    </div>
  );
}
