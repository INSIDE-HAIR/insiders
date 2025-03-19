/**
 * Utilidades para manejo de carpetas
 */

/**
 * Normaliza una ruta eliminando barras duplicadas y normalizando las barras
 * @param path Ruta a normalizar
 * @returns Ruta normalizada
 */
export function normalizePath(path: string): string {
  if (!path) return "";

  // Convertir todas las barras inversas a barras normales
  let normalizedPath = path.replace(/\\/g, "/");

  // Eliminar barras duplicadas
  normalizedPath = normalizedPath.replace(/\/+/g, "/");

  // Eliminar barra al final si existe
  if (normalizedPath.endsWith("/") && normalizedPath.length > 1) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  return normalizedPath;
}

/**
 * Obtiene el nombre de una carpeta a partir de una ruta
 * @param path Ruta completa
 * @returns Nombre de la carpeta
 */
export function getFolderName(path: string): string {
  if (!path) return "";

  const normalizedPath = normalizePath(path);
  const parts = normalizedPath.split("/");

  // Tomar el último segmento no vacío
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i]) {
      return parts[i];
    }
  }

  return "";
}

/**
 * Construye una ruta a partir de segmentos
 * @param segments Segmentos de la ruta
 * @returns Ruta completa normalizada
 */
export function buildPath(...segments: string[]): string {
  if (!segments.length) return "";

  const path = segments.join("/");
  return normalizePath(path);
}

/**
 * Obtiene la ruta padre de una ruta dada
 * @param path Ruta completa
 * @returns Ruta del directorio padre
 */
export function getParentPath(path: string): string {
  if (!path) return "";

  const normalizedPath = normalizePath(path);

  // Si es la raíz, no tiene padre
  if (normalizedPath === "/" || normalizedPath === "") {
    return "";
  }

  const lastSlashIndex = normalizedPath.lastIndexOf("/");

  // Si no hay barras, no tiene padre
  if (lastSlashIndex <= 0) {
    return "/";
  }

  return normalizedPath.substring(0, lastSlashIndex);
}

/**
 * Comprueba si una ruta es descendiente de otra
 * @param parentPath Ruta padre
 * @param childPath Ruta hijo
 * @returns true si childPath es descendiente de parentPath
 */
export function isDescendant(parentPath: string, childPath: string): boolean {
  if (!parentPath || !childPath) return false;

  const normalizedParent = normalizePath(parentPath);
  const normalizedChild = normalizePath(childPath);

  // Si son iguales, no es descendiente
  if (normalizedParent === normalizedChild) {
    return false;
  }

  // Si el padre es la raíz, todo es descendiente
  if (normalizedParent === "/") {
    return true;
  }

  // Comprobar si el hijo comienza con el padre y tiene un / después
  return normalizedChild.startsWith(normalizedParent + "/");
}
