/**
 * ComponentFactory
 *
 * Implementa el patrón Factory para crear componentes de UI dinámicamente
 * según los prefijos y sufijos de los elementos en la jerarquía.
 */

import React from "react";
import {
  HierarchyItem,
  isFileItem,
  isFolderItem,
  hasPrefix,
  hasSuffix,
} from "@drive/types/hierarchy";
import { Prefix } from "@drive/types/prefix";
import { Suffix } from "@drive/types/suffix";
import { Logger } from "@drive/utils/logger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ui/accordion";
import { Button } from "@ui/button";
import { ExplorerElement, FileElement, FolderElement } from "../elements";

// Propiedades para el ComponentFactory
interface ComponentFactoryProps {
  item: HierarchyItem;
  depth?: number;
  onSelect?: (item: HierarchyItem) => void;
  selectedId?: string;
  onItemClick?: (item: HierarchyItem) => void;
}

// Tipos de componentes que pueden ser generados
export type ComponentType =
  | "folder"
  | "file"
  | "tabs"
  | "tab"
  | "accordion"
  | "section"
  | "grid"
  | "card";

/**
 * Determina el tipo de componente basado en el análisis de prefijos
 * @param item Elemento de jerarquía a analizar
 * @returns El tipo de componente a generar
 */
export function determineComponentType(item: HierarchyItem): ComponentType {
  // Primero analizar por prefijos específicos
  if (hasPrefix(item, Prefix.TABS)) return "tabs";
  if (hasPrefix(item, Prefix.TAB)) return "tab";
  if (hasPrefix(item, Prefix.ACCORDION)) return "accordion";
  if (hasPrefix(item, Prefix.SECTION)) return "section";
  if (hasPrefix(item, Prefix.GRID)) return "grid";
  if (hasPrefix(item, Prefix.CARD)) return "card";

  // Si no tiene prefijos especiales, usar el tipo base
  if (isFileItem(item)) return "file";
  if (isFolderItem(item)) return "folder";

  // Por defecto, tratar como folder
  return "folder";
}

/**
 * Componente placeholder para componentes aún no implementados
 */
const PlaceholderComponent: React.FC<{ type: string; name: string }> = ({
  type,
  name,
}) => (
  <div
    className="placeholder-component"
    style={{
      padding: "10px",
      margin: "5px",
      border: "1px dashed #ccc",
      borderRadius: "5px",
      backgroundColor: "#f8f8f8",
    }}
  >
    <h4>Componente: {type}</h4>
    <p>Nombre: {name}</p>
    <p>
      <em>Este componente será implementado próximamente</em>
    </p>
  </div>
);

/**
 * Tabs Component - Contenedor de tabs
 */
const TabsComponent: React.FC<ComponentFactoryProps> = ({
  item,
  depth = 0,
  onSelect,
  selectedId,
  onItemClick,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);

  if (!isFolderItem(item)) {
    return <div>Error: Se esperaba una carpeta de tabs</div>;
  }

  // Filtrar para obtener solo elementos tab_
  const tabs = item.children.filter((child) => hasPrefix(child, Prefix.TAB));

  // Elementos que no son tabs se muestran siempre (a menos que estén ocultos)
  const nonTabs = item.children.filter(
    (child) => !hasPrefix(child, Prefix.TAB) && !hasSuffix(child, Suffix.HIDDEN)
  );

  if (tabs.length === 0) {
    return <div>Error: No se encontraron tabs en esta carpeta</div>;
  }

  return (
    <Tabs defaultValue={tabs[0]?.id} className="w-full">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.displayName.replace(/^tab_/, "")}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          <ExplorerElement item={tab} onItemClick={onItemClick} />
        </TabsContent>
      ))}

      {nonTabs.length > 0 && (
        <div className="mt-4">
          {nonTabs.map((item) => (
            <ExplorerElement
              key={item.id}
              item={item}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </Tabs>
  );
};

/**
 * Tab Component - Contenido de un tab individual
 */
const TabComponent: React.FC<ComponentFactoryProps> = ({
  item,
  depth = 0,
  onSelect,
  selectedId,
  onItemClick,
}) => {
  if (!isFolderItem(item)) {
    return <div>Error: Se esperaba una carpeta de tab</div>;
  }

  return (
    <div className="tab-content">
      {item.children.map((child) => (
        <ExplorerElement
          key={child.id}
          item={child}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};

/**
 * Accordion Component - Contenedor de secciones plegables
 */
const AccordionComponent: React.FC<ComponentFactoryProps> = ({
  item,
  depth = 0,
  onSelect,
  selectedId,
  onItemClick,
}) => {
  if (!isFolderItem(item)) {
    return <div>Error: Se esperaba una carpeta de accordion</div>;
  }

  // Filtrar para obtener solo elementos section_
  const sections = item.children.filter((child) =>
    hasPrefix(child, Prefix.SECTION)
  );

  if (sections.length === 0) {
    return <div>Error: No se encontraron secciones en este accordion</div>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {sections.map((section) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger>
            {section.displayName.replace(/^section_/, "")}
          </AccordionTrigger>
          <AccordionContent>
            <ExplorerElement item={section} onItemClick={onItemClick} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

/**
 * Section Component - Sección de un accordion
 */
const SectionComponent: React.FC<ComponentFactoryProps> = ({
  item,
  depth = 0,
  onSelect,
  selectedId,
  onItemClick,
}) => {
  if (!isFolderItem(item)) {
    return <div>Error: Se esperaba una carpeta de sección</div>;
  }

  return (
    <div className="section-content">
      {item.children.map((child) => (
        <ExplorerElement
          key={child.id}
          item={child}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};

/**
 * Grid Component - Muestra los elementos en una cuadrícula
 */
const GridComponent: React.FC<ComponentFactoryProps> = ({
  item,
  depth = 0,
  onSelect,
  selectedId,
  onItemClick,
}) => {
  if (!isFolderItem(item)) {
    return <div>Error: Se esperaba una carpeta para la cuadrícula</div>;
  }

  return (
    <div className="grid-component">
      <div
        className="grid-container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "15px",
        }}
      >
        {item.children.map((child) => (
          <div key={child.id} className="grid-item">
            <ExplorerElement item={child} onItemClick={onItemClick} />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ComponentFactory - Componente principal que determina qué componente renderizar
 */
const ComponentFactory: React.FC<ComponentFactoryProps> = (props) => {
  const logger = new Logger("ComponentFactory");
  const { item } = props;

  // Si el elemento tiene sufijo _hidden, no mostrarlo
  if (hasSuffix(item, Suffix.HIDDEN)) {
    return null;
  }

  try {
    // Renderizar el componente apropiado según el tipo
    switch (determineComponentType(item)) {
      case "folder":
        return isFolderItem(item) ? (
          <FolderElement folder={item} onItemClick={props.onItemClick} />
        ) : null;
      case "file":
        return isFileItem(item) ? (
          <FileElement file={item} onItemClick={props.onItemClick} />
        ) : null;
      case "tabs":
        return <TabsComponent {...props} />;
      case "tab":
        return <TabComponent {...props} />;
      case "accordion":
        return <AccordionComponent {...props} />;
      case "section":
        return <SectionComponent {...props} />;
      case "grid":
        return <GridComponent {...props} />;
      case "card":
        return <PlaceholderComponent type="Card" name={item.displayName} />;
      default:
        logger.warn(
          `Tipo de componente desconocido: ${determineComponentType(item)}`
        );
        return (
          <PlaceholderComponent
            type={determineComponentType(item)}
            name={item.displayName}
          />
        );
    }
  } catch (error) {
    logger.error(
      `Error al renderizar componente ${determineComponentType(item)}`,
      error
    );
    return (
      <div className="component-error">
        Error al renderizar componente: {item.displayName}
      </div>
    );
  }
};

export default ComponentFactory;
