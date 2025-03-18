/**
 * API Route: /api/marketing-salon-drive/files
 *
 * Propósito: Esta API devuelve los archivos disponibles en una carpeta específica
 * de Google Drive para el módulo Marketing Salon Drive.
 *
 * Respuesta:
 * - success: Indica si la operación fue exitosa
 * - data: Contiene la lista de archivos
 *   - files: Lista de archivos
 * - metadata: Información adicional sobre la respuesta
 *
 * Parámetros:
 * - folder: ID de la carpeta (requerido)
 * - yearId: ID del año (opcional, solo para metadatos)
 * - clientId: ID del cliente (opcional, solo para metadatos)
 * - campaignId: ID de la campaña (opcional, solo para metadatos)
 */

import { NextResponse } from "next/server";
import { google } from "googleapis";

// Define interfaces locally to avoid import issues
interface File {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink?: string;
  thumbnailLink?: string;
  transformedUrl?: {
    preview: string;
    embed: string;
    download: string;
  };
}

/**
 * GET route handler for marketing salon drive files
 */
export async function GET(request: Request) {
  // Obtener parámetros de la solicitud
  const { searchParams } = new URL(request.url);
  const folderParam = searchParams.get("folder");

  // Capturar parámetros adicionales (solo IDs)
  const yearId = searchParams.get("yearId");
  const clientId = searchParams.get("clientId");
  const campaignId = searchParams.get("campaignId");

  console.log("API de Google Drive (Files) - Params:", {
    folderParam,
    yearId,
    clientId,
    campaignId,
  });

  // Validar parámetros
  if (!folderParam) {
    return NextResponse.json(
      {
        success: false,
        error: "El parámetro 'folder' es requerido",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  // Object to store results
  const results: {
    files: File[];
  } = {
    files: [],
  };

  // Accessing Google Drive API
  console.log("Accessing Google Drive API for files...");

  // Añadir información de depuración sobre las variables de entorno
  console.log(
    "Verificando variables de entorno:",
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL ? "✓" : "✗",
    process.env.GOOGLE_DRIVE_PRIVATE_KEY ? "✓" : "✗",
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ? "✓" : "✗"
  );

  try {
    // Configurar la autenticación de Google Drive
    const drive = google.drive({
      version: "v3",
      auth: new google.auth.GoogleAuth({
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
      }),
    });

    // Obtener archivos de la carpeta solicitada
    console.log(`Obteniendo archivos para la carpeta: ${folderParam}`);
    try {
      const filesResponse = await drive.files.list({
        q: `'${folderParam}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
        fields:
          "files(id, name, mimeType, webViewLink, thumbnailLink, iconLink)",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      results.files = (filesResponse.data.files as File[]) || [];
      console.log(
        `Se encontraron ${results.files.length} archivos en la carpeta ${folderParam}`
      );

      // Procesar URLs de vista previa para ciertos tipos de archivos
      results.files = results.files.map((file) => {
        // Si es una imagen o documento de Google, crear URL transformadas
        if (
          file.mimeType.startsWith("image/") ||
          file.mimeType.includes("google-apps")
        ) {
          file.transformedUrl = {
            preview: file.webViewLink,
            embed: `https://drive.google.com/uc?id=${file.id}`,
            download: `https://drive.google.com/uc?export=download&id=${file.id}`,
          };
        }
        return file;
      });
    } catch (fileError) {
      console.error(
        `Error al obtener archivos: ${
          fileError instanceof Error ? fileError.message : String(fileError)
        }`
      );
      results.files = [];
    }

    // Preparar metadatos para la respuesta
    const metadata = {
      fileCount: results.files.length,
      timestamp: new Date().toISOString(),
      params: {
        folderPath: folderParam,
        // Incluir los parámetros adicionales en los metadatos
        yearId,
        clientId,
        campaignId,
      },
    };

    // Devolver respuesta JSON estructurada
    return NextResponse.json({
      success: true,
      data: results,
      metadata,
    });
  } catch (error) {
    console.error("Error en la API de Google Drive (Files):", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
