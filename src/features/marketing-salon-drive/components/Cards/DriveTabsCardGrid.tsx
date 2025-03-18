"use client";
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { FolderOpenIcon } from "lucide-react";

import { DriveFile } from "../../types/drive";
import { DriveCardGrid } from "./DriveCardGrid";
import { cn } from "@/src/lib/utils/utils";

// Interfaz FolderContent actualizada para soportar subcarpetas y grupos de forma recursiva
interface FolderContent {
  files: DriveFile[];
  subfolders: { [key: string]: FolderContent };
  isFolder: boolean;
  isGroup?: boolean;
  groupTitle?: string;
  originalName?: string;
  groupFolders?: FolderContent[];  // Nueva propiedad para almacenar carpetas de grupo
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

// Interfaz para manejadores de carpetas
interface FolderHandler {
  canHandle(folderName: string): boolean;
  process(folderName: string, content: FolderContent): {
    displayName: string;
    processedContent: FolderContent;
  };
}

// Factory para crear el manejador apropiado de carpetas
class FolderHandlerFactory {
  private handlers: FolderHandler[] = [];

  constructor() {
    // Registro de handlers de carpetas
    this.registerHandler(new DefaultFolderHandler());
    this.registerHandler(new GroupFolderHandler());
    // Se pueden registrar más handlers aquí
  }

  registerHandler(handler: FolderHandler) {
    this.handlers.push(handler);
  }

  getHandler(folderName: string): FolderHandler {
    for (const handler of this.handlers) {
      if (handler.canHandle(folderName)) {
        return handler;
      }
    }
    // Si ningún handler específico puede manejar el nombre, usamos el predeterminado
    return this.handlers[0]; // DefaultFolderHandler
  }
}

// Handler predeterminado para carpetas sin prefijo especial
class DefaultFolderHandler implements FolderHandler {
  canHandle(folderName: string): boolean {
    return true; // Maneja cualquier carpeta sin prefijo especial
  }

  process(folderName: string, content: FolderContent) {
    return { displayName: folderName, processedContent: content };
  }
}

// Handler para carpetas de grupo (group:, groupTitle:, grupo:)
class GroupFolderHandler implements FolderHandler {
  canHandle(folderName: string): boolean {
    const prefixes = ["groupTitle:", "group:", "grupo:"];
    const lowerName = folderName.toLowerCase();
    return prefixes.some(prefix => lowerName.startsWith(prefix.toLowerCase()));
  }

  process(folderName: string, content: FolderContent) {
    const prefixes = ["groupTitle:", "group:", "grupo:"];
    const lowerName = folderName.toLowerCase();
    
    let prefix = "";
    for (const p of prefixes) {
      if (lowerName.startsWith(p.toLowerCase())) {
        prefix = p;
        break;
      }
    }
    
    const displayName = folderName.slice(prefix.length).trim();
    
    // Marcar este contenido como un grupo para procesamiento especial
    const processedContent = {
      ...content,
      isGroup: true,
      groupTitle: displayName,
      originalName: folderName
    };
    
    return { displayName, processedContent };
  }
}

// Eliminada la lógica de Excel para simplificar el código

// Constructor de la estructura de carpetas
class FolderStructureBuilder {
  private folderHandlerFactory: FolderHandlerFactory;
  
  constructor() {
    this.folderHandlerFactory = new FolderHandlerFactory();
  }
  
  buildStructure(files: DriveFile[]): FolderStructure {
    // Crear estructura base
    const structure = this.analyzeBasicStructure(files);
    
    // Procesar prefijos de carpetas (primera fase)
    const processedStructure = this.processFolderPrefixes(structure);
    
    // Segunda fase: extraer los groupTitle de tabs a secciones
    return this.extractGroupTitlesFromTabs(processedStructure);
  }
  
  private extractGroupTitlesFromTabs(structure: FolderStructure): FolderStructure {
    const result: FolderStructure = {};
    
    // Procesar cada carpeta de nivel superior
    for (const [folderName, folderContent] of Object.entries(structure)) {
      // Si la carpeta actual es un grupo, incluirla directamente
      if (folderContent.isGroup) {
        result[folderName] = folderContent;
        continue;
      }
      
      // Copiar la carpeta actual
      result[folderName] = {
        files: [...folderContent.files],
        subfolders: {},
        isFolder: folderContent.isFolder,
      };
      
      // Examinar subfolders para detectar grupos
      const groupFolders: FolderContent[] = [];
      
      // Procesar cada subcarpeta
      for (const [subFolderName, subFolderContent] of Object.entries(folderContent.subfolders)) {
        // Si la subcarpeta es un grupo o comienza con "groupTitle:"
        if (
          subFolderContent.isGroup || 
          subFolderName.toLowerCase().startsWith("grouptitle:") ||
          subFolderName.toLowerCase().startsWith("group:")
        ) {
          // Preparar el contenido del grupo
          const groupContent = {
            ...subFolderContent,
            isGroup: true,
            groupTitle: subFolderContent.groupTitle || subFolderName.split(":")[1]?.trim() || subFolderName
          };
          
          // Aplicar recursivamente la extracción de grupos a las subcarpetas del grupo
          if (Object.keys(groupContent.subfolders).length > 0) {
            groupContent.subfolders = this.extractGroupTitlesFromSubfolders(groupContent.subfolders);
          }
          
          // Agregar a la lista de grupos
          groupFolders.push(groupContent);
        } else {
          // Las subcarpetas normales se mantienen igual pero se procesan recursivamente
          result[folderName].subfolders[subFolderName] = {
            ...subFolderContent,
            subfolders: this.extractGroupTitlesFromSubfolders(subFolderContent.subfolders)
          };
        }
      }
      
      // Agregar todos los grupos como propiedades especiales
      if (groupFolders.length > 0) {
        result[folderName].groupFolders = groupFolders;
      }
    }
    
    return result;
  }
  
  // Procesar recursivamente subcarpetas
  private extractGroupTitlesFromSubfolders(subfolders: { [key: string]: FolderContent }): { [key: string]: FolderContent } {
    const result: { [key: string]: FolderContent } = {};
    
    for (const [subFolderName, subFolderContent] of Object.entries(subfolders)) {
      // Si esta subcarpeta es un grupo, no la incluimos en el resultado
      if (
        subFolderContent.isGroup || 
        subFolderName.toLowerCase().startsWith("grouptitle:") ||
        subFolderName.toLowerCase().startsWith("group:")
      ) {
        continue;
      }
      
      // Copiar la subcarpeta
      result[subFolderName] = {
        ...subFolderContent,
        subfolders: this.extractGroupTitlesFromSubfolders(subFolderContent.subfolders)
      };
      
      // Examinar sus subcarpetas para detectar grupos
      const groupFolders: FolderContent[] = [];
      
      // Procesar cada sub-subcarpeta
      for (const [subSubFolderName, subSubFolderContent] of Object.entries(subFolderContent.subfolders)) {
        if (
          subSubFolderContent.isGroup || 
          subSubFolderName.toLowerCase().startsWith("grouptitle:") ||
          subSubFolderName.toLowerCase().startsWith("group:")
        ) {
          // Preparar el contenido del grupo
          const groupContent = {
            ...subSubFolderContent,
            isGroup: true,
            groupTitle: subSubFolderContent.groupTitle || subSubFolderName.split(":")[1]?.trim() || subSubFolderName
          };
          
          // Agregar a la lista de grupos
          groupFolders.push(groupContent);
        }
      }
      
      // Agregar todos los grupos como propiedades especiales
      if (groupFolders.length > 0) {
        result[subFolderName].groupFolders = groupFolders;
      }
    }
    
    return result;
  }
  
  private analyzeBasicStructure(files: DriveFile[]): FolderStructure {
    const structure: FolderStructure = {};
    
    // Función auxiliar para garantizar una ruta de carpetas
    const ensurePath = (path: string[], root: FolderStructure = structure): FolderContent => {
      if (path.length === 0) {
        // En lugar de null, devolvemos una carpeta vacía cuando no hay ruta
        return {
          files: [],
          subfolders: {},
          isFolder: false
        };
      }
      
      const folderName = path[0];
      if (!root[folderName]) {
        root[folderName] = {
          files: [],
          subfolders: {},
          isFolder: true
        };
      }
      
      if (path.length === 1) {
        return root[folderName];
      }
      
      return ensurePath(path.slice(1), root[folderName].subfolders);
    };
    
    // Primera pasada: agrupar archivos por carpetas
    files.forEach(file => {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        return; // Ignorar carpetas como archivos
      }
      
      // Determinar la ruta de carpetas para este archivo
      const folderPath: string[] = [];
      
      if (file.folder) {
        folderPath.push(file.folder);
        
        if (file.subFolder) {
          folderPath.push(file.subFolder);
          
          if (file.subSubFolder) {
            folderPath.push(file.subSubFolder);
          } else if (file.nestedPath && file.nestedPath.length > 0) {
            // Usar ruta anidada completa en lugar de subFolder/subSubFolder
            folderPath.length = 0; // Reiniciar el array
            file.nestedPath.filter(Boolean).forEach(part => folderPath.push(part));
          }
        }
      }
      
      // Si no tiene carpeta, usar "Principal"
      if (folderPath.length === 0) {
        if (!structure["Principal"]) {
          structure["Principal"] = {
            files: [],
            subfolders: {},
            isFolder: false
          };
        }
        structure["Principal"].files.push(file);
      } else {
        // Asegurar que la ruta de carpetas exista
        const targetFolder = ensurePath(folderPath);
        targetFolder.files.push(file);
      }
    });
    
    // Organizar grupos basados en patrones
    this.organizeGroupsByPatterns(structure);
    
    return structure;
  }
  
  private organizeGroupsByPatterns(structure: FolderStructure): void {
    // Analizar cada carpeta principal
    Object.keys(structure).forEach(mainFolder => {
      const mainContent = structure[mainFolder];
      
      // Buscar patrones en las subcarpetas
      const subfolderNames = Object.keys(mainContent.subfolders);
      
      // Agrupar subcarpetas por patrones similares
      const patternGroups: { [pattern: string]: string[] } = {};
      
      subfolderNames.forEach(name => {
        // Detectar patrones como "prefijo + número" (ej: "Story 1", "Story 2")
        const match = name.match(/^(.*?)(\d+)(.*)$/);
        
        if (match) {
          const [_, prefix, num, suffix] = match;
          const pattern = `${prefix}#${suffix}`;
          
          if (!patternGroups[pattern]) {
            patternGroups[pattern] = [];
          }
          
          patternGroups[pattern].push(name);
        }
      });
      
      // Organizar subcarpetas basadas en patrones detectados
      Object.entries(patternGroups).forEach(([pattern, folders]) => {
        if (folders.length >= 2) {
          // Ordenar por número
          folders.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || "0");
            const numB = parseInt(b.match(/\d+/)?.[0] || "0");
            return numA - numB;
          });
          
          // Si se detectó un patrón con múltiples carpetas, podríamos 
          // crear una nueva carpeta agrupadora si fuera necesario
        }
      });
    });
  }
  
  private processFolderPrefixes(structure: FolderStructure): FolderStructure {
    const processedStructure: FolderStructure = {};
    
    // Procesar cada carpeta con el manejador adecuado
    for (const [folderName, content] of Object.entries(structure)) {
      const handler = this.folderHandlerFactory.getHandler(folderName);
      const { displayName, processedContent } = handler.process(folderName, content);
      
      // Procesar subcarpetas recursivamente
      if (Object.keys(processedContent.subfolders).length > 0) {
        processedContent.subfolders = this.processFolderPrefixes(processedContent.subfolders);
      }
      
      processedStructure[displayName] = processedContent;
    }
    
    return processedStructure;
  }
}

// Función auxiliar mejorada para verificar si una carpeta está realmente vacía
function isFolderEmpty(folderContent: FolderContent): boolean {
  // Verificación defensiva para objeto completo
  if (!folderContent) {
    return true;
  }
  
  // 1. Verificar archivos
  if (folderContent.files && folderContent.files.length > 0) {
    return false;
  }
  
  // 2. Verificar grupos
  const groupFolders = folderContent.groupFolders || [];
  if (groupFolders.length > 0) {
    // Solo considera no vacío si al menos un grupo tiene archivos
    for (const group of groupFolders) {
      if (group.files && group.files.length > 0) {
        return false;
      }
      
      // Verificar recursivamente subcarpetas dentro del grupo
      if (group.subfolders) {
        for (const subfolderContent of Object.values(group.subfolders)) {
          if (!isFolderEmpty(subfolderContent)) {
            return false;
          }
        }
      }
      
      // Verificar grupos anidados
      if (group.groupFolders && group.groupFolders.length > 0) {
        for (const nestedGroup of group.groupFolders) {
          if (!isFolderEmpty(nestedGroup)) {
            return false;
          }
        }
      }
    }
  }
  
  // 3. Verificar subcarpetas
  const subfolders = folderContent.subfolders || {};
  for (const subfolderContent of Object.values(subfolders)) {
    if (!isFolderEmpty(subfolderContent)) {
      return false;
    }
  }
  
  // Si llegamos aquí, la carpeta está completamente vacía
  return true;
}

// Componente para renderizar carpetas de forma recursiva
interface FolderTabsProps {
  folderContent: FolderContent & { 
    isGroup?: boolean;
    groupTitle?: string;
    originalName?: string;
  };
  folderName: string;
  level: number;
  onPreviewClick?: (file: DriveFile) => void;
}

function FolderTabs({
  folderContent,
  folderName,
  level,
  onPreviewClick,
}: FolderTabsProps) {
  // Crear un ID base único para este componente de pestañas
  const tabsId = `tabs-${level}-${folderName.replace(/\s+/g, '-').toLowerCase()}`;
  
  const [activeTab, setActiveTab] = useState<string>("Principal");

  // Separar subcarpetas normales y grupos
  const normalSubfolders = Object.keys(folderContent.subfolders);
  // Usar los grupos ya procesados y extraídos en la fase de construcción
  const groupFolders = folderContent.groupFolders || [];

  useEffect(() => {
    // Siempre establecer 'Principal' como la pestaña predeterminada
    setActiveTab("Principal");
  }, [folderContent]);

  // Si no hay subcarpetas normales ni grupos, mostrar solo archivos
  if (normalSubfolders.length === 0 && !groupFolders.length) {
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

  return (
    <Tabs
      id={tabsId}
      defaultValue="Principal"
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
          {/* Tab para archivos de la carpeta actual y grupos */}
          <TabsTrigger
            key={`${tabsId}-principal`}
            value="Principal"
            className='rounded-none bg-zinc-700 text-white border-none data-[state=active]:bg-[#B9F264] data-[state=active]:text-black'
          >
            Principal
          </TabsTrigger>

          {/* Tabs para cada subcarpeta normal */}
          {normalSubfolders.map((subfolder) => (
            <TabsTrigger
              key={`${tabsId}-${subfolder}`}
              value={subfolder}
              className='rounded-none bg-zinc-700 text-white border-none data-[state=active]:bg-[#B9F264] data-[state=active]:text-black'
            >
              {subfolder}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Contenido para archivos de la carpeta actual y grupos */}
      <TabsContent 
        value="Principal" 
        key={`${tabsId}-content-principal`} 
        className='w-full'
      >
        {/* Archivos de la carpeta actual */}
        {folderContent.files.length > 0 && (
          <div className="mb-8">
            <div className='flex items-center mb-4'>
              <h4 className='w-full text-center text-lg font-bold'>
                Archivos en {level === 0 ? folderName : `${folderName}`}
              </h4>
            </div>

            <DriveCardGrid
              files={folderContent.files}
              onPreviewClick={onPreviewClick}
            />
          </div>
        )}

        {/* Grupos como secciones individuales */}
        {groupFolders.map((group, index) => (
          <div key={`${tabsId}-group-${index}`} className="mb-8">
            <div className="flex items-center mb-4">
              <FolderOpenIcon className="h-5 w-5 mr-2 text-[#B9F264]" />
              <h4 className="text-lg font-medium">{group.groupTitle}</h4>
            </div>
            
            {/* Contenido del grupo */}
            {group.files.length > 0 && (
              <DriveCardGrid
                files={group.files}
                onPreviewClick={onPreviewClick}
              />
            )}
            
            {/* Si el grupo tiene subcarpetas o sus propios grupos, renderizarlos recursivamente */}
            {(Object.keys(group.subfolders).length > 0 || (group.groupFolders && group.groupFolders.length > 0)) && (
              <div className="ml-4 mt-4 border-l-2 border-[#B9F264] pl-4">
                <FolderTabs
                  folderContent={group}
                  folderName={group.groupTitle || ""}
                  level={level + 1}
                  onPreviewClick={onPreviewClick}
                />
              </div>
            )}
          </div>
        ))}
      </TabsContent>

      {/* Contenido para cada subcarpeta normal - Renderizado recursivo */}
      {normalSubfolders.map((subfolderName) => (
        <TabsContent
          key={`${tabsId}-content-${subfolderName}`}
          value={subfolderName}
          className='w-full'
        >
          <div className='flex items-center mb-4'>
            <h4 className='w-full text-center text-lg font-bold'>
              {subfolderName}
            </h4>
          </div>

          {/* Llamada recursiva para renderizar subcarpetas */}
          <FolderTabs
            folderContent={folderContent.subfolders[subfolderName]}
            folderName={subfolderName}
            level={level + 1}
            onPreviewClick={onPreviewClick}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Componente principal
export function DriveTabsCardGrid({
  files = [],
  selectedTab,
  onPreviewClick,
}: DriveTabsCardGridProps) {
  const [activeTab, setActiveTab] = useState<string>("Principal");
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({});
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    if (files.length > 0) {
      const structureBuilder = new FolderStructureBuilder();
      const structure = structureBuilder.buildStructure(files);
      console.log("Estructura de carpetas original:", structure);
      
      // Filtrar carpetas vacías, incluidas las carpetas "Principal" vacías
      const filteredStructure: FolderStructure = {};
      Object.entries(structure).forEach(([folderName, content]) => {
        if (!isFolderEmpty(content)) {
          filteredStructure[folderName] = content;
        } else {
          console.log(`Carpeta vacía eliminada: ${folderName}`);
        }
      });
      
      console.log("Estructura de carpetas filtrada:", filteredStructure);
      setFolderStructure(filteredStructure);

      // Determinar qué tab seleccionar
      const folderKeys = Object.keys(filteredStructure);
      
      // Si hay un tab seleccionado y existe, usarlo
      if (selectedTab && filteredStructure[selectedTab]) {
        setActiveTab(selectedTab);
      } 
      // Si hay una carpeta "Principal" no vacía, seleccionarla
      else if (filteredStructure["Principal"]) {
        setActiveTab("Principal");
      }
      // De lo contrario, usar la primera carpeta disponible
      else if (folderKeys.length > 0) {
        setActiveTab(folderKeys[0]);
      }
    } else {
      // Si no hay archivos, establecer una estructura vacía
      setFolderStructure({});
    }
  }, [files, selectedTab]);

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
        No se encontraron archivos para mostrar
      </div>
    );
  }

  // ID único para el componente de tabs principal
  const mainTabsId = "main-tabs";
  
  // Si solo hay una carpeta, mostrar su contenido directamente sin tabs
  if (Object.keys(folderStructure).length === 1) {
    const folderName = Object.keys(folderStructure)[0];
    const folderContent = folderStructure[folderName];
    
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
        id={mainTabsId}
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full'
      >
        <div className='flex justify-center w-full'>
          <TabsList className='[&>[data-state=active]]:bg-[#B9F264] [&>[data-state=active]]:font-semibold rounded-none flex flex-wrap h-full bg-transparent'>
            {Object.keys(folderStructure).map((folderName) => (
              <TabsTrigger
                key={`${mainTabsId}-tab-${folderName}`}
                value={folderName}
                className='rounded-none bg-zinc-700 text-white border-none data-[state=active]:bg-[#B9F264] data-[state=active]:text-black'
              >
                <span className='flex items-center gap-2'>
                  <span>{folderName}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Contenido para cada carpeta principal */}
        {Object.entries(folderStructure).map(([folderName, folderContent]) => (
          <TabsContent
            key={`${mainTabsId}-content-${folderName}`}
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