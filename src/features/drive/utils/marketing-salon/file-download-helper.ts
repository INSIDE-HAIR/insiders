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

  try {
    // Método 1: Proxy del archivo - Solo intentar para URLs de Google Drive
    if (url.includes("drive.google.com") || url.includes("googleapis.com")) {
      try {
        console.log("Intentando método de proxy para descargar:", url);

        // Crear URL para el proxy (actualizada para App Router)
        const proxyUrl = `/api/drive/proxy-download?url=${encodeURIComponent(url)}`;

        // Intentar descargar a través del proxy
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(`Error en proxy: ${response.status}`);
        }

        const blob = await response.blob();
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
