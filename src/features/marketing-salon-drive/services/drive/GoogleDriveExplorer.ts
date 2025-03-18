import { DriveFile, DriveFolder } from "../../types/drive";

/**
 * Clase encargada de explorar recursivamente la estructura de carpetas en Google Drive
 */
export class GoogleDriveExplorer {
  private drive;

  /**
   * Constructor
   * @param drive Cliente de la API de Google Drive
   */
  constructor(drive: any) {
    this.drive = drive;
  }

  /**
   * Obtiene archivos de forma recursiva desde una carpeta de Google Drive
   * @param folderId ID de la carpeta a explorar
   * @param parentPath Objeto que contiene información de la ruta (opcional)
   * @param folderInfo Objeto que contiene información de la carpeta (opcional)
   * @param depth Profundidad actual de la recursión (opcional)
   * @returns Promise con los archivos, carpetas y su jerarquía
   */
  async getFilesRecursive(
    folderId: string,
    parentPath: Record<string, string> = {},
    folderInfo: { name?: string } = {},
    depth: number = 0
  ): Promise<{
    files: DriveFile[];
    folders: DriveFolder[];
    folderHierarchy: Record<string, string[]>;
    folderMap: Record<string, DriveFolder>;
  }> {
    console.log(
      `[Explorer] Nivel ${depth}: Explorando carpeta "${
        folderInfo.name || folderId
      }"`
    );

    // Objeto para almacenar resultados
    const allFiles: DriveFile[] = [];
    const allFolders: DriveFolder[] = [];
    const folderHierarchy: Record<string, string[]> = {};
    const folderMap: Record<string, DriveFolder> = {};

    try {
      // Obtener lista de archivos y carpetas en este nivel
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields:
          "files(id, name, mimeType, parents, thumbnailLink, size, modifiedTime)",
        pageSize: 1000,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      const items = response.data.files || [];
      console.log(
        `[Explorer] Nivel ${depth}: Encontrados ${items.length} elementos en "${
          folderInfo.name || folderId
        }"`
      );

      // Separar archivos y carpetas
      const files = items.filter(
        (item: any) => item.mimeType !== "application/vnd.google-apps.folder"
      );

      const folders = items.filter(
        (item: any) => item.mimeType === "application/vnd.google-apps.folder"
      );

      console.log(
        `[Explorer] Nivel ${depth}: ${files.length} archivos, ${folders.length} carpetas`
      );

      // Procesar los archivos actuales
      for (const file of files) {
        // Construir la ruta anidada para este archivo
        const nestedPath = [];
        if (folderInfo.name) nestedPath.push(folderInfo.name);

        // Verificar si el archivo está oculto (sufijo _hidden)
        const isHidden = file.name.endsWith("_hidden");

        // Extraer badges basados en prefijos y sufijos
        const badges: string[] = [];

        // Extraer prefijos (e.g., 01_, 02_, etc.)
        const prefixMatch = file.name.match(/^(\d+)_/);
        if (prefixMatch) {
          badges.push(`prefix:${prefixMatch[1]}`);
        }

        // Extraer sufijos (e.g., _draft, _final, etc.) excluyendo _hidden
        const suffixMatch = file.name.match(/_([a-zA-Z0-9]+)$/);
        if (suffixMatch && suffixMatch[1] !== "hidden") {
          badges.push(`suffix:${suffixMatch[1]}`);
        }

        // Crear un objeto de archivo con información de ruta
        const completeFile: DriveFile = {
          id: file.id, // Usar SIEMPRE el ID original de Google Drive
          name: file.name,
          mimeType: file.mimeType,
          parents: file.parents,
          thumbnailLink: file.thumbnailLink,
          size: file.size,
          modifiedTime: file.modifiedTime,
          // Si hay carpeta padre, agregar información
          ...(folderInfo.name && {
            folder: folderInfo.name,
          }),
          // Si hay ruta de padre, agregar información
          ...(parentPath.folder && {
            subFolder: parentPath.folder,
          }),
          // Agregar profundidad - ajustar según la estructura del mockData (depth+1)
          depth: depth + 1, // +1 porque los archivos siempre están un nivel más profundo que su carpeta contenedora
          // Agregar ruta anidada completa
          nestedPath,
          // Marcar archivos ocultos
          isHidden,
          // Agregar badges si hay alguno
          ...(badges.length > 0 && { badges }),
        };

        allFiles.push(completeFile);
      }

      // Agregar información de la carpeta actual al mapa de carpetas
      if (folderInfo.name) {
        // Verificar si la carpeta está oculta (sufijo _hidden)
        const isHidden = folderInfo.name.endsWith("_hidden");

        // Extraer badges basados en prefijos y sufijos
        const badges: string[] = [];

        // Extraer prefijos (e.g., 01_, 02_, etc.)
        const prefixMatch = folderInfo.name.match(/^(\d+)_/);
        if (prefixMatch) {
          badges.push(`prefix:${prefixMatch[1]}`);
        }

        // Extraer sufijos (e.g., _draft, _final, etc.) excluyendo _hidden
        const suffixMatch = folderInfo.name.match(/_([a-zA-Z0-9]+)$/);
        if (suffixMatch && suffixMatch[1] !== "hidden") {
          badges.push(`suffix:${suffixMatch[1]}`);
        }

        const folderObj: DriveFolder = {
          id: folderId, // Usar SIEMPRE el ID original de Google Drive
          name: folderInfo.name,
          mimeType: "application/vnd.google-apps.folder",
          isFolder: true,
          depth: depth, // Mantener registro coherente de la profundidad
          parents: parentPath.parentId ? [parentPath.parentId] : undefined,
          subfoldersIds: [],
          ...(parentPath.folder && {
            parentFolder: parentPath.folder,
          }),
          // Marcar carpetas ocultas
          isHidden,
          // Agregar badges si hay alguno
          ...(badges.length > 0 && { badges }),
        };

        folderMap[folderId] = folderObj;
        allFolders.push(folderObj);

        // Actualizar jerarquía de carpetas para el nivel actual
        folderHierarchy[folderId] = [];
      }

      // Explorar recursivamente cada subcarpeta
      for (const folder of folders) {
        // Asegurarse de que el folder.id existe antes de proceder
        if (!folder.id) {
          console.warn(`[Explorer] Omitiendo carpeta sin ID: ${folder.name}`);
          continue;
        }

        // Construir ruta para la subcarpeta
        const newParentPath = {
          folder: folderInfo.name || "",
          parentId: folderId,
        };

        // Explorar recursivamente la subcarpeta
        const {
          files: subFiles,
          folders: subFolders,
          folderHierarchy: subHierarchy,
          folderMap: subFolderMap,
        } = await this.getFilesRecursive(
          folder.id,
          newParentPath,
          { name: folder.name },
          depth + 1 // Incrementar la profundidad para mantener coherencia
        );

        // Agregar los archivos y carpetas encontrados
        allFiles.push(...subFiles);
        allFolders.push(...subFolders);

        // Actualizar la jerarquía con esta subcarpeta
        if (folderInfo.name) {
          folderHierarchy[folderId].push(folder.id);

          // Actualizar subfoldersIds en la carpeta padre
          if (folderMap[folderId]) {
            folderMap[folderId].subfoldersIds =
              folderMap[folderId].subfoldersIds || [];
            folderMap[folderId].subfoldersIds.push(folder.id);
          }
        }

        // Combinar jerarquías y mapas de carpetas
        Object.assign(folderHierarchy, subHierarchy);
        Object.assign(folderMap, subFolderMap);
      }

      // Marcar carpetas vacías y agregar badge
      if (folderInfo.name) {
        const currentFolder = folderMap[folderId];
        if (currentFolder) {
          // Una carpeta está vacía si no contiene archivos visibles ni subcarpetas visibles
          const visibleFiles = allFiles.filter(
            (file) =>
              (file.folder === folderInfo.name ||
                file.parents?.includes(folderId)) &&
              !file.isHidden
          );

          const visibleSubfolders =
            currentFolder.subfoldersIds?.filter(
              (subfolderId) => !folderMap[subfolderId]?.isHidden
            ) || [];

          currentFolder.isEmpty =
            visibleFiles.length === 0 && visibleSubfolders.length === 0;

          // Agregar badge de "empty" si la carpeta está vacía
          if (currentFolder.isEmpty) {
            console.log(
              `[Explorer] Carpeta vacía detectada: "${folderInfo.name}" (ID: ${folderId})`
            );
            currentFolder.badges = currentFolder.badges || [];
            if (!currentFolder.badges.includes("empty")) {
              currentFolder.badges.push("empty");
            }
          }
        }
      }

      // Imprimir resumen de profundidades encontradas
      this.logDepthDistribution(allFiles, allFolders, depth);

      return {
        files: allFiles,
        folders: allFolders,
        folderHierarchy,
        folderMap,
      };
    } catch (error) {
      console.error(`[Explorer] Error explorando carpeta ${folderId}:`, error);
      throw new Error(
        `Failed to explore folder: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Genera un log de distribución de profundidades para archivos y carpetas
   */
  private logDepthDistribution(
    files: DriveFile[],
    folders: DriveFolder[],
    currentDepth: number
  ) {
    // Analizar profundidades de archivos
    const fileDepths = new Map<number, number>();
    files.forEach((file) => {
      const depth = file.depth || 0;
      fileDepths.set(depth, (fileDepths.get(depth) || 0) + 1);
    });

    if (files.length > 0) {
      console.log(
        `[Explorer] Nivel ${currentDepth} - Distribución de profundidades de archivos:`,
        Array.from(fileDepths.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([depth, count]) => `depth ${depth}: ${count}`)
          .join(", ")
      );
    }

    // Analizar profundidades de carpetas
    const folderDepths = new Map<number, number>();
    folders.forEach((folder) => {
      const depth = folder.depth || 0;
      folderDepths.set(depth, (folderDepths.get(depth) || 0) + 1);
    });

    if (folders.length > 0) {
      console.log(
        `[Explorer] Nivel ${currentDepth} - Distribución de profundidades de carpetas:`,
        Array.from(folderDepths.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([depth, count]) => `depth ${depth}: ${count}`)
          .join(", ")
      );
    }
  }
}
