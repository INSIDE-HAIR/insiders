import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleDriveExplorer } from "../GoogleDriveExplorer";

describe("GoogleDriveExplorer", () => {
  // Mock del cliente de Drive
  let mockDrive: any;
  let explorer: GoogleDriveExplorer;

  beforeEach(() => {
    // Crear un mock básico del cliente de Drive
    mockDrive = {
      files: {
        list: vi.fn(),
      },
    };

    // Instanciar el explorador con el mock
    explorer = new GoogleDriveExplorer(mockDrive);
  });

  it("debería explorar una carpeta vacía correctamente", async () => {
    // Configurar el mock para devolver una lista vacía
    mockDrive.files.list.mockResolvedValueOnce({
      data: {
        files: [],
      },
    });

    // Ejecutar
    const result = await explorer.getFilesRecursive("folder-id");

    // Verificar
    expect(mockDrive.files.list).toHaveBeenCalledTimes(1);
    expect(mockDrive.files.list).toHaveBeenCalledWith({
      q: "'folder-id' in parents and trashed = false",
      fields:
        "files(id, name, mimeType, parents, thumbnailLink, size, modifiedTime)",
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    expect(result.files).toEqual([]);
    expect(result.folders).toEqual([]);
    expect(result.folderHierarchy).toEqual({});
    expect(result.folderMap).toEqual({});
  });

  it("debería explorar una carpeta con archivos correctamente", async () => {
    // Preparar datos de prueba
    const mockFiles = [
      {
        id: "file-1",
        name: "test-file-1.pdf",
        mimeType: "application/pdf",
        parents: ["folder-id"],
      },
      {
        id: "file-2",
        name: "test-file-2.jpg",
        mimeType: "image/jpeg",
        parents: ["folder-id"],
      },
    ];

    // Configurar el mock para devolver archivos
    mockDrive.files.list.mockResolvedValueOnce({
      data: {
        files: mockFiles,
      },
    });

    // Ejecutar
    const result = await explorer.getFilesRecursive(
      "folder-id",
      {},
      { name: "Test Folder" },
      1
    );

    // Verificar
    expect(mockDrive.files.list).toHaveBeenCalledTimes(1);
    expect(result.files).toHaveLength(2);
    expect(result.files[0].id).toBe("file-1");
    expect(result.files[0].folder).toBe("Test Folder");
    expect(result.files[0].depth).toBe(1);
    expect(result.files[1].id).toBe("file-2");

    // Verificar que se haya registrado la carpeta
    expect(result.folderMap["folder-id"]).toBeDefined();
    expect(result.folderMap["folder-id"].name).toBe("Test Folder");
    expect(result.folderHierarchy["folder-id"]).toEqual([]);
  });

  it("debería explorar una estructura con subcarpetas recursivamente", async () => {
    // Mock para la carpeta raíz con una subcarpeta
    mockDrive.files.list.mockResolvedValueOnce({
      data: {
        files: [
          {
            id: "subfolder-1",
            name: "Subfolder 1",
            mimeType: "application/vnd.google-apps.folder",
            parents: ["root-folder"],
          },
          {
            id: "file-root",
            name: "root-file.txt",
            mimeType: "text/plain",
            parents: ["root-folder"],
          },
        ],
      },
    });

    // Mock para la subcarpeta con archivos
    mockDrive.files.list.mockResolvedValueOnce({
      data: {
        files: [
          {
            id: "file-sub-1",
            name: "subfile-1.pdf",
            mimeType: "application/pdf",
            parents: ["subfolder-1"],
          },
        ],
      },
    });

    // Ejecutar
    const result = await explorer.getFilesRecursive(
      "root-folder",
      {},
      { name: "Root Folder" },
      0
    );

    // Verificar
    expect(mockDrive.files.list).toHaveBeenCalledTimes(2);

    // Verificar estructura de archivos
    expect(result.files).toHaveLength(2); // 1 en raíz, 1 en subcarpeta
    expect(result.files[0].id).toBe("file-root");
    expect(result.files[0].folder).toBe("Root Folder");
    expect(result.files[0].depth).toBe(0);
    expect(result.files[1].id).toBe("file-sub-1");
    expect(result.files[1].folder).toBe("Subfolder 1");
    expect(result.files[1].subFolder).toBe("Root Folder");
    expect(result.files[1].depth).toBe(1);

    // Verificar estructura de carpetas
    expect(result.folders).toHaveLength(2); // Raíz + subcarpeta
    expect(Object.keys(result.folderMap)).toHaveLength(2);
    expect(result.folderHierarchy["root-folder"]).toContain("subfolder-1");
  });

  it("debería manejar errores adecuadamente", async () => {
    // Configurar el mock para lanzar un error
    mockDrive.files.list.mockRejectedValueOnce(new Error("API error"));

    // Verificar que el error se propaga
    await expect(explorer.getFilesRecursive("folder-id")).rejects.toThrow(
      "Failed to explore folder: API error"
    );
  });
});
