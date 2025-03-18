import { DriveFile } from "../../types/drive";
import { GoogleAuthProvider } from "./GoogleAuthProvider";
import { GoogleDriveExplorer } from "./GoogleDriveExplorer";
import { PathUtils } from "../../utils/pathUtils";
import { FolderUtils } from "../../utils/folderUtils";
import { FileUtils } from "../../utils/fileUtils";

/**
 * Servicio principal para interactuar con Google Drive
 * Actúa como fachada para coordinar diversas operaciones con Google Drive
 */
export class GoogleDriveService {
  private drive;
  private explorer: GoogleDriveExplorer;

  constructor() {
    try {
      // Inicializar el cliente de Drive usando el proveedor de autenticación
      this.drive = GoogleAuthProvider.createDriveClient();
      this.explorer = new GoogleDriveExplorer(this.drive);
    } catch (error) {
      console.error("Error initializing Google Drive API client:", error);
      throw new Error(
        `Failed to initialize Google Drive client: ${
          error instanceof Error ? error.message : String(error)
        }`
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
   * Obtiene archivos y carpetas desde una ruta en Drive
   */
  async getFiles(path?: string): Promise<DriveFile[]> {
    console.log(`Getting files for path: ${path || "ROOT"}`);
    try {
      // Determinar el ID de la carpeta a explorar
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      if (!rootFolderId) {
        throw new Error(
          "GOOGLE_DRIVE_ROOT_FOLDER_ID environment variable is not defined"
        );
      }

      // Si no hay path, explorar la carpeta raíz
      let folderId = rootFolderId;

      // Si hay path, determinar el ID de la carpeta
      if (path) {
        folderId = await PathUtils.getFolderIdFromPath(
          this.drive,
          rootFolderId,
          path
        );
      }

      console.log(`Exploring folder ID: ${folderId}`);

      // Obtener archivos de forma recursiva utilizando el explorador
      const result = await this.explorer.getFilesRecursive(folderId);

      return result.files;
    } catch (error) {
      console.error("Error getting files from Google Drive:", error);
      throw new Error(
        `Failed to get files: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Transforma un link de Google Drive en links específicos para previsualización, descarga, etc.
   */
  async convertGoogleDriveLink(fileId: string) {
    try {
      return await FileUtils.convertGoogleDriveLink(this.drive, fileId);
    } catch (error) {
      console.error(
        `Error converting Google Drive link for file ${fileId}:`,
        error
      );
      throw new Error(
        `Failed to convert link: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Lista todas las carpetas disponibles en la raíz
   */
  async listAvailableFolders(): Promise<
    { id: string; name: string; path: string }[]
  > {
    try {
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      console.log(`Using Root Folder ID: ${rootFolderId}`);

      if (!rootFolderId) {
        throw new Error("Root folder ID environment variable is not set");
      }

      // Primero, obtener información de la carpeta raíz
      console.log(`Obteniendo información del folder raíz: ${rootFolderId}`);
      try {
        const rootFolder = await this.drive.files.get({
          fileId: rootFolderId,
          fields: "id, name",
          supportsAllDrives: true,
        });

        console.log(
          "Root folder info:",
          JSON.stringify(rootFolder.data, null, 2)
        );
      } catch (rootFolderError) {
        console.error(
          `ERROR obteniendo información del folder raíz: ${rootFolderError}`
        );
        // Continuar para intentar listar los archivos igualmente
      }

      // Obtener todas las carpetas dentro de la raíz
      console.log(`Listando carpetas dentro del folder raíz: ${rootFolderId}`);
      try {
        const response = await this.drive.files.list({
          q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: "files(id, name, parents)",
          pageSize: 100,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        console.log(
          `Respuesta completa: ${JSON.stringify(response.data, null, 2)}`
        );

        if (!response.data.files || response.data.files.length === 0) {
          console.warn(
            `No se encontraron carpetas en el folder raíz: ${rootFolderId}`
          );
          return [];
        }

        console.log(`Carpetas encontradas: ${response.data.files.length}`);
        console.log("Available folders:", response.data.files);

        return response.data.files.map((file) => ({
          id: file.id || "",
          name: file.name || "",
          path: `/${file.name}`,
        }));
      } catch (listError) {
        console.error(`ERROR listando carpetas: ${listError}`);
        throw new Error(
          `Failed to list folders: ${
            listError instanceof Error ? listError.message : String(listError)
          }`
        );
      }
    } catch (error) {
      console.error("Error listing available folders:", error);
      throw new Error(
        `Failed to list folders: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Obtiene archivos y carpetas directamente a partir de un ID de carpeta
   * @param folderId ID de la carpeta en Google Drive
   */
  async getFilesByFolderId(folderId: string): Promise<DriveFile[]> {
    try {
      // PASO 1: Validar y obtener el ID de la carpeta a explorar
      console.log(`[PASO 1] Iniciando proceso para carpeta ID: ${folderId}`);

      // Usar el ID proporcionado o el ID de carpeta raíz por defecto
      const targetFolderId =
        folderId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

      if (!targetFolderId) {
        throw new Error(
          "No folder ID provided and no root folder ID set in environment"
        );
      }

      console.log(`[PASO 1] ID de carpeta a explorar: ${targetFolderId}`);

      // PASO 2: Obtener información de la carpeta para saber su nombre
      console.log(`[PASO 2] Obteniendo información de la carpeta`);

      const folderInfo = await this.getFolderInfo(targetFolderId);
      if (!folderInfo) {
        throw new Error(
          `No se pudo obtener información de la carpeta ${targetFolderId}`
        );
      }

      const folderName = folderInfo.name || "Root";
      console.log(`[PASO 2] Nombre de la carpeta: ${folderName}`);

      // PASO 3: Explorar recursivamente toda la estructura de carpetas usando el explorador
      console.log(
        `[PASO 3] Explorando recursivamente la estructura de carpetas`
      );

      const result = await this.explorer.getFilesRecursive(
        targetFolderId,
        {},
        { name: folderName },
        0
      );

      console.log(
        `[PASO 3] Exploración completada. Encontrados: ${result.files.length} archivos, ${result.folders.length} carpetas`
      );

      // Analizar profundidades de archivos
      this.logDepthDistribution(result.files, "[PASO 3] Archivos encontrados");

      // PASO 4: Organizar los archivos usando FolderUtils
      console.log(`[PASO 4] Organizando archivos por carpetas`);

      const organizedFiles = await FolderUtils.organizeFilesByFolders(
        result.files,
        result.folderMap,
        result.folderHierarchy,
        targetFolderId
      );

      // Analizar profundidades después de organizar
      this.logDepthDistribution(
        organizedFiles,
        "[PASO 4] Archivos organizados"
      );

      console.log(
        `[PASO 4] Proceso completado. Total de archivos: ${organizedFiles.length}`
      );

      return organizedFiles;
    } catch (error) {
      console.error("Error getting files by folder ID:", error);
      throw new Error(
        `Failed to fetch files from Drive folder ID: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Genera un log de la distribución de profundidades de los archivos
   * @param files Lista de archivos a analizar
   * @param prefix Prefijo para el mensaje de log
   */
  private logDepthDistribution(files: DriveFile[], prefix: string) {
    const depthMap = new Map<number, number>();
    files.forEach((file) => {
      const depth = file.depth || 0;
      depthMap.set(depth, (depthMap.get(depth) || 0) + 1);
    });

    console.log(
      `${prefix} - Distribución de profundidades:`,
      Array.from(depthMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([depth, count]) => `depth ${depth}: ${count} archivos`)
        .join(", ")
    );
  }

  /**
   * Obtiene información sobre una carpeta específica
   * @param folderId ID de la carpeta en Google Drive
   */
  async getFolderInfo(
    folderId: string
  ): Promise<{ id: string; name: string; mimeType: string } | null> {
    try {
      if (!folderId) {
        return null;
      }

      console.log(`Obteniendo información de la carpeta con ID: ${folderId}`);

      const response = await this.drive.files.get({
        fileId: folderId,
        fields: "id,name,mimeType",
        supportsAllDrives: true,
      });

      if (!response || !response.data) {
        return null;
      }

      return {
        id: response.data.id || "",
        name: response.data.name || "",
        mimeType: response.data.mimeType || "",
      };
    } catch (error) {
      console.error(
        `Error obteniendo información de la carpeta ${folderId}:`,
        error
      );
      // En caso de error, retornamos null en lugar de lanzar una excepción
      // para que la función llamadora pueda manejar el caso de fallo
      return null;
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
}
