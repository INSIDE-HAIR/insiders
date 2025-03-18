export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  description?: string;
  year?: string;
  campaign?: string;
  client?: string;
  folder?: string;
  subFolder?: string;
  subSubFolder?: string;
  nestedPath?: string[];
  transformedUrl?: GoogleDriveLinks;
  category?: string;
  order?: number;
  groupTitle?: string;
  isHidden?: boolean;
  depth?: number;
  size?: string;
  modifiedTime?: string;
  badges?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: "application/vnd.google-apps.folder";
  parents?: string[];
  isFolder?: boolean;
  subfoldersIds?: string[];
  parentFolder?: string;
  year?: string;
  campaign?: string;
  client?: string;
  isEmpty?: boolean;
  isHidden?: boolean;
  badges?: string[];
  depth?: number;
}

export interface GoogleDriveLinks {
  preview: string;
  imgEmbed?: string;
  download: string;
  previewUrl?: string;
  downloadUrl?: string;
  alternativeUrls?: {
    direct: string;
    thumbnail: string;
    proxy?: string;
    video?: string;
    photos?: string;
  };
}

export interface DriveMarketingCard extends DriveFile {
  transformedUrl: GoogleDriveLinks;
  category?: string;
  order?: number;
  groupTitle?: string;
  copy?: string;
}

// Updated interfaces for the sidebar structure
export interface ContentContainer {
  files: DriveFile[];
  subTabs?: TabItem[];
  groups?: GroupItem[];
}

export interface TabItem {
  id: string;
  name: string;
  type: "tab" | "subtab" | "subfolder-in-group" | "pattern-based-tab" | string;
  content: ContentContainer;
  isEmpty?: boolean;
  badges?: string[];
}

export interface GroupItem {
  id: string;
  name: string;
  type: string;
  content: ContentContainer;
  isEmpty?: boolean;
  badges?: string[];
}

export interface SidebarItem {
  id: string;
  name: string;
  type: string;
  content: {
    tabs: TabItem[];
  };
  isEmpty?: boolean;
  badges?: string[];
}

export interface DriveApiMetadata {
  year: string;
  campaign: string;
  client: string | null;
  totalFiles: number;
  lastUpdated: string;
  categoryStats: Record<string, number>;
}

export interface DriveApiResponse {
  success: boolean;
  data: {
    sidebar: SidebarItem[];
    metadata: DriveApiMetadata;
  };
}

export interface HierarchyItem {
  /** Identificador único del elemento */
  id: string;
  /** Nombre del elemento (mantenido por compatibilidad) */
  name: string;
  /** Nombre original del elemento sin modificaciones */
  originalName?: string;
  /** Nombre del elemento para mostrar (sin prefijos/sufijos) */
  customName?: string;
  /** Tipo de elemento en Google Drive: 'file' o 'folder' */
  driveType: "folder" | "file";
  /** Elementos hijos (archivos o subcarpetas) */
  childrens: HierarchyItem[];
  /** Orden numérico extraído del prefijo (menor número = mayor prioridad) */
  order?: number;
  /** Nivel de profundidad en la jerarquía (0 para la raíz, aumenta con cada nivel) */
  depth: number;
  /** Indica si el elemento está oculto */
  isHidden?: boolean;
  /** Indica si la carpeta está vacía */
  isEmpty?: boolean;
  /** Etiquetas asociadas al elemento */
  badges?: string[];
}

/**
 * Estructura de mapa de jerarquía
 * Utilizada para mantener compatibilidad con el código existente
 */
export interface HierarchyMap {
  /** Elemento raíz de la jerarquía */
  root: any;
  /** Mapa de pestañas por ID */
  tabs: Record<string, any>;
  /** Lista de IDs de pestañas */
  tabsIds: string[];
  /** Mapa de grupos por ID */
  groups: Record<string, any>;
  /** Lista de IDs de grupos */
  groupsIds: string[];
  /** Mapa de elementos individuales por ID */
  items: Record<string, any>;
  /** Lista de IDs de elementos individuales */
  itemsIds: string[];
}
