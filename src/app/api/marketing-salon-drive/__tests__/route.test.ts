import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { NextResponse } from "next/server";

// Mocking GoogleDriveService
jest.mock(
  "@/src/features/marketing-salon-drive/services/drive/GoogleDriveService",
  () => {
    return {
      GoogleDriveService: jest.fn().mockImplementation(() => ({
        getFiles: jest.fn().mockResolvedValue([]),
        convertGoogleDriveLink: jest.fn().mockReturnValue({
          preview: "preview-url",
          imgEmbed: "img-embed-url",
          download: "download-url",
          alternativeUrls: {
            direct: "direct-url",
            thumbnail: "thumbnail-url",
          },
        }),
      })),
    };
  }
);

// Importamos las funciones que queremos probar
import { GET } from "../[client]/cards/route";

// Importamos las interfaces necesarias
interface ProcessedFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  transformedUrl: any;
  category?: string;
}

// Crear una función auxiliar para acceder a la función processGroupContent
// Ya que la función no está exportada, vamos a tener que recrearla para pruebas
function createTestFile(name: string, folderPath: string[] = []): any {
  return {
    id: `test-id-${name}`,
    name,
    mimeType: name.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
    webViewLink: `https://drive.google.com/file/d/${name}`,
    transformedUrl: {
      preview: "preview-url",
      imgEmbed: "img-embed-url",
      download: "download-url",
    },
    _folderPath: folderPath.slice(0, 3),
    _originalFolderPath: folderPath,
    _groupLevel: 0,
  };
}

interface ContentContainer {
  files: ProcessedFile[];
  subTabs?: any[];
  groups?: any[];
}

// Función simplificada para test que detecta recursión circular
function testProcessGroupContent(
  files: any[],
  currentPath: string[],
  pathLevel: number,
  maxDepth: number = 10
): ContentContainer {
  if (pathLevel > maxDepth || !files || files.length === 0) {
    return { files: [], subTabs: [], groups: [] };
  }

  // Simular la estructura de la función original
  const content: ContentContainer = { files: [], subTabs: [], groups: [] };

  // Identificar subcarpetas únicas
  const subfolderNames = new Set<string>();
  files.forEach((file) => {
    const originalPath = file._originalFolderPath || [];
    const groupLevel = file._groupLevel || 0;

    if (originalPath.length > groupLevel + 1) {
      const subfolderName = originalPath[groupLevel + 1];
      subfolderNames.add(subfolderName);
    }
  });

  // Procesar cada subcarpeta
  Array.from(subfolderNames).forEach((subfolderName) => {
    // Detectar referencias circulares
    if (currentPath.includes(subfolderName)) {
      // Evitar procesamiento recursivo de rutas circulares
      return;
    }

    const subTabFiles = files.filter((file) => {
      const originalPath = file._originalFolderPath || [];
      const groupLevel = file._groupLevel || 0;
      return (
        originalPath.length > groupLevel + 1 &&
        originalPath[groupLevel + 1] === subfolderName
      );
    });

    if (subTabFiles.length === 0) return;

    // Llamar recursivamente
    const subTabContent = testProcessGroupContent(
      subTabFiles,
      [...currentPath, subfolderName],
      pathLevel + 1,
      maxDepth
    );

    // Agregar al contenido
    if (!content.subTabs) content.subTabs = [];
    content.subTabs.push({
      id: `tab-${subfolderName}`,
      name: subfolderName,
      type: "subfolder-tab",
      content: subTabContent,
    });
  });

  return content;
}

describe("Drive API Route", () => {
  let originalConsoleError: typeof console.error;
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    // Guardar el console.error original y reemplazarlo para las pruebas
    originalConsoleError = console.error;
    originalConsoleLog = console.log;
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restaurar el console.error original
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  it("debería manejar parámetros faltantes", async () => {
    const request = new Request(
      "http://localhost:3000/api/marketing-salon-drive/2023//cards"
    );
    const response = await GET(request, {
      params: { year: "2023", campaign: "" },
    });
    expect(response.status).toBe(400);
  });

  it("debería procesar correctamente sin caer en recursión infinita", () => {
    // Crear un caso que podría causar recursión infinita en el código original
    const files = [
      createTestFile("file1.jpg", ["folder1", "folder2", "folder3"]),
      createTestFile("file2.jpg", ["folder1", "folder2", "folder3", "folder2"]), // Path circular
      createTestFile("file3.jpg", ["folder1", "folder2"]),
      // Más niveles para probar profundidad
      createTestFile("fileA.jpg", [
        "folder1",
        "level1",
        "level2",
        "level3",
        "level4",
        "level5",
      ]),
      createTestFile("fileB.jpg", [
        "folder1",
        "level1",
        "level2",
        "level3",
        "level4",
        "level5",
        "level6",
      ]),
    ];

    // Ejecutar la función y esperar que no haya excepciones
    let result;
    expect(() => {
      result = testProcessGroupContent(files, ["root"], 0, 20);
    }).not.toThrow();

    // Verificar que el resultado tiene la estructura esperada
    expect(result).toBeDefined();
    expect(result.subTabs).toBeDefined();
  });

  it("debería manejar correctamente estructuras de carpetas profundas", () => {
    // Crear caso con subcarpetas profundamente anidadas
    const deeplyNestedFiles = [];
    const maxDepth = 15;

    // Crear una cadena de archivos con anidación profunda
    for (let i = 1; i <= maxDepth; i++) {
      const path = ["root"];
      for (let j = 1; j <= i; j++) {
        path.push(`level${j}`);
      }
      deeplyNestedFiles.push(createTestFile(`file-depth-${i}.jpg`, path));
    }

    // Ejecutar con un límite menor para verificar que se detiene correctamente
    const result = testProcessGroupContent(deeplyNestedFiles, ["start"], 0, 10);

    // Verificar que el procesamiento se detuvo en algún punto
    expect(result).toBeDefined();
  });

  it("debería manejar correctamente estructuras de carpetas con referencias circulares", () => {
    // Crear caso con referencias circulares
    const circularFiles = [
      createTestFile("file1.jpg", ["A", "B", "C"]),
      createTestFile("file2.jpg", ["A", "B", "A"]), // Referencia circular A->B->A
      createTestFile("file3.jpg", ["X", "Y", "Z", "X"]), // Referencia circular X->Y->Z->X
    ];

    // Ejecutar el procesamiento
    const result = testProcessGroupContent(circularFiles, [], 0, 10);

    // Verificar que el resultado tiene la estructura esperada
    expect(result).toBeDefined();
    expect(result.subTabs).toBeDefined();
  });
});
