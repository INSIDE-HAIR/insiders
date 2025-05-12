import { describe, it, expect } from "vitest";
import {
  HierarchyValidator,
  ValidationIssue,
  generateValidationReport,
} from "../hierarchyValidator";
import { DriveType } from "../../../types/drive";
import { Prefix } from "../../../types/prefix";
import { Suffix } from "../../../types/suffix";
import { FolderItem, HierarchyItem } from "../../../types/hierarchy";

// Función para crear un elemento de carpeta con prefijos específicos para pruebas
function createFolderWithPrefixes(
  id: string,
  name: string,
  prefixes: string[] = [],
  suffixes: string[] = [],
  children: HierarchyItem[] = []
): FolderItem {
  return {
    id,
    name,
    originalName: name,
    displayName: name.replace(/^[0-9]+_/, ""),
    driveType: DriveType.FOLDER,
    depth: 0,
    order: 0,
    prefixes: prefixes as Prefix[],
    suffixes: suffixes as Suffix[],
    children,
  };
}

// Función para crear un elemento de archivo
function createFileItem(
  id: string,
  name: string,
  prefixes: string[] = [],
  suffixes: string[] = []
) {
  return {
    id,
    name,
    originalName: name,
    displayName: name.replace(/^[0-9]+_/, ""),
    driveType: DriveType.FILE,
    depth: 0,
    order: 0,
    prefixes: prefixes as Prefix[],
    suffixes: suffixes as Suffix[],
    children: [],
    mimeType: "text/plain",
  };
}

describe("HierarchyValidator", () => {
  // Prueba simplificada para validar la estructura
  it("Debe validar la estructura y reportar problemas", () => {
    // Estructura para pruebas
    const hierarchy = createFolderWithPrefixes(
      "root",
      "Root",
      [],
      [],
      [
        createFolderWithPrefixes(
          "tabs1",
          "Tabs Container",
          [Prefix.TABS],
          [],
          []
        ),
        createFolderWithPrefixes("tab1", "Tab Suelto", [Prefix.TAB], []),
      ]
    );

    const issues = HierarchyValidator.validateHierarchy(hierarchy);

    // Verificar que hay problemas (no nos importa cuántos exactamente)
    expect(issues.length).toBeGreaterThan(0);

    // Verificar que al menos un issue es de tipo error
    const hasError = issues.some((issue) => issue.type === "error");
    expect(hasError).toBe(true);
  });

  it("Debe detectar problemas en contenedores de tabs", () => {
    // Tabs sin elementos tab (vacío)
    const hierarchy = createFolderWithPrefixes(
      "root",
      "Root",
      [],
      [],
      [
        createFolderWithPrefixes(
          "tabs1",
          "Tabs Container",
          [Prefix.TABS],
          [],
          []
        ),
      ]
    );

    const issues = HierarchyValidator.validateHierarchy(hierarchy);

    // Verificar que hay problemas
    expect(issues.length).toBeGreaterThan(0);

    // Buscar un issue específico relacionado con tabs vacíos
    const hasTabIssue = issues.some(
      (issue) => issue.itemId === "tabs1" && issue.type === "error"
    );

    expect(hasTabIssue).toBe(true);
  });

  it("Debe detectar elementos tab fuera de contenedores tabs", () => {
    // Tab fuera de un contenedor tabs
    const hierarchy = createFolderWithPrefixes(
      "root",
      "Root",
      [],
      [],
      [createFolderWithPrefixes("tab1", "Tab Suelto", [Prefix.TAB], [])]
    );

    const issues = HierarchyValidator.validateHierarchy(hierarchy);

    // Verificar que hay problemas
    expect(issues.length).toBeGreaterThan(0);

    // Buscar un issue específico relacionado con tab fuera de tabs
    const hasIssue = issues.some(
      (issue) => issue.itemId === "tab1" && issue.type === "error"
    );

    expect(hasIssue).toBe(true);
  });

  it("Debe generar reportes de validación", () => {
    // Crear algunos problemas de validación
    const mockIssues: ValidationIssue[] = [
      {
        type: "error",
        message:
          "El elemento tabs1 no contiene elementos tab como hijos directos",
        itemId: "tabs1",
        itemName: "Tabs Container",
      },
      {
        type: "warning",
        message: "El elemento tiene un prefijo no estándar",
        itemId: "file1",
        itemName: "Archivo extraño",
      },
    ];

    // Generar el reporte
    const report = generateValidationReport(mockIssues);

    // Verificar que el reporte contiene la información básica
    expect(report).toContain("validación");
    expect(report).toContain("1 errores");
    expect(report).toContain("1 advertencias");
    expect(report).toContain("Tabs Container");
    expect(report).toContain("Archivo extraño");
  });
});
