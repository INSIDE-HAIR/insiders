"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { HierarchyItem } from "@/src/features/drive/types/hierarchy";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  LayoutList,
  Code,
  Search,
  Maximize,
  Minimize,
  RotateCcw,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FolderIcon,
  FileIcon,
  Copy,
  Check,
} from "lucide-react";
import { DriveType } from "@/src/features/drive/types/drive";

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
  const canExpand = hasChildren;
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
          <AccordionContent className='px-4 py-2'>
            <div className='ml-4 space-y-2'>
              {hasChildren &&
                item.children.map((child) => (
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
          </AccordionContent>
        )}
      </AccordionItem>
    </div>
  );
}

interface DriveExplorerProps {
  path: string[];
  folderId?: string | null;
  initialMaxDepth?: number;
}

export default function DriveExplorer({
  path,
  folderId,
  initialMaxDepth = 3,
}: DriveExplorerProps) {
  const { data: session, status } = useSession();
  const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);
  const [currentView, setCurrentView] = useState<"accordion" | "json">(
    "accordion"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [maxDepth, setMaxDepth] = useState(initialMaxDepth);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{
    fromCache: boolean;
    cacheAge?: number;
  } | null>(null);
  const [routeContext, setRouteContext] = useState<{
    path: string[];
    title: string;
    subtitle?: string;
  } | null>(null);

  // Función para cargar datos desde el API - siempre con profundidad alta
  const fetchData = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Construir la URL con la ruta completa
      let url = `/api/drive/${path.join("/")}`;

      // Si hay un ID de carpeta específico, añadirlo a la URL
      if (folderId) {
        url += `/folders/${folderId}`;
      }

      // Añadir parámetros de consulta
      url += `?maxDepth=10&forceRefresh=${forceRefresh}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setHierarchy([]);
      } else {
        // Para carpetas específicas o raíz, la estructura cambia ligeramente
        if (folderId && data.folder) {
          setHierarchy(data.folder.hierarchy.children || []);
        } else {
          setHierarchy(data.root?.children || []);
        }

        setCacheInfo({
          fromCache: data.stats?.fromCache || false,
          cacheAge: data.stats?.cacheAge,
        });

        setLastRefresh(new Date());

        // Guardar información del contexto de la ruta
        if (data.routeInfo) {
          setRouteContext({
            path: data.routeInfo.path,
            title: data.routeInfo.title,
            subtitle: data.routeInfo.subtitle,
          });
        }
      }

      setDataLoaded(true);
    } catch (error) {
      setError((error as Error).message);
      setHierarchy([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (status !== "loading") {
      fetchData();
    }
  }, [status, path, folderId]);

  // Función para forzar actualización
  const forceRefresh = () => {
    setIsRefreshing(true);
    fetchData(true).finally(() => {
      setIsRefreshing(false);
    });
  };

  // Modificamos esta función para simplemente expandir/contraer sin carga adicional
  const toggleItem = (itemId: string, depth: number) => {
    // Simplemente toggle el estado expandido sin cargar datos adicionales
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
        if (
          item.driveType === DriveType.FOLDER &&
          item.children &&
          item.children.length > 0
        ) {
          ids.push(item.id);
          ids = [...ids, ...collectAllIds(item.children)];
        }
      });
      return ids;
    };

    const allIds = collectAllIds(hierarchy);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  const resetData = () => {
    setIsRefreshing(true);
    setDataLoaded(false);
    setHierarchy([]);
    setExpandedItems([]);
    fetchData().finally(() => {
      setIsRefreshing(false);
    });
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Cabecera con información de ruta */}
      {routeContext && (
        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>{routeContext.title}</h1>
          <p className='text-gray-500 mt-1'>{routeContext.subtitle}</p>
        </div>
      )}

      {/* Cuando hay datos cargados */}
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
                disabled={isRefreshing}
              >
                <LayoutList className='w-4 h-4' />
                <span>Vista Acordeón</span>
              </Button>
              <Button
                variant={currentView === "json" ? "default" : "outline"}
                size='sm'
                onClick={() => setCurrentView("json")}
                className='flex items-center gap-2'
                disabled={isRefreshing}
              >
                <Code className='w-4 h-4' />
                <span>Vista JSON</span>
              </Button>
            </div>

            {/* Estado de la carga */}
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
                  disabled={isRefreshing}
                >
                  <Maximize className='w-3 h-3' />
                  <span>Expandir Todo</span>
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={collapseAll}
                  className='flex items-center gap-1'
                  disabled={isRefreshing}
                >
                  <Minimize className='w-3 h-3' />
                  <span>Contraer Todo</span>
                </Button>
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={resetData}
                  className='flex items-center gap-1'
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <div className='animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-500 mr-1'></div>
                      <span>Reiniciando...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className='w-3 h-3' />
                      <span>Reiniciar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='flex flex-wrap gap-4 mb-4 text-sm text-gray-600'>
            {lastRefresh && (
              <div>
                <span className='font-semibold'>Última actualización: </span>
                <span>{lastRefresh.toLocaleTimeString()}</span>
              </div>
            )}

            {cacheInfo && (
              <div
                className={
                  cacheInfo.fromCache ? "text-amber-600" : "text-green-600"
                }
              >
                <span className='font-semibold'>Datos: </span>
                <span>
                  {cacheInfo.fromCache
                    ? `Desde caché (${cacheInfo.cacheAge} min)`
                    : "Recién cargados"}
                </span>
                {cacheInfo.fromCache && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 h-6 px-2'
                    onClick={forceRefresh}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <>
                        <div className='animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-500 mr-1'></div>
                        <span>Actualizando...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className='w-3 h-3 mr-1' />
                        <span>Actualizar</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

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

      {/* Cuando hay error */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4 mt-4'>
          <h3 className='text-red-800 font-semibold'>Error:</h3>
          <p className='text-red-700'>{error}</p>
        </div>
      )}

      {/* Indicador de carga */}
      {isLoading && !dataLoaded && (
        <div className='flex justify-center items-center py-20'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' />
        </div>
      )}
    </div>
  );
}
