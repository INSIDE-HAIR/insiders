import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint para actuar como proxy de descargas
 * Permite evitar las limitaciones de CORS descargando el archivo desde el servidor
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

    // Fetch del archivo
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error al obtener archivo: ${response.status}`);
    }

    // Obtener el tipo de contenido
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // Configurar las cabeceras para la respuesta
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-cache");

    // Pasar los datos directamente al cliente
    const arrayBuffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Error en proxy-download:", error);

    // Responder con error
    return res.status(500).json({
      error: "Error interno al procesar la descarga",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
 