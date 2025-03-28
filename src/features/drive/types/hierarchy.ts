/**
 * Tipos de datos para la jerarquía de elementos provenientes de Google Drive
 * Estos tipos son utilizados para transformar la estructura plana de Google Drive
 * en una estructura jerárquica que puede ser visualizada en la aplicación.
 */

import { DriveType } from "./drive";
import { Prefix } from "./prefix";
import { Suffix } from "./suffix";

/**
 * Base común para cualquier elemento de la jerarquía
 */
export interface BaseItem {
  id: string; // ID original (de Google Drive o generado)
  name: string; // Nombre completo (incluye prefijos/sufijos)
  originalName: string; // Nombre original sin procesar
  displayName: string; // Nombre para mostrar (sin prefijos de orden/tipo)

  // Atributos clave
  driveType: DriveType; // Tipo fundamental: file o folder

  // Metadatos de jerarquía
  depth: number; // Profundidad en la estructura
  order: number; // Orden extraído del prefijo numérico

  // Prefijos y sufijos que determinan comportamiento
  prefixes: Prefix[]; // Lista de prefijos detectados
  suffixes: Suffix[]; // Lista de sufijos detectados

  // Estructura jerárquica
  children: HierarchyItem[]; // Elementos hijos (recursivo)
  parentId?: string; // ID del elemento padre

  // Metadatos adicionales
  description?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  parents?: string[];
  mimeType?: string;
  metadata?: Record<string, any>; // Metadatos adicionales
}

/**
 * Extensión para archivos
 */
export interface FileItem extends BaseItem {
  driveType: DriveType.FILE;
  mimeType: string;
  thumbnailLink?: string;
  transformedUrl?: {
    preview: string;
    download: string;
    embed?: string;
  };
  size?: string;
  modifiedTime?: string;
  hasThumbnail?: boolean;
  md5Checksum?: string;
  previewItems?: FileItem[];
  isPreviewOf?: string;
  previewPattern?: string;
  baseName?: string;
}

/**
 * Extensión para carpetas
 */
export interface FolderItem extends BaseItem {
  driveType: DriveType.FOLDER;
  // No necesita campos adicionales específicos
}

/**
 * Unión de tipos posibles para usar en la jerarquía
 */
export type HierarchyItem = FileItem | FolderItem;

/**
 * Estructura jerárquica completa
 */
export interface Hierarchy {
  root: HierarchyItem; // Elemento raíz de la jerarquía
  itemsMap: Map<string, HierarchyItem>; // Mapa para acceso rápido a elementos por ID
}

/**
 * Interfaz para la respuesta completa de la jerarquía
 */
export interface HierarchyResponse {
  rootId: string;
  root: FolderItem;
  itemsMap: Map<string, HierarchyItem>;
  stats: {
    totalItems: number;
    totalFiles: number;
    totalFolders: number;
    maxDepth: number;
    buildTime: number;
  };
}

/**
 * Verifica si un elemento es un archivo
 */
export function isFileItem(item: HierarchyItem): item is FileItem {
  return item.driveType === DriveType.FILE;
}

/**
 * Verifica si un elemento es una carpeta
 */
export function isFolderItem(item: HierarchyItem): item is FolderItem {
  return item.driveType === DriveType.FOLDER;
}

/**
 * Verifica si un elemento tiene un prefijo específico
 */
export function hasPrefix(item: HierarchyItem, prefix: Prefix): boolean {
  return item.prefixes?.includes(prefix) ?? false;
}

/**
 * Verifica si un elemento tiene un sufijo específico
 * @param item Elemento a verificar
 * @param suffix Sufijo a buscar
 * @returns true si el elemento tiene el sufijo
 */
export function hasSuffix(item: HierarchyItem, suffix: Suffix): boolean {
  return item.suffixes?.includes(suffix) ?? false;
}
