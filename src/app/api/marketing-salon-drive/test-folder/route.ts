import { NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * GET route handler for testing a specific Google Drive folder
 */
export async function GET(request: Request) {
  // Obtener parámetros de la solicitud
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("id");

  if (!folderId) {
    return NextResponse.json(
      {
        success: false,
        error: "Debe proporcionar un ID de carpeta",
      },
      { status: 400 }
    );
  }

  console.log(`Probando acceso a la carpeta: ${folderId}`);

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

    // Intentar obtener información sobre la carpeta en sí
    const folderInfo = await drive.files.get({
      fileId: folderId,
      fields: "id, name, mimeType",
      supportsAllDrives: true,
    });

    // Obtener las carpetas que están dentro de esta carpeta
    const folderContents = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name, mimeType)",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    // Retornar la información obtenida
    return NextResponse.json({
      success: true,
      folder: folderInfo.data,
      contents: folderContents.data.files || [],
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error al acceder a la carpeta:", error);
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
