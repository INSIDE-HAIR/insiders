/**
 * API Route: /api/marketing-salon-drive/diagnosis
 *
 * Propósito: Este endpoint diagnostica problemas con la conexión de Google Drive
 * y verifica que las variables de entorno estén configuradas correctamente.
 */

import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url);
    const specificFolder = searchParams.get("folder");

    // Recopilar información de diagnóstico
    const diagnosticInfo: any = {
      environment: {
        node_env: process.env.NODE_ENV,
        has_credentials: {
          GOOGLE_DRIVE_CLIENT_EMAIL: !!process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
          GOOGLE_DRIVE_PRIVATE_KEY: !!process.env.GOOGLE_DRIVE_PRIVATE_KEY,
          GOOGLE_DRIVE_PROJECT_ID: !!process.env.GOOGLE_DRIVE_PROJECT_ID,
          GOOGLE_DRIVE_CLIENT_ID: !!process.env.GOOGLE_DRIVE_CLIENT_ID,
          GOOGLE_DRIVE_ROOT_FOLDER_ID:
            !!process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
        },
        GOOGLE_DRIVE_CLIENT_EMAIL_partial: process.env.GOOGLE_DRIVE_CLIENT_EMAIL
          ? `${process.env.GOOGLE_DRIVE_CLIENT_EMAIL.substring(
              0,
              4
            )}...${process.env.GOOGLE_DRIVE_CLIENT_EMAIL.substring(
              process.env.GOOGLE_DRIVE_CLIENT_EMAIL.indexOf("@")
            )}`
          : "no configurado",
        GOOGLE_DRIVE_PRIVATE_KEY_length: process.env.GOOGLE_DRIVE_PRIVATE_KEY
          ? process.env.GOOGLE_DRIVE_PRIVATE_KEY.length
          : 0,
        GOOGLE_DRIVE_ROOT_FOLDER_ID:
          process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "no configurado",
      },
      google_drive_test: null,
      error: null,
    };

    // Probar la conexión a Google Drive
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
      const drive = google.drive({ version: "v3", auth });

      // Verificar el folder raíz
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      diagnosticInfo.rootFolderId = rootFolderId;

      if (!rootFolderId) {
        throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID no está configurado");
      }

      // Obtener información del folder raíz
      const rootFolder = await drive.files.get({
        fileId: rootFolderId,
        fields: "id, name, mimeType",
        supportsAllDrives: true,
      });

      diagnosticInfo.google_drive_test = {
        root_folder: rootFolder.data,
      };

      // Intentar listar carpetas en el folder raíz
      const response = await drive.files.list({
        q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name, mimeType)",
        pageSize: 10,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      diagnosticInfo.google_drive_test.folder_list = {
        found: response.data.files ? response.data.files.length : 0,
        files: response.data.files || [],
      };
    } catch (error) {
      diagnosticInfo.error =
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : String(error);
    }

    // Si se especifica un ID de carpeta, realizar diagnóstico específico
    if (specificFolder) {
      try {
        diagnosticInfo.specific_folder_test = {
          folder_id: specificFolder,
          status: "testing",
        };

        // Configurar Google Drive si no está ya disponible
        const driveForSpecificFolder = google.drive({
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

        // Intentar obtener información de la carpeta
        const folderInfo = await driveForSpecificFolder.files.get({
          fileId: specificFolder,
          fields: "id, name, mimeType",
          supportsAllDrives: true,
        });

        diagnosticInfo.specific_folder_test.folder_info = folderInfo.data;

        // Obtener subcarpetas
        const folderContents = await driveForSpecificFolder.files.list({
          q: `'${specificFolder}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: "files(id, name, mimeType)",
          pageSize: 100,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        diagnosticInfo.specific_folder_test.subfolders = {
          count: folderContents.data.files?.length || 0,
          folders: folderContents.data.files || [],
        };

        diagnosticInfo.specific_folder_test.status = "success";
      } catch (folderError) {
        diagnosticInfo.specific_folder_test.status = "error";
        diagnosticInfo.specific_folder_test.error =
          folderError instanceof Error
            ? folderError.message
            : String(folderError);
      }
    }

    // Devolver información de diagnóstico
    return NextResponse.json({
      success: !diagnosticInfo.error,
      diagnosis: diagnosticInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
