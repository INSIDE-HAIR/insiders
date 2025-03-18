import { ReactNode } from "react";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/utils/hierarchyUtils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TabContentProps {
  item: HierarchyItem;
  children: ReactNode;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  accordionMode: boolean;
}

/**
 * Componente para mostrar el contenido de un tab individual.
 * Siempre debe estar contenido dentro de un TabsContainer.
 */
export default function TabContent({
  item,
  children,
  depth,
  isExpanded,
  onToggleExpand,
  accordionMode,
}: TabContentProps) {
  // Aplicar indentación según la profundidad
  const paddingLeft = `${depth * 1}rem`;

  // Extraer el nombre para mostrar (eliminar prefijos técnicos)
  const displayName = item.name.replace(/^\d+_tab_/, "");

  return (
    <div className="tab-content border rounded mb-2 overflow-hidden">
      <div
        className={`tab-header flex items-center justify-between bg-indigo-50 p-2 ${
          accordionMode ? "cursor-pointer" : ""
        }`}
        style={{ paddingLeft }}
        onClick={accordionMode ? onToggleExpand : undefined}
      >
        <h4 className="text-base font-medium text-indigo-900">{displayName}</h4>
        {accordionMode && (
          <button
            className="p-1 rounded hover:bg-indigo-100 transition-colors"
            aria-label={isExpanded ? "Colapsar" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}
      </div>

      {/* En modo acordeón, mostrar contenido solo si está expandido */}
      {(!accordionMode || isExpanded) && (
        <div className="tab-body p-3">
          <div className="flex flex-col space-y-2">{children}</div>
        </div>
      )}
    </div>
  );
}
