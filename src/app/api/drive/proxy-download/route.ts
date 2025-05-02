import { NextRequest, NextResponse } from "next/server";

// Configuración de la ruta como dinámica para evitar la generación estática
// debido al uso de parámetros de búsqueda (nextUrl.searchParams)
export const dynamic = "force-dynamic";

/**
 * API endpoint para actuar como proxy de descargas
 * Permite evitar las limitaciones de CORS descargando el archivo desde el servidor
 *
 * @param request La solicitud HTTP
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener URL de la consulta
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL no proporcionada" },
        { status: 400 }
      );
    }

    // Validar que la URL sea de Google Drive o dominios permitidos
    if (!url.includes("drive.google.com") && !url.includes("googleapis.com")) {
      return NextResponse.json(
        { error: "Dominio no permitido" },
        { status: 403 }
      );
    }

    console.log("Descargando desde el servidor:", url);

    // Fetch del archivo
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error al obtener archivo: ${response.status}`);
    }

    // Obtener el tipo de contenido
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // Obtener los datos
    const arrayBuffer = await response.arrayBuffer();

    // Crear respuesta con el contenido del archivo
    const newResponse = new NextResponse(arrayBuffer);

    // Configurar cabeceras
    newResponse.headers.set("Content-Type", contentType);
    newResponse.headers.set("Cache-Control", "no-cache");

    return newResponse;
  } catch (error) {
    console.error("Error en proxy-download:", error);

    // Responder con error
    return NextResponse.json(
      {
        error: "Error interno al procesar la descarga",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
