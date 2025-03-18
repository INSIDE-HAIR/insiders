import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * @swagger
 * /api/marketing-salon-drive/folders/{id}:
 *   get:
 *     description: Obtiene información de una carpeta específica por su ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de Google Drive de la carpeta
 *     responses:
 *       200:
 *         description: Datos de la carpeta y su contenido
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 */

// Interfaz para mapear los resultados de Google Drive a nuestro formato
interface FolderItem {
  id: string;
  name: string;
  path: string;
  parents?: string[] | null;
}

// GET handler for retrieving folder by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`API: GET /api/marketing-salon-drive/folders/${params.id}`);

  // Capturar el ID de la carpeta desde los parámetros de la ruta
  const folderId = params.id;

  if (!folderId) {
    return NextResponse.json(
      {
        success: false,
        error: "Se requiere un ID de carpeta",
      },
      { status: 400 }
    );
  }

  // Resultados que se devolverán
  const results: { folders: FolderItem[] } = {
    folders: [],
  };

  // Registrar el tiempo para medir rendimiento
  const startTime = new Date();

  try {
    // Verificar que las variables de entorno necesarias estén configuradas
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error(
        "Faltan variables de entorno para autenticación con Google"
      );
      return NextResponse.json(
        {
          success: false,
          error: "Error de configuración del servidor",
        },
        { status: 500 }
      );
    }

    // Configurar autenticación con Google
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/drive.readonly"]
    );

    const drive = google.drive({ version: "v3", auth });

    // Verificar que la carpeta existe y obtener detalles
    try {
      const folderDetails = await drive.files.get({
        fileId: folderId,
        fields: "id, name, mimeType, parents",
      });

      if (
        folderDetails.data.mimeType !== "application/vnd.google-apps.folder"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "El ID proporcionado no corresponde a una carpeta",
          },
          { status: 400 }
        );
      }

      // Obtener los elementos dentro de la carpeta
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, mimeType, parents)",
        pageSize: 1000,
      });

      const files = response.data.files || [];

      // Filtrar para obtener solo las carpetas
      const folders = files.filter(
        (file) => file.mimeType === "application/vnd.google-apps.folder"
      );

      // Mapear las carpetas al formato esperado
      results.folders = folders.map((folder) => ({
        id: folder.id || "",
        name: folder.name || "",
        path: `${folder.parents ? folder.parents[0] : ""}/${folder.id}`,
        parents: folder.parents,
      }));

      // Devolver la respuesta con los datos
      return NextResponse.json({
        success: true,
        data: {
          folders: results.folders,
        },
        metadata: {
          folderCount: results.folders.length,
          timestamp: new Date().toISOString(),
          params: {
            folderPath: folderId,
          },
        },
      });
    } catch (error) {
      console.error(`Error al acceder a la carpeta con ID ${folderId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: `No se pudo acceder a la carpeta: ${error}`,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error al consultar carpeta por ID:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Error del servidor: ${error}`,
      },
      { status: 500 }
    );
  }
}
