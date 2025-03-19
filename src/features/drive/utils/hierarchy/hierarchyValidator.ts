/**
 * Validador de estructura jerárquica
 * Verifica que la estructura cumpla con las reglas de anidamiento
 */

import {
  HierarchyItem,
  isFileItem,
  isFolderItem,
  hasPrefix as itemHasPrefix,
  hasSuffix as itemHasSuffix,
} from "../../types/hierarchy";
import { Prefix } from "../../types/prefix";
import { Suffix } from "../../types/suffix";
import { Logger } from "../logger";

export interface ValidationIssue {
  type: "error" | "warning";
  message: string;
  itemId: string;
  itemName: string;
}

export class HierarchyValidator {
  private static logger = new Logger("HierarchyValidator");

  /**
   * Valida una estructura jerárquica completa
   * @param hierarchy Jerarquía a validar
   * @returns Lista de problemas encontrados
   */
  static validateHierarchy(hierarchy: HierarchyItem): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    this.logger.info(
      `Validando estructura jerárquica, comenzando en: ${hierarchy.name}`
    );

    // Iniciar la validación recursiva
    this.validateItem(hierarchy, issues);

    this.logger.info(
      `Validación completada. Encontrados ${issues.length} problemas.`
    );

    return issues;
  }

  /**
   * Valida un elemento específico y sus hijos
   * @param item Elemento a validar
   * @param issues Lista de problemas para agregar
   */
  private static validateItem(
    item: HierarchyItem,
    issues: ValidationIssue[]
  ): void {
    // Validar prefijos y sufijos conflictivos
    this.validatePrefixesAndSuffixes(item, issues);

    // Validar reglas específicas según el tipo de elemento
    if (isFolderItem(item)) {
      // Reglas específicas para carpetas
      this.validateFolder(item, issues);

      // Validar reglas de anidamiento para carpetas especiales
      if (itemHasPrefix(item, Prefix.TABS)) {
        this.validateTabsFolder(item, issues);
      }

      if (itemHasPrefix(item, Prefix.ACCORDION)) {
        this.validateAccordionFolder(item, issues);
      }

      // Recursivamente validar hijos
      item.children.forEach((child) => {
        this.validateItem(child, issues);

        // Validar relación padre-hijo
        this.validateParentChildRelationship(item, child, issues);
      });
    } else if (isFileItem(item)) {
      // Reglas específicas para archivos
      this.validateFile(item, issues);
    }
  }

  /**
   * Valida prefijos y sufijos conflictivos
   * @param item Elemento a validar
   * @param issues Lista de problemas para agregar
   */
  private static validatePrefixesAndSuffixes(
    item: HierarchyItem,
    issues: ValidationIssue[]
  ): void {
    // Verificar prefijos duplicados
    const uniquePrefixes = new Set(item.prefixes);
    if (uniquePrefixes.size !== item.prefixes.length) {
      issues.push({
        type: "error",
        message: "El elemento tiene prefijos duplicados",
        itemId: item.id,
        itemName: item.name,
      });
    }

    // Verificar sufijos duplicados
    const uniqueSuffixes = new Set(item.suffixes);
    if (uniqueSuffixes.size !== item.suffixes.length) {
      issues.push({
        type: "error",
        message: "El elemento tiene sufijos duplicados",
        itemId: item.id,
        itemName: item.name,
      });
    }

    // Verificar combinaciones conflictivas de prefijos
    if (itemHasPrefix(item, Prefix.TAB) && itemHasPrefix(item, Prefix.TABS)) {
      issues.push({
        type: "error",
        message:
          "El elemento no puede tener los prefijos tab_ y tabs_ simultáneamente",
        itemId: item.id,
        itemName: item.name,
      });
    }

    // Verificar combinaciones conflictivas de sufijos
    if (itemHasSuffix(item, Suffix.DARK) && itemHasSuffix(item, Suffix.LIGHT)) {
      issues.push({
        type: "error",
        message:
          "El elemento no puede tener los sufijos _dark y _light simultáneamente",
        itemId: item.id,
        itemName: item.name,
      });
    }
  }

  /**
   * Valida reglas específicas para carpetas
   * @param folder Carpeta a validar
   * @param issues Lista de problemas para agregar
   */
  private static validateFolder(
    folder: HierarchyItem,
    issues: ValidationIssue[]
  ): void {
    // Verificar carpetas vacías, excepto si tienen ciertos prefijos
    if (folder.children.length === 0) {
      // Las carpetas con prefijo tabs_ no deberían estar vacías
      if (itemHasPrefix(folder, Prefix.TABS)) {
        issues.push({
          type: "error",
          message:
            "Las carpetas tabs_ no deberían estar vacías, deben contener al menos un tab_",
          itemId: folder.id,
          itemName: folder.name,
        });
      } else {
        // Para otras carpetas es solo una advertencia
        issues.push({
          type: "warning",
          message: "La carpeta está vacía",
          itemId: folder.id,
          itemName: folder.name,
        });
      }
    }
  }

  /**
   * Valida reglas específicas para carpetas tipo tabs
   * @param tabsFolder Carpeta tabs a validar
   * @param issues Lista de problemas para agregar
   */
  private static validateTabsFolder(
    tabsFolder: HierarchyItem,
    issues: ValidationIssue[]
  ): void {
    // Las carpetas tabs deben contener al menos un tab
    const tabChildren = tabsFolder.children.filter((child) =>
      itemHasPrefix(child, Prefix.TAB)
    );

    if (tabChildren.length === 0) {
      issues.push({
        type: "error",
        message: "La carpeta tabs_ debe contener al menos un elemento tab_",
        itemId: tabsFolder.id,
        itemName: tabsFolder.name,
      });
    }

    // Verificar que no haya elementos no-tab directos (excepto los que tengan sufijo _hidden)
    const nonTabChildren = tabsFolder.children.filter(
      (child) =>
        !itemHasPrefix(child, Prefix.TAB) &&
        !itemHasSuffix(child, Suffix.HIDDEN)
    );

    if (nonTabChildren.length > 0) {
      issues.push({
        type: "warning",
        message: `La carpeta tabs_ contiene ${nonTabChildren.length} elementos que no son tab_ y no están ocultos`,
        itemId: tabsFolder.id,
        itemName: tabsFolder.name,
      });
    }
  }

  /**
   * Valida reglas específicas para carpetas tipo accordion
   * @param accordionFolder Carpeta accordion a validar
   * @param issues Lista de problemas para agregar
   */
  private static validateAccordionFolder(
    accordionFolder: HierarchyItem,
    issues: ValidationIssue[]
  ): void {
    // Reglas similares a tabs pero para accordions
    // Las carpetas accordion deben contener al menos una sección
    const sectionChildren = accordionFolder.children.filter((child) =>
      itemHasPrefix(child, Prefix.SECTION)
    );

    if (sectionChildren.length === 0) {
      issues.push({
        type: "error",
        message:
          "La carpeta accordion_ debe contener al menos un elemento section_",
        itemId: accordionFolder.id,
        itemName: accordionFolder.name,
      });
    }
  }

  /**
   * Valida reglas específicas para archivos
   * @param file Archivo a validar
   * @param issues Lista de problemas para agregar
   */
  private static validateFile(
    file: HierarchyItem,
    issues: ValidationIssue[]
  ): void {
    // Verificar prefijos que no deberían estar en archivos
    if (
      itemHasPrefix(file, Prefix.TABS) ||
      itemHasPrefix(file, Prefix.ACCORDION)
    ) {
      issues.push({
        type: "error",
        message: `El archivo no debería tener el prefijo ${
          itemHasPrefix(file, Prefix.TABS) ? "tabs_" : "accordion_"
        }, estos prefijos son para carpetas`,
        itemId: file.id,
        itemName: file.name,
      });
    }

    // Verificar archivos con sufijo _copy
    if (itemHasSuffix(file, Suffix.COPY)) {
      // TODO: Verificar que exista un archivo principal asociado
      // Esto requeriría tener acceso a todos los archivos en la estructura
    }
  }

  /**
   * Valida relaciones padre-hijo según reglas específicas
   * @param parent Elemento padre
   * @param child Elemento hijo
   * @param issues Lista de problemas para agregar
   */
  private static validateParentChildRelationship(
    parent: HierarchyItem,
    child: HierarchyItem,
    issues: ValidationIssue[]
  ): void {
    // Validar que los elementos tab_ solo estén dentro de carpetas tabs_
    if (
      itemHasPrefix(child, Prefix.TAB) &&
      !itemHasPrefix(parent, Prefix.TABS)
    ) {
      issues.push({
        type: "error",
        message: "Los elementos tab_ solo deben estar dentro de carpetas tabs_",
        itemId: child.id,
        itemName: child.name,
      });
    }
  }
}

/**
 * Genera un informe de validación más amigable
 * @param issues Problemas encontrados
 * @returns Texto del informe
 */
export function generateValidationReport(issues: ValidationIssue[]): string {
  if (issues.length === 0) {
    return "✅ La estructura jerárquica es válida. No se encontraron problemas.";
  }

  const errorsCount = issues.filter((issue) => issue.type === "error").length;
  const warningsCount = issues.filter(
    (issue) => issue.type === "warning"
  ).length;

  let report = `Informe de validación:\n`;
  report += `${errorsCount} errores, ${warningsCount} advertencias\n\n`;

  // Agrupar por tipo
  const errors = issues.filter((issue) => issue.type === "error");
  const warnings = issues.filter((issue) => issue.type === "warning");

  if (errors.length > 0) {
    report += `❌ Errores:\n`;
    errors.forEach((issue, index) => {
      report += `${index + 1}. "${issue.itemName}": ${issue.message}\n`;
    });
    report += "\n";
  }

  if (warnings.length > 0) {
    report += `⚠️ Advertencias:\n`;
    warnings.forEach((issue, index) => {
      report += `${index + 1}. "${issue.itemName}": ${issue.message}\n`;
    });
  }

  return report;
}
