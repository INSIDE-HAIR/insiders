import { NextRequest, NextResponse } from "next/server";

// Configuración de la ruta como dinámica para evitar la generación estática
// debido al uso de parámetros de búsqueda (nextUrl.searchParams)
export const dynamic = "force-dynamic";
// Aumentar el límite de tiempo de respuesta para archivos grandes
export const maxDuration = 180; // 60 segundos

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

    // Opciones mejoradas para el fetch
    const fetchOptions = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      },
      // No seguir redirecciones automáticamente para Google Drive
      redirect: "follow" as RequestRedirect,
    };

    // Fetch del archivo
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error en respuesta HTTP: ${response.status} ${
          response.statusText
        }, Detalles: ${errorText.slice(0, 200)}...`
      );
      throw new Error(
        `Error al obtener archivo: ${response.status} ${response.statusText}`
      );
    }

    // Obtener el tipo de contenido
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");

    // Configurar cabeceras para la respuesta
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "no-cache");

    // Añadir Content-Length si está disponible
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // Si es un archivo grande (>10MB), usar streaming
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      // Usar streaming para archivos grandes
      return new NextResponse(response.body, {
        status: 200,
        headers: headers,
      });
    } else {
      // Para archivos pequeños, usar el método tradicional
      const arrayBuffer = await response.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: headers,
      });
    }
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
