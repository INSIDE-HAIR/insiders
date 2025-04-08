import type { HierarchyItem } from "@/src/features/drive/types/index";

/**
 * Extrae una propiedad específica del campo description
 *
 * @param {HierarchyItem} item - El elemento de contenido
 * @param {string} propertyName - El nombre de la propiedad a extraer
 * @returns {string|null} El valor de la propiedad o null si no existe
 */
export function extractPropertyFromDescription(
  item: HierarchyItem,
  propertyName: string
): string | null {
  if (!item.description) return null;

  try {
    // Método 1: Intentar parsear como JSON completo
    try {
      const jsonObj = JSON.parse(item.description);
      if (jsonObj && jsonObj[propertyName]) {
        return jsonObj[propertyName];
      }
    } catch (e) {
      // Si falla, continuamos con otros métodos
    }

    // Método 2: Buscar patrones específicos con regex
    // Buscar patrones como "propertyName":"value" o 'propertyName':'value'
    const regex = new RegExp(
      `["']${propertyName}["']\\s*:\\s*["']([^"']*)["']`,
      "i"
    );
    const match = item.description.match(regex);

    if (match && match[1]) {
      return match[1];
    }

    // Método 3: Intentar parsear como fragmento de JSON
    const wrappedJson = `{${item.description.replace(/^"|"$/g, "")}}`;
    try {
      const parsedObj = JSON.parse(wrappedJson);
      if (parsedObj && parsedObj[propertyName]) {
        return parsedObj[propertyName];
      }
    } catch (e) {
      // Si falla, continuamos con otros métodos
    }

    return null;
  } catch (error) {
    console.error(
      `Error parsing description for property ${propertyName}:`,
      error
    );
    return null;
  }
}

/**
 * Extrae el texto a copiar desde el campo description
 *
 * @param {HierarchyItem} item - El elemento de contenido
 * @returns {string|null} El texto a copiar o null si no existe
 */
export function extractCopyText(item: HierarchyItem): string | null {
  return extractPropertyFromDescription(item, "copy");
}

/**
 * Extrae la URL del formulario desde el campo description
 *
 * @param {HierarchyItem} item - El elemento de contenido
 * @returns {string|null} La URL del formulario o null si no existe
 */
export function extractFormUrl(item: HierarchyItem): string | null {
  return extractPropertyFromDescription(item, "formUrl");
}
