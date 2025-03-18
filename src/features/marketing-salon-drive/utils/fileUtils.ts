import { DriveFile, GoogleDriveLinks } from "../types/drive";

/**
 * Utilidades para manejar archivos de Google Drive
 */
export class FileUtils {
  /**
   * Extrae información del nombre del archivo
   */
  static parseFileName(fileName: string): {
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
   * Convierte un enlace de Google Drive a enlaces de previsualización y descarga
   * @param drive Cliente de la API de Google Drive
   * @param fileId ID del archivo en Google Drive
   * @returns Objeto con los enlaces generados
   */
  static async convertGoogleDriveLink(drive: any, fileId: string) {
    try {
      // Obtener el tipo MIME del archivo
      const response = await drive.files.get({
        fileId,
        fields: "id,name,mimeType",
        supportsAllDrives: true,
      });

      const { mimeType } = response.data;

      // Generar enlaces basados en el tipo MIME
      const previewUrl = this.generatePreviewUrl(fileId, mimeType);
      const downloadUrl = this.generateDownloadUrl(fileId);

      return {
        previewUrl,
        downloadUrl,
      };
    } catch (error) {
      console.error(`Error getting file info for ID ${fileId}:`, error);
      throw new Error(
        `Failed to convert link: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Genera un enlace de previsualización basado en el tipo MIME
   * @param fileId ID del archivo
   * @param mimeType Tipo MIME del archivo
   * @returns URL de previsualización
   */
  private static generatePreviewUrl(fileId: string, mimeType?: string): string {
    // Para imágenes, usar el enlace directo de contenido
    if (mimeType?.startsWith("image/")) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // Para PDFs y documentos, usar el visor de Google
    if (
      mimeType === "application/pdf" ||
      mimeType === "application/vnd.google-apps.document" ||
      mimeType === "application/vnd.google-apps.spreadsheet" ||
      mimeType === "application/vnd.google-apps.presentation"
    ) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Para otros tipos, usar el visor genérico
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  /**
   * Genera un enlace de descarga
   * @param fileId ID del archivo
   * @returns URL de descarga
   */
  private static generateDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
}
