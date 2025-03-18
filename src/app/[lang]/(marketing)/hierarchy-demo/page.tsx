"use client";

import React, { useState, useEffect } from "react";
import { fetchFolderById } from "@/src/app/[lang]/(marketing)/marketing-salon-drive-2/_components";
import HierarchyComponentsSelector from "@/src/components/shared/hierarchy-components-selector/hierarchy-components-selector";
import HierarchyTreeView from "@/src/components/shared/hierarchy-components-selector/hierarchy-tree-view";

import {
  mockHierarchyData,
  mockMarketingCards,
} from "@/src/features/marketing-salon-drive/utils/mockData";
import LoadingIndicator from "@/src/components/shared/ui/loading-indicator";
import ErrorDisplay from "@/src/components/shared/ui/error-display";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/types/drive";

// ID de carpeta de ejemplo para la demostración - puedes cambiarlo por un ID real
const DEMO_FOLDER_ID = "1uksAN7jXW_xhNcLhKP2EIBZGDS8QJqmF";

// Componente para visualizar JSON con formato
function JsonViewer({ data }: { data: any }) {
  return (
    <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-[600px]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function HierarchyDemoPage() {
  const [hierarchyData, setHierarchyData] = useState<HierarchyItem | null>(
    null
  );
  const [marketingCards, setMarketingCards] = useState<any>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accordionMode, setAccordionMode] = useState<boolean>(true);
  const [useMockData, setUseMockData] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>("visual");
  const [expandedTreeItems, setExpandedTreeItems] = useState<Set<string>>(
    new Set(["root-folder"])
  );
  const [selectedTreeItem, setSelectedTreeItem] = useState<string | undefined>(
    undefined
  );
  const [jsonViewType, setJsonViewType] = useState<"processed" | "raw">(
    "processed"
  );

  // Cargar datos jerárquicos
  useEffect(() => {
    const loadHierarchyData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (useMockData) {
          // Usar datos de prueba
          setTimeout(() => {
            setHierarchyData(mockHierarchyData);
            setMarketingCards(mockMarketingCards);
            // Guardar también los datos sin procesar para el visualizador JSON
            setRawData({
              mockHierarchyData,
              mockMarketingCards,
            });
            setLoading(false);
          }, 800); // Simular retardo de red
        } else {
          // Conectar al backend real
          const response = await fetchFolderById(DEMO_FOLDER_ID);

          if (response.success && response.hierarchyMap) {
            setHierarchyData(response.hierarchyMap);
            setMarketingCards(response.marketingCards || {});
            // Guardar también la respuesta completa para el visualizador JSON
            setRawData(response);
          } else {
            setError(
              response.error || "No se pudieron cargar los datos jerárquicos"
            );
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al cargar jerarquía:", err);
        setError("Error al cargar la estructura jerárquica");

        // Si falla la conexión al backend, usar datos de prueba
        setHierarchyData(mockHierarchyData);
        setMarketingCards(mockMarketingCards);
        setRawData({ mockHierarchyData, mockMarketingCards });
        setLoading(false);
      }
    };

    loadHierarchyData();
  }, [useMockData]);

  // Función para navegar a un elemento
  const handleNavigate = (itemId: string) => {
    console.log(`Navegando a: ${itemId}`);
    // En una implementación real, aquí usaríamos router.push() o similar
    alert(`Navegación a elemento: ${itemId}`);
  };

  // Alternar entre datos reales y de prueba
  const toggleDataSource = () => {
    setUseMockData(!useMockData);
  };

  // Manejar la expansión/colapso de elementos en el árbol
  const handleToggleTreeItem = (itemId: string) => {
    setExpandedTreeItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Manejar la selección de elementos en el árbol
  const handleSelectTreeItem = (item: HierarchyItem) => {
    setSelectedTreeItem(item.id);

    // Expandir automáticamente el elemento seleccionado
    if (
      item.driveType === "folder" &&
      item.childrens &&
      item.childrens.length > 0
    ) {
      setExpandedTreeItems((prev) => {
        const newSet = new Set(prev);
        newSet.add(item.id);
        return newSet;
      });
    }
  };

  // Expandir todos los elementos del árbol
  const expandAllTreeItems = () => {
    if (!hierarchyData) return;

    const allIds = new Set<string>();

    // Función recursiva para recopilar todos los IDs
    const collectIds = (item: HierarchyItem) => {
      allIds.add(item.id);
      if (item.childrens) {
        item.childrens.forEach(collectIds);
      }
    };

    collectIds(hierarchyData);
    setExpandedTreeItems(allIds);
  };

  // Colapsar todos los elementos del árbol
  const collapseAllTreeItems = () => {
    setExpandedTreeItems(new Set([hierarchyData?.id || "root-folder"]));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Demostración de Jerarquía</h1>

          <div className="flex items-center space-x-4">
            <label className="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={accordionMode}
                onChange={() => setAccordionMode(!accordionMode)}
                className="mr-2 h-4 w-4"
              />
              Modo Acordeón
            </label>
            <label className="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useMockData}
                onChange={toggleDataSource}
                className="mr-2 h-4 w-4"
              />
              Usar datos de muestra
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingIndicator />
          </div>
        ) : error ? (
          <div>
            <ErrorDisplay message={error} />
            <div className="mt-4">
              <button
                onClick={() => setUseMockData(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Usar datos de muestra
              </button>
            </div>
          </div>
        ) : hierarchyData ? (
          <div>
            <div className="bg-blue-50 p-3 mb-4 rounded text-sm">
              <strong>Fuente de datos:</strong>{" "}
              {useMockData ? "Datos de muestra locales" : "API de Google Drive"}
            </div>

            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="mb-4 w-full flex">
                <TabsTrigger value="visual" className="flex-1">
                  Visualización de Componentes
                </TabsTrigger>
                <TabsTrigger value="tree" className="flex-1">
                  Vista de Árbol Jerárquico
                </TabsTrigger>
                <TabsTrigger value="split" className="flex-1">
                  Vista Dividida
                </TabsTrigger>
                <TabsTrigger value="json" className="flex-1">
                  Visualizador JSON
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="mt-2">
                <div className="border rounded-lg p-4 bg-white">
                  <HierarchyComponentsSelector
                    item={hierarchyData}
                    marketingCards={marketingCards}
                    onNavigate={handleNavigate}
                    accordionMode={accordionMode}
                  />
                </div>
              </TabsContent>

              <TabsContent value="tree" className="mt-2">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-end space-x-2 mb-4">
                    <button
                      onClick={expandAllTreeItems}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs"
                    >
                      Expandir Todo
                    </button>
                    <button
                      onClick={collapseAllTreeItems}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs"
                    >
                      Colapsar Todo
                    </button>
                  </div>
                  <HierarchyTreeView
                    item={hierarchyData}
                    expandedItems={expandedTreeItems}
                    onToggleExpand={handleToggleTreeItem}
                    onSelectItem={handleSelectTreeItem}
                    selectedItemId={selectedTreeItem}
                  />
                </div>
              </TabsContent>

              <TabsContent value="split" className="mt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="text-lg font-medium mb-3">
                      Árbol Jerárquico
                    </h3>
                    <div className="flex justify-end space-x-2 mb-4">
                      <button
                        onClick={expandAllTreeItems}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs"
                      >
                        Expandir Todo
                      </button>
                      <button
                        onClick={collapseAllTreeItems}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs"
                      >
                        Colapsar Todo
                      </button>
                    </div>
                    <HierarchyTreeView
                      item={hierarchyData}
                      expandedItems={expandedTreeItems}
                      onToggleExpand={handleToggleTreeItem}
                      onSelectItem={handleSelectTreeItem}
                      selectedItemId={selectedTreeItem}
                    />
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="text-lg font-medium mb-3">
                      Visualización de Componentes
                    </h3>
                    <HierarchyComponentsSelector
                      item={hierarchyData}
                      marketingCards={marketingCards}
                      onNavigate={handleNavigate}
                      accordionMode={accordionMode}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="json" className="mt-2">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      Visualizador de JSON
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setJsonViewType("processed")}
                        className={`px-3 py-1 rounded text-xs ${
                          jsonViewType === "processed"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        Datos Procesados
                      </button>
                      <button
                        onClick={() => setJsonViewType("raw")}
                        className={`px-3 py-1 rounded text-xs ${
                          jsonViewType === "raw"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        Datos Sin Procesar
                      </button>
                    </div>
                  </div>

                  {jsonViewType === "processed" ? (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">
                        Estructura Jerárquica Procesada
                      </h4>
                      <JsonViewer data={hierarchyData} />

                      <h4 className="text-sm font-semibold mt-4 mb-1">
                        Marketing Cards
                      </h4>
                      <JsonViewer data={marketingCards} />
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">
                        Datos Sin Procesar
                      </h4>
                      <JsonViewer data={rawData} />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay datos jerárquicos disponibles
          </div>
        )}

        <div className="mt-8 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Instrucciones</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              Esta página demuestra la visualización jerárquica de archivos y
              carpetas
            </li>
            <li>
              Los elementos están organizados según su estructura en Google
              Drive
            </li>
            <li>
              Los contenedores <span className="font-medium">tabs</span>{" "}
              (plural) siempre contienen elementos{" "}
              <span className="font-medium">tab</span> (singular)
            </li>
            <li>
              El modo acordeón permite expandir/colapsar elementos para mejor
              navegación
            </li>
            <li>
              Las secciones y carpetas se distinguen automáticamente según su
              nombre
            </li>
            <li>
              Puedes alternar entre datos de muestra y datos reales usando el
              selector en la parte superior
            </li>
            <li>
              La <span className="font-medium">Vista de Árbol Jerárquico</span>{" "}
              muestra claramente la recursividad implementada
            </li>
            <li>
              El <span className="font-medium">Visualizador JSON</span> permite
              examinar la estructura de datos procesados y sin procesar
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
