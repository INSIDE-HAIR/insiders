/**
 * Función para descargar un archivo con un nombre personalizado
 * Intenta primero usar fetch y blob, con fallback a abrir en nueva pestaña
 * Optimizada para dispositivos móviles
 *
 * @param url URL del archivo a descargar
 * @param filename Nombre para guardar el archivo
 */
export const downloadFileWithCustomName = async (
  url: string,
  filename: string
): Promise<void> => {
  // Detectar si es un dispositivo móvil
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Detectar conexión lenta (si está disponible)
  const connection = (navigator as any).connection;
  const isSlowConnection =
    connection &&
    (connection.effectiveType === "slow-2g" ||
      connection.effectiveType === "2g" ||
      connection.saveData === true);

  // Configuración específica para móviles
  const mobileConfig = {
    timeout: isMobile ? 30000 : 60000, // 30s para móviles, 60s para desktop
    chunkThreshold: isMobile ? 2 * 1024 * 1024 : 5 * 1024 * 1024, // 2MB vs 5MB
    maxRetries: isMobile ? 2 : 3, // Menos reintentos en móviles
    retryDelay: isMobile ? 1000 : 500, // Más tiempo entre reintentos en móviles
  };

  // Emitir evento de inicio de descarga para feedback de botones
  const downloadStartEvent = new CustomEvent("download-start", {
    detail: { url, filename, isMobile },
  });
  document.dispatchEvent(downloadStartEvent);

  // Detectar si estamos dentro de un iframe
  const isInIframe = window !== window.top;

  // Crear y mostrar indicador de carga con mayor visibilidad (optimizado para iframes)
  const statusElement = document.createElement("div");
  statusElement.textContent = isMobile
    ? "Descargando (móvil)..."
    : "Descargando...";
  statusElement.style.position = "fixed";
  statusElement.style.bottom = isMobile ? "10px" : "20px";
  statusElement.style.right = isMobile ? "10px" : "20px";
  statusElement.style.backgroundColor = "#CEFF66";
  statusElement.style.color = "#000";
  statusElement.style.padding = isMobile ? "12px 16px" : "10px 20px";
  statusElement.style.borderRadius = "8px";
  statusElement.style.zIndex = "2147483647"; // Máximo z-index para asegurar visibilidad
  statusElement.style.boxShadow = isMobile
    ? "0 4px 20px rgba(0,0,0,0.3), 0 0 0 2px rgba(206, 255, 102, 0.5)"
    : "0 2px 8px rgba(0,0,0,0.2)";
  statusElement.style.maxWidth = isMobile ? "calc(100vw - 20px)" : "350px";
  statusElement.style.fontSize = isMobile ? "0.95em" : "1em";
  statusElement.style.fontWeight = "500";
  statusElement.style.border = isMobile ? "2px solid #000" : "none";
  statusElement.style.animation = isMobile ? "pulse 2s infinite" : "none";

  // Estilos específicos para iframes
  if (isInIframe) {
    statusElement.style.position = "fixed";
    statusElement.style.zIndex = "999999999"; // Z-index ultra alto para iframes
    statusElement.style.pointerEvents = "auto";
    statusElement.style.isolation = "isolate"; // Crear nuevo contexto de apilamiento
    statusElement.style.transform = "translateZ(0)"; // Forzar capa de composición
    statusElement.style.willChange = "transform"; // Optimización de rendering
    statusElement.style.border = "3px solid #000"; // Borde más prominente en iframes
    statusElement.style.boxShadow =
      "0 8px 32px rgba(0,0,0,0.4), 0 0 0 3px rgba(206, 255, 102, 0.8), inset 0 0 0 1px rgba(0,0,0,0.1)";
  }

  // Agregar animación de pulso para móviles (compatible con iframes)
  if (isMobile && !document.getElementById("download-pulse-style")) {
    const style = document.createElement("style");
    style.id = "download-pulse-style";
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1) translateZ(0); opacity: 1; }
        50% { transform: scale(1.02) translateZ(0); opacity: 0.9; }
        100% { transform: scale(1) translateZ(0); opacity: 1; }
      }
      /* Estilos específicos para iframes */
      ${
        isInIframe
          ? `
      .download-toast-iframe {
        position: fixed !important;
        z-index: 999999999 !important;
        isolation: isolate !important;
        transform: translateZ(0) !important;
        will-change: transform !important;
      }
      `
          : ""
      }
    `;
    document.head.appendChild(style);
  }

  // Agregar clase específica para iframes
  if (isInIframe) {
    statusElement.classList.add("download-toast-iframe");
  }

  document.body.appendChild(statusElement);

  // Función helper para mantener estilos de iframe en todas las actualizaciones
  const ensureIframeVisibility = (element: HTMLElement) => {
    if (isInIframe) {
      element.style.position = "fixed";
      element.style.zIndex = "999999999";
      element.style.pointerEvents = "auto";
      element.style.isolation = "isolate";
      element.style.transform = "translateZ(0)";
      element.style.willChange = "transform";
      // Mantener borde prominente pero ajustar según el estado
      if (!element.style.border || element.style.border === "none") {
        element.style.border = "3px solid #000";
      }
      // Realzar boxShadow para iframe si no está ya configurado específicamente
      if (!element.style.boxShadow.includes("rgba(206, 255, 102")) {
        element.style.boxShadow =
          element.style.boxShadow + ", 0 0 0 3px rgba(206, 255, 102, 0.6)";
      }
    }
  };

  // Función para validar que el blob no sea un error o esté vacío
  const validateBlob = (blob: Blob): boolean => {
    // Verificar tamaño mínimo (1KB para móviles, 3KB para desktop)
    const minSize = isMobile ? 1024 : 3 * 1024;
    return blob.size > minSize;
  };

  // Función para obtener headers optimizados para el dispositivo
  const getHeaders = () => {
    const baseHeaders = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    };

    // User Agent optimizado para móviles
    if (isMobile) {
      return {
        ...baseHeaders,
        "User-Agent": /iPhone|iPad/.test(navigator.userAgent)
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
          : "Mozilla/5.0 (Linux; Android 11; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36",
      };
    }

    return {
      ...baseHeaders,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    };
  };

  // Función para intentar descargar con el proxy hasta N veces
  const tryProxyDownload = async (
    retries = mobileConfig.maxRetries
  ): Promise<Blob> => {
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        statusElement.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; background: #000; border-radius: 50%; animation: pulse 1s infinite;"></div>
            <span>Descargando... (${attempt}/${retries})${
          isMobile ? " [móvil]" : ""
        }</span>
          </div>
        `;

        // Determinar qué endpoint del proxy usar
        const proxyUrl =
          attempt <= Math.ceil(retries / 2)
            ? `/api/drive/proxy-download?url=${encodeURIComponent(url)}`
            : `/api/proxy-download?url=${encodeURIComponent(url)}`;

        console.log(
          `Intento ${attempt} (${
            isMobile ? "móvil" : "desktop"
          }): Descargando con ${proxyUrl}`
        );
        console.log(`URL original: ${url}`);

        // Añadir timestamp para evitar caché
        const fetchUrl = `${proxyUrl}&t=${Date.now()}`;

        // Descargar con fetch utilizando timeout apropiado para el dispositivo
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log(
            `Timeout alcanzado después de ${
              mobileConfig.timeout / 1000
            } segundos en intento ${attempt} (${
              isMobile ? "móvil" : "desktop"
            })`
          );
        }, mobileConfig.timeout);

        const response = await fetch(fetchUrl, {
          signal: controller.signal,
          headers: getHeaders(),
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

        // Para archivos grandes, mostrar progreso con ReadableStream (optimizado para móviles)
        if (totalSize > mobileConfig.chunkThreshold) {
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

              // Actualizar progreso con información específica del dispositivo
              if (totalSize > 0) {
                const percentComplete = Math.round(
                  (receivedLength / totalSize) * 100
                );
                statusElement.innerHTML = `
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 8px; height: 8px; background: #000; border-radius: 50%; animation: pulse 1s infinite;"></div>
                      <span>Descargando... ${percentComplete}%${
                  isMobile ? " [móvil]" : ""
                }${isSlowConnection ? " [conexión lenta]" : ""}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.1); height: 4px; border-radius: 2px; overflow: hidden;">
                      <div style="background: #000; height: 100%; width: ${percentComplete}%; transition: width 0.2s;"></div>
                    </div>
                  </div>
                `;
              } else {
                const mbReceived = (receivedLength / (1024 * 1024)).toFixed(1);
                statusElement.innerHTML = `
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; background: #000; border-radius: 50%; animation: pulse 1s infinite;"></div>
                    <span>Descargando... ${mbReceived} MB${
                  isMobile ? " [móvil]" : ""
                }</span>
                  </div>
                `;
              }

              // En móviles, dar un pequeño respiro al procesador cada cierto número de chunks
              if (isMobile && chunks.length % 10 === 0) {
                await new Promise((resolve) => setTimeout(resolve, 10));
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
        console.error(
          `Error en intento ${attempt}/${retries} (${
            isMobile ? "móvil" : "desktop"
          }):`,
          error
        );

        // Esperar antes de reintentar (tiempo específico para móviles)
        if (attempt < retries) {
          const delay = mobileConfig.retryDelay * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    throw lastError || new Error("Todos los intentos de descarga fallaron");
  };

  try {
    // Método 1: Usar el proxy para todas las URLs
    try {
      console.log(
        `Intentando método de proxy para descargar (${
          isMobile ? "móvil" : "desktop"
        }):`,
        url
      );

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
      statusElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; background: #4CAF50; border-radius: 50%;"></div>
          <span>¡Descarga completada!${isMobile ? " [móvil]" : ""}</span>
        </div>
      `;
      statusElement.style.backgroundColor = "#4CAF50";
      statusElement.style.color = "white";
      statusElement.style.boxShadow = isMobile
        ? "0 4px 20px rgba(76, 175, 80, 0.3), 0 0 0 2px rgba(76, 175, 80, 0.5)"
        : "0 2px 8px rgba(76, 175, 80, 0.3)";

      // Asegurar visibilidad en iframe
      ensureIframeVisibility(statusElement);

      // Emitir evento de finalización exitosa
      const downloadCompleteEvent = new CustomEvent("download-complete", {
        detail: { url, filename, success: true, isMobile },
      });
      document.dispatchEvent(downloadCompleteEvent);

      setTimeout(() => document.body.removeChild(statusElement), 3000);

      return;
    } catch (proxyError) {
      console.error(
        `Error al usar el proxy (${isMobile ? "móvil" : "desktop"}):`,
        proxyError
      );

      // Actualizar mensaje para informar al usuario que se usará método directo
      statusElement.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="font-weight: bold;">Error en descarga con proxy</div>
          <div style="font-size: 0.9em;">Intentando descarga directa...${
            isMobile ? " [móvil]" : ""
          }</div>
        </div>
      `;
      statusElement.style.backgroundColor = "#FF9800"; // Color de advertencia naranja
      statusElement.style.color = "white";

      // Asegurar visibilidad en iframe
      ensureIframeVisibility(statusElement);
    }

    // Método 2: Intentar descarga directa sin proxy (optimizada para móviles)
    try {
      console.log(
        `Intentando descarga directa sin proxy para (${
          isMobile ? "móvil" : "desktop"
        }):`,
        url
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(
          `Timeout alcanzado después de ${
            mobileConfig.timeout / 1000
          } segundos en descarga directa (${isMobile ? "móvil" : "desktop"})`
        );
      }, mobileConfig.timeout);

      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
        headers: getHeaders(),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error en descarga directa: ${response.status}`);
      }

      // Obtener el tamaño total si está disponible
      const contentLength = response.headers.get("Content-Length");
      let totalSize = contentLength ? parseInt(contentLength) : 0;

      // Para archivos grandes, mostrar progreso (optimizado para móviles)
      if (totalSize > mobileConfig.chunkThreshold) {
        const reader = response.body?.getReader();
        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        if (reader) {
          statusElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 8px; height: 8px; background: #000; border-radius: 50%; animation: pulse 1s infinite;"></div>
              <span>Descarga directa... 0%${isMobile ? " [móvil]" : ""}</span>
            </div>
          `;

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
              statusElement.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; background: #000; border-radius: 50%; animation: pulse 1s infinite;"></div>
                    <span>Descarga directa... ${percentComplete}%${
                isMobile ? " [móvil]" : ""
              }</span>
                  </div>
                  <div style="background: rgba(0,0,0,0.1); height: 4px; border-radius: 2px; overflow: hidden;">
                    <div style="background: #000; height: 100%; width: ${percentComplete}%; transition: width 0.2s;"></div>
                  </div>
                </div>
              `;
            } else {
              const mbReceived = (receivedLength / (1024 * 1024)).toFixed(1);
              statusElement.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 8px; height: 8px; background: #000; border-radius: 50%; animation: pulse 1s infinite;"></div>
                  <span>Descarga directa... ${mbReceived} MB${
                isMobile ? " [móvil]" : ""
              }</span>
                </div>
              `;
            }

            // En móviles, dar un pequeño respiro al procesador cada cierto número de chunks
            if (isMobile && chunks.length % 10 === 0) {
              await new Promise((resolve) => setTimeout(resolve, 10));
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
          statusElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 8px; height: 8px; background: #4CAF50; border-radius: 50%;"></div>
              <span>¡Descarga directa completada!${
                isMobile ? " [móvil]" : ""
              }</span>
            </div>
          `;
          statusElement.style.backgroundColor = "#4CAF50";
          statusElement.style.color = "white";
          statusElement.style.boxShadow = isMobile
            ? "0 4px 20px rgba(76, 175, 80, 0.3), 0 0 0 2px rgba(76, 175, 80, 0.5)"
            : "0 2px 8px rgba(76, 175, 80, 0.3)";

          // Asegurar visibilidad en iframe
          ensureIframeVisibility(statusElement);

          // Emitir evento de finalización exitosa
          const downloadCompleteEvent = new CustomEvent("download-complete", {
            detail: { url, filename, success: true, isMobile },
          });
          document.dispatchEvent(downloadCompleteEvent);

          setTimeout(() => document.body.removeChild(statusElement), 3000);

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
      statusElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; background: #4CAF50; border-radius: 50%;"></div>
          <span>¡Descarga directa completada!${
            isMobile ? " [móvil]" : ""
          }</span>
        </div>
      `;
      statusElement.style.backgroundColor = "#4CAF50";
      statusElement.style.color = "white";
      statusElement.style.boxShadow = isMobile
        ? "0 4px 20px rgba(76, 175, 80, 0.3), 0 0 0 2px rgba(76, 175, 80, 0.5)"
        : "0 2px 8px rgba(76, 175, 80, 0.3)";

      // Asegurar visibilidad en iframe
      ensureIframeVisibility(statusElement);

      // Emitir evento de finalización exitosa
      const downloadCompleteEvent = new CustomEvent("download-complete", {
        detail: { url, filename, success: true, isMobile },
      });
      document.dispatchEvent(downloadCompleteEvent);

      setTimeout(() => document.body.removeChild(statusElement), 3000);

      return;
    } catch (directError) {
      console.error(
        `Error en descarga directa (${isMobile ? "móvil" : "desktop"}):`,
        directError
      );
      console.log("URL que falló en descarga directa:", url);

      // Preparar para el método 3 de fallback
      statusElement.style.backgroundColor = "#f44336"; // Rojo para error
      statusElement.style.color = "white";

      // Asegurar visibilidad en iframe
      ensureIframeVisibility(statusElement);
    }

    // Método 3: Fallback - Descargar directamente con un enlace (específico para móviles)
    console.log(
      `Usando método de fallback para (${isMobile ? "móvil" : "desktop"}):`,
      url
    );

    statusElement.innerHTML = `
      <div style="padding: ${isMobile ? "12px" : "10px"};">
        <div style="font-weight: bold; margin-bottom: 8px;">No se pudo descargar automáticamente</div>
        <div style="margin-bottom: 10px;">Intentando descarga directa simple${
          isMobile ? " [móvil]" : ""
        }</div>
        <div style="font-size: 0.9em; padding: 6px; background: rgba(255,255,255,0.3); border-radius: 4px; margin-bottom: 8px;">
          Guardar como: <strong>${filename}</strong>
        </div>
        ${
          isMobile
            ? '<div style="font-size: 0.85em; color: rgba(255,255,255,0.9);">Tip: Mantén presionado el enlace y selecciona "Descargar"</div>'
            : ""
        }
      </div>
    `;
    statusElement.style.backgroundColor = "#FF9800";
    statusElement.style.color = "white";

    // Asegurar visibilidad en iframe
    ensureIframeVisibility(statusElement);

    // Crear un enlace para descargar directamente
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // Para móviles, intentar abrir en nueva pestaña como backup
    if (isMobile) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Emitir evento de finalización (con advertencia)
    const downloadCompleteEvent = new CustomEvent("download-complete", {
      detail: { url, filename, success: false, fallback: true, isMobile },
    });
    document.dispatchEvent(downloadCompleteEvent);

    // Mantener el mensaje por más tiempo en móviles
    const displayTime = isMobile ? 10000 : 8000;
    setTimeout(() => {
      if (document.body.contains(statusElement)) {
        document.body.removeChild(statusElement);
      }
    }, displayTime);
  } catch (error) {
    console.error(
      `Error al descargar archivo (${isMobile ? "móvil" : "desktop"}):`,
      error
    );
    console.log("URL de descarga fallida:", url);
    console.log("Nombre de archivo:", filename);

    // Mostrar mensaje de error más detallado y específico para móviles
    statusElement.innerHTML = `
      <div style="background-color: #f44336; color: white; padding: ${
        isMobile ? "15px" : "10px"
      }; border-radius: 8px; max-width: ${
      isMobile ? "calc(100vw - 20px)" : "350px"
    };">
        <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <div style="width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
          Error al descargar el archivo${isMobile ? " [móvil]" : ""}
        </div>
        <div style="font-size: 0.9em; margin-bottom: 10px;">
          No se pudo descargar: ${filename}
        </div>
        ${
          isMobile
            ? `
          <div style="font-size: 0.85em; margin-bottom: 10px; background: rgba(255,255,255,0.2); padding: 6px; border-radius: 4px;">
            Problema común en móviles. Intenta conectarte a WiFi o usar un navegador diferente.
          </div>
        `
            : ""
        }
        <div style="display: flex; ${
          isMobile
            ? "flex-direction: column; gap: 8px;"
            : "justify-content: space-between; gap: 8px;"
        } margin-top: 12px;">
          <button id="retry-download" style="background: rgba(255,255,255,0.3); border: none; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9em; ${
            isMobile ? "width: 100%;" : "flex: 1;"
          }">
            🔄 Reintentar
          </button>
          <button id="report-download-error" style="background: rgba(255,255,255,0.3); border: none; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9em; ${
            isMobile ? "width: 100%;" : "flex: 1;"
          }">
            📧 Reportar problema
          </button>
        </div>
      </div>
    `;
    statusElement.style.backgroundColor = "transparent";

    // Asegurar visibilidad en iframe
    ensureIframeVisibility(statusElement);

    // Emitir evento de error
    const downloadErrorEvent = new CustomEvent("download-complete", {
      detail: { url, filename, success: false, error: true, isMobile },
    });
    document.dispatchEvent(downloadErrorEvent);

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
            detail: { filename, url, isMobile, isSlowConnection },
          });
          document.dispatchEvent(event);

          // Quitar la notificación después de abrir el modal
          document.body.removeChild(statusElement);
        });
      }
    }, 0);

    // Mantener el mensaje por más tiempo en móviles (45 segundos)
    const errorDisplayTime = isMobile ? 45000 : 30000;
    setTimeout(() => {
      if (document.body.contains(statusElement)) {
        document.body.removeChild(statusElement);
      }
    }, errorDisplayTime);
  }
};
