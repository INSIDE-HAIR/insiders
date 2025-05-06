/**
 * Función para descargar un archivo con un nombre personalizado
 * Intenta primero usar fetch y blob, con fallback a abrir en nueva pestaña
 *
 * @param url URL del archivo a descargar
 * @param filename Nombre para guardar el archivo
 */
export const downloadFileWithCustomName = async (
  url: string,
  filename: string
): Promise<void> => {
  // Crear y mostrar indicador de carga
  const statusElement = document.createElement("div");
  statusElement.textContent = "Descargando...";
  statusElement.style.position = "fixed";
  statusElement.style.bottom = "20px";
  statusElement.style.right = "20px";
  statusElement.style.backgroundColor = "#CEFF66";
  statusElement.style.color = "#000";
  statusElement.style.padding = "10px 20px";
  statusElement.style.borderRadius = "4px";
  statusElement.style.zIndex = "9999";
  statusElement.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  document.body.appendChild(statusElement);

  // Función para validar que el blob no sea un error o esté vacío
  const validateBlob = (blob: Blob): boolean => {
    // Verificar tamaño mínimo (3KB para considerar válido)
    return blob.size > 3 * 1024;
  };

  // Función para intentar descargar con el proxy hasta 3 veces
  const tryProxyDownload = async (retries = 3): Promise<Blob> => {
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        statusElement.textContent = `Descargando... (Intento ${attempt}/${retries})`;

        // Determinar qué endpoint del proxy usar (primero App Router, luego Pages Router)
        const proxyUrl =
          attempt <= 2
            ? `/api/drive/proxy-download?url=${encodeURIComponent(url)}`
            : `/api/proxy-download?url=${encodeURIComponent(url)}`;

        console.log(`Intento ${attempt}: Descargando con ${proxyUrl}`);

        // Añadir timestamp para evitar caché
        const fetchUrl = `${proxyUrl}&t=${Date.now()}`;

        // Descargar con fetch utilizando timeout adecuado para archivos grandes
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

        const response = await fetch(fetchUrl, {
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Error HTTP: ${response.status} ${response.statusText}`
          );
        }

        // Obtener el tamaño total si está disponible
        const contentLength = response.headers.get("Content-Length");
        let totalSize = contentLength ? parseInt(contentLength) : 0;

        // Para archivos grandes, mostrar progreso con ReadableStream
        if (totalSize > 5 * 1024 * 1024) {
          // > 5MB
          const reader = response.body?.getReader();
          const chunks: Uint8Array[] = [];
          let receivedLength = 0;

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                break;
              }

              chunks.push(value);
              receivedLength += value.length;

              // Actualizar progreso
              if (totalSize > 0) {
                const percentComplete = Math.round(
                  (receivedLength / totalSize) * 100
                );
                statusElement.textContent = `Descargando... ${percentComplete}%`;
              } else {
                statusElement.textContent = `Descargando... ${(
                  receivedLength /
                  (1024 * 1024)
                ).toFixed(1)} MB`;
              }
            }

            // Concatenar chunks en un solo Uint8Array
            const chunksAll = new Uint8Array(receivedLength);
            let position = 0;
            for (const chunk of chunks) {
              chunksAll.set(chunk, position);
              position += chunk.length;
            }

            // Convertir a Blob
            const blob = new Blob([chunksAll]);

            // Validar que no sea un error pequeño
            if (!validateBlob(blob)) {
              throw new Error(
                `Archivo descargado inválido (${blob.size} bytes)`
              );
            }

            return blob;
          }
        }

        // Fallback para archivos pequeños o si el stream no está disponible
        const blob = await response.blob();

        // Validar que el blob no sea un error pequeño
        if (!validateBlob(blob)) {
          throw new Error(`Archivo descargado inválido (${blob.size} bytes)`);
        }

        return blob;
      } catch (error) {
        lastError = error;
        console.error(`Error en intento ${attempt}/${retries}:`, error);

        // Esperar antes de reintentar (500ms, 1s, 2s)
        if (attempt < retries) {
          await new Promise((r) =>
            setTimeout(r, 500 * Math.pow(2, attempt - 1))
          );
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    throw lastError || new Error("Todos los intentos de descarga fallaron");
  };

  try {
    // Método 1: Proxy del archivo - Solo intentar para URLs de Google Drive
    if (url.includes("drive.google.com") || url.includes("googleapis.com")) {
      try {
        console.log("Intentando método de proxy para descargar:", url);

        // Intentar descargar a través del proxy con reintentos
        const blob = await tryProxyDownload();
        const objectUrl = URL.createObjectURL(blob);

        // Crear el enlace de descarga
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Liberar recursos
        setTimeout(() => URL.revokeObjectURL(objectUrl), 100);

        // Mostrar mensaje de éxito
        statusElement.textContent = "¡Descarga completada!";
        statusElement.style.backgroundColor = "#4CAF50";
        setTimeout(() => document.body.removeChild(statusElement), 2000);

        return;
      } catch (proxyError) {
        console.error("Error al usar el proxy:", proxyError);
        // Continuar con el método alternativo
      }
    }

    // Método 2: Intentar fetchear directamente
    try {
      console.log("Intentando fetch directo para descargar:", url);

      const response = await fetch(url, {
        method: "GET",
        mode: "cors", // Intentar modo CORS
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(`Error en fetch: ${response.status}`);
      }

      const blob = await response.blob();

      // Validar que el blob no sea un error pequeño
      if (!validateBlob(blob)) {
        throw new Error(`Archivo descargado inválido (${blob.size} bytes)`);
      }

      const objectUrl = URL.createObjectURL(blob);

      // Crear el enlace de descarga
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Liberar recursos
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100);

      // Mostrar mensaje de éxito
      statusElement.textContent = "¡Descarga completada!";
      statusElement.style.backgroundColor = "#4CAF50";
      setTimeout(() => document.body.removeChild(statusElement), 2000);

      return;
    } catch (fetchError) {
      console.error("Error al fetch directo:", fetchError);
      // Continuar con el método alternativo
    }

    // Método 3: Fallback - Abrir en nueva ventana con instrucciones
    console.log("Usando método de fallback para:", url);

    statusElement.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">No se pudo descargar automáticamente</div>
      <div style="margin-bottom: 8px;">Abriéndolo en nueva ventana</div>
      <div style="font-size: 0.9em; padding: 5px; background: rgba(255,255,255,0.3); border-radius: 3px;">
        Guardar como: <strong>${filename}</strong>
      </div>
    `;

    // Abrir en nueva ventana
    window.open(url, "_blank");

    // Mantener el mensaje por más tiempo
    setTimeout(() => {
      if (document.body.contains(statusElement)) {
        document.body.removeChild(statusElement);
      }
    }, 6000);
  } catch (error) {
    console.error("Error al descargar archivo:", error);

    // Mostrar mensaje de error
    statusElement.textContent = "Error al descargar el archivo";
    statusElement.style.backgroundColor = "#f44336";
    statusElement.style.color = "#fff";

    setTimeout(() => {
      if (document.body.contains(statusElement)) {
        document.body.removeChild(statusElement);
      }
    }, 3000);
  }
};
