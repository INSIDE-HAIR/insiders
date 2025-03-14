import { NextResponse } from "next/server";

// Proxy para imágenes de Google Drive
export async function GET(request: Request) {
  try {
    // Extraer el ID del archivo y el tamaño de la URL
    const url = new URL(request.url);
    const fileId = url.searchParams.get("id");
    const size = url.searchParams.get("sz") || "w1000";
    const mode = url.searchParams.get("mode") || "thumbnail"; // Modo por defecto: thumbnail

    if (!fileId) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    // Determinar la URL de Google Drive según el modo
    let googleDriveUrl: string;

    switch (mode) {
      case "direct":
        // URL directa para imágenes (solo funciona con algunos tipos de archivos)
        googleDriveUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
        break;
      case "export":
        // URL para descargar como imagen (funciona para algunos documentos)
        googleDriveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        break;
      case "thumbnail":
      default:
        // URL para obtener thumbnail (funciona para casi todos los archivos)
        googleDriveUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
        break;
    }

    // Configuración avanzada para la solicitud
    const fetchOptions: RequestInit = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        Accept: "image/webp,image/jpeg,image/png,image/*,*/*",
        Referer: "https://drive.google.com/",
      },
      cache: "no-store", // Evitar cacheo que podría causar problemas
    };

    // Hacer la solicitud a Google Drive
    const response = await fetch(googleDriveUrl, fetchOptions);

    if (!response.ok) {
      // Si el modo actual falla, intentar con un modo alternativo
      if (mode !== "thumbnail") {
        // Intentar con thumbnail como fallback
        const fallbackUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
        const fallbackResponse = await fetch(fallbackUrl, fetchOptions);

        if (fallbackResponse.ok) {
          // Si el fallback funciona, usar su respuesta
          const imageBuffer = await fallbackResponse.arrayBuffer();
          return new NextResponse(imageBuffer, {
            headers: {
              "Content-Type":
                fallbackResponse.headers.get("Content-Type") || "image/jpeg",
              "Cache-Control": "public, max-age=3600", // Cachear por 1 hora
            },
          });
        }
      }

      // Si ninguna alternativa funciona, devolver error
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Obtener el buffer de la imagen
    const imageBuffer = await response.arrayBuffer();

    // Verificar si la respuesta tiene un tamaño razonable para ser una imagen
    if (imageBuffer.byteLength < 100) {
      // Si es muy pequeño, probablemente es un error
      // Intentar un modo alternativo
      const fallbackUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      const fallbackResponse = await fetch(fallbackUrl, fetchOptions);

      if (
        fallbackResponse.ok &&
        (await fallbackResponse.arrayBuffer()).byteLength > 100
      ) {
        // Si el fallback devuelve una imagen válida, usarla
        const validImageBuffer = await fallbackResponse.arrayBuffer();
        return new NextResponse(validImageBuffer, {
          headers: {
            "Content-Type":
              fallbackResponse.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    // Crear una respuesta con el tipo de contenido correcto
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=3600", // Cachear por 1 hora
      },
    });
  } catch (error) {
    console.error("Error in image proxy:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
