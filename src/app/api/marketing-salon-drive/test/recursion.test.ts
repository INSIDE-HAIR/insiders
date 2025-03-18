import { describe, it, expect } from "vitest";

// Crear una versión simplificada de las interfaces para nuestras pruebas
type ProcessedFile = {
  id: string;
  name: string;
  mimeType: string;
};

type ContentContainer = {
  files: ProcessedFile[];
  subTabs?: any[];
  groups?: any[];
};

// Función simplificada para test que detecta recursión circular
function testProcessGroupContent(
  files: any[],
  currentPath: string[],
  pathLevel: number,
  maxDepth: number = 10
): ContentContainer {
  // Condición de salida
  if (pathLevel > maxDepth || !files || files.length === 0) {
    return { files: [], subTabs: [], groups: [] };
  }

  // Contenedor para esta iteración
  const content: ContentContainer = { files: [], subTabs: [], groups: [] };

  // Identificar carpetas únicas
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

// Función auxiliar para crear archivos de test
function createTestFile(name: string, folderPath: string[] = []): any {
  return {
    id: `test-id-${name}`,
    name,
    mimeType: name.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
    _folderPath: folderPath.slice(0, 3),
    _originalFolderPath: folderPath,
    _groupLevel: 0,
  };
}

describe("Recursive Function Tests", () => {
  it("should handle deeply nested folders without infinite recursion", () => {
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

    // Ejecutar con un límite de profundidad y esperar que no falle
    let result;
    expect(() => {
      result = testProcessGroupContent(deeplyNestedFiles, ["start"], 0, 10);
    }).not.toThrow();

    // Verificar que el resultado existe y es una estructura de datos válida
    expect(result).toBeDefined();
  });

  it("should detect and handle circular references", () => {
    // Caso con referencias circulares
    const circularFiles = [
      createTestFile("file1.jpg", ["A", "B", "C"]),
      createTestFile("file2.jpg", ["A", "B", "A"]), // Referencia circular A->B->A
      createTestFile("file3.jpg", ["X", "Y", "Z", "X"]), // Referencia circular X->Y->Z->X
    ];

    // Ejecutar y verificar que no cae en recursión infinita
    let result;
    expect(() => {
      result = testProcessGroupContent(circularFiles, [], 0, 10);
    }).not.toThrow();

    // Verificar que el resultado existe
    expect(result).toBeDefined();
  });
});
