/**
 * DriveExplorer
 *
 * Página principal para explorar el contenido de Google Drive
 * y visualizar la jerarquía construida
 */

"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Logger } from "@/src/features/drive/utils/logger";
import { HierarchyItem } from "@/src/features/drive/types/hierarchy";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Code,
  LayoutList,
  ChevronDown,
  ChevronRight,
  FolderIcon,
  FileIcon,
  Layers,
  Minimize,
  Maximize,
  Search,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { DriveType } from "@/src/features/drive/types/drive";

const logger = new Logger("DriveExplorer");

// Componente para copiar texto al portapapeles
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (e: React.MouseEvent) => {
    // Detener la propagación del evento para evitar que el acordeón se abra/cierre
    e.stopPropagation();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className='ml-1 p-1 hover:bg-gray-100 rounded-full focus:outline-none'
      title='Copiar ID'
    >
      {copied ? (
        <Check className='h-3 w-3 text-green-500' />
      ) : (
        <Copy className='h-3 w-3 text-gray-500' />
      )}
    </button>
  );
}

// Componente recursivo para mostrar nodos de la jerarquía como acordeones
function HierarchyAccordion({
  item,
  depth = 0,
  maxDepth = 5,
  expanded = [],
  onToggle,
  loadingFolders = [],
}: {
  item: HierarchyItem;
  depth?: number;
  maxDepth?: number;
  expanded: string[];
  onToggle: (itemId: string, depth: number) => void;
  loadingFolders?: string[];
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expanded.includes(item.id);
  const canExpand = hasChildren && depth < maxDepth;
  const isLoading = loadingFolders.includes(item.id);

  // Genera un color para los badges de prefijos según el tipo
  const getPrefixColor = (prefix: string) => {
    if (prefix === "order") return "bg-gray-600";
    if (prefix === "campaign") return "bg-blue-600";
    if (prefix === "client") return "bg-green-600";
    if (prefix === "year") return "bg-yellow-600";
    if (prefix === "section") return "bg-purple-600";
    if (prefix === "sidebar") return "bg-pink-600";
    if (prefix === "tabs" || prefix === "tab") return "bg-indigo-600";
    return "bg-violet-600";
  };

  // Genera un color para los badges de sufijos según el tipo
  const getSuffixColor = (suffix: string) => {
    if (suffix === "hidden") return "bg-red-600";
    if (suffix === "preview") return "bg-green-600";
    if (suffix === "config") return "bg-blue-600";
    if (suffix === "template") return "bg-purple-600";
    if (suffix === "copy") return "bg-yellow-600";
    return "bg-orange-600";
  };

  // Ícono según el tipo de elemento
  const getIcon = () => {
    if (item.driveType === DriveType.FOLDER) {
      return (
        <FolderIcon className='h-5 w-5 text-blue-500 mr-2 flex-shrink-0' />
      );
    } else {
      return <FileIcon className='h-5 w-5 text-gray-500 mr-2 flex-shrink-0' />;
    }
  };

  // Si está más allá de la profundidad máxima, no renderizar
  if (depth > maxDepth) return null;

  return (
    <div className='mb-2'>
      <AccordionItem
        value={item.id}
        className={`border rounded-md ${
          depth === 0 ? "border-gray-300" : "border-gray-200"
        } ${isLoading ? "border-blue-300 bg-blue-50" : ""}`}
        data-state={isExpanded ? "open" : "closed"}
      >
        <AccordionTrigger
          onClick={(e) => {
            e.preventDefault();
            if (canExpand) {
              onToggle(item.id, depth);
            }
          }}
          className={`px-4 py-3 ${
            canExpand ? "cursor-pointer" : "cursor-default"
          } hover:no-underline`}
          disabled={!canExpand}
          hideChevron={true}
        >
          <div className='flex items-center flex-wrap gap-2 w-full'>
            <div className='flex items-center min-w-0 flex-grow'>
              {getIcon()}
              <span className='font-medium truncate'>{item.displayName}</span>

              {/* Indicador de carga para carpetas que se están expandiendo */}
              {isLoading && (
                <div className='ml-2 flex items-center'>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500 mr-2'></div>
                  <span className='text-xs text-blue-600'>Cargando...</span>
                </div>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-1 justify-end'>
              {/* Prefijos como badges */}
              {item.prefixes?.map((prefix) => (
                <Badge
                  key={`prefix-${prefix}`}
                  variant='secondary'
                  className={`text-xs text-white ${getPrefixColor(prefix)}`}
                >
                  {prefix === "order" ? `#${item.order}` : prefix}
                </Badge>
              ))}

              {/* Sufijos como badges */}
              {item.suffixes?.map((suffix) => (
                <Badge
                  key={`suffix-${suffix}`}
                  variant='outline'
                  className={`text-xs text-white ${getSuffixColor(suffix)}`}
                >
                  {suffix}
                </Badge>
              ))}

              {/* Badge de ID con botón para copiar */}
              <div className='flex items-center'>
                <Badge variant='secondary' className='text-xs pr-1'>
                  ID: {item.id.substring(0, 8)}...
                </Badge>
                <CopyButton text={item.id} />
              </div>
            </div>

            {/* Nuestros iconos personalizados */}
            {canExpand && (
              <div className='flex-shrink-0 ml-2'>
                {isExpanded ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </div>
            )}
          </div>
        </AccordionTrigger>

        {canExpand && (
          <AccordionContent className='px-4 pb-3'>
            {/* Archivos de vista previa */}
            {item.driveType === DriveType.FILE &&
              (item as any).previewItems &&
              (item as any).previewItems.length > 0 && (
                <div className='mb-3 pl-7 border-l-2 border-green-200'>
                  <span className='text-xs text-gray-500 block mb-1'>
                    Preview Files:
                  </span>
                  {(item as any).previewItems.map((preview: any) => (
                    <div
                      key={preview.id}
                      className='flex items-center gap-2 text-xs mb-1'
                    >
                      <FileIcon className='h-3 w-3 text-green-500' />
                      <span>{preview.displayName}</span>
                      <Badge
                        variant='outline'
                        className='text-xs px-1 py-0 text-white bg-green-600'
                      >
                        preview
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

            {/* Elementos hijos */}
            {hasChildren && (
              <div className='space-y-2 pl-2'>
                {item.children.map((child) => (
                  <HierarchyAccordion
                    key={child.id}
                    item={child}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    expanded={expanded}
                    onToggle={onToggle}
                    loadingFolders={loadingFolders}
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        )}
      </AccordionItem>
    </div>
  );
}

export default function DriveExplorer() {
  const { data: session, status } = useSession();
  const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);
  const [currentView, setCurrentView] = useState<"accordion" | "json">(
    "accordion"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState<string[]>([]);
  const [loadedFolders, setLoadedFolders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [maxDepth, setMaxDepth] = useState(2);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [useLazyLoading, setUseLazyLoading] = useState(true);

  useEffect(() => {
    // No cargar automáticamente la jerarquía al inicio
    // Solo verificar la autenticación
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: "/drive" });
    }
  }, [status]);

  const fetchHierarchy = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadedFolders([]);

      // Incluir el parámetro maxDepth en la URL, limitado a 2 niveles si usamos lazy loading
      const initialDepth = useLazyLoading ? Math.min(2, maxDepth) : maxDepth;
      const response = await fetch(
        `/api/drive/hierarchy?maxDepth=${initialDepth}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hierarchy");
      }

      const data = await response.json();
      logger.info("Received hierarchy data:", data);

      // Asegurarnos de que data.root existe
      if (!data.root) {
        logger.warn("Invalid hierarchy data structure:", data);
        setHierarchy([]);
        return;
      }

      // Si data.root existe, lo usamos como el elemento raíz
      setHierarchy([data.root]);
      setDataLoaded(true);
    } catch (err) {
      logger.error("Error fetching hierarchy:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setHierarchy([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolderChildren = async (folderId: string, folderDepth: number) => {
    // Si ya estamos cargando esta carpeta o ya fue cargada completamente, no hacer nada
    if (loadingFolders.includes(folderId) || loadedFolders.includes(folderId)) {
      return;
    }

    try {
      setLoadingFolders((prev) => [...prev, folderId]);

      // Calculamos la profundidad restante que queremos cargar
      const subDepth = Math.max(1, maxDepth - folderDepth);
      const response = await fetch(
        `/api/drive/hierarchy?rootId=${folderId}&maxDepth=${subDepth}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch folder ${folderId}`);
      }

      const data = await response.json();

      if (!data.root) {
        logger.warn(`Invalid folder data for ${folderId}`);
        return;
      }

      // Actualizamos la jerarquía reemplazando la carpeta con su versión completa
      setHierarchy((prev) => {
        // Función recursiva para actualizar un nodo específico y sus hijos
        const updateNode = (items: HierarchyItem[]): HierarchyItem[] => {
          return items.map((item) => {
            if (item.id === folderId) {
              // Reemplazar este nodo con la versión completa del API
              return data.root;
            } else if (item.children && item.children.length > 0) {
              // Buscar en los hijos
              return {
                ...item,
                children: updateNode(item.children),
              };
            }
            return item;
          });
        };

        return updateNode(prev);
      });

      // Marcar esta carpeta como completamente cargada
      setLoadedFolders((prev) => [...prev, folderId]);
    } catch (err) {
      logger.error(`Error fetching folder ${folderId}:`, err);
      // Opcional: mostrar un error específico para esta carpeta
    } finally {
      setLoadingFolders((prev) => prev.filter((id) => id !== folderId));
    }
  };

  const resetData = () => {
    setDataLoaded(false);
    setHierarchy([]);
    setExpandedItems([]);
    setLoadedFolders([]);
  };

  const toggleItem = (itemId: string, depth: number) => {
    const isExpanding = !expandedItems.includes(itemId);

    // Si estamos expandiendo y es una carpeta no cargada previamente, cargar sus hijos
    if (isExpanding && useLazyLoading) {
      fetchFolderChildren(itemId, depth);
    }

    // Actualizar el estado de expansión
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const expandAll = () => {
    // Función recursiva para recopilar todos los IDs
    const collectAllIds = (items: HierarchyItem[]): string[] => {
      let ids: string[] = [];
      items.forEach((item) => {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
          ids = [...ids, ...collectAllIds(item.children)];
        }
      });
      return ids;
    };

    const allIds = collectAllIds(hierarchy);
    setExpandedItems(allIds);

    // Si lazy loading está activado, intentamos cargar los hijos de todas las carpetas expandidas
    if (useLazyLoading) {
      // Limitar a un número razonable para evitar demasiadas solicitudes
      const foldersToLoad = allIds.slice(0, 10);
      foldersToLoad.forEach((id) => {
        // Como no conocemos la profundidad exacta, usamos un valor estimado
        fetchFolderChildren(id, 1);
      });
    }
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  if (status === "loading") {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className='flex flex-col justify-center items-center h-screen'>
        <h1 className='text-2xl font-bold mb-4'>Drive Explorer</h1>
        <p className='mb-4'>Please sign in to access Drive Explorer</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/drive" })}
          className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Drive Explorer</h1>

      {/* Panel de Configuración */}
      {!dataLoaded && (
        <div className='bg-gray-50 p-6 rounded-lg shadow-sm mb-8 border'>
          <h2 className='text-xl font-semibold mb-4'>
            Configuración de Exploración
          </h2>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-wrap gap-6 items-end'>
              <div>
                <label
                  htmlFor='maxDepth'
                  className='block text-sm font-medium mb-2'
                >
                  Profundidad Máxima
                </label>
                <div className='flex items-center gap-2'>
                  <select
                    id='maxDepth'
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className='h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map(
                      (depth) => (
                        <option key={depth} value={depth}>
                          {depth}
                        </option>
                      )
                    )}
                  </select>
                  <span className='text-sm text-gray-500'>Niveles</span>
                </div>
                <p className='text-xs text-gray-500 mt-1'>
                  Determina cuántos niveles de carpetas serán cargados
                </p>
              </div>

              <div className='flex items-center gap-2'>
                <label className='inline-flex items-center'>
                  <input
                    type='checkbox'
                    checked={useLazyLoading}
                    onChange={(e) => setUseLazyLoading(e.target.checked)}
                    className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                  />
                  <span className='ml-2 text-sm text-gray-600'>
                    Carga bajo demanda
                  </span>
                </label>
                <p className='text-xs text-gray-500'>
                  {useLazyLoading
                    ? "Cargará inicialmente 2 niveles, y el resto cuando expanda las carpetas"
                    : "Cargará todos los niveles de una sola vez (puede ser lento para profundidades altas)"}
                </p>
              </div>

              <Button
                onClick={fetchHierarchy}
                disabled={isLoading}
                className='flex items-center gap-2'
              >
                {isLoading ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                ) : (
                  <Search className='w-4 h-4' />
                )}
                <span>Cargar Jerarquía</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className='mb-6 p-4 bg-red-100 text-red-700 rounded-lg'>
          {error}
        </div>
      )}

      {/* Vista y controles (solo cuando hay datos cargados) */}
      {dataLoaded && (
        <>
          {/* View Selector y Controles */}
          <div className='flex flex-wrap gap-4 mb-6 justify-between items-center'>
            <div className='flex gap-2'>
              <Button
                variant={currentView === "accordion" ? "default" : "outline"}
                size='sm'
                onClick={() => setCurrentView("accordion")}
                className='flex items-center gap-2'
              >
                <LayoutList className='w-4 h-4' />
                <span>Vista Acordeón</span>
              </Button>
              <Button
                variant={currentView === "json" ? "default" : "outline"}
                size='sm'
                onClick={() => setCurrentView("json")}
                className='flex items-center gap-2'
              >
                <Code className='w-4 h-4' />
                <span>Vista JSON</span>
              </Button>
            </div>

            {/* Estado de la carga bajo demanda */}
            {loadingFolders.length > 0 && (
              <div className='flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-sm'>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500'></div>
                <span>
                  Cargando {loadingFolders.length}{" "}
                  {loadingFolders.length === 1 ? "carpeta" : "carpetas"}...
                </span>
              </div>
            )}

            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={expandAll}
                  className='flex items-center gap-1'
                >
                  <Maximize className='w-3 h-3' />
                  <span>Expandir Todo</span>
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={collapseAll}
                  className='flex items-center gap-1'
                >
                  <Minimize className='w-3 h-3' />
                  <span>Contraer Todo</span>
                </Button>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-sm'>Max Depth: {maxDepth}</span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={resetData}
                  className='flex items-center gap-1'
                >
                  <RotateCcw className='w-3 h-3' />
                  <span>Reiniciar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='flex flex-wrap gap-4 mb-4 text-sm text-gray-600'>
            <div>
              <span className='font-semibold'>Modo de carga: </span>
              <span
                className={useLazyLoading ? "text-blue-600" : "text-amber-600"}
              >
                {useLazyLoading ? "Bajo demanda" : "Completa"}
              </span>
              <Button
                variant='ghost'
                size='sm'
                className='ml-2 h-6 px-2'
                onClick={() => setUseLazyLoading(!useLazyLoading)}
              >
                Cambiar
              </Button>
            </div>

            <div>
              <span className='font-semibold'>Carpetas cargadas: </span>
              <span>{loadedFolders.length}</span>
            </div>

            {loadingFolders.length > 0 && (
              <div className='text-blue-600'>
                <span className='font-semibold'>Cargando: </span>
                <span>{loadingFolders.length} carpetas</span>
              </div>
            )}
          </div>

          {/* Content */}
          {currentView === "accordion" ? (
            <div className='space-y-4'>
              {hierarchy && hierarchy.length > 0 ? (
                <Accordion
                  type='multiple'
                  value={expandedItems}
                  className='space-y-4'
                >
                  {hierarchy.map((item) => (
                    <HierarchyAccordion
                      key={item.id}
                      item={item}
                      maxDepth={maxDepth}
                      expanded={expandedItems}
                      onToggle={toggleItem}
                      loadingFolders={loadingFolders}
                    />
                  ))}
                </Accordion>
              ) : (
                <div className='text-center text-gray-500 py-8'>
                  No items found in the hierarchy
                </div>
              )}
            </div>
          ) : (
            <div className='bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[70vh]'>
              <pre className='text-sm'>
                {JSON.stringify(hierarchy || [], null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

      {/* Cuando no hay datos y no está cargando */}
      {!dataLoaded && !isLoading && (
        <div className='text-center text-gray-500 py-8 border border-dashed rounded-lg'>
          <p className='mb-2'>
            Configure los parámetros y haga clic en &quot;Cargar Jerarquía&quot;
          </p>
          <p className='text-sm'>
            Los datos se cargarán con la profundidad máxima seleccionada
          </p>
        </div>
      )}

      {/* Indicador de carga */}
      {isLoading && (
        <div className='flex justify-center items-center py-20'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' />
        </div>
      )}
    </div>
  );
}
