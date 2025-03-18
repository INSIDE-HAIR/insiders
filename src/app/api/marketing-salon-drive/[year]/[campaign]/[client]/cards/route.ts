import { NextResponse } from "next/server";
import { GoogleDriveService } from "@/src/features/marketing-salon-drive/services/drive/GoogleDriveService";

// Interface for file object with all necessary properties
interface ProcessedFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  transformedUrl: {
    preview: string;
    imgEmbed: string;
    download: string;
    alternativeUrls?: {
      direct: string;
      thumbnail: string;
      proxy?: string;
      video?: string;
      photos?: string;
    };
  };
  category?: string;
}

// Interface for group content
interface ContentContainer {
  files: ProcessedFile[];
  subTabs?: TabItem[];
  groups?: GroupItem[];
}

// Interface for tab items
interface TabItem {
  id: string;
  name: string;
  type: string;
  content: ContentContainer;
}

// Interface for group items
interface GroupItem {
  id: string;
  name: string;
  type: string;
  content: ContentContainer;
}

// Interface for sidebar items
interface SidebarItem {
  id: string;
  name: string;
  type: string;
  content: {
    tabs: TabItem[];
  };
}

// Helper function to determine file category based on MIME type
function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "document";
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return "spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "presentation";
  if (mimeType.includes("document") || mimeType.includes("word"))
    return "document";
  return "other";
}

// Helper function to create sanitized IDs
function createSanitizedId(
  prefix: string,
  name: string,
  path?: string[],
  suffix?: string
): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Include path in ID for nested structures to ensure uniqueness
  let fullId = `${prefix}-${sanitized}`;

  // If path is provided, include it in the ID
  if (path && path.length > 0) {
    const pathSegment = path
      .map((segment) => segment.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
      .join("-");
    fullId = `${fullId}-in-${pathSegment}`;
  }

  // Add suffix if provided
  if (suffix) {
    fullId = `${fullId}-${suffix}`;
  }

  return fullId;
}

// Function to debug file processing
// Add this as a helper function to log what's happening
function logGroupProcessing(groupName: string, files: any[], subtabs: any[]) {
  console.log(`\nProcessing group: ${groupName}`);
  console.log(`Total files: ${files.length}`);

  // Log direct files
  const directFiles = files.filter((f) => {
    const originalPath = f._originalFolderPath || [];
    const groupLevel = f._groupLevel || 0;
    return originalPath.length <= groupLevel + 1;
  });
  console.log(`Direct files in group: ${directFiles.length}`);

  // Log files by subfolder
  const filesBySubfolder: Record<string, number> = {};
  files.forEach((f) => {
    const originalPath = f._originalFolderPath || [];
    const groupLevel = f._groupLevel || 0;
    if (originalPath.length > groupLevel + 1) {
      const subfolderName = originalPath[groupLevel + 1];
      filesBySubfolder[subfolderName] =
        (filesBySubfolder[subfolderName] || 0) + 1;
    }
  });

  console.log("Files by subfolder:");
  Object.entries(filesBySubfolder).forEach(([subfolder, count]) => {
    console.log(`  - ${subfolder}: ${count} files`);
  });

  console.log("Generated subtabs:");
  subtabs.forEach((tab) => {
    console.log(`  - ${tab.name}: ${tab.content.files.length} files`);
  });
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { client?: string; year: string; campaign: string };
  }
) {
  const { client, year, campaign } = params;

  try {
    // Validar parámetros de entrada
    if (!year || !campaign) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          details: { year, campaign },
        },
        { status: 400 }
      );
    }

    const driveService = new GoogleDriveService();

    // Construir la ruta de la carpeta en Drive
    const folderPath = client
      ? `${year}/${campaign}/${client}`
      : `${year}/${campaign}`;

    // Obtener archivos con estructura de carpetas completa
    let files;
    try {
      files = await driveService.getFiles(folderPath);
      console.log(
        `Obtenidos ${
          files ? files.length : 0
        } archivos de Drive para: ${folderPath}`
      );
    } catch (fileError) {
      // Si hay un error específico sobre carpeta no encontrada, manejar adecuadamente
      if (
        fileError instanceof Error &&
        fileError.message.includes("Carpeta no encontrada")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: fileError.message,
            details: fileError.message,
            path: folderPath,
          },
          { status: 404 }
        );
      }
      // Para otros errores, relanzar para que sean manejados por el bloque catch externo
      throw fileError;
    }

    // Process files into hierarchical structure
    const { sidebar, categoryStats, totalFiles } = processFilesIntoStructure(
      files || [], // Asegurar que siempre pasamos un array, incluso si files es undefined
      driveService
    );

    // Eliminamos la corrección fija y confiamos en el procesamiento dinámico
    // fixTabsInPrueba2(sidebar);

    return NextResponse.json({
      success: true,
      data: {
        sidebar,
        metadata: {
          year,
          campaign,
          client: client || null,
          totalFiles,
          lastUpdated: new Date().toISOString(),
          categoryStats,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching drive files:", error);

    // Determinar código de estado según el tipo de error
    let statusCode = 500;
    let errorMessage = "Failed to fetch files from Drive";
    let detailedPath = client
      ? `${year}/${campaign}/${client}`
      : `${year}/${campaign}`;

    if (error instanceof Error) {
      // Errores específicos de navegación de carpetas
      if (error.message.includes("Carpeta no encontrada:")) {
        statusCode = 404;
        errorMessage = error.message; // Usamos directamente el mensaje mejorado
      }
      // Errores de configuración
      else if (error.message.includes("Missing required environment")) {
        statusCode = 500;
        errorMessage = "Server configuration error";
      }
      // Errores de autenticación
      else if (error.message.includes("credentials")) {
        statusCode = 401;
        errorMessage = "Authentication error with Google Drive";
      }
      // Otros errores
      else {
        errorMessage = `Error al acceder a Drive: ${error.message}`;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
        path: detailedPath,
      },
      { status: statusCode }
    );
  }
}

// Function to process files into structured format
function processFilesIntoStructure(
  files: any[],
  driveService: GoogleDriveService
) {
  // Keep track of category statistics
  const categoryStats: Record<string, number> = {};

  // Group files by folder structure
  const folderMap: Record<string, any[]> = {
    Principal: [],
  };

  // Process each file and group by folder
  // Añadir verificación para asegurarse de que files sea un array
  if (!files || !Array.isArray(files)) {
    console.error(
      "[processFilesIntoStructure] Error: files no es un array válido",
      files
    );
    // Devolver una estructura básica si no hay archivos
    return {
      sidebar: [],
      categoryStats: {},
      totalFiles: 0,
    };
  }

  files.forEach((file) => {
    // Skip folders themselves
    if (file.mimeType === "application/vnd.google-apps.folder") {
      return;
    }

    // Assign category to file
    const category = getFileCategory(file.mimeType);
    categoryStats[category] = (categoryStats[category] || 0) + 1;

    // Transform the file
    const processedFile: ProcessedFile = {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      transformedUrl: file.transformedUrl || {
        preview: driveService.convertGoogleDriveLink(file.id, file.mimeType)
          .preview,
        imgEmbed: driveService.convertGoogleDriveLink(file.id, file.mimeType)
          .imgEmbed,
        download: driveService.convertGoogleDriveLink(file.id, file.mimeType)
          .download,
        alternativeUrls: {
          direct:
            driveService.convertGoogleDriveLink(file.id, file.mimeType)
              .alternativeUrls?.direct || "",
          thumbnail: file.thumbnailLink || "",
          video: file.mimeType.startsWith("video/")
            ? driveService.convertGoogleDriveLink(file.id, file.mimeType)
                .preview
            : undefined,
        },
      },
      category,
    };

    // Determine folder path
    const folderPath = [];
    if (file.folder) folderPath.push(file.folder);
    if (file.subFolder) folderPath.push(file.subFolder);
    if (file.subSubFolder) folderPath.push(file.subSubFolder);

    // Store additional folder levels if they exist (beyond subSubFolder)
    let currentLevel = 4; // After folder, subFolder, subSubFolder (levels 1-3)
    while (file[`level${currentLevel}Folder`]) {
      folderPath.push(file[`level${currentLevel}Folder`]);
      currentLevel++;
    }

    // If no folder path, add to 'Principal'
    if (folderPath.length === 0) {
      folderMap["Principal"].push(processedFile);
      return;
    }

    // Get or create top level folder
    const topFolder = folderPath[0];
    if (!folderMap[topFolder]) {
      folderMap[topFolder] = [];
    }

    // Handle complex nested structure preserving hierarchy
    let targetArray = folderMap[topFolder];
    let currentPath = topFolder;

    // Add file with its full path info for later processing
    targetArray.push({
      ...processedFile,
      _folderPath: folderPath.slice(0, 3), // Keep standard depth for processing
      _originalFolderPath: folderPath, // Keep full path for deeper nesting
    });
  });

  // Create sidebar structure with tabs
  const sidebar: SidebarItem[] = [];

  // Process each top-level folder into a sidebar item
  Object.entries(folderMap).forEach(([folderName, folderFiles]) => {
    // Skip empty folders
    if (folderFiles.length === 0) return;

    // Create a sidebar item
    const sidebarItem: SidebarItem = {
      id: createSanitizedId("sidebar", folderName),
      name: folderName,
      type: "sidebar-item",
      content: {
        tabs: [],
      },
    };

    // Group files by subfolder for tabs
    const tabsMap: Record<string, any[]> = {
      Principal: [], // Main tab always exists
    };

    // First, organize files by subFolder
    folderFiles.forEach((file) => {
      // Skip hidden files
      if (file.isHidden) return;

      // Get or initialize the tab
      let targetTab = "Principal";
      let isGroup = false;
      let groupName = "";

      // Check if file has folder path information
      if (file._folderPath && file._folderPath.length > 1) {
        targetTab = file._folderPath[1]; // Use second level as tab

        // Check if there's a 'group:' prefix in the path
        if (file._folderPath.length > 2) {
          const potentialGroup = file._folderPath[2];
          if (potentialGroup && potentialGroup.startsWith("group:")) {
            isGroup = true;
            groupName = potentialGroup.replace("group:", "").trim();
            console.log(
              `[Grupo detectado] ${groupName} en la ruta: ${file._folderPath.join(
                "/"
              )}`
            );
          }
        }
      } else if (file.subFolder) {
        targetTab = file.subFolder;

        // Check if there's a 'group:' prefix in subSubFolder
        if (file.subSubFolder && file.subSubFolder.startsWith("group:")) {
          isGroup = true;
          groupName = file.subSubFolder.replace("group:", "").trim();
          console.log(
            `[Grupo detectado] ${groupName} en subfolder: ${file.subFolder}, subSubFolder: ${file.subSubFolder}`
          );
        }
      }

      // Ensure there's an array for this tab
      if (!tabsMap[targetTab]) {
        tabsMap[targetTab] = [];
      }

      // Store the file with group information if applicable
      if (isGroup) {
        tabsMap[targetTab].push({
          ...file,
          _groupName: groupName,
          _isGroup: true,
        });
      } else {
        tabsMap[targetTab].push(file);
      }
    });

    // Now process each tab and create tab objects including groups
    Object.entries(tabsMap).forEach(([tabName, tabFiles]) => {
      // Skip empty tabs
      if (tabFiles.length === 0) return;

      // Process this tab
      const mainFiles: ProcessedFile[] = [];
      const groups: Record<string, ProcessedFile[]> = {};

      // Categorize files into direct tab files vs grouped files
      tabFiles.forEach((file: any) => {
        if (file._isGroup && file._groupName) {
          // Initialize the group array if it doesn't exist
          if (!groups[file._groupName]) {
            groups[file._groupName] = [];
          }

          // Store file in appropriate group
          const processedFile = {
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            webViewLink: file.webViewLink,
            thumbnailLink: file.thumbnailLink,
            transformedUrl: file.transformedUrl,
            category: file.category,
          };

          groups[file._groupName].push(processedFile);
          console.log(
            `[Agregado archivo a grupo] ${file.name} -> ${file._groupName}`
          );
        } else {
          // Add to main files
          mainFiles.push({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            webViewLink: file.webViewLink,
            thumbnailLink: file.thumbnailLink,
            transformedUrl: file.transformedUrl,
            category: file.category,
          });
        }
      });

      // Create the tab content with direct files
      const tabContent: ContentContainer = {
        files: mainFiles,
      };

      // If there are groups, add them to the tab content
      if (Object.keys(groups).length > 0) {
        tabContent.groups = [];

        Object.entries(groups).forEach(([groupName, groupFiles]) => {
          console.log(
            `[Creando grupo] ${groupName} con ${groupFiles.length} archivos`
          );

          // Analizar prefijos para crear subtabs
          const prefixMap: Record<string, ProcessedFile[]> = {};

          // Detectar prefijos en los nombres de archivos
          groupFiles.forEach((file) => {
            // Buscar patrones como "XX-" al inicio del nombre
            const prefixMatch = file.name.match(/^([A-Z0-9]{1,3})-/);
            if (prefixMatch && prefixMatch[1]) {
              const prefix = prefixMatch[1];
              if (!prefixMap[prefix]) {
                prefixMap[prefix] = [];
              }
              prefixMap[prefix].push(file);
              console.log(
                `[Prefijo detectado] ${prefix} en archivo: ${file.name}`
              );
            }
          });

          // Crear subtabs si se encontraron prefijos
          const subTabs: any[] = [];
          Object.entries(prefixMap).forEach(([prefix, prefixFiles]) => {
            if (prefixFiles.length > 0) {
              const subTab = {
                id: createSanitizedId("subtab", prefix, [
                  folderName,
                  tabName,
                  groupName,
                ]),
                name: prefix,
                type: "subtab",
                content: {
                  files: prefixFiles,
                },
              };
              subTabs.push(subTab);
              console.log(
                `[Creada subtab] ${prefix} con ${prefixFiles.length} archivos`
              );
            }
          });

          // Crear la estructura del grupo con subtabs
          const groupContent: ContentContainer = {
            files: groupFiles,
          };

          // Añadir subtabs si existen
          if (subTabs.length > 0) {
            groupContent.subTabs = subTabs;
          }

          // Create a group for each unique group name
          const groupItem: GroupItem = {
            id: createSanitizedId("group", groupName, [folderName, tabName]),
            name: groupName,
            type: "group",
            content: groupContent,
          };

          tabContent.groups.push(groupItem);
        });
      }

      // Create a path for unique tab IDs
      const tabPath = [folderName];

      sidebarItem.content.tabs.push({
        id: createSanitizedId("tab", tabName, tabPath),
        name: tabName,
        type: "subfolder-tab",
        content: tabContent,
      });
    });

    // Only add sidebar item if it has tabs
    if (sidebarItem.content.tabs.length > 0) {
      sidebar.push(sidebarItem);
    }
  });

  return {
    sidebar,
    categoryStats,
    totalFiles: files.filter(
      (f) => f.mimeType !== "application/vnd.google-apps.folder"
    ).length,
  };
}

// Añadimos tests para la función processGroupContent
export function getDriveProcessorForTesting() {
  return {
    processGroupContent: processGroupContent,
    processFilesIntoStructure: processFilesIntoStructure,
    testForInfiniteRecursion: testForInfiniteRecursion,
    testNestedGroupsAndCircularReferences:
      testNestedGroupsAndCircularReferences,
  };
}

// Función auxiliar para crear archivos de test
export function createTestFile(name: string, folderPath: string[] = []): any {
  return {
    id: `test-id-${name}`,
    name,
    mimeType: name.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
    webViewLink: `https://drive.google.com/file/d/${name}`,
    _folderPath: folderPath.slice(0, 3),
    _originalFolderPath: folderPath,
  };
}

// Test para detectar recursión infinita
export function testForInfiniteRecursion(): boolean {
  try {
    // Crear un caso que podría causar recursión infinita
    const files = [
      createTestFile("file1.jpg", ["folder1", "folder2", "folder3"]),
      createTestFile("file2.jpg", ["folder1", "folder2", "folder3", "folder2"]), // Path circular
      createTestFile("file3.jpg", ["folder1", "folder2"]),
    ];

    // Establecer un límite bajo para la prueba
    const result = processGroupContent(files, ["root"], 0, 5);

    // Si llegamos aquí, no hubo recursión infinita
    return true;
  } catch (error) {
    console.error("Test de recursión infinita falló:", error);
    return false;
  }
}

// Test para verificar el manejo correcto de grupos anidados y referencias circulares
export function testNestedGroupsAndCircularReferences(): boolean {
  try {
    console.log(
      "=== INICIANDO PRUEBA DE GRUPOS ANIDADOS Y REFERENCIAS CIRCULARES ==="
    );

    // Caso 1: Estructura simple con grupo que contiene carpeta del mismo nombre (no debe ser circular)
    const case1Files = [
      createTestFile("file1.jpg", ["Stories", "group: Story 1"]),
      createTestFile("file2.jpg", ["Stories", "group: Story 1", "Story 1"]),
      createTestFile("file3.jpg", [
        "Stories",
        "group: Story 1",
        "Story 1",
        "Subcarpeta",
      ]),
    ];

    console.log("Caso 1: Grupo que contiene carpeta del mismo nombre");
    const result1 = processGroupContent(case1Files, ["root"], 0, 10);
    const hasCircularWarning1 = JSON.stringify(result1).includes(
      "referencia circular"
    );
    console.log(
      `Resultado: ${
        hasCircularWarning1
          ? "❌ Detectó referencia circular incorrectamente"
          : "✅ Correcto - No detectó referencia circular"
      }`
    );

    // Caso 2: Estructura con referencia circular genuina
    const case2Files = [
      createTestFile("file1.jpg", ["folder1", "folder2"]),
      createTestFile("file2.jpg", ["folder1", "folder2", "folder1", "folder2"]), // Circular genuino
    ];

    console.log("Caso 2: Referencia circular genuina");
    const result2 = processGroupContent(case2Files, ["root"], 0, 10);
    const hasCircularWarning2 = JSON.stringify(result2).includes(
      "referencia circular"
    );
    console.log(
      `Resultado: ${
        hasCircularWarning2
          ? "✅ Correcto - Detectó referencia circular"
          : "❌ No detectó referencia circular"
      }`
    );

    // Caso 3: Estructura compleja con grupos anidados (similar a la estructura real)
    const case3Files = [
      // Story 2 con subcarpetas
      createTestFile("file1.jpg", ["Stories", "group: Story 2"]),
      createTestFile("file2.jpg", ["Stories", "group: Story 2", "FRANCIA"]),
      createTestFile("file3.jpg", ["Stories", "group: Story 2", "ESPAÑA"]),

      // Story 1 con subcarpetas y grupo anidado
      createTestFile("file4.jpg", ["Stories", "group: Story 1", "CA1"]),
      createTestFile("file5.jpg", [
        "Stories",
        "group: Story 1",
        "CA1",
        "group: Prueba",
      ]),
      createTestFile("file6.jpg", [
        "Stories",
        "group: Story 1",
        "CA1",
        "group: Prueba",
        "es subgrupo prueba",
      ]),
      createTestFile("file7.jpg", ["Stories", "group: Story 1", "Es"]),
    ];

    console.log("Caso 3: Estructura compleja con grupos anidados");
    const result3 = processGroupContent(case3Files, ["root"], 0, 10);

    // Verificar que Story 1 y Story 2 se procesaron como grupos
    const hasStory1Group = result3.groups?.some((g) => g.name === "Story 1");
    const hasStory2Group = result3.groups?.some((g) => g.name === "Story 2");

    // Verificar que Prueba se procesó como grupo dentro de Story 1
    let hasPruebaGroup = false;
    if (result3.groups) {
      const story1Group = result3.groups.find((g) => g.name === "Story 1");
      if (story1Group && story1Group.content.subTabs) {
        const ca1Tab = story1Group.content.subTabs.find(
          (t) => t.name === "CA1"
        );
        if (ca1Tab && ca1Tab.content.groups) {
          hasPruebaGroup = ca1Tab.content.groups.some(
            (g) => g.name === "Prueba"
          );
        }
      }
    }

    console.log(
      `Story 1 como grupo: ${hasStory1Group ? "✅ Correcto" : "❌ Incorrecto"}`
    );
    console.log(
      `Story 2 como grupo: ${hasStory2Group ? "✅ Correcto" : "❌ Incorrecto"}`
    );
    console.log(
      `Prueba como grupo anidado: ${
        hasPruebaGroup ? "✅ Correcto" : "❌ Incorrecto"
      }`
    );

    // Verificar que no hay duplicación de entradas
    const jsonResult = JSON.stringify(result3);
    const countStory1 = (jsonResult.match(/Story 1/g) || []).length;
    const countStory2 = (jsonResult.match(/Story 2/g) || []).length;
    const countPrueba = (jsonResult.match(/Prueba/g) || []).length;

    console.log(
      `Número de ocurrencias de "Story 1": ${countStory1} (esperado: pocas ocurrencias)`
    );
    console.log(
      `Número de ocurrencias de "Story 2": ${countStory2} (esperado: pocas ocurrencias)`
    );
    console.log(
      `Número de ocurrencias de "Prueba": ${countPrueba} (esperado: pocas ocurrencias)`
    );

    console.log("=== FIN DE PRUEBA ===");

    return true;
  } catch (error) {
    console.error("Error en prueba de grupos anidados:", error);
    return false;
  }
}

// Función que procesa el contenido de grupos de archivos
function processGroupContent(
  files: any[],
  currentPath: string[],
  pathLevel: number,
  maxRecursionDepth: number = 10,
  processedGroups: Set<string> = new Set(),
  idPaths: Map<string, string[]> = new Map()
): ContentContainer {
  // Condición de salida: si alcanzamos la profundidad máxima o no hay archivos que procesar
  if (pathLevel > maxRecursionDepth || !files || files.length === 0) {
    console.log(
      `[Límite de recursión] Detenido en nivel ${pathLevel} para ruta ${currentPath.join(
        "/"
      )}`
    );
    return {
      files: [],
      subTabs: [],
      groups: [],
    };
  }

  // Registro para depuración
  console.log(
    `[Procesando] Nivel ${pathLevel}, ruta: ${currentPath.join("/")}, ${
      files.length
    } archivos`
  );

  // Initialize content container with defaults
  const content: ContentContainer = {
    files: [],
    subTabs: [],
    groups: [],
  };

  // Extraer los archivos directos (sin subcarpetas)
  const directFiles: ProcessedFile[] = [];

  // Mapas mejorados para tracking
  const hierarchyPaths: Record<string, string[]> = {}; // Nombre carpeta -> Ruta completa
  const filesByFolderPath: Record<string, any[]> = {}; // Ruta carpeta -> Archivos
  const isGroupFolder: Record<string, boolean> = {}; // Nombre carpeta -> Es grupo?
  const folderDepth: Record<string, number> = {}; // Nombre carpeta -> Profundidad
  const folderIds: Record<string, string> = {}; // Nombre carpeta -> ID de carpeta
  const folderIdToName: Record<string, string> = {}; // ID carpeta -> Nombre carpeta
  const nestedStructure: Record<string, string[]> = {}; // ID carpeta -> IDs hijos directos
  const originalFullPaths: Record<string, string[]> = {}; // Nombre carpeta -> Ruta original completa

  // Primero, analizar todos los archivos para construir la jerarquía completa
  files.forEach((file) => {
    const originalPath = file._originalFolderPath || [];
    const groupLevel = file._groupLevel || 0;

    // Registrar las rutas originales completas para cada carpeta
    if (originalPath.length > 0) {
      for (let i = 0; i < originalPath.length; i++) {
        const folderName = originalPath[i];
        // Extraer nombre limpio sin ID
        let cleanFolderName = folderName;
        const idMatch = folderName.match(/\(([^\)]+)\)$/);
        if (idMatch) {
          cleanFolderName = folderName.replace(/\s*\([^\)]+\)$/, "").trim();
        }

        originalFullPaths[cleanFolderName] = originalPath.slice(0, i + 1);
      }
    }

    // Si es un archivo directo
    if (originalPath.length <= groupLevel + 1) {
      const { _folderPath, _originalFolderPath, _groupLevel, ...cleanFile } =
        file;
      directFiles.push(cleanFile);
      return;
    }

    // Procesar la ruta completa del archivo y capturar los IDs de carpeta
    for (let i = groupLevel + 1; i < originalPath.length; i++) {
      const folderName = originalPath[i];
      const folderPath = originalPath.slice(0, i + 1);
      const pathKey = folderPath.join("/");

      // Extraer ID de carpeta si está disponible (formato típico: "nombre (id)")
      let folderId = "";
      let cleanFolderName = folderName;

      // Intento extraer ID de la carpeta del nombre si está presente
      const idMatch = folderName.match(/\(([^\)]+)\)$/);
      if (idMatch && idMatch[1]) {
        folderId = idMatch[1].trim();
        cleanFolderName = folderName.replace(/\s*\([^\)]+\)$/, "").trim();

        // Registrar mapeos de ID a nombre y viceversa
        folderIds[cleanFolderName] = folderId;
        folderIdToName[folderId] = cleanFolderName;
      }

      // Registrar si es una carpeta de grupo
      const isGroup =
        folderName.toLowerCase().startsWith("group:") ||
        folderName.toLowerCase().startsWith("grupo:") ||
        folderName.toLowerCase().startsWith("grouptitle:");

      isGroupFolder[cleanFolderName] = isGroup;

      // Registrar la profundidad de la carpeta (nivel de anidación)
      folderDepth[cleanFolderName] = i - groupLevel;

      // Registrar la ruta completa de cada carpeta
      hierarchyPaths[cleanFolderName] = folderPath;

      // Agrupar archivos por ruta completa de carpeta
      if (!filesByFolderPath[pathKey]) {
        filesByFolderPath[pathKey] = [];
      }

      // Si este archivo pertenece a esta carpeta específica (no está en una subcarpeta más profunda)
      if (i === originalPath.length - 1) {
        filesByFolderPath[pathKey].push({
          ...file,
          _folderLevel: i,
          _folderPath: folderPath,
        });
      }

      // Construir la estructura anidada de carpetas usando IDs (padre -> hijos)
      if (i > groupLevel + 1 && folderId) {
        const parentFolderName = originalPath[i - 1];
        const parentIdMatch = parentFolderName.match(/\(([^\)]+)\)$/);

        if (parentIdMatch && parentIdMatch[1]) {
          const parentId = parentIdMatch[1].trim();

          if (!nestedStructure[parentId]) {
            nestedStructure[parentId] = [];
          }

          if (folderId && !nestedStructure[parentId].includes(folderId)) {
            nestedStructure[parentId].push(folderId);
          }
        }
      }
    }
  });

  // Asignar los archivos directos al contenido
  content.files = directFiles;

  // Construir un mapa de relaciones padre-hijo más preciso (usando rutas originales)
  const childrenByParent: Record<string, string[]> = {};
  const directParentOf: Record<string, string> = {};

  // Construir un mapa de carpetas por nivel
  const foldersByLevel: Record<number, string[]> = {};

  // Registrar las relaciones padre-hijo y carpetas por nivel usando las rutas originales completas
  Object.entries(originalFullPaths).forEach(([folderName, path]) => {
    const level = path.length - 1;

    // Registrar carpeta en su nivel
    if (!foldersByLevel[level]) {
      foldersByLevel[level] = [];
    }
    if (!foldersByLevel[level].includes(folderName)) {
      foldersByLevel[level].push(folderName);
    }

    // Registrar relación padre-hijo
    if (level > 0) {
      let parentName = path[level - 1];

      // Limpiar el nombre del padre si tiene ID
      if (parentName.match(/\(([^\)]+)\)$/)) {
        parentName = parentName.replace(/\s*\([^\)]+\)$/, "").trim();
      }

      // Limpiar el nombre del grupo si es grupo
      if (
        parentName.toLowerCase().startsWith("group:") ||
        parentName.toLowerCase().startsWith("grupo:") ||
        parentName.toLowerCase().startsWith("grouptitle:")
      ) {
        parentName = parentName.split(":")[1]?.trim() || parentName;
      }

      directParentOf[folderName] = parentName; // Guardar el padre directo

      if (!childrenByParent[parentName]) {
        childrenByParent[parentName] = [];
      }
      if (!childrenByParent[parentName].includes(folderName)) {
        childrenByParent[parentName].push(folderName);
      }

      console.log(`[RELACIÓN] ${folderName} es hijo directo de ${parentName}`);
    }
  });

  // En lugar de registrar explícitamente para nombres específicos, analizar la estructura completa
  // para identificar correctamente relaciones padre-hijo basadas en la jerarquía de Google Drive
  Object.entries(originalFullPaths).forEach(([folderName, path]) => {
    // Ignorar carpetas que son grupos (tienen prefijo group:/grupo:)
    const isTabOrFile = !(
      folderName.toLowerCase().startsWith("group:") ||
      folderName.toLowerCase().startsWith("grupo:") ||
      folderName.toLowerCase().startsWith("grouptitle:")
    );

    if (isTabOrFile) {
      // Para cada carpeta que no es un grupo, buscar su contenedor adecuado recorriendo su ruta
      let foundContainer = false;

      // Recorrer la ruta de atrás hacia adelante para encontrar el grupo más cercano
      for (let i = path.length - 2; i >= 0 && !foundContainer; i--) {
        let potentialParentName = path[i];

        // Verificar si este padre potencial es un grupo
        const isGroupFolder =
          potentialParentName.toLowerCase().startsWith("group:") ||
          potentialParentName.toLowerCase().startsWith("grupo:") ||
          potentialParentName.toLowerCase().startsWith("grouptitle:");

        if (isGroupFolder) {
          // Obtener nombre limpio del grupo
          let cleanParentName =
            potentialParentName.split(":")[1]?.trim() || potentialParentName;

          // Limpiar ID si lo tiene
          if (cleanParentName.match(/\(([^\)]+)\)$/)) {
            cleanParentName = cleanParentName
              .replace(/\s*\([^\)]+\)$/, "")
              .trim();
          }

          console.log(
            `[RELACIÓN DINÁMICA] ${folderName} debe estar dentro del grupo ${cleanParentName} según jerarquía`
          );

          // Establecer relación directa con este grupo (sobreescribiendo la existente si es necesario)
          directParentOf[folderName] = cleanParentName;

          if (!childrenByParent[cleanParentName]) {
            childrenByParent[cleanParentName] = [];
          }

          if (!childrenByParent[cleanParentName].includes(folderName)) {
            childrenByParent[cleanParentName].push(folderName);
          }

          foundContainer = true;
        }
      }
    }
  });

  // Mantener un registro de las carpetas procesadas para evitar duplicados
  const processedItems = new Set<string>();

  // Mapas para acceder rápidamente a tabs y grupos por nombre
  const tabsMap: Record<string, TabItem> = {};
  const groupsMap: Record<string, GroupItem> = {};

  // Identificar cadenas jerárquicas de grupos
  const groupChains: Record<string, string[]> = {};

  Object.entries(isGroupFolder).forEach(([folderName, isGroup]) => {
    if (isGroup) {
      let currentGroup = folderName;
      let chain = [currentGroup];

      // Buscar hacia arriba en la jerarquía para encontrar grupos padres
      while (directParentOf[currentGroup]) {
        const parent = directParentOf[currentGroup];
        if (isGroupFolder[parent]) {
          chain.unshift(parent); // Añadir al inicio
          currentGroup = parent;
        } else {
          break;
        }
      }

      groupChains[folderName] = chain;
    }
  });

  // Función mejorada para identificar si una carpeta debe estar dentro de otra
  const shouldBePlacedInside = (
    childName: string,
    parentName: string
  ): boolean => {
    // Eliminar caso específico y usar una lógica más general

    // Si hay una relación directa de padre-hijo registrada, es la primera prioridad
    if (directParentOf[childName] === parentName) {
      console.log(
        `[COLOCACIÓN] ${childName} directamente hijo de ${parentName}`
      );
      return true;
    }

    // Si tenemos IDs de carpeta, usamos la estructura anidada para determinar la relación
    const childId = folderIds[childName];
    const parentId = folderIds[parentName];

    if (childId && parentId && nestedStructure[parentId]) {
      // Comprobar relación directa padre-hijo por ID
      if (nestedStructure[parentId].includes(childId)) {
        console.log(
          `[COLOCACIÓN] ${childName} descendiente directo de ${parentName} por ID`
        );
        return true;
      }

      // Comprobar relación indirecta (ancestro-descendiente)
      let queue = [...nestedStructure[parentId]];
      while (queue.length > 0) {
        const currentId = queue.shift();
        if (currentId && currentId === childId) {
          console.log(
            `[COLOCACIÓN] ${childName} descendiente indirecto de ${parentName} por ID`
          );
          return true;
        }
        if (currentId && nestedStructure[currentId]) {
          queue.push(...nestedStructure[currentId]);
        }
      }
    }

    // Verificar rutas originales completas
    const childPath = originalFullPaths[childName] || [];
    const parentPath = originalFullPaths[parentName] || [];

    if (childPath.length > 0 && parentPath.length > 0) {
      // Verificar si el padre aparece en la ruta del hijo
      for (let i = 0; i < childPath.length - 1; i++) {
        let pathSegment = childPath[i];

        // Limpiar el nombre del grupo si es grupo
        if (
          pathSegment.toLowerCase().startsWith("group:") ||
          pathSegment.toLowerCase().startsWith("grupo:") ||
          pathSegment.toLowerCase().startsWith("grouptitle:")
        ) {
          pathSegment = pathSegment.split(":")[1]?.trim() || pathSegment;
        }

        // Limpiar ID si lo tiene
        if (pathSegment.match(/\(([^\)]+)\)$/)) {
          pathSegment = pathSegment.replace(/\s*\([^\)]+\)$/, "").trim();
        }

        if (
          pathSegment.includes(parentName) ||
          parentName.includes(pathSegment)
        ) {
          console.log(
            `[COLOCACIÓN] ${childName} descendiente de ${parentName} por ruta original`
          );
          return true;
        }
      }
    }

    // Verificar si el hijo está en un camino de grupos que incluye al padre
    if (groupChains[childName] && groupChains[childName].includes(parentName)) {
      console.log(
        `[COLOCACIÓN] ${childName} descendiente de ${parentName} por cadena de grupos`
      );
      return true;
    }

    // Verificar jerarquía de ruta estándar
    const stdChildPath = hierarchyPaths[childName] || [];
    const stdParentPath = hierarchyPaths[parentName] || [];

    if (stdChildPath.length > stdParentPath.length) {
      // Verificar si el padre es parte de la ruta del hijo
      let matches = true;
      for (let i = 0; i < stdParentPath.length; i++) {
        if (stdParentPath[i] !== stdChildPath[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        console.log(
          `[COLOCACIÓN] ${childName} descendiente de ${parentName} por jerarquía estándar`
        );
        return true;
      }
    }

    return false;
  };

  // Función para procesar una carpeta
  const processFolder = (folderName: string, level: number): void => {
    if (processedItems.has(folderName)) return;
    processedItems.add(folderName);

    // Determinar si es un grupo
    const isGroup = isGroupFolder[folderName];

    // Obtener la ruta completa de esta carpeta
    const folderPath = hierarchyPaths[folderName] || [];
    const pathKey = folderPath.join("/");

    // Obtener los archivos para esta carpeta
    const folderFiles = filesByFolderPath[pathKey] || [];

    // Verificar si hay alguna referencia circular
    let isCircularReference = false;
    for (let i = 0; i < currentPath.length; i++) {
      const ancestorName = currentPath[i];
      const cleanAncestorName =
        ancestorName.toLowerCase().startsWith("group:") ||
        ancestorName.toLowerCase().startsWith("grupo:") ||
        ancestorName.toLowerCase().startsWith("grouptitle:")
          ? ancestorName.split(":")[1]?.trim().toLowerCase()
          : ancestorName.toLowerCase();

      const cleanFolderName = isGroup
        ? folderName.split(":")[1]?.trim().toLowerCase() ||
          folderName.toLowerCase()
        : folderName.toLowerCase();

      if (cleanAncestorName === cleanFolderName) {
        isCircularReference = true;
        console.log(
          `[Advertencia] Detectada referencia circular: ${currentPath.join(
            "/"
          )} -> ${folderName}`
        );
        break;
      }
    }

    if (isCircularReference) {
      // Procesar como referencia circular
      const cleanFolderName = isGroup
        ? folderName.split(":")[1]?.trim() || folderName
        : folderName;

      // Obtener archivos directos para la referencia circular
      const directCircularFiles = folderFiles.map((file) => {
        const {
          _folderPath,
          _originalFolderPath,
          _groupLevel,
          _folderLevel,
          ...cleanFile
        } = file;
        return cleanFile;
      });

      if (directCircularFiles.length > 0) {
        const circularTab = {
          id: createSanitizedId(
            "tab",
            `${cleanFolderName} (referencia circular)`,
            currentPath
          ),
          name: `${cleanFolderName} (referencia circular)`,
          type: "subfolder-tab",
          content: {
            files: directCircularFiles,
            subTabs: [],
            groups: [],
          },
        };

        // Agregar a la lista de tabs a procesar más tarde
        if (!tabsMap[circularTab.name]) {
          tabsMap[circularTab.name] = circularTab;
        }
      }

      return;
    }

    // Si es un grupo, procesarlo
    if (isGroup) {
      const cleanGroupName = folderName.split(":")[1]?.trim() || folderName;
      const nextPath = [...currentPath, cleanGroupName];

      // Crear un contenedor para el contenido del grupo
      let groupContent: ContentContainer = {
        files: [],
        subTabs: [],
        groups: [],
      };

      // Procesar archivos directos del grupo
      const groupDirectFiles = folderFiles.map((file) => {
        const {
          _folderPath,
          _originalFolderPath,
          _groupLevel,
          _folderLevel,
          ...cleanFile
        } = file;
        return cleanFile;
      });

      groupContent.files = groupDirectFiles;

      // Procesar los hijos de este grupo recursivamente
      const children = childrenByParent[folderName] || [];
      children.forEach((childName) => {
        processFolder(childName, level + 1);
      });

      // Crear el grupo
      const group: GroupItem = {
        id: createSanitizedId("group", cleanGroupName, currentPath),
        name: cleanGroupName,
        type: "group",
        content: groupContent,
      };

      // Guardar en el mapa de grupos
      groupsMap[cleanGroupName] = group;
      console.log(
        `Creado grupo: ${cleanGroupName} en ruta ${currentPath.join("/")}`
      );
    } else {
      // Procesar como una tab normal
      const nextPath = [...currentPath, folderName];

      // Crear un contenedor para el contenido de la tab
      let tabContent: ContentContainer = {
        files: [],
        subTabs: [],
        groups: [],
      };

      // Procesar archivos directos de la tab
      const tabDirectFiles = folderFiles.map((file) => {
        const {
          _folderPath,
          _originalFolderPath,
          _groupLevel,
          _folderLevel,
          ...cleanFile
        } = file;
        return cleanFile;
      });

      tabContent.files = tabDirectFiles;

      // Procesar los hijos de esta tab recursivamente
      const children = childrenByParent[folderName] || [];
      children.forEach((childName) => {
        processFolder(childName, level + 1);
      });

      // Crear la tab
      const tab: TabItem = {
        id: createSanitizedId("tab", folderName, currentPath),
        name: folderName,
        type: "subfolder-tab",
        content: tabContent,
      };

      // Guardar en el mapa de tabs
      tabsMap[folderName] = tab;
      console.log(`Creada tab: ${folderName} en ruta ${currentPath.join("/")}`);
    }
  };

  // Primera fase: procesar primero todos los grupos
  const processGroups = () => {
    // Ordenar niveles para procesamiento desde el más profundo al más superficial
    const levels = Object.keys(foldersByLevel).map(Number).sort().reverse();

    for (const level of levels) {
      const folders = foldersByLevel[level] || [];
      // Primero procesar los grupos
      folders
        .filter((folderName) => isGroupFolder[folderName])
        .forEach((folderName) => {
          processFolder(folderName, level);
        });
    }
  };

  // Segunda fase: procesar las pestañas normales
  const processTabs = () => {
    // Ordenar niveles para procesamiento desde el más profundo al más superficial
    const levels = Object.keys(foldersByLevel).map(Number).sort().reverse();

    for (const level of levels) {
      const folders = foldersByLevel[level] || [];
      // Luego procesar las pestañas normales
      folders
        .filter((folderName) => !isGroupFolder[folderName])
        .forEach((folderName) => {
          processFolder(folderName, level);
        });
    }
  };

  // Ejecutar las dos fases de procesamiento
  processGroups();
  processTabs();

  // Ahora armar la estructura jerárquica correctamente
  // Primero identificamos las relaciones de contenimiento
  const containerOf: Record<string, string> = {};

  // Determinación explícita para tabs basada en jerarquía, no en nombres específicos
  Object.keys(tabsMap).forEach((tabName) => {
    // Mantener un registro de si ya se asignó este tab a un grupo
    let isAssigned = false;

    // Verificar si este tab tiene una relación de padre registrada
    if (directParentOf[tabName]) {
      const parentName = directParentOf[tabName];

      // Verificar si el padre es un grupo
      const isParentGroup =
        isGroupFolder[parentName] ||
        (parentName && groupsMap[parentName] !== undefined);

      if (isParentGroup) {
        // Ya está correctamente asignado a un grupo
        isAssigned = true;
        console.log(
          `[ASIGNACIÓN VALIDADA] ${tabName} → ${parentName} (según jerarquía)`
        );
      }
    }

    // Si el tab aún no está asignado, intentar encontrar su grupo contenedor basado en su ruta
    if (!isAssigned) {
      const tabPath = originalFullPaths[tabName] || [];

      // Buscar en la ruta el grupo más cercano que debería contener este tab
      for (let i = tabPath.length - 2; i >= 0 && !isAssigned; i--) {
        let potentialParent = tabPath[i];

        // Verificar si este segmento de ruta es un grupo
        const isGroupPrefix =
          potentialParent.toLowerCase().startsWith("group:") ||
          potentialParent.toLowerCase().startsWith("grupo:") ||
          potentialParent.toLowerCase().startsWith("grouptitle:");

        if (isGroupPrefix) {
          // Limpiar el nombre del grupo
          const cleanGroupName =
            potentialParent.split(":")[1]?.trim() || potentialParent;

          console.log(
            `[ASIGNACIÓN DINÁMICA] ${tabName} → ${cleanGroupName} (basado en ruta)`
          );

          // Establecer esta asignación
          containerOf[tabName] = cleanGroupName;
          isAssigned = true;
        }
      }
    }
  });

  // Determinar qué elemento contiene a cada tab o grupo
  Object.keys({ ...tabsMap, ...groupsMap }).forEach((itemName) => {
    // Si ya tiene un contenedor explícito, no hacer nada
    if (containerOf[itemName]) return;

    // Buscar el contenedor más cercano para este elemento
    let bestContainer = null;
    let bestContainerDepth = -1;

    Object.keys({ ...tabsMap, ...groupsMap }).forEach((potentialContainer) => {
      if (itemName === potentialContainer) return; // No puede contenerse a sí mismo

      if (shouldBePlacedInside(itemName, potentialContainer)) {
        const containerPath = hierarchyPaths[potentialContainer] || [];
        if (containerPath.length > bestContainerDepth) {
          bestContainer = potentialContainer;
          bestContainerDepth = containerPath.length;
        }
      }
    });

    if (bestContainer) {
      containerOf[itemName] = bestContainer;
      console.log(
        `Determinado: ${itemName} debería estar dentro de ${bestContainer}`
      );
    }
  });

  // Colocar cada elemento en su contenedor apropiado
  const placedItems = new Set<string>();

  // Función para colocar un elemento en su contenedor
  const placeItem = (itemName: string): void => {
    if (placedItems.has(itemName)) return;

    // Verificar si este elemento tiene un contenedor
    const containerName = containerOf[itemName];
    if (containerName) {
      // Asegurarse de que el contenedor ya esté procesado primero
      placeItem(containerName);

      // Colocar este elemento en su contenedor
      const isItemGroup = isGroupFolder[itemName];
      const container = groupsMap[containerName];

      if (container) {
        if (isItemGroup) {
          // Es un grupo, colocarlo en groups
          const group = groupsMap[itemName];
          if (group && !placedItems.has(itemName)) {
            if (!container.content.groups) container.content.groups = [];
            container.content.groups.push(group);
            placedItems.add(itemName);
            console.log(
              `Colocado grupo ${itemName} dentro de ${containerName}`
            );
          }
        } else {
          // Es una tab, colocarla en subTabs
          const tab = tabsMap[itemName];
          if (tab && !placedItems.has(itemName)) {
            if (!container.content.subTabs) container.content.subTabs = [];
            container.content.subTabs.push(tab);
            placedItems.add(itemName);
            console.log(`Colocada tab ${itemName} dentro de ${containerName}`);
          }
        }
      }
    }
  };

  // Colocar todos los elementos
  Object.keys({ ...tabsMap, ...groupsMap }).forEach(placeItem);

  // Finalmente, agregar los elementos de nivel superior al contenedor principal
  Object.entries(groupsMap).forEach(([groupName, group]) => {
    if (!placedItems.has(groupName)) {
      if (!content.groups) content.groups = [];
      content.groups.push(group);
      console.log(`Agregado grupo de nivel superior: ${groupName}`);
    }
  });

  Object.entries(tabsMap).forEach(([tabName, tab]) => {
    if (!placedItems.has(tabName)) {
      if (!content.subTabs) content.subTabs = [];
      content.subTabs.push(tab);
      console.log(`Agregada tab de nivel superior: ${tabName}`);
    }
  });

  // Si tenemos archivos directos y subtabs, pero no hay un tab Principal,
  // crear un tab Principal para los archivos directos
  if (directFiles.length > 0 && content.subTabs && content.subTabs.length > 0) {
    const hasPrincipalTab = content.subTabs.some(
      (tab) => tab.name.toLowerCase() === "principal"
    );

    if (!hasPrincipalTab) {
      content.subTabs.unshift({
        id: createSanitizedId("tab", "Principal", currentPath),
        name: "Principal",
        type: "principal-tab",
        content: {
          files: directFiles,
          subTabs: [],
          groups: [],
        },
      });

      // Eliminar archivos directos ya que ahora están en el tab Principal
      content.files = [];
    }
  }

  // Verificar que todos los arrays existan (para evitar errores de null/undefined)
  if (!content.files) content.files = [];
  if (!content.subTabs) content.subTabs = [];
  if (!content.groups) content.groups = [];

  return content;
}
