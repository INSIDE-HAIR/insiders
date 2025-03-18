import { ReactNode } from "react";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/utils/hierarchyUtils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SectionContentProps {
  item: HierarchyItem;
  children: ReactNode;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  accordionMode: boolean;
}

/**
 * Componente para mostrar el contenido de una sección.
 * Se utiliza para agrupar contenido relacionado dentro de un tab.
 */
export default function SectionContent({
  item,
  children,
  depth,
  isExpanded,
  onToggleExpand,
  accordionMode,
}: SectionContentProps) {
  // Aplicar indentación según la profundidad
  const paddingLeft = `${depth * 1}rem`;

  // Extraer el nombre para mostrar (eliminar prefijos técnicos)
  const displayName = item.name.replace(/^\d+_section_/, "");

  return (
    <div className="section-content border rounded mb-2 overflow-hidden">
      <div
        className={`section-header flex items-center justify-between bg-purple-50 p-2 ${
          accordionMode ? "cursor-pointer" : ""
        }`}
        style={{ paddingLeft }}
        onClick={accordionMode ? onToggleExpand : undefined}
      >
        <h4 className="text-base font-medium text-purple-900">{displayName}</h4>
        {accordionMode && (
          <button
            className="p-1 rounded hover:bg-purple-100 transition-colors"
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
        <div className="section-body p-3">
          <div className="flex flex-col space-y-2">{children}</div>
        </div>
      )}
    </div>
  );
}
