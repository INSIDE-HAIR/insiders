/**
 * Tipos fundamentales para trabajar con Google Drive
 * Define la estructura básica de archivos y carpetas
 */

/**
 * Tipos de elementos fundamentales en Google Drive
 */
export enum DriveType {
  FILE = "file",
  FOLDER = "folder",
}

/**
 * Datos originales de Google Drive (simplificados)
 */
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  webViewLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  size?: string;
}

/**
 * Datos originales de carpeta de Google Drive
 */
export interface GoogleDriveFolder {
  id: string;
  name: string;
  mimeType: "application/vnd.google-apps.folder";
  parents?: string[];
}

/**
 * Archivo procesado con información adicional
 */
export interface DriveFile {
  id: string;
  name: string;
  originalName: string;
  displayName: string;
  mimeType: string;
  parents?: string[];
  webViewLink?: string;
  thumbnailLink?: string;

  // Campos agregados
  driveType: DriveType.FILE;
  depth: number; // Profundidad en la jerarquía
  folder?: string; // Carpeta nivel 1
  subFolder?: string; // Carpeta nivel 2
  prefixes: string[]; // Prefijos identificados en el nombre (ej: "01_", "tab_")
  suffixes: string[]; // Sufijos identificados en el nombre (ej: "_hidden", "_copy")
  order: number; // Orden extraído del prefijo numérico

  transformedUrl?: {
    // URLs procesadas
    preview: string;
    download: string;
    embed?: string;
  };

  size?: string;
  modifiedTime?: string;
  metadata?: Record<string, any>; // Metadatos adicionales
}

/**
 * Carpeta procesada con información adicional
 */
export interface DriveFolder {
  id: string;
  name: string;
  originalName: string;
  displayName: string;
  mimeType: "application/vnd.google-apps.folder";
  parents?: string[];

  // Campos agregados
  driveType: DriveType.FOLDER;
  depth: number; // Profundidad en la jerarquía
  prefixes: string[]; // Prefijos identificados en el nombre (ej: "01_", "tab_")
  suffixes: string[]; // Sufijos identificados en el nombre (ej: "_hidden", "_copy")
  order: number; // Orden extraído del prefijo numérico
  children?: string[]; // IDs de elementos hijos (archivos o carpetas)

  metadata?: Record<string, any>; // Metadatos adicionales
}

/**
 * Mapa de carpetas para facilitar la navegación
 */
export interface FolderMap {
  [key: string]: DriveFolder;
}

/**
 * Respuesta del servicio de Drive
 */
export interface DriveResponse {
  files: DriveFile[];
  folders: DriveFolder[];
  folderMap: FolderMap;
}

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  size?: string;
  parents?: string[];
  isFolder?: boolean;
  isShared?: boolean;
  isStarred?: boolean;
  isTrashed?: boolean;
  isShortcut?: boolean;
  shortcutDetails?: any;
  permissions?: any[];
  capabilities?: {
    canAddChildren?: boolean;
    canAddMyDriveParent?: boolean;
    canAddSharedDriveParent?: boolean;
    canChangeCopyRequiresWriterPermission?: boolean;
    canChangeRestrictedDownload?: boolean;
    canChangeSecurityUpdateEnabled?: boolean;
    canComment?: boolean;
    canCopy?: boolean;
    canDelete?: boolean;
    canDownload?: boolean;
    canEdit?: boolean;
    canListChildren?: boolean;
    canModifyContent?: boolean;
    canModifyContentRestriction?: boolean;
    canModifyLabels?: boolean;
    canMoveChildrenWithinDrive?: boolean;
    canMoveItemIntoTeamDrive?: boolean;
    canMoveItemOutOfDrive?: boolean;
    canMoveItemWithinDrive?: boolean;
    canReadLabels?: boolean;
    canReadRevisions?: boolean;
    canRemoveChildren?: boolean;
    canRemoveMyDriveParent?: boolean;
    canRemoveSharedDriveParent?: boolean;
    canRename?: boolean;
    canShare?: boolean;
    canTrash?: boolean;
    canUntrash?: boolean;
  };
  labels?: {
    starred?: boolean;
    hidden?: boolean;
    trashed?: boolean;
    restricted?: boolean;
    viewed?: boolean;
    modified?: boolean;
    created?: boolean;
    shared?: boolean;
  };
  owners?: any[];
  lastModifyingUser?: any;
  shared?: boolean;
  ownedByMe?: boolean;
  viewersCanCopyContent?: boolean;
  copyRequiresWriterPermission?: boolean;
  writersCanShare?: boolean;
  permissionIds?: string[];
  spaces?: string[];
  teamDriveId?: string | null;
  driveId?: string | null;
  md5Checksum?: string | null;
  sha1Checksum?: string | null;
  sha256Checksum?: string | null;
  quotaBytesUsed?: string;
  version?: string;
  headRevisionId?: string | null;
  imageMediaMetadata?: any;
  videoMediaMetadata?: any;
  isAppAuthorized?: boolean;
  exportLinks?: any;
  contentRestrictions?: any[];
  resourceKey?: string | null;
  linkShareMetadata?: any;
  labelInfo?: any;
}
