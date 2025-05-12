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

  // Función para intentar descargar con el proxy hasta 5 veces (antes eran 3)
  const tryProxyDownload = async (retries = 5): Promise<Blob> => {
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        statusElement.textContent = `Descargando... (Intento ${attempt}/${retries})`;

        // Determinar qué endpoint del proxy usar (primero App Router, luego Pages Router)
        const proxyUrl =
          attempt <= 3
            ? `/api/drive/proxy-download?url=${encodeURIComponent(url)}`
            : `/api/proxy-download?url=${encodeURIComponent(url)}`;

        console.log(`Intento ${attempt}: Descargando con ${proxyUrl}`);
        console.log(`URL original: ${url}`);

        // Añadir timestamp para evitar caché
        const fetchUrl = `${proxyUrl}&t=${Date.now()}`;

        // Descargar con fetch utilizando timeout adecuado para archivos grandes
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log(
            `Timeout alcanzado después de 60 segundos en intento ${attempt}`
          );
        }, 60000); // 60 segundos

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
    // Método 1: Usar el proxy para todas las URLs
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

      // Actualizar mensaje para informar al usuario que se usará método directo
      statusElement.innerHTML = `
        <div style="margin-bottom: 5px;">Error en descarga con proxy</div>
        <div style="font-size: 0.9em;">Intentando descarga directa...</div>
      `;
      statusElement.style.backgroundColor = "#FF9800"; // Color de advertencia naranja
    }

    // Método 2: Intentar descarga directa sin proxy
    try {
      console.log("Intentando descarga directa sin proxy para:", url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(
          `Timeout alcanzado después de 60 segundos en descarga directa`
        );
      }, 60000); // 60 segundos

      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error en descarga directa: ${response.status}`);
      }

      // Obtener el tamaño total si está disponible
      const contentLength = response.headers.get("Content-Length");
      let totalSize = contentLength ? parseInt(contentLength) : 0;

      // Para archivos grandes, mostrar progreso
      if (totalSize > 5 * 1024 * 1024) {
        // > 5MB
        const reader = response.body?.getReader();
        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        if (reader) {
          statusElement.textContent = `Descarga directa... 0%`;

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
              statusElement.textContent = `Descarga directa... ${percentComplete}%`;
            } else {
              statusElement.textContent = `Descarga directa... ${(
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
            throw new Error(`Archivo descargado inválido (${blob.size} bytes)`);
          }

          // Crear URL del blob
          const objectUrl = URL.createObjectURL(blob);

          // Crear enlace y descargar
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
          statusElement.textContent = "¡Descarga directa completada!";
          statusElement.style.backgroundColor = "#4CAF50";
          setTimeout(() => document.body.removeChild(statusElement), 2000);

          return;
        }
      }

      // Fallback para archivos pequeños o si el stream no está disponible
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
      statusElement.textContent = "¡Descarga directa completada!";
      statusElement.style.backgroundColor = "#4CAF50";
      setTimeout(() => document.body.removeChild(statusElement), 2000);

      return;
    } catch (directError) {
      console.error("Error en descarga directa:", directError);
      console.log("URL que falló en descarga directa:", url);

      // Preparar para el método 3 de fallback
      statusElement.style.backgroundColor = "#f44336"; // Rojo para error
    }

    // Método 3: Fallback - Descargar directamente con un enlace en la misma ventana
    console.log("Usando método de fallback para:", url);

    statusElement.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">No se pudo descargar automáticamente</div>
      <div style="margin-bottom: 8px;">Intentando descarga directa simple</div>
      <div style="font-size: 0.9em; padding: 5px; background: rgba(255,255,255,0.3); border-radius: 3px;">
        Guardar como: <strong>${filename}</strong>
      </div>
    `;

    // Crear un enlace para descargar directamente en la misma ventana
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Mantener el mensaje por más tiempo
    setTimeout(() => {
      if (document.body.contains(statusElement)) {
        document.body.removeChild(statusElement);
      }
    }, 6000);
  } catch (error) {
    console.error("Error al descargar archivo:", error);
    console.log("URL de descarga fallida:", url);
    console.log("Nombre de archivo:", filename);

    // Mostrar mensaje de error más detallado
    statusElement.innerHTML = `
      <div style="background-color: #f44336; color: white; padding: 10px 15px; border-radius: 4px; max-width: 300px;">
        <div style="font-weight: bold; margin-bottom: 8px;">Error al descargar el archivo</div>
        <div style="font-size: 0.85em; margin-bottom: 8px;">
          No se pudo descargar: ${filename}
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <button id="retry-download" style="background: rgba(255,255,255,0.3); border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
            Reintentar
          </button>
          <button id="report-download-error" style="background: rgba(255,255,255,0.3); border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
            Reportar problema
          </button>
        </div>
      </div>
    `;

    // Agregar eventos a los botones
    setTimeout(() => {
      const retryButton = document.getElementById("retry-download");
      const reportButton = document.getElementById("report-download-error");

      if (retryButton) {
        retryButton.addEventListener("click", () => {
          document.body.removeChild(statusElement);
          downloadFileWithCustomName(url, filename);
        });
      }

      if (reportButton) {
        reportButton.addEventListener("click", () => {
          // Crear y abrir modal de reporte de error
          const event = new CustomEvent("report-download-error", {
            detail: { filename, url },
          });
          document.dispatchEvent(event);

          // Quitar la notificación después de abrir el modal
          document.body.removeChild(statusElement);
        });
      }
    }, 0);

    // Mantener el mensaje por más tiempo (30 segundos)
    setTimeout(() => {
      if (document.body.contains(statusElement)) {
        document.body.removeChild(statusElement);
      }
    }, 30000);
  }
};
