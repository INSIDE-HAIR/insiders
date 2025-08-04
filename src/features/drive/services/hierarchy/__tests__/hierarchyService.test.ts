import { describe, it, expect, vi, beforeEach } from "vitest";
import { HierarchyService, HierarchyOptions } from "../hierarchyService";
import { GoogleDriveService } from "../../drive/GoogleDriveService";
import { FileAnalyzer } from "../../analyzer/fileAnalyzer";
import { MetadataProcessor } from "../../analyzer/metadataProcessor";
import { DriveType } from "../../../types/drive";
import { HierarchyItem, FolderItem, FileItem } from "../../../types/hierarchy";

// Mock de dependencias
vi.mock("../../drive/GoogleDriveService");
vi.mock("../../analyzer/fileAnalyzer");
vi.mock("../../analyzer/metadataProcessor");
vi.mock("../../../utils/hierarchy/hierarchyValidator");

describe("HierarchyService", () => {
  let hierarchyService: HierarchyService;
  let mockDriveService: GoogleDriveService;
  let mockFileAnalyzer: FileAnalyzer;
  let mockRootFolder: any;
  let mockFolderContents: any[];

  beforeEach(() => {
    // Limpiar mocks
    vi.clearAllMocks();

    // Crear instancias mock
    mockDriveService = new GoogleDriveService();
    mockFileAnalyzer = new FileAnalyzer();

    // Configurar comportamiento del mock
    mockRootFolder = {
      id: "root-folder",
      name: "Carpeta Raíz",
      mimeType: "application/vnd.google-apps.folder",
      description: "Carpeta principal",
      webViewLink: "https://drive.google.com/root",
      iconLink: "https://drive.google.com/icon",
      createdTime: "2023-01-01T00:00:00Z",
      modifiedTime: "2023-01-02T00:00:00Z",
      parents: [],
    };

    mockFolderContents = [
      {
        id: "folder1",
        name: "01_Sección Principal",
        mimeType: "application/vnd.google-apps.folder",
        description: "Sección principal",
        parents: ["root-folder"],
      },
      {
        id: "file1",
        name: "documento.pdf",
        mimeType: "application/pdf",
        description: "Un documento",
        parents: ["root-folder"],
        size: 12345,
      },
      {
        id: "folder2",
        name: "02_Recursos",
        mimeType: "application/vnd.google-apps.folder",
        description: "Carpeta de recursos",
        parents: ["root-folder"],
      },
    ];

    // Configurar los mocks
    vi.mocked(mockDriveService.getFolder).mockResolvedValue(mockRootFolder);
    vi.mocked(mockDriveService.getFolderContents).mockImplementation(
      async (folderId) => {
        if (folderId === "root-folder") {
          return mockFolderContents;
        }
        if (folderId === "folder1") {
          return [
            {
              id: "subfolder1",
              name: "tab_Opción 1",
              mimeType: "application/vnd.google-apps.folder",
              parents: ["folder1"],
            },
          ];
        }
        if (folderId === "folder2") {
          return [
            {
              id: "file2",
              name: "imagen.jpg",
              mimeType: "image/jpeg",
              parents: ["folder2"],
              size: 54321,
            },
          ];
        }
        return [];
      }
    );

    vi.mocked(mockDriveService.isFolder).mockImplementation(
      (item) => item.mimeType === "application/vnd.google-apps.folder"
    );

    // Crear la instancia a probar
    hierarchyService = new HierarchyService(mockDriveService, mockFileAnalyzer);
  });

  it("Debe construir correctamente la jerarquía desde la raíz", async () => {
    const options: HierarchyOptions = {
      rootFolderId: "root-folder",
      maxDepth: 2,
    };

    const result = await hierarchyService.buildHierarchy(options);

    // Verificar estructura base
    expect(result).toBeDefined();
    expect(result.rootId).toBe("root-folder");
    expect(result.root).toBeDefined();
    expect(result.root.id).toBe("root-folder");

    // Verificar estadísticas
    expect(result.stats).toBeDefined();
    expect(result.stats.totalItems).toBeGreaterThan(0);
    expect(result.stats.totalFolders).toBeGreaterThan(0);
    expect(result.stats.totalFiles).toBeGreaterThan(0);

    // Verificar estructura jerárquica
    expect(result.root.children.length).toBe(3);

    // Verificar ordenamiento (carpetas primero, luego por número)
    expect(result.root.children[0]?.id).toBe("folder1");
    expect(result.root.children[1]?.id).toBe("folder2");
    expect(result.root.children[2]?.id).toBe("file1");
  });

  it("Debe manejar correctamente la profundidad máxima", async () => {
    // Caso 1: Profundidad máxima normal
    const result1 = await hierarchyService.buildHierarchy({
      rootFolderId: "root-folder",
      maxDepth: 2,
    });

    // Verificar que se exploró hasta la profundidad 2
    const folder1 = result1.root.children.find(
      (item) => item.id === "folder1"
    ) as FolderItem;
    expect(folder1.children.length).toBeGreaterThan(0);

    // Caso 2: Profundidad limitada a 0
    const result2 = await hierarchyService.buildHierarchy({
      rootFolderId: "root-folder",
      maxDepth: 0,
    });

    // La raíz debería tener hijos vacíos
    expect(result2.root.children.length).toBe(0);
  });

  it("Debe filtrar elementos ocultos correctamente", async () => {
    // Añadir un elemento oculto
    mockFolderContents.push({
      id: "hidden-file",
      name: "elemento_hidden",
      mimeType: "text/plain",
      parents: ["root-folder"],
    });

    // Caso 1: Sin incluir ocultos
    const result1 = await hierarchyService.buildHierarchy({
      rootFolderId: "root-folder",
      includeHidden: false,
    });

    // Verificar que no hay elementos con _hidden
    const hasHiddenElements1 = result1.root.children.some((item) =>
      item.name.includes("_hidden")
    );
    expect(hasHiddenElements1).toBe(false);

    // Caso 2: Incluyendo ocultos
    const result2 = await hierarchyService.buildHierarchy({
      rootFolderId: "root-folder",
      includeHidden: true,
    });

    // Debe incluir el elemento oculto
    const hasHiddenElements2 = result2.root.children.some((item) =>
      item.name.includes("_hidden")
    );
    expect(hasHiddenElements2).toBe(true);
  });

  it("Debe extraer correctamente prefijos numéricos", () => {
    // Acceder al método privado
    const extractNumericPrefix = (hierarchyService as any).extractNumericPrefix;

    // Probar diferentes formatos
    expect(extractNumericPrefix("01_Sección")).toBe(1);
    expect(extractNumericPrefix("10-Elemento")).toBe(10);
    expect(extractNumericPrefix("999_Item")).toBe(999);

    // Casos negativos
    expect(extractNumericPrefix("Sección")).toBeNull();
    expect(extractNumericPrefix("A01_Sección")).toBeNull();
  });

  it("Debe aplanar correctamente la jerarquía", () => {
    // Crear una jerarquía simple para probar
    const folder: FolderItem = {
      id: "test-folder",
      name: "Test Folder",
      originalName: "Test Folder",
      displayName: "Test Folder",
      driveType: DriveType.FOLDER,
      depth: 0,
      order: 0,
      prefixes: [],
      suffixes: [],
      children: [
        {
          id: "test-file",
          name: "Test File",
          originalName: "Test File",
          displayName: "Test File",
          driveType: DriveType.FILE,
          depth: 1,
          order: 0,
          prefixes: [],
          suffixes: [],
          mimeType: "text/plain",
          children: [],
        },
        {
          id: "test-subfolder",
          name: "Test Subfolder",
          originalName: "Test Subfolder",
          displayName: "Test Subfolder",
          driveType: DriveType.FOLDER,
          depth: 1,
          order: 0,
          prefixes: [],
          suffixes: [],
          children: [
            {
              id: "nested-file",
              name: "Nested File",
              originalName: "Nested File",
              displayName: "Nested File",
              driveType: DriveType.FILE,
              depth: 2,
              order: 0,
              prefixes: [],
              suffixes: [],
              mimeType: "text/plain",
              children: [],
            },
          ],
        },
      ],
    };

    const flatMap = hierarchyService.flattenHierarchy(folder);

    // Verificar que todos los elementos están en el mapa
    expect(flatMap.size).toBe(4);
    expect(flatMap.has("test-folder")).toBe(true);
    expect(flatMap.has("test-file")).toBe(true);
    expect(flatMap.has("test-subfolder")).toBe(true);
    expect(flatMap.has("nested-file")).toBe(true);
  });

  it("Debe encontrar correctamente elementos por ID", () => {
    // Crear una jerarquía simple para probar
    const folder: FolderItem = {
      id: "test-folder",
      name: "Test Folder",
      originalName: "Test Folder",
      displayName: "Test Folder",
      driveType: DriveType.FOLDER,
      depth: 0,
      order: 0,
      prefixes: [],
      suffixes: [],
      children: [
        {
          id: "test-file",
          name: "Test File",
          originalName: "Test File",
          displayName: "Test File",
          driveType: DriveType.FILE,
          depth: 1,
          order: 0,
          prefixes: [],
          suffixes: [],
          mimeType: "text/plain",
          children: [],
        },
      ],
    };

    // Buscar elementos
    const foundItem = hierarchyService.findItemById(folder, "test-file");
    const notFoundItem = hierarchyService.findItemById(folder, "nonexistent");

    // Verificar resultados
    expect(foundItem).toBeDefined();
    expect(foundItem?.id).toBe("test-file");
    expect(notFoundItem).toBeNull();
  });
});
