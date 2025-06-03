import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Detecta si la solicitud proviene de un dispositivo móvil
 */
function isMobileDevice(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
}

/**
 * Obtiene headers optimizados según el tipo de dispositivo
 */
function getOptimizedHeaders(userAgent: string) {
  const isMobile = isMobileDevice(userAgent);

  if (isMobile) {
    // Headers específicos para móviles
    if (/iPhone|iPad/.test(userAgent)) {
      return {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      };
    } else {
      return {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 11; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      };
    }
  }

  // Headers para desktop
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  };
}

/**
 * API endpoint para actuar como proxy de descargas
 * Permite evitar las limitaciones de CORS descargando el archivo desde el servidor
 * Optimizado para dispositivos móviles
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

    // Detectar tipo de dispositivo desde el user agent
    const userAgent = req.headers["user-agent"] || "";
    const isMobile = isMobileDevice(userAgent);

    console.log(
      `Descargando desde el servidor (${isMobile ? "móvil" : "desktop"}):`,
      url
    );

    // Configuración específica para móviles
    const config = {
      timeout: isMobile ? 30000 : 45000, // 30s para móviles, 45s para desktop
      chunkThreshold: isMobile ? 2 * 1024 * 1024 : 10 * 1024 * 1024, // 2MB vs 10MB
      streamChunkSize: isMobile ? 32 * 1024 : 64 * 1024, // 32KB vs 64KB
    };

    // Headers optimizados para el tipo de dispositivo
    const fetchHeaders = getOptimizedHeaders(userAgent);

    // Crear controller para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log(
        `Timeout alcanzado después de ${config.timeout / 1000}s (${
          isMobile ? "móvil" : "desktop"
        })`
      );
    }, config.timeout);

    try {
      // Fetch del archivo con timeout optimizado
      const response = await fetch(url, {
        headers: fetchHeaders,
        redirect: "follow" as RequestRedirect,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Error en respuesta HTTP (${isMobile ? "móvil" : "desktop"}): ${
            response.status
          } ${response.statusText}, Detalles: ${errorText.slice(0, 200)}...`
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
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

      // Headers específicos para móviles
      if (isMobile) {
        res.setHeader("Connection", "keep-alive");
        res.setHeader("Keep-Alive", "timeout=30");
      }

      // Añadir Content-Length si está disponible
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
        console.log(
          `Archivo de ${(parseInt(contentLength) / (1024 * 1024)).toFixed(
            2
          )} MB (${isMobile ? "móvil" : "desktop"})`
        );
      }

      const fileSize = contentLength ? parseInt(contentLength) : 0;

      // Decidir estrategia de streaming basada en tamaño y tipo de dispositivo
      if (fileSize > config.chunkThreshold && response.body) {
        console.log(
          `Usando streaming para archivo grande (${
            isMobile ? "móvil" : "desktop"
          })`
        );

        try {
          // Iniciar la respuesta
          res.status(200);

          // Obtener reader del body
          const reader = response.body.getReader();

          // Procesar el stream por chunks optimizados para móviles
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              res.end();
              break;
            }

            // En móviles, procesar chunks más pequeños para evitar problemas de memoria
            if (isMobile && value.length > config.streamChunkSize) {
              // Dividir en chunks más pequeños
              for (let i = 0; i < value.length; i += config.streamChunkSize) {
                const chunk = value.slice(i, i + config.streamChunkSize);
                res.write(Buffer.from(chunk));

                // Pequeña pausa para evitar saturar la memoria en móviles
                await new Promise((resolve) => setTimeout(resolve, 5));
              }
            } else {
              // Escribir chunk completo
              res.write(Buffer.from(value));
            }
          }
        } catch (streamError) {
          console.error(
            `Error durante el streaming (${isMobile ? "móvil" : "desktop"}):`,
            streamError
          );
          // Si aún no hemos finalizado, intentar cerrar adecuadamente
          if (!res.writableEnded) {
            res.end();
          }
        }
      } else {
        console.log(
          `Procesando archivo pequeño directamente (${
            isMobile ? "móvil" : "desktop"
          })`
        );

        // Para archivos pequeños, usar el método tradicional pero con timeout específico para móviles
        const arrayBufferTimeout = isMobile ? 15000 : 30000;
        const arrayBufferController = new AbortController();
        const arrayBufferTimeoutId = setTimeout(() => {
          arrayBufferController.abort();
        }, arrayBufferTimeout);

        try {
          const arrayBuffer = await response.arrayBuffer();
          clearTimeout(arrayBufferTimeoutId);

          console.log(
            `Archivo procesado exitosamente: ${arrayBuffer.byteLength} bytes (${
              isMobile ? "móvil" : "desktop"
            })`
          );

          res.status(200).send(Buffer.from(arrayBuffer));
        } catch (bufferError) {
          clearTimeout(arrayBufferTimeoutId);
          console.error(
            `Error al procesar arrayBuffer (${
              isMobile ? "móvil" : "desktop"
            }):`,
            bufferError
          );
          throw bufferError;
        }
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    // Detectar tipo de dispositivo para logging
    const userAgent = req.headers["user-agent"] || "";
    const isMobile = isMobileDevice(userAgent);

    console.error(
      `Error en proxy-download (${isMobile ? "móvil" : "desktop"}):`,
      error
    );

    // Preparar respuesta de error específica para el tipo de dispositivo
    let errorMessage = "Error interno al procesar la descarga";
    let errorDetails =
      error instanceof Error ? error.message : "Error desconocido";

    // Mensajes específicos para móviles
    if (isMobile) {
      if (error instanceof Error && error.name === "AbortError") {
        errorMessage = "Timeout de descarga (conexión móvil lenta)";
        errorDetails =
          "La descarga tomó demasiado tiempo. Intenta con una conexión WiFi más estable.";
      } else if (error instanceof Error && error.message.includes("fetch")) {
        errorMessage = "Error de conexión móvil";
        errorDetails =
          "Problema de conectividad. Verifica tu conexión a internet.";
      }
    }

    // Responder con error
    return res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      deviceType: isMobile ? "mobile" : "desktop",
      userAgent: userAgent.slice(0, 100), // Solo los primeros 100 caracteres para debugging
    });
  }
}
