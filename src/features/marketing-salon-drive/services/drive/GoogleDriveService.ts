import { google } from "googleapis";
import type {
  DriveFile,
  DriveFolder,
  GoogleDriveLinks,
} from "../../types/drive";

export class GoogleDriveService {
  private drive;

  constructor() {
    // Verificar existencia de variables de entorno críticas
    this.validateEnvironmentVariables();

    try {
      // Crear autenticación con la cuenta de servicio
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
          project_id: process.env.GOOGLE_DRIVE_PROJECT_ID || "",
          client_id: process.env.GOOGLE_DRIVE_CLIENT_ID || "",
        },
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      });

      // Crear cliente de Drive
      this.drive = google.drive({ version: "v3", auth });
    } catch (error) {
      console.error("Error initializing Google Drive API client:", error);
      throw new Error(
        `Failed to initialize Google Drive client: ${this.getErrorMessage(
          error
        )}`
      );
    }
  }

  /**
   * Valida que las variables de entorno necesarias existan
   */
  private validateEnvironmentVariables() {
    const requiredVars = [
      "GOOGLE_DRIVE_CLIENT_EMAIL",
      "GOOGLE_DRIVE_PRIVATE_KEY",
      "GOOGLE_DRIVE_ROOT_FOLDER_ID",
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }
  }

  /**
   * Obtiene archivos y carpetas de forma recursiva sin límite de profundidad
   * @param folderId ID de la carpeta a explorar
   * @param parentPath Ruta de carpetas anteriores (para el seguimiento)
   * @param folderInfo Información de la carpeta actual
   * @param depth Nivel de profundidad actual para seguimiento
   */
  private async getFilesRecursive(
    folderId: string,
    parentPath: { folder?: string; subFolder?: string } = {},
    folderInfo: { name: string } = { name: "" },
    depth: number = 0
  ): Promise<{
    files: DriveFile[];
    folders: DriveFolder[];
    folderHierarchy: Map<string, string[]>;
    folderMap: Map<string, DriveFolder>;
  }> {
    console.log(
      `${"-".repeat(depth * 2)}> Explorando carpeta${
        folderInfo.name ? ` ${folderInfo.name}` : ""
      } (${folderId}) - Nivel ${depth}`
    );

    // Estructura para acumular resultados
    const result = {
      files: [] as DriveFile[],
      folders: [] as DriveFolder[],
      folderHierarchy: new Map<string, string[]>(),
      folderMap: new Map<string, DriveFolder>(),
    };

    try {
      // Obtener elementos de esta carpeta
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields:
          "files(id, name, mimeType, webViewLink, thumbnailLink, description, parents)",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (!response.data.files || response.data.files.length === 0) {
        console.log(`${"-".repeat(depth * 2)} Carpeta vacía`);
        return result;
      }

      // Registrar esta carpeta en la jerarquía
      result.folderHierarchy.set(folderId, []);

      // Separar archivos y carpetas
      const items = response.data.files;
      const subFolders = items.filter(
        (item) => item.mimeType === "application/vnd.google-apps.folder"
      );
      const files = items.filter(
        (item) => item.mimeType !== "application/vnd.google-apps.folder"
      );

      console.log(
        `${"-".repeat(depth * 2)} Encontrados: ${files.length} archivos, ${
          subFolders.length
        } subcarpetas`
      );

      // Procesar archivos de este nivel
      files.forEach((file) => {
        // Determinar la carpeta y subcarpeta según el nivel
        let fileMeta: any = {
          ...file,
        };

        // Asignar metadatos de carpeta según el nivel
        if (depth === 1) {
          // Nivel 1: Carpeta principal
          fileMeta.folder = folderInfo.name;
        } else if (depth === 2) {
          // Nivel 2: Subcarpeta dentro de carpeta principal
          fileMeta.folder = parentPath.folder;
          fileMeta.subFolder = folderInfo.name;
        } else if (depth >= 3) {
          // Niveles más profundos: Usar la cadena completa de carpetas
          fileMeta.folder = parentPath.folder;
          fileMeta.subFolder = parentPath.subFolder;

          // Para niveles más profundos, usamos un array para guardar la ruta completa
          if (!fileMeta.nestedPath) {
            fileMeta.nestedPath = [
              parentPath.folder || "",
              parentPath.subFolder || "",
              folderInfo.name,
            ];
          } else {
            fileMeta.nestedPath.push(folderInfo.name);
          }

          // También podemos guardar el subSubFolder para compatibilidad
          fileMeta.subSubFolder = folderInfo.name;
        }

        result.files.push(fileMeta);
      });

      // Procesar subcarpetas recursivamente
      if (subFolders.length > 0) {
        // Iterar a través de cada subcarpeta
        for (const subFolder of subFolders) {
          // Verificar que el ID no sea nulo o indefinido
          if (!subFolder.id) {
            console.warn(`Subcarpeta sin ID: ${subFolder.name}`);
            continue;
          }

          // Registrar esta subcarpeta en nuestro mapa
          const folderObject: DriveFolder = {
            id: subFolder.id,
            name: subFolder.name || "",
            mimeType: "application/vnd.google-apps.folder",
            isFolder: true,
            subfoldersIds: [],
            parents: subFolder.parents || undefined,
          };

          if (depth >= 1) {
            folderObject.parentFolder = folderInfo.name;
          }

          result.folders.push(folderObject);
          result.folderMap.set(subFolder.id, folderObject);

          // Añadir a la jerarquía
          result.folderHierarchy.get(folderId)?.push(subFolder.id);

          // Preparar información de ruta para la recursión
          let newParentPath = { ...parentPath };
          if (depth === 1) {
            // Si estamos en el primer nivel, establecer carpeta principal
            newParentPath.folder = folderInfo.name;
          } else if (depth === 2) {
            // Si estamos en el segundo nivel, establecer subcarpeta
            newParentPath.subFolder = folderInfo.name;
          }

          // Recursión: explorar esta subcarpeta
          const subResults = await this.getFilesRecursive(
            subFolder.id,
            newParentPath,
            { name: subFolder.name || "" },
            depth + 1
          );

          // Acumular resultados
          result.files = [...result.files, ...subResults.files];
          result.folders = [...result.folders, ...subResults.folders];

          // Combinar jerarquías
          subResults.folderHierarchy.forEach((children, parentId) => {
            result.folderHierarchy.set(parentId, children);
          });

          // Combinar mapas de carpetas
          subResults.folderMap.forEach((folder, id) => {
            result.folderMap.set(id, folder);
          });

          // Actualizar subfoldersIds
          folderObject.subfoldersIds = subResults.folders
            .filter((f) => f.parentFolder === subFolder.name)
            .map((f) => f.id);

          // Actualizar el mapa
          result.folderMap.set(subFolder.id, folderObject);
        }
      }

      return result;
    } catch (error) {
      console.error(`Error explorando carpeta ${folderId}:`, error);
      return result;
    }
  }

  /**
   * Obtiene archivos y carpetas desde una ruta en Drive
   */
  async getFiles(folderPath: string): Promise<DriveFile[]> {
    try {
      // Navegar a la carpeta por su ruta
      const folderId = await this.getFolderIdFromPath(folderPath);
      console.log(`Obteniendo archivos para la carpeta con ID: ${folderId}`);

      // Explorar recursivamente toda la estructura de carpetas
      const rootFolderInfo = await this.drive.files.get({
        fileId: folderId,
        fields: "id,name",
        supportsAllDrives: true,
      });

      const rootName = rootFolderInfo.data.name || "Root";

      // Obtener toda la estructura recursivamente sin límite de profundidad
      const { files, folders, folderHierarchy, folderMap } =
        await this.getFilesRecursive(folderId, {}, { name: rootName }, 0);

      // Imprimir la jerarquía completa para depuración
      console.log("Jerarquía completa de carpetas:");
      for (const [parentId, childrenIds] of folderHierarchy.entries()) {
        const parent = folderMap.get(parentId);
        if (parent) {
          console.log(
            `${parent.name || "Root"} (${parentId}): ${
              childrenIds.length
            } subcarpetas`
          );
          childrenIds.forEach((childId) => {
            const child = folderMap.get(childId);
            console.log(`  - ${child?.name || "Unknown"} (${childId})`);
          });
        } else if (parentId === folderId) {
          console.log(`Root (${parentId}): ${childrenIds.length} subcarpetas`);
          childrenIds.forEach((childId) => {
            const child = folderMap.get(childId);
            console.log(`  - ${child?.name || "Unknown"} (${childId})`);
          });
        }
      }

      // Ahora procesar todos los archivos y organizarlos
      const organizedFiles = await this.organizeFilesByFolders(
        files,
        folderMap,
        folderHierarchy,
        folderId
      );

      console.log(
        `Se encontraron ${organizedFiles.length} archivos en total (incluyendo subcarpetas)`
      );
      return organizedFiles;
    } catch (error) {
      console.error("Error getting files:", error);
      throw new Error(
        `Failed to fetch files from Drive: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Transforma un link de Google Drive en links específicos para previsualización, descarga, etc.
   */
  convertGoogleDriveLink(fileId: string, mimeType?: string): GoogleDriveLinks {
    if (!fileId) {
      throw new Error("Invalid file ID provided to convertGoogleDriveLink");
    }

    // URL del proxy para imágenes
    const imageProxyUrl = `/api/marketing-salon-drive/image-proxy?id=${fileId}`;

    // URL directa de Google para imágenes (funciona mejor para la mayoría de tipos)
    const googleDirectImageUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    // URL de thumbnail directo de Google Drive
    const googleThumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    // URL de prévisualización mejorada para videos
    const videoPreviewUrl = `https://drive.google.com/vt?id=${fileId}`;

    // URL de Google Photos API para obtener mejores previsualizaciones (funciona para imágenes y videos)
    const googlePhotosUrl = `https://lh3.googleusercontent.com/u/0/d/${fileId}=w1024-h768-p-k-no-nd-mv`;

    let imgEmbed = imageProxyUrl;

    // Determinar la vista previa según el tipo de archivo
    const isPDF = mimeType?.includes("pdf");
    const isVideo = mimeType?.startsWith("video/");
    const isImage = mimeType?.startsWith("image/");

    // Para imágenes, usamos múltiples fuentes en cascada para mayor confiabilidad
    if (isImage) {
      // Priorizar la URL directa de Google para imágenes
      imgEmbed = googleDirectImageUrl;
    }
    // Para videos, usar URL especializada para previsualizaciones de video
    else if (isVideo) {
      imgEmbed = videoPreviewUrl;
    }
    // Para PDFs, usamos una URL especial que genera una vista previa de la primera página
    else if (isPDF) {
      imgEmbed = googleThumbnailUrl;
    }
    // Para otros tipos de archivo, usar el proxy con fallback a thumbnail
    else {
      imgEmbed = imageProxyUrl;
    }

    return {
      preview: `https://drive.google.com/file/d/${fileId}/preview`,
      imgEmbed,
      download: `https://drive.google.com/uc?export=download&id=${fileId}`,
      // Agregar URLs alternativas para fallback en el cliente
      alternativeUrls: {
        direct: googleDirectImageUrl,
        thumbnail: googleThumbnailUrl,
        proxy: imageProxyUrl,
        video: videoPreviewUrl,
        photos: googlePhotosUrl,
      },
    };
  }

  /**
   * Obtiene el ID de una carpeta a partir de su ruta
   */
  private async getFolderIdFromPath(path: string): Promise<string> {
    // Si no hay ruta, devolver carpeta raíz
    if (!path) {
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      if (!rootFolderId) {
        throw new Error("Root folder ID environment variable is not set");
      }
      return rootFolderId;
    }

    const parts = path.split("/").filter(Boolean);
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!rootFolderId) {
      throw new Error("Root folder ID environment variable is not set");
    }

    let currentFolderId = rootFolderId;
    let navigatedPath = ""; // Para seguimiento de la ruta navegada

    // Navegar por la estructura de carpetas
    for (const part of parts) {
      try {
        // Actualizar la ruta navegada para seguimiento de errores
        navigatedPath = navigatedPath ? `${navigatedPath}/${part}` : part;

        const response = await this.drive.files.list({
          q: `'${currentFolderId}' in parents and name = '${part}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: "files(id, name)",
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        if (!response.data.files || response.data.files.length === 0) {
          // Error más descriptivo que indica exactamente qué parte de la ruta no se encontró
          throw new Error(
            `Carpeta no encontrada: '${part}' (Ruta navegada: ${navigatedPath})`
          );
        }

        const fileId = response.data.files[0].id;
        if (!fileId) {
          throw new Error(
            `Falta el ID de carpeta para: '${part}' (Ruta navegada: ${navigatedPath})`
          );
        }

        currentFolderId = fileId;
      } catch (error) {
        // Agregar contexto adicional al error
        console.error(`Error navegando a la carpeta '${part}':`, error);

        // Si el error ya fue generado por nosotros, solo lo propagamos
        if (
          error instanceof Error &&
          error.message.includes("Carpeta no encontrada")
        ) {
          throw error;
        }

        // Si es otro tipo de error, lo envolvemos con un mensaje más descriptivo
        throw new Error(
          `Error al navegar a la carpeta '${part}' (Ruta navegada: ${navigatedPath}): ${this.getErrorMessage(
            error
          )}`
        );
      }
    }

    return currentFolderId;
  }

  /**
   * Organiza los archivos según su estructura de carpetas
   */
  private async organizeFilesByFolders(
    files: DriveFile[],
    folderMap: Map<string, DriveFolder>,
    folderHierarchy: Map<string, string[]>,
    rootFolderId: string
  ): Promise<DriveFile[]> {
    try {
      // Procesar cada archivo para añadir metadatos
      const processedFiles = files.map((file) => {
        // Extraer información del nombre del archivo
        const fileInfo = this.parseFileName(file.name);

        // Determinar la carpeta padre y subcarpeta
        let folder = file.folder || ""; // Carpeta principal
        let subFolder = file.subFolder || ""; // Subcarpeta (si existe)

        // Si no tiene carpeta asignada pero tiene parents
        if (!folder && file.parents && file.parents.length > 0) {
          const parentId = file.parents[0];
          const parentFolder = folderMap.get(parentId);

          if (parentFolder) {
            folder = parentFolder.name || "";

            // Verificar si es una subcarpeta
            if (parentFolder.parentFolder) {
              subFolder = folder;
              folder = parentFolder.parentFolder;
            }
          }
        }

        // Determinar year y campaign basados en la estructura de carpetas
        let year = "";
        let campaign = "";

        // Si el archivo tiene una ruta anidada, usarla para determinar year y campaign
        if ((file as any).nestedPath && (file as any).nestedPath.length > 0) {
          const path = (file as any).nestedPath;
          // El primer nivel es el año
          year = path[0];
          // El segundo nivel es la campaña
          if (path.length > 1) {
            campaign = path[1];
          }
        } else {
          // Si no hay ruta anidada, usar folder y subFolder
          year = folder;
          campaign = subFolder;
        }

        // Tratar de asignar o inferir un groupTitle
        let groupTitle = fileInfo.groupTitle || "";

        // Si el archivo está en una subcarpeta, usarla como groupTitle si no tiene uno
        if (subFolder && !groupTitle) {
          groupTitle = subFolder;
        }

        // Si el archivo está en la carpeta "Stories" y contiene "Story"
        if (folder === "Stories" && file.name.includes("Story")) {
          const storyMatch = file.name.match(/Story\s*(\d+)/i);
          if (storyMatch && storyMatch[1]) {
            groupTitle = `Story ${storyMatch[1].trim()}`;
          }
        }

        // Si el nombre contiene "groupTitle:", extraer ese valor
        const groupTitleMatch = file.name.match(/groupTitle:\s*([^,\s]+)/i);
        if (groupTitleMatch && groupTitleMatch[1]) {
          groupTitle = groupTitleMatch[1].trim();
        }

        // Transformar las URLs para visualización
        const transformedUrl = this.convertGoogleDriveLink(
          file.id,
          file.mimeType
        );

        // Si tiene subcarpeta, añadirla a los metadatos
        const submeta = subFolder ? { subFolder } : {};

        return {
          ...file,
          ...submeta,
          category: fileInfo.category || "",
          groupTitle: groupTitle,
          order: fileInfo.order || 0,
          folder: folder,
          year: year,
          campaign: campaign,
          transformedUrl,
        };
      });

      // Depuración: mostrar información sobre carpetas y subcarpetas
      const folderStats = processedFiles.reduce((stats, file) => {
        const folder = file.folder || "Sin carpeta";
        const subFolder = (file as any).subFolder || "Sin subcarpeta";

        if (!stats[folder]) {
          stats[folder] = { count: 0, subFolders: {} };
        }

        stats[folder].count++;

        if (subFolder !== "Sin subcarpeta") {
          if (!stats[folder].subFolders[subFolder]) {
            stats[folder].subFolders[subFolder] = 0;
          }
          stats[folder].subFolders[subFolder]++;
        }

        return stats;
      }, {} as Record<string, { count: number; subFolders: Record<string, number> }>);

      console.log("Estadísticas de archivos organizados por carpetas:");
      Object.entries(folderStats).forEach(([folder, data]) => {
        console.log(`${folder}: ${data.count} archivos`);
        if (Object.keys(data.subFolders).length > 0) {
          console.log("  Subcarpetas:");
          Object.entries(data.subFolders).forEach(([subFolder, count]) => {
            console.log(`    ${subFolder}: ${count} archivos`);
          });
        }
      });

      return processedFiles;
    } catch (error) {
      console.error("Error organizing files:", error);
      throw new Error(
        `Failed to organize files: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Extrae información del nombre del archivo
   */
  private parseFileName(fileName: string): {
    category?: string;
    groupTitle?: string;
    order?: number;
  } {
    if (!fileName) {
      return { order: 0 };
    }

    try {
      // Por ejemplo: A-C-2408-0192-01-00-01.jpg
      const parts = fileName.split(/[-_.]/);

      // Implementación simple: el orden viene del último número
      const order =
        parts.length > 2 ? parseInt(parts[parts.length - 2], 10) : 0;

      // Detectar si tiene "groupTitle" basado en patrones comunes
      let groupTitle = "";

      // Detectar patrones como "Story X" en el nombre
      if (fileName.includes("Story")) {
        const storyMatch = fileName.match(/Story\s*(\d+)/i);
        if (storyMatch && storyMatch[1]) {
          groupTitle = `Story ${storyMatch[1]}`;
        }
      }

      return {
        order: isNaN(order) ? 0 : order,
        groupTitle,
        category: "",
      };
    } catch (error) {
      console.warn(`Error parsing filename '${fileName}':`, error);
      return { order: 0 };
    }
  }

  /**
   * Extrae mensaje de error legible de diferentes tipos de errores
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    if (typeof error === "object" && error !== null) {
      return JSON.stringify(error);
    }
    return "Unknown error";
  }

  /**
   * Lista todas las carpetas disponibles en la raíz
   */
  async listAvailableFolders(): Promise<
    { id: string; name: string; path: string }[]
  > {
    try {
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      if (!rootFolderId) {
        throw new Error("Root folder ID environment variable is not set");
      }

      // Primero, obtener información de la carpeta raíz
      const rootFolder = await this.drive.files.get({
        fileId: rootFolderId,
        fields: "id, name",
        supportsAllDrives: true,
      });

      console.log("Root folder info:", rootFolder.data);

      // Obtener todas las carpetas dentro de la raíz
      const response = await this.drive.files.list({
        q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name, parents)",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      console.log("Available folders:", response.data.files);

      if (!response.data.files) {
        return [];
      }

      return response.data.files.map((file) => ({
        id: file.id || "",
        name: file.name || "",
        path: `/${file.name}`,
      }));
    } catch (error) {
      console.error("Error listing available folders:", error);
      throw new Error(`Failed to list folders: ${this.getErrorMessage(error)}`);
    }
  }
}
