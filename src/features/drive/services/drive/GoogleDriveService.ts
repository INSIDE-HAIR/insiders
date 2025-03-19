/**
 * GoogleDriveService
 *
 * Servicio para interactuar con la API de Google Drive,
 * proporcionando métodos para obtener archivos, carpetas y
 * metadatos desde una cuenta de Google Drive.
 */

import { google } from "googleapis";
import { Logger } from "../../utils/logger";
import { extractPrefixes } from "../../types/prefix";
import { extractSuffixes } from "../../types/suffix";

// Tipos de elementos de Google Drive
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  createdTime?: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  hasThumbnail?: boolean;
  size?: number;
  md5Checksum?: string;
  trashed?: boolean;
  shared?: boolean;
  owners?: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }[];
  capabilities?: {
    canEdit: boolean;
    canDownload: boolean;
    canShare: boolean;
    canCopy: boolean;
  };
  transformedUrl?: {
    download: string;
    preview: string;
    embed: string;
  };
}

// Parámetros para listado de archivos
export interface ListFilesParams {
  folderId: string;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
  fields?: string;
  q?: string;
  includeRemoved?: boolean;
  includeItemsFromAllDrives?: boolean;
  supportsAllDrives?: boolean;
}

// Respuesta del listado de archivos
export interface ListFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
  incompleteSearch?: boolean;
}

// Opciones de búsqueda
export interface SearchOptions {
  query: string;
  fields?: string;
  pageSize?: number;
  orderBy?: string;
}

/**
 * Implementación del servicio Google Drive
 *
 * Esta clase proporciona los métodos necesarios para interactuar
 * con la API de Google Drive y recuperar información de archivos y carpetas.
 */
export class GoogleDriveService {
  private drive!: ReturnType<typeof google.drive>;
  private logger: Logger;

  /**
   * Constructor del servicio
   */
  constructor() {
    this.logger = new Logger("GoogleDriveService");
  }

  /**
   * Inicializa el servicio con las credenciales necesarias
   */
  async initialize(): Promise<void> {
    try {
      // Usar service account
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
          project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
        },
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      });

      this.drive = google.drive({ version: "v3", auth });

      // Test connection
      await this.drive.files.list({
        pageSize: 1,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      this.logger.info("GoogleDriveService initialized successfully");
    } catch (error) {
      this.logger.error("Error initializing GoogleDriveService", error);
      throw error;
    }
  }

  /**
   * Genera las diferentes URLs de Google Drive para un archivo
   */
  private generateDriveUrls(fileId: string) {
    return {
      download: `https://drive.google.com/uc?id=${fileId}&export=download`,
      preview: `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`,
      embed: `https://lh3.googleusercontent.com/d/${fileId}`,
    };
  }

  /**
   * Procesa el nombre del archivo para extraer prefijos y sufijos
   */
  private processFileName(name: string) {
    const {
      prefixes,
      order,
      displayName: nameWithoutPrefixes,
    } = extractPrefixes(name);
    const { suffixes, displayName } = extractSuffixes(nameWithoutPrefixes);

    return {
      originalName: name,
      displayName,
      name: name,
      prefixes,
      suffixes,
      order,
    };
  }

  /**
   * Convierte un Schema$File de Google Drive API a nuestro tipo DriveFile
   */
  private convertToFile(file: any): DriveFile {
    const processedName = this.processFileName(file.name || "");
    const urls = this.generateDriveUrls(file.id);

    return {
      id: file.id || "",
      ...processedName,
      mimeType: file.mimeType || "",
      description: file.description,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      parents: file.parents,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      thumbnailLink: file.thumbnailLink,
      transformedUrl: urls,
      hasThumbnail: file.hasThumbnail,
      size: file.size ? parseInt(file.size) : undefined,
      md5Checksum: file.md5Checksum,
      trashed: file.trashed,
      shared: file.shared,
      owners: file.owners,
      capabilities: file.capabilities,
    };
  }

  /**
   * Obtiene la lista de archivos en un directorio
   * @param params Parámetros de búsqueda
   * @returns Lista de archivos
   */
  async listFiles(
    params: ListFilesParams
  ): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
    this.logger.info(`Listando archivos en: ${params.folderId}`);

    const response = await this.drive.files.list({
      q: `'${params.folderId}' in parents and trashed = false`,
      pageSize: params.pageSize || 100,
      pageToken: params.pageToken,
      orderBy: params.orderBy || "name",
      fields:
        params.fields ||
        "files(id, name, mimeType, modifiedTime, parents, webViewLink, iconLink, thumbnailLink, hasThumbnail, size, md5Checksum, trashed, shared, owners, capabilities)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    return {
      files: (response.data.files || []).map((file) =>
        this.convertToFile(file)
      ),
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  /**
   * Obtiene la lista de carpetas en un directorio
   * @param parentId ID del directorio padre
   * @returns Lista de carpetas
   */
  async getFolders(parentId: string): Promise<DriveFile[]> {
    this.logger.info(`Obteniendo carpetas desde: ${parentId}`);
    const response = await this.listFiles({ folderId: parentId });
    return response.files.filter((file) => this.isFolder(file));
  }

  /**
   * Obtiene información de una carpeta por su ID
   * @param folderId ID de la carpeta en Google Drive
   * @returns Información de la carpeta
   */
  async getFolder(folderId: string): Promise<DriveFile> {
    this.logger.info(`Obteniendo carpeta: ${folderId}`);

    const response = await this.drive.files.get({
      fileId: folderId,
      fields:
        "id, name, mimeType, modifiedTime, parents, webViewLink, iconLink, thumbnailLink, hasThumbnail, size, md5Checksum, trashed, shared, owners, capabilities",
      supportsAllDrives: true,
    });

    return response.data as DriveFile;
  }

  /**
   * Verifica si un elemento es una carpeta
   * @param file Elemento a verificar
   * @returns true si el elemento es una carpeta
   */
  isFolder(file: DriveFile): boolean {
    return file.mimeType === "application/vnd.google-apps.folder";
  }

  /**
   * Obtiene información de un archivo o carpeta por su ID
   * @param fileId ID del archivo en Google Drive
   * @param fields Campos específicos a recuperar
   * @returns Información del archivo
   */
  async getFile(fileId: string, fields?: string): Promise<DriveFile> {
    this.logger.info(`Obteniendo archivo: ${fileId}`);

    // En una implementación real, aquí se haría la llamada a la API
    return Promise.resolve({
      id: fileId,
      name: "Archivo de ejemplo",
      mimeType: "application/octet-stream",
    });
  }

  /**
   * Obtiene el contenido de una carpeta
   * @param folderId ID de la carpeta
   * @returns Lista de archivos y carpetas contenidos
   */
  async getFolderContents(folderId: string): Promise<DriveFile[]> {
    this.logger.info(`Obteniendo contenido de carpeta: ${folderId}`);

    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      pageSize: 1000,
      fields:
        "files(id, name, mimeType, description, modifiedTime, size, parents, webViewLink, iconLink)",
      orderBy: "name",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    return (response.data.files || []).map((file) => this.convertToFile(file));
  }

  /**
   * Busca archivos según criterios específicos
   * @param options Opciones de búsqueda
   * @returns Archivos que coinciden con la búsqueda
   */
  async searchFiles(options: SearchOptions): Promise<ListFilesResponse> {
    this.logger.info(`Buscando archivos: ${options.query}`);

    // En una implementación real, aquí se haría la llamada a la API
    return Promise.resolve({
      files: [
        {
          id: "searchresult1",
          name: "Resultado de búsqueda",
          mimeType: "application/octet-stream",
        },
      ],
    });
  }

  /**
   * Obtiene el contenido de un archivo en texto
   * @param fileId ID del archivo
   * @returns Contenido en texto del archivo
   */
  async getFileContent(fileId: string): Promise<string> {
    this.logger.info(`Obteniendo contenido del archivo: ${fileId}`);

    // En una implementación real, aquí se haría la llamada a la API
    return Promise.resolve("Contenido del archivo de ejemplo");
  }

  /**
   * Crea una nueva carpeta
   * @param name Nombre de la carpeta
   * @param parentId ID del directorio padre
   * @returns Carpeta creada
   */
  async createFolder(name: string, parentId: string): Promise<DriveFile> {
    this.logger.info(`Creando carpeta: ${name} en ${parentId}`);
    // En una implementación real, aquí se haría la llamada a la API
    return {
      id: "new-folder-id",
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    };
  }

  /**
   * Actualiza una carpeta existente
   * @param folderId ID de la carpeta
   * @param options Opciones de actualización
   * @returns Carpeta actualizada
   */
  async updateFolder(
    folderId: string,
    options: { name?: string; description?: string }
  ): Promise<DriveFile> {
    this.logger.info(`Actualizando carpeta: ${folderId}`);
    // En una implementación real, aquí se haría la llamada a la API
    return {
      id: folderId,
      name: options.name || "Carpeta actualizada",
      mimeType: "application/vnd.google-apps.folder",
      description: options.description,
    };
  }

  /**
   * Actualiza un archivo existente
   * @param fileId ID del archivo
   * @param options Opciones de actualización
   * @returns Archivo actualizado
   */
  async updateFile(
    fileId: string,
    options: { name?: string; description?: string; parentId?: string }
  ): Promise<DriveFile> {
    this.logger.info(`Actualizando archivo: ${fileId}`);
    // En una implementación real, aquí se haría la llamada a la API
    return {
      id: fileId,
      name: options.name || "Archivo actualizado",
      mimeType: "application/octet-stream",
      description: options.description,
      parents: options.parentId ? [options.parentId] : undefined,
    };
  }

  /**
   * Elimina un archivo o carpeta
   * @param fileId ID del archivo o carpeta
   */
  async deleteFile(fileId: string): Promise<void> {
    this.logger.info(`Eliminando archivo/carpeta: ${fileId}`);
    // En una implementación real, aquí se haría la llamada a la API
  }

  /**
   * Sube un archivo a Google Drive
   * @param file Archivo a subir
   * @param options Opciones de subida
   * @returns Archivo subido
   */
  async uploadFile(
    file: File,
    options: { parentId?: string; description?: string }
  ): Promise<DriveFile> {
    this.logger.info(`Subiendo archivo: ${file.name}`);
    // En una implementación real, aquí se haría la llamada a la API
    return {
      id: "new-file-id",
      name: file.name,
      mimeType: file.type,
      parents: options.parentId ? [options.parentId] : undefined,
      description: options.description,
      size: file.size,
    };
  }
}
