/**
 * Utilidades para manejo de archivos
 */

/**
 * Obtiene la extensión de un archivo a partir de su nombre
 * @param filename Nombre del archivo
 * @returns Extensión del archivo (sin el punto)
 */
export function getFileExtension(filename: string): string {
  if (!filename) return "";

  const parts = filename.split(".");

  // Si no tiene extensión o el nombre comienza con punto (archivo oculto)
  if (parts.length <= 1) return "";

  return (parts[parts.length - 1] || '').toLowerCase();
}

/**
 * Verifica si el tipo MIME corresponde a una imagen
 * @param mimeType Tipo MIME a verificar
 * @returns true si es una imagen, false en caso contrario
 */
export function isImageMimeType(mimeType: string): boolean {
  if (!mimeType) return false;

  return mimeType.startsWith("image/");
}

/**
 * Verifica si el tipo MIME corresponde a un documento de Google Workspace
 * @param mimeType Tipo MIME a verificar
 * @returns true si es un documento de Google Workspace, false en caso contrario
 */
export function isGoogleWorkspaceMimeType(mimeType: string): boolean {
  if (!mimeType) return false;

  return mimeType.includes("google-apps");
}

/**
 * Obtiene el nombre base de un archivo (sin extensión)
 * @param filename Nombre del archivo
 * @returns Nombre base sin extensión
 */
export function getBaseName(filename: string): string {
  if (!filename) return "";

  const lastDotIndex = filename.lastIndexOf(".");

  // Si no tiene extensión o el nombre comienza con punto (archivo oculto)
  if (lastDotIndex <= 0) return filename;

  return filename.substring(0, lastDotIndex);
}

/**
 * Genera un nombre de archivo único agregando un contador
 * @param baseName Nombre base del archivo
 * @param extension Extensión del archivo
 * @param counter Contador a agregar (opcional)
 * @returns Nombre único con contador
 */
export function generateUniqueFilename(
  baseName: string,
  extension: string,
  counter: number = 1
): string {
  return `${baseName}${counter > 1 ? ` (${counter})` : ""}.${extension}`;
}
