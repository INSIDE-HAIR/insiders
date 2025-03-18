"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

export default function ComparisonPage() {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    originalApproach: true,
    newApproach: true,
    benefits: true,
    customTabs: true,
    hierarchySelector: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">
          Comparación de Enfoques de Componentes
        </h1>

        <div className="flex justify-end mb-4 space-x-4">
          <Link
            href="/hierarchy-demo"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            Ver Demostración Jerárquica
          </Link>
        </div>

        <div className="space-y-6">
          {/* Sección Enfoque Original */}
          <div className="border rounded-lg overflow-hidden">
            <div
              className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer"
              onClick={() => toggleSection("originalApproach")}
            >
              <h2 className="text-xl font-semibold">
                Enfoque Original: CustomTabs
              </h2>
              <button className="p-1 rounded-full hover:bg-gray-200">
                {expandedSections["originalApproach"] ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </button>
            </div>

            {expandedSections["originalApproach"] && (
              <div className="p-4">
                <p className="mb-3">
                  El enfoque original utiliza un componente{" "}
                  <code>CustomTabs</code> que maneja pestañas de manera plana,
                  sin una verdadera recursividad o jerarquía profunda.
                </p>

                <h3 className="text-lg font-medium mt-4 mb-2">
                  Características del enfoque original:
                </h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Estructura plana de pestañas sin anidamiento profundo</li>
                  <li>
                    Filtrado y ordenado simple basado en propiedad{" "}
                    <code>order</code>
                  </li>
                  <li>
                    Uso de <code>ComponentSelector</code> como renderizador
                    genérico
                  </li>
                  <li>
                    No reconoce naturalmente la diferencia entre{" "}
                    <code>tabs</code> (plural) y <code>tab</code> (singular)
                  </li>
                  <li>
                    Dificultad para representar múltiples niveles de jerarquía
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    {`// Ejemplo simplificado del enfoque original
export default function CustomTabs({ item, dataMarketingCards }) {
  const [defaultValue, setDefaultValue] = useState();

  // Filtrar y ordenar pestañas de forma plana
  const activeAndOrderedTabs = item.content
    ?.filter((tab) => tab.active)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((tab, index) => ({ ...tab, order: index + 1 }));

  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        {activeAndOrderedTabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {activeAndOrderedTabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content.map((contentItem) => (
            <ComponentSelector
              key={contentItem.id}
              item={contentItem}
              dataMarketingCards={dataMarketingCards}
            />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sección Nuevo Enfoque */}
          <div className="border rounded-lg overflow-hidden">
            <div
              className="flex justify-between items-center p-4 bg-blue-50 cursor-pointer"
              onClick={() => toggleSection("newApproach")}
            >
              <h2 className="text-xl font-semibold text-blue-800">
                Nuevo Enfoque: Jerarquía Recursiva
              </h2>
              <button className="p-1 rounded-full hover:bg-blue-100">
                {expandedSections["newApproach"] ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </button>
            </div>

            {expandedSections["newApproach"] && (
              <div className="p-4">
                <p className="mb-3">
                  El nuevo enfoque implementa una verdadera jerarquía recursiva,
                  donde cada componente puede contener subcomponentes del mismo
                  tipo, permitiendo anidamiento infinito.
                </p>

                <h3 className="text-lg font-medium mt-4 mb-2">
                  Características del nuevo enfoque:
                </h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    Recursividad explícita con componentes que se llaman a sí
                    mismos
                  </li>
                  <li>
                    Detección automática de tipos (<code>tabs</code>,{" "}
                    <code>tab</code>, <code>section</code>, etc.)
                  </li>
                  <li>Control de profundidad y anidamiento ilimitado</li>
                  <li>
                    Soporte para modo acordeón con expansión/colapso a cualquier
                    nivel
                  </li>
                  <li>Componentes especializados para cada tipo de elemento</li>
                  <li>Mantiene relaciones padre-hijo en la estructura</li>
                </ul>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    {`// Ejemplo simplificado del enfoque recursivo
export default function HierarchyComponentsSelector({
  item,
  marketingCards,
  depth = 0,
  onNavigate,
  accordionMode = false,
}) {
  // Detectar tipo de elemento
  const isTabsContainer = item.name.includes("_tabs") && !item.name.includes("_tab_");
  const isTabItem = item.name.includes("_tab_");
  const isSectionItem = item.name.includes("_section_");
  
  // Renderizar componente según tipo detectado
  if (isTabsContainer) {
    return (
      <TabsContainer item={item} depth={depth} accordionMode={accordionMode}>
        {/* Recursividad: Renderizar hijos */}
        {item.childrens && item.childrens.map((child) => (
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
  
  if (isTabItem) {
    return (
      <TabContent item={item} depth={depth} accordionMode={accordionMode}>
        {/* Más recursividad aquí para contenido del tab */}
        {item.childrens && item.childrens.map((child) => (
          <HierarchyComponentsSelector 
            key={child.id}
            item={child}
            /* ... otros props ... */
          />
        ))}
      </TabContent>
    );
  }
  
  // Más condicionales para otros tipos...
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Beneficios del Nuevo Enfoque */}
          <div className="border rounded-lg overflow-hidden">
            <div
              className="flex justify-between items-center p-4 bg-green-50 cursor-pointer"
              onClick={() => toggleSection("benefits")}
            >
              <h2 className="text-xl font-semibold text-green-800">
                Beneficios del Enfoque Jerárquico
              </h2>
              <button className="p-1 rounded-full hover:bg-green-100">
                {expandedSections["benefits"] ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </button>
            </div>

            {expandedSections["benefits"] && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium mb-2 text-blue-700">
                      Flexibilidad
                    </h3>
                    <ul className="list-disc ml-4 space-y-1 text-sm">
                      <li>Soporta cualquier profundidad de anidamiento</li>
                      <li>Adaptable a cambios en la estructura de datos</li>
                      <li>Fácil adición de nuevos tipos de componentes</li>
                      <li>Puede manejar estructuras de datos complejas</li>
                    </ul>
                  </div>

                  <div className="border p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium mb-2 text-blue-700">
                      Mantenibilidad
                    </h3>
                    <ul className="list-disc ml-4 space-y-1 text-sm">
                      <li>Código más organizado y modular</li>
                      <li>
                        Componentes especializados con responsabilidades claras
                      </li>
                      <li>Facilita pruebas unitarias específicas</li>
                      <li>Separación clara entre presentación y lógica</li>
                    </ul>
                  </div>

                  <div className="border p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium mb-2 text-blue-700">
                      Experiencia de Usuario
                    </h3>
                    <ul className="list-disc ml-4 space-y-1 text-sm">
                      <li>Navegación intuitiva con acordeones anidados</li>
                      <li>Visualización clara de la jerarquía de contenido</li>
                      <li>Indentación visual que refleja la estructura</li>
                      <li>
                        Consistencia en la representación de elementos similares
                      </li>
                    </ul>
                  </div>

                  <div className="border p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium mb-2 text-blue-700">
                      Rendimiento
                    </h3>
                    <ul className="list-disc ml-4 space-y-1 text-sm">
                      <li>Carga bajo demanda de elementos anidados</li>
                      <li>Renderizado selectivo basado en expansión/colapso</li>
                      <li>Mejor gestión de memoria para estructuras grandes</li>
                      <li>Evita la recreación innecesaria de componentes</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comparación de Código */}
          <div className="border rounded-lg overflow-hidden">
            <div
              className="flex justify-between items-center p-4 bg-purple-50 cursor-pointer"
              onClick={() => toggleSection("customTabs")}
            >
              <h2 className="text-xl font-semibold text-purple-800">
                Análisis: CustomTabs
              </h2>
              <button className="p-1 rounded-full hover:bg-purple-100">
                {expandedSections["customTabs"] ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </button>
            </div>

            {expandedSections["customTabs"] && (
              <div className="p-4">
                <p className="mb-4">
                  El componente <code>CustomTabs</code> original presenta las
                  siguientes limitaciones:
                </p>

                <div className="space-y-4">
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <h4 className="font-medium text-red-700">
                      No hay recursividad verdadera
                    </h4>
                    <p className="text-sm mt-1">
                      Aunque utiliza <code>ComponentSelector</code> para
                      renderizar contenido, no puede representar tabs dentro de
                      tabs de forma nativa.
                    </p>
                    <pre className="text-xs mt-2 bg-white p-2 rounded">
                      {`// Solo puede manejar un nivel de anidamiento
{tab.content.map((contentItem) => (
  <ComponentSelector item={contentItem} />
))}`}
                    </pre>
                  </div>

                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <h4 className="font-medium text-red-700">
                      Estructura plana
                    </h4>
                    <p className="text-sm mt-1">
                      Maneja los tabs como una lista plana, sin considerar
                      relaciones de anidamiento o jerarquía entre diferentes
                      componentes.
                    </p>
                  </div>

                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <h4 className="font-medium text-red-700">
                      Lógica acoplada
                    </h4>
                    <p className="text-sm mt-1">
                      Mezcla la lógica de filtrado, ordenación y renderizado en
                      un solo componente, dificultando la extensibilidad.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Análisis Selector Jerárquico */}
          <div className="border rounded-lg overflow-hidden">
            <div
              className="flex justify-between items-center p-4 bg-indigo-50 cursor-pointer"
              onClick={() => toggleSection("hierarchySelector")}
            >
              <h2 className="text-xl font-semibold text-indigo-800">
                Análisis: HierarchyComponentsSelector
              </h2>
              <button className="p-1 rounded-full hover:bg-indigo-100">
                {expandedSections["hierarchySelector"] ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </button>
            </div>

            {expandedSections["hierarchySelector"] && (
              <div className="p-4">
                <p className="mb-4">
                  El nuevo componente <code>HierarchyComponentsSelector</code>{" "}
                  implementa un enfoque recursivo que ofrece:
                </p>

                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <h4 className="font-medium text-green-700">
                      Recursividad explícita
                    </h4>
                    <p className="text-sm mt-1">
                      El componente se llama a sí mismo para renderizar
                      elementos hijos, permitiendo cualquier nivel de
                      anidamiento.
                    </p>
                    <pre className="text-xs mt-2 bg-white p-2 rounded">
                      {`// Llamada recursiva para renderizar hijos
{item.childrens && item.childrens.map((child) => (
  <HierarchyComponentsSelector
    key={child.id}
    item={child}
    depth={depth + 1}
    // ...otros props
  />
))}`}
                    </pre>
                  </div>

                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <h4 className="font-medium text-green-700">
                      Componentes especializados
                    </h4>
                    <p className="text-sm mt-1">
                      Utiliza componentes específicos para cada tipo de elemento
                      (TabsContainer, TabContent, SectionContent, etc.),
                      mejorando la organización y reutilización.
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <h4 className="font-medium text-green-700">
                      Control de profundidad
                    </h4>
                    <p className="text-sm mt-1">
                      Mantiene un registro de la profundidad de cada elemento y
                      aplica la indentación visual correspondiente, mejorando la
                      experiencia de usuario.
                    </p>
                    <pre className="text-xs mt-2 bg-white p-2 rounded">
                      {`// Control de profundidad para indentación visual
const paddingLeft = \`\${depth * 1}rem\`;`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">
            Conclusión
          </h2>
          <p>
            El nuevo enfoque jerárquico recursivo ofrece una solución más
            flexible, mantenible y escalable para representar estructuras de
            datos anidadas. Facilita la navegación a través de contenido
            complejo y respeta la integridad de las relaciones entre elementos,
            asegurando que los <code>tabs</code> (plural) siempre contengan{" "}
            <code>tab</code> (singular).
          </p>

          <div className="mt-4 flex justify-center">
            <Link
              href="/hierarchy-demo"
              className="inline-block px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver Demostración Interactiva
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
