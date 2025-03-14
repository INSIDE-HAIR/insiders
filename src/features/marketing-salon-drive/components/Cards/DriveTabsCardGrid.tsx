"use client";
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { FolderIcon, FolderOpenIcon, FileIcon } from "lucide-react";

import { DriveFile } from "../../types/drive";
import { DriveCardGrid } from "./DriveCardGrid";
import { cn } from "@/src/lib/utils/utils";

// Interfaz FolderContent actualizada para soportar subcarpetas de forma recursiva
interface FolderContent {
  files: DriveFile[];
  subfolders: { [key: string]: FolderContent };
  isFolder: boolean;
}

// Interfaz para la estructura general de carpetas
interface FolderStructure {
  [folderName: string]: FolderContent;
}

interface DriveTabsCardGridProps {
  files?: DriveFile[];
  selectedTab?: string;
  onPreviewClick?: (file: DriveFile) => void;
}

// Componente para renderizar tabs de carpetas de forma recursiva
interface FolderTabsProps {
  folderContent: FolderContent;
  folderName: string;
  level: number;
  onPreviewClick?: (file: DriveFile) => void;
}

// Componente para renderizar carpetas recursivamente
function FolderTabs({
  folderContent,
  folderName,
  level,
  onPreviewClick,
}: FolderTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("");
  const hasSubfolders = Object.keys(folderContent.subfolders).length > 0;

  // Establecer el tab activo por defecto
  useEffect(() => {
    if (hasSubfolders) {
      setActiveTab(Object.keys(folderContent.subfolders)[0]);
    } else {
      setActiveTab("Principal");
    }
  }, [folderContent, hasSubfolders]);

  // Si no hay subcarpetas, mostrar solo los archivos de esta carpeta
  if (!hasSubfolders) {
    return (
      <div className='mt-4'>
        {folderContent.files.length > 0 ? (
          <div className='gap-x-6 gap-y-4 flex flex-row flex-wrap items-start justify-center text-center w-full'>
            <DriveCardGrid
              files={folderContent.files}
              onPreviewClick={onPreviewClick}
            />
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No hay archivos en esta carpeta.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Si hay subcarpetas, renderizar como tabs
  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={setActiveTab}
      className='w-full mt-4'
    >
      <div className='flex justify-center w-full mb-4'>
        <TabsList
          className={cn(
            "[&>[data-state=active]]:bg-[#B9F264] [&>[data-state=active]]:font-semibold rounded-none flex flex-wrap h-full bg-transparent",
            level > 0 && "border-t border-zinc-700 pt-2 mt-2"
          )}
        >
          {/* Tab para archivos de la carpeta actual */}
          {folderContent.files.length > 0 && (
            <TabsTrigger
              key='tab-principal'
              value='Principal'
              className='rounded-none bg-zinc-700 text-white border-none data-[state=active]:bg-[#B9F264] data-[state=active]:text-black'
            >
              Principal
            </TabsTrigger>
          )}

          {/* Tabs para cada subcarpeta */}
          {Object.keys(folderContent.subfolders).map((subfolder) => (
            <TabsTrigger
              key={`subfolder-${subfolder}`}
              value={subfolder}
              className='rounded-none bg-zinc-700 text-white border-none data-[state=active]:bg-[#B9F264] data-[state=active]:text-black'
            >
              {subfolder}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Contenido para archivos de la carpeta actual */}
      {folderContent.files.length > 0 && (
        <TabsContent value='Principal' className='w-full'>
          <div className='flex items-center mb-4'>
            <FolderOpenIcon className='h-5 w-5 mr-2 text-[#B9F264]' />
            <h4 className='text-lg font-medium'>
              Archivos en {level === 0 ? folderName : `${folderName}`}
            </h4>
          </div>

          <div className='gap-x-6 gap-y-4 flex flex-row flex-wrap items-start justify-center text-center w-full'>
            <DriveCardGrid
              files={folderContent.files}
              onPreviewClick={onPreviewClick}
            />
          </div>
        </TabsContent>
      )}

      {/* Contenido para cada subcarpeta - Renderizado recursivo */}
      {Object.entries(folderContent.subfolders).map(
        ([subfolderName, subfolderContent]) => (
          <TabsContent
            key={`subcontent-${subfolderName}`}
            value={subfolderName}
            className='w-full'
          >
            <div className='flex items-center mb-4'>
              <FolderOpenIcon className='h-5 w-5 mr-2 text-[#B9F264]' />
              <h4 className='text-lg font-medium'>{subfolderName}</h4>
            </div>

            {/* Llamada recursiva para renderizar subcarpetas dentro de subcarpetas */}
            <FolderTabs
              folderContent={subfolderContent}
              folderName={subfolderName}
              level={level + 1}
              onPreviewClick={onPreviewClick}
            />
          </TabsContent>
        )
      )}
    </Tabs>
  );
}

export function DriveTabsCardGrid({
  files = [],
  selectedTab,
  onPreviewClick,
}: DriveTabsCardGridProps) {
  const [activeTab, setActiveTab] = useState<string>("");
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({});
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    if (files.length > 0) {
      const structure = buildFolderStructure(files);
      console.log("Estructura de carpetas:", structure);
      setFolderStructure(structure);

      // Si hay un tab seleccionado, usarlo
      if (selectedTab && structure[selectedTab]) {
        setActiveTab(selectedTab);
      }
      // De lo contrario, seleccionar el primer tab disponible
      else if (Object.keys(structure).length > 0) {
        setActiveTab(Object.keys(structure)[0]);
      }
    }
  }, [files, selectedTab]);

  // Función mejorada para construir la estructura de carpetas de forma recursiva
  const buildFolderStructure = (files: DriveFile[]): FolderStructure => {
    const structure: FolderStructure = {};

    // Función para asegurar que exista una ruta completa de carpetas
    const ensurePath = (path: string[], rootStruct: any = structure): any => {
      if (path.length === 0) return rootStruct;

      const currentFolder = path[0];
      if (!rootStruct[currentFolder]) {
        rootStruct[currentFolder] = {
          files: [],
          subfolders: {},
          isFolder: true,
        };
      }

      if (path.length === 1) {
        return rootStruct[currentFolder];
      }

      return ensurePath(path.slice(1), rootStruct[currentFolder].subfolders);
    };

    // Analiza un objeto DriveFile y extrae su estructura de carpetas completa
    const analyzeFolderStructure = (files: DriveFile[]): FolderStructure => {
      const structureMap: FolderStructure = {};

      // Función para extraer y normalizar nombres de carpetas
      const normalizeFolder = (name: string): string => {
        return name.trim();
      };

      // Primera pasada: encontrar todas las carpetas y subcarpetas
      files.forEach((file) => {
        // Ignorar si el archivo es una carpeta
        if (file.mimeType === "application/vnd.google-apps.folder") {
          return;
        }

        // Extraer todas las posibles indicaciones de carpetas
        const folderHints: string[] = [];

        // Carpeta principal
        if (file.folder) {
          folderHints.push(normalizeFolder(file.folder));
        }

        // Subcarpeta explícita
        if (file.subFolder) {
          folderHints.push(normalizeFolder(file.subFolder));
        }

        // Carpeta por agrupación o título
        if (
          file.groupTitle &&
          (!file.subFolder || file.groupTitle !== file.subFolder)
        ) {
          folderHints.push(normalizeFolder(file.groupTitle));
        }

        // Buscar pistas adicionales en el nombre del archivo
        // Por ejemplo, si el nombre tiene una estructura como "prefix-subfolder-name.ext"
        const nameParts = file.name.split("-");
        if (nameParts.length > 2) {
          // Últimas partes podrían ser identificadores de categoría/carpeta
          // Excluir la extensión si existe
          const lastPart = nameParts[nameParts.length - 1].split(".")[0].trim();
          if (lastPart.length > 1 && !folderHints.includes(lastPart)) {
            // Verificar que no sea solo un número (podría ser un contador)
            if (isNaN(Number(lastPart))) {
              folderHints.push(lastPart);
            }
          }
        }

        // Si tenemos al menos una carpeta, registrarla
        if (folderHints.length > 0) {
          let currentStructure = structureMap;

          folderHints.forEach((folderName) => {
            if (!currentStructure[folderName]) {
              currentStructure[folderName] = {
                files: [],
                subfolders: {},
                isFolder: true,
              };
            }

            // Para la siguiente iteración, movernos a la subcarpeta
            if (folderHints.indexOf(folderName) < folderHints.length - 1) {
              currentStructure = currentStructure[folderName].subfolders;
            } else {
              // Último nivel, agregar el archivo
              currentStructure[folderName].files.push(file);
            }
          });
        } else {
          // Si no tiene carpeta, agregarlo a "Principal"
          if (!structureMap["Principal"]) {
            structureMap["Principal"] = {
              files: [],
              subfolders: {},
              isFolder: false,
            };
          }
          structureMap["Principal"].files.push(file);
        }
      });

      return structureMap;
    };

    // Construir estructura de carpetas analizando metadatos y patrones
    const buildFolderStructure = (files: DriveFile[]): FolderStructure => {
      // Primera aproximación: usar análisis básico
      const basicStructure = analyzeFolderStructure(files);

      // Crear una estructura mejorada
      const enhancedStructure: FolderStructure = {};

      // Colección para registrar todas las posibles carpetas y sus archivos
      const folderRegistry: {
        [key: string]: { files: DriveFile[]; path: string[] };
      } = {};

      // Función para descubrir la estructura completa
      const discoverFullStructure = () => {
        // 1. Registrar todas las rutas posibles desde los metadatos de los archivos
        files.forEach((file) => {
          if (file.mimeType === "application/vnd.google-apps.folder") return;

          // Extraer pistas sobre la estructura de carpetas
          const folderPath: string[] = [];

          // Carpeta principal
          if (file.folder) {
            folderPath.push(file.folder);

            // Registrar esta carpeta
            const folderKey = file.folder;
            if (!folderRegistry[folderKey]) {
              folderRegistry[folderKey] = { files: [], path: [file.folder] };
            }

            // Subcarpeta específica
            if (file.subFolder) {
              folderPath.push(file.subFolder);

              // Registrar esta subcarpeta
              const subfolderKey = `${file.folder}/${file.subFolder}`;
              if (!folderRegistry[subfolderKey]) {
                folderRegistry[subfolderKey] = {
                  files: [],
                  path: [file.folder, file.subFolder],
                };
              }

              // Si hay un nivel adicional (subSubFolder)
              if (file.subSubFolder) {
                folderPath.push(file.subSubFolder);

                // Registrar esta sub-subcarpeta
                const subSubfolderKey = `${subfolderKey}/${file.subSubFolder}`;
                if (!folderRegistry[subSubfolderKey]) {
                  folderRegistry[subSubfolderKey] = {
                    files: [],
                    path: [file.folder, file.subFolder, file.subSubFolder],
                  };
                }
                folderRegistry[subSubfolderKey].files.push(file);
              }
              // Si hay una ruta anidada completa
              else if (file.nestedPath && file.nestedPath.length > 0) {
                // Usar la ruta anidada completa
                const fullPath = file.nestedPath.filter(Boolean); // Eliminar valores vacíos

                if (fullPath.length > 0) {
                  // Construir la clave para esta ruta anidada
                  const nestedKey = fullPath.join("/");

                  if (!folderRegistry[nestedKey]) {
                    folderRegistry[nestedKey] = {
                      files: [],
                      path: fullPath,
                    };
                  }

                  folderRegistry[nestedKey].files.push(file);

                  // Actualizar folderPath para incluir toda la ruta anidada
                  folderPath.length = 0; // Limpiar el array
                  folderPath.push(...fullPath);
                }
              }
              // Si hay un groupTitle diferente a subFolder, podría indicar otro nivel
              else if (file.groupTitle && file.groupTitle !== file.subFolder) {
                // Si el groupTitle parece una "Story", verificar patrones específicos
                if (file.groupTitle.includes("Story")) {
                  // Analizar el contenido para encontrar más pistas sobre la estructura
                  const extraFolders = findExtraFolders(file);
                  if (extraFolders.length > 0) {
                    // Agregar estas subcarpetas adicionales
                    extraFolders.forEach((extraFolder) => {
                      folderPath.push(extraFolder);

                      // Registrar esta subcarpeta adicional
                      const extraKey = `${subfolderKey}/${extraFolder}`;
                      if (!folderRegistry[extraKey]) {
                        folderRegistry[extraKey] = {
                          files: [],
                          path: [...folderPath],
                        };
                      }
                      folderRegistry[extraKey].files.push(file);
                    });
                  } else {
                    // Si no encontramos subcarpetas adicionales, usar el groupTitle como un nivel
                    folderPath.push(file.groupTitle);

                    const groupKey = `${subfolderKey}/${file.groupTitle}`;
                    if (!folderRegistry[groupKey]) {
                      folderRegistry[groupKey] = {
                        files: [],
                        path: [file.folder, file.subFolder, file.groupTitle],
                      };
                    }
                    folderRegistry[groupKey].files.push(file);
                  }
                }
              } else {
                // Agregar el archivo a esta subcarpeta
                folderRegistry[subfolderKey].files.push(file);
              }
            } else {
              // No hay subcarpeta específica, agregar a la carpeta principal
              folderRegistry[folderKey].files.push(file);
            }
          } else {
            // Sin carpeta, agregar a Principal
            if (!folderRegistry["Principal"]) {
              folderRegistry["Principal"] = { files: [], path: ["Principal"] };
            }
            folderRegistry["Principal"].files.push(file);
          }
        });

        // 2. Construir la estructura de carpetas a partir del registro
        Object.entries(folderRegistry).forEach(([key, data]) => {
          let currentLevel = enhancedStructure;

          // Crear la ruta completa
          for (let i = 0; i < data.path.length; i++) {
            const folderName = data.path[i];

            if (!currentLevel[folderName]) {
              currentLevel[folderName] = {
                files: [],
                subfolders: {},
                isFolder: folderName !== "Principal",
              };
            }

            // Si estamos en el último nivel, agregar los archivos
            if (i === data.path.length - 1) {
              // Solo agregar archivos únicos (por ID)
              const existingIds = new Set(
                currentLevel[folderName].files.map((f) => f.id)
              );
              data.files.forEach((file) => {
                if (!existingIds.has(file.id)) {
                  currentLevel[folderName].files.push(file);
                  existingIds.add(file.id);
                }
              });
            } else {
              // No es el último nivel, seguir navegando
              currentLevel = currentLevel[folderName].subfolders;
            }
          }
        });
      };

      // Función para encontrar subcarpetas adicionales basadas en patrones en los datos del archivo
      const findExtraFolders = (file: DriveFile): string[] => {
        const extraFolders: string[] = [];

        // Estrategia completamente dinámica para detectar subcarpetas
        const possibleFolderSources = [
          // Verificar si hay información en campos de metadatos
          file.category,

          // Verificar información de subcarpetas anidadas
          file.subSubFolder,

          // Si hay una ruta anidada, usar todos sus componentes
          ...(file.nestedPath || []),

          // Verificar si hay información en el nombre que podría indicar una subcarpeta
          // Dividir por delimitadores comunes
          ...file.name.split(/[-_\.]/),

          // Si hay algún tag o etiqueta en el nombre entre paréntesis
          ...(file.name.match(/\(([^)]+)\)/g) || []).map((m) =>
            m.replace(/[()]/g, "")
          ),
        ].filter(Boolean); // Eliminar valores undefined/null/empty

        // Filtrar candidatos válidos para carpetas (evitar valores muy largos o muy cortos)
        possibleFolderSources.forEach((folderCandidate) => {
          if (typeof folderCandidate === "string") {
            const normalized = folderCandidate.trim();
            // Considerar como posible subcarpeta si tiene longitud razonable (no muy corta ni muy larga)
            if (normalized.length >= 2 && normalized.length <= 20) {
              // Evitar incluir extensiones de archivo comunes
              if (!/\.(jpg|jpeg|png|gif|pdf|doc|mp4|mov)$/i.test(normalized)) {
                // Evitar números solos
                if (!/^\d+$/.test(normalized)) {
                  extraFolders.push(normalized);
                }
              }
            }
          }
        });

        return extraFolders;
      };

      // Ejecutar el descubrimiento completo
      discoverFullStructure();

      // Si no hay una estructura mejorada, usar la básica
      if (Object.keys(enhancedStructure).length === 0) {
        return basicStructure;
      }

      // Verificar estructuras faltantes e inferir de forma dinámica
      const inferMissingStructures = () => {
        // Recorrer todas las carpetas principales
        Object.keys(enhancedStructure).forEach((mainFolder) => {
          const mainFolderObj = enhancedStructure[mainFolder];
          const subfolders = Object.keys(mainFolderObj.subfolders);

          // Si hay subfolderes, buscar patrones similares
          if (subfolders.length > 1) {
            // Agrupar subfolderes por patrones similares
            const folderGroups: { [pattern: string]: string[] } = {};

            subfolders.forEach((subfolder) => {
              // Detectar patrones como "prefijo + número" (ej: "Story 1", "Story 2")
              const match = subfolder.match(/^(.*?)(\d+)(.*)$/);

              if (match) {
                // Extraer el patrón común
                const [_, prefix, number, suffix] = match;
                const pattern = `${prefix}#${suffix}`;

                if (!folderGroups[pattern]) {
                  folderGroups[pattern] = [];
                }
                folderGroups[pattern].push(subfolder);
              }
            });

            // Para cada grupo de patrones similares, buscar subcarpetas y estructuras similares
            Object.entries(folderGroups).forEach(
              ([pattern, matchingFolders]) => {
                if (matchingFolders.length >= 2) {
                  // Ordenar las carpetas por número
                  matchingFolders.sort((a, b) => {
                    const numA = parseInt(a.match(/\d+/)?.[0] || "0");
                    const numB = parseInt(b.match(/\d+/)?.[0] || "0");
                    return numA - numB;
                  });

                  // Buscar cualquier número faltante en la secuencia
                  for (let i = 0; i < matchingFolders.length - 1; i++) {
                    const current = parseInt(
                      matchingFolders[i].match(/\d+/)?.[0] || "0"
                    );
                    const next = parseInt(
                      matchingFolders[i + 1].match(/\d+/)?.[0] || "0"
                    );

                    // Si hay un hueco en la secuencia, crear carpetas intermedias
                    if (next - current > 1) {
                      for (
                        let missing = current + 1;
                        missing < next;
                        missing++
                      ) {
                        // Crear el nombre para la carpeta faltante
                        const missingName = pattern.replace(
                          "#",
                          missing.toString()
                        );

                        // Si esta carpeta no existe, crearla con la misma estructura que sus similares
                        if (!mainFolderObj.subfolders[missingName]) {
                          // Usar la estructura de la carpeta existente con el número más bajo como plantilla
                          const templateFolder =
                            mainFolderObj.subfolders[matchingFolders[0]];

                          // Crear carpeta con la misma estructura
                          mainFolderObj.subfolders[missingName] = {
                            files: [],
                            subfolders: {},
                            isFolder: true,
                          };

                          // Copiar estructura de subcarpetas de forma recursiva
                          const copySubfolderStructure = (
                            source: FolderContent,
                            target: FolderContent
                          ) => {
                            Object.keys(source.subfolders).forEach(
                              (subfolder) => {
                                target.subfolders[subfolder] = {
                                  files: [],
                                  subfolders: {},
                                  isFolder: true,
                                };

                                // Recursión para niveles más profundos
                                copySubfolderStructure(
                                  source.subfolders[subfolder],
                                  target.subfolders[subfolder]
                                );
                              }
                            );
                          };

                          // Copiar la estructura de subcarpetas
                          copySubfolderStructure(
                            templateFolder,
                            mainFolderObj.subfolders[missingName]
                          );
                        }
                      }
                    }
                  }
                }
              }
            );
          }
        });
      };

      // Ejecutar la inferencia de estructuras faltantes
      inferMissingStructures();

      return enhancedStructure;
    };

    // Primera pasada: registrar las carpetas
    files.forEach((file) => {
      if (file.folder) {
        const path = [file.folder];

        if (file.subFolder) {
          path.push(file.subFolder);
        }

        // Si existe alguna ruta, asegurar que exista la estructura
        if (path.length > 0) {
          ensurePath(path);
        }
      }
    });

    // Usar el sistema mejorado para construir la estructura final
    return buildFolderStructure(files);
  };

  // Función para mostrar/ocultar depuración
  const toggleDebug = () => {
    setDebug(!debug);
  };

  // Si no hay archivos, mostrar mensaje
  if (!files || files.length === 0) {
    return (
      <div className='my-8 text-center text-muted-foreground'>
        No se encontraron archivos
      </div>
    );
  }

  // Si no hay carpetas estructuradas, mostrar un mensaje de carga
  if (Object.keys(folderStructure).length === 0) {
    return (
      <div className='my-8 text-center text-muted-foreground'>
        Organizando archivos...
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Botón de depuración (solo en desarrollo) */}
      {process.env.NODE_ENV !== "production" && (
        <button
          onClick={toggleDebug}
          className='mb-4 px-3 py-1 bg-muted text-muted-foreground text-xs rounded'
        >
          {debug ? "Ocultar Debug" : "Mostrar Debug"}
        </button>
      )}

      {/* Información de depuración */}
      {debug && (
        <div className='mb-6 p-4 bg-muted text-xs overflow-auto max-h-60 rounded'>
          <pre>{JSON.stringify(folderStructure, null, 2)}</pre>
        </div>
      )}

      {/* Pestañas principales para carpetas */}
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full'
      >
        <div className='flex justify-center w-full'>
          <TabsList className='[&>[data-state=active]]:bg-[#B9F264] [&>[data-state=active]]:font-semibold rounded-none flex flex-wrap h-full bg-transparent'>
            {Object.keys(folderStructure).map((folderName) => (
              <TabsTrigger
                key={`tab-${folderName}`}
                value={folderName}
                className='rounded-none bg-zinc-700 text-white border-none data-[state=active]:bg-[#B9F264] data-[state=active]:text-black'
              >
                <span className='flex items-center gap-2'>
                  {folderStructure[folderName].isFolder ? (
                    <FolderIcon className='h-4 w-4' />
                  ) : (
                    <FileIcon className='h-4 w-4' />
                  )}
                  <span>{folderName}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Contenido para cada carpeta principal */}
        {Object.entries(folderStructure).map(([folderName, folderContent]) => (
          <TabsContent
            key={`tab-content-${folderName}`}
            value={folderName}
            className='mt-6'
          >
            <h2 className='text-center text-2xl font-semibold mb-6'>
              {folderName}
            </h2>

            {/* Renderizar usando el componente recursivo */}
            <FolderTabs
              folderContent={folderContent}
              folderName={folderName}
              level={0}
              onPreviewClick={onPreviewClick}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
