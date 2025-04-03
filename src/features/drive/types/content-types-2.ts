/**
 * Este archivo reexporta los tipos desde @/src/features/drive/types
 * para mantener compatibilidad con componentes que importan desde aquí
 */

export type {
  HierarchyItem as ContentItem,
  FileItem,
  FolderItem,
  BaseItem,
} from "@/src/features/drive/types/hierarchy";

// Reexportar otros tipos que puedan ser necesarios
export * from "@/src/features/drive/types/prefix";
export * from "@/src/features/drive/types/suffix";
export * from "@/src/features/drive/types/drive";
