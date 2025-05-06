import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint para actuar como proxy de descargas
 * Permite evitar las limitaciones de CORS descargando el archivo desde el servidor
 *
 * Configurado para manejar archivos grandes a través de streaming
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verificar método
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    // Obtener URL de la consulta
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ error: "URL no proporcionada" });
    }

    // Validar que la URL sea de Google Drive o dominios permitidos
    if (!url.includes("drive.google.com") && !url.includes("googleapis.com")) {
      return res.status(403).json({ error: "Dominio no permitido" });
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

    // Obtener el tipo de contenido y longitud
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");

    // Configurar las cabeceras para la respuesta
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-cache");

    // Añadir Content-Length si está disponible
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Para archivos grandes (>10MB), usar procesamiento por chunks
    if (
      contentLength &&
      parseInt(contentLength) > 10 * 1024 * 1024 &&
      response.body
    ) {
      try {
        // Iniciar la respuesta
        res.status(200);

        // Obtener reader del body
        const reader = response.body.getReader();

        // Procesar el stream por chunks
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            res.end();
            break;
          }

          // Escribir chunk al response
          res.write(Buffer.from(value));
        }
      } catch (streamError) {
        console.error("Error durante el streaming:", streamError);
        // Si aún no hemos finalizado, intentar cerrar adecuadamente
        if (!res.writableEnded) {
          res.end();
        }
      }
    } else {
      // Para archivos pequeños o si no hay body, usar el método tradicional
      const arrayBuffer = await response.arrayBuffer();
      res.status(200).send(Buffer.from(arrayBuffer));
    }
  } catch (error) {
    console.error("Error en proxy-download:", error);

    // Responder con error
    return res.status(500).json({
      error: "Error interno al procesar la descarga",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
