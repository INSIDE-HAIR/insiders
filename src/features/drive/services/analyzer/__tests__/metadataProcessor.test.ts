import { describe, it, expect, vi, beforeEach } from "vitest";
import { MetadataProcessor } from "../metadataProcessor";
import { GoogleDriveService } from "../../drive/GoogleDriveService";
import { FileAnalyzer } from "../fileAnalyzer";
import { FileItem } from "../../../types/hierarchy";
import { DriveType } from "../../../types/drive";
import { Suffix } from "../../../types/suffix";

describe("MetadataProcessor", () => {
  let metadataProcessor: MetadataProcessor;
  let mockDriveService: GoogleDriveService;
  let mockFileAnalyzer: FileAnalyzer;
  let mockItems: any[];

  beforeEach(() => {
    // Crear mocks para las dependencias
    mockDriveService = {
      getFileContent: vi.fn().mockImplementation((id) => {
        // Implementar el mock para getFileContent
        if (id === "copy1") {
          return Promise.resolve(
            "title: Título personalizado\ndescription: Esta es una descripción personalizada"
          );
        } else if (id === "copy2") {
          return Promise.resolve(
            JSON.stringify({
              title: "Título en JSON",
              priority: "alta",
            })
          );
        }
        return Promise.resolve(null);
      }),
    } as unknown as GoogleDriveService;

    mockFileAnalyzer = {} as FileAnalyzer;

    // Crear el procesador con los mocks
    metadataProcessor = new MetadataProcessor(
      mockDriveService,
      mockFileAnalyzer
    );

    // Crear datos de prueba
    const mainFile1: FileItem = {
      id: "file1",
      name: "documento.pdf",
      originalName: "documento.pdf",
      displayName: "documento",
      driveType: DriveType.FILE,
      depth: 1,
      order: 0,
      prefixes: [],
      suffixes: [],
      mimeType: "application/pdf",
      parents: ["folder1"],
      children: [],
    };

    const copyFile1: FileItem = {
      id: "copy1",
      name: "documento_copy.txt",
      originalName: "documento_copy.txt",
      displayName: "documento_copy",
      driveType: DriveType.FILE,
      depth: 1,
      order: 0,
      prefixes: [],
      suffixes: [Suffix.COPY],
      mimeType: "text/plain",
      parents: ["folder1"],
      children: [],
    };

    const mainFile2: FileItem = {
      id: "file2",
      name: "imagen.jpg",
      originalName: "imagen.jpg",
      displayName: "imagen",
      driveType: DriveType.FILE,
      depth: 1,
      order: 0,
      prefixes: [],
      suffixes: [],
      mimeType: "image/jpeg",
      parents: ["folder1"],
      children: [],
    };

    const copyFile2: FileItem = {
      id: "copy2",
      name: "imagen_copy.json",
      originalName: "imagen_copy.json",
      displayName: "imagen_copy",
      driveType: DriveType.FILE,
      depth: 1,
      order: 0,
      prefixes: [],
      suffixes: [Suffix.COPY],
      mimeType: "application/json",
      parents: ["folder1"],
      children: [],
    };

    mockItems = [mainFile1, copyFile1, mainFile2, copyFile2];
  });

  it("Debe identificar correctamente archivos con sufijo _copy", () => {
    // Acceder al método privado mediante any
    const copyFiles = (metadataProcessor as any).identifyCopyFiles(mockItems);

    expect(copyFiles.length).toBe(2);
    expect(copyFiles[0].id).toBe("copy1");
    expect(copyFiles[1].id).toBe("copy2");
  });

  it("Debe encontrar el archivo principal correspondiente a un archivo _copy", () => {
    const copyFile = mockItems[1] as FileItem; // documento_copy.txt

    // Acceder al método privado mediante any
    const mainFile = (metadataProcessor as any).findMainFile(
      mockItems,
      copyFile
    );

    expect(mainFile).toBeDefined();
    expect(mainFile?.id).toBe("file1");
    expect(mainFile?.name).toBe("documento.pdf");
  });

  it("Debe procesar metadatos en formato de texto", async () => {
    await metadataProcessor.processMetadata(mockItems);

    // Verificar que se llamó a getFileContent para los archivos _copy
    expect(mockDriveService.getFileContent).toHaveBeenCalledWith("copy1");
    expect(mockDriveService.getFileContent).toHaveBeenCalledWith("copy2");

    // Verificar que los metadatos se asignaron correctamente
    const mainFile1 = mockItems.find((item) => item.id === "file1");
    expect(mainFile1?.metadata).toBeDefined();
    expect(mainFile1?.metadata?.title).toBe("Título personalizado");
    expect(mainFile1?.metadata?.description).toBe(
      "Esta es una descripción personalizada"
    );
  });

  it("Debe procesar metadatos en formato JSON", async () => {
    await metadataProcessor.processMetadata(mockItems);

    const mainFile2 = mockItems.find((item) => item.id === "file2");
    expect(mainFile2?.metadata).toBeDefined();
    expect(mainFile2?.metadata?.title).toBe("Título en JSON");
    expect(mainFile2?.metadata?.priority).toBe("alta");
  });

  it("Debe aplicar metadatos especiales para cambiar displayName", () => {
    // Preparar datos: asignar metadatos manualmente
    const mainFile = mockItems[0] as FileItem;
    mainFile.metadata = { title: "Título desde metadatos" };

    metadataProcessor.processSpecialMetadata(mockItems);

    expect(mainFile.displayName).toBe("Título desde metadatos");
  });
});
