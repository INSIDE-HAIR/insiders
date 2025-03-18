import { NextResponse } from "next/server";
import { GoogleDriveService } from "@/src/features/marketing-salon-drive/services/drive/GoogleDriveService";
import { HierarchyItem } from "@/src/features/marketing-salon-drive/types/drive";

/**
 * ESTRUCTURA JERÁRQUICA DE DATOS
 *
 * La jerarquía principal se organiza de la siguiente manera:
 *
 * PatternSection (carpetas principales)
 * └── content[] (contenedores de segundo nivel)
 *     ├── ContentItem (subcarpetas/grupos)
 *     │   └── content[] (elementos dentro de grupos)
 *     │       └── ContentItem (archivos/elementos individuales)
 *     │
 *     └── ContentItem (elementos directos)
 *
 * No hay límite de profundidad. La estructura puede anidarse según sea necesario.
 */

/**
 * Configuración de disponibilidad temporal para un elemento
 * Permite programar cuándo un elemento debe estar visible/disponible
 */
interface AvailableConfig {
  /** Fecha y hora de inicio de disponibilidad (formato ISO) o null para siempre disponible */
  startDateTime: string | null;
  /** Fecha y hora de fin de disponibilidad (formato ISO) o null para no tener fecha de expiración */
  endDateTime: string | null;
}

/**
 * Elemento de contenido - Puede representar cualquier tipo de contenido en la jerarquía
 * Incluye carpetas, archivos, grupos, y elementos UI
 */
interface ContentItem {
  /** Identificador único del elemento */
  id: string;
  /** Orden de aparición (menor número = mayor prioridad) */
  order: number;
  /**
   * Tipo de contenido. Valores posibles incluyen:
   * - "file": Archivo genérico
   * - "image": Imagen
   * - "video": Video
   * - "document": Documento
   * - "presentation": Presentación
   * - "tabs": Conjunto de pestañas
   * - "tab": Pestaña individual
   * - "button": Elemento interactivo
   * - "link": Enlace a otro contenido
   * - "section": Sección de contenido
   * - "card": Tarjeta de contenido
   * Define la estructura jerárquica y comportamiento del elemento
   */
  type: string | null;
  /** Título o nombre del elemento (opcional para elementos sin título) */
  title?: string;
  /**
   * Clase CSS para visualización
   * Siempre inicia como "default" y puede cambiarse a valores específicos
   * para aplicar estilos CSS personalizados
   */
  classType?: string;
  /** URL al contenido (para elementos vinculados) */
  url?: string;
  /**
   * Contenido anidado dentro de este elemento
   * Permite crear estructuras jerárquicas de cualquier profundidad
   */
  content?: ContentItem[];
  /** Códigos de elementos hijos relacionados (para referencias cruzadas) */
  childrensCode?: string[];
  /** Tipo de elementos hijos relacionados */
  childrensType?: string;
  /** Indica si el elemento está activo/visible */
  active: boolean;
  /** Configuración de disponibilidad temporal */
  available: AvailableConfig;
  /** Lista de roles con acceso a este elemento */
  auth: string[];
  /** Datos originales del elemento (para referencia) */
  originalData?: any;
}

/**
 * Sección principal del patrón - Contenedor de más alto nivel
 * Representa típicamente una sección completa o página de la UI
 */
interface PatternSection {
  /** Identificador único de la sección */
  id: string;
  /** Título de la sección */
  title: string;
  /** Orden de aparición (menor número = mayor prioridad) */
  order: number;
  /**
   * Tipo de estructura jerárquica
   * Ejemplos: "sidebar", "section", "tab", etc.
   * Define el comportamiento y posición en la jerarquía
   */
  type: string;
  /**
   * Clase CSS para visualización
   * Siempre inicia como "default" y puede cambiarse a valores específicos
   * para aplicar estilos CSS personalizados
   */
  classType: string;
  /**
   * Contenido de la sección
   * Contiene elementos ContentItem que pueden anidarse a cualquier profundidad
   */
  content: ContentItem[];
  /** Indica si la sección está activa/visible */
  active: boolean;
  /** Configuración de disponibilidad temporal */
  available: AvailableConfig;
  /** Lista de roles con acceso a esta sección */
  auth: string[];
}

/**
 * @swagger
 * /api/marketing-salon-drive/folder/{id}/cards:
 *   get:
 *     description: Obtiene archivos directamente de una carpeta específica por su ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de Google Drive de la carpeta
 *     responses:
 *       200:
 *         description: Archivos y estructura para la UI
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 */

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`API: GET /api/marketing-salon-drive/folder/${params.id}/cards`);

  // Capturar el ID de la carpeta desde los parámetros de la ruta
  const folderId = params.id;

  if (!folderId) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required parameters",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  try {
    // Inicializar el servicio de Google Drive
    const driveService = new GoogleDriveService();

    // Obtener archivos de la carpeta por su ID directamente
    const files = await driveService.getFilesByFolderId(folderId);

    // Guardar datos sin procesar
    const rawData = {
      files: files,
      folderId,
    };

    // Procesar archivos para la estructura tradicional (UI existente)
    const organizedContent = processFilesForUI(files, folderId);

    // Procesar archivos para la nueva estructura
    const processedContent = processFilesForNewStructure(files, folderId);

    // Obtener información de la carpeta
    const folderInfo = await driveService.getFolderInfo(folderId);
    const folderName = folderInfo?.name || `Folder-${folderId}`;

    // Crear la estructura jerárquica
    const hierarchyMap = createHierarchyMap(files, folderId, folderName);

    return NextResponse.json({
      success: true,
      data: organizedContent,
      rawData: rawData,
      processedData: processedContent,
      metadata: {
        year: "direct",
        campaign: "direct",
        client: folderId,
        folderName: folderName,
        totalFiles: files.length,
        lastUpdated: new Date().toISOString(),
        categoryStats: countFilesByCategory(files),
      },
      hierarchyMap: hierarchyMap,
    });
  } catch (error) {
    console.error(`Error al procesar la carpeta ${folderId}:`, error);
    let errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Organiza los archivos para la UI existente
 */
function processFilesForUI(files: any[], folderId: string) {
  const groups = new Map();

  // Agrupar archivos por carpeta/subcarpeta para la UI
  files.forEach((file) => {
    const groupKey =
      file.groupTitle || file.subFolder || file.folder || "Principal";

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }

    groups.get(groupKey).push(file);
  });

  // Crear tabs para cada grupo
  const tabs = Array.from(groups.entries()).map(
    ([groupName, groupFiles], index) => {
      return {
        id: `tab-${folderId}-${groupName.toLowerCase().replace(/\W+/g, "-")}`,
        name: groupName,
        type: index === 0 ? "main" : "secondary",
        content: {
          files: groupFiles,
          subTabs: [],
          groups: [],
        },
      };
    }
  );

  // Si no hay tabs, crear uno por defecto
  if (tabs.length === 0) {
    tabs.push({
      id: `tab-${folderId}-principal`,
      name: "Principal",
      type: "main",
      content: {
        files: [],
        subTabs: [],
        groups: [],
      },
    });
  }

  // Estructura final para la UI
  return {
    sidebar: [
      {
        id: `sidebar-${folderId}`,
        name: `Carpeta: ${folderId}`,
        type: "sidebar-item",
        content: {
          tabs,
        },
      },
    ],
    metadata: {
      folderId,
      directAccess: true,
    },
  };
}

/**
 * Procesa los archivos para la nueva estructura aprovechando prefijos y sufijos
 * Genera una estructura jerárquica clara sin límite de profundidad
 */
function processFilesForNewStructure(
  files: any[],
  folderId: string
): PatternSection[] {
  // Array para guardar todas las secciones
  const sections: PatternSection[] = [];

  // Map para organizar archivos por carpeta
  const filesByFolder = new Map<string, any[]>();

  // Agrupar archivos por carpeta (primer nivel)
  files.forEach((file) => {
    const folder = file.folder || "Principal";

    if (!filesByFolder.has(folder)) {
      filesByFolder.set(folder, []);
    }

    filesByFolder.get(folder)!.push(file);
  });

  // Procesar cada carpeta como una sección
  filesByFolder.forEach((folderFiles, folderName) => {
    // Extraer prefijos para orden y tipo
    const {
      name: cleanName,
      order: sectionOrder,
      type: sectionType,
      isHidden: sectionHidden,
    } = parseNameWithPrefixSuffix(folderName);

    // Crear la sección
    const section: PatternSection = {
      id: `section-${folderName.toLowerCase().replace(/\W+/g, "-")}`,
      title: cleanName,
      order: sectionOrder,
      // Usar el tipo para la estructura jerárquica en lugar de classType
      type: sectionType || "sidebar",
      classType: "default", // Siempre default inicialmente
      active: !sectionHidden,
      available: {
        startDateTime: null,
        endDateTime: null,
      },
      auth: [],
      content: [], // Siempre inicializar como array para mantener consistencia
    };

    // Map para organizar archivos por subcarpeta dentro de esta carpeta
    const filesBySubfolder = new Map<string, any[]>();

    // Agrupar archivos por subcarpeta (segundo nivel)
    folderFiles.forEach((file) => {
      const subFolder = file.subFolder || "default";

      if (!filesBySubfolder.has(subFolder)) {
        filesBySubfolder.set(subFolder, []);
      }

      filesBySubfolder.get(subFolder)!.push(file);
    });

    // Procesar cada subcarpeta como un ContentItem
    filesBySubfolder.forEach((subfolderFiles, subfolderName) => {
      // Extraer prefijos para orden y tipo
      const {
        name: cleanSubName,
        order: groupOrder,
        type: groupType,
        isHidden: groupHidden,
      } = parseNameWithPrefixSuffix(subfolderName);

      // Crear el ContentItem para esta subcarpeta
      const groupItem: ContentItem = {
        id: `group-${subfolderName.toLowerCase().replace(/\W+/g, "-")}`,
        title: cleanSubName,
        order: groupOrder,
        // Usar el tipo para la estructura jerárquica
        type: groupType || "tabs",
        classType: "default", // Siempre default inicialmente
        active: !groupHidden,
        available: {
          startDateTime: null,
          endDateTime: null,
        },
        auth: [],
        content: [], // Siempre inicializar el array de contenido
      };

      // Procesar cada archivo en la subcarpeta
      subfolderFiles.forEach((file) => {
        // Crear un ContentItem para este archivo
        const fileItem = createContentItemFromFile(file);

        // Añadir a la subcarpeta
        groupItem.content!.push(fileItem);
      });

      // Ordenar archivos por order para mantener consistencia
      groupItem.content!.sort((a, b) => a.order - b.order);

      // Añadir a la sección
      section.content.push(groupItem);
    });

    // Ordenar subcarpetas por order
    section.content.sort((a, b) => a.order - b.order);

    // Añadir la sección al array de secciones
    sections.push(section);
  });

  // Ordenar secciones por order
  sections.sort((a, b) => a.order - b.order);

  return sections;
}

/**
 * Crea un ContentItem a partir de un archivo
 * Garantiza que todas las propiedades estén correctamente inicializadas
 */
function createContentItemFromFile(file: any): ContentItem {
  // Extraer prefijos y sufijos para el archivo
  const {
    name: cleanFileName,
    order: fileOrder,
    type: fileType,
    isHidden: fileHidden,
    isNoTitle: noTitle,
    isDark: darkTheme,
  } = parseNameWithPrefixSuffix(file.name);

  // Determinar el tipo de contenido basado en mimeType y prefijos
  // Asegurarnos que el tipo puede ser string o null según la interfaz ContentItem
  const contentTypeValue =
    fileType || getContentTypeFromMimeType(file.mimeType) || "file";
  const contentType: string | null = contentTypeValue;

  // Crear el ContentItem para este archivo
  return {
    id: file.id,
    title: noTitle ? undefined : cleanFileName,
    order: fileOrder,
    // Usar tipo para la estructura jerárquica
    type: contentType,
    // Simplificar classType a "default" o "dark" según corresponda
    classType: darkTheme ? "dark" : "default",
    url: file.transformedUrl?.preview || file.webViewLink,
    active: !fileHidden,
    available: {
      startDateTime: null,
      endDateTime: null,
    },
    auth: [],
    content: [], // Siempre incluir el array de contenido, aunque esté vacío
    originalData: file,
  };
}

/**
 * Extrae información de prefijos y sufijos del nombre
 * Interpreta convenciones de nomenclatura para determinar orden, tipo y estado
 *
 * Convenciones soportadas:
 * - Prefijos de orden: "01_", "1.", "(1)"
 * - Prefijos de tipo: "image_", "video_", "button_", etc.
 * - Sufijos de estado: "_hidden" (oculto), "_notitle" (sin título), "_dark"/"_night" (tema oscuro)
 *
 * @example
 * "01_sidebar_Dashboard" → { name: "Dashboard", order: 1, type: "sidebar", isHidden: false }
 * "button_Login_hidden" → { name: "Login", type: "button", isHidden: true }
 * "image_Hero_notitle" → { name: "Hero", type: "image", isNoTitle: true }
 *
 * @param name Nombre original con posibles prefijos y sufijos
 * @returns Objeto con el nombre limpio y propiedades extraídas
 */
function parseNameWithPrefixSuffix(name: string): {
  name: string;
  order: number;
  type: string | null;
  isHidden: boolean;
  isNoTitle: boolean;
  isDark: boolean;
} {
  // Valor por defecto
  let result = {
    name: name,
    order: 999,
    type: null as string | null,
    isHidden: false,
    isNoTitle: false,
    isDark: false,
  };

  // Si no hay nombre, devolver valores por defecto
  if (!name) return result;

  // Evaluar sufijos
  result.isHidden = /_hidden$/i.test(name);
  result.isNoTitle = /_notitle$/i.test(name);
  result.isDark = /_dark$/i.test(name) || /_night$/i.test(name);

  // Limpiar nombre de sufijos
  let cleanName = name
    .replace(/_hidden$/i, "")
    .replace(/_notitle$/i, "")
    .replace(/_dark$/i, "")
    .replace(/_night$/i, "");

  // Evaluar prefijos de orden (01_, 1., (1))
  let orderMatch = cleanName.match(/^(\d+)[\._-]/);
  if (orderMatch) {
    result.order = parseInt(orderMatch[1], 10);
    cleanName = cleanName.replace(/^\d+[\._-]\s*/, "");
  } else {
    // Intentar con formato (X)
    orderMatch = cleanName.match(/^\((\d+)\)/);
    if (orderMatch) {
      result.order = parseInt(orderMatch[1], 10);
      cleanName = cleanName.replace(/^\(\d+\)\s*/, "");
    }
  }

  // Evaluar prefijos de tipo (video_, image_, button_, etc.)
  const typeMatches = cleanName.match(/^([a-z]+)_/i);
  if (typeMatches) {
    const potentialType = typeMatches[1].toLowerCase();
    // Lista de tipos conocidos
    const knownTypes = [
      "video",
      "image",
      "button",
      "section",
      "sidebar",
      "tab",
      "tabs",
      "link",
      "document",
      "card",
      "presentation",
      "spreadsheet",
    ];

    if (knownTypes.includes(potentialType)) {
      result.type = potentialType;
      cleanName = cleanName.replace(/^[a-z]+_/i, "");
    }
  }

  // Actualizar nombre limpio
  result.name = cleanName.trim();

  return result;
}

/**
 * Determina el tipo de contenido basado en mimeType
 * Convierte tipos MIME estándar a los tipos de contenido utilizados en la UI
 *
 * @example
 * "image/jpeg" → "image"
 * "application/pdf" → "document"
 * "video/mp4" → "video"
 *
 * @param mimeType Tipo MIME del archivo (ej: "image/jpeg", "application/pdf")
 * @returns Tipo de contenido simplificado para uso en la UI
 */
function getContentTypeFromMimeType(mimeType: string): string {
  if (!mimeType) return "unknown";

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.includes("pdf")) return "document";
  if (mimeType.includes("presentation")) return "presentation";
  if (mimeType.includes("spreadsheet")) return "spreadsheet";
  if (mimeType.includes("document")) return "document";

  return "file";
}

/**
 * Cuenta archivos por categoría
 */
function countFilesByCategory(files: any[]) {
  const stats: Record<string, number> = {};

  files.forEach((file) => {
    const category = getFileCategory(file);
    stats[category] = (stats[category] || 0) + 1;
  });

  return stats;
}

/**
 * Determina la categoría de un archivo
 */
function getFileCategory(file: any) {
  if (!file.mimeType) return "other";

  if (file.mimeType.startsWith("image/")) return "image";
  if (file.mimeType.startsWith("video/")) return "video";
  if (file.mimeType.includes("pdf")) return "document";
  if (file.mimeType.includes("presentation")) return "presentation";
  if (file.mimeType.includes("spreadsheet")) return "spreadsheet";
  if (file.mimeType.includes("document")) return "document";

  return "other";
}

/**
 * Crea un mapa jerárquico de los archivos y carpetas
 * que representa claramente la estructura de Google Drive
 * Optimizado para visualización en acordeones sin excepciones especiales
 */
function createHierarchyMap(
  files: any[],
  folderId: string,
  folderName: string
): HierarchyItem {
  /**
   * Genera un ID seguro para usar en rutas y URLs
   * Mantiene la estructura pero elimina caracteres problemáticos
   */
  const generateSafeId = (prefix: string, path: string): string => {
    // Normalizar caracteres acentuados y especiales
    const normalized = path
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[Ññ]/g, "n");

    // Reemplazar caracteres no alfanuméricos con guiones
    return `${prefix}-${normalized
      .replace(/\//g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "-")}`;
  };

  // Función para extraer información de nombres y detectar el tipo de elemento
  const extractItemInfo = (
    name: string
  ): {
    displayName: string; // Nombre para mostrar (conservando prefijos numéricos)
    order: number; // Orden extraído del prefijo
  } => {
    let displayName = name;
    let order = 999;

    // Limpiar sufijos comunes
    displayName = displayName
      .replace(/_hidden$/i, "")
      .replace(/_notitle$/i, "")
      .replace(/_hidden$/i, "")
      .replace(/_dark$/i, "")
      .replace(/_night$/i, "");

    // Extraer prefijos de orden (01_, 1., (1))
    const orderMatch = displayName.match(/^(\d+)[\._-]/);
    if (orderMatch) {
      order = parseInt(orderMatch[1], 10);
    } else {
      const orderMatchParen = displayName.match(/^\((\d+)\)/);
      if (orderMatchParen) {
        order = parseInt(orderMatchParen[1], 10);
      }
    }

    return {
      displayName: displayName.trim(),
      order,
    };
  };

  // Crear el nodo raíz (carpeta principal)
  const { displayName: rootDisplayName, order: rootOrder } =
    extractItemInfo(folderName);
  const rootItem: HierarchyItem = {
    id: folderId,
    name: rootDisplayName,
    driveType: "folder",
    childrens: [],
    order: rootOrder,
    depth: 0, // El nodo raíz tiene profundidad 0
  };

  // Mapa de carpetas por ruta para construir la jerarquía
  const folderMap: Record<string, HierarchyItem> = {
    "": rootItem,
  };

  // 1. Construir la estructura jerárquica para carpetas primero
  files.forEach((file) => {
    if (!file.nestedPath || !Array.isArray(file.nestedPath)) return;

    let currentPath = "";
    let parentPath = "";
    let currentDepth = 0;

    // Recorrer cada nivel de la ruta y crear los nodos necesarios
    for (let i = 0; i < file.nestedPath.length; i++) {
      const folderName = file.nestedPath[i];
      parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      currentDepth = i + 1; // La profundidad comienza en 1 para los hijos del nodo raíz

      // Si esta carpeta ya existe en el mapa, continuamos
      if (folderMap[currentPath]) continue;

      // Extraer información del nombre
      const { displayName, order } = extractItemInfo(folderName);

      // Crear un nuevo ítem para esta carpeta
      const folderItem: HierarchyItem = {
        id: generateSafeId("folder", currentPath),
        name: displayName,
        driveType: "folder",
        childrens: [],
        order: order,
        depth: currentDepth,
      };

      // Agregar la carpeta a su padre
      const parent = folderMap[parentPath] || rootItem;
      parent.childrens.push(folderItem);

      // Registrar la carpeta en el mapa
      folderMap[currentPath] = folderItem;
    }
  });

  // 2. Ahora agregar los archivos a sus carpetas correspondientes
  files.forEach((file) => {
    let containerPath = "";

    if (
      file.nestedPath &&
      Array.isArray(file.nestedPath) &&
      file.nestedPath.length > 0
    ) {
      containerPath = file.nestedPath.join("/");
    } else {
      const pathParts: string[] = [];
      if (file.folder) pathParts.push(file.folder);
      if (file.subFolder) pathParts.push(file.subFolder);
      if (file.subSubFolder) pathParts.push(file.subSubFolder);

      let level = 4;
      while (file[`level${level}Folder`]) {
        pathParts.push(file[`level${level}Folder`]);
        level++;
      }

      containerPath = pathParts.join("/");
    }

    // Obtener la carpeta contenedora
    const container = folderMap[containerPath] || rootItem;

    // Extraer información del nombre
    const { displayName, order } = extractItemInfo(file.name);

    // Crear el item del archivo
    const fileItem: HierarchyItem = {
      id: file.id,
      name: file.name,
      driveType: "file",
      childrens: [],
      order: order,
      depth: container.depth + 1, // La profundidad del archivo es la de su contenedor + 1
    };

    // Agregar el archivo a su carpeta contenedora
    container.childrens.push(fileItem);
  });

  // 3. Ordenar todos los elementos recursivamente
  const sortHierarchy = (item: HierarchyItem): void => {
    if (!item.childrens || !Array.isArray(item.childrens)) {
      item.childrens = [];
      return;
    }

    // Ordenar primero carpetas y luego archivos, y por orden numérico dentro de cada tipo
    item.childrens.sort((a, b) => {
      // Primero por tipo (carpetas primero)
      if (a.driveType === "folder" && b.driveType === "file") return -1;
      if (a.driveType === "file" && b.driveType === "folder") return 1;

      // Luego por orden numérico
      return (a.order || 999) - (b.order || 999);
    });

    // Ordenar recursivamente los hijos
    for (const child of item.childrens) {
      if (child && child.driveType === "folder") {
        sortHierarchy(child);
      }
    }
  };

  // Aplicar ordenamiento a la jerarquía completa
  sortHierarchy(rootItem);

  return rootItem;
}
