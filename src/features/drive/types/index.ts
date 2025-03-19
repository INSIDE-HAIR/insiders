/**
 * Índice de tipos para Drive
 * Exporta todos los tipos desde un único punto
 */

// Tipos básicos de Drive
export * from "./drive";

// Prefijos y sufijos - exportación con nombres específicos para evitar colisiones
export {
  Prefix,
  extractPrefixes,
  extractNumericPrefix,
  removePrefix,
} from "./prefix";
export {
  Suffix,
  extractSuffixes,
  extractAllSuffixes,
  removeSuffix,
} from "./suffix";

// Estructura jerárquica - solución al problema de nombres duplicados
export { isFileItem, isFolderItem } from "./hierarchy";

// Renombramos las funciones que tienen conflicto de nombres
export {
  hasPrefix as hierarchyHasPrefix,
  hasSuffix as hierarchyHasSuffix,
} from "./hierarchy";

// Tipos de jerarquía
export type {
  HierarchyItem,
  FileItem,
  FolderItem,
  HierarchyResponse,
  Hierarchy,
  BaseItem,
} from "./hierarchy";
