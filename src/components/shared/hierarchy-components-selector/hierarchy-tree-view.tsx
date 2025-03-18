import React from "react";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/utils/hierarchyUtils";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  FileText,
} from "lucide-react";

interface HierarchyTreeViewProps {
  /**
   * Elemento de jerarquía a visualizar
   */
  item: HierarchyItem;

  /**
   * Nivel de profundidad para indentación
   */
  depth?: number;

  /**
   * IDs de elementos expandidos
   */
  expandedItems: Set<string>;

  /**
   * Función para alternar expansión de un item
   */
  onToggleExpand: (itemId: string) => void;

  /**
   * Función para seleccionar un elemento
   */
  onSelectItem?: (item: HierarchyItem) => void;

  /**
   * ID del elemento seleccionado actualmente
   */
  selectedItemId?: string;
}

/**
 * Componente que visualiza la estructura jerárquica como un árbol
 * Muestra la recursividad de la implementación de manera explícita
 */
export default function HierarchyTreeView({
  item,
  depth = 0,
  expandedItems,
  onToggleExpand,
  onSelectItem,
  selectedItemId,
}: HierarchyTreeViewProps) {
  // Determinar si este elemento está expandido
  const isExpanded = expandedItems.has(item.id);

  // Indentación basada en la profundidad
  const indentStyle = { paddingLeft: `${depth * 20}px` };

  // Determinar si este elemento está seleccionado
  const isSelected = selectedItemId === item.id;

  // Función para manejar la selección de un elemento
  const handleSelect = () => {
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  // Función para manejar la expansión/colapso
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(item.id);
  };

  // Determinar el tipo específico de elemento basado en su nombre
  const isTabsContainer =
    item.name.includes("_tabs") && !item.name.includes("_tab_");
  const isTabItem = item.name.includes("_tab_");
  const isSectionItem = item.name.includes("_section_");

  // Elegir color de fondo según el tipo de elemento
  let bgColor = "";
  let icon =
    item.driveType === "folder" ? <Folder size={16} /> : <File size={16} />;

  if (isTabsContainer) {
    bgColor = "bg-blue-50";
    icon = <Folder className="text-blue-600" size={16} />;
  } else if (isTabItem) {
    bgColor = "bg-indigo-50";
    icon = <Folder className="text-indigo-600" size={16} />;
  } else if (isSectionItem) {
    bgColor = "bg-purple-50";
    icon = <Folder className="text-purple-600" size={16} />;
  } else if (item.driveType === "file") {
    bgColor = "bg-gray-50";
    icon = <FileText className="text-gray-600" size={16} />;
  }

  return (
    <div className="hierarchy-tree-node">
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer rounded ${
          isSelected ? "bg-gray-200" : bgColor
        }`}
        style={indentStyle}
        onClick={handleSelect}
      >
        {item.driveType === "folder" &&
        item.childrens &&
        item.childrens.length > 0 ? (
          <span className="mr-1 cursor-pointer" onClick={handleToggle}>
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </span>
        ) : (
          <span className="mr-1 w-4"></span>
        )}

        <span className="mr-1">{icon}</span>

        <span className="text-sm">
          {item.name}
          {item.childrens && item.childrens.length > 0 && (
            <span className="text-xs text-gray-500 ml-2">
              ({item.childrens.length})
            </span>
          )}
        </span>
      </div>

      {/* Renderizar hijos recursivamente si está expandido */}
      {isExpanded && item.childrens && item.childrens.length > 0 && (
        <div className="hierarchy-tree-children">
          {item.childrens.map((child) => (
            <HierarchyTreeView
              key={child.id}
              item={child}
              depth={depth + 1}
              expandedItems={expandedItems}
              onToggleExpand={onToggleExpand}
              onSelectItem={onSelectItem}
              selectedItemId={selectedItemId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
