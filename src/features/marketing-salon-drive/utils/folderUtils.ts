import { DriveFile, DriveFolder } from "../types/drive";
import { FileUtils } from "./fileUtils";
import { createHierarchyMap } from "./hierarchyUtils";

/**
 * Utilidades para manejar carpetas de Google Drive
 */
export class FolderUtils {
  /**
   * Organiza los archivos por carpetas según la jerarquía
   * @param files Lista de archivos obtenidos
   * @param folderMap Mapa de carpetas con sus IDs
   * @param folderHierarchy Jerarquía de carpetas
   * @param rootFolderId ID de la carpeta raíz
   * @returns Lista de archivos organizados
   */
  static async organizeFilesByFolders(
    files: DriveFile[],
    folderMap: Record<string, DriveFolder>,
    folderHierarchy: Record<string, any>,
    rootFolderId: string
  ): Promise<DriveFile[]> {
    console.log(
      `[FolderUtils] Organizando ${files.length} archivos y verificando carpetas vacías`
    );

    // Procesar los archivos para agregar información de su ruta
    const processedFiles: DriveFile[] = [];

    // Procesar los archivos existentes
    for (const file of files) {
      // Determinar la ruta completa del archivo
      const folderPath = this.buildFilePath(file, folderMap, rootFolderId);

      // Agregar archivo con información de carpeta actualizada
      processedFiles.push({
        ...file,
        folder: folderPath.folder,
        subFolder: folderPath.subFolder,
        depth: folderPath.depth || 0,
      });

      console.log(
        `[FolderUtils] Procesado archivo "${file.name}" (ID: ${
          file.id
        }), asignada profundidad: ${folderPath.depth || 0}`
      );
    }

    // Incluir archivos de carpetas vacías (que no tienen archivos visibles)
    // Esto asegura que las carpetas vacías aparecerán en la UI
    const emptyFolders = Object.values(folderMap).filter(
      (folder) => folder.isEmpty && !folder.isHidden
    );

    console.log(
      `[FolderUtils] Encontradas ${emptyFolders.length} carpetas vacías para representar en la UI`
    );

    // Añadir una entrada representativa para cada carpeta vacía si no está ya incluida
    if (emptyFolders.length > 0) {
      // Verificar qué carpetas vacías ya están representadas
      const existingFolderIds = new Set(
        processedFiles
          .filter((file) => file.parents && file.parents.length > 0)
          .map((file) => file.parents![0])
      );

      console.log(
        `[FolderUtils] Carpetas ya representadas en archivos: ${existingFolderIds.size}`
      );

      // Para cada carpeta vacía que no tenga representación, añadir un placeholder
      for (const emptyFolder of emptyFolders) {
        if (!existingFolderIds.has(emptyFolder.id)) {
          // Determinar la ruta de la carpeta vacía
          const folderPath = this.buildFolderPath(
            emptyFolder,
            folderMap,
            rootFolderId
          );

          console.log(
            `[FolderUtils] Generando placeholder para carpeta vacía: "${emptyFolder.name}" (ID: ${emptyFolder.id}) con profundidad: ${folderPath.depth}`
          );

          // Crear un archivo virtual que representa la carpeta vacía
          // Usar el ID original de la carpeta como parte del ID del archivo virtual
          const emptyFile: DriveFile = {
            id: `empty-folder-${emptyFolder.id}`,
            name: `${emptyFolder.name}/.empty`,
            mimeType: "application/vnd.google-apps.folder.empty",
            folder: folderPath.folder,
            subFolder: folderPath.subFolder,
            depth: folderPath.depth || 0,
            parents: [emptyFolder.id], // Mantener referencia al ID original
            badges: ["empty", ...(emptyFolder.badges || [])],
            isHidden: false,
          };

          // Importante: mantener el ID original al que pertenece este archivo virtual
          // para que pueda ser referenciado correctamente en la jerarquía
          console.log(
            `[FolderUtils] Archivo placeholder creado con ID "${emptyFile.id}" que referencia a la carpeta "${emptyFolder.id}"`
          );

          // Agregar a la lista de archivos procesados
          processedFiles.push(emptyFile);
        } else {
          console.log(
            `[FolderUtils] Carpeta vacía "${emptyFolder.name}" (ID: ${emptyFolder.id}) ya está representada en los archivos, no se crea placeholder`
          );
        }
      }
    }

    console.log(
      `[FolderUtils] Proceso completado. Total de archivos + placeholders: ${processedFiles.length}`
    );
    return processedFiles;
  }

  /**
   * Construye la ruta de un archivo a partir de su ID de carpeta
   * @param file Archivo para el que se construirá la ruta
   * @param folderMap Mapa de carpetas con sus IDs
   * @param rootFolderId ID de la carpeta raíz
   * @returns Objeto con información de la ruta del archivo
   */
  private static buildFilePath(
    file: DriveFile,
    folderMap: Record<string, DriveFolder>,
    rootFolderId: string
  ): {
    folder: string | undefined;
    subFolder: string | undefined;
    depth: number;
  } {
    // Si el archivo no tiene un parent definido, usar la carpeta raíz
    if (!file.parents || file.parents.length === 0) {
      return { folder: undefined, subFolder: undefined, depth: 0 };
    }

    const parentId = file.parents[0];

    // Si el padre es la carpeta raíz, no hay folder/subFolder
    if (parentId === rootFolderId) {
      return { folder: undefined, subFolder: undefined, depth: 0 };
    }

    // Obtener información de la carpeta padre
    const parentFolder = folderMap[parentId];
    if (!parentFolder) {
      return { folder: undefined, subFolder: undefined, depth: 0 };
    }

    // Determinar la profundidad y las carpetas
    const depth = parentFolder.depth || 0;

    // Para profundidad 1, solo hay folder
    if (depth === 1) {
      return {
        folder: parentFolder.name,
        subFolder: undefined,
        depth,
      };
    }

    // Para profundidad 2 o más, hay folder y posiblemente subFolder
    if (depth >= 2) {
      // Encontrar la carpeta de nivel 1 (folder principal)
      let currentFolder = parentFolder;
      let topLevelFolder: DriveFolder | undefined;

      // Buscar hacia arriba en la jerarquía hasta encontrar la carpeta de nivel 1
      while (currentFolder && (currentFolder.depth ?? 0) > 1) {
        const currentParentId = currentFolder.parents?.[0];
        if (!currentParentId) break;

        currentFolder = folderMap[currentParentId];
      }

      // Si encontramos una carpeta de nivel 1, usarla como carpeta principal
      if (currentFolder && (currentFolder.depth ?? 0) === 1) {
        topLevelFolder = currentFolder;

        return {
          folder: topLevelFolder.name,
          subFolder:
            parentFolder.name !== topLevelFolder.name
              ? parentFolder.name
              : undefined,
          depth,
        };
      }
    }

    // Si no se pudo determinar la estructura, usar solo el nombre de la carpeta actual
    return {
      folder: parentFolder.name,
      subFolder: undefined,
      depth,
    };
  }

  /**
   * Construye la ruta de una carpeta a partir de su información
   * @param folder Carpeta para la que se construirá la ruta
   * @param folderMap Mapa de carpetas con sus IDs
   * @param rootFolderId ID de la carpeta raíz
   * @returns Objeto con información de la ruta de la carpeta
   */
  private static buildFolderPath(
    folder: DriveFolder,
    folderMap: Record<string, DriveFolder>,
    rootFolderId: string
  ): {
    folder: string | undefined;
    subFolder: string | undefined;
    depth: number;
  } {
    console.log(
      `[FolderUtils] Construyendo ruta para carpeta "${folder.name}" (ID: ${folder.id}), profundidad actual: ${folder.depth}`
    );

    // Si la carpeta no tiene un parent definido o es la raíz, no hay folder/subFolder
    if (
      !folder.parents ||
      folder.parents.length === 0 ||
      folder.id === rootFolderId
    ) {
      return {
        folder: undefined,
        subFolder: undefined,
        depth: folder.depth || 0,
      };
    }

    const parentId = folder.parents[0];

    // Si el padre es la carpeta raíz, usar folder como nombre principal
    if (parentId === rootFolderId) {
      console.log(
        `[FolderUtils] Carpeta "${folder.name}" es hijo directo de la raíz, estableciendo profundidad a 1`
      );
      return {
        folder: folder.name,
        subFolder: undefined,
        depth: 1, // Profundidad 1 para elementos directos bajo la raíz (siempre)
      };
    }

    // Obtener información de la carpeta padre
    const parentFolder = folderMap[parentId];
    if (!parentFolder) {
      // Si no se encuentra la carpeta padre, usar esta carpeta como principal
      console.log(
        `[FolderUtils] No se encontró padre para "${folder.name}", usando como carpeta principal con profundidad 1`
      );
      return {
        folder: folder.name,
        subFolder: undefined,
        depth: 1,
      };
    }

    // Determinar la profundidad basada en el padre
    // 1. Usar la profundidad proporcionada en el objeto carpeta si está disponible
    // 2. Si no, calcular basado en la profundidad del padre + 1
    // 3. Si el padre es la raíz, la profundidad es siempre 1
    let depth: number;

    if (folder.depth !== undefined) {
      // Si ya tenemos una profundidad definida, utilizarla
      depth = folder.depth;
      console.log(
        `[FolderUtils] Usando profundidad existente para "${folder.name}": ${depth}`
      );
    } else if (parentFolder.depth !== undefined) {
      // Calcular basado en la profundidad del padre
      depth = parentFolder.depth + 1;
      console.log(
        `[FolderUtils] Calculando profundidad para "${folder.name}" basado en padre "${parentFolder.name}": ${parentFolder.depth} + 1 = ${depth}`
      );
    } else if (parentId === rootFolderId) {
      // Si el padre es la raíz, la profundidad es 1
      depth = 1;
      console.log(
        `[FolderUtils] Padre de "${folder.name}" es la raíz, estableciendo profundidad a 1`
      );
    } else {
      // Valor predeterminado si no podemos determinar la profundidad
      depth = 1;
      console.log(
        `[FolderUtils] No se pudo determinar profundidad para "${folder.name}", usando 1 como predeterminado`
      );
    }

    // Para profundidad 1, solo hay folder
    if (depth === 1) {
      return {
        folder: folder.name,
        subFolder: undefined,
        depth,
      };
    }

    // Para profundidad 2 o más, hay folder y posiblemente subFolder
    if (depth >= 2) {
      // Encontrar la carpeta de nivel 1 (folder principal)
      let currentFolder = parentFolder;
      let topLevelFolder: DriveFolder | undefined;

      // Buscar hacia arriba en la jerarquía hasta encontrar la carpeta de nivel 1
      while (currentFolder && (currentFolder.depth ?? 0) > 1) {
        console.log(
          `[FolderUtils] Navegando hacia arriba desde "${currentFolder.name}" (profundidad: ${currentFolder.depth}) buscando una carpeta de nivel 1`
        );
        const currentParentId = currentFolder.parents?.[0];
        if (!currentParentId) break;

        currentFolder = folderMap[currentParentId];
      }

      // Si encontramos una carpeta de nivel 1, usarla como carpeta principal
      if (currentFolder && (currentFolder.depth ?? 0) === 1) {
        topLevelFolder = currentFolder;
        console.log(
          `[FolderUtils] Encontrada carpeta de nivel 1 para "${folder.name}": "${topLevelFolder.name}"`
        );

        return {
          folder: topLevelFolder.name,
          subFolder: folder.name,
          depth,
        };
      }
    }

    // Si no se pudo determinar la estructura, usar el nombre actual como principal
    console.log(
      `[FolderUtils] No se pudo determinar estructura completa para "${folder.name}", usando como carpeta principal con profundidad ${depth}`
    );
    return {
      folder: folder.name,
      subFolder: undefined,
      depth,
    };
  }
}
