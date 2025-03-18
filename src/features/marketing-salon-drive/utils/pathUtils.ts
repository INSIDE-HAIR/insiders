import { Drive } from "googleapis/build/src/apis/drive/v3";

/**
 * Utilidades para manejar rutas en Google Drive
 */
export class PathUtils {
  /**
   * Obtiene el ID de una carpeta a partir de su ruta
   * @param drive Cliente de la API de Google Drive
   * @param rootFolderId ID de la carpeta raíz
   * @param path Ruta de la carpeta (formato: "folder1/folder2/folder3")
   * @returns Promise con el ID de la carpeta
   */
  static async getFolderIdFromPath(
    drive: any,
    rootFolderId: string,
    path: string
  ): Promise<string> {
    if (!path || path === "/") {
      return rootFolderId;
    }

    // Normalizar la ruta (eliminar slashes al inicio y final)
    const normalizedPath = path.replace(/^\/+|\/+$/g, "");

    // Dividir la ruta en segmentos
    const pathSegments = normalizedPath.split("/");

    let currentFolderId = rootFolderId;

    // Navegar por cada segmento de la ruta
    for (const segment of pathSegments) {
      if (!segment) continue;

      try {
        // Buscar la carpeta actual dentro de la carpeta padre
        const response = await drive.files.list({
          q: `'${currentFolderId}' in parents and name = '${segment}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: "files(id, name)",
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        const folders = response.data.files;

        if (!folders || folders.length === 0) {
          throw new Error(`Folder not found: ${segment}`);
        }

        // Actualizar el ID de la carpeta actual
        currentFolderId = folders[0].id;
      } catch (error) {
        console.error(`Error finding folder ${segment}:`, error);
        throw new Error(
          `Failed to navigate path at segment '${segment}': ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    return currentFolderId;
  }
}
