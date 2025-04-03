/**
 * Tipos de contenido para componentes de Marketing Salon
 * Este archivo sirve como puente entre los componentes y los tipos de Drive
 */

import {
  HierarchyItem,
  FileItem,
  FolderItem,
  DriveType,
  Prefix,
  Suffix,
} from "@/src/features/drive/types";

// Definimos una interfaz completa que incluye todas las propiedades necesarias
export interface ContentItem {
  // Propiedades básicas
  id: string;
  name: string;
  originalName: string;
  displayName: string;
  mimeType?: string;
  driveType: DriveType;

  // Metadatos
  description?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;

  // Estructura jerárquica
  children: ContentItem[];
  parentId?: string;
  depth: number;
  order: number;

  // Prefijos y sufijos
  prefixes: string[];
  suffixes: string[];

  // URLs procesadas
  transformedUrl?: {
    preview?: string;
    download?: string;
    embed?: string;
  };

  // Propiedades adicionales para casos específicos
  formUrl?: string;
  previewItems?: ContentItem[];
  isPreviewOf?: string;
  previewPattern?: string;
  baseName?: string;
  isActive?: boolean;
  isEditable?: boolean;
  fullPath?: string;
}

// Re-exportamos otros tipos útiles
export type { FileItem, FolderItem };
export { DriveType, Prefix, Suffix };

// Re-exportamos funciones de utilidad
export {
  isFileItem,
  isFolderItem,
  hierarchyHasPrefix as hasPrefix,
  hierarchyHasSuffix as hasSuffix,
} from "@/src/features/drive/types";
