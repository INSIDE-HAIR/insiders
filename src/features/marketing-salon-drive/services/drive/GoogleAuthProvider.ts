import { google } from "googleapis";

/**
 * Clase para proporcionar autenticación para acceder a Google Drive
 */
export class GoogleAuthProvider {
  /**
   * Crea un cliente autenticado para la API de Google Drive
   * @returns Cliente de Google Drive API
   */
  static createDriveClient() {
    // Verificar que las variables de entorno necesarias están definidas
    if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL) {
      throw new Error(
        "GOOGLE_DRIVE_CLIENT_EMAIL environment variable is not defined"
      );
    }

    if (!process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
      throw new Error(
        "GOOGLE_DRIVE_PRIVATE_KEY environment variable is not defined"
      );
    }

    if (!process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID) {
      throw new Error(
        "GOOGLE_DRIVE_ROOT_FOLDER_ID environment variable is not defined"
      );
    }

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

      // Crear y devolver el cliente de Drive
      return google.drive({ version: "v3", auth });
    } catch (error) {
      console.error("Error creating Google Drive client:", error);
      throw new Error(
        `Failed to initialize Google Drive client: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
