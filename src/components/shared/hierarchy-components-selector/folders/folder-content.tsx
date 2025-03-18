import { ReactNode } from "react";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/utils/hierarchyUtils";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";

interface FolderContentProps {
  item: HierarchyItem;
  children: ReactNode;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNavigate: () => void;
  accordionMode: boolean;
}

/**
 * Componente para mostrar carpetas en la jerarquía.
 * Puede ser expandible/colapsable y permitir navegación.
 */
export default function FolderContent({
  item,
  children,
  depth,
  isExpanded,
  onToggleExpand,
  onNavigate,
  accordionMode,
}: FolderContentProps) {
  // Aplicar indentación según la profundidad
  const paddingLeft = `${depth * 1}rem`;

  // Extraer el nombre para mostrar (eliminar prefijos técnicos)
  const displayName = item.name.replace(/^\d+_/, "");

  // Determinar el tipo de carpeta basado en prefijos comunes
  const isSidebar = item.name.includes("sidebar");

  return (
    <div className="folder-content mb-2">
      <div
        className={`folder-header flex items-center justify-between p-2 ${
          isSidebar ? "bg-gray-100" : "bg-gray-50"
        } rounded hover:bg-gray-200 cursor-pointer`}
        style={{ paddingLeft }}
        onClick={
          item.childrens && item.childrens.length > 0
            ? onToggleExpand
            : onNavigate
        }
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <FolderOpen size={20} className="text-amber-500" />
          ) : (
            <Folder size={20} className="text-amber-500" />
          )}
          <span className={`${isSidebar ? "font-medium" : ""}`}>
            {displayName}
          </span>
          {item.childrens && item.childrens.length > 0 && (
            <span className="text-xs text-gray-500 ml-2">
              ({item.childrens.length})
            </span>
          )}
        </div>

        {item.childrens && item.childrens.length > 0 && (
          <button
            className="p-1 rounded hover:bg-gray-300 transition-colors"
            aria-label={isExpanded ? "Colapsar" : "Expandir"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}
      </div>

      {/* Mostrar contenido solo si está expandido */}
      {isExpanded && (
        <div className="folder-children pl-4 mt-1">{children}</div>
      )}
    </div>
  );
}
