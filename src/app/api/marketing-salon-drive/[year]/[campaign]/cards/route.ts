import { NextResponse } from "next/server";
import { GoogleDriveService } from "@/src/features/marketing-salon-drive/services/drive/GoogleDriveService";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { year: string; campaign: string };
  }
) {
  const { year, campaign } = params;

  try {
    // Validar parámetros de entrada
    if (!year || !campaign) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          details: { year, campaign },
        },
        { status: 400 }
      );
    }

    const driveService = new GoogleDriveService();

    // Construir la ruta de la carpeta en Drive
    const folderPath = `${year}/${campaign}`;

    // Obtener archivos con estructura de carpetas completa
    const files = await driveService.getFiles(folderPath);

    // Transformar URLs y asegurar que la estructura de carpetas anidadas se preserve
    const filesWithTransformedUrls = files.map((file) => {
      try {
        // Asegurar que la información de carpetas anidadas se preserve
        const transformedFile = {
          ...file,
          transformedUrl:
            file.transformedUrl ||
            driveService.convertGoogleDriveLink(file.id, file.mimeType),
        };

        // Preservar información de ruta anidada si existe
        if ((file as any).nestedPath && (file as any).nestedPath.length > 0) {
          console.log(
            `Archivo con ruta anidada: ${file.name}, ruta: ${(
              file as any
            ).nestedPath.join("/")}`
          );
        }

        return transformedFile;
      } catch (error) {
        console.error(`Error transforming URL for file ${file.id}:`, error);
        return file; // Devolver el archivo sin transformar
      }
    });

    // Información de depuración sobre la estructura de carpetas
    const folderStats = filesWithTransformedUrls.reduce((stats, file) => {
      const folder = file.folder || "Sin carpeta";
      const subFolder = file.subFolder || "Sin subcarpeta";
      const subSubFolder = (file as any).subSubFolder || "Sin sub-subcarpeta";

      if (!stats[folder]) {
        stats[folder] = { count: 0, subFolders: {} };
      }

      stats[folder].count++;

      if (subFolder !== "Sin subcarpeta") {
        if (!stats[folder].subFolders[subFolder]) {
          stats[folder].subFolders[subFolder] = { count: 0, subFolders: {} };
        }
        stats[folder].subFolders[subFolder].count++;

        // Registrar sub-subcarpetas si existen
        if (subSubFolder !== "Sin sub-subcarpeta") {
          if (!stats[folder].subFolders[subFolder].subFolders[subSubFolder]) {
            stats[folder].subFolders[subFolder].subFolders[subSubFolder] = {
              count: 0,
            };
          }
          stats[folder].subFolders[subFolder].subFolders[subSubFolder].count++;
        }
      }

      return stats;
    }, {} as Record<string, any>);

    console.log(
      "Estadísticas de estructura de carpetas:",
      JSON.stringify(folderStats, null, 2)
    );

    return NextResponse.json({
      success: true,
      data: filesWithTransformedUrls,
      metadata: {
        folderPath,
        fileCount: filesWithTransformedUrls.length,
        folderStructure: folderStats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching drive files:", error);

    // Determinar código de estado según el tipo de error
    let statusCode = 500;
    let errorMessage = "Failed to fetch files from Drive";
    let detailedPath = `${year}/${campaign}`;

    if (error instanceof Error) {
      // Errores específicos de navegación de carpetas
      if (error.message.includes("Carpeta no encontrada:")) {
        statusCode = 404;
        errorMessage = error.message; // Usamos directamente el mensaje mejorado
      }
      // Errores de configuración
      else if (error.message.includes("Missing required environment")) {
        statusCode = 500;
        errorMessage = "Server configuration error";
      }
      // Errores de autenticación
      else if (error.message.includes("credentials")) {
        statusCode = 401;
        errorMessage = "Authentication error with Google Drive";
      }
      // Otros errores
      else {
        errorMessage = `Error al acceder a Drive: ${error.message}`;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
        path: detailedPath,
      },
      { status: statusCode }
    );
  }
}
