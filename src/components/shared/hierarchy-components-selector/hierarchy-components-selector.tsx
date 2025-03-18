import { useState, useEffect } from "react";
import useIsAuth from "@/src/hooks/useIsAuth";
import useIsAvailable from "@/src/hooks/useIsAvailable";

// Importar componentes de UI
import TabsContainer from "./tabs/tabs-container";
import TabContent from "./tabs/tab-content";
import SectionContent from "./sections/section-content";
import FileContent from "./files/file-content";
import FolderContent from "./folders/folder-content";
import LoadingIndicator from "../ui/loading-indicator";
import ErrorDisplay from "../ui/error-display";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/types/drive";

export interface HierarchyComponentsProps {
  /**
   * El elemento de jerarquía a renderizar (puede ser carpeta, tab, archivo, etc.)
   */
  item: HierarchyItem;

  /**
   * Datos adicionales para tarjetas de marketing
   */
  marketingCards?: any;

  /**
   * Profundidad de anidamiento para ajuste visual
   */
  depth?: number;

  /**
   * Función para manejar la navegación a otro elemento
   */
  onNavigate?: (itemId: string) => void;

  /**
   * Indica si la vista está en modo acordeón (colapsable)
   */
  accordionMode?: boolean;
}

/**
 * Componente selector que renderiza diferentes elementos de UI según el tipo y estructura
 * del elemento de jerarquía proporcionado.
 *
 * Maneja la estructura jerárquica donde los tabs (singular) siempre están dentro de un
 * contenedor tabs (plural) y aplica las reglas de visualización correspondientes.
 */
export default function HierarchyComponentsSelector({
  item,
  marketingCards,
  depth = 0,
  onNavigate,
  accordionMode = false,
}: HierarchyComponentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determinar el tipo específico basado en el nombre y la estructura
  const isTabsContainer =
    item.name.includes("_tabs") && !item.name.includes("_tab_");
  const isTabItem = item.name.includes("_tab_");
  const isSectionItem = item.name.includes("_section_");
  const isFolder =
    item.driveType === "folder" &&
    !isTabsContainer &&
    !isTabItem &&
    !isSectionItem;
  const isFile = item.driveType === "file";

  // Determinar si el elemento debería estar disponible (podría venir de propiedades adicionales)
  // Ejemplo simplificado - en una implementación real, los items pueden tener metadatos de disponibilidad
  const isAvailable = true; // Usar useIsAvailable con metadatos apropiados si están disponibles
  const isAuth = true; // Usar useIsAuth con metadatos apropiados si están disponibles

  // Función para expandir/colapsar elementos en modo acordeón
  const toggleExpand = () => {
    if (accordionMode) {
      setIsExpanded(!isExpanded);
    }
  };

  // Función para navegar a un elemento
  const handleNavigate = () => {
    if (onNavigate && item.id) {
      setIsLoading(true);
      try {
        onNavigate(item.id);
      } catch (err) {
        setError("Error al navegar al elemento");
        console.error("Error de navegación:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Renderizar componente según tipo
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // Renderizar según el tipo de elemento en la jerarquía
  if (isTabsContainer && isAvailable && isAuth) {
    return (
      <TabsContainer
        item={item}
        depth={depth}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
        accordionMode={accordionMode}
      >
        {/* Renderizar tabs hijos */}
        {item.childrens &&
          item.childrens.map((child, index) => (
            <HierarchyComponentsSelector
              key={child.id}
              item={child}
              marketingCards={marketingCards}
              depth={depth + 1}
              onNavigate={onNavigate}
              accordionMode={accordionMode}
            />
          ))}
      </TabsContainer>
    );
  }

  if (isTabItem && isAvailable && isAuth) {
    return (
      <TabContent
        item={item}
        depth={depth}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
        accordionMode={accordionMode}
      >
        {/* Renderizar contenido del tab */}
        {item.childrens &&
          item.childrens.map((child, index) => (
            <HierarchyComponentsSelector
              key={child.id}
              item={child}
              marketingCards={marketingCards}
              depth={depth + 1}
              onNavigate={onNavigate}
              accordionMode={accordionMode}
            />
          ))}
      </TabContent>
    );
  }

  if (isSectionItem && isAvailable && isAuth) {
    return (
      <SectionContent
        item={item}
        depth={depth}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
        accordionMode={accordionMode}
      >
        {/* Renderizar contenido de la sección */}
        {item.childrens &&
          item.childrens.map((child, index) => (
            <HierarchyComponentsSelector
              key={child.id}
              item={child}
              marketingCards={marketingCards}
              depth={depth + 1}
              onNavigate={onNavigate}
              accordionMode={accordionMode}
            />
          ))}
      </SectionContent>
    );
  }

  if (isFolder && isAvailable && isAuth) {
    return (
      <FolderContent
        item={item}
        depth={depth}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
        onNavigate={handleNavigate}
        accordionMode={accordionMode}
      >
        {/* Renderizar contenido de la carpeta */}
        {isExpanded &&
          item.childrens &&
          item.childrens.map((child, index) => (
            <HierarchyComponentsSelector
              key={child.id}
              item={child}
              marketingCards={marketingCards}
              depth={depth + 1}
              onNavigate={onNavigate}
              accordionMode={accordionMode}
            />
          ))}
      </FolderContent>
    );
  }

  if (isFile && isAvailable && isAuth) {
    return (
      <FileContent
        item={item}
        depth={depth}
        onNavigate={handleNavigate}
        marketingCards={marketingCards}
      />
    );
  }

  // Si no coincide con ningún tipo, devolver null
  return null;
}
